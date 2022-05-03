//Build Storage account, then deploy container to the account, extract key information for other resources
import { resourceGroup } from "./resourcegroup";
import * as storage from "@pulumi/azure-native/storage";
import * as pulumi from "@pulumi/pulumi";
import { getConnectionString, signedBlobReadUrl } from "../helpers";
import { Output } from "@pulumi/pulumi";

export const newAzStorage = new storage.StorageAccount("clstorage", {
  resourceGroupName: resourceGroup.name,
  sku: { name: storage.SkuName.Standard_LRS },
  kind: storage.Kind.StorageV2,
  enableHttpsTrafficOnly: true,
});
export const newStorageContainer = new storage.StorageAccountStaticWebsite(
  "cl-site",
  {
    accountName: newAzStorage.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html",
  }
);

// Function code archives will be stored in this container.
export const codeContainer = new storage.BlobContainer("zips", {
  resourceGroupName: resourceGroup.name,
  accountName: newAzStorage.name,
});

// Upload Azure Functions code as a zip archive to the storage account.
export const codeBlob = new storage.Blob("zip", {
  resourceGroupName: resourceGroup.name,
  accountName: newAzStorage.name,
  containerName: codeContainer.name,
  source: new pulumi.asset.FileArchive("./api/"),
});

// extract connection string by use of helper function

export const storageConnString = (
  resourceGroup: Output<string>,
  storageName: Output<string>
) => {
  return getConnectionString(resourceGroup, storageName);
};

export const codeBlobUrl = (
  codeBlob: storage.Blob,
  codeContainer: storage.BlobContainer,
  newAzStorage: storage.StorageAccount,
  resourceGroup: any
) => {
  return signedBlobReadUrl(
    codeBlob,
    codeContainer,
    newAzStorage,
    resourceGroup
  );
};
