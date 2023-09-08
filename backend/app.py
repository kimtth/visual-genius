import asyncio
import os
import random
import uuid
import io
import zipfile
from typing import List, Any, Optional
import httpx

import uvicorn
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import Vector
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

from module import cog_embed_gen, aoai_call, bing_img_search

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("sqlite:///./db.db",
                       connect_args={"check_same_thread": False})
# check_same_thread is needed only for SQLite. It's not needed for other databases.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

load_dotenv()
# Set the connection string and container name
connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
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
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    difficulty = Column(String)
    imgNum = Column(Integer)
    contentUrl = Column(JSON)
    deleteFlag = Column(Integer, default=0)

    # The "category" in backref="parent" and ForeignKey('category.id') should be the same.
    images = relationship("ImageModel", backref="category")


# Pydantic model - request body
class CategorySchema(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    imgNum: int
    contentUrl: List[str]
    deleteFlag: Optional[int] = 0

    class Config:
        from_attributes = True


# Pydantic model - response body
class CategoryDB(CategorySchema):
    id: str

    class Config:
        from_attributes = True


# SQLAlchemy model
class ImageModel(Base):
    __tablename__ = "image"
    id = Column(String, primary_key=True)
    categoryId = Column(String, ForeignKey('category.id'))
    title = Column(String)
    imgPath = Column(String)
    deleteFlag = Column(Integer, default=0)


# Pydantic model - request body
class ImageSchema(BaseModel):
    id: str
    categoryId: str
    title: str
    imgPath: str
    deleteFlag: Optional[int] = 0

    class Config:
        from_attributes = True


# Pydantic model - response body
class ImageDB(ImageSchema):
    id: str

    class Config:
        from_attributes = True


class PromptGen(BaseModel):
    query: str
    completeMsg: str
    imgUrls: list

    class Config:
        validate_assignment = True


@app.get('/categories')
def get_categories(session: Session = Depends(get_db)):
    items = session.query(CategoryModel).filter(CategoryModel.deleteFlag != 1).all()
    return [CategoryDB.model_validate(item) for item in items]


@app.post('/category')
async def create_category(category: CategorySchema, images: List[ImageSchema], session: Session = Depends(get_db)):
    new_category = CategoryModel(**category.model_dump())

    # Create the associated images
    contentUrlImgs = []
    for idx, image in enumerate(images):
        new_image = ImageModel(**image.model_dump())
        
        # Upload the image to blob storage
        img_path = new_image.imgPath
        new_image.imgPath = await upload_image(img_path)

        session.add(new_image)

        if idx < 3:
            contentUrlImgs.append(new_image.imgPath)
    
    # First 3 images URLs from updated images list
    new_category.contentUrl = contentUrlImgs
    # The order in which you add objects to the session does not matter, 
    # as long as all the necessary relationships between the objects are properly set up 
    session.add(new_category)
        
    session.commit()
    return CategoryDB.model_validate(new_category)


# Speed up the upload process by using async
async def upload_image(img_path: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(img_path)
        image_data = response.content

        file_name = img_path.split("/")[-1]
        container_client = blob_service_client.get_container_client(container=container_name)
        blob_client = container_client.upload_blob(name=file_name, data=image_data, overwrite=True)
        return blob_client.url


@app.get('/category/{id}')
def get_category(id: str, session: Session = Depends(get_db)):
    item = session.query(CategoryModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryDB.model_validate(item)


@app.put('/category/{id}')
def update_category(id: str, category: CategorySchema, session: Session = Depends(get_db)):
    item = session.query(CategoryModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")

    for k, value in category.model_dump().items():
        setattr(item, k, value)
    session.commit()
    return CategoryDB.model_validate(item)


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/category/{id}/delete")
def delete_category(id: str, session: Session = Depends(get_db)):
    item = session.query(CategoryModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")
    item.deleteFlag = 1

    # Update the deleteFlag for all images associated with the category
    for image in item.images:
        image.deleteFlag = 1

    session.commit()
    return {"message": "Category deleted successfully"}


@app.get("/category/{id}/download")
async def download_images(id: str, session: Session = Depends(get_db)):
    item = session.query(CategoryModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")
    images = item.images
    if not images:
        raise HTTPException(
            status_code=404, detail="No images found for this category")
    in_memory_zip = io.BytesIO()
    with zipfile.ZipFile(in_memory_zip, mode="w") as zipf:
        tasks = []
        for img in images:
            img_path = getattr(img, 'imgPath')
            print(img_path)
            tasks.append(asyncio.ensure_future(download_image(img_path)))
        image_data_list = await asyncio.gather(*tasks)
        for img, image_data in zip(images, image_data_list):
            img_path = getattr(img, 'imgPath')
            zipf.writestr(img_path.split("/")[-1], image_data)
    in_memory_zip.seek(0)
    return StreamingResponse(in_memory_zip, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=images.zip"})

# Speed up the download process by using async


async def download_image(img_path: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(img_path)
        return response.content

# @app.delete('/category/{id}')
# def delete_category(id: str, session: Session = Depends(get_db)):
#     item = session.query(CategoryModel).get(id)
#     if not item:
#         raise HTTPException(status_code=404, detail="Category not found")
#     session.delete(item)
#     session.commit()
#     return {"message": "Category deleted successfully"}


@app.get('/images')
def get_images(session: Session = Depends(get_db)):
    items = session.query(ImageModel).filter(ImageModel.deleteFlag != 1).all()
    items_list = [ImageDB.model_validate(item) for item in items]
    for item in items_list:
        # Get the primary blob service endpoint for your storage account
        primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
        # Construct the URL for the blob
        blob_url = f"{primary_endpoint}/{container_name}/{item.imgPath}"
        # Set the imgPath attribute to the blob URL
        item.imgPath = blob_url

    return items_list


@app.post('/images')
def create_image(image: ImageSchema, session: Session = Depends(get_db)):
    new_item = ImageModel(**image.model_dump())
    session.add(new_item)
    session.commit()
    return ImageDB.model_validate(new_item)


@app.get('/images/{id}')
def get_image(id: str, session: Session = Depends(get_db)):
    if not id:
        return []
    items = session.query(ImageModel).filter_by(categoryId=id)
    if not items:
        raise HTTPException(status_code=404, detail="Image not found")

    image_list = []
    for item in items:
        # Get the primary blob service endpoint for your storage account
        # primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
        # Construct the URL for the blob
        # blob_url = f"{primary_endpoint}/{container_name}/{item.imgPath}"

        image_dict = ImageDB.model_validate(item)

        # Set the imgPath attribute to the blob URL
        # image_dict.imgPath = blob_url

        image_list.append(image_dict)

    return image_list


@app.put('/images/{id}')
def update_image(id: str, image: ImageSchema, session: Session = Depends(get_db)):
    item = session.query(ImageModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found")

    for k, value in image.model_dump().items():
        setattr(item, k, value)

    session.commit()

    return ImageDB.model_validate(item)


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/images/{id}/delete")
def delete_image(id: str, delete_flag: bool, session: Session = Depends(get_db)):
    item = session.query(ImageModel).get(id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")
    item.deleteFlag = delete_flag
    session.commit()
    return {"message": "Image deleted successfully"}


# @app.delete('/images/{id}')
# def delete_image(id: str, session: Session = Depends(get_db)):
#     item = session.query(ImageModel).get(id)

#     if not item:
#         raise HTTPException(status_code=404, detail="Image not found")

#     session.delete(item)

#     session.commit()

#     return {"message": "Image deleted successfully"}


@app.get('/gen_img/{query}')
async def img_gen_handler(query: str):
    try:
        image_url = await aoai_call.img_gen(query)
    except Exception as e:
        raise HTTPException(status_code=204, detail="No image found")

    return image_url


@app.get('/bing_img/{search_query}')
async def img_gen_handler(search_query: str):
    img_urls = await bing_img_search.fetch_image_from_bing(search_query, 10)
    random_idx = random.randint(1, 9)

    if len(img_urls) == 0:
        raise HTTPException(status_code=204, detail="No image found")

    img_url = img_urls[random_idx]
    return img_url


@app.get('/gen_img_list/{query}')
async def img_gen_handler(query: str):
    msg = await aoai_call.img_list_gen(query)

    img_urls: list[str | Any] = []
    substrings = ['sorry', 'unable']

    category_id = str(uuid.uuid4())
    if msg and not any(substring in msg.lower() for substring in substrings):
        img_queries = msg.split(',')

        # Bing Search Image
        for search_query in img_queries:
            img_url = await bing_img_search.fetch_image_from_bing(search_query, 1)
            print(img_url)

            img_id = str(uuid.uuid4())
            img = ImageDB(id=img_id, categoryId=category_id,
                          title=search_query, imgPath=img_url)

            img_urls.append(img)

        # Generative Image
        img_query = img_queries[1]
        img_id = str(uuid.uuid4())
        try:
            img_url = await aoai_call.img_gen(img_query)
            img = ImageDB(id=img_id, categoryId=category_id,
                          title=img_query + '_gen_', imgPath=img_url)
            img_urls.append(img)
        except Exception as e:
            img_url = await bing_img_search.fetch_image_from_bing(img_query)
            img = ImageDB(id=img_id, categoryId=category_id,
                          title=img_query + '_gen_', imgPath=img_url)
            img_urls.append(img)

    # pg = PromptGen(query=query, completeMsg=msg, imgUrls=img_urls)
    items_list = [ImageDB.model_validate(item) for item in img_urls]
    return items_list


@app.get('/search/{query}')
async def search_handler(query: str, request: Request, session: Session = Depends(get_db)):
    params = request.query_params
    k_num = int(params['count']) if 'count' in params else 3
    print(k_num)
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

    items = session.query(ImageModel).filter(ImageModel.id.in_(img_ids)).all()
    items_list = [ImageDB.model_validate(item) for item in items]

    return items_list


if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=5000)
