const sql = require("../../db.js");
const fs = require("fs");
const drawingMiddleware = require("../inst_general/inst_general.middleware");
var path = require('path')

const getInstGeneralByProject = async(req, res) =>{
    sql.query("SELECT insts_generic.id as id, specs.spec as spec, instrument_types.type as instrument_type, pcons.name as pcons_name, diameters_from.dn as diameters_from_dn, diameters_to.dn as diameters_to_dn, csptracker_bolt_types.`type` as bolt_type, ready_load, ready_load_date, ready_e3d, ready_e3d_date, comments, updated, insts_generic.updated_at as insts_generic_updated_at FROM insts_generic LEFT JOIN specs ON spec_id = specs.id LEFT JOIN instrument_types ON instrument_types_id = instrument_types.id LEFT JOIN pcons ON pcon_id = pcons.id LEFT JOIN diameters as diameters_from ON from_diameter_id = diameters_from.id LEFT JOIN diameters as diameters_to ON to_diameter_id = diameters_to.id LEFT JOIN csptracker_bolt_types ON flg_con_id = csptracker_bolt_types.id JOIN projects ON project_id = projects.id WHERE project_id = ?", [req.params.project_id], (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getSpecsByProject = async(req, res) =>{
    sql.query("SELECT DISTINCT specs.id, spec FROM specs JOIN project_has_specs ON specs.id = project_has_specs.spec_id JOIN projects ON project_has_specs.project_id = ?", [req.params.project_id], (err, results) =>{
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
    console.log(new_insts)
    for(let i = 0; i < new_insts.length; i++){
        let spec_id = null
        let inst_type_id = null
        let pcons_id = null
        let from_id = null
        let to_id = null
        let bolt_id = null
        sql.query("SELECT id FROM specs WHERE spec = ?", [new_insts[i].spec], (err, results) =>{
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
                                    sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = ? WHERE id = ?", [spec_id, inst_type_id, pcons_id, from_id, to_id, bolt_id, new_insts[i].id], (err, results) =>{
                                        if(err){
                                            console.log(err)
                                            res.status(401)
                                        }
                                    })
                                }else{
                                    sql.query("INSERT INTO insts_generic(spec_id, instrument_types_id, pcon_id, from_diameter_id, to_diameter_id, flg_con_id, project_id) VALUES(?,?,?,?,?,?,?)", [spec_id, inst_type_id, pcons_id, from_id, to_id, bolt_id, req.body.project_id], (err, results) =>{
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
    sql.query("UPDATE csptracker SET ready_e3d = 0, ready_e3d_date = ? WHERE id = ?", [null, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
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
    instCancelReadyE3d
}