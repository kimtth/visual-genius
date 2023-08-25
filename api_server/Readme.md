

### Azure Functions Custom Skill

1. Deploy command (template)

   ```shell
   func azure functionapp publish <function app name> --build remote --python
   ```

1. Environment variables
   
   Azure Portal > Funtion App > <function app name> > Application settings
    
   ```shell
   COGNITIVE_SERVICES_ENDPOINT=
   COGNITIVE_SERVICES_API_KEY=
   ```
1. Florence Vision API for embedding consumes image URLs. The Blob storage should allow public access. 

### Application Environment variables

1. Environment variables

   ```shell
   AZURE_SEARCH_SERVICE_ENDPOINT=
   AZURE_SEARCH_INDEX_NAME=
   AZURE_SEARCH_ADMIN_KEY=
   COGNITIVE_SERVICES_ENDPOINT=
   COGNITIVE_SERVICES_API_KEY=
   FUNCTION_CUSTOM_SKILL_ENDPOINT=https://<function app name>.azurewebsites.net/api/getimageembeddings
   BLOB_CONNECTION_STRING=
   BLOB_CONTAINER_NAME=
   AZURE_OPENAI_ENDPOINT=
   AZURE_OPENAI_API_KEY=
   AZURE_OPENAI_API_VERSION_IMG=2023-??-??-preview
   AZURE_OPENAI_API_VERSION_CHAT=2023-??-??-preview
   ```