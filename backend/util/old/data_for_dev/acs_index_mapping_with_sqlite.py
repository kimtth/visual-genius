import os

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from sqlite3 import connect
from dotenv import load_dotenv

# Replace with your Azure Cognitive Search service name, index name, and admin key
load_dotenv()

index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
api_key = os.getenv("AZURE_SEARCH_ADMIN_KEY")

# Create a SearchClient to interact with your search index
endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
credential = AzureKeyCredential(api_key)
search_client = SearchClient(endpoint=endpoint, index_name=index_name, credential=credential)

# Replace with the path to your SQLite3 database file
db_path = '../db.db'

# Connect to your SQLite3 database
conn = connect(db_path)
cursor = conn.cursor()

async def sync_search_db():
    # Query your SQLite3 database for the data you want to merge with your search index
    query = 'SELECT sid, imgPath FROM image Where deleteFlag != 1'
    cursor.execute(query)
    rows = cursor.fetchall()

    # For each row in your SQLite3 database, query your search index for the corresponding document
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
