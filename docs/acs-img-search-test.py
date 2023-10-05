# Import libraries  
import os

import requests
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import Vector
from dotenv import load_dotenv

  
load_dotenv(verbose=False)  
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")  
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")  
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")  
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")  
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")  
customSkill_endpoint = os.getenv("FUNCTION_CUSTOM_SKILL_ENDPOINT")  
blob_connection_string = os.getenv("BLOB_CONNECTION_STRING")  
container_name = os.getenv("BLOB_CONTAINER_NAME")
credential = AzureKeyCredential(key)


def generate_embeddings(text, cogSvcsEndpoint, cogSvcsApiKey):  
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeText"  
  
    params = {  
        "api-version": "2023-02-01-preview"  
    }  
  
    headers = {  
        "Content-Type": "application/json",  
        "Ocp-Apim-Subscription-Key": cogSvcsApiKey  
    }  
  
    data = {  
        "text": text  
    }  
  
    response = requests.post(url, params=params, headers=headers, json=data)  
  
    if response.status_code == 200:  
        embeddings = response.json()["vector"]  
        return embeddings  
    else:  
        print(f"Error: {response.status_code} - {response.text}")  
        return None  

  
# Generate text embeddings for the query  
query = "winter"
  
# Initialize the SearchClient  
search_client = SearchClient(service_endpoint, index_name, AzureKeyCredential(key))  
vector = Vector(value=generate_embeddings(query, cogSvcsEndpoint, cogSvcsApiKey), k=3, fields="imageVector")  

# Perform vector search  
results = search_client.search(  
    search_text=None,  
    vectors=[vector],
    select=["title", "imgPath"]
)   
  
# Print the search results  
for result in results:  
    print(f"Title: {result['title']}")  
    print(f"Image URL: {result['imgPath']}")
    # display(Image(url=result['imageUrl']))
    print("\n") 


