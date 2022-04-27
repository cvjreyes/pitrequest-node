const sql = require("../../db.js");
const fs = require("fs");
const drawingMiddleware = require("../csptracker/csptracker.middleware");
var path = require('path')

const csptracker = (req, res) =>{
    sql.query("SELECT csptrackerfull_view.*, csptracker_description_plans.revision FROM csptrackerfull_view LEFT JOIN csptracker_description_plans ON csptrackerfull_view.description_plan_code = csptracker_description_plans.description_plan_code", (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const readye3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE csptracker SET ready_e3d = 1, ready_e3d_date = ? WHERE tag = ?", [currentDate, req.body.tag], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const cancelReadye3d = (req, res) =>{
    sql.query("UPDATE csptracker SET ready_e3d = 0, ready_e3d_date = ? WHERE tag = ?", [null, req.body.tag], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const uploadDrawing = async(req, res) =>{
    try{   
        await drawingMiddleware.uploadFileMiddleware(req, res);
        sql.query("SELECT * FROM csptracker_description_drawings WHERE filename = ?", req.file.filename, (err, results)=>{
            if(!results[0]){
                res.send({error: true}).status(401)
            }else{
                if (req.file == undefined) {
                    return res.status(400).send({ message: "Please upload a file!" });
                }

                    res.status(200).send({
                    message: "Uploaded the file successfully: " + req.file.originalname,
                });
            }
        })
    }catch(err){
        res.json({
            error: true,
          }).status(401);
    }
    
}

const uploadDrawingDB = (req, res) =>{
    const code = req.body.description_plan_code
    const fileName = req.body.filename


    sql.query("INSERT INTO csptracker_description_drawings(filename) VALUES(?)", fileName , (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            sql.query("SELECT id FROM csptracker_description_drawings WHERE filename = ?", fileName, (err, results)=>{
                if(!results){
                    console.log("No existe en drawings")
                }else{
                    const id = results[0].id
                    sql.query("UPDATE csptracker_description_plans SET description_drawings_id = ? WHERE description_plan_code = ?", [id, code], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }else{
                            sql.query("SELECT id FROM csptracker_description_plans WHERE description_plan_code = ?", code, (err, results)=>{
                                if(!results){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    const plane_id = results[0].id
                                    sql.query("UPDATE csptracker SET description_drawings_id = ? WHERE description_plans_id = ?", [id, plane_id], (err, results)=>{
                                        if(err){
                                            console.log(err)
                                            res.status(401)
                                        }else{
                                            res.send({success: 1}).status(200)
                                        }
                                    })
                                }
                            })
                            
                        }
                    })
                }
            })
        }
    })
}

const updateDrawing = async(req, res) =>{
    try{   
        await drawingMiddleware.updateFileMiddleware(req, res);
        sql.query("SELECT * FROM csptracker_description_drawings WHERE filename = ?", req.file.filename, (err, results)=>{
            if(!results[0]){
                res.send({error: true}).status(401)
            }else{
                if (req.file == undefined) {
                    return res.status(400).send({ message: "Please upload a file!" });
                }

                    res.status(200).send({
                    message: "Uploaded the file successfully: " + req.file.originalname,
                });
            }
        })
    }catch(err){
        res.json({
            error: true,
          }).status(401);
    }
}

const updateDrawingDB = async(req, res) =>{
    const description_plan_code = req.body.description_plan_code
    const fileName = req.body.fileName
    const email = req.body.email
    sql.query("SELECT id FROM csptracker_description_plans WHERE description_plan_code = ?", [description_plan_code], (err, results)=>{
        if(!results[0]){
            res.status(401)
        }else{
            const description_plans_id = results[0].id
            sql.query("UPDATE csptracker SET updated = 1, ready_e3d = 0 WHERE description_plans_id = ? AND ready_e3d = 1", [description_plans_id], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }else{
                    sql.query("UPDATE csptracker_description_plans SET revision = revision+1 WHERE id = ?", [description_plans_id], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }else{
                            console.log("Drawing updated in db")
                            sql.query("SELECT revision FROM csptracker_description_plans WHERE id = ?", [description_plans_id], (err, results)=>{
                                if(!results[0]){
                                    res.status(401)
                                }else{
                                    const revision = results[0].revision
                                    const extension = path.extname(fileName)
                                    const bakFileName = fileName.split('.').slice(0, -1) + "-" + revision + extension
                                    fs.copyFile('./app/storage/csptracker/drawings/'+ fileName, './app/storage/csptracker/drawings/bak/'+ bakFileName, (err) => {
                                        if (err) throw err;
                                        console.log('Created drawing backup');
                                      });

                                    sql.query("SELECT name FROM users WHERE email = ?", [email], (err, results)=>{
                                        let updater = null
                                        if(results[0]){
                                            updater = results[0].name
                                        }
                                        sql.query("SELECT model_id FROM model_has_roles WHERE role_id = 14", (err, results)=>{
                                            if(!results[0]){
                                                res.send({success: 1}).status(200)
                                            }else{
                                                const users_ids = results
                                                for(let i = 0; i < users_ids.length; i++){
                                                    sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [users_ids[i].model_id, "The drawing for the plan " + description_plan_code + " has been updated by " + updater + "."], (err, results)=>{
                                                        if(err){
                                                            console.log(err)
                                                            res.status(401)
                                                        }else{
                                                            
                                                        }
                                                    })
                                                }
                                                res.send({success: 1}).status(200)
                                            }
                                        })
                                    })
                                    
                                    
                                }
                            })
                            
                        }
                    })
                }
            })

        }
    })
}

