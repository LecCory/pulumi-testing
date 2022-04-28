
import { resources } from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

interface rgArgs {
    name: string
}

export default class NewResourceGroup extends pulumi.ComponentResource {
    constructor(name: string, args: rgArgs, opts?: pulumi.ComponentResourceOptions){
        super("resourcegroup", name, args, opts)
        const newrg = new resources.ResourceGroup(args.name);
    }
}