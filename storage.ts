import * as pulumi from "@pulumi/pulumi";
import * as storage from "@pulumi/azure-native/storage";

interface saArgs {
    resourceGroupName: string,
    kind: string,
    sku: {
        name: string}
}

export default class AzStorageAcctBuilder {
    resourceName: string
    resourceKind:string
    resourceSkuName:string
    resourceGroupName: string
    
    constructor(resourceName: string, kind:string, skuName:string, rgName:any){
        this.resourceName = resourceName
        this.resourceKind = kind
        this.resourceSkuName = skuName
        this.resourceGroupName = rgName
        
    }
    
    private static StorageAcct = class extends pulumi.ComponentResource {
    
        sa: storage.StorageAccount
        constructor(name: string, args: saArgs, opts?: pulumi.ComponentResourceOptions){
            super("AzSAComponent",name, args, opts)
            this.sa = new storage.StorageAccount(name,{kind: args.kind, resourceGroupName: args.resourceGroupName, sku: args.sku},{parent:this})
        }
    }

   buildSAAccount = () =>{

        const newStorageAccount = new AzStorageAcctBuilder.StorageAcct(this.resourceName, {resourceGroupName: this.resourceGroupName,
            kind: this.resourceKind,
            sku: {
                name: this.resourceSkuName
            }})
        
        return newStorageAccount        
    }
}
