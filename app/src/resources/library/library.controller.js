const sql = require("../../db.js");
const libraryMiddleware = require("../library/library.middleware");
const path = require('path');
const fs = require("fs");

//Retorna toda la información de la librería
const getLibrary = async(req, res) =>{
    sql.query("SELECT library_families.id, library_component_types.id as component_type_id, type as component_type, library_component_brands.id as component_brand_id, brand as component_brand, library_component_disciplines.id as component_discipline_id, discipline as component_discipline, component_code, component_name, component_description FROM library_families JOIN library_component_types ON library_families.component_type_id = library_component_types.id JOIN library_component_brands ON library_families.component_brand_id = library_component_brands.id JOIN library_component_disciplines ON library_families.component_discipline_id = library_component_disciplines.id GROUP BY library_families.id ORDER BY library_families.id", (err, results) =>{
        if(!results[0]){
            console.log("No library")
            res.status(401)
        }else{
            for(let i = 0; i < results.length; i++){
                let path = './app/storage/library/images/' + results[i].component_code +".png";
                let rfa_path = './app/storage/library/rfa/' + results[i].component_code +".rfa";
                if (fs.existsSync(path)) {
                    results[i].image_path = "/images/" + results[i].component_code +".png"
                }else{
                    results[i].image_path = "/images/" + results[i].component_code +".jpg"
                }
                if (fs.existsSync(rfa_path)) {
                    results[i].rfa_path = "/rfa/" + results[i].component_code +".rfa"
                }else{
                    results[i].rfa_path = "/rfa/" + results[i].component_code +".zip"
                }
            }
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
        res.send({path: "/images/" + imageName +".png"}).status(200)
    }else{
        res.send({path: "/images/" + imageName +".jpg"}).status(200)
    }
}

//Retorna el archivo RFA de un componente en funcion del nombre
const getComponentRFA = async(req, res) =>{
    const rfaName = req.params.componentName
        
    let path = './app/storage/library/rfa/' + rfaName +".rfa";
    let zip_path = './app/storage/library/rfa/' + rfaName +".zip";
    if (fs.existsSync(path)) {
        var file = fs.createReadStream(path);
        file.pipe(res);
        res.status(200)
    }else if(fs.existsSync(zip_path)){
        var file = fs.createReadStream(zip_path);
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
    const componentName = req.body.componentName
    const componentDescription = req.body.componentDescription
    let componentCode = ""
    await sql.query("SELECT code FROM library_component_disciplines WHERE id = ?", [componentDisciplineId], async(err, results) =>{
        if(!results[0]){
            console.log("Discipline does not exist")
        }else{
            componentCode = results[0].code
            await sql.query("SELECT library_families.id FROM library_families JOIN library_component_disciplines ON library_families.component_discipline_id = library_component_disciplines.id WHERE library_component_disciplines.id = ? ORDER BY library_families.id DESC LIMIT 1", [componentDisciplineId], async(err, results) =>{
                if(!results[0]){
                    componentCode += "0001"
                }else{
                    let newID = (results[0].id + 1).toString()
                    let base = "0000"
                    componentCode += base.substring(0, 4-newID.length) + newID
                }
                await sql.query("INSERT INTO library_families(component_type_id, component_brand_id, component_discipline_id, component_code, component_name, component_description) VALUES(?,?,?,?,?,?)", [componentTypeId, componentBrandId, componentDisciplineId, componentCode, componentName, componentDescription], async(err, results) =>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }else{
                        res.send({success: true, filename: componentCode}).status(200)
                    }
                })
            })
        }
    })

}

const updateComponent = async(req, res) =>{
    const componentTypeId = req.body.componentTypeId
    const componentBrandId = req.body.componentBrandId
    const componentDisciplineId = req.body.componentDisciplineId
    const componentName = req.body.componentName
    const componentDescription = req.body.componentDescription
    const componentId = req.body.componentId

    sql.query("UPDATE library_families SET component_type_id = ?, component_brand_id = ?, component_discipline_id = ?, component_name = ?, component_description = ? WHERE id = ?", [componentTypeId, componentBrandId, componentDisciplineId, componentName, componentDescription, componentId], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
}

const deleteComponent = async(req, res) =>{
    const id = req.body.id
    sql.query("DELETE FROM library_families WHERE id = ?", [id], (err, results)=>{
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
        res.send({success:true}).status(200)
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
        res.send({success:true}).status(200)
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
    const componentCode = req.body.componentCode

    sql.query("INSERT INTO library_component_disciplines(discipline, code) VALUES(?,?)", [componentDiscipline, componentCode], (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.send({success: true}).status(200)
        }
    })
}

const updateFilters = async(req, res) =>{
    const types = req.body.component_types
    const disciplines = req.body.component_disciplines
    const brands = req.body.component_brands

    for (let i = 0; i < types.length; i++) {
        if(types[i].type && types[i].type != ""){
            if(types[i].id){
                sql.query("UPDATE library_component_types SET type = ? WHERE id = ?", [types[i].type, types[i].id], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }else{
                sql.query("INSERT INTO library_component_types(type) VALUES(?)", [types[i].type], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }        
    }

    for (let i = 0; i < disciplines.length; i++) {
        if(disciplines[i].discipline && disciplines[i].disciplines != "" && disciplines[i].code && disciplines[i].code != ""){
            if(disciplines[i].id){
                sql.query("UPDATE library_component_disciplines SET discipline = ?, code = ? WHERE id = ?", [disciplines[i].discipline, disciplines[i].code, disciplines[i].id], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }else{
                sql.query("INSERT INTO library_component_disciplines(discipline, code) VALUES(?,?)", [disciplines[i].discipline, disciplines[i].discipline], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }        
    }

    for (let i = 0; i < brands.length; i++) {
        if(brands[i].brand && brands[i].brand != ""){
            if(brands[i].id){
                sql.query("UPDATE library_component_brands SET brand = ? WHERE id = ?", [brands[i].brand, brands[i].id], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }else{
                sql.query("INSERT INTO library_component_brands(brand) VALUES(?)", [brands[i].brand], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }        
    }

    res.send({success: true}).status(200)
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
    updateComponent,
    deleteComponent,
    uploadComponentImage,
    uploadComponentRFA,
    addComponentType,
    addComponentBrand,
    addComponentDiscipline,
    updateFilters
  };