import asyncio
import io
import os
import zipfile

from typing import List, Optional
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session
from db_blob import get_blob_service_client
from router.util import (
    check_dalle_img_path,
    delete_acs_document,
    download_image,
    gen_acs_document,
    generate_blob_container_sas,
    insert_acs_document,
    process_dalle_image,
)
from module.common.models import (
    CategoryDB,
    CategoryModel,
    CategorySchema,
    ImageModel,
    ImageSchema,
)
from module.auth.auth_base import AuthBase
from db_blob import get_db

security = HTTPBearer()
auth_handler = AuthBase()
router = APIRouter()

blob_service_client = get_blob_service_client()
container_name = os.getenv("BLOB_CONTAINER_NAME")


@router.get("/categories")
def get_categories(
    page: Optional[int] = 1,
    per_page: Optional[int] = 6,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        # In the context of pagination, `(page - 1) * per_page` calculates the number of items to skip.
        # - For `page` 1, `(page - 1) * per_page` equals 0, so no items are skipped and the first 6 items are returned.
        # - For `page` 2, `(page - 1) * per_page` equals 6, so the first 6 items are skipped and the next 6 items are returned.
        # - For `page` 3, `(page - 1) * per_page` equals 12, so the first 6 items are skipped and the next 6 items are returned.
        items = (
            session.query(CategoryModel)
            .filter_by(deleteFlag=0, user_id=user_id)
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        sas_token = generate_blob_container_sas(container_name)
        # First 3 images for the preview of each category
        for item in items:
            imgs = [img for img in item.images if img.deleteFlag == 0]
            imgs = imgs[:3]
            item.contentUrl = [f"{img.imgPath}?{sas_token}" for img in imgs]
        return [CategoryDB.model_validate(item) for item in items]
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get categories")


@router.get("/categories/count")
def count_categories(
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        count = (
            session.query(CategoryModel)
            .filter_by(deleteFlag=0, user_id=user_id)
            .count()
        )
        return {"count": count}
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get category count")


@router.get("/category/{sid}/exist")
async def get_category(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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


@router.post("/category")
async def create_category(
    category: CategorySchema,
    images: List[ImageSchema],
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    user_id = auth_handler.decode_token(token)
    if not user_id:
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(container_name)
        new_category = CategoryModel(**category.model_dump())

        acs_items, failed_images = [], []
        # Create the associated images
        for image in images:
            try:
                new_image = ImageModel(**image.model_dump())
                new_image.user_id = new_category.user_id
                original_img_path = new_image.imgPath

                # A DALLE-e created image exists in Azure storage account temporarily. so, we need to upload it to the blob storage.
                # Upload the image to blob storage
                if check_dalle_img_path(new_image.imgPath):
                    await process_dalle_image(
                        container_client, new_image, original_img_path
                    )
                else:
                    new_image.imgPath = new_image.imgPath

                session.add(new_image)
                acs_doc_item = await gen_acs_document(new_image)
                acs_items.append(acs_doc_item)
            except Exception as e:
                msg = f"{new_image.title}: {original_img_path}"
                print(f"{e}: {msg}")
                failed_images.append(msg)  # Add failed image to the list
                continue

        # The order in which you add objects to the session does not matter,
        # as long as all the necessary relationships between the objects are properly set up
        new_category.imgNum = len(images)
        session.add(new_category)
        session.commit()

        # Run azure cognitive search for updates
        insert_acs_document(acs_items)

        return {
            "category": CategoryDB.model_validate(new_category),
            "failed_images": failed_images,
        }
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to create a category")


@router.get("/category/{sid}")
def get_category(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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


@router.put("/category/{sid}")
def update_category(
    sid: str,
    category: CategorySchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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
@router.put("/category/{sid}/delete")
def delete_category(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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
        return JSONResponse(
            content={"sid": sid, "message": "Category deleted successfully"}
        )
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to delete an category")


@router.delete("/category/{sid}")
def delete_category_all(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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


@router.get("/category/{sid}/download")
async def download_images(
    sid: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        container_client = blob_service_client.get_container_client(container_name)

        item = session.get(CategoryModel, sid)
        if not item:
            raise HTTPException(status_code=404, detail="Category not found")
        images = item.images
        if not images:
            raise HTTPException(
                status_code=404, detail="No images found for this category"
            )

        in_memory_zip = io.BytesIO()
        with zipfile.ZipFile(in_memory_zip, mode="w") as zipf:
            tasks = []
            for img in images:
                img_path = getattr(img, "imgPath")
                tasks.append(
                    asyncio.ensure_future(download_image(container_client, img_path))
                )
            image_data_list = await asyncio.gather(*tasks)
            # filter out None
            image_data_list = [x for x in image_data_list if x]
            for img, image_data in zip(images, image_data_list):
                img_path = getattr(img, "imgPath")
                zipf.writestr(img_path.split("/")[-1], image_data)
        in_memory_zip.seek(0)
        return StreamingResponse(
            in_memory_zip,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=images.zip"},
        )
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to download an image")
