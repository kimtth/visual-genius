# Usage: Deploy Azure resources using Bicep template and parameter file
# cmd> powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -ResourceGroup "vg-res-grp" -Location "eastus"
# cmd> az group delete --name "vg-res-grp" --yes --no-wait

param (
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string]$Location,

    [Parameter(Mandatory = $false)]
    [string]$ParameterFile = "infra/parameter.json",

    [Parameter(Mandatory = $false)]
    [string]$TemplateFile = "infra/az_rsc.bicep",

    [Parameter(Mandatory = $false)]
    [string]$DeploymentName = "az_rsc_deployment"
)

# Get current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Joint the path
$LogFilePath = Join-Path -Path $scriptPath -ChildPath "deploy.log"

Start-Transcript -Path $LogFilePath

# Check if Python 3.11 is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed or not in PATH. Please install it."
    exit 1
}

# Check if Yarn is installed
if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
    Write-Error "Yarn is not installed or not in PATH. Please install it."
    exit 1
}

# Part 1: Deploy Azure resources using Bicep template and parameter file
Write-Host "Deploying Azure resources using Bicep template and parameter file."

# Check if az command is available
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI (az) is not installed or not in PATH. Please install it."
    exit 1
}

# Check if there is a valid Azure session
$azAccount = az account show 2>$null
if (-not $azAccount) {
    Write-Output "No valid Azure session found. Logging in..."
    az login
}

# Check if the resource group exists
$rgExists = az group exists --name $ResourceGroup

if ($rgExists -eq "true") {
    # Get the location of the existing resource group
    $Location = az group show --name $ResourceGroup --query location -o tsv
    Write-Host "Resource group '$ResourceGroup' exists in location '$Location'."
} else {
    # Create the resource group
    az group create --name $ResourceGroup --location $Location
    Write-Host "Resource group '$ResourceGroup' created in location '$Location'."
}

# Path to the parameter file
$ParameterFilePath = $ParameterFile

# Read parameters from parameter.json
$parameters = Get-Content -Path $ParameterFilePath | ConvertFrom-Json

# Deploy Azure resources using the Bicep template and parameter file
$deployment = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file $TemplateFile `
    --parameters @$ParameterFilePath `
    --name $DeploymentName `
    --output json | ConvertFrom-Json

$provisioningState = $deployment.properties.provisioningState

# Check if the provisioning state is 'Succeeded'
Write-Host "Deployment provisioning state: $provisioningState"

# Manually set the variables (replace these with actual values or logic to retrieve them)
$APP_SERVICE_NAME = $deployment.properties.outputs.appServiceName.value
$FUNC_APP_NAME = $deployment.properties.outputs.functionAppName.value
$FUNC_APP2_NAME = $deployment.properties.outputs.functionApp2Name.value
$STORAGE_ACCOUNT_NAME = $deployment.properties.outputs.storageAccountName.value
$AZURE_SEARCH_ADMIN_KEY = $deployment.properties.outputs.azureSearchAdminKey.value
$COGNITIVE_SERVICES_ENDPOINT = $deployment.properties.outputs.cognitiveServicesEndpoint.value
$COGNITIVE_SERVICES_API_KEY = $deployment.properties.outputs.cognitiveServicesApiKey.value
$AZURE_SEARCH_SERVICE_ENDPOINT = $deployment.properties.outputs.searchServiceEndpoint.value
$BLOB_CONNECTION_STRING = $deployment.properties.outputs.blobConnectionString.value
$BLOB_CONTAINER_NAME = $deployment.properties.outputs.blobContainerName.value
$POSTGRESQL_SERVER_NAME = $deployment.properties.outputs.pgServerName.value
$FUCNTION_APP_ENDPOINT = $deployment.properties.outputs.functionAppEndpoint.value
$AZUREOPENAI_ENDPOINT = $deployment.properties.outputs.azureOpenAIEndpoint.value
$AZUREOPENAI_MODEL_DEPLOYMENT_NAME = $deployment.properties.outputs.azureOpenAIModelDeploymentName.value
$AZUREOPENAI_API_KEY = $deployment.properties.outputs.azureOpenAIApiKey.value
$AZUREOPENAI_API_VERSION_CHAT = $deployment.properties.outputs.azureOpenAIApiVersionChat.value


# Print the parameters and values
Write-Debug "Resource Group: $ResourceGroup"
Write-Debug "Location: $Location"
Write-Debug "App Service Name: $APP_SERVICE_NAME"
Write-Debug "Function App Name: $FUNC_APP_NAME"
Write-Debug "Function App2 Name: $FUNC_APP2_NAME"
Write-Debug "Storage Account Name: $STORAGE_ACCOUNT_NAME"
Write-Debug "Azure Search Admin Key: $AZURE_SEARCH_ADMIN_KEY"
Write-Debug "Cognitive Services Endpoint: $COGNITIVE_SERVICES_ENDPOINT"
Write-Debug "Cognitive Services API Key: $COGNITIVE_SERVICES_API_KEY"
Write-Debug "Azure Search Service Endpoint: $AZURE_SEARCH_SERVICE_ENDPOINT"
Write-Debug "Blob Connection String: $BLOB_CONNECTION_STRING"
Write-Debug "Blob Container Name: $BLOB_CONTAINER_NAME"
Write-Debug "PostgreSQL Server Name: $POSTGRESQL_SERVER_NAME"
Write-Debug "Function App Endpoint: $FUCNTION_APP_ENDPOINT"
Write-Debug "Azure OpenAI Endpoint: $AZUREOPENAI_ENDPOINT"
Write-Debug "Azure OpenAI Model Deployment Name: $AZUREOPENAI_MODEL_DEPLOYMENT_NAME"
Write-Debug "Azure OpenAI API Key: $AZUREOPENAI_API_KEY"
Write-Debug "Azure OpenAI API Version Chat: $AZUREOPENAI_API_VERSION_CHAT"

If ($null -eq $AZUREOPENAI_ENDPOINT) {
    Write-Error "Azure OpenAI Endpoint is not available. Please check the deployment."
    exit 1
}

# Get subscription ID (optional)
# $SUBSCRIPTION_ID = az account show --query id -o tsv

# Part 2: Create SQL database, tables, dataset, and search index
Write-Host "Creating SQL database, tables, dataset, and search index."

# Upload image data to Azure Blob Storage
$BLOB_EMOJI_CONTAINER_NAME = "img-emoji"

az storage blob upload-batch `
    --destination $BLOB_CONTAINER_NAME `
    --account-name $STORAGE_ACCOUNT_NAME `
    --source dataset/data

