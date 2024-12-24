import psycopg2
import os
import logging
import azure.functions as func

from datetime import datetime, timezone
from azure.core.credentials import AzureKeyCredential
from azure.storage.blob import BlobServiceClient
from azure.search.documents import SearchClient

app = func.FunctionApp()


def get_image_paths(cursor):
    """Retrieve distinct image paths from the image table."""
    cursor.execute('SELECT DISTINCT("imgPath") FROM image')
    rows = cursor.fetchall()
    return [row[0] for row in rows]


def delete_rows(cursor):
    """Delete rows that have deleteFlag set to 1 in the image table."""
    cursor.execute("DELETE FROM image WHERE deleteFlag = 1")
    cursor.execute("DELETE FROM category WHERE deleteFlag = 1")


def remove_orphaned_blobs(
    blob_service_client: BlobServiceClient, container_name: str, image_paths: list
):
    """Remove blobs that do not exist in the provided image_paths list."""
    container_client = blob_service_client.get_container_client(container_name)
    for blob in container_client.list_blobs():
        primary_endpoint = (
            f"https://{blob_service_client.account_name}.blob.core.windows.net"
        )
        blob_url = f"{primary_endpoint}/{container_name}/{blob.name}"
        if blob_url not in image_paths:
            container_client.delete_blob(blob.name)


def remove_orphaned_docs(search_client: SearchClient, image_paths: list):
    """Remove Azure Cognitive Search documents that do not exist in the provided image_paths list."""
    del_items = []
    for result in search_client.search(search_text="*", select="id, imgPath"):
        if result["imgPath"] not in image_paths:
            del_items.append({"id": result["id"], "imgPath": result["imgPath"]})
    if del_items:
        search_client.delete_documents(documents=del_items)


# v2 does not require function.json.
# The function will be triggered by a timer trigger regularly on a weekly basis.
@app.function_name(name="WeeklyTimerTrigger")
@app.schedule(schedule="0 0 * * 0", arg_name="schedule_timer")
def delete_data_in_blob_acs(schedule_timer: func.TimerRequest) -> None:
    utc_timestamp = datetime.now(timezone.utc).replace(tzinfo=timezone.utc).isoformat()
    if schedule_timer.past_due:
        logging.info("The timer is past due!")

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

    try:
        # Connect to PostgreSQL
        with psycopg2.connect(
            host=postgre_host,
            database=postgre_db,
            user=postgre_user,
            password=postgre_pwd,
            port=postgre_port,
        ) as conn:
            with conn.cursor() as cur:
                delete_rows(cur)
                image_paths = get_image_paths(cur)

        # Connect to Azure Blob
        blob_service_client = BlobServiceClient.from_connection_string(
            connection_string
        )
        remove_orphaned_blobs(blob_service_client, container_name, image_paths)

        # Connect to Azure Cognitive Search
        credential = AzureKeyCredential(key)
        search_client = SearchClient(
            endpoint=service_endpoint, index_name=index_name, credential=credential
        )
        remove_orphaned_docs(search_client, image_paths)

        logging.info("Python timer trigger function ran at %s", utc_timestamp)
    except Exception as e:
        logging.exception("An error occurred during execution: %s", e)
