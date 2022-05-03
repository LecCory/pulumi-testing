import * as pulumi from "@pulumi/pulumi";
import * as documentdb from "@pulumi/azure-native/documentdb";
import {resourceGroup} from "./resourcegroup"
import { Output } from "@pulumi/pulumi";

export const dbAccount = new documentdb.DatabaseAccount("cldba-", {
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
export const mongoDB = new documentdb.MongoDBResourceMongoDBDatabase("clmdb", {
    accountName: dbAccount.name,
    resource: { id: "clmdb" },
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
  });
  
export const keys =(rgName:Output<string>, dbName: Output<string>) => {return pulumi.all([rgName, dbName])
      .apply(([resourceGroupName, accountName]) =>
          documentdb.listDatabaseAccountKeys({ resourceGroupName, accountName }))};
  
export const connectionStrings = (rgName:Output<string>, dbName: Output<string>) => {
  return pulumi.all([rgName, dbName])
      .apply(([resourceGroupName, accountName]) =>
          documentdb.listDatabaseAccountConnectionStrings({ resourceGroupName, accountName }))};
  
export const connectionString = (conString:Output<documentdb.ListDatabaseAccountConnectionStringsResult> ) => {return conString.apply(cs => cs.connectionStrings![0].connectionString);}
  
export const endpoint =(dbAccount: documentdb.DatabaseAccount)=> {return dbAccount.documentEndpoint;}
  
export const masterKey =(keys: Output<documentdb.ListDatabaseAccountKeysResult>) => {return keys.primaryMasterKey;}