const editCSP = async(req, res) =>{
    const email = req.body.user
    sql.query("SELECT user_id FROM csptracker_editing_csp", email, (err, results)=>{
        if(!results[0]){
            sql.query("SELECT id FROM users WHERE email = ?", email, (err, results)=>{
                if(!results[0]){
                    res.status(401)
                }else{
                    const user_id = results[0].id
                    sql.query("INSERT INTO csptracker_editing_csp(user_id) VALUES(?)", user_id, (err, results)=>{
                        if(err){
                            res.status(401)
                        }else{
                            res.send({success: 1})    
                        }
                    })
                }
            })
        }else{
            const editing_user_id = results[0].user_id
            sql.query("SELECT name FROM users WHERE id = ?", editing_user_id, (err, results)=>{
                if(!results[0]){
                    res.status(401)
                }else{
                    res.send({user: results[0].name}).status(200)
                }
            })
        }
    })
    
}

const exitEditCSP = async(req, res) =>{
    const email = req.body.user
    sql.query("SELECT id FROM users WHERE email = ?", email, (err, results)=>{
        if(!results){
            res.status(401)
        }else{
            const user_id = results[0].id
            sql.query("SELECT id FROM csptracker_editing_csp WHERE user_id = ?", user_id, (err, results)=>{
                if(err || !results[0]){               
                    res.send({success: 1}).status(200)
                }else{
                    sql.query("TRUNCATE csptracker_editing_csp", (err, results)=>{
                        if(err){
                            res.status(401)
                        }else{
                            res.send({success: 1}).status(200)
                        }
                    }) 
                }
            })
        }
    })
    
}

const getDrawing = async(req, res) =>{
    const fileName = req.params.fileName
    
    let path = './app/storage/csptracker/drawings/' + fileName;
    if (fs.existsSync(path)) {
        var file = fs.createReadStream(path);
        file.pipe(res);
    }else{
        console.log(fileName)
    }
    
}

