const sql = require("../../db.js");
const fs = require("fs");
var path = require('path')

const getInstGeneralByProject = async(req, res) =>{
    sql.query("SELECT insts_generic.id as id, csptracker_specs.spec as spec, instrument_types.type as instrument_type, pcons.name as pcons_name, diameters_from.dn as diameters_from_dn, diameters_to.dn as diameters_to_dn, csptracker_bolt_types.`type` as bolt_type, ready_load_date, ready_e3d_date, insts_generic.updated_at as insts_generic_updated_at, comments, ready_load, ready_e3d, updated FROM insts_generic LEFT JOIN csptracker_specs ON spec_id = csptracker_specs.id LEFT JOIN instrument_types ON instrument_types_id = instrument_types.id LEFT JOIN pcons ON pcon_id = pcons.id LEFT JOIN diameters as diameters_from ON from_diameter_id = diameters_from.id LEFT JOIN diameters as diameters_to ON to_diameter_id = diameters_to.id LEFT JOIN csptracker_bolt_types ON flg_con_id = csptracker_bolt_types.id JOIN projects ON project_id = projects.id WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getSpecsByProject = async(req, res) =>{
    sql.query("SELECT DISTINCT csptracker_specs.id, spec FROM csptracker_specs JOIN project_has_specs ON csptracker_specs.id = project_has_specs.spec_id JOIN projects ON project_has_specs.project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({specs: []}).status(200)
        }else{
            res.json({specs: results}).status(200)
        }
    })
}

const getInstTypes = async(req, res) =>{
    sql.query("SELECT id, type FROM instrument_types", (err, results) =>{
        if(!results[0]){
            res.send({instrument_types: []}).status(200)
        }else{
            res.json({instrument_types: results}).status(200)
        }
    })
}

const getPComs = async(req, res) =>{
    sql.query("SELECT id, `name` FROM pcons", (err, results) =>{
        if(!results[0]){
            res.send({pcons: []}).status(200)
        }else{
            res.json({pcons: results}).status(200)
        }
    })
}

const getDiameters = async(req, res) =>{
    sql.query("SELECT id, dn FROM diameters", (err, results) =>{
        if(!results[0]){
            res.send({diameters: []}).status(200)
        }else{
            res.json({diameters: results}).status(200)
        }
    })
}


