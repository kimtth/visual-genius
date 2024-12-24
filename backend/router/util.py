import base64
import os
from fastapi.security import HTTPAuthorizationCredentials
import httpx
import re

from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import HTTPException
from urllib.parse import urlparse, urlunparse
from io import BytesIO
from PIL import Image
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.storage.blob import ContainerSasPermissions
from azure.storage.blob.aio import ContainerClient
from azure.storage.blob import generate_container_sas
from sqlalchemy.orm import Session
from copy import deepcopy

from db_blob import get_blob_service_client
from module import cog_embed_gen
from module.auth.auth_base import AuthBase
from module.common.const import HTTP_IDENTIFIER
from module.common.models import ImageDB, ImageModel


blob_service_client = get_blob_service_client()
blob_account_name = os.getenv("BLOB_ACCOUNT_NAME")
blob_account_key = os.getenv("BLOB_ACCOUNT_KEY")
container_name = os.getenv("BLOB_CONTAINER_NAME")
emoji_container_name = os.getenv("BLOB_EMOJI_CONTAINER_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")
speech_subscription_key = os.getenv("SPEECH_SUBSCRIPTION_KEY")
speech_region = os.getenv("SPEECH_REGION")


async def process_dalle_image(
    container_client: ContainerClient, new_image: ImageModel, original_img_path: str
):
    new_image.imgPath, image_data = await upload_image(
        container_client, new_image.imgPath
    )

    if image_data is None:
        new_image.imgPath = original_img_path
    
    return new_image


def check_dalle_img_path(img_path: str) -> bool:
    pattern = r"\?se=[^&]+&sig=[^&]+"
    return re.search(pattern, img_path)


def check_uploaded_img_path(img_path: str, container_name: str) -> bool:
    pattern = r"\?se=[^&]+&sig=[^&]+"
    matches = re.findall(pattern, img_path)
    if container_name in img_path and len(matches) == 0:
        return True
    return False


def append_sas_token(new_image: ImageModel) -> ImageModel:
    cp_new_image: ImageModel = deepcopy(new_image)
    cp_new_image.imgPath = f"{cp_new_image.imgPath}?{generate_blob_container_sas(container_name)}"
    return cp_new_image


def remove_query_params(url: str):
    # remove_query_params
    parsed_url = urlparse(url)
    cleaned_url = urlunparse(parsed_url._replace(query=""))
    return cleaned_url


async def validate_image_url(img_path: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(img_path)
    except Exception as e:
        print(f"Request failed: {e}")

    if response.status_code != 200 or response.content is None:
        raise "Failed to retrieve image"

    try:
        img = Image.open(BytesIO(response.content))
        img.verify()
        # Verify whether the Image link is broken.
        # If this method finds any problems, it raises suitable exceptions.
    except Exception as e:
        print(f"Image verification failed: {e}")

    # Get the file name from the response headers
    content_disposition = response.headers.get("Content-Disposition")
    if content_disposition:
        file_name = re.findall("filename=(.+)", content_disposition)[0]
    else:
        file_name = img_path.split("/")[-1]
        file_name = remove_query_params(file_name)

    return img, response.content, file_name


# Speed up the upload process by using async and concurrent upload
async def upload_image(container_client: ContainerClient, img_path: str, rename: bool = False):
    try:
        img, content, file_name = await validate_image_url(img_path)

        if rename:
            file_extension = file_name.split(".")[-1]
            file_name = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}.{file_extension}"

        blob_client = container_client.get_blob_client(file_name)

        # Reopen the content for unexpected error, 'NoneType' object has no attribute 'seek'.
        img_byte_io = BytesIO(content)
        with Image.open(img_byte_io) as save_img:
            output_buffer = BytesIO()
            save_img.save(output_buffer, img.format)
            output_buffer.seek(0)

        async with blob_client:
            await blob_client.upload_blob(
                output_buffer, overwrite=True, max_concurrency=4
            )

        return blob_client.url, img_byte_io
    except Exception as e:
        print(e)
        return None, None


# Speed up the download process by using async
async def download_image(container_client: ContainerClient, img_path: str):
    try:
        file_name = img_path.split("/")[-1]
        # if image path is web url, download the image, then convert it to bytes
        rtn = None
        if HTTP_IDENTIFIER in img_path:
            async with httpx.AsyncClient() as client:
                rtn = await client.get(img_path)
                return rtn.content
        else:
            blob_client = container_client.get_blob_client(file_name)
            async with blob_client:
                stream = await blob_client.download_blob(max_concurrency=4)
                rtn = await stream.readall()
                return rtn
            
        if rtn is None:
            raise Exception("Failed to download image")
    except Exception as e:
        # print(f"The blob {img_path} was not found. {e}")
        return None


