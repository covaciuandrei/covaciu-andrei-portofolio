param name string
param location string
param tags object

resource site 'Microsoft.Web/staticSites@2025-03-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  // Keep the app detached so Azure does not generate a competing GitHub workflow.
  properties: {}
}

output resourceId string = site.id
output defaultHostname string = site.properties.defaultHostname
