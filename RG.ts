import * as pulumi from '@pulumi/pulumi'
import * as resources from "@pulumi/azure-native/resources";

export const resourceGroup = new resources.ResourceGroup("resourceGroup");