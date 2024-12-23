import os
import urllib.parse

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from azure.storage.blob.aio import BlobServiceClient

load_dotenv(verbose=False)

postgre_host = os.getenv("POSTGRE_HOST")
postgre_user = os.getenv("POSTGRE_USER")
postgre_port = os.getenv("POSTGRE_PORT")
postgre_db = os.getenv("POSTGRE_DATABASE")
postgre_pwd = os.getenv("POSTGRE_PASSWORD")

encoded_postgre_pwd = urllib.parse.quote(postgre_pwd)

engine = create_engine(
    f"postgresql://{postgre_user}:{encoded_postgre_pwd}@{postgre_host}:{postgre_port}/{postgre_db}"
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Set the connection string and container name
connection_string = os.getenv("BLOB_CONNECTION_STRING")

# Create the BlobServiceClient object which will be used to create a container client
blob_service_client = BlobServiceClient.from_connection_string(connection_string)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get the blob_service_client
def get_blob_service_client():
    return blob_service_client
