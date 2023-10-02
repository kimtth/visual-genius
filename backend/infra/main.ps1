param($resourceGroup, $location)

# PS> .\main.ps1 -resourceGroup v-genius -location eastus
az group create --name $resourceGroup --location $location
az deployment group create --resource-group $resourceGroup --template-file .\az_rsc.bicep --parameters .\parameter.json

# To re-authenticate, please run:
# az login --scope https://management.core.windows.net//.default

# Delete the Resource group
# az group delete --name v-genius --yes --no-wait
```