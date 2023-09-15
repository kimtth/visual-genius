import asyncio
import base64
import os
import random
import uuid
import io
import zipfile
from typing import List, Any, Optional
from urllib.parse import urlparse, urlunparse
import httpx

import uvicorn
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import Vector
# from azure.storage.blob import BlobServiceClient
from azure.storage.blob.aio import BlobServiceClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

from module import cog_embed_gen, aoai_call, bing_img_search
from module.acs_index_manage import run_indexer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO Change Sqlite to PostgreSQL
# engine = create_engine("sqlite:///./db.db",
#                       connect_args={"check_same_thread": False})
# check_same_thread is needed only for SQLite. It's not needed for other databases.

postgre_host = os.getenv("POSTGRE_HOST")
postgre_user = os.getenv("POSTGRE_USER")
postgre_port = os.getenv("POSTGRE_PORT")
postgre_db = os.getenv("POSTGRE_DATABASE")
postgre_pwd = os.getenv("POSTGRE_PASSWORD")

engine = create_engine(
    f'postgresql://{postgre_user}:{postgre_pwd}@{postgre_host}:{postgre_port}/{postgre_db}')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

load_dotenv()
# Set the connection string and container name
connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
emoji_container_name = os.getenv("BLOB_EMOJI_CONTAINER_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")

# Create the BlobServiceClient object which will be used to create a container client
blob_service_client = BlobServiceClient.from_connection_string(
    connection_string)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SQLAlchemy model
class CategoryModel(Base):
    __tablename__ = "category"
    sid = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    difficulty = Column(String)
    imgNum = Column(Integer)
    deleteFlag = Column(Integer, default=0)

    # The "category" in backref="parent" and ForeignKey('category.sid') should be the same.
    images = relationship("ImageModel", backref="category")


# Pydantic model - request body
class CategorySchema(BaseModel):
    sid: str
    title: str
    category: str
    difficulty: str
    imgNum: int
    deleteFlag: Optional[int] = 0

    class Config:
        from_attributes = True


# Pydantic model - response body
class CategoryDB(CategorySchema):
    sid: str
    contentUrl: Optional[List[str]] = []

    class Config:
        from_attributes = True


# SQLAlchemy model
class ImageModel(Base):
    __tablename__ = "image"
    sid = Column(String, primary_key=True)
    categoryId = Column(String, ForeignKey('category.sid'))
    title = Column(String)
    imgPath = Column(String)
    deleteFlag = Column(Integer, default=0)


# Pydantic model - request body
class ImageSchema(BaseModel):
    sid: str
    categoryId: str
    title: str
    imgPath: str
    deleteFlag: Optional[int] = 0

    class Config:
        from_attributes = True


# Pydantic model - response body
class ImageDB(ImageSchema):
    sid: str

    class Config:
        from_attributes = True


class Emoji(BaseModel):
    sid: str
    title: str
    imgPath: str

    class Config:
        from_attributes = True


@app.get('/categories')
def get_categories(session: Session = Depends(get_db)):
    try:
        items = session.query(CategoryModel).filter(
            CategoryModel.deleteFlag == 0).all()
        # First 3 images for each category
        for item in items:
            imgs = item.images[0:3]
            item.contentUrl = [img.imgPath for img in imgs]
        return [CategoryDB.model_validate(item) for item in items]
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get categories")


@app.post('/category')
async def create_category(category: CategorySchema, images: List[ImageSchema], session: Session = Depends(get_db)):
    try:
        new_category = CategoryModel(**category.model_dump())

        acs_items = list()
        # Create the associated images
        for image in images:
            new_image = ImageModel(**image.model_dump())

            # Upload the image to blob storage
            img_path = remove_query_params(new_image.imgPath)
            new_image.imgPath = await upload_image(img_path)

            session.add(new_image)
            acs_doc_item = gen_acs_document(new_image)
            acs_items.append(acs_doc_item)

        # The order in which you add objects to the session does not matter,
        # as long as all the necessary relationships between the objects are properly set up
        session.add(new_category)
        session.commit()

        # Run azure cognitive search for updates
        insert_acs_document(acs_items)

        return CategoryDB.model_validate(new_category)
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to create a category")


def remove_query_params(url: str):
    # remove_query_params
    parsed_url = urlparse(url)
    cleaned_url = urlunparse(parsed_url._replace(query=""))
    return cleaned_url


