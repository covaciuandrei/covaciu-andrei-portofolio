targetScope = 'subscription'

param resourceGroupName string
param staticWebAppName string
param location string
param environmentName string
param sessionId string
param createdAt string
param deployedBy string

var tags = {
  'app-onboard-skill': 'true'
  'app-onboard-session-id': sessionId
  'created-at': createdAt
  'deployed-by': deployedBy
  environment: environmentName
}

resource portfolioGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module portfolio './modules/static-web-app.bicep' = {
  name: '${staticWebAppName}-hosting'
  scope: portfolioGroup
  params: {
    name: staticWebAppName
    location: location
    tags: tags
  }
}

output staticWebAppId string = portfolio.outputs.resourceId
output defaultHostname string = portfolio.outputs.defaultHostname
