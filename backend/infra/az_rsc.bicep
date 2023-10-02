param location string = resourceGroup().location
param prefix string
param pgsqlId string
@secure()
param pgsqlPwd string //'vgpgpwdpwd@123'

var uniqueStorageName = '${prefix}${uniqueString(resourceGroup().id)}'

// Azure Cognitive Search
resource searchService 'Microsoft.Search/searchServices@2022-09-01' = {
  name: '${prefix}-acsearch'
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
  name: uniqueStorageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    dnsEndpointType: 'Standard'
    defaultToOAuthAuthentication: false
    // publicNetworkAccess: 'Enabled'
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
    //publicAccess: 'Blob'
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
    //publicAccess: 'Blob'
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
    administratorLogin: pgsqlId
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

// Cognitive Services (Image Vision, Speech to Text)
resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${prefix}-cog'
  location: location
  kind: 'CognitiveServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${prefix}-cog'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

// Azure OpenAI (ChatGPT and DALL-E 2): DALL-E 2 is not required to deploy the model.
resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${prefix}-oai'
  location: location
  dependsOn: [
    cognitiveServices
  ]
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: '${prefix}-oai'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

resource oaiGPT35 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: '${prefix}-gpt35'
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-35-turbo'
      version: '0301'
    }
    raiPolicyName: 'Microsoft.Default'
  }
  sku: {
    name: 'Standard'
    capacity: 120
  }
}


// Azure App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: '${prefix}-appsrvplan'
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
    freeOfferExpirationTime: '2023-11-01T02:09:51.63'
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
  name: '${prefix}-webapp'
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
          value: 'https://?.search.windows.net'
        }
        {
          name: 'AZURE_SEARCH_INDEX_NAME'
          value: ''
        }
        {
          name: 'AZURE_SEARCH_ADMIN_KEY'
          value: ''
        }
        {
          name: 'COGNITIVE_SERVICES_ENDPOINT'
          value: 'https://?.cognitiveservices.azure.com'
        }
        {
          name: 'COGNITIVE_SERVICES_API_KEY'
          value: ''
        }
        {
          name: 'BLOB_CONNECTION_STRING'
          value: ''
        }
        {
          name: 'BLOB_CONTAINER_NAME'
          value: ''
        }
        {
          name: 'BLOB_EMOJI_CONTAINER_NAME'
          value: ''
        }
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: 'https://?.openai.azure.com/'
        }
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: ''
        }
        {
          name: 'AZURE_OPENAI_API_VERSION_IMG'
          value: '2023-06-01-preview'
        }
        {
          name: 'AZURE_OPENAI_API_VERSION_CHAT'
          value: '2023-07-01-preview'
        }
        {
          name: 'BING_IMAGE_SEARCH_KEY'
          value: ''
        }
        {
          name: 'POSTGRE_HOST'
          value: ''
        }
        {
          name: 'POSTGRE_USER'
          value: ''
        }
        {
          name: 'POSTGRE_PORT'
          value: '5432'
        }
        {
          name: 'POSTGRE_DATABASE'
          value: ''
        }
        {
          name: 'POSTGRE_PASSWORD'
          value: ''
        }
      ]
    }
  }
}

// Azure App Service (Function App Python)
resource functionApp 'Microsoft.Web/sites@2021-02-01' = {
  name: '${prefix}-func'
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
