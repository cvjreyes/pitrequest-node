const sql = require("../../db.js");
const libraryMiddleware = require("../library/library.middleware");
const path = require('path');
const fs = require("fs");

//Retorna toda la información de la librería
const getLibrary = async(req, res) =>{
    sql.query("SELECT library_families.id, type as component_type, brand as component_brand, discipline as component_discipline, component_code, component_name, component_description FROM library_families JOIN library_component_types ON library_families.component_type_id = library_component_types.id JOIN library_component_brands ON library_families.component_brand_id = library_component_brands.id JOIN library_component_disciplines ON library_families.component_discipline_id = library_component_disciplines.id", (err, results) =>{
        if(!results[0]){
            console.log("No library")
            res.status(401)
        }else{
            res.json({library: results}).status(200)
        }
    })
}

//Retorna los tipos de componentes
const getComponentTypes = async(req, res) =>{
    sql.query("SELECT * FROM library_component_types", (err, results) =>{
        if(!results[0]){
            console.log("No component types")
            res.status(401)
        }else{
            res.json({component_types: results}).status(200)
        }
    })
}

//Retorna las marcas
const getComponentBrands = async(req, res) =>{
    sql.query("SELECT * FROM library_component_brands", (err, results) =>{
        if(!results[0]){
            console.log("No component brands")
            res.status(401)
        }else{
            res.json({component_brands: results}).status(200)
        }
    })
}

//Retorna las disciplinas
const getComponentDisciplines = async(req, res) =>{
    sql.query("SELECT * FROM library_component_disciplines", (err, results) =>{
        if(!results[0]){
            console.log("No component disciplines")
            res.status(401)
        }else{
            res.json({component_disciplines: results}).status(200)
        }
    })
}

//Retorna los codigos de los componentes
const getComponentCodes = async(req, res) =>{
    sql.query("SELECT component_code FROM library_families", (err, results) =>{
        if(!results[0]){
            console.log("No component codes")
            res.status(401)
        }else{
            res.json({component_codes: results}).status(200)
        }
    })
}

//Retorna los nombres de los componentes
const getComponentNames = async(req, res) =>{
    sql.query("SELECT component_name FROM library_families", (err, results) =>{
        if(!results[0]){
            console.log("No component types")
            res.status(401)
        }else{
            res.json({component_names: results}).status(200)
        }
    })
}

//Retorna la imagen de un componente en funcion del nombre
const getComponentImage = async(req, res) =>{
    const imageName = req.params.componentName
        
    let path = './app/storage/library/images/' + imageName +".png";
    if (fs.existsSync(path)) {
        var file = fs.createReadStream(path);
        file.pipe(res);
    }else{
        path = './app/storage/library/images/' + imageName +".jpg";
        if (fs.existsSync(path)) {
            var file = fs.createReadStream(path);
            file.pipe(res);
            res.status(200)
        }else{
            console.log("Component file does not exist")
            res.status(401)
        }
    }
    
}

//Retorna el archivo RFA de un componente en funcion del nombre
const getComponentRFA = async(req, res) =>{
    const rfaName = req.params.componentName
        
    let path = './app/storage/library/rfa/' + rfaName +".rfa";
    if (fs.existsSync(path)) {
        var file = fs.createReadStream(path);
        file.pipe(res);
        res.status(200)
    }else{
        console.log("Component RFA does not exist")
        res.status(401)
    }
    
}

//Crea un componente nuevo
const createComponent = async(req, res) =>{
    const componentTypeId = req.body.componentTypeId
    const componentBrandId = req.body.componentBrandId
    const componentDisciplineId = req.body.componentDisciplineId
    const componentCode = "abc"
    const componentName = req.body.componentName
    const componentDescription = req.body.componentDescription

    sql.query("INSERT INTO library_families(component_type_id, component_brand_id, component_discipline_id, component_code, component_name, component_description) VALUES(?,?,?,?,?,?)", [componentTypeId, componentBrandId, componentDisciplineId, componentCode, componentName, componentDescription], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
    
}

//Upload de una imagen de un componente (desde el front llamalo file)
const uploadComponentImage = async(req, res) =>{
    try{   
        await libraryMiddleware.uploadImageMiddleware(req, res);
        res.status(200)
    }catch(err){
        res.json({
            error: true,
          }).status(401);
    }
}

//Upload del archivo RFA de un componente (desde el front llamalo file)
const uploadComponentRFA = async(req, res) =>{
    try{   
        await libraryMiddleware.uploadRFAMiddleware(req, res);
        res.status(200)
    }catch(err){
        res.json({
            error: true,
          }).status(401);
    }
}

//Crea un nuevo tipo de componente
const addComponentType = async(req, res) =>{
    const componentType = req.body.componentType

    sql.query("INSERT INTO library_component_types(type) VALUES(?)", [componentType], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
}

//Crea una nueva marca de componente
const addComponentBrand = async(req, res) =>{
    const componentBrand = req.body.componentBrand

    sql.query("INSERT INTO library_component_brands(brand) VALUES(?)", [componentBrand], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
}

//Crea una nueva disciplina
const addComponentDiscipline = async(req, res) =>{
    const componentDiscipline = req.body.componentDiscipline

    sql.query("INSERT INTO library_component_disciplines(discipline) VALUES(?)", [componentDiscipline], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
}

module.exports = {
    getLibrary,
    getComponentTypes,
    getComponentBrands,
    getComponentCodes,
    getComponentDisciplines,
    getComponentNames,
    getComponentImage,
    getComponentRFA,
    createComponent,
    uploadComponentImage,
    uploadComponentRFA,
    addComponentType,
    addComponentBrand,
    addComponentDiscipline
  };