def check_image_path_exist(category_id: str, img_path: str, session: Session) -> bool:
    """
    Check if the same imgPath exists based on the categoryId
    """
    query = session.query(ImageModel).filter(
        ImageModel.categoryId == category_id,
        ImageModel.imgPath == img_path,
        ImageModel.deleteFlag == 0,
    )
    return session.query(query.exists()).scalar()


async def blob_exist_check_delete_image(db_img_path: str):
    try:
        db_file_name = db_img_path.split("/")[-1]

        container_client = blob_service_client.get_container_client(container_name)
        db_blob_client = container_client.get_blob_client(db_file_name)

        async with db_blob_client:
            if await db_blob_client.exists():
                # Delete the blob
                await db_blob_client.delete_blob()
    except Exception as e:
        print(f"An error occurred: {e}")


def add_sas_token(items_list):
    sas_token = generate_blob_container_sas(container_name)
    updated_items_list = []
    for item in items_list:
        item_dict = item.dict()
        item_dict["imgPath"] = f"{item_dict['imgPath']}?{sas_token}"
        updated_item = ImageDB(**item_dict)
        updated_items_list.append(updated_item)
    return updated_items_list


def generate_blob_container_sas(container_name: str) -> str:
    sas_token = generate_container_sas(
        account_name=blob_account_name,
        container_name=container_name,
        account_key=blob_account_key,
        permission=ContainerSasPermissions(
            read=True, write=True, delete=True, list=True
        ),
        expiry=datetime.now(timezone.utc) + timedelta(days=1),
        start=datetime.now(timezone.utc) - timedelta(minutes=1),
        protocol="https"
    )
    return sas_token


async def gen_acs_document(new_item: ImageModel, sas_token: str=None):
    image_url = new_item.imgPath if sas_token is None else f"{new_item.imgPath}?{sas_token}"
    embed = await cog_embed_gen.generate_image_embeddings(
        image_url, cogSvcsEndpoint, cogSvcsApiKey
    )
    acs_doc_item = {
        "id": base64.b64encode(new_item.sid.encode()).decode(),
        "sid": new_item.sid,
        "imgPath": new_item.imgPath,
        "title": new_item.title,
        "imageVector": embed,
    }
    return acs_doc_item


def insert_acs_document(acs_items: List[dict]):
    # Insert documents to Azure Cognitive Search index
    try:
        credential = AzureKeyCredential(key)
        search_client = SearchClient(
            endpoint=service_endpoint, index_name=index_name, credential=credential
        )
        result = search_client.merge_or_upload_documents(documents=acs_items)

        if result:
            print("Insert documents to Azure Search Index:", result[0].succeeded)
    except Exception as e:
        print("Azure Cognitive Search index: ", e)
        raise HTTPException(
            500, "Failed to upload files to Azure Cognitive Search index"
        )


def delete_acs_document(acs_items: List[dict]):
    try:
        credential = AzureKeyCredential(key)
        search_client = SearchClient(
            endpoint=service_endpoint, index_name=index_name, credential=credential
        )

        keys_to_delete = []
        for acs_item in acs_items:
            try:
                # the sid field was created with not searchable. temporary solution.
                results = search_client.search(select="id, sid", search_text="*")
                for item in results:
                    item = item
                    if item["sid"] == acs_item["sid"]:
                        keys_to_delete.append(item["id"])
            except Exception as e:
                print(e)
                continue

        if keys_to_delete:
            documents_to_delete = [
                {"@search.action": "delete", "id": key} for key in keys_to_delete
            ]
            search_client.delete_documents(documents=documents_to_delete)
            print("Delete document succeeded")
    except Exception as e:
        print(e)
        raise Exception("Failed to delete files to Azure Cognitive Search index")
    
    
def verify_token(credentials: HTTPAuthorizationCredentials, auth_handler: AuthBase) -> str:    
    token = credentials.credentials
    try:
        if not auth_handler.decode_token(token):
            raise HTTPException(status_code=403, detail="Not authorized")
        else:
            user_id = auth_handler.decode_token(token)
            return user_id
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid authentication token") from e
