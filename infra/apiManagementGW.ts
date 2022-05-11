import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import { Output } from "@pulumi/pulumi";


// create the API management Gateway service
export const apiManagementService =(location: Output<string>, resourceGroup: Output<string>)=>{ 
    
    const apiMgmtGw = new azure_native.apimanagement.ApiManagementService("apiManagementService", {
    location: location,
    publisherEmail: "cory.leclair@gmail.com",
    publisherName: "Cory Leclair",
    resourceGroupName: resourceGroup,
    serviceName: "clapimgm0001",
    sku: {
        capacity: 0,
        name: "Consumption",
    },
    tags: {
        Name: "Contoso",
        Test: "User",
    },
}); return apiMgmtGw}


