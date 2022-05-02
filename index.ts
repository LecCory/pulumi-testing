// Import the required resource modules

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";
import { getConnectionString, signedBlobReadUrl } from "./helpers";
import * as documentdb from "@pulumi/azure-native/documentdb";
import { listDatabaseAccountConnectionStrings } from "@pulumi/azure-native/documentdb";

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

const keys = pulumi.all([resourceGroup.name, dbAccount.name])
    .apply(([resourceGroupName, accountName]) =>
        documentdb.listDatabaseAccountKeys({ resourceGroupName, accountName }));

const connectionStrings = pulumi.all([resourceGroup.name, dbAccount.name])
    .apply(([resourceGroupName, accountName]) =>
        documentdb.listDatabaseAccountConnectionStrings({ resourceGroupName, accountName }));

        export const connectionString = connectionStrings.apply(cs => cs.connectionStrings![0].connectionString);

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

// Function code archives will be stored in this container.
const codeContainer = new storage.BlobContainer("zips", {
  resourceGroupName: resourceGroup.name,
  accountName: newAzStorage.name,
});

// Upload Azure Functions code as a zip archive to the storage account.
const codeBlob = new storage.Blob("zip", {
  resourceGroupName: resourceGroup.name,
  accountName: newAzStorage.name,
  containerName: codeContainer.name,
  source: new pulumi.asset.FileArchive("./api"),
});

// extract connection string by use of helper function
const storageConnectionString = getConnectionString(
  resourceGroup.name,
  newAzStorage.name
);

const codeBlobUrl = signedBlobReadUrl(
  codeBlob,
  codeContainer,
  newAzStorage,
  resourceGroup
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
      { name: "WEBSITE_RUN_FROM_PACKAGE", value: codeBlobUrl },
      { name: "MONGODB_CONNECTION", value: connectionString, }
    ],
    http20Enabled: true,
    nodeVersion: "~16",
    
  },
});



export const saAccount = newAzStorage.name

export const endpoint = dbAccount.documentEndpoint;
export const masterKey = keys.primaryMasterKey;