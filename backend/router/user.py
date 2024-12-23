from datetime import datetime, timedelta, timezone
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session

from router.util import delete_acs_document
from module.common.models import UserDB, UserModel, UserSchema
from module.auth.auth_base import AuthBase
from db_blob import get_db

security = HTTPBearer()
auth_handler = AuthBase()
router = APIRouter()


@router.post("/signup")
def signup(user: UserSchema, session: Session = Depends(get_db)):
    if user.get(user.user_id) != None:
        return "Account already exists"
    try:
        hashed_password = auth_handler.encode_password(user.user_password)
        db_user = UserModel(**user.model_dump())
        db_user.user_password = hashed_password

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return UserDB.model_validate(db_user)
    except:
        error_msg = "Failed to signup user"
        raise HTTPException(status_code=500, detail=error_msg)


@router.post("/login")
def login(user: UserSchema, session: Session = Depends(get_db)):
    try:
        db_user = session.get(UserModel, user.user_id)
        # raise HTTPException(status_code=401, detail='Invalid token')
        if db_user is None:
            raise HTTPException(status_code=401, detail="Invalid username")
        if not auth_handler.verify_password(user.user_password, db_user.user_password):
            raise HTTPException(status_code=401, detail="Invalid password")

        access_token = auth_handler.encode_token(user.user_id)
        refresh_token = auth_handler.encode_refresh_token(user.user_id)
        response = JSONResponse(
            content={
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        )
        # Set the cookie for the access token: samesite="lax" or "strict" or "none", secure=True
        expires_in = timedelta(days=14)
        response.set_cookie(
            key="access_token",
            value=access_token,
            samesite="lax",
            secure=False,
            path="/",
            expires=datetime.now(timezone.utc) + expires_in,
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            samesite="lax",
            secure=False,
            path="/",
            expires=datetime.now(timezone.utc) + expires_in,
        )
        return response
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/refresh_token")
def refresh_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    try:
        token = credentials.credentials
        user_id = auth_handler.decode_token(token)
        access_token = auth_handler.encode_token(user_id)

        response = JSONResponse(
            content={"message": "Token refreshed", "access_token": access_token}
        )
        expires_in = timedelta(days=14)
        response.set_cookie(
            key="access_token",
            value=access_token,
            samesite="lax",
            secure=False,
            path="/",
            expires=datetime.now(timezone.utc) + expires_in,
        )
        return response
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/validate_token")
def validate_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if auth_handler.decode_token(token):
        return JSONResponse(content={"status": "valid token"})
    raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/user/")
def create_user(
    user: UserSchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        db_user = UserModel(**user.model_dump())
        db_user.user_password = auth_handler.encode_password(user.user_password)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return UserDB.model_validate(db_user)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to add the user")


@router.get("/user/{user_id}")
def read_user(
    user_id: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    if not auth_handler.decode_token(token):
        raise HTTPException(403, "Not authorized")
    try:
        user = session.get(UserModel, user_id)
        return UserDB.model_validate(user)
    except Exception as e:
        print(e)
        raise HTTPException(500, "Failed to get the user")


@router.put("/user/{user_id}")
def update_user(
    user_id: str,
    user: UserSchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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
@router.put("/user/{user_id}/delete")
def update_user(
    user_id: str,
    user: UserSchema,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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


@router.delete("/user/{user_id}")
def delete_user(
    user_id: str,
    session: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security),
):
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
