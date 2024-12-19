param location string = resourceGroup().location
param prefix string
param pgdbName string
param pgsqlUserId string
@secure()
param pgsqlPwd string
@secure()
param appSecretString string // ex) ok_secret
param openAIModelVersion string = '2024-07-18' // https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
param searchServiceAPIVersion string = '2023-11-01' // az provider show --namespace Microsoft.Search --query "resourceTypes[?resourceType=='searchServices'].apiVersions[]" --output table

// Azure Cognitive Search
resource searchService 'Microsoft.Search/searchServices@2022-09-01' = {
  name: '${prefix}-acsearch-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'standard'
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    disableLocalAuth: false
    authOptions: {
      apiKeyOnly: {}
    }
  }
}

// Blob Storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${prefix}${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    dnsEndpointType: 'Standard'
    defaultToOAuthAuthentication: false
    allowCrossTenantReplication: false
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: []
      ipRules: []
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
    encryption: {
      requireInfrastructureEncryption: false
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    changeFeed: {
      enabled: false
    }
    restorePolicy: {
      enabled: false
    }
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 3
    }
    cors: {
      corsRules: []
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: true
      days: 1
    }
    isVersioningEnabled: false
  }
}

resource imgContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'img-container'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
  }
}

resource imgEmoji 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'img-emoji'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
  }
}

// Azure PostgreSQL
resource postgresqlServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${prefix}-pgsql'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    dataEncryption: {
      type: 'SystemManaged'
    }
    storage: {
      storageSizeGB: 128
      autoGrow: 'Disabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    version: '15'
    administratorLogin: pgsqlUserId
    administratorLoginPassword: pgsqlPwd
    availabilityZone: '1'
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {}
    highAvailability: {
      mode: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
      dayOfWeek: 0
      startHour: 0
      startMinute: 0
    }
    replicationRole: 'Primary'
  }
}
// Configure firewall rules for public access - @TODO
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgresqlServer
  name: 'AllowAllIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresqlServer
  name: pgdbName
  properties: {
    charset: 'utf8'
    collation: 'en_US.UTF8'
  }
}

// Cognitive Services (Image Vision, Speech to Text)
resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${prefix}-cog-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'CognitiveServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${prefix}-cog-${uniqueString(resourceGroup().id)}'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

resource bingSearchAccount 'Microsoft.Search/searchServices@2022-09-01' = {
  name: '${prefix}-bing-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'standard'
  }
  dependsOn: [
    cognitiveServices
  ]
}

// Azure OpenAI (ChatGPT and DALL-E): DALL-E is not available to deply by Bicep
resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${prefix}-oai-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${prefix}-oai-${uniqueString(resourceGroup().id)}'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

resource gpt4oMini 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: '${prefix}-gpt4o-mini'
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o-mini'
      version: openAIModelVersion
    }
    raiPolicyName: 'Microsoft.Default'
  }
  sku: {
    name: 'Standard'
    capacity: 40
  }
}

// Azure App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: '${prefix}-appsrvplan-${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    perSiteScaling: false
    elasticScaleEnabled: false
    maximumElasticWorkerCount: 1
    isSpot: false
    reserved: true
    isXenon: false
    hyperV: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
    zoneRedundant: false
  }
}

// Azure App Service (Webapp Python)
resource appService 'Microsoft.Web/sites@2021-02-01' = {
  name: '${prefix}-webapp-${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'AllAllowed'
      appSettings: [
        {
          name: 'AZURE_SEARCH_SERVICE_ENDPOINT'
          value: 'https://${searchService.name}.search.windows.net'
        }
        {
          name: 'AZURE_SEARCH_INDEX_NAME'
          value: 'vg-index'
        }
        {
          name: 'AZURE_SEARCH_ADMIN_KEY'
          value: listAdminKeys(searchService.name, searchServiceAPIVersion).primaryKey
        }
        {
          name: 'COGNITIVE_SERVICES_ENDPOINT'
          value: cognitiveServices.properties.endpoint
        }
        {
          name: 'COGNITIVE_SERVICES_API_KEY'
          value: cognitiveServices.listKeys().key1
        }
        {
          name: 'BLOB_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'BLOB_ACCOUNT_KEY'
          value: storageAccount.listKeys().keys[0].value
        }
        {
          name: 'BLOB_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'BLOB_CONTAINER_NAME'
          value: imgContainer.name
        }
        {
          name: 'BLOB_EMOJI_CONTAINER_NAME'
          value: imgEmoji.name
        }
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: openAI.properties.endpoint
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: openAI.listKeys().key1
        }
        {
          name: 'AZURE_OPENAI_MODEL_DEPLOYMENT_NAME'
          value: '${prefix}-gpt4o-mini'
        }
        {
          name: 'AZURE_OPENAI_IMG_MODEL_DEPLOYMENT_NAME' // DALL-E
          value: ''
        }
        {
          name: 'AZURE_OPENAI_API_VERSION_CHAT'
          value: openAI.apiVersion
        }
        {
          name: 'BING_IMAGE_SEARCH_KEY'
          value: listAdminKeys(bingSearchAccount.name, searchServiceAPIVersion).primaryKey
        }
        {
          name: 'POSTGRE_HOST'
          value: postgresqlServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'POSTGRE_USER'
          value: pgsqlUserId
        }
        {
          name: 'POSTGRE_PORT'
          value: '5432'
        }
        {
          name: 'POSTGRE_DATABASE'
          value: 'vgdb'
        }
        {
          name: 'POSTGRE_PASSWORD'
          value: pgsqlPwd
        }
        {
          name: 'APP_SECRET_STRING'
          value: appSecretString
        }
      ]
    }
  }
}

// Azure App Service (Function App Python)
resource functionApp 'Microsoft.Web/sites@2021-02-01' = {
  name: '${prefix}-func-${uniqueString(resourceGroup().id)}'
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'AllAllowed'
      appSettings: [
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'python'
        }
      ]
    }
  }
}

// Add outputs for necessary resources
output appServiceName string = appService.name
output functionAppName string = functionApp.name
output storageAccountName string = storageAccount.name
#disable-next-line outputs-should-not-contain-secrets
output azureSearchAdminKey string = listAdminKeys(searchService.name, searchServiceAPIVersion).primaryKey
output cognitiveServicesEndpoint string = cognitiveServices.properties.endpoint
#disable-next-line outputs-should-not-contain-secrets
output cognitiveServicesApiKey string = cognitiveServices.listKeys().key1
output searchServiceEndpoint string = 'https://${searchService.name}.search.windows.net'
#disable-next-line outputs-should-not-contain-secrets
output blobConnectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
output blobContainerName string = imgContainer.name
// output postgresqlServerName string = postgresqlServer.name
output postgresqlServerName string = postgresqlServer.properties.fullyQualifiedDomainName
output functionAppEndpoint string = 'https://${functionApp.name}.azurewebsites.net'
