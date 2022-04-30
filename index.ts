// Import the resources

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage"




// Build
const resourceGroup = new resources.ResourceGroup("resourceGroup");
const newAzStorage = new storage.StorageAccount("clstorage", {resourceGroupName: resourceGroup.name, sku:{name:storage.SkuName.Standard_LRS}, kind: storage.Kind.StorageV2, enableHttpsTrafficOnly: true})


//Export data
export const newSa = newAzStorage






