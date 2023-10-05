from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
import psycopg2
from azure.storage.blob import BlobServiceClient
import os
from azure.search.documents import SearchClient


load_dotenv(verbose=False)
postgre_host = os.getenv("POSTGRE_HOST")
postgre_user = os.getenv("POSTGRE_USER")
postgre_port = os.getenv("POSTGRE_PORT")
postgre_db = os.getenv("POSTGRE_DATABASE")
postgre_pwd = os.getenv("POSTGRE_PASSWORD")

connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")

service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")


# Connect to PostgreSQL database
conn = psycopg2.connect(
    host=postgre_host,
    database=postgre_db,
    user=postgre_user,
    password=postgre_pwd
)
cur = conn.cursor()

# Retrieve list of image paths from PostgreSQL database
# change sql query for distinct image paths
cur.execute("SELECT distinct(\"imgPath\") FROM image")
rows = cur.fetchall()
image_paths = [row[0] for row in rows]

# Connect to Azure Blob Storage account
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Remove blobs that correspond to image paths not in PostgreSQL database
container_client = blob_service_client.get_container_client(container_name)
for blob in container_client.list_blobs():
    primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
    blob_url = f"{primary_endpoint}/{container_name}/{blob.name}"
    if blob_url not in image_paths:
        container_client.delete_blob(blob.name)

# Close database connection
cur.close()
conn.close()

# Connect to Azure Cognitive Search index
credential = AzureKeyCredential(key)
search_client = SearchClient(endpoint=service_endpoint,
                             index_name=index_name,
                             credential=credential)

# Delete documents from Azure Cognitive Search index if imgPath does not exist in database
del_items = []
for result in search_client.search(search_text="*", select="id, imgPath"):
    if result["imgPath"] not in image_paths:
        del_items.append({"id": result["id"], "imgPath": result["imgPath"]})

if del_items:
    search_client.delete_documents(documents=del_items)

print('Done')
