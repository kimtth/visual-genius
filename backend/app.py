import asyncio
import base64
import os
import random
import uuid
import io
import zipfile
import re
import uvicorn
import httpx
from typing import List, Any, Optional
from urllib.parse import urlparse, urlunparse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from io import BytesIO
from PIL import Image
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import Vector
from azure.storage.blob.aio import BlobServiceClient, ContainerClient
from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException, Depends, Request, Response, Security, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

from module import cog_embed_gen, aoai_call, bing_img_search, text_to_speech, auth

app = FastAPI()
load_dotenv(verbose=False)

# TODO: Development purpose only, remove it later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In case of Sqlite (local)
# engine = create_engine("sqlite:///./db.db", connect_args={"check_same_thread": False})
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

# Set the connection string and container name
connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
emoji_container_name = os.getenv("BLOB_EMOJI_CONTAINER_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")
speech_subscription_key = os.getenv("SPEECH_SUBSCRIPTION_KEY")
speech_region = os.getenv("SPEECH_REGION")

# Create the BlobServiceClient object which will be used to create a container client
blob_service_client = BlobServiceClient.from_connection_string(
    connection_string)

security = HTTPBearer()
auth_handler = auth.Auth()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# SQLAlchemy model
class UserModel(Base):
    __tablename__ = 'user'
    user_id = Column(String, primary_key=True)
    user_password = Column(String)
    user_name = Column(String)
    deleteFlag = Column(Integer, default=0)

    # The "user" in backref="parent" and ForeignKey('category.sid') should be the same.
    categories = relationship(
        "CategoryModel", backref="user", cascade='all, delete-orphan')


# Pydantic model - request body
class UserSchema(BaseModel):
    user_id: str
    user_password: Optional[str] = None
    user_name: Optional[str] = None
    deleteFlag: Optional[int] = 0


# Pydantic model - response body
class UserDB(UserSchema):
    user_id: str
    # deleteFlag: Optional[int] = 0

    class Config:
        from_attributes = True


# SQLAlchemy model
class CategoryModel(Base):
    __tablename__ = "category"
    sid = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    difficulty = Column(String)
    imgNum = Column(Integer)
    user_id = Column(String, ForeignKey('user.user_id'))
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
    user_id: str
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
    user_id = Column(String)
    deleteFlag = Column(Integer, default=0)


# Pydantic model - request body
class ImageSchema(BaseModel):
    sid: str
    categoryId: str
    title: str
    imgPath: Optional[str] = None
    user_id: Optional[str] = None
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


@app.post('/signup')
def signup(user: UserSchema, session: Session = Depends(get_db)):
    if user.get(user.user_id) != None:
        return 'Account already exists'
    try:
        hashed_password = auth_handler.encode_password(user.user_password)
        db_user = UserModel(**user.model_dump())
        db_user.user_password = hashed_password

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return UserDB.model_validate(db_user)
    except:
        error_msg = 'Failed to signup user'
        raise HTTPException(status_code=500, detail=error_msg)


@app.post('/login')
def login(user: UserSchema, session: Session = Depends(get_db)):
    try:
        db_user = session.get(UserModel, user.user_id)
        # raise HTTPException(status_code=401, detail='Invalid token')
        if user is None:
            raise HTTPException(status_code=401, detail='Invalid username')
        if not auth_handler.verify_password(user.user_password, db_user.user_password):
            raise HTTPException(status_code=401, detail='Invalid password')

        access_token = auth_handler.encode_token(user.user_id)
        refresh_token = auth_handler.encode_refresh_token(user.user_id)
        return JSONResponse(content={'access_token': access_token, 'refresh_token': refresh_token})
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail='Invalid credentials')


@app.post('/refresh_token')
def refresh_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        user_id = auth_handler.decode_token(token)
        new_token = auth_handler.refresh_token(user_id)
        return JSONResponse(content={'access_token': new_token})
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail='Invalid token')


@app.post('/validate_token')
def validate_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if auth_handler.decode_token(token):
        return JSONResponse(content={'status': 'valid token'})
    raise HTTPException(status_code=401, detail='Invalid token')


