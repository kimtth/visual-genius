import os
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
from dotenv import load_dotenv


load_dotenv(verbose=False)
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")

credential = AzureKeyCredential(key)
indexer_client = SearchIndexerClient(service_endpoint, AzureKeyCredential(key))

def run_indexer():
    # Run the indexer  
    indexer_name = f"{index_name}-indexer"
    indexer_client.run_indexer(indexer_name)
    print(f' {indexer_name} executed')


if __name__ == '__main__':
    print("Running indexer...")
    # run_indexer()
