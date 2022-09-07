const sql = require("../../db.js");
const fs = require("fs");
const drawingMiddleware = require("../inst_general/inst_general.middleware");
var path = require('path')

const getInstGeneral = async(req, res) =>{
    sql.query("SELECT specs.spec, instrument_types.type, pcons.name, diameters_from.dn, diameters_to.dn, csptracker_bolt_types.`type`, ready_load, ready_load_date, ready_e3d, ready_e3d_date, comments, updated, insts_generic.updated_at FROM insts_generic LEFT JOIN specs ON spec_id = specs.id LEFT JOIN instrument_types ON instrument_types_id = instrument_types.id LEFT JOIN pcons ON pcon_id = pcons.id LEFT JOIN diameters as diameters_from ON from_diameter_id = diameters_from.id LEFT JOIN diameters as diameters_to ON to_diameter_id = diameters_to.id LEFT JOIN csptracker_bolt_types ON flg_con_id = csptracker_bolt_types.id", (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getSpecsByProject = async(req, res) =>{
    sql.query("SELECT specs.id, spec FROM specs JOIN project_has_specs ON specs.id = project_has_specs.spec_id JOIN projects ON project_has_specs.project_id = ?", (err, results) =>{
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
        if(new_insts[i].id){
            sql.query("UPDATE insts_generic SET spec_id = ?, instrument_types_id = ?, pcon_id = ?, from_diameter_id = ?, to_diameter_id = ?, flg_con_id = ? WHERE id = ?", [new_insts[i]["spec"], new_insts[i]["instrument_type"], new_insts[i]["pcon"], new_insts[i]["from"], new_insts[i]["to"], new_insts[i]["flg_con"], new_insts[i].id], (err, results) =>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }else{
            sql.query("INSET INTO insts_generic(spec_id, instrument_types_id, pcon_id, from_diameter_id, to_diameter_id, flg_con_id) VALUES(?,?,?,?,?,?)", [new_insts[i]["spec"], new_insts[i]["instrument_type"], new_insts[i]["pcon"], new_insts[i]["from"], new_insts[i]["to"], new_insts[i]["flg_con"]], (err, results) =>{
                if(err){
                    console.log(err)
                    res.status(401)
                }
            })
        }
    }
}

const setInstReadyE3d = (req, res) =>{
    let currentDate = new Date()
    sql.query("UPDATE insts_generic SET ready_e3d = 1, ready_e3d_date = ? WHERE tag = ?", [currentDate, req.body.id], (err, results) =>{
        if(err){
            res.status(401)
            console.log(err)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

const cancelInstReadyE3d = (req, res) =>{
    sql.query("UPDATE csptracker SET ready_e3d = 0, ready_e3d_date = ? WHERE tag = ?", [null, req.body.tag], (err, results) =>{
        if(err){
            res.status(401)
            console.log(error)
        }else{
            res.send({success: 1}).status(200)
        }
    })
}

module.exports = {
    getInstGeneral,
    getSpecsByProject,
    getInstTypes,
    getPComs,
    getDiameters,
    submitInstGeneral,
    setInstReadyE3d,
    cancelInstReadyE3d
}