@app.post("/user/")
def create_user(user: UserSchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        db_user = UserModel(**user.model_dump())
        db_user.user_password = auth_handler.encode_password(
            user.user_password)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return UserDB.model_validate(db_user)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to add the user")


@app.get("/user/{user_id}")
def read_user(user_id: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        user = session.get(UserModel, user_id)
        return UserDB.model_validate(user)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get the user")


@app.put("/user/{user_id}")
def update_user(user_id: str, user: UserSchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        user = session.get(UserModel, user_id)
        for key, value in user.model_dump().items():
            setattr(user, key, value)
        session.commit()
        return JSONResponse(content={"message": "User updated successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to update the user")


# prevent the unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/user/{user_id}/delete")
def update_user(user_id: str, user: UserSchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        user = session.get(UserModel, user_id)
        user.deleteFlag = 1

        # Update the deleteFlag for all images associated with the category and the user
        acs_item = []
        for category in user.categories:
            category.deleteFlag = 1
            for image in category.images:
                image.deleteFlag = 1
                acs_item.append({"sid": image.sid})

            if acs_item:
                delete_acs_document(acs_item)

        session.commit()
        session.refresh(user)
        return JSONResponse(content={"message": "User updated successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to update the user")


@app.delete("/user/{user_id}")
def delete_user(user_id: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        user = session.get(UserModel, user_id)
        session.delete(user)
        session.commit()
        return JSONResponse(content={"message": "User deleted successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete the user")


@app.get('/categories')
def get_categories(page: Optional[int] = 1, per_page: Optional[int] = 6, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        # In the context of pagination, `(page - 1) * per_page` calculates the number of items to skip.
        # - For `page` 1, `(page - 1) * per_page` equals 0, so no items are skipped and the first 6 items are returned.
        # - For `page` 2, `(page - 1) * per_page` equals 6, so the first 6 items are skipped and the next 6 items are returned.
        # - For `page` 3, `(page - 1) * per_page` equals 12, so the first 6 items are skipped and the next 6 items are returned.
        items = session.query(CategoryModel).filter_by(
            deleteFlag=0, user_id=user_id).offset((page - 1) * per_page).limit(per_page).all()
        # First 3 images for each category
        for item in items:
            imgs = [img for img in item.images if img.deleteFlag == 0]
            imgs = imgs[:3]
            item.contentUrl = [img.imgPath for img in imgs]
        return [CategoryDB.model_validate(item) for item in items]
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get categories")


@app.get('/categories/count')
def count_categories(session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        count = session.query(CategoryModel).filter_by(
            deleteFlag=0, user_id=user_id).count()
        return {"count": count}
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get category count")


@app.get('/category/{sid}/exist')
async def get_category(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        item = session.query(CategoryModel).filter_by(sid=sid).first()
        if item and item.deleteFlag == 0:
            return JSONResponse(content={"count": 1})
        else:
            return JSONResponse(content={"count": 0})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get a category")


@app.post('/category')
async def create_category(category: CategorySchema, images: List[ImageSchema], session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            container_name)
        new_category = CategoryModel(**category.model_dump())

        acs_items = list()
        # Create the associated images
        for image in images:
            new_image = ImageModel(**image.model_dump())
            new_image.user_id = new_category.user_id

            # Upload the image to blob storage
            new_image.imgPath, image_data = await upload_image(container_client, new_image.imgPath)

            if image_data:
                session.add(new_image)
                acs_doc_item = await gen_acs_document(new_image)
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
        raise HTTPException(500, "Failed to create a category")


def remove_query_params(url: str):
    # remove_query_params
    parsed_url = urlparse(url)
    cleaned_url = urlunparse(parsed_url._replace(query=""))
    return cleaned_url


async def validate_image_url(img_path):
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
    content_disposition = response.headers.get('Content-Disposition')
    if content_disposition:
        file_name = re.findall('filename=(.+)', content_disposition)[0]
    else:
        file_name = img_path.split('/')[-1]
        file_name = remove_query_params(file_name)

    return img, response.content, file_name


# Speed up the upload process by using async
async def upload_image(container_client: ContainerClient, img_path: str):
    try:
        img, content, file_name = await validate_image_url(img_path)

        blob_client = container_client.get_blob_client(file_name)

        # Reopen the content for unexpected error, 'NoneType' object has no attribute 'seek'.
        img_byte_io = BytesIO(content)
        with Image.open(img_byte_io) as save_img:
            output_buffer = BytesIO()
            save_img.save(output_buffer, img.format)
            output_buffer.seek(0)

        async with blob_client:
            await blob_client.upload_blob(output_buffer, overwrite=True)

        return blob_client.url, img_byte_io
    except Exception as e:
        print(e)
        return None, None


@app.get('/category/{sid}')
def get_category(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(CategoryModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        return CategoryDB.model_validate(item)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get an category")


@app.put('/category/{sid}')
def update_category(sid: str, category: CategorySchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(CategoryModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")

        for k, value in category.model_dump().items():
            setattr(item, k, value)
        session.commit()
        session.refresh(item)
        return CategoryDB.model_validate(item)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to update an category")


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/category/{sid}/delete")
def delete_category(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(CategoryModel, sid)
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
        return JSONResponse(content={"sid": sid, "message": "Category deleted successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete an category")


@app.delete("/category/{sid}")
def delete_category_all(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        item = session.get(CategoryModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        session.delete(item)
        session.commit()
        return JSONResponse(content={"message": "Category deleted successfully"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete an category")


@app.get("/category/{sid}/download")
async def download_images(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            container_name)

        item = session.get(CategoryModel, sid)
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
                tasks.append(asyncio.ensure_future(
                    download_image(container_client, img_path)))
            image_data_list = await asyncio.gather(*tasks)
            # filter out None
            image_data_list = [x for x in image_data_list if x]
            for img, image_data in zip(images, image_data_list):
                img_path = getattr(img, 'imgPath')
                zipf.writestr(img_path.split("/")[-1], image_data)
        in_memory_zip.seek(0)
        return StreamingResponse(in_memory_zip, media_type="application/zip",
                                 headers={"Content-Disposition": "attachment; filename=images.zip"})
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to download an image")


# Speed up the download process by using async
async def download_image(container_client, img_path: str):
    try:
        file_name = img_path.split("/")[-1]
        blob_client = container_client.get_blob_client(file_name)
        async with blob_client:
            stream = await blob_client.download_blob(max_concurrency=2)
            rtn = await stream.readall()
            return rtn
    except Exception as e:
        # print(f"The blob {img_path} was not found. {e}")
        return None


@app.get('/images')
def get_images(request: Request, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        category_id = params['categoryId'] if 'categoryId' in params else ''

        if (category_id):
            if (category_id == 'file_upload'):
                items = session.query(ImageModel).filter_by(
                    categoryId=category_id).all()
            else:
                items = session.query(ImageModel).filter_by(
                    deleteFlag='0', categoryId=category_id).all()
        else:
            items = session.query(ImageModel).filter_by(deleteFlag='0').all()

        items_list = [ImageDB.model_validate(item) for item in items]
        return items_list
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get images")


@app.post('/images')
async def create_image(images: List[ImageSchema], session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        items = []
        acs_items = list()
        for image in images:
            if not check_image_path(image.categoryId, image.imgPath, session):
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


def check_image_path(category_id: str, img_path: str, session: Session) -> bool:
    """
    Check if the same imgPath exists based on the categoryId
    """
    query = session.query(ImageModel).filter(
        ImageModel.categoryId == category_id, ImageModel.imgPath == img_path, ImageModel.deleteFlag != 1)
    return session.query(query.exists()).scalar()


@app.post('/image')
async def create_image(image: ImageSchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
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


@app.get('/images/{sid}')
def get_image(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
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
        raise HTTPException(500, "Failed to get an image")


@app.put('/images/{sid}')
async def update_image(sid: str, image: ImageSchema, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            container_name)
        item = session.get(ImageModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Image not found")

        for k, value in image.model_dump().items():
            setattr(item, k, value)

        # Upload the image to blob storage
        db_img_path = item.imgPath
        req_img_path = image.imgPath

        if db_img_path:
            await blob_exist_check_delete_image(db_img_path)
        if req_img_path:
            item.imgPath, image_data = await upload_image(container_client, req_img_path)
            if image_data is None:
                raise HTTPException(500, "Failed to update an image")

        session.commit()
        session.refresh(item)

        acs_doc_item = await gen_acs_document(item)
        # Run azure cognitive search for updates
        insert_acs_document([acs_doc_item])

        return ImageDB.model_validate(item)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to update an image")


async def blob_exist_check_delete_image(db_img_path: str):
    try:
        db_file_name = db_img_path.split("/")[-1]

        container_client = blob_service_client.get_container_client(
            container_name)
        db_blob_client = container_client.get_blob_client(db_file_name)

        async with db_blob_client:
            if await db_blob_client.exists():
                # Delete the blob
                await db_blob_client.delete_blob()
    except Exception as e:
        print(f"An error occurred: {e}")


# Preventing unintentional delete, the request will be a put request to change the delete flag. (Soft delete)
@app.put("/images/{sid}/delete")
async def delete_image(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
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


@app.delete("/images/{sid}")
async def delete_image_all(sid: str, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
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


@app.get('/gen_img/{query}')
async def img_gen_handler(query: str, credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        image_url = await aoai_call.img_gen(query)
        return image_url
    except Exception as e:
        raise HTTPException(status_code=204, detail="No image found")


@app.get('/bing_img/{search_query}')
async def img_gen_handler(search_query: str, request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        params = request.query_params
        title = params['title'] if 'title' in params else ''
        title = '' if title == 'undefined' else title
        # Add category title for searching more better output.
        search_query = search_query + ' in ' + title
        img_urls = await bing_img_search.fetch_image_from_bing(search_query, 15)
        random_idx = random.randint(0, 14)

        if len(img_urls) == 0:
            raise HTTPException(status_code=204, detail="No image found")

        img_url = img_urls[random_idx]
        return img_url
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get images")


@app.get('/gen_img_list/{query}')
async def img_gen_handler(query: str, request: Request, credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
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
        substrings = []  # TODO: Add keywords to filter out the prompt.

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
        raise HTTPException(500, "Failed to get images")


@app.get('/emojies')
async def emoji_handler(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            emoji_container_name)

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
        raise HTTPException(500, "Failed to find images")


@app.get('/search/{query}')
async def search_handler(query: str, request: Request, session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
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
        raise HTTPException(500, "Failed to find images")


@app.post('/file_upload')
async def file_upload(files: List[UploadFile], session: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(
            container_name)
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
                new_item = ImageModel(sid=str(uuid.uuid4(
                )), categoryId=category_id, imgPath=blob_client.url, title=filename_without_extension)
                session.add(new_item)
                session.commit()

                acs_doc_item = await gen_acs_document(new_item)
                acs_items.append(acs_doc_item)

        if acs_items:
            insert_acs_document(acs_items)

        return JSONResponse(content={"message": "Files uploaded successfully except existing files"})
    except Exception as e:
        print(e)
        raise HTTPException(401, "Something went wrong..")


@app.post('/synthesize_speech')
async def gen_synthesize_speech(text: str = Body(..., embed=True), credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        audio_data = await text_to_speech.synthesize_speech(text, speech_subscription_key, speech_region)
        return Response(content=audio_data, media_type="audio/mp3")
    except RuntimeError as e:
        raise JSONResponse(content={"error": str(e)})
    except Exception as e:
        raise HTTPException(500, "Failed to synthesize speech")


async def gen_acs_document(new_item: ImageModel):
    image_url = new_item.imgPath
    embed = await cog_embed_gen.generate_image_embeddings(image_url, cogSvcsEndpoint, cogSvcsApiKey)
    acs_doc_item = {
        "id": base64.b64encode(new_item.sid.encode()).decode(),
        "sid": new_item.sid,
        "imgPath": new_item.imgPath,
        "title": new_item.title,
        "imageVector": embed
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
            print('insert_acs_document:', result[0].succeeded)
    except Exception as e:
        print('Azure Cognitive Search index: ', e)
        raise HTTPException(
            500, "Failed to upload files to Azure Cognitive Search index")


def delete_acs_document(acs_items: List[dict]):
    try:
        credential = AzureKeyCredential(key)
        search_client = SearchClient(endpoint=service_endpoint,
                                     index_name=index_name,
                                     credential=credential)

        keys_to_delete = []
        for acs_item in acs_items:
            # the sid field was created with not searchable. temporary solution.
            results = search_client.search(select="id, sid", search_text='*')
            for item in results:
                item = item
                if item['sid'] == acs_item['sid']:
                    keys_to_delete.append(item['id'])

        if keys_to_delete:
            documents_to_delete = [
                {"@search.action": "delete", "id": key} for key in keys_to_delete]
            search_client.delete_documents(documents=documents_to_delete)
            print("Delete document succeeded")
    except Exception as e:
        print(e)
        raise Exception(
            "Failed to delete files to Azure Cognitive Search index")


directory_path = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(directory_path, "public")

# The @app.get("/{page}") approach was not able to handle the static files. so that, the routes declared each by each.


@app.get("/")
async def redirect_gen():
    # RedirectResponse(url="/index.html")
    return FileResponse(f'{static_path}/index.html')


@app.get("/gen")
async def redirect_gen():
    return FileResponse(f'{static_path}/gen.html')


@app.get("/rtn")
async def redirect_rtn():
    return FileResponse(f'{static_path}/rtn.html')


@app.get("/home")
async def redirect_home():
    return FileResponse(f'{static_path}/home.html')


@app.get("/motion")
async def redirect_home():
    return FileResponse(f'{static_path}/motion.html')

# Mount static files from the public directory at the root URL path (/)
'''
 !Important: mount the static files after all your API route definitions.
 The line app.mount("/static", StaticFiles(directory="static"), name="static") should be placed after all your API route definitions. 
 This is because FastAPI processes routes and mounts in the order they are declared. If you declare the static mount first, 
 FastAPI will try to find a matching static file for every request, before falling back to the dynamic routes.
'''

app.mount("/", StaticFiles(directory=static_path), name="public")


if __name__ == '__main__':
    if os.getenv('ENV_TYPE') == 'dev':
        # app:app == filename:app <= FastAPI()
        uvicorn.run(app='app:app', host="127.0.0.1", port=5000)
    else:
        # Azure App service uses 8000 as default port internally.
        uvicorn.run(app='app:app', host="0.0.0.0", workers=4)
