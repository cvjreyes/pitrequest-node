const sql = require("../../db.js");

const getPSVByProject = async(req, res) =>{
    sql.query("SELECT * FROM psvs_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const psvStatusDataByProject = async(req, res) =>{
    let materials = 0
    let hold = 0
    let ok_rev0 = 0
    let ok_revn = 0
    let excluded = 0
    let deleted = 0
    let hold_revn = 0
    sql.query("SELECT ready_load, ready_e3d, updated FROM psvs WHERE project_id = ?", [req.params.project_id], (err, results) =>{
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

const submitPSV = async(req, res) =>{
    const new_psvs = req.body.rows
    for(let i = 0; i < new_psvs.length; i++){
        let spec_inlet_id = null
        let p1bore_inlet_id = null
        let rating_inlet_id = null
        let flg_inlet_id = null
        let spec_outlet_id = null
        let p2bore_outlet_id = null
        let rating_outlet_id = null
        let flg_outlet_id = null
        sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", [new_psvs[i].spec_inlet], (err, results) =>{
            if(results[0]){
                spec_inlet_id = results[0].id
            }  
            sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", [new_psvs[i].spec_outlet], (err, results) =>{
                if(results[0]){
                    spec_outlet_id = results[0].id
                }
                sql.query("SELECT id FROM diameters WHERE dn = ?", [new_psvs[i].p1bore_inlet], (err, results) =>{
                    if(results[0]){
                        p1bore_inlet_id = results[0].id
                    }
                    sql.query("SELECT id FROM diameters WHERE dn = ?", [new_psvs[i].p2bore_outlet], (err, results) =>{
                        if(results[0]){
                            p2bore_outlet_id = results[0].id
                        }
                        sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", [new_psvs[i].rating_inlet], (err, results) =>{
                            if(results[0]){
                                rating_inlet_id = results[0].id
                            }
                            sql.query("SELECT id FROM csptracker_ratings WHERE rating = ?", [new_psvs[i].rating_outlet], (err, results) =>{
                                if(results[0]){
                                    rating_outlet_id = results[0].id
                                }    
                                sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", [new_psvs[i].flg_inlet], (err, results) =>{
                                    if(results[0]){
                                        flg_inlet_id = results[0].id
                                    }
                                    sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", [new_psvs[i].flg_outlet], (err, results) =>{
                                        if(results[0]){
                                            flg_outlet_id = results[0].id
                                        }    
                                        if(new_psvs[i].id){
                                            sql.query("SELECT ready_e3d FROM psvs WHERE id = ?", [new_psvs[i].id], (err, results)=>{
                                                if(results[0].ready_e3d == 0){
                                                    if(req.body.role == "Design"){
                                                        sql.query("UPDATE psvs SET tag = ?, spec_inlet_id = ?, p1bore_inlet_id = ?, rating_inlet_id = ?, flg_inlet_id = NULL, bolt_longitude_inlet = NULL, spec_outlet_id = ?, p2bore_outlet_id = ?, rating_outlet_id = ?, flg_outlet_id = NULL, bolt_longitude_outlet = NULL, h1 = ?, a = ?, b = ?, comments = ? WHERE id = ?", [new_psvs[i].tag, spec_inlet_id, p1bore_inlet_id, rating_inlet_id, spec_outlet_id, p2bore_outlet_id, rating_outlet_id, new_psvs[i].h1, new_psvs[i].a, new_psvs[i].b, new_psvs[i].comments, new_psvs[i].id], (err, results) =>{
                                                            if(err){
                                                                console.log(err)
                                                            }
                                                        })
                                                    }else{
                                                        sql.query("UPDATE psvs SET flg_inlet_id = ?, bolt_longitude_inlet = ?, flg_outlet_id = ?, bolt_longitude_outlet = ? WHERE id = ?", [flg_inlet_id, new_psvs[i].bolt_longitude_inlet, flg_outlet_id, new_psvs[i].bolt_longitude_outlet, new_psvs[i].id], (err, results) =>{
                                                            if(err){
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                }else if(results[0].ready_e3d == 1){
                                                    if(req.body.role == "Design"){
                                                        sql.query("UPDATE psvs SET tag = ?, spec_inlet_id = ?, p1bore_inlet_id = ?, rating_inlet_id = ?, flg_inlet_id = NULL, bolt_longitude_inlet = NULL, spec_outlet_id = ?, p2bore_outlet_id = ?, rating_outlet_id = ?, flg_outlet_id = NULL, bolt_longitude_outlet = NULL, h1 = ?, a = ?, b = ?, comments = ?, updated = 1 WHERE id = ?", [new_psvs[i].tag, spec_inlet_id, p1bore_inlet_id, rating_inlet_id, spec_outlet_id, p2bore_outlet_id, rating_outlet_id, new_psvs[i].h1, new_psvs[i].a, new_psvs[i].b, new_psvs[i].comments, new_psvs[i].id], (err, results) =>{
                                                            if(err){
                                                                console.log(err)
                                                            }
                                                        })
                                                    }else{
                                                        sql.query("UPDATE psvs SET flg_inlet_id = ?, bolt_longitude_inlet = ?, flg_outlet_id = ?, bolt_longitude_outlet = ?, updated = 1 WHERE id = ?", [flg_inlet_id, new_psvs[i].bolt_longitude_inlet, flg_outlet_id, new_psvs[i].bolt_longitude_outlet, new_psvs[i].id], (err, results) =>{
                                                            if(err){
                                                                console.log(err)
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                            
                                        }else{
                                            sql.query("INSERT INTO psvs(tag, project_id, spec_inlet_id, p1bore_inlet_id, rating_inlet_id, spec_outlet_id, p2bore_outlet_id, rating_outlet_id, h1, a, b, comments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", [new_psvs[i].tag, req.body.project_id, spec_inlet_id, p1bore_inlet_id, rating_inlet_id, spec_outlet_id, p2bore_outlet_id, rating_outlet_id, new_psvs[i].h1, new_psvs[i].a, new_psvs[i].b, new_psvs[i].comments], (err, results) =>{
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
    }
    res.send({success: true}).status(200)
}

const downloadPSVByProject = async(req, res) =>{
    sql.query("SELECT tag, spec_inlet, p1bore_inlet, rating_inlet, flg_inlet, bolt_longitude_inlet, spec_outlet, p2bore_outlet, rating_outlet, flg_outlet, bolt_longitude_outlet, h1, a, b, ready_load_date, ready_e3d_date, updated_at, comments, ready_load, ready_e3d, updated FROM psvs_full_view WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json(JSON.stringify(results)).status(200)
        }
    })
}

const psvReadye3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE psvs SET ready_e3d = 1, ready_e3d_date = ? WHERE id = ?", [currentDate, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const psvCancelreadye3d = (req, res) =>{
    sql.query("UPDATE psvs SET ready_e3d = 0, ready_e3d_date = ? WHERE id = ?", [null, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const deletePSV = (req, res) =>{
    sql.query("UPDATE psvs SET updated = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const excludePSV = (req, res) =>{
    sql.query("UPDATE psvs SET ready_e3d = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}


module.exports = {
    getPSVByProject,
    psvStatusDataByProject,
    submitPSV,
    downloadPSVByProject,
    psvReadye3d,
    deletePSV,
    excludePSV,
    psvCancelreadye3d
}