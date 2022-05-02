// Import the required resource modules

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";
import { getConnectionString } from "./helpers";
import * as documentdb from "@pulumi/azure-native/documentdb";

// Build resource group referenced throughout the build
const resourceGroup = new resources.ResourceGroup("clrg-");

//Build DB Account and deploy a Mongo DB to the account
const dbAccount = new documentdb.DatabaseAccount("cldba-", {
  kind: "MongoDB",
  location: resourceGroup.location,
  databaseAccountOfferType: "Standard",
  locations: [
    {
      failoverPriority: 0,
      isZoneRedundant: false,
      locationName: resourceGroup.location,
    },
  ],
  resourceGroupName: resourceGroup.name,
});
const mongoDB = new documentdb.MongoDBResourceMongoDBDatabase("clmdb", {
  accountName: dbAccount.name,
  resource: { id: "clmdb" },
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
});

//Build Storage account, then deploy container to the account, extract key information for other resources
const newAzStorage = new storage.StorageAccount("clstorage", {
  resourceGroupName: resourceGroup.name,
  sku: { name: storage.SkuName.Standard_LRS },
  kind: storage.Kind.StorageV2,
  enableHttpsTrafficOnly: true,
});
const newStorageContainer = new storage.StorageAccountStaticWebsite("cl-site", {
  accountName: newAzStorage.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
});


// Export the primary key of the Storage Account
const storageAccountKeys = pulumi
  .all([resourceGroup.name, newAzStorage.name])
  .apply(([resourceGroupName, accountName]) =>
    storage.listStorageAccountKeys({ resourceGroupName, accountName })
  );

  // extract connection string by use of helper function
const storageConnectionString = getConnectionString(
  resourceGroup.name,
  newAzStorage.name
);

//Build app service plan and deploy a function app to the account
const plan = new web.AppServicePlan("clwsp-", {
  resourceGroupName: resourceGroup.name,
  sku: { name: "Y1", tier: "Dynamic" },
});
const app = new web.WebApp("clfa-", {
  resourceGroupName: resourceGroup.name,
  serverFarmId: plan.id,
  kind: "functionapp",
  siteConfig: {
    appSettings: [
      { name: "AzureWebJobsStorage", value: storageConnectionString },
      { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
      { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
      { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~16" },
      { name: "WEBSITE_RUN_FROM_PACKAGE", value: "1" },
    ],
    http20Enabled: true,
    nodeVersion: "~16",
  },
});