# Speed up the upload process by using async
async def upload_image(img_path: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(img_path)
        image_data = response.content
        # Less then 1kb will not be uploaded
        if len(image_data) > 1024:
            file_name = img_path.split("/")[-1]
            blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            container_client = blob_service_client.get_container_client(container_name)
            blob_client = container_client.get_blob_client(file_name)
            await blob_client.upload_blob(image_data, overwrite=True)
            await client.aclose()  # Close the client session
            return blob_client.url
        else:
            await client.aclose()  # Close the client session
            return "-"


@app.get('/category/{sid}')
def get_category(sid: str, session: Session = Depends(get_db)):
    try:
        item = session.query(CategoryModel).get(sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        return CategoryDB.model_validate(item)
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get an category")


@app.put('/category/{sid}')
def update_category(sid: str, category: CategorySchema, session: Session = Depends(get_db)):
    try:
        item = session.query(CategoryModel).get(sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")

        for k, value in category.model_dump().items():
            setattr(item, k, value)
        session.commit()
        session.refresh(item)
        return CategoryDB.model_validate(item)
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to update an category")


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/category/{sid}/delete")
def delete_category(sid: str, session: Session = Depends(get_db)):
    try:
        item = session.query(CategoryModel).get(sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        item.deleteFlag = 1

        # Update the deleteFlag for all images associated with the category
        acs_item = []
        for image in item.images:
            image.deleteFlag = 1
            acs_item.append({"sid": image.sid})

        if acs_item:
            delete_acs_document(acs_item)

        session.commit()
        session.refresh(item)
        return {"message": "Category deleted successfully"}
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to delete an category")


@app.get("/category/{sid}/download")
async def download_images(sid: str, session: Session = Depends(get_db)):
    # TODO: Very slow... Need to improve the performance.
    try:
        item = session.query(CategoryModel).get(sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        images = item.images
        if not images:
            raise HTTPException(status_code=404, detail="No images found for this category")
        
        in_memory_zip = io.BytesIO()
        with zipfile.ZipFile(in_memory_zip, mode="w") as zipf:
            tasks = []
            for img in images:
                img_path = getattr(img, 'imgPath')
                tasks.append(asyncio.ensure_future(download_image(img_path)))
            image_data_list = await asyncio.gather(*tasks)
            for img, image_data in zip(images, image_data_list):
                img_path = getattr(img, 'imgPath')
                zipf.writestr(img_path.split("/")[-1], image_data)
        in_memory_zip.seek(0)
        return StreamingResponse(in_memory_zip, media_type="application/zip",
                                 headers={"Content-Disposition": "attachment; filename=images.zip"})
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to download an image")


# Speed up the download process by using async
async def download_image(img_path: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(img_path)
        client.aclose()  # Close the client session
        return response.content


@app.get('/images')
def get_images(request: Request, session: Session = Depends(get_db)):
    try:
        params = request.query_params
        category_id = params['categoryId'] if 'categoryId' in params else ''

        if (category_id):
            if (category_id == 'file_upload'):
                items = session.query(ImageModel).filter(
                    ImageModel.categoryId == category_id).all()
            else:
                items = session.query(ImageModel).filter(
                    ImageModel.deleteFlag != 1, ImageModel.categoryId == category_id).all()
        else:
            items = session.query(ImageModel).filter(
                ImageModel.deleteFlag != 1).all()

        items_list = [ImageDB.model_validate(item) for item in items]
        # for item in items_list:
        #     # Get the primary blob service endpoint for your storage account
        #     primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
        #     # Construct the URL for the blob
        #     blob_url = f"{primary_endpoint}/{container_name}/{item.imgPath}"
        #     # Set the imgPath attribute to the blob URL
        #     item.imgPath = blob_url
        return items_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get images")


@app.post('/images')
def create_image(images: List[ImageSchema], session: Session = Depends(get_db)):
    try:
        items = []
        acs_items = list()
        for image in images:
            if not check_image_path(image.categoryId, image.imgPath, session):
                new_image = ImageModel(**image.model_dump())
                new_image.sid = str(uuid.uuid4())
                session.add(new_image)
                items.append(new_image)

            acs_doc_item = gen_acs_document(new_image)
            acs_items.append(acs_doc_item)

        session.commit()

        # Run azure cognitive search for updates
        if acs_items:
            insert_acs_document(acs_items)

        items_list = [ImageDB.model_validate(item) for item in items]
        return items_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to create images")


def check_image_path(category_id: str, img_path: str, session: Session) -> bool:
    """
    Check if the same imgPath exists based on the categoryId
    """
    query = session.query(ImageModel).filter(
        ImageModel.categoryId == category_id, ImageModel.categoryId != 'file_upload', ImageModel.imgPath == img_path, ImageModel.deleteFlag != 1)
    return session.query(query.exists()).scalar()


@app.post('/image')
def create_image(image: ImageSchema, session: Session = Depends(get_db)):
    try:
        new_item = ImageModel(**image.model_dump())
        session.add(new_item)
        session.commit()

        # Update for Azure Cognitive Search Index
        acs_doc_item = gen_acs_document(new_item)
        insert_acs_document([acs_doc_item])

        return ImageDB.model_validate(new_item)
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to create an image")


@app.get('/images/{sid}')
def get_image(sid: str, session: Session = Depends(get_db)):
    try:
        if not sid:
            return []
        items = session.query(ImageModel).filter_by(
            categoryId=sid, deleteFlag=0).all()
        if not items:
            raise HTTPException(status_code=404, detail="Image not found")

        image_list = []
        for item in items:
            image_dict = ImageDB.model_validate(item)
            image_list.append(image_dict)

        return image_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get an image")


@app.put('/images/{sid}')
async def update_image(sid: str, image: ImageSchema, session: Session = Depends(get_db)):
    try:
        item = session.query(ImageModel).get(sid)
        if not item:
            # TODO: Back to HTTPException after done UI.
            return {"message": "Image not found"}
            # raise HTTPException(status_code=404, detail="Image not found")

        for k, value in image.model_dump().items():
            setattr(item, k, value)

        # Upload the image to blob storage
        img_path = item.imgPath
        item.imgPath = await upload_image(img_path)
        session.commit()
        session.refresh(item)

        acs_doc_item = gen_acs_document(item)
        # Run azure cognitive search for updates
        insert_acs_document([acs_doc_item])

        return ImageDB.model_validate(item)
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to update an image")


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/images/{sid}/delete")
async def delete_image(sid: str, session: Session = Depends(get_db)):
    try:
        item = session.query(ImageModel).get(sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        item.deleteFlag = 1
        session.commit()
        session.refresh(item)

        delete_acs_document([item.sid])
        return {"message": "Image deleted successfully"}
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to delete an image")


@app.get('/gen_img/{query}')
async def img_gen_handler(query: str):
    try:
        image_url = await aoai_call.img_gen(query)
        return image_url
    except Exception as e:
        raise HTTPException(status_code=204, detail="No image found")


@app.get('/bing_img/{search_query}')
async def img_gen_handler(search_query: str, request: Request):
    try:
        params = request.query_params
        title = params['title'] if 'title' in params else ''
        search_query = search_query + ' in ' + title # Add category title for searching more better output.
        img_urls = await bing_img_search.fetch_image_from_bing(search_query, 15)
        random_idx = random.randint(0, 14)

        if len(img_urls) == 0:
            raise HTTPException(status_code=204, detail="No image found")

        img_url = img_urls[random_idx]
        return img_url
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get images")


@app.get('/gen_img_list/{query}')
async def img_gen_handler(query: str, request: Request):
    try:
        params = request.query_params
        mode = params['mode'] if 'mode' in params else ''
        persona = params['persona'] if 'persona' in params else ''

        if mode == 'step':
            msg = await aoai_call.img_step_gen(query, persona)
        elif mode == 'manual':
            msg = ','.join([x.strip() for x in query.split(',')])
        else:
            msg = await aoai_call.img_list_gen(query, persona)

        print(msg)

        img_urls: list[str | Any] = []
        substrings = []  # TODO: Add more keywords to filter out the prompt.

        category_id = str(uuid.uuid4())
        if msg and not any(substring in msg.lower() for substring in substrings):
            img_queries = msg.split(',')

            # Bing Search Image
            for search_query in img_queries[:-1]:
                img_url = await bing_img_search.fetch_image_from_bing(search_query, 1)
                img_id = str(uuid.uuid4())
                img = ImageDB(sid=img_id, categoryId=category_id,
                              title=search_query, imgPath=img_url)

                img_urls.append(img)

            # Generative Image
            img_query = img_queries[-1]
            img_id = str(uuid.uuid4())
            try:
                img_url = await aoai_call.img_gen(img_query)
                img = ImageDB(sid=img_id, categoryId=category_id,
                              title=img_query, imgPath=img_url)
                img_urls.append(img)
            except Exception as e:
                img_url = await bing_img_search.fetch_image_from_bing(img_query)
                img = ImageDB(sid=img_id, categoryId=category_id,
                              title=img_query, imgPath=img_url)
                img_urls.append(img)

        items_list = [ImageDB.model_validate(item) for item in img_urls]
        return items_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to get images")


@app.get('/emojies')
async def emoji_handler():
    try:
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        container_client = blob_service_client.get_container_client(emoji_container_name)

        emoji_urls = []
        # List blobs in the container
        async for blob in container_client.list_blobs():
            blob_client = container_client.get_blob_client(blob)
            emoji_urls.append(blob_client.url)

        new_emoji_list = [(emoji_url.split('/')[-1].split('.')
                        [0], emoji_url) for emoji_url in emoji_urls]
        emoji_list = [Emoji(sid=key.lower().replace("%20", "-"), title=key.replace(
            "%20", " "), imgPath=emoji_url) for key, emoji_url in new_emoji_list]

        return emoji_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to find images")



@app.get('/search/{query}')
async def search_handler(query: str, request: Request, session: Session = Depends(get_db)):
    try:
        params = request.query_params
        k_num = int(params['count']) if 'count' in params else 3

        # Initialize the SearchClient
        credential = AzureKeyCredential(key)
        search_client = SearchClient(endpoint=service_endpoint,
                                     index_name=index_name,
                                     credential=credential)
        vector = Vector(value=cog_embed_gen.generate_embeddings(
            query, cogSvcsEndpoint, cogSvcsApiKey), k=k_num, fields="imageVector")

        # Perform vector search
        results = search_client.search(
            search_text=None,
            vectors=[vector],
            select=["sid", "title", "imgPath"]
        )

        # Return the search results
        img_ids = [rtn['sid'] for rtn in results]

        # Filter if deleteFlag (Soft delete) is 1. 1 equals True.
        items = session.query(ImageModel).filter(
            ImageModel.sid.in_(img_ids), ImageModel.deleteFlag != 1).all()
        items_list = [ImageDB.model_validate(item) for item in items]

        return items_list
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to find images")


@app.post('/file_upload')
async def file_upload(files: List[UploadFile], session: Session = Depends(get_db)):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        container_client = blob_service_client.get_container_client(container_name)
        acs_items = list()
        category_id = 'file_upload'
        primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"

        for file in files:
            blob_url = f"{primary_endpoint}/{container_name}/{file.filename}"
            if not check_image_path(category_id, blob_url, session):
                contents = await file.read()
                blob_client = container_client.get_blob_client(file.filename)
                await blob_client.upload_blob(contents, overwrite=True)

                filename_without_extension = os.path.splitext(file.filename)[0]
                new_item = ImageModel(sid=str(uuid.uuid4()), categoryId=category_id, imgPath=blob_client.url, title=filename_without_extension)
                session.add(new_item)
                session.commit()

                acs_doc_item = gen_acs_document(new_item)
                acs_items.append(acs_doc_item)

        if acs_items:
            insert_acs_document(acs_items)

        return "Files uploaded successfully"
    except Exception as e:
        print(e)
        raise HTTPException(401, "Something went wrong..")



def gen_acs_document(new_item: ImageModel):
    acs_doc_item = {
        "id": base64.b64encode(new_item.sid.encode()).decode(),
        "sid": new_item.sid,
        "imgPath": new_item.imgPath,
        "title": new_item.title,
        "imageVector": cog_embed_gen.generate_image_embeddings(new_item.imgPath, cogSvcsEndpoint, cogSvcsApiKey)
    }
    return acs_doc_item


def insert_acs_document(acs_items: List[dict]):
    # Insert documents to Azure Cognitive Search index
    try:
        credential = AzureKeyCredential(key)
        search_client = SearchClient(endpoint=service_endpoint,
                                     index_name=index_name,
                                     credential=credential)
        result = search_client.merge_or_upload_documents(documents=acs_items)

        if result:
            print(result[0].succeeded)
            return "Files uploaded successfully"
    except Exception as e:
        print('>>>>', e)
        return HTTPException(500, "Failed to upload files to Azure Cognitive Search index")


def delete_acs_document(acs_items: List[dict]):
    try:
        credential = AzureKeyCredential(key)
        search_client = SearchClient(endpoint=service_endpoint,
                                     index_name=index_name,
                                     credential=credential)

        for acs_item in acs_items:
            if search_client.get_document_count(documents=acs_item) > 0:
                result = search_client.delete_documents(documents=acs_item)

        print("Delete new document succeeded: {}".format(result))
    except Exception as e:
        print(e)
        return HTTPException(500, "Failed to delete files to Azure Cognitive Search index")


if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=5000)
