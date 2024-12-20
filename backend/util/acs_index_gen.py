# Import libraries
import argparse
import os

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexerClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SimpleField,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    VectorSearch,
    # VectorSearchAlgorithmConfiguration,
    HnswAlgorithmConfiguration, 
    VectorSearchProfile,
    InputFieldMappingEntry,
    OutputFieldMappingEntry,
    SearchIndexerSkillset,
    FieldMapping,
    SearchIndexer,
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

parser = argparse.ArgumentParser(description="Azure Cognitive Search Index Generator")
parser.add_argument(
    "--search-service-endpoint",
    type=str,
    required=True,
    help="Azure Search Service Endpoint",
)
parser.add_argument(
    "--search-index-name", type=str, required=True, help="Azure Search Index Name"
)
parser.add_argument(
    "--search-admin-key", type=str, required=True, help="Azure Search Admin Key"
)
parser.add_argument(
    "--cognitive-services-endpoint",
    type=str,
    required=True,
    help="Cognitive Services Endpoint",
)
parser.add_argument(
    "--cognitive-services-api-key",
    type=str,
    required=True,
    help="Cognitive Services API Key",
)
parser.add_argument(
    "--custom-skill-endpoint", type=str, required=True, help="Custom Skill Endpoint"
)
parser.add_argument(
    "--blob-connection-string", type=str, required=True, help="Blob Connection String"
)
parser.add_argument(
    "--blob-container-name", type=str, required=True, help="Blob Container Name"
)

args = parser.parse_args()

service_endpoint = args.search_service_endpoint or os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = args.search_index_name or os.getenv("AZURE_SEARCH_INDEX_NAME")
key = args.search_admin_key or os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = args.cognitive_services_endpoint or os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = args.cognitive_services_api_key or os.getenv("COGNITIVE_SERVICES_API_KEY")
customSkill_endpoint = args.custom_skill_endpoint or os.getenv("FUNCTION_CUSTOM_SKILL_ENDPOINT")
blob_connection_string = args.blob_connection_string or os.getenv("BLOB_CONNECTION_STRING")
container_name = args.blob_container_name or os.getenv("BLOB_CONTAINER_NAME")

# Connect to Blob Storage
blob_service_client = BlobServiceClient.from_connection_string(blob_connection_string)
container_client = blob_service_client.get_container_client(container_name)
blobs = container_client.list_blobs()

first_blob = next(blobs)
blob_url = container_client.get_blob_client(first_blob).url
print(f"URL of the first blob: {blob_url}")

# Create a search index
"""
In Azure Cognitive Search, the key=True attribute in the fields is used as the unique identifier for each document in the index. 
Once you set a field as the key, you cannot change its value for a particular document. 
Therefore, add the sid attribute for the ID from the database.
"""
# Initialize the SearchIndexClient
index_client = SearchIndexClient(
    endpoint=service_endpoint, credential=AzureKeyCredential(key)
)


# Define vector search configuration
vector_search = VectorSearch(
    profiles=[
        VectorSearchProfile(
            name="vector-profile",
            algorithm_configuration_name="hnsw-config"
        )
    ],
    algorithms=[
        HnswAlgorithmConfiguration(name="hnsw-config")
    ]
)

# Define the search index fields
fields = [
    SimpleField(
        name="id",
        type=SearchFieldDataType.String,
        key=True,
        sortable=True,
        filterable=True,
        facetable=True,
    ),
    SimpleField(
        name="sid",
        type=SearchFieldDataType.String,
        sortable=True,
        filterable=True,
        facetable=True,
    ),
    SimpleField(
        name="imgPath",
        type=SearchFieldDataType.String,
        filterable=True,
        retrievable=True,
    ),
    SearchableField(
        name="title", type=SearchFieldDataType.String, searchable=True, retrievable=True
    ),
    SearchField(
        name="imageVector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=1024,
        vector_search_profile_name="vector-profile",
    ),
]

# Create the search index
index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search)
result = index_client.create_or_update_index(index)
print(f" {result.name} created")

# Create a data source
indexer_client = SearchIndexerClient(service_endpoint, AzureKeyCredential(key))
data_source_connection = SearchIndexerDataSourceConnection(
    name=f"{index_name}-blob",
    type="azureblob",
    connection_string=blob_connection_string,
    container=SearchIndexerDataContainer(name=container_name),
)
data_source = indexer_client.create_or_update_data_source_connection(data_source_connection)

print(f"Data source '{data_source.name}' created or updated")

# Create a skillset
# WebSkill is a custom skill that is hosted in Azure Functions. > `backend\func\acs_skillset_for_indexer`
skillset_name = f"{index_name}-skillset"
skill_uri = f"{customSkill_endpoint}/api/GetImageEmbeddings"

# https://learn.microsoft.com/en-us/azure/search/search-howto-indexing-azure-blob-storage
skill = WebApiSkill(
    uri=skill_uri,
    inputs=[
        InputFieldMappingEntry(
            name="imgPath", source="/document/metadata_storage_path"
        ),
        InputFieldMappingEntry(
            name="recordId", source="/document/metadata_storage_name"
        ),
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
print(f" {skillset.name} created")

# Create an indexer
indexer_name = f"{index_name}-indexer"
indexer = SearchIndexer(
    name=indexer_name,
    description="Indexer to process images",
    skillset_name=skillset_name,
    target_index_name=index_name,
    data_source_name=data_source.name,
    field_mappings=[
        FieldMapping(
            source_field_name="metadata_storage_path", target_field_name="imgPath"
        ),
        FieldMapping(
            source_field_name="metadata_storage_name", target_field_name="title"
        ),
    ],
    output_field_mappings=[
        FieldMapping(
            source_field_name="/document/imageVector", target_field_name="imageVector"
        )
    ],
)

indexer_result = indexer_client.create_or_update_indexer(indexer)

# Run the indexer
indexer_client.run_indexer(indexer_name)
print(f" {indexer_name} created")
