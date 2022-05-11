//const data=require('./clfa-9a00b028.openapi.yaml')
const yaml=require('js-yaml')
const fs =require('fs')

const name = process.argv[2] || "newName";
console.log(name);
 (()=>{
   
    /* 
    Anonymous function loads the manually generated YAML config and changes the
    title, description and URL to the name of the FunctionApp
    */
    let x = yaml.load(fs.readFileSync('./clfa-9a00b028.openapi.yaml', 'utf8'))
    
     x.info.title = `${name}`
     x.info.description = `Import from ${name} Function App`
     x.servers[0].url = `https://${name}.azure-api.net`
     
   
    fs.writeFile(`swagger.json`, JSON.stringify(x), function(err){
        if(err) throw err
        console.log("complete")
    })
})()
