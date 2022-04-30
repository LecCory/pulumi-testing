// Import the resources

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage"




// Build
const resourceGroup = new resources.ResourceGroup("clrg-");
const newAzStorage = new storage.StorageAccount("clstorage", {resourceGroupName: resourceGroup.name, sku:{name:storage.SkuName.Standard_LRS},kind: storage.Kind.StorageV2, enableHttpsTrafficOnly: true})
const newStorageContainer = new storage.StorageAccountStaticWebsite("cl-site",{accountName: newAzStorage.name, resourceGroupName: resourceGroup.name, indexDocument: "index.html"})

//Export data
export const newSa = newAzStorage.primaryEndpoints
export const staticSite = newStorageContainer.containerName






