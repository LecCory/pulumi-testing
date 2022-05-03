import * as web from "@pulumi/azure-native/web";
import { Output } from "@pulumi/pulumi";

//Build app service plan and deploy a function app to the account

export const newAppPlan = ({
  resourceGroup,
}: {
  resourceGroup: Output<string>;
}) => {
  const plan = new web.AppServicePlan("clwsp-", {
    resourceGroupName: resourceGroup,
    sku: { name: "Y1", tier: "Dynamic" },
  });
  return plan
};

export const functionApp = ({
  resourceGroup,
  plan,
  storageConnectionString,
  codeBlobUrl,
  dbAccount,
  masterKey,
  endpoint,
  mongoDB,
}: {
  resourceGroup: Output<string>;
  plan: Output<string>;
  storageConnectionString: Output<string>;
  codeBlobUrl: Output<string>;
  dbAccount: Output<string>;
  masterKey: Output<string>;
  endpoint: Output<string>;
  mongoDB: Output<string>;
}) => {
  new web.WebApp("clfa-", {
    resourceGroupName: resourceGroup,
    serverFarmId: plan,
    kind: "functionapp",
    siteConfig: {
      appSettings: [
        { name: "AzureWebJobsStorage", value: storageConnectionString },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
        { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
        { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~16" },
        { name: "WEBSITE_RUN_FROM_PACKAGE", value: codeBlobUrl },
        { name: "MONGODB_PROTOCOL", value: "mongodb" },
        { name: "MONGODB_USER", value: dbAccount },
        { name: "MONGODB_PASS", value: masterKey },
        { name: "MONGODB_URL", value: endpoint },
        { name: "MONGODB_DBNAME", value: mongoDB },
      ],
      http20Enabled: true,
      nodeVersion: "~16",
    },
  });
};
