from pydantic import BaseModel
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


# SQLAlchemy model
class UserModel(Base):
    __tablename__ = "user"
    user_id = Column(String, primary_key=True)
    user_password = Column(String)
    user_name = Column(String)
    deleteFlag = Column(Integer, default=0)

    # The "user" in backref="parent" and ForeignKey('category.sid') should be the same.
    categories = relationship(
        "CategoryModel", backref="user", cascade="all, delete-orphan"
    )


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
    topic = Column(String)
    title = Column(String)
    difficulty = Column(String)
    imgNum = Column(Integer)
    user_id = Column(String, ForeignKey("user.user_id"))
    deleteFlag = Column(Integer, default=0)

    # The "category" in backref="parent" and ForeignKey('category.sid') should be the same.
    images = relationship("ImageModel", backref="category")


# Pydantic model - request body
class CategorySchema(BaseModel):
    sid: str
    topic: str
    title: str
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
    categoryId = Column(String, ForeignKey("category.sid"))
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
