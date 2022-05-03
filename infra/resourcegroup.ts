import * as resources from "@pulumi/azure-native/resources";
import * as pulumi from "@pulumi/pulumi";

export const resourceGroup = new resources.ResourceGroup("clrg-");
