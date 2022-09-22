const sql = require("../../db.js");
const drawingMiddleware = require("../special_instruments/special_instruments.middleware");
const fs = require("fs");
var path = require('path')

const getSpecialsByProject = async(req, res) =>{
    sql.query("SELECT * FROM special_instruments_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const specialsStatusDataByProject = async(req, res) =>{
    let materials = 0
    let hold = 0
    let ok_rev0 = 0
    let ok_revn = 0
    let excluded = 0
    let deleted = 0
    let hold_revn = 0
    sql.query("SELECT ready_load, ready_e3d, updated FROM special_instruments WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results){
           
        }else if(!results[0]){
            res.send({materials: materials, hold: hold, ok_rev0: ok_rev0, ok_revn: ok_revn, excluded: excluded, deleted: deleted, hold_revn: hold_revn}).status(200)
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
                }else if(results[i].ready_load == 0 && results[i].ready_e3d == 1 && results[i].updated == 1){
                    hold_revn += 1
                }
            }
            res.send({materials: materials, hold: hold, ok_rev0: ok_rev0, ok_revn: ok_revn, excluded: excluded, deleted: deleted, hold_revn: hold_revn}).status(200)
        }
    })
}

const submitSpecials = async(req, res) =>{
    const new_specials = req.body.rows
    for(let i = 0; i < new_specials.length; i++){
        let spec_id = null
        let p1bore_id = null
        let p2bore_id = null
        let p3bore_id = null
        let rating_id = null
        let end_preparation_id = null
        let bolt_type_id = null
        let drawing_id = null
        let filename = null
        sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", [new_specials[i].spec], (err, results) =>{
            if(results[0]){
                spec_id = results[0].id
            }  
            sql.query("SELECT id FROM diameters WHERE dn = ?", [new_specials[i].p1bore], (err, results) =>{
                if(results[0]){
                    p1bore_id = results[0].id
                }
                sql.query("SELECT id FROM diameters WHERE dn = ?", [new_specials[i].p2bore], (err, results) =>{
                    if(results[0]){
                        p2bore_id = results[0].id
                    }
                    sql.query("SELECT id FROM diameters WHERE dn = ?", [new_specials[i].p3bore], (err, results) =>{
                        if(results[0]){
                            p3bore_id = results[0].id
                        }
                        sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", [new_specials[i].rating], (err, results) =>{
                            if(results[0]){
                                rating_id = results[0].id
                            }
                            sql.query("SELECT id FROM csptracker_end_preparations WHERE state = ?", [new_specials[i].end_preparation], (err, results) =>{
                                if(results[0]){
                                    end_preparation_id = results[0].id
                                }    
                                sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", [new_specials[i].type], (err, results) =>{
                                    if(results[0]){
                                        bolt_type_id = results[0].id
                                    }
                                    sql.query("SELECT id, filename FROM special_instruments_description_drawings WHERE code = ?", [new_specials[i].code], (err, results) =>{
                                        if(results[0]){
                                            drawing_id = results[0].id
                                            filename = results[0].filename
                                            
                                            if(new_specials[i].id){
                                                sql.query("SELECT ready_e3d FROM special_instruments WHERE id = ?", [new_specials[i].id], (err, results)=>{
                                                    if(results[0].ready_e3d == 0){
                                                        if(req.body.role == "Design"){
                                                            sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ? WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                if(err){
                                                                    console.log(err)
                                                                }
                                                            })
                                                        }else{
                                                            sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ? WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                if(err){
                                                                    console.log(err)
                                                                }
                                                            })
                                                        }
                                                    }else if(results[0].ready_e3d == 1){
                                                        if(req.body.role == "Design"){
                                                            sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ?, updated = 1 WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                if(err){
                                                                    console.log(err)
                                                                }
                                                            })
                                                        }else{
                                                            sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ?, updated = 1 WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                if(err){
                                                                    console.log(err)
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                                
                                            }else{
                                                sql.query("INSERT INTO special_instruments(tag, project_id, spec_id, p1_diameter_id, p2_diameter_id, p3_diameter_id, rating_id, end_preparation_id, description_iso, bolt_type_id, bolt_longitude, instruments_description_drawing_id, instruments_description_filename, comments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [new_specials[i].tag, req.body.project_id, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, bolt_type_id, new_specials[i].bolt_longitude, drawing_id, filename, new_specials[i].comments], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        }else{
                                            if(new_specials[i].code){
                                                sql.query("INSERT INTO special_instruments_description_drawings(code) VALUES(?)", [new_specials[i].code], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }else{
                                                        sql.query("SELECT id FROM special_instruments_description_drawings WHERE code = ?", [new_specials[i].code], (err, results) =>{                                             
                                                            drawing_id = results[0].id
                                                            if(new_specials[i].id){
                                                                sql.query("SELECT ready_e3d FROM special_instruments WHERE id = ?", [new_specials[i].id], (err, results)=>{
                                                                    if(results[0].ready_e3d == 0){
                                                                        if(req.body.role == "Design"){
                                                                            sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ? WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }else{
                                                                            sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ? WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }
                                                                    }else if(results[0].ready_e3d == 1){
                                                                        if(req.body.role == "Design"){
                                                                            sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ?, updated = 1 WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }else{
                                                                            sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ?, updated = 1 WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                                if(err){
                                                                                    console.log(err)
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                                
                                                            }else{
                                                                sql.query("INSERT INTO special_instruments(tag, project_id, spec_id, p1_diameter_id, p2_diameter_id, p3_diameter_id, rating_id, end_preparation_id, description_iso, bolt_type_id, bolt_longitude, instruments_description_drawing_id, instruments_description_filename, comments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [new_specials[i].tag, req.body.project_id, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, bolt_type_id, new_specials[i].bolt_longitude, drawing_id, filename, new_specials[i].comments], (err, results) =>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }else{
                                                if(new_specials[i].id){
                                                    sql.query("SELECT ready_e3d FROM special_instruments WHERE id = ?", [new_specials[i].id], (err, results)=>{
                                                        if(results[0].ready_e3d == 0){
                                                            if(req.body.role == "Design"){
                                                                sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ? WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                })
                                                            }else{
                                                                sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ? WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                })
                                                            }
                                                        }else if(results[0].ready_e3d == 1){
                                                            if(req.body.role == "Design"){
                                                                sql.query("UPDATE special_instruments SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, p3_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, bolt_type_id = NULL, bolt_longitude = NULL, instruments_description_drawing_id = ?, instruments_description_filename = ?, comments = ?, updated = 1 WHERE id = ?", [new_specials[i].tag, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, drawing_id, filename, new_specials[i].comments, new_specials[i].id], (err, results) =>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                })
                                                            }else{
                                                                sql.query("UPDATE special_instruments SET bolt_type_id = ?, bolt_longitude = ?, updated = 1 WHERE id = ?", [bolt_type_id, new_specials[i].bolt_longitude, new_specials[i].id], (err, results) =>{
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                    
                                                }else{
                                                    sql.query("INSERT INTO special_instruments(tag, project_id, spec_id, p1_diameter_id, p2_diameter_id, p3_diameter_id, rating_id, end_preparation_id, description_iso, bolt_type_id, bolt_longitude, instruments_description_drawing_id, instruments_description_filename, comments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [new_specials[i].tag, req.body.project_id, spec_id, p1bore_id, p2bore_id, p3bore_id, rating_id, end_preparation_id, new_specials[i].description_iso, bolt_type_id, new_specials[i].bolt_longitude, drawing_id, filename, new_specials[i].comments], (err, results) =>{
                                                        if(err){
                                                            console.log(err)
                                                        }
                                                    })
                                                }
                                            }
                                        }
                                           
                                    })
                                })
                                                         
                            })
                            
                        })
                        
                    })
                
                })
                
            })
            
        })
    }
    res.send({success: true}).status(200)
}

const downloadSpecialsByProject = async(req, res) =>{
    sql.query("SELECT tag, spec, p1bore, p2bore, p3bore, rating, end_preparation, description_iso, type, bolt_longitude, code, revision, ready_load_date, ready_e3d_date, comments, ready_load, ready_e3d, updated FROM special_instruments_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json(JSON.stringify(results)).status(200)
        }
    })
}

const specialsReadye3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE special_instruments SET ready_e3d = 1, ready_e3d_date = ? WHERE id = ?", [currentDate, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const specialsCancelreadye3d = (req, res) =>{
    sql.query("UPDATE special_instruments SET ready_e3d = 0, ready_e3d_date = ? WHERE id = ?", [null, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const deleteSpecials = (req, res) =>{
    sql.query("UPDATE special_instruments SET updated = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const excludeSpecials = (req, res) =>{
    sql.query("UPDATE special_instruments SET ready_e3d = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const specialsDrawingCodes = (req, res) =>{
    sql.query("SELECT code FROM special_instruments_description_drawings", (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({rows: results}).status(200)
        }
    })
}

const uploadSpecialsDrawing = async(req, res) =>{
    try{   
        await drawingMiddleware.uploadFileMiddleware(req, res);
        sql.query("SELECT * FROM special_instruments_description_drawings WHERE filename = ?", req.file.filename, (err, results)=>{
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

const uploadSpecialsDrawingDB = (req, res) =>{
    const code = req.body.description_plan_code
    const fileName = req.body.filename

    sql.query("UPDATE special_instruments_description_drawings SET filename = ? WHERE code = ?", [fileName, code], (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            sql.query("SELECT id FROM special_instruments_description_drawings WHERE code = ?", [code], (err, results) =>{
                if(!results[0]){
                    res.status(401)
                }else{
                    const drawing_id = results[0].id
                    sql.query("UPDATE special_instruments SET instruments_description_filename = ? WHERE instruments_description_drawing_id = ?", [fileName, drawing_id], (err, results)=>{
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

const updateSpecialsDrawing = async(req, res) =>{
    try{   
        await drawingMiddleware.updateFileMiddleware(req, res);
        sql.query("SELECT * FROM special_instruments_description_drawings WHERE filename = ?", req.file.filename, (err, results)=>{
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

const updateSpecialsDrawingDB = async(req, res) =>{
    const description_plan_code = req.body.description_plan_code
    const fileName = req.body.fileName
    const email = req.body.email
    sql.query("SELECT id FROM special_instruments_description_drawings WHERE code = ?", [description_plan_code],(err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            const drawing_id = results[0].id
            sql.query("UPDATE special_instruments SET updated = 1, ready_e3d = 0 WHERE instruments_description_drawing_id = ? AND ready_e3d = 1", [drawing_id], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }else{
                    sql.query("UPDATE special_instruments_description_drawings SET revision = revision+1 WHERE code = ?", [description_plan_code], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }else{
                            console.log("Drawing updated in db")
                            sql.query("SELECT revision FROM special_instruments_description_drawings WHERE code = ?", [description_plan_code], (err, results)=>{
                                if(!results[0]){
                                    res.status(401)
                                }else{
                                    const revision = results[0].revision
                                    const extension = path.extname(fileName)
                                    const bakFileName = fileName.split('.').slice(0, -1) + "-" + revision + extension
                                    fs.copyFile('./app/storage/specials/drawings/'+ fileName, './app/storage/specials/drawings/bak/'+ bakFileName, (err) => {
                                        if (err) throw err;
                                        console.log('Created drawing backup');
                                      });

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

const getSpecialsDrawing = async(req, res) =>{
    const fileName = req.params.fileName
    
    let path = './app/storage/specials/drawings/' + fileName;
    if (fs.existsSync(path)) {
        var file = fs.createReadStream(path);
        file.pipe(res);
    }else{
        console.log(fileName)
    }
    
}

module.exports = {
    getSpecialsByProject,
    specialsStatusDataByProject,
    submitSpecials,
    downloadSpecialsByProject,
    specialsReadye3d,
    deleteSpecials,
    excludeSpecials,
    specialsCancelreadye3d,
    specialsDrawingCodes,
    uploadSpecialsDrawing,
    uploadSpecialsDrawingDB,
    updateSpecialsDrawing,
    updateSpecialsDrawingDB,
    getSpecialsDrawing
}