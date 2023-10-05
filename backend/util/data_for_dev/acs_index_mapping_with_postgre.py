import os

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
import psycopg2
from dotenv import load_dotenv

# Replace with your Azure Cognitive Search service name, index name, and admin key
load_dotenv(verbose=False)

index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
api_key = os.getenv("AZURE_SEARCH_ADMIN_KEY")

# Create a SearchClient to interact with your search index
endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
credential = AzureKeyCredential(api_key)
search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=credential)

db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")

# Connect to your PostgreSQL database
conn = psycopg2.connect(
    host=db_host,
    port=db_port,
    dbname=db_name,
    user=db_user,
    password=db_password
)
cursor = conn.cursor()

async def sync_search_db():
    # Query your PostgreSQL database for the data you want to merge with your search index
    query = 'SELECT sid, imgPath FROM image WHERE deleteFlag != 1'
    cursor.execute(query)
    rows = cursor.fetchall()

    # For each row in your PostgreSQL database, query your search index for the corresponding document
    for row in rows:
        results = search_client.search(search_text='*', include_total_count=True, filter='imgPath eq \'' + row[1] +'\'')
        if results.get_count() == 1:
            # If a single matching document is found, update it with the new attribute
            document = dict(next(results))
            if document['sid'] == row[0]:
                continue
            document['sid'] = row[0]
            print(row[0])
            search_client.merge_documents(documents=[document])

    print("Done")