const submitInstGeneral = async(req, res) =>{
    const new_insts = req.body.rows
    for(let i = 0; i < new_insts.length; i++){
        let spec_id = null
        let inst_type_id = null
        let pcons_id = null
        let from_id = null
        let to_id = null
        let bolt_id = null
        sql.query("SELECT id FROM csptracker_specs WHERE spec = ?", [new_insts[i].spec], (err, results) =>{
            if(results[0]){
                spec_id = results[0].id
            }  
            sql.query("SELECT id FROM instrument_types WHERE type = ?", [new_insts[i].instrument_type], (err, results) =>{
                if(results[0]){
                    inst_type_id = results[0].id
                }
                sql.query("SELECT id FROM pcons WHERE name = ?", [new_insts[i].pcons_name], (err, results) =>{
                    if(results[0]){
                        pcons_id = results[0].id
                    }
                    sql.query("SELECT id FROM diameters WHERE dn = ?", [new_insts[i].diameters_from_dn], (err, results) =>{
                        if(results[0]){
                            from_id = results[0].id
                        }
                        sql.query("SELECT id FROM diameters WHERE dn = ?", [new_insts[i].diameters_to_dn], (err, results) =>{
                            if(results[0]){
                                to_id = results[0].id
                            }
                            sql.query("SELECT id FROM csptracker_bolt_types WHERE type = ?", [new_insts[i].bolt_type], (err, results) =>{
                                if(results[0]){
                                    bolt_id = results[0].id
                                }    
                                if(new_insts[i].id){
                                    sql.query("SELECT ready_e3d FROM insts_generic WHERE id = ?", [new_insts[i].id], (err, results)=>{
                                        if(results[0].ready_e3d == 0){
                                            if(req.body.role == "Design"){
                                                sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = NULL, comments = ? WHERE id = ?", [spec_id, inst_type_id, pcons_id, from_id, to_id, new_insts[i].comments, new_insts[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }else{
                                                sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = ?, comments = ? WHERE id = ?", [spec_id, inst_type_id, pcons_id, from_id, to_id, bolt_id, new_insts[i].comments, new_insts[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        }else if(results[0].ready_e3d == 1){
                                            if(req.body.role == "Design"){
                                                sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = NULL, comments = ?, updated = 1 WHERE id = ?", [spec_id, inst_type_id, pcons_id, from_id, to_id,  new_insts[i].comments, new_insts[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }else{
                                                sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = ?, comments = ?, updated = 1 WHERE id = ?", [spec_id, inst_type_id, pcons_id, from_id, to_id, bolt_id, new_insts[i].comments, new_insts[i].id], (err, results) =>{
                                                    if(err){
                                                        console.log(err)
                                                    }
                                                })
                                            }
                                        }
                                    })
                                    
                                }else{
                                    sql.query("INSERT INTO insts_generic(spec_id, instrument_types_id, pcon_id, from_diameter_id, to_diameter_id, flg_con_id, comments, project_id) VALUES(?,?,?,?,?,?,?,?)", [spec_id, inst_type_id, pcons_id, from_id, to_id, bolt_id, new_insts[i].comments, req.body.project_id], (err, results) =>{
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
    }
    res.send({success: true}).status(200)

}

const instReadyE3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE insts_generic SET ready_e3d = 1, ready_e3d_date = ? WHERE id = ?", [currentDate, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const instCancelReadyE3d = (req, res) =>{
    sql.query("UPDATE insts_generic SET ready_e3d = 0, ready_e3d_date = ? WHERE id = ?", [null, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const deleteInst = (req, res) =>{
    sql.query("UPDATE insts_generic SET updated = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const excludeInst = (req, res) =>{
    sql.query("UPDATE insts_generic SET ready_e3d = 2 WHERE id = ?", [req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const instStatusDataByProject = (req, res) =>{
    let materials = 0
    let hold = 0
    let ok_rev0 = 0
    let ok_revn = 0
    let excluded = 0
    let deleted = 0
    let hold_revn = 0
    sql.query("SELECT ready_load, ready_e3d, updated FROM insts_generic WHERE project_id = ?", [req.params.project_id], (err, results) =>{
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

const downloadInstsGeneralByProject = async(req, res) =>{
    sql.query("SELECT csptracker_specs.spec as spec, instrument_types.type as instrument_type, pcons.name as pcons_name, diameters_from.dn as diameters_from_dn, diameters_to.dn as diameters_to_dn, csptracker_bolt_types.`type` as bolt_type, ready_load_date, ready_e3d_date, insts_generic.updated_at as insts_generic_updated_at, comments, ready_load, ready_e3d, updated FROM insts_generic LEFT JOIN csptracker_specs ON spec_id = csptracker_specs.id LEFT JOIN instrument_types ON instrument_types_id = instrument_types.id LEFT JOIN pcons ON pcon_id = pcons.id LEFT JOIN diameters as diameters_from ON from_diameter_id = diameters_from.id LEFT JOIN diameters as diameters_to ON to_diameter_id = diameters_to.id LEFT JOIN csptracker_bolt_types ON flg_con_id = csptracker_bolt_types.id JOIN projects ON project_id = projects.id WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json(JSON.stringify(results)).status(200)
        }
    })
}

const submitGenerics = async(req, res) =>{
    const generics = req.body.generics
    for(let i = 0; i < generics.length; i++){
        if(generics[i].id){
            if(generics[i].type){
                sql.query("UPDATE instrument_types SET type = ? WHERE id = ?", [generics[i].type, generics[i].id], (err, results) =>{
                    if(err){
                        res.status(401)
                        console.log(err)
                    }
                })
            }else{
                sql.query("DELETE FROM instrument_types WHERE id = ?", [generics[i].id], (err, results) =>{
                    if(err){
                        res.status(401)
                        console.log(err)
                    }
                })
            }
        }else{
            sql.query("INSERT INTO instrument_types(type) VALUES(?)", [generics[i].type], (err, results) =>{
                if(err){
                    res.status(401)
                    console.log(err)
                }
            })
        }
    }
    res.send({success: true}).status(200)
}


const submitPcons = async(req, res) =>{
    const pcons = req.body.pcons
    for(let i = 0; i < pcons.length; i++){
        if(pcons[i].id){
            if(pcons[i].pcon){
                sql.query("UPDATE pcons SET name = ? WHERE id = ?", [pcons[i].pcon, pcons[i].id], (err, results) =>{
                    if(err){
                        res.status(401)
                        console.log(err)
                    }
                })
            }else{
                sql.query("DELETE FROM pcons WHERE id = ?", [pcons[i].id], (err, results) =>{
                    if(err){
                        res.status(401)
                        console.log(err)
                    }
                })
            }
        }else{
            sql.query("INSERT INTO pcons(name) VALUES(?)", [pcons[i].pcon], (err, results) =>{
                if(err){
                    res.status(401)
                    console.log(err)
                }
            })
        }
    }
    res.send({success: true}).status(200)
}

const getSpecsByAllProjects = async(req, res) =>{
    sql.query("SELECT DISTINCT project_has_specs.id, spec, projects.name as project FROM csptracker_specs JOIN project_has_specs ON csptracker_specs.id = project_has_specs.spec_id JOIN projects ON project_has_specs.project_id = projects.id", (err, results) =>{
        if(!results[0]){
            res.send({specs: []}).status(200)
        }else{
            res.json({specs: results}).status(200)
        }
    })   
}


const submitSpecsByProject = async(req, res) =>{
    const specs = req.body.specs
    for(let i = 0; i < specs.length; i++){
        if(specs[i].id){
            if(specs[i].spec && specs[i].project){
                sql.query("SELECT id FROM csptracker_specs WHERE spec = ?",[specs[i].spec], (err, results) =>{
                    if(results[0]){
                        const spec_id = results[0].id
                        sql.query("SELECT id FROM projects WHERE name = ?",[specs[i].project], (err, results) =>{
                            if(results[0]){
                                const project_id = results[0].id
                                sql.query("UPDATE project_has_specs SET spec_id = ?, project_id = ? WHERE id = ?", [spec_id, project_id, specs[i].id], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.status(401)
                                    }
                                })
                            }
                        })
                    }
                })
            }else{
                sql.query("DELETE FROM project_has_specs WHERE id = ?", [specs[i].id], (err, results) =>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }else{
            sql.query("SELECT id FROM csptracker_specs WHERE spec = ?",[specs[i].spec], (err, results) =>{
                if(results[0]){
                    const spec_id = results[0].id
                    sql.query("SELECT id FROM projects WHERE name = ?",[specs[i].project], (err, results) =>{
                        if(results[0]){
                            const project_id = results[0].id
                            sql.query("INSERT INTO project_has_specs(spec_id, project_id) VALUES(?,?)", [spec_id, project_id], (err, results) =>{
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
    res.send({success: true}).status(200)
}

const submitPIDsByProject = async(req, res) =>{
    const pids = req.body.pids
    for(let i = 0; i < pids.length; i++){
        if(pids[i].id){
            if(pids[i].pid && pids[i].project){
                sql.query("SELECT id FROM projects WHERE name = ?",[pids[i].project], (err, results) =>{
                    if(results[0]){
                        const project_id = results[0].id
                        sql.query("UPDATE pids SET pid = ?, project_id = ? WHERE id = ?", [pids[i].pid, project_id, pids[i].id], (err, results) =>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }
                        })
                    }
                })
            }else{
                sql.query("DELETE FROM pids WHERE id = ?", [pids[i].id], (err, results) =>{
                    if(err){
                        console.log(err)
                        res.status(401)
                    }
                })
            }
        }else{
            sql.query("SELECT id FROM projects WHERE name = ?",[pids[i].project], (err, results) =>{
                if(results[0]){
                    const project_id = results[0].id
                    sql.query("INSERT INTO pids(pid, project_id) VALUES(?,?)", [pids[i].pid, project_id], (err, results) =>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }
                    })
                }
            })               
        }
    } 
    res.send({success: true}).status(200)
}

const downloadAllInstrumentsHolds = async(req, res) =>{
    sql.query("SELECT * FROM instruments_holds_view", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json(JSON.stringify(results)).status(200)
        }
    })
}

module.exports = {
    getInstGeneralByProject,
    getSpecsByProject,
    getInstTypes,
    getPComs,
    getDiameters,
    submitInstGeneral,
    instReadyE3d,
    instCancelReadyE3d,
    deleteInst,
    excludeInst,
    instStatusDataByProject,
    downloadInstsGeneralByProject,
    submitGenerics,
    submitPcons,
    getSpecsByAllProjects,
    submitSpecsByProject,
    submitPIDsByProject,
    downloadAllInstrumentsHolds
}