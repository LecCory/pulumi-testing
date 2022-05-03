// Import component modules
import { resourceGroup } from "./infra/resourcegroup";
import * as cosmos from "./infra/cosmos";
import * as storage from "./infra/storage";
import * as webApp from "./infra/webApp";

/*
-- Resource Group section --
*/
const newResourceGroup = resourceGroup;

/*
-- DocumentDB Account and MongoDB section --
We export endpoint information here to be used with the function app
*/
const newDBAccount = cosmos.dbAccount;
const newMongoDB = cosmos.mongoDB;
const newEndPoint = cosmos.endpoint(newDBAccount);
const newKeySet = cosmos.keys(newResourceGroup.name, newDBAccount.name);
const newConnectionStringSet = cosmos.connectionStrings(
  newResourceGroup.name,
  newDBAccount.name
);
const primaryConnectionString = cosmos.connectionString(newConnectionStringSet);
const newMasterKey = cosmos.masterKey(newKeySet);

/*
-- Storage and Static Web Container section --
*/
const newStorageAccount = storage.newAzStorage;
const newStaticContainer = storage.newStorageContainer;

/*
-- WebApp and Function App section --
Container for function Apps API ss part of the same Storage account created previously 
We pass all the endpoint data from the Mongo creation step to create the env variable
Pulumi uploads the functions to the container as part of this step
*/
const newFunctionAppContainer = storage.codeContainer;
const uploadFunctions = storage.codeBlob;
const newStorageConnectionString = storage.storageConnString(
  newResourceGroup.name,
  newStorageAccount.name
);
const blobUrl = storage.codeBlobUrl(
  uploadFunctions,
  newFunctionAppContainer,
  newStorageAccount,
  newResourceGroup
);
const newWebApp = webApp.newAppPlan({ resourceGroup: resourceGroup.name });
const newFA = webApp.functionApp({
  resourceGroup: newResourceGroup.name,
  plan: newWebApp.id,
  codeBlobUrl: blobUrl,
  dbAccount: newDBAccount.name,
  endpoint: newEndPoint,
  masterKey: newMasterKey,
  mongoDB: newMongoDB.name,
  storageConnectionString: newStorageConnectionString,
});

//We export this to the pipeline so Azure DevOps can upload the UI data to the static webstorage
export const saAccount = newStorageAccount.name;
