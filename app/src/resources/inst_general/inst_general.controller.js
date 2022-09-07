const sql = require("../../db.js");
const fs = require("fs");
const drawingMiddleware = require("../inst_general/inst_general.middleware");
var path = require('path')

const getInstGeneral = async(req, res) =>{
    sql.query("SELECT specs.spec as specs, instrument_types.type as instrument_types, pcons.name as pcons_name, diameters_from.dn as diameters_from_dn, diameters_to.dn as diameters_to_dn, csptracker_bolt_types.`type` as csptracker_bolt_types, ready_load, ready_load_date, ready_e3d, ready_e3d_date, comments, updated, insts_generic.updated_at as insts_generic_updated_at FROM insts_generic LEFT JOIN specs ON spec_id = specs.id LEFT JOIN instrument_types ON instrument_types_id = instrument_types.id LEFT JOIN pcons ON pcon_id = pcons.id LEFT JOIN diameters as diameters_from ON from_diameter_id = diameters_from.id LEFT JOIN diameters as diameters_to ON to_diameter_id = diameters_to.id LEFT JOIN csptracker_bolt_types ON flg_con_id = csptracker_bolt_types.id", (err, results) =>{
        if(!results[0]){
            res.send({rows: []}).status(200)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getSpecsByProject = async(req, res) =>{
    sql.query("SELECT spec FROM specs JOIN project_has_specs ON specs.id = project_has_specs.spec_id JOIN projects ON project_has_specs.project_id = ?", (err, results) =>{
        if(!results[0]){
            res.send({specs: []}).status(200)
        }else{
            res.json({specs: results}).status(200)
        }
    })
}

const getInstTypes = async(req, res) =>{
    sql.query("SELECT type FROM instrument_types", (err, results) =>{
        if(!results[0]){
            res.send({instrument_types: []}).status(200)
        }else{
            res.json({instrument_types: results}).status(200)
        }
    })
}

const getPComs = async(req, res) =>{
    sql.query("SELECT `name` FROM pcons", (err, results) =>{
        if(!results[0]){
            res.send({pcons: []}).status(200)
        }else{
            res.json({pcons: results}).status(200)
        }
    })
}


module.exports = {
    getInstGeneral,
    getSpecsByProject,
    getInstTypes,
    getPComs
}