az storage blob upload-batch `
    --destination $BLOB_EMOJI_CONTAINER_NAME `
    --account-name $STORAGE_ACCOUNT_NAME `
    --source dataset/emoji

# Create SQL database and tables
$DATABASE_NAME = $parameters.parameters.pgdbName.value
$PGSQL_USERID = $parameters.parameters.pgsqlUserId.value
$PGSQL_PWD_Plain = $parameters.parameters.pgsqlPwd.value
# $PGSQL_SERVER = az postgres flexible-server show --resource-group $ResourceGroup --name $POSTGRESQL_SERVER_NAME --query "fullyQualifiedDomainName" -o tsv
$PGSQL_SERVER = $parameters.parameters.postgresqlServerName.value

Write-Debug "PostgreSQL Server: $PGSQL_SERVER"
Write-Debug "Database Name: $DATABASE_NAME"
Write-Debug "PostgreSQL ID: $PGSQL_USERID"
Write-Debug "PostgreSQL Password: $PGSQL_PWD_Plain"

# Ensure psql is available
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql is not installed or not in PATH. Please install PostgreSQL client tools."
    exit 1
}

# Execute SQL script
psql "host=$PGSQL_SERVER dbname=$DATABASE_NAME user=$PGSQL_USERID password=$PGSQL_PWD_Plain" -f "infra/db_postgres.sql"

# Move to the backend directory
Set-Location -Path "backend"

if (-Not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Python virtual environment created."
} else {
    Write-Host "Python virtual environment already exists."
}

# Activate the virtual environment
& .\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
Write-Host "Python dependencies installed."

# Deploy Web Skill Azure function app under "backend\func\acs_skillset_for_indexer" folder
# Check if func command is available
if (-not (Get-Command func -ErrorAction SilentlyContinue)) {
    Write-Error "Azure Functions Core Tools (func) is not installed or not in PATH. Please install it."
    exit 1
}

Set-Location -Path "func\acs_skillset_indexer"

# Deploy Web Skill Azure function app under "backend\func\acs_skillset_indexer" folder
func azure functionapp publish $FUNC_APP_NAME --python

Set-Location -Path ".."
Set-Location -Path "batch_schedule_delete"

func azure functionapp publish $FUNC_APP2_NAME --python

# Set environment variables in Azure Function App
# az functionapp config appsettings set --name $FUNC_APP_NAME --resource-group $ResourceGroup `

Set-Location -Path "../.."

# Create Azure Cognitive Search Index
python util/acs_index_gen.py `
    --search-service-endpoint $AZURE_SEARCH_SERVICE_ENDPOINT `
    --search-index-name "vg-index" `
    --search-admin-key $AZURE_SEARCH_ADMIN_KEY `
    --cognitive-services-endpoint $COGNITIVE_SERVICES_ENDPOINT `
    --cognitive-services-api-key $COGNITIVE_SERVICES_API_KEY `
    --custom-skill-endpoint $FUCNTION_APP_ENDPOINT `
    --blob-connection-string $BLOB_CONNECTION_STRING `
    --blob-container-name $BLOB_CONTAINER_NAME

# Deactivate the virtual environment
deactivate

# Part 3: Deploy the application code to Azure App Service
Write-Host "Deploying the application code to Azure App Service."

