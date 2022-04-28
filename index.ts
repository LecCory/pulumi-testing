// Import the resources
import AzStorageAcctBuilder from "./storage"
import * as resources from "@pulumi/azure-native/resources";

// Build
const resourceGroup = new resources.ResourceGroup("resourceGroup");
const newAZStorageAccount = new AzStorageAcctBuilder("clsa003", "StorageV2", "Standard_LRS", resourceGroup.name).buildSAAccount()


//Export data
export const newSa = newAZStorageAccount.sa.name
export const newRg = resourceGroup.name

console.log(newSa)



