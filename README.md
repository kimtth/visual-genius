
# Visual Genius: Communication Assistant

Most children with autism spectrum disorders (ASD) are visual learners. They tend to comprehend visual information better than auditory input, making visual supports more effective for their learning process.

The project was initiated due to the laborious creation of a visual card and a market demand for a better, cost-effective product. The aim is also to democratize AI, making it accessible to all and overcoming previous product limitations with the help of new technologies.

- Visual aids product in the market: [Bing Search Results](https://www.bing.com/images/search?q=ASD+for+visual+aids) / Can be quite costly [Amazon Search Result](https://www.amazon.com/Special-Communication-Speech-Verbal-Children/dp/B08CFNDHYY)
- Applied behavior analysis (ABA) is a therapeutic approach for treating ASD. 
- Visual aids in applied behavior analysis (ABA) [URL](https://centerforautism.com/)

> **Important:** The code in this repository was developed during a hackathon and implemented within a limited timeline. It is intended for demonstration purposes only.

## Key Features

1. Switching between personas and modes of generation (List, Steps, Manual / Parents and Caregivers, Childs)
1. Visual Card generation and management (Set the order of images by Drag and Drop)
1. Vector Image search
1. Video generation from images (To teach work procedures)
1. Text-to-Image

## Application Preview

https://github.com/kimtth/visual-genius/assets/13846660/7a39a3ba-32e7-4742-aea6-c288df2bc766

1. Vector-based image search: Azure Cognitive Search & Computer Vision API for Vector embedding
1. Text-to-image generation: Azure OpenAI GPT-3.5 & Image Generation by Azure OpenAI Dall-E
   > Due to the Generation speed issue, only the last image will be generated by Dall-E.
1. Bing Image Search
1. Fluent emoji dataset
1. Azure Cognitive Services Speech to Text (Read the text on the card)
1. [Optional] Microsoft Coco dataset (Everyday Life Images)
   > The test dataset for Vector Image Search. Vector search seeks images based on their features, not by the associated metadata tags or the image file name.

## Configuration

#### Deploy to Azure

1. Set parameters under `infra\parameter.json`
2. Execute `deploy.ps1` to upload the dataset, deploy Azure resources, initialize the database, and set up the search index.
3. Create a DALL·E model on the Azure Portal and set the deployment model name in `Azure > WebApp > Environment variables > 'AZURE_OPENAI_IMG_MODEL_DEPLOYMENT_NAME'`. When attempting to deploy the model using Bicep, it was not possible to deploy at that time.
4. Open the `backend` directory. Deploy the application code to Azure App Service: It is recommended to use the `Azure Extension` in VS Code to deploy the code to Azure App Service. You can follow the [Quickstart: Deploy a Python app](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python), or use `az webapp deployment source config-zip` to deploy if you have SCM Basic Auth credentials available.

- The Deployment step using Azure CLI is commented out in `deploy.ps1`.

   ```powershell
   <# 
   az webapp deployment source config-zip `
      --resource-group $ResourceGroup `
      --name $APP_SERVICE_NAME `
      --src "app.zip"
   Write-Host "Application deployed to Azure App Service." 
   #>
   ```

- Note: Please ensure you have installed <code><a href="https://nodejs.org/en/download/">nodejs</a></code>, <code><a href="https://classic.yarnpkg.com/en/docs/install">yarn</a></code>, <code><a href="https://learn.microsoft.com/en-us/cli/azure/install-azure-cli">Azure CLI</a></code>, <code><a href="https://github.com/Azure/azure-functions-core-tools">Azure Functions Core Tools</a></code>, <code><a href="https://www.postgresql.org/download/">psql</a></code>, and  <code><a href="https://www.python.org/downloads/">python3</a></code>.

   ```powershell
   # Install Chocolatey
   Set-ExecutionPolicy Bypass -Scope Process -Force; `
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
   iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

   # Install Node.js
   choco install nodejs -y

   # Install Yarn
   choco install yarn -y

   # Install Azure CLI
   choco install azure-cli -y

   # Install Azure Functions Core Tools
   choco install azure-functions-core-tools -y

   # Install PostgreSQL
   choco install postgresql -y

   # Install Python 3.11
   choco install python --version=3.11.0 -y
   ```

#### To dev:

1. Open project folder in <a href="https://code.visualstudio.com/download">Visual Studio Code</a>
2. Rename `.env.template` to `.env`, then fill in the values in `.env`.
3. In the terminal, run `yarn install`.
4. Run `yarn run dev` to view the project in a browser.
5. Run `python app.py` to launch the backend.

!important: `react-beautiful-dnd` was not able to work well with `reactStrictMode: true` in NextJs.
Turn off the option at `next.config.js`.`


