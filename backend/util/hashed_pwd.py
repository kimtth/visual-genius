import json
import os
from dotenv import load_dotenv
from passlib.context import CryptContext


load_dotenv(verbose=False)
hasher = CryptContext(schemes=['bcrypt'])
secret = os.getenv("APP_SECRET_STRING")

def encode_password(password):
    return hasher.hash(password)

pwd_str = "sys"
hashed_pwd = encode_password(pwd_str)
print(hashed_pwd)
