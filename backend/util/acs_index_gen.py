# Import libraries  
import os

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes import SearchIndexerClient
from azure.search.documents.indexes.models import (
    SearchField,
    FieldMapping,
    VectorSearch,
    HnswVectorSearchAlgorithmConfiguration,
    SearchIndex, SearchIndexer, SimpleField, SearchFieldDataType,
    InputFieldMappingEntry, OutputFieldMappingEntry, SearchIndexerSkillset,
    SearchableField
)
from azure.search.documents.indexes.models import (
    SearchIndexerDataContainer,
    SearchIndexerDataSourceConnection,
)
from azure.search.documents.indexes.models import WebApiSkill
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# https://github.com/Azure/cognitive-search-vector-pr
# demo-python/code/azure-search-vector-image-python-sample.ipynb

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

# Connect to Blob Storage
blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)
container_client = blob_service_client.get_container_client(container_name)
blobs = container_client.list_blobs()

first_blob = next(blobs)
blob_url = container_client.get_blob_client(first_blob).url
print(f"URL of the first blob: {blob_url}")

# Create a data source 
ds_client = SearchIndexerClient(service_endpoint, AzureKeyCredential(key))
container = SearchIndexerDataContainer(name=container_name)
data_source_connection = SearchIndexerDataSourceConnection(
    name=f"{index_name}-blob",
    type="azureblob",
    connection_string=blob_connection_string,
    container=container
)
data_source = ds_client.create_or_update_data_source_connection(data_source_connection)

print(f"Data source '{data_source.name}' created or updated")

# Create a skillset  
# WebSkill is a custom skill that is hosted in Azure Functions. > `backend\func\acs_skillset_for_indexer`
skillset_name = f"{index_name}-skillset"
skill_uri = customSkill_endpoint

skill = WebApiSkill(
    uri=skill_uri,
    inputs=[
        InputFieldMappingEntry(name="imgPath", source="/document/metadata_storage_path"),
        InputFieldMappingEntry(name="recordId", source="/document/metadata_storage_name")
    ],
    outputs=[OutputFieldMappingEntry(name="vector", target_name="imageVector")],
)

skillset = SearchIndexerSkillset(
    name=skillset_name,
    description="Skillset to extract image vector",
    skills=[skill],
)

client = SearchIndexerClient(service_endpoint, AzureKeyCredential(key))
client.create_or_update_skillset(skillset)
print(f' {skillset.name} created')

# Create a search index
'''
In Azure Cognitive Search, the key attribute in the SimpleField function is used to denote 
the unique identifier for each document in the index. 
Once you’ve set a field as the key, you cannot change its value for a particular document. 
So that, add sid attibute for id from database.
'''
index_client = SearchIndexClient(
    endpoint=service_endpoint, credential=credential)
fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True, sortable=True, filterable=True, facetable=True),
    SimpleField(name="sid", type=SearchFieldDataType.String, sortable=True, filterable=True, facetable=True), # uuid in the sql
    SimpleField(name="imgPath", type=SearchFieldDataType.String, filterable=True, retrievable=True),
    SearchableField(name="title", type=SearchFieldDataType.String, searchable=True, retrievable=True),
    SearchField(
        name="imageVector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=1024,
        vector_search_configuration="my-vector-config",
    ),
]

vector_search = VectorSearch(
    algorithm_configurations=[
        HnswVectorSearchAlgorithmConfiguration(
            name="my-vector-config",
            kind="hnsw",
            parameters={
                "m": 4,
                "efConstruction": 400,
                "efSearch": 1000,
                "metric": "cosine"
            }
        )
    ]
)

# Create the search index 
index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search, )
result = index_client.create_or_update_index(index)
print(f' {result.name} created')

# Create an indexer  
indexer_name = f"{index_name}-indexer"
indexer = SearchIndexer(
    name=indexer_name,
    description="Indexer to process images",
    skillset_name=skillset_name,
    target_index_name=index_name,
    data_source_name=data_source.name,
    field_mappings=[
        FieldMapping(source_field_name="metadata_storage_path", target_field_name="imgPath"),
        FieldMapping(source_field_name="metadata_storage_name", target_field_name="title")
    ],
    output_field_mappings=[
        FieldMapping(source_field_name="/document/imageVector", target_field_name="imageVector")
    ]
)

indexer_client = SearchIndexerClient(service_endpoint, AzureKeyCredential(key))
indexer_result = indexer_client.create_or_update_indexer(indexer)

# Run the indexer  
indexer_client.run_indexer(indexer_name)
print(f' {indexer_name} created')
