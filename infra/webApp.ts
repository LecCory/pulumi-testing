import * as web from "@pulumi/azure-native/web";
import { Output } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

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
  return plan;
};

export const functionApp = ({
  resourceGroup,
  plan,
  storageConnectionString,
  codeBlobUrl,
  dbAccount,
  masterKey,
  port,
  mongoDB,
}: {
  resourceGroup: Output<string>;
  plan: Output<string>;
  storageConnectionString: Output<string>;
  codeBlobUrl: Output<string>;
  dbAccount: Output<string>;
  masterKey: Output<string>;
  port: string;
  mongoDB: Output<string>;
}) => {
  const newFa = new web.WebApp("clfa-", {
    resourceGroupName: resourceGroup,
    serverFarmId: plan,
    kind: "functionapp",

    siteConfig: {
      connectionStrings: [
        {
          name: "MONGODB_PROTOCAL",
          connectionString: "mongodb",
          type: "Custom",
        },
        { name: "MONGODB_USER", connectionString: dbAccount, type: "Custom" },
        { name: "MONGODB_PORT", connectionString: dbAccount, type: "Custom" },
        { name: "MONGODB_PASS", connectionString: masterKey, type: "Custom" },
        {
          name: "MONGODB_URL",
          connectionString: pulumi.interpolate`mongodb://${dbAccount}:${masterKey}@${dbAccount}.mongo.cosmos.azure.com:${port}?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@${dbAccount}@`,
          type: "Custom",
        },
        {
          name: "MONGODB_DBNAME",
          connectionString: mongoDB,
          type: "Custom",
        },
      ],
      appSettings: [
        { name: "AzureWebJobsStorage", value: storageConnectionString },
        { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
        { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
        { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~16" },
        { name: "WEBSITE_RUN_FROM_PACKAGE", value: codeBlobUrl },
      ],
      http20Enabled: true,
      nodeVersion: "~16",
    },
  });
   
  return newFa;
};

export const addSlotConfig = (
  rgName: Output<string>,
  appName: Output<string>
) => {
  const webSlot = new web.WebAppSlotConfigurationNames("clwap", {
    name: appName,
    resourceGroupName: rgName,
    connectionStringNames: [
      "MONGODB_PROTOCAL",
      "MONGODB_USER",
      "MONGODB_PORT",
      "MONGODB_PASS",
      "MONGODB_URL",
      "MONGODB_DBNAME",
    ],
  });
};