# Build Next.js application
Set-Location -Path ".."
# Yarn can sometimes handle dependency conflicts better than npm.
yarn install
yarn build
Write-Host "Next.js application built."

# Zip the application files
Set-Location -Path "backend"

# Exclude _pycache_, .idea, .vscode, module, util, venv, func folders when making a zip file
# Define the exclusion patterns
$excludePatterns = @(
    '__pycache__',
    '.idea',
    '.vscode',
    'util',
    'venv',
    'func',
    '.env',
    '.db'
)

# Get all files and directories recursively
$filesToZip = Get-ChildItem -Path ".\*" -Recurse | Where-Object {
    $item = $_
    -not ($excludePatterns | Where-Object { $item.FullName -match $_ })
}

# Console output $fileToZip
$filesToZip | ForEach-Object { Write-Host $_.FullName }

# Create zip file
$zipPath = "app.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath
}

# Create a temporary directory
$tempDir = New-Item -ItemType Directory -Path "$env:TEMP\tempZip"

# Copy files to temporary directory excluding patterns
Get-ChildItem -Path .\* -Recurse | Where-Object {
    $item = $_
    -not ($excludePatterns | Where-Object { $item.FullName -match $_ })
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destination = Join-Path $tempDir $relativePath
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $destination -Force | Out-Null
    } else {
        Copy-Item $_.FullName -Destination $destination -Force
    }
}

# Compress the temporary directory
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath

# Remove temporary directory
Remove-Item $tempDir -Recurse -Force
Write-Host "Application files zipped."

# Deploy application code to Azure App Service
# !important: To deploy the application code to Azure App Service using the zip file, 
# you should enable "SCM Basic Auth Publishing Credentials" by setting it to On 
# under "Azure > WebApp > Settings > Configuration > Platform settings".
# Recommend to use Azure Extension in VS Code to deploy the code to Azure App Service.
<# 
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $APP_SERVICE_NAME `
    --src "app.zip"
Write-Host "Application deployed to Azure App Service." 
#>

# Set up the startup command
az webapp config set `
    --resource-group $ResourceGroup `
    --name $APP_SERVICE_NAME `
    --startup-file "python app.py"
Write-Host "Startup command configured."

Stop-Transcript

# Create .env file with the following environment variables
# Replace the values with the actual values or secrets

$envFilePath = Join-Path -Path $scriptPath -ChildPath "_dev.env"

@"
AZURE_SEARCH_SERVICE_ENDPOINT=$AZURE_SEARCH_SERVICE_ENDPOINT
AZURE_SEARCH_INDEX_NAME=vg-index
AZURE_SEARCH_ADMIN_KEY=$AZURE_SEARCH_ADMIN_KEY
COGNITIVE_SERVICES_ENDPOINT=$COGNITIVE_SERVICES_ENDPOINT
COGNITIVE_SERVICES_API_KEY=$COGNITIVE_SERVICES_API_KEY
COGNITIVE_SERVICES_API_VERSION=2024-02-01
COGNITIVE_SERVICES_MODEL_VERSION=2023-04-15
FUNCTION_CUSTOM_SKILL_ENDPOINT=$FUCNTION_APP_ENDPOINT
BLOB_CONNECTION_STRING=$BLOB_CONNECTION_STRING
BLOB_ACCOUNT_KEY=$($BLOB_CONNECTION_STRING.Split(';')[-1].Split('=')[-1])
BLOB_ACCOUNT_NAME=$STORAGE_ACCOUNT_NAME
BLOB_CONTAINER_NAME=$BLOB_CONTAINER_NAME
BLOB_EMOJI_CONTAINER_NAME=$BLOB_EMOJI_CONTAINER_NAME
AZURE_OPENAI_ENDPOINT=$AZUREOPENAI_ENDPOINT
AZURE_OPENAI_API_KEY=$AZUREOPENAI_API_KEY
AZURE_OPENAI_MODEL_DEPLOYMENT_NAME=$AZUREOPENAI_MODEL_DEPLOYMENT_NAME
AZURE_OPENAI_IMG_MODEL_DEPLOYMENT_NAME=dall-e-3
AZURE_OPENAI_API_VERSION_CHAT=$AZUREOPENAI_API_VERSION_CHAT
BING_IMAGE_SEARCH_KEY=
SPEECH_SUBSCRIPTION_KEY=$COGNITIVE_SERVICES_API_KEY
SPEECH_REGION=$Location
POSTGRE_HOST=$POSTGRESQL_SERVER_NAME
POSTGRE_USER=$PGSQL_USERID
POSTGRE_PORT=5432
POSTGRE_DATABASE=$DATABASE_NAME
POSTGRE_PASSWORD=$PGSQL_PWD_Plain
ENV_TYPE=prod
APP_SECRET_STRING=
"@ | Out-File -FilePath $envFilePath -Encoding utf8 -Force

