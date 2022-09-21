const sql = require("../../db.js");

const getExpansionJoinsByProject = async(req, res) =>{
    sql.query("SELECT * FROM expansion_joins_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const expansionJoinsStatusDataByProject = async(req, res) =>{
    let materials = 0
    let hold = 0
    let ok_rev0 = 0
    let ok_revn = 0
    let excluded = 0
    let deleted = 0
    let hold_revn = 0
    sql.query("SELECT ready_load, ready_e3d, updated FROM expansion_joins WHERE project_id = ?", [req.params.project_id], (err, results) =>{
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

const submitExpansionJoins = async(req, res) =>{
    const new_expansion_joins = req.body.rows
    for(let i = 0; i < new_expansion_joins.length; i++){
        let spec_id = null
        let p1bore_id = null
        let rating_id = null
        let bolt_type_id = null
        let end_preparation_id = null
        let p2bore_id = null
        sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", [new_expansion_joins[i].spec], (err, results) =>{
            if(results[0]){
                spec_id = results[0].id
            }
            sql.query("SELECT id FROM diameters WHERE dn = ?", [new_expansion_joins[i].p1bore], (err, results) =>{
                if(results[0]){
                    p1bore_id = results[0].id
                }
                sql.query("SELECT id FROM diameters WHERE dn = ?", [new_expansion_joins[i].p2bore], (err, results) =>{
                    if(results[0]){
                        p2bore_id = results[0].id
                    }
                    sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", [new_expansion_joins[i].rating], (err, results) =>{
                        if(results[0]){
                            rating_id = results[0].id
                        }
                        sql.query("SELECT id FROM csptracker_end_preparations WHERE state = ?", [new_expansion_joins[i].end_preparation], (err, results) =>{
                            if(results[0]){
                                end_preparation_id = results[0].id
                            }    
                            sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", [new_expansion_joins[i].bolt_type], (err, results) =>{
                                if(results[0]){
                                    bolt_type_id = results[0].id
                                }
                                  
                                if(new_expansion_joins[i].id){
                                    sql.query("SELECT ready_e3d FROM expansion_joins WHERE id = ?", [new_expansion_joins[i].id], (err, results)=>{
                                        if(results[0].ready_e3d == 0){
                                            if(req.body.role == "Design"){
                                                sql.query("UPDATE expansion_joins SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, ident = NULL, face_to_face = ?, bolt_type_id = NULL, comments = ? WHERE id = ?", [new_expansion_joins[i].tag, spec_id, p1bore_id, p2bore_id, rating_id, end_preparation_id, new_expansion_joins[i].description_iso, new_expansion_joins[i].face_to_face, new_expansion_joins[i].comments, new_expansion_joins[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                        res.status(401)
                                                    }
                                                })
                                            }else{
                                                sql.query("UPDATE expansion_joins SET ident = ?, bolt_type_id = ? WHERE id = ?", [new_expansion_joins[i].ident, bolt_type_id, new_expansion_joins[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                        res.status(401)
                                                    }
                                                })
                                            }
                                        }else if(results[0].ready_e3d == 1){
                                            if(req.body.role == "Design"){
                                                sql.query("UPDATE expansion_joins SET tag = ?, spec_id = ?, p1_diameter_id = ?, p2_diameter_id = ?, rating_id = ?, end_preparation_id = ?, description_iso = ?, ident = NULL, face_to_face = ?, bolt_type_id = NULL, comments = ?, updated = 1 WHERE id = ?", [new_expansion_joins[i].tag, spec_id, p1bore_id, p2bore_id, rating_id, end_preparation_id, new_expansion_joins[i].description_iso, new_expansion_joins[i].face_to_face, new_expansion_joins[i].comments, new_expansion_joins[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                        res.status(401)
                                                    }
                                                })
                                            }else{
                                                sql.query("UPDATE expansion_joins SET ident = ?, bolt_type_id = ?, updated = 1 WHERE id = ?", [new_expansion_joins[i].ident, bolt_type_id, new_expansion_joins[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                        res.status(401)
                                                    }
                                                })
                                            }
                                        }
                                    })
                                    
                                }else{
                                    sql.query("INSERT INTO expansion_joins(tag, project_id, spec_id, p1_diameter_id, p2_diameter_id, rating_id, end_preparation_id, description_iso, face_to_face, comments) VALUES(?,?,?,?,?,?,?,?,?,?)", [new_expansion_joins[i].tag, req.body.project_id, spec_id, p1bore_id, p2bore_id, rating_id, end_preparation_id, new_expansion_joins[i].description_iso, new_expansion_joins[i].face_to_face, new_expansion_joins[i].comments], (err, results) =>{
                                        if(err){
                                            console.log(err)
                                            res.status(401)
                                        }
                                    })
                                }   
                                
                            })
                                                        
                        })
                        
                    })
                    
                })
            
            })
            
        })
    }
    res.send({success: true}).status(200)
}

const downloadExpansionJoinsByProject = async(req, res) =>{
    sql.query("SELECT tag, spec, p1bore, p2bore, rating, end_preparation, description_iso, ident, face_to_face, bolt_type, comments, ready_e3d_date, updated_at, comments, ready_load, ready_e3d, updated FROM expansion_joins_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json(JSON.stringify(results)).status(200)
        }
    })
}

const expansionJoinsReadye3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE expansion_joins SET ready_e3d = 1, ready_e3d_date = ? WHERE id = ?", [currentDate, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const expansionJoinsCancelreadye3d = (req, res) =>{
    sql.query("UPDATE expansion_joins SET ready_e3d = 0, ready_e3d_date = ? WHERE id = ?", [null, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const deleteExpansionJoins = (req, res) =>{
    sql.query("UPDATE expansion_joins SET updated = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const excludeExpansionJoins = (req, res) =>{
    sql.query("UPDATE expansion_joins SET ready_e3d = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}


module.exports = {
    getExpansionJoinsByProject,
    expansionJoinsStatusDataByProject,
    submitExpansionJoins,
    downloadExpansionJoinsByProject,
    expansionJoinsReadye3d,
    deleteExpansionJoins,
    excludeExpansionJoins,
    expansionJoinsCancelreadye3d
}