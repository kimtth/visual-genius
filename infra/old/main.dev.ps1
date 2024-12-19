param($resourceGroup, $location)

# PS> .\main.dev.ps1 -resourceGroup v-genius -location eastus
az group create --name $resourceGroup --location $location
az deployment group create --resource-group $resourceGroup --template-file .\az_rsc.bicep --parameters .\parameter.dev.json

# To re-authenticate, please run:
# az login --scope https://management.core.windows.net//.default

# Delete the Resource group
# az group delete --name v-genius --yes --no-wait

# Purge the deleted Resource group
# az resource create --subscription {subscriptionID} -g {resourceGroup} -n {resourceName} --location {location} --namespace Microsoft.CognitiveServices --resource-type accounts --properties "{\"restore\": true}"
# az resource delete --ids /subscriptions/{subscriptionId}/providers/Microsoft.CognitiveServices/locations/{location}/resourceGroups/{resourceGroup}/deletedAccounts/{resourceName}