const getListsData = async(req, res) =>{
    let descriptionPlaneData = []
    let diametersData = []
    let ratingData = []
    let specData = []
    let endPreparationData = []
    let boltTypesData = ["None"]
    let pidData = []
    let projectsData = []

    sql.query("SELECT description_plan_code FROM csptracker_description_plans", (err, results)=>{
        if(err){
            res.status(401)
        }else{
            for(let i = 0; i < results.length; i++){
                descriptionPlaneData.push(results[i].description_plan_code)
            }
            sql.query("SELECT nps, dn FROM diameters ORDER BY nps ASC", (err, results)=>{
                if(err){
                    res.status(401)
                }else{
                    if(process.env.NODE_MMDN === "0"){
                        for(let i = 0; i < results.length; i++){
                            diametersData.push(results[i].dn)
                        }
                    }else{
                        for(let i = 0; i < results.length; i++){
                            diametersData.push(results[i].nps)
                        }
                    }
                    sql.query("SELECT rating FROM csptracker_ratings", (err, results)=>{
                        if(err){
                            res.status(401)
                        }else{                          
                            for(let i = 0; i < results.length; i++){
                                ratingData.push(results[i].rating)
                            }
                            sql.query("SELECT spec FROM csptracker_specs", (err, results)=>{
                                if(err){
                                    res.status(401)
                                }else{                          
                                    for(let i = 0; i < results.length; i++){
                                        specData.push(results[i].spec)
                                    }
                                    sql.query("SELECT state FROM csptracker_end_preparations", (err, results)=>{
                                        if(err){
                                            res.status(401)
                                        }else{                          
                                            for(let i = 0; i < results.length; i++){
                                                endPreparationData.push(results[i].state)
                                            }
                                            sql.query("SELECT type FROM csptracker_bolt_types", (err, results)=>{
                                                if(err){
                                                    res.status(401)
                                                }else{                          
                                                    for(let i = 0; i < results.length; i++){
                                                        boltTypesData.push(results[i].type)
                                                    }
                                                    sql.query("SELECT pid FROM pids", (err, results)=>{
                                                        if(err){
                                                            res.status(401)
                                                        }else{                          
                                                            for(let i = 0; i < results.length; i++){
                                                                pidData.push(results[i].pid)
                                                            }
                                                            sql.query("SELECT name FROM projects", (err, results)=>{
                                                                if(err){
                                                                    res.status(401)
                                                                }else{     
                                                                    for(let i = 0; i < results.length; i++){
                                                                        projectsData.push(results[i].name)
                                                                    }
                                                                    res.json({
                                                                        descriptionPlaneData: descriptionPlaneData,
                                                                        diametersData: diametersData,
                                                                        ratingData: ratingData,
                                                                        specData: specData,
                                                                        endPreparationData: endPreparationData,
                                                                        boltTypesData: boltTypesData,
                                                                        pidData: pidData,
                                                                        projectsData: projectsData
                                                                    }).status(200)
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                    
                    
                }
            })
        }
    })
}

const submitCSP = async(req, res) =>{
    const rows = req.body.rows
    const email = req.body.email
    await sql.query("TRUNCATE csptracker_bak", (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            sql.query("INSERT INTO csptracker_bak SELECT * FROM csptracker", (err, results)=>{
                if(err){
                    console.log(err)
                }
            })

            for(let i = 0; i < rows.length; i++){  
                
                if(rows[i].tag == null || rows[i].tag == ""){
                    sql.query("DELETE FROM csptracker WHERE id = ?", [rows[i].id], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else{
                
                    if(rows[i].quantity == ''){
                        rows[i].quantity = null
                    }
                    if(rows[i].ready_e3d == ''){
                        rows[i].ready_e3d = null
                    }
                    if(rows[i].tag != "" && rows[i].tag != null){ 
                        let drawing_code = null
                        sql.query("SELECT id FROM csptracker_description_plans WHERE description_plan_code = ?", rows[i].description_plan_code, (err, results)=>{
                            if(!results){
                                results = []
                                results[0] = null
                            }
                            if(!results){
                                results[0] = null
                            }
                            if(!results[0] && rows[i].description_plan_code != null && rows[i].description_plan_code != ""){
                                sql.query("INSERT INTO csptracker_description_plans(description_plan_code) VALUES(?)", rows[i].description_plan_code, (err, results)=>{
                                    if(err){
                                        console.log(err)
                                        res.status(401)
                                    }
                                })
                            }
                            sql.query("SELECT id FROM csptracker_description_plans WHERE description_plan_code = ?", rows[i].description_plan_code, (err, results)=>{
                                if(!results){
                                    results = []
                                    results[0] = null
                                }
                                if(!results[0]){
                                    drawing_code = null
                                    rows[i].description_plan_code = null
                                }else{
                                    drawing_code = rows[i].description_plan_code
                                    rows[i].description_plan_code = results[0].id
                                }
                                
                                if(process.env.NODE_MMDN == "1"){
                                    sql.query("SELECT id FROM diameters WHERE nps = ?", rows[i].p1diameter_nps, (err, results)=>{
                                        if(!results){
                                            results = []
                                            results[0] = null
                                        }
                                        if(!results[0]){
                                            rows[i].p1diameter_nps = null
                                        }else{
                                            rows[i].p1diameter_nps = results[0].id 
                                        }
                                        sql.query("SELECT id FROM diameters WHERE nps = ?", rows[i].p2diameter_nps, (err, results)=>{
                                            if(!results){
                                                results = []
                                                results[0] = null
                                            }
                                            if(!results[0]){
                                                rows[i].p2diameter_nps = null
                                            }else{
                                                rows[i].p2diameter_nps = results[0].id
                                            } 
                                            sql.query("SELECT id FROM diameters WHERE nps = ?", rows[i].p3diameter_nps, (err, results)=>{
                                                if(!results){
                                                    results = []
                                                    results[0] = null
                                                }
                                                if(!results[0]){
                                                    rows[i].p3diameter_nps = null
                                                }else{
                                                    rows[i].p3diameter_nps = results[0].id 
                                                }
                                                sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", rows[i].rating, (err, results)=>{
                                                    if(!results){
                                                        results = []
                                                        results[0] = null
                                                    }
                                                    if(!results[0]){
                                                        rows[i].rating = null
                                                    }else{
                                                        rows[i].rating = results[0].id
                                                    }
                                                    sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", rows[i].spec, (err, results)=>{
                                                        if(!results){
                                                            results = []
                                                            results[0] = null
                                                        }
                                                        if(!results[0]){
                                                            rows[i].spec = null
                                                        }else{
                                                            rows[i].spec = results[0].id
                                                        }
                                                        sql.query("SELECT id FROM csptracker_end_preparations WHERE state = ?", rows[i].end_preparation, (err, results)=>{
                                                            if(!results){
                                                                results = []
                                                                results[0] = null
                                                            }
                                                            if(!results[0]){
                                                                rows[i].end_preparation = null
                                                            }else{
                                                                rows[i].end_preparation = results[0].id
                                                            }
                                                            sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", rows[i].bolt_type, (err, results)=>{
                                                                if(!results){
                                                                    results = []
                                                                    results[0] = null
                                                                }
                                                                if(!results[0]){
                                                                    rows[i].bolt_type = null
                                                                }else{
                                                                    rows[i].bolt_type = results[0].id
                                                                }
                                                                let description_drawings_id = 0
                                                                sql.query("SELECT description_drawings_id FROM csptracker_description_plans WHERE description_plan_code = ?", drawing_code, (err, results)=>{
                                                                    if(!results){
                                                                        results = []
                                                                        results[0] = null
                                                                    }
                                                                    if(!results[0]){
                                                                        description_drawings_id = null
                                                                    }else{
                                                                        description_drawings_id = results[0].description_drawings_id
                                                                    }
                                                                    let project_id = 0
                                                                    sql.query("SELECT id FROM projects WHERE name = ?", rows[i].project, (err, results)=>{
                                                                        if(!results){
                                                                            results = []
                                                                            results[0] = null
                                                                        }
                                                                        if(!results[0]){
                                                                            project_id = null
                                                                        }else{
                                                                            project_id = results[0].id
                                                                        }
                                                                        if(rows[i].id){
                                                                            
                                                                            sql.query("SELECT updated_at FROM csptracker WHERE id = ?", rows[i].id, (err, results)=>{
                                                                                const updated_at = results[0].updated_at
                                                                                sql.query("UPDATE csptracker SET tag = ?, project_id = ?, quantity = ?, description = ?, description_plans_id = ?, description_iso = ?, ident = ?, p1_diameters_id = ?, p2_diameters_id = ?, p3_diameters_id = ?, ratings_id = ?, specs_id = ?, type = ?, end_preparations_id = ?, description_drawings_id = ?, face_to_face = ?, bolt_types_id = ?, ready_e3d = ?, comments = ?, pid = ?, line_id = ?, requisition = ?, equipnozz = ?, utility_station = ? WHERE id = ?", [rows[i].tag, project_id, rows[i].quantity, rows[i].description, rows[i].description_plan_code, rows[i].description_iso, rows[i].ident, rows[i].p1diameter_nps, rows[i].p2diameter_nps, rows[i].p3diameter_nps, rows[i].rating, rows[i].spec, rows[i].type, rows[i].end_preparation, description_drawings_id,rows[i].face_to_face, rows[i].bolt_type, rows[i].ready_e3d, rows[i].comments, rows[i].pid, rows[i].line_id, rows[i].requisition, rows[i].equipnozz, rows[i].utility_station, rows[i].id], (err, results)=>{
                                                                                    if(err){
                                                                                        console.log(err)
                                                                                        res.status(401)
                                                                                    }else{
                                                                                        sql.query("SELECT updated_at FROM csptracker WHERE id = ?", [rows[i].id], (err, results)=>{
                                                                                            if(results[0].updated_at - updated_at != 0){
                                                                                                sql.query("UPDATE csptracker SET updated = 1, ready_e3d = 0 WHERE id = ?", [rows[i].id], (err, results)=>{
                                                                                                    if(err){
                                                                                                        console.log(err)
                                                                                                        res.status(401)
                                                                                                    }else{
                                                                                                        sql.query("SELECT name FROM users WHERE email = ?", [email], (err, results)=>{
                                                                                                            let updater = null
                                                                                                            if(results[0]){
                                                                                                                updater = results[0].name
                                                                                                            }
                                                                                                            sql.query("SELECT model_id FROM model_has_roles WHERE role_id = 14", (err, results)=>{
                                                                                                                if(!results[0]){
                                                                                                                    res.send({success: 1}).status(200)
                                                                                                                }else{
                                                                                                                    const users_ids = results
                                                                                                                    for(let j = 0; j < users_ids.length; j++){
                                                                                                                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [users_ids[j].model_id, "The SP " + rows[i].tag + " has been updated by " + updater + "."], (err, results)=>{
                                                                                                                            if(err){
                                                                                                                                console.log(err)
                                                                                                                                res.status(401)
                                                                                                                            }else{
                                                                                                                                
                                                                                                                            }
                                                                                                                        })
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            })
                                                                        }else{
                                                                            sql.query("INSERT INTO csptracker(tag, project_id, quantity, description, description_plans_id, description_iso, ident, p1_diameters_id, p2_diameters_id, p3_diameters_id, ratings_id, specs_id, type, end_preparations_id, description_drawings_id, face_to_face, bolt_types_id, ready_e3d, comments, pid, line_id, requisition, equipnozz, utility_station) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",  [rows[i].tag, project_id, rows[i].quantity, rows[i].description, rows[i].description_plan_code, rows[i].description_iso, rows[i].ident, rows[i].p1diameter_nps, rows[i].p2diameter_nps, rows[i].p3diameter_nps, rows[i].rating, rows[i].spec, rows[i].type, rows[i].end_preparation, description_drawings_id,rows[i].face_to_face, rows[i].bolt_type, rows[i].ready_e3d, rows[i].comments, rows[i].pid, rows[i].line_id, rows[i].requisition, rows[i].equipnozz, rows[i].utility_station, rows[i].id], (err, results)=>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }
                                                                    
                                                                    })
                                                                })
                                                                
                                                                                        
                                                            })
                                                                                
                                                        })
                                                                    
                                                    })
                                                                
                                                })
                                                        
                                            })
                                                
                                        })
                                        
                                    })
                                }else{
                                    sql.query("SELECT id FROM diameters WHERE dn = ?", rows[i].p1diameter_dn, (err, results)=>{
                                        if(!results){
                                            results = []
                                            results[0] = null
                                        }
                                        if(!results[0]){
                                            rows[i].p1diameter_dn = null
                                        }else{
                                            rows[i].p1diameter_dn = results[0].id 
                                        }
                                        sql.query("SELECT id FROM diameters WHERE dn = ?", rows[i].p2diameter_dn, (err, results)=>{
                                            if(!results){
                                                results = []
                                                results[0] = null
                                            }
                                            if(!results[0]){
                                                rows[i].p2diameter_dn = null
                                            }else{
                                                rows[i].p2diameter_dn = results[0].id
                                            } 
                                            sql.query("SELECT id FROM diameters WHERE dn = ?", rows[i].p3diameter_dn, (err, results)=>{
                                                if(!results){
                                                    results = []
                                                    results[0] = null
                                                }
                                                if(!results[0]){
                                                    rows[i].p3diameter_dn = null
                                                }else{
                                                    rows[i].p3diameter_dn = results[0].id 
                                                }
                                                sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", rows[i].rating, (err, results)=>{
                                                    if(!results){
                                                        results = []
                                                        results[0] = null
                                                    }
                                                    if(!results[0]){
                                                        rows[i].rating = null
                                                    }else{
                                                        rows[i].rating = results[0].id
                                                    }
                                                    sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", rows[i].spec, (err, results)=>{
                                                        if(!results){
                                                            results = []
                                                            results[0] = null
                                                        }
                                                        if(!results[0]){
                                                            rows[i].spec = null
                                                        }else{
                                                            rows[i].spec = results[0].id
                                                        }
                                                        sql.query("SELECT id FROM csptracker_end_preparations WHERE state = ?", rows[i].end_preparation, (err, results)=>{
                                                            if(!results){
                                                                results = []
                                                                results[0] = null
                                                            }
                                                            if(!results[0]){
                                                                rows[i].end_preparation = null
                                                            }else{
                                                                rows[i].end_preparation = results[0].id
                                                            }
                                                            sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", rows[i].bolt_type, (err, results)=>{
                                                                if(!results){
                                                                    results = []
                                                                    results[0] = null
                                                                }
                                                                if(!results[0]){
                                                                    rows[i].bolt_type = null
                                                                }else{
                                                                    rows[i].bolt_type = results[0].id
                                                                }
                                                                let description_drawings_id = 0
                                                                sql.query("SELECT description_drawings_id FROM csptracker_description_plans WHERE description_plan_code = ?", drawing_code, (err, results)=>{
                                                                    if(!results){
                                                                        results = []
                                                                        results[0] = null
                                                                    }
                                                                    if(!results[0]){
                                                                        description_drawings_id = null
                                                                    }else{
                                                                        description_drawings_id = results[0].description_drawings_id
                                                                    }
                                                                    let project_id = 0
                                                                    sql.query("SELECT id FROM projects WHERE name = ?", rows[i].project, (err, results)=>{
                                                                        if(!results){
                                                                            results = []
                                                                            results[0] = null
                                                                        }
                                                                        if(!results[0]){
                                                                            project_id = null
                                                                        }else{
                                                                            project_id = results[0].id
                                                                        }
                                                                        if(rows[i].id){
                                                                            sql.query("SELECT updated_at FROM csptracker WHERE id = ?", rows[i].id, (err, results)=>{
                                                                                const updated_at = results[0].updated_at
                                                                                sql.query("UPDATE csptracker SET tag = ?, project_id = ?, quantity = ?, description = ?, description_plans_id = ?, description_iso = ?, ident = ?, p1_diameters_id = ?, p2_diameters_id = ?, p3_diameters_id = ?, ratings_id = ?, specs_id = ?, type = ?, end_preparations_id = ?, description_drawings_id = ?, face_to_face = ?, bolt_types_id = ?, ready_e3d = ?, comments = ?, pid = ?, line_id = ?, requisition = ?, equipnozz = ?, utility_station = ? WHERE id = ?", [rows[i].tag, project_id, rows[i].quantity, rows[i].description, rows[i].description_plan_code, rows[i].description_iso, rows[i].ident, rows[i].p1diameter_dn, rows[i].p2diameter_dn, rows[i].p3diameter_dn, rows[i].rating, rows[i].spec, rows[i].type, rows[i].end_preparation, description_drawings_id,rows[i].face_to_face, rows[i].bolt_type, rows[i].ready_e3d, rows[i].comments, rows[i].pid, rows[i].line_id, rows[i].requisition, rows[i].equipnozz, rows[i].utility_station, rows[i].id], (err, results)=>{
                                                                                    if(err){
                                                                                        console.log(err)
                                                                                        res.status(401)
                                                                                    }else{
                                                                                        sql.query("SELECT updated_at FROM csptracker WHERE id = ?", [rows[i].id], (err, results)=>{
                                                                                            if(results[0].updated_at - updated_at != 0 && rows[i].ready_e3d == 1){
                                                                                                sql.query("UPDATE csptracker SET updated = 1, ready_e3d = 0 WHERE id = ?", [rows[i].id], (err, results)=>{
                                                                                                    if(err){
                                                                                                        console.log(err)
                                                                                                        res.status(401)
                                                                                                    }else{
                                                                                                        sql.query("SELECT name FROM users WHERE email = ?", [email], (err, results)=>{
                                                                                                            let updater = null
                                                                                                            if(results[0]){
                                                                                                                updater = results[0].name
                                                                                                            }
                                                                                                            sql.query("SELECT model_id FROM model_has_roles WHERE role_id = 14", (err, results)=>{
                                                                                                                if(!results[0]){
                                                                                                                    res.send({success: 1}).status(200)
                                                                                                                }else{
                                                                                                                    const users_ids = results
                                                                                                                    for(let j = 0; j < users_ids.length; j++){
                                                                                                                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [users_ids[j].model_id, "The SP " + rows[i].tag + " has been updated by " + updater + "."], (err, results)=>{
                                                                                                                            if(err){
                                                                                                                                console.log(err)
                                                                                                                                res.status(401)
                                                                                                                            }else{
                                                                                                                                
                                                                                                                            }
                                                                                                                        })
                                                                                                                    }
                                                                                                                }
                                                                                                            })
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            })
                                                                        }else{
                                                                            sql.query("INSERT INTO csptracker(tag, project_id, quantity, description, description_plans_id, description_iso, ident, p1_diameters_id, p2_diameters_id, p3_diameters_id, ratings_id, specs_id, type, end_preparations_id, description_drawings_id, face_to_face, bolt_types_id, ready_e3d, comments, pid, line_id, requisition, equipnozz, utility_station) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",  [rows[i].tag, project_id, rows[i].quantity, rows[i].description, rows[i].description_plan_code, rows[i].description_iso, rows[i].ident, rows[i].p1diameter_dn, rows[i].p2diameter_dn, rows[i].p3diameter_dn, rows[i].rating, rows[i].spec, rows[i].type, rows[i].end_preparation, description_drawings_id,rows[i].face_to_face, rows[i].bolt_type, rows[i].ready_e3d, rows[i].comments, rows[i].pid, rows[i].line_id, rows[i].requisition, rows[i].equipnozz, rows[i].utility_station, rows[i].id], (err, results)=>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                })
                                                                
                                                                                        
                                                            })
                                                                                
                                                        })
                                                                    
                                                    })
                                                                
                                                })
                                                        
                                            })
                                                
                                        })
                                        
                                    })
                                }
                                
                            })
    
                        })
                    }              
                
                
            }
        }

    }
})           

    res.send({success: 1}).status(200)
    
    
}

const update_ready_load = async(req, res) =>{
    sql.query("SELECT * FROM csptracker", (err, results)=>{
        if(!results[0]){
            res.status(401)
        }else{
            const csp_rows = results
            for(let i = 0; i < csp_rows.length; i++){
                if(csp_rows[i].ready_load == 1 && !csp_rows[i].ready_load_date){
                    let date = new Date()
                    sql.query("UPDATE csptracker SET ready_load_date = ? WHERE id = ?", [date, csp_rows[i].id], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else if(csp_rows[i].ready_load == 0 && csp_rows[i].ready_load_date){
                    sql.query("UPDATE csptracker SET ready_load_date = ? WHERE id = ?", [null, csp_rows[i].id], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            }
            res.status(200)
            
        }
        
    })
}

const tags = async(req, res) =>{
    sql.query("SELECT tag FROM csptrackerfull_view", (err, results)=>{
        if(!results[0]){
            res.send({none:1}).status(200)
        }else{
            let tags = []
            for(let i = 0; i < results.length; i++){
                tags.push(results[i].tag)
            }
            res.send({tags: tags}).status(200)
        }
    })
}

const requestSP = async(req, res) =>{
    const tag = req.body.tag
    const pid = req.body.pid
    const sptag = req.body.sptag
    const email = req.body.user
    const project = req.body.project
    console.log(project)
    sql.query("SELECT id FROM csptracker WHERE tag = ?", [sptag], (err, results)=>{
        if(typeof results === 'undefined' || !results[0]){
            let project_id = 0
            sql.query("SELECT id FROM projects WHERE name = ?", project, (err, results)=>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
                    project_id = 0
                }else{
                    project_id = results[0].id
                }
                sql.query("SELECT id FROM roles WHERE name = Materials)", (err, results1)=>{
                    const mat_id = 7
                    sql.query("SELECT DISTINCT model_id FROM model_has_roles WHERE role_id = ?", [mat_id], (err, results)=>{
                        if(!results[0]){
                            console.log("No users with materials role")
                            res.status(401)
                        }else{
                            const recievers = results
                            sql.query("SELECT id, name FROM users WHERE email = ?", [email],(err, results)=>{
                                const sender = results[0].id
                                const sender_name = results[0].name
                                for(let i = 0; i < recievers.length; i++){
                                    sql.query("INSERT INTO csptracker_requests(tag, pid, sptag, sent_user_id, rec_user_id, project_id) VALUES(?,?,?,?,?,?)", [tag, pid, sptag, sender, recievers[i].model_id, project_id], (err, results)=>{
                                        if(err){
                                            console.log(err)
                                            res.status(401)
                                        }else{
                                            sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [recievers[i].model_id, "New request for the SP " + sptag + " , " + project + ", by " + sender_name + "."], (err, results)=>{
                                                if(err){
                                                    console.log(err)
                                                    res.status(401)
                                                }else{
                                                    
                                                }
                                            })
                                        }
                                    })

                                }
                                console.log("Request sent")
                                res.send({success: 1}).status(200)

                            })
                        }
                    })

                })
            })

        }else{
            res.send({exists: 1}).status(200)
        }
    })
    
}

const csptrackerRequests = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
        const userid = results[0].id
        sql.query("SELECT csptracker_requests.*, projects.name FROM csptracker_requests LEFT JOIN projects ON csptracker_requests.project_id = projects.id WHERE rec_user_id = ? ORDER BY 1 DESC", [userid], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }else{
                res.send({rows: results}).status(200)
            }
        })
    })
    
}

const markAsRead = async(req, res) =>{
    const id = req.body.id
    const email = req.body.user
    sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
        const userid = results[0].id
        sql.query("UPDATE csptracker_requests SET `read` = 1 WHERE rec_user_id = ? AND id = ?", [userid, id], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }else{
                res.send({success: 1}).status(200)
            }
        })
    })
}

const markAsUnread = async(req, res) =>{
    const id = req.body.id
    const email = req.body.user
    sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
        const userid = results[0].id
        sql.query("UPDATE csptracker_requests SET `read` = 0 WHERE rec_user_id = ? AND id = ?", [userid, id], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }else{
                res.send({success: 1}).status(200)
            }
        })
    })  
}

const rejectRequest = async(req, res) =>{
    const id = req.body.id
    const email = req.body.email
    sql.query("SELECT * FROM csptracker_requests WHERE id = ? LIMIT 1", [id], (err, results)=>{
        const sent_user_id = results[0].sent_user_id
        const sptag = results[0].sptag
        if(!results[0]){
            res.status(401)
        }else{
            sql.query("SELECT name FROM users WHERE email = ?", [email], (err, results)=>{
                let rejector = null
                if(!results[0]){

                }else{
                    rejector = results[0].name
                }
                sql.query("UPDATE csptracker_requests SET `read` = 3 WHERE id = ?", [id], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }else{
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [sent_user_id, "The request for the SP " + sptag + " has been rejected by " + rejector + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                res.send({success: 1}).status(200)
                            }
                        })     
                    }
                }) 
            })           
        }
    })
    
}

const acceptRequest = async(req, res) =>{
    const id = req.body.id
    const email = req.body.email
    console.log(id, email)
    sql.query("SELECT * FROM csptracker_requests WHERE id = ? LIMIT 1", [id], (err, results)=>{
        const sent_user_id = results[0].sent_user_id
        const sptag = results[0].sptag
        const tag = results[0].tag
        const pid = results[0].pid
        const project_id = results[0].project_id
        if(!results[0]){
            res.status(401)
        }else{
            sql.query("SELECT name FROM users WHERE email = ?", [email], (err, results)=>{
                let rejector = null
                if(!results[0]){

                }else{
                    rejector = results[0].name
                }
                sql.query("UPDATE csptracker_requests SET `read` = 2 WHERE id = ?", [id], (err, results)=>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }else{
                        sql.query("INSERT INTO csptracker(tag, pid, line_id, project_id) VALUES(?,?,?,?)", [sptag, pid, tag,project_id], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [sent_user_id, "The request for the SP " + sptag + " has been accepted by " + rejector + "."], (err, results)=>{
                                    if(err){
                                        console.log(err)
                                        res.status(401)
                                    }else{
                                        res.send({success: 1}).status(200)
                                    }
                                })  
                            }
                        })
                           
                    }
                }) 
            })           
        }
    })
    
}

const deleteCSPNotification = async(req, res) =>{

    const id = req.body.id
    const email = req.body.user
    sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
        const userid = results[0].id
        sql.query("DELETE FROM csptracker_requests WHERE rec_user_id = ? AND id = ?", [userid, id], (err, results)=>{
            if(err){
                console.log(err)
                res.status(401)
            }else{
                res.send({success: 1}).status(200)
            }
        })
    })  
}

const downloadCSP = async(req, res) =>{
    if(process.env.NODE_MMDN === "1"){
        sql.query("SELECT tag, project, spec, p1diameter_nps, p2diameter_nps, p3diameter_nps, rating, end_preparation, line_id, pid, type, description_plan_code, quantity, requisition, description, description_iso, ident, face_to_face, bolt_type, equipnozz, utility_station, request_date, ready_load_date, ready_e3d_date, comments, ready_load, `ready_e3d`, updated FROM csptrackerfull_view", (err, results) =>{
            if(!results[0]){
              res.status(401)
            }else{   
              res.json(JSON.stringify(results)).status(200)
            }
          })
    }else{
        sql.query("SELECT tag, project, spec, p1diameter_dn, p2diameter_dn, p3diameter_dn, rating, end_preparation, line_id, pid, type, description_plan_code, quantity, requisition, description, description_iso, ident, face_to_face, bolt_type, equipnozz, utility_station, request_date, ready_load_date, ready_e3d_date, comments, ready_load, `ready_e3d`, updated FROM csptrackerfull_view", (err, results) =>{
            if(!results[0]){
              res.status(401)
            }else{   
              res.json(JSON.stringify(results)).status(200)
            }
          })
    }
    
}

const getRatings = async(req, res) =>{
    sql.query("SELECT id, rating FROM csptracker_ratings", (err, results)=>{
        res.send({rows:results}).status(200)
    })
}

const getSpecs = async(req, res) =>{
    sql.query("SELECT id, spec FROM csptracker_specs", (err, results)=>{
        res.send({rows:results}).status(200)
    })
}

const getEndPreparations = async(req, res) =>{
    sql.query("SELECT id, state FROM csptracker_end_preparations", (err, results)=>{
        res.send({rows:results}).status(200)
    })
}

const getBoltTypes = async(req, res) =>{
    sql.query("SELECT id, type FROM csptracker_bolt_types", (err, results)=>{
        res.send({rows:results}).status(200)
    })
}

const getPids = async(req, res) =>{
    sql.query("SELECT pids.id, pid, name FROM pids LEFT JOIN projects ON pids.project_id = projects.id", (err, results)=>{
        res.send({rows:results}).status(200)
    })
}

const submitRatings = async(req, res) =>{
    const ratings = req.body.rows
    for(let i = 0; i < ratings.length; i++){
        if(!ratings[i]["Name"] || ratings[i]["Name"] == ""){
            sql.query("DELETE FROM csptracker_ratings WHERE id = ?", [ratings[i]["id"]], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("SELECT * FROM csptracker_ratings WHERE id = ?", [ratings[i]["id"]], (err, results)=>{
                if(!results[0]){
                    sql.query("INSERT INTO csptracker_ratings(rating) VALUES(?)", [ratings[i]["Name"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else{
                    sql.query("UPDATE csptracker_ratings SET rating = ? WHERE id = ?", [ratings[i]["Name"], ratings[i]["id"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            }) 
        }
        
    }
    res.status(200)
}

const submitSpecs = async(req, res) =>{
    const specs = req.body.rows
    for(let i = 0; i < specs.length; i++){
        if(!specs[i]["Name"] || specs[i]["Name"] == ""){
            sql.query("DELETE FROM csptracker_specs WHERE id = ?", [specs[i]["id"]], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("SELECT * FROM csptracker_specs WHERE id = ?", [specs[i]["id"]], (err, results)=>{
                if(!results[0]){
                    sql.query("INSERT INTO csptracker_specs(spec) VALUES(?)", [specs[i]["Name"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else{
                    sql.query("UPDATE csptracker_specs SET spec = ? WHERE id = ?", [specs[i]["Name"], specs[i]["id"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            }) 
        }
        
    }
    res.status(200)
}

const submitEndPreparations = async(req, res) =>{
    const endPreparations = req.body.rows
    for(let i = 0; i < endPreparations.length; i++){
        if(!endPreparations[i]["Name"] || endPreparations[i]["Name"] == ""){
            sql.query("DELETE FROM csptracker_end_preparations WHERE id = ?", [endPreparations[i]["id"]], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("SELECT * FROM csptracker_end_preparations WHERE id = ?", [endPreparations[i]["id"]], (err, results)=>{
                if(!results[0]){
                    sql.query("INSERT INTO csptracker_end_preparations(state) VALUES(?)", [endPreparations[i]["Name"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else{
                    sql.query("UPDATE csptracker_end_preparations SET state = ? WHERE id = ?", [endPreparations[i]["Name"], endPreparations[i]["id"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            }) 
        }
        
    }
    res.status(200)
}

const submitBoltTypes = async(req, res) =>{
    const boltTypes = req.body.rows
    for(let i = 0; i < boltTypes.length; i++){
        if(!boltTypes[i]["Name"] || boltTypes[i]["Name"] == ""){
            sql.query("DELETE FROM csptracker_bolt_types WHERE id = ?", [boltTypes[i]["id"]], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("SELECT * FROM csptracker_bolt_types WHERE id = ?", [boltTypes[i]["id"]], (err, results)=>{
                if(!results[0]){
                    sql.query("INSERT INTO csptracker_bolt_types(type) VALUES(?)", [boltTypes[i]["Name"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }else{
                    sql.query("UPDATE csptracker_bolt_types SET type = ? WHERE id = ?", [boltTypes[i]["Name"], boltTypes[i]["id"]], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            }) 
        }
        
    }
    res.status(200)
}

const submitPids = async(req, res) =>{
    const pids = req.body.rows
    for(let i = 0; i < pids.length; i++){
        if(!pids[i]["Name"] || pids[i]["Name"] == ""){
            sql.query("DELETE FROM pids WHERE id = ?", [pids[i]["id"]], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("SELECT * FROM pids WHERE id = ?", [pids[i]["id"]], (err, results)=>{
                if(!results[0]){
                    sql.query("SELECT id FROM projects WHERE name = ?", [pids[i]["Project"]], (err, results)=>{
                        if(!results[0]){
                            res.status(401)
                        }else{
                            let project_id = results[0].id
                            sql.query("INSERT INTO pids(pid, project_id) VALUES(?,?)", [pids[i]["Name"], project_id], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }
                            })
                        }
                    })
                    
                }else{
                    sql.query("SELECT id FROM projects WHERE name = ?", [pids[i]["Project"]], (err, results)=>{
                        if(!results[0]){
                            res.status(401)
                        }else{
                            let project_id = results[0].id
                            sql.query("UPDATE pids SET pid = ?, project_id = ? WHERE id = ?", [pids[i]["Name"], project_id, pids[i]["id"]], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }
                            })
                        }
                    })
                }   
            }) 
        }
        
    }
    res.status(200)
}

const deleteSP = (req, res) =>{
    sql.query("UPDATE csptracker SET updated = 2 WHERE tag = ?", [req.body.tag], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const excludeSP = (req, res) =>{
    sql.query("UPDATE csptracker SET ready_e3d = 2 WHERE tag = ?", [req.body.tag], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const spStatusData = (req, res) =>{
    let materials = 0
    let hold = 0
    let ok_rev0 = 0
    let ok_revn = 0
    let excluded = 0
    let deleted = 0
    sql.query("SELECT ready_load, ready_e3d, updated FROM csptracker", (err, results) =>{
        if(!results){
           
        }else if(!results[0]){
           
        }else{
            for(let i = 0; i < results.length; i++){
                if(results[i].ready_load == 0 && (results[i].ready_e3d == 0 || !results[i].ready_e3d) && results[i].updated == 0){
                    materials += 1
                }else if(results[i].ready_load == 1 && (results[i].ready_e3d == 0 || !results[i].ready_e3d)){
                    hold += 1
                }else if(results[i].ready_load == 1 && results[i].ready_e3d == 1 && results[i].updated == 0){
                    ok_rev0 += 1
                }else if(results[i].ready_load == 1 && results[i].ready_e3d == 1 && results[i].updated == 1){
                    ok_revn += 1
                }else if(results[i].ready_e3d == 2){
                    excluded += 1
                }else if(results[i].updated == 2){
                    deleted += 1
                }
            }
            res.send({materials: materials, hold: hold, ok_rev0: ok_rev0, ok_revn: ok_revn, excluded: excluded, deleted: deleted}).status(200)
        }
    })
}

const getPidsByProject = async(req, res) =>{
    sql.query("SELECT id FROM projects WHERE name = ?", req.params.project, (err, results)=>{
        if(!results[0]){
            res.status(401)
        }else{
            let project_id = results[0].id
            sql.query("SELECT id, pid FROM pids WHERE project_id = ?", [project_id], (err, results)=>{
                res.send({rows:results}).status(200)
            })
        }
    })
}

module.exports = {
    csptracker,
    readye3d,
    cancelReadye3d,
    uploadDrawing,
    uploadDrawingDB,
    updateDrawing,
    updateDrawingDB,
    editCSP,
    exitEditCSP,
    getDrawing,
    getListsData,
    submitCSP,
    update_ready_load,
    tags,
    requestSP,
    csptrackerRequests,
    markAsRead,
    markAsUnread,
    rejectRequest,
    acceptRequest,
    deleteCSPNotification,
    downloadCSP,
    getRatings,
    getSpecs,
    getEndPreparations,
    getBoltTypes,
    getPids,
    submitRatings,
    submitSpecs,
    submitEndPreparations,
    submitBoltTypes,
    submitPids,
    deleteSP,
    excludeSP,
    spStatusData,
    getPidsByProject
  };