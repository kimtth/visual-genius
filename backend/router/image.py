import os
import random
import uuid

from typing import Any, List
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Request,
    Response,
    Security,
    UploadFile,
)
from sqlalchemy.orm import Session
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

from db_blob import get_blob_service_client
from module import aoai_call, bing_img_search, cog_embed_gen, text_to_speech
from router.util import (
    add_sas_token,
    blob_exist_check_delete_image,
    check_dalle_img_path,
    check_image_path_exist,
    delete_acs_document,
    gen_acs_document,
    generate_blob_container_sas,
    insert_acs_document,
    upload_image,
)
from module.common.models import (
    Emoji,
    ImageDB,
    ImageModel,
    ImageSchema
)
from module.auth.auth_base import AuthBase
from db_blob import get_db

security = HTTPBearer()
auth_handler = AuthBase()
router = APIRouter()

blob_service_client = get_blob_service_client()
container_name = os.getenv("BLOB_CONTAINER_NAME")
emoji_container_name = os.getenv("BLOB_EMOJI_CONTAINER_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
search_key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")
speech_subscription_key = os.getenv("SPEECH_SUBSCRIPTION_KEY")
speech_region = os.getenv("SPEECH_REGION")


@router.get("/images")
def get_images(
    request: Request,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        category_id = params["categoryId"] if "categoryId" in params else ""

        if category_id:
            if category_id == "file_upload":
                items = (
                    session.query(ImageModel).filter_by(categoryId=category_id).all()
                )
            else:
                items = (
                    session.query(ImageModel)
                    .filter_by(deleteFlag="0", categoryId=category_id)
                    .all()
                )
        else:
            items = session.query(ImageModel).filter_by(deleteFlag="0").all()

        items_list = [ImageDB.model_validate(item) for item in items]
        update_items_list = add_sas_token(items_list)

        return update_items_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get images")


@router.post("/images")
async def create_image(
    images: List[ImageSchema],
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        items = []
        acs_items = list()
        for image in images:
            if not check_image_path_exist(image.categoryId, image.imgPath, session):
                new_image = ImageModel(**image.model_dump())
                new_image.sid = str(uuid.uuid4())
                session.add(new_image)
                items.append(new_image)

            acs_doc_item = await gen_acs_document(new_image)
            acs_items.append(acs_doc_item)

        session.commit()

        # Run azure cognitive search for updates
        if acs_items:
            insert_acs_document(acs_items)

        items_list = [ImageDB.model_validate(item) for item in items]
        return items_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to create images")


@router.post("/image")
async def create_image(
    image: ImageSchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        new_item = ImageModel(**image.model_dump())
        session.add(new_item)
        session.commit()

        # Update for Azure Cognitive Search Index
        acs_doc_item = await gen_acs_document(new_item)
        insert_acs_document([acs_doc_item])

        return ImageDB.model_validate(new_item)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to create an image")


@router.get("/images/{categoryId}")
def get_image(
    categoryId: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        if not categoryId:
            return []
        items = (
            session.query(ImageModel)
            .filter_by(categoryId=categoryId, deleteFlag=0)
            .all()
        )
        if not items:
            raise HTTPException(status_code=404, detail="Image not found")

        sas_token = generate_blob_container_sas(container_name)

        image_list = []
        for item in items:
            # A DALLE-e created image exists in Azure storage account temporarily.
            if check_dalle_img_path(item.imgPath):
                item.imgPath = item.imgPath
            else:
                item.imgPath = f"{item.imgPath}?{sas_token}"
            image_dict = ImageDB.model_validate(item)
            image_list.append(image_dict)

        return image_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get an image")


@router.put("/images/{sid}")
async def update_image(
    sid: str,
    image: ImageSchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(ImageModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Image not found")

        for k, value in image.model_dump().items():
            setattr(item, k, value)

        # Upload the image to blob storage
        db_img_path = item.imgPath
        req_img_path = image.imgPath

        acs_items = list()
        # If image url was changed, delete the old image and upload the new image
        if db_img_path != req_img_path:
            container_client = blob_service_client.get_container_client(container_name)
            if db_img_path:
                await blob_exist_check_delete_image(db_img_path)
            if req_img_path:
                item.imgPath, image_data = await upload_image(
                    container_client, req_img_path
                )
                if image_data is None:
                    # When the image upload fails, revert to the original image URL.
                    item.imgPath = db_img_path
                    raise HTTPException(500, "Failed to update an image")

                acs_doc_item = await gen_acs_document(item)
                # Run azure cognitive search for updates
                acs_items.append(acs_doc_item)
                insert_acs_document(acs_items)

        session.commit()
        session.refresh(item)

        return ImageDB.model_validate(item)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to update an image")


@router.delete("/images/{sid}")
async def delete_image_all(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(ImageModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        session.delete(item)
        session.commit()
        return JSONResponse(content={"message": "Image deleted successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete an image")


@router.get("/gen_img/{query}")
async def img_gen_handler(
    query: str, credentials: HTTPAuthorizationCredentials = Security(security)
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        image_url = await aoai_call.img_gen(query)
        return image_url
    except Exception as e:
        raise HTTPException(status_code=204, detail="No image found")


@router.get("/bing_img/{search_query}")
async def img_gen_handler(
    search_query: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        title = params["title"] if "title" in params else ""
        title = "" if title == "undefined" else title
        # Add category title for searching more better output.
        search_query = search_query + " in " + title
        img_urls = await bing_img_search.fetch_image_from_bing(search_query, 15)
        random_idx = random.randint(0, 14)

        if len(img_urls) == 0:
            raise HTTPException(status_code=204, detail="No image found")

        img_url = img_urls[random_idx]
        return img_url
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get images")


@router.get("/gen_img_list/{query}")
async def img_gen_handler(
    query: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        mode = params["mode"] if "mode" in params else ""
        persona = params["persona"] if "persona" in params else ""

        if mode == "step":
            msg = await aoai_call.img_step_gen(query, persona)
        elif mode == "manual":
            msg = ",".join([x.strip() for x in query.split(",")])
        else:
            msg = await aoai_call.img_list_gen(query, persona)

        print(msg)

        img_urls: list[str | Any] = []
        substrings = []  # TODO: Add keywords to filter out the prompt.

        category_id = str(uuid.uuid4())
        if msg and not any(substring in msg.lower() for substring in substrings):
            img_queries = msg.split(",")

            # Bing Search Image
            for search_query in img_queries[:-1]:
                img_url = await bing_img_search.fetch_image_from_bing(search_query, 1)
                img_id = str(uuid.uuid4())
                img = ImageDB(
                    sid=img_id,
                    categoryId=category_id,
                    title=search_query,
                    imgPath=img_url,
                )

                img_urls.append(img)

            # Generative Image
            img_query = img_queries[-1]
            img_query_desc = await aoai_call.img_gen_desc(img_query)
            img_id = str(uuid.uuid4())
            try:
                img_url = await aoai_call.img_gen(img_query_desc)
                img = ImageDB(
                    sid=img_id, categoryId=category_id, title=img_query, imgPath=img_url
                )
                img_urls.append(img)
            except Exception as e:
                img_url = await bing_img_search.fetch_image_from_bing(img_query)
                img = ImageDB(
                    sid=img_id, categoryId=category_id, title=img_query, imgPath=img_url
                )
                img_urls.append(img)

        items_list = [ImageDB.model_validate(item) for item in img_urls]
        return items_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get images")


@router.get("/emojies")
async def emoji_handler(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            emoji_container_name
        )

        emoji_urls: List[str] = []
        # List blobs in the container
        async for blob in container_client.list_blobs():
            blob_client = container_client.get_blob_client(blob)
            emoji_urls.append(blob_client.url)

        new_emoji_list = [
            (emoji_url.split("/")[-1].split(".")[0], emoji_url)
            for emoji_url in emoji_urls
        ]
        sas_token = generate_blob_container_sas(emoji_container_name)
        emoji_list = [
            Emoji(
                sid=key.lower().replace("%20", "-"),
                title=key.replace("%20", " "),
                imgPath=f"{emoji_url}?{sas_token}",
            )
            for key, emoji_url in new_emoji_list
        ]

        return emoji_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to find images")


@router.get("/search/{query}")
async def search_handler(
    query: str,
    request: Request,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        k_num = int(params["count"]) if "count" in params else 3

        # Initialize the SearchClient
        credential = AzureKeyCredential(search_key)
        search_client = SearchClient(
            endpoint=service_endpoint, index_name=index_name, credential=credential
        )
        vector = VectorizedQuery(
            vector=cog_embed_gen.generate_embeddings(
                query, cogSvcsEndpoint, cogSvcsApiKey
            ),
            k_nearest_neighbors=k_num,
            fields="imageVector",
        )

        # Perform vector search
        results = search_client.search(
            search_text=None,
            vector_queries=[vector],
            select=["sid", "title", "imgPath"],
        )

        # Return the search results
        # debug = [rtn for rtn in results]
        img_ids = [rtn["imgPath"] for rtn in results]

        # Filter if deleteFlag (Soft delete) is 1. 1 equals True.
        # Fix to include when sid is null. The image uploaded to index by Indexer will have a null sid.
        items = (
            session.query(ImageModel)
            .filter(
                (
                    ImageModel.imgPath.in_(img_ids)
                ),
                ImageModel.deleteFlag != 1,
            )
            .all()
        )

        items_list = [ImageDB.model_validate(item) for item in items]
        update_items_list = add_sas_token(items_list)
        return update_items_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to find images")


@router.post("/file_upload")
async def file_upload(
    files: List[UploadFile],
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(container_name)
        acs_items = list()
        category_id = "file_upload"
        primary_endpoint = (
            f"https://{blob_service_client.account_name}.blob.core.windows.net"
        )

        for file in files:
            blob_url = f"{primary_endpoint}/{container_name}/{file.filename}"
            if not check_image_path_exist(category_id, blob_url, session):
                try:
                    contents = await file.read()
                    blob_client = container_client.get_blob_client(file.filename)
                    await blob_client.upload_blob(contents, overwrite=True)

                    filename_without_extension = os.path.splitext(file.filename)[0]
                    new_item = ImageModel(
                        sid=str(uuid.uuid4()),
                        categoryId=category_id,
                        imgPath=blob_client.url,
                        title=filename_without_extension,
                    )
                    session.add(new_item)
                    session.commit()

                    acs_doc_item = await gen_acs_document(new_item)
                    acs_items.append(acs_doc_item)
                except Exception as e:
                    print(f"File upload failed: {e}: {file.filename}")
                    continue

        if acs_items:
            insert_acs_document(acs_items)

        return JSONResponse(
            content={"message": "Files uploaded successfully except existing files"}
        )
    except Exception as e:
        print(e)
        raise HTTPException(401, "Something went wrong..")


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@router.put("/images/{sid}/delete")
async def delete_image(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(ImageModel, sid)
        if item:
            item.deleteFlag = 1
            session.commit()
            session.refresh(item)

            acs_item = []
            acs_item.append({"sid": item.sid})
            delete_acs_document(acs_item)
        return JSONResponse(content={"message": "Image deleted successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete an image")


@router.post("/synthesize_speech")
async def gen_synthesize_speech(
    text: str = Body(..., embed=True),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        audio_data = await text_to_speech.synthesize_speech(
            text, speech_subscription_key, speech_region
        )
        return Response(content=audio_data, media_type="audio/mp3")
    except RuntimeError as e:
        raise JSONResponse(content={"error": str(e)})
    except Exception as e:
        raise HTTPException(500, "Failed to synthesize speech")
