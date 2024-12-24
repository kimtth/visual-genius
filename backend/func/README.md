
### Azure Functions

#### 1. `backend\func\acs_skillset_indexer`

   Azure AI Search uses the indexer to load images from blob storage and create an index with vector data.

   The function is created for a web skill that consumes the Vision API for image embedding (vector).

   1. Deploy command (template)

      ```shell
      func azure functionapp publish <function app name> --build remote --python
      ```

   1. Environment variables
      
      Azure Portal > Funtion App > <function app name> > Application settings

   1. The Vision API consumes image URLs to generate embeddings.
   1. The Blob storage should allow public access in order to consume them via URL.

#### 2. `backend\func\batch_schedule_delete`

   The function will delete images that are not stored in the database, removing them from Azure AI Search and Blob storage to maintain data consistency. It will execute regularly, once a week.
