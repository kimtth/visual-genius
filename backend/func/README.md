
### Azure Functions Custom Skill

`backend\func\acs_skillset_for_indexer`

Azure Cognitive Search does not support direct loading from PostgreSQL. This function is not necessary for deployment.

The function is created for a web skill that consumes the Florence API for image embedding (vector).

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