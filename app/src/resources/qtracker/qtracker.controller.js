const sql = require("../../db.js");
const qtrackerMiddleware = require("../qtracker/qtracker.middleware");
const nodemailer = require("nodemailer");
const path = require('path');
const fs = require("fs");
const { resourceLimits } = require("worker_threads");
const { send } = require("express/lib/response");

const requestNWC = async(req, res) =>{
    const spref = req.body.spref
    const description = req.body.description
    const email = req.body.user
    const has_attach = req.body.has_attach
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-NWC000001"
            sql.query("SELECT id FROM qtracker_not_working_component ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id, default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_not_working_component(incidence_number, project_id, spref, description, user_id, attach, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?,?,?)", [ref_code, project_id, spref, description, user_id, has_attach, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
            
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"    
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
            
                                        const html_message = "<p><b>INCIDENCE</b> NOT WORKING COMPONENT</p> <p><b>REFERENCE</b> " + ref_code + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>SPREF</b> " + spref + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
            
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                        
                                    }
                                      
                                    
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                        
                    }
                })
               
            })
        }
    })
    
}

const requestNVN = async(req, res) =>{
    const name = req.body.name
    const description = req.body.description
    const email = req.body.user
    const has_attach = req.body.has_attach
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-NVN000001"
            sql.query("SELECT id FROM qtracker_not_view_in_navis ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id, default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_not_view_in_navis(incidence_number, project_id, name, description, user_id, attach, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?,?,?)", [ref_code, project_id, name, description, user_id, has_attach, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> NOT VIEW IN NAVIS</p> <p><b>REFERENCE</b> " + ref_code + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>NAME</b> " + name + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                    
                                    
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })
    
}

const requestNRI = async(req, res) =>{
    const pipe = req.body.pipe
    const description = req.body.description
    const email = req.body.user
    const has_attach = req.body.has_attach
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-NRI000001"
            sql.query("SELECT id FROM qtracker_not_reporting_isometric ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id , default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_not_reporting_isometric(incidence_number, project_id, pipe, description, user_id, attach, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?,?,?)", [ref_code, project_id, pipe, description, user_id, has_attach, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN ISOMETRIC</p> <p><b>REFERENCE</b> " + ref_code + + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>PIPE</b> " + pipe + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                   
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })

    
}

const requestNRB = async(req, res) =>{
    const pipe = req.body.pipe
    const description = req.body.description
    const email = req.body.user
    const has_attach = req.body.has_attach
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-NRB000001"
            sql.query("SELECT id FROM qtracker_not_reporting_bfile ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id, default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id 
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_not_reporting_bfile(incidence_number, project_id, pipe, description, user_id, attach, admin_id,priority, carta) VALUES(?,?,?,?,?,?,?,?,?)", [ref_code, project_id, pipe, description, user_id, has_attach, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN BFILE</p> <p><b>REFERENCE</b> " + ref_code + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>PIPE</b> " + pipe + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })
    
}

const requestNRIDS = async(req, res) =>{
    const name = req.body.name
    const email = req.body.user
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-NRIDS000001"
            sql.query("SELECT id FROM qtracker_not_reporting_ifc_dgn_step ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id, default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_not_reporting_ifc_dgn_step(incidence_number, project_id, name, user_id, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?)", [ref_code, project_id, name, user_id, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN IFC/DGN/STEP</p> <p><b>REFERENCE</b> " + ref_code + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>NAME</b> " + name + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })
    
}

const requestRR = async(req, res) =>{
    const scope = req.body.scope
    const items = req.body.items
    const description = req.body.description
    const email = req.body.user
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-RR000001"
            sql.query("SELECT id FROM qtracker_request_report ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id, default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_request_report(incidence_number, project_id, items_to_report, scope, description, user_id, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?,?,?)", [ref_code, project_id, items, scope, description, user_id, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> REQUEST REPORT</p> <p><b>REFERENCE</b> " + ref_code + " <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>ITEMS TO REPORT</b> " + items + "</p>" + "</p> <p><b>SCOPE</b> " + scope + "</p>" + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                    
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })

    
}

const requestIS = async(req, res) =>{
    const sending = req.body.sending
    const description = req.body.description
    const email = req.body.user
    const project = req.body.project
    const priority = req.body.priority
    const carta = req.body.carta
    let user_id = null

    sql.query("SELECT code FROM projects WHERE name = ?", [project], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            let ref_code = results[0].code + "-IS000001"
            sql.query("SELECT id FROM qtracker_isometric_sending ORDER BY id DESC LIMIT 1", (err, results) =>{
                if(!results){
                    results = []
                    results[0] = null
                }
                if(!results[0]){
        
                }else{
                    ref_code = ref_code.substring(0, ref_code.length - (results[0].id + 1).toString().length) + (results[0].id + 1).toString()
                }
                sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results)=>{
                    if(!results[0]){
                        res.status(401)
                    }else{
                        user_id = results[0].id
                        sql.query("SELECT id , default_admin_id FROM projects WHERE name = ?",  [project], (err, results) =>{
                            const project_id = results[0].id
                            const admin_id = results[0].default_admin_id
                            sql.query("INSERT INTO qtracker_isometric_sending(incidence_number, project_id, sending, description, user_id, admin_id, priority, carta) VALUES(?,?,?,?,?,?,?,?)", [ref_code, project_id, sending, description, user_id, admin_id, priority, carta], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.status(401)
                                }else{
                                    
                                    if(process.env.NODE_MAILING == "1"){
                                        // create reusable transporter object using the default SMTP transport
                                        var transporter = nodemailer.createTransport({
                                            host: "es001vs0064",
                                            port: 25,
                                            secure: false,
                                            auth: {
                                                user: "3DTracker@technipenergies.com",
                                                pass: "1Q2w3e4r..24"  
                                            }
                                        });

                                        let priorityText = ""

                                        if(priority == 0){
                                            priorityText = "Low"
                                        }else if(priority == 1){
                                            priorityText = "Medium"
                                        }else{
                                            priorityText = "High"
                                        }

                                        let project_name = project

                                        if(carta){
                                            project_name + " - " + carta
                                        }
        
                                        const html_message = "<p><b>INCIDENCE</b> ISOMETRIC SENDING</p> <p><b>REFERENCE</b> " + ref_code + + " </p> <p><b>PROJECT</b> " + project_name + " </p> <p><b>USER</b> " + email + "</p> <p><b>SENDING</b> " + sending + "</p> <p><b>DESCRIPTION</b> " + description + "</p> <p><b>PRIORITY</b> " + priorityText + "</p>"
        
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
            
                                            }else{
                                                if(results[0].email == "super@user.com"){
                                                    results[0].email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: results[0].email,
                                                        subject: project + ' ' + ref_code,
                                                        text: ref_code,
                                                        
                                                        html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                
                                            }
                                        })
                                        transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: email,
                                            subject: project + ' ' + ref_code,
                                            text: ref_code,
                                            
                                            html: html_message
                                        }, (err, info) => {
                                            console.log(info.envelope);
                                            console.log(info.messageId);
                                        });
                                    }
                                   
                                    res.send({filename: ref_code}).status(200)
                                }
                            })
                        })
                    }
                })
               
            })
        }
    })

    
}

const uploadAttach = async(req, res) =>{
    try{   
        await qtrackerMiddleware.uploadAttach(req, res);
        
        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }
        
            res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
        });
            
        
    }catch(err){
        res.json({
            error: true,
          }).status(401);
    }
}

const existsAttach = async(req, res) =>{
    fileName = req.params.incidence_number
    let file = null

    fs.readdir('./app/storage/qtracker', function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (filename) {
            // Do whatever you want to do with the file
            if(fileName == path.parse(filename).name){
                file = filename
            }
        });
         if(file){
            res.send({filename: file}).status(200)
         }else{
             res.send({filename: null}).status(200)
         }
    });
  
  }

  const getAttach = async(req, res) =>{
    fileName = req.params.fileName

    var file = fs.createReadStream('./app/storage/qtracker/'+fileName); 
    file.pipe(res);
      
  
  }

const getNWC = async(req, res) =>{
    sql.query("SELECT qtracker_not_working_component.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_working_component LEFT JOIN users ON qtracker_not_working_component.user_id = users.id LEFT JOIN projects ON qtracker_not_working_component.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_working_component.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getNVN = async(req, res) =>{
    sql.query("SELECT qtracker_not_view_in_navis.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_view_in_navis LEFT JOIN users ON qtracker_not_view_in_navis.user_id = users.id LEFT JOIN projects ON qtracker_not_view_in_navis.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_view_in_navis.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getNRI = async(req, res) =>{
    sql.query("SELECT qtracker_not_reporting_isometric.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_isometric LEFT JOIN users ON qtracker_not_reporting_isometric.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_isometric.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_isometric.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getNRB = async(req, res) =>{
    sql.query("SELECT qtracker_not_reporting_bfile.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_bfile LEFT JOIN users ON qtracker_not_reporting_bfile.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_bfile.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_bfile.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getNRIDS = async(req, res) =>{
    sql.query("SELECT qtracker_not_reporting_ifc_dgn_step.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_ifc_dgn_step LEFT JOIN users ON qtracker_not_reporting_ifc_dgn_step.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_ifc_dgn_step.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_ifc_dgn_step.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getRP = async(req, res) =>{
    sql.query("SELECT qtracker_request_report.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_request_report LEFT JOIN users ON qtracker_request_report.user_id = users.id LEFT JOIN projects ON qtracker_request_report.project_id = projects.id LEFT JOIN users as admins ON qtracker_request_report.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}

const getIS = async(req, res) =>{
    sql.query("SELECT qtracker_isometric_sending.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_isometric_sending LEFT JOIN users ON qtracker_isometric_sending.user_id = users.id LEFT JOIN projects ON qtracker_isometric_sending.project_id = projects.id LEFT JOIN users as admins ON qtracker_isometric_sending.admin_id = admins.id", (err, results) =>{
        res.json({rows: results}).status(200)
    })
}


const getNWCByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_not_working_component.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_working_component LEFT JOIN users ON qtracker_not_working_component.user_id = users.id LEFT JOIN projects ON qtracker_not_working_component.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_working_component.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })

}

const getNVNByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_not_view_in_navis.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_view_in_navis LEFT JOIN users ON qtracker_not_view_in_navis.user_id = users.id LEFT JOIN projects ON qtracker_not_view_in_navis.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_view_in_navis.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })
}

const getNRIByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_not_reporting_isometric.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_isometric LEFT JOIN users ON qtracker_not_reporting_isometric.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_isometric.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_isometric.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })
}

const getNRBByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_not_reporting_bfile.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_bfile LEFT JOIN users ON qtracker_not_reporting_bfile.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_bfile.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_bfile.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })
}

const getNRIDSByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_not_reporting_ifc_dgn_step.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_not_reporting_ifc_dgn_step LEFT JOIN users ON qtracker_not_reporting_ifc_dgn_step.user_id = users.id LEFT JOIN projects ON qtracker_not_reporting_ifc_dgn_step.project_id = projects.id LEFT JOIN users as admins ON qtracker_not_reporting_ifc_dgn_step.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })
}

const getRPByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_request_report.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_request_report LEFT JOIN users ON qtracker_request_report.user_id = users.id LEFT JOIN projects ON qtracker_request_report.project_id = projects.id LEFT JOIN users as admins ON qtracker_request_report.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results})
            })
        }
    })
}

const getISByProjects = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT model_has_projects.project_id FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id WHERE users.email = ?", [email], (err, results)=>{
        if(!results[0]){
            console.log("This user has no projects assigned.")
            res.status(200)
        }else{
            let projects_ids = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].project_id)
            }
            sql.query("SELECT qtracker_isometric_sending.*, projects.name as project, projects.code as code, users.name as user, admins.name as admin FROM qtracker_isometric_sending LEFT JOIN users ON qtracker_isometric_sending.user_id = users.id LEFT JOIN projects ON qtracker_isometric_sending.project_id = projects.id LEFT JOIN users as admins ON qtracker_isometric_sending.admin_id = admins.id WHERE projects.id IN (?)",[projects_ids], (err, results)=>{
                res.json({rows: results}).status(200)
            })
        }
    })
}

const updateStatus = async(req, res) =>{
    const incidence_number = req.body.incidence_number
    const status_id = req.body.status_id
    const type = req.body.type
    const email = req.body.email
    const project = req.body.project

    console.log(incidence_number)
    

    if(type == "NWC"){
        sql.query("UPDATE qtracker_not_working_component SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT users.email, qtracker_not_working_component.user_id FROM qtracker_not_working_component JOIN users ON qtracker_not_working_component.user_id = users.id WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    let reciever_email = results[0].email
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.send({success: false}).status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_not_working_component SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            let observation = null
                                            sql.query("SELECT observations FROM qtracker_not_working_component WHERE incidence_number = ?", [incidence_number], (err, results)=>{
                                                if(results[0]){
                                                    observation = results[0].observations
                                                    console.log(observation)
                                                    var transporter = nodemailer.createTransport({
                                                        host: "es001vs0064",
                                                        port: 25,
                                                        secure: false,
                                                        auth: {
                                                            user: "3DTracker@technipenergies.com",
                                                            pass: "1Q2w3e4r..24" 
                                                        }
                                                    });
        
                                                    if(reciever_email == "super@user.com"){
                                                        reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                                    }
                        
                                                    let html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                                                    if(observation != null){
                                                        html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p> <p> Observations: " + observation  
                                                    }
                                                    transporter.sendMail({
                                                    from: '3DTracker@technipenergies.com',
                                                    to: reciever_email,
                                                    subject: project + ' ' + incidence_number + " has been " + new_status,
                                                    text: incidence_number,
                                                    
                                                    html: html_message
                                                    }, (err, info) => {
                                                        console.log(info.envelope);
                                                        console.log(info.messageId);
                                                    });
                                                }
                                            })
                                            
                                        }
                                    }
                                })

                            }
                        })
                    })

                })
                
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NVN"){
        sql.query("UPDATE qtracker_not_view_in_navis SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT user_id FROM qtracker_not_view_in_navis WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_not_view_in_navis SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            var transporter = nodemailer.createTransport({
                                                host: "es001vs0064",
                                                port: 25,
                                                secure: false,
                                                auth: {
                                                    user: "3DTracker@technipenergies.com",
                                                    pass: "1Q2w3e4r..24" 
                                                }
                                            });

                                            if(reciever_email == "super@user.com"){
                                                reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                            }
                
                                            const html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                
                                            transporter.sendMail({
                                            from: '3DTracker@technipenergies.com"',
                                            to: reciever_email,
                                            subject: project + ' ' + incidence_number + " has been " + new_status,
                                            text: incidence_number,
                                            
                                            html: html_message
                                            }, (err, info) => {
                                                console.log(info.envelope);
                                                console.log(info.messageId);
                                            });
                                        }
                                    }
                                })
                            }
                        })
                    })

                })
            
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NRI"){
        sql.query("UPDATE qtracker_not_reporting_isometric SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT user_id FROM qtracker_not_reporting_isometric WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.send({success: false}).status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_not_reporting_isometric SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            var transporter = nodemailer.createTransport({
                                                host: "es001vs0064",
                                                port: 25,
                                                secure: false,
                                                auth: {
                                                    user: "3DTracker@technipenergies.com",
                                                    pass: "1Q2w3e4r..24" 
                                                }
                                            });

                                            if(reciever_email == "super@user.com"){
                                                reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                            }
                
                                            const html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                
                                            transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: reciever_email,
                                            subject: project + ' ' + incidence_number + " has been " + new_status,
                                            text: incidence_number,
                                            
                                            html: html_message
                                            }, (err, info) => {
                                                console.log(info.envelope);
                                                console.log(info.messageId);
                                            });
                                        }
                                    }
                                })
                            }
                        })
                    })

                })
            
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NRB"){
        sql.query("UPDATE qtracker_not_reporting_bfile SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT user_id FROM qtracker_not_reporting_bfile WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.send({success: false}).status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_not_reporting_bfile SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            var transporter = nodemailer.createTransport({
                                                host: "es001vs0064",
                                                port: 25,
                                                secure: false,
                                                auth: {
                                                    user: "3DTracker@technipenergies.com",
                                                    pass: "1Q2w3e4r..24" 
                                                }
                                            });

                                            if(reciever_email == "super@user.com"){
                                                reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                            }
                
                                            const html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                
                                            transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: reciever_email,
                                            subject: project + ' ' + incidence_number + " has been " + new_status,
                                            text: incidence_number,
                                            
                                            html: html_message
                                            }, (err, info) => {
                                                console.log(info.envelope);
                                                console.log(info.messageId);
                                            });
                                        }
                                    }
                                })
                            }
                        })
                    })

                })
            }
            res.send({success: true}).status(200)
            
        })
    }else if(type == "NRIDS"){
        sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT user_id FROM qtracker_not_reporting_ifc_dgn_step WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.send({success: false}).status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            var transporter = nodemailer.createTransport({
                                                host: "es001vs0064",
                                                port: 25,
                                                secure: false,
                                                auth: {
                                                    user: "3DTracker@technipenergies.com",
                                                    pass: "1Q2w3e4r..24" 
                                                }
                                            });

                                            if(reciever_email == "super@user.com"){
                                                reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                            }
                
                                            const html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                
                                            transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: reciever_email,
                                            subject: project + ' ' + incidence_number + " has been " + new_status,
                                            text: incidence_number,
                                            
                                            html: html_message
                                            }, (err, info) => {
                                                console.log(info.envelope);
                                                console.log(info.messageId);
                                            });
                                        }
                                    }
                                })
                            }
                        })
                    })

                })
            
            res.send({success: true}).status(200)
            }
        })
    }else if(type == "RP"){
        sql.query("UPDATE qtracker_request_report SET status = ? WHERE incidence_number = ?", [status_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                let new_status
                if(status_id == 0){
                    new_status = "set to pending"
                }else if (status_id == 1){
                    new_status = "set to in progress"
                }
                else if(status_id == 2){
                    new_status = "set to ready"
                }else{
                    new_status = "rejected"
                }
                sql.query("SELECT user_id FROM qtracker_request_report WHERE incidence_number = ?", [incidence_number],(err, results)=>{
                    const reciever = results[0].user_id
                    sql.query("SELECT name FROM users WHERE email = ?", [email],(err, results)=>{
                        const username = results[0].name
                        sql.query("INSERT INTO notifications(users_id, text) VALUES(?,?)", [reciever, "Your request " + incidence_number + " has been " + new_status + " by " + username + "."], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.send({success: false}).status(401)
                            }else{
                                let currentDate = new Date()
                                sql.query("UPDATE qtracker_request_report SET accept_reject_date = ? WHERE incidence_number = ?", [currentDate, incidence_number], (err, results) =>{
                                    if(err){
                                        console.log(err)
                                        res.send({success: false}).status(401)
                                    }else{
                                        if(process.env.NODE_MAILING == "1"){
                                            var transporter = nodemailer.createTransport({
                                                host: "es001vs0064",
                                                port: 25,
                                                secure: false,
                                                auth: {
                                                    user: "3DTracker@technipenergies.com",
                                                    pass: "1Q2w3e4r..24" 
                                                }
                                            });

                                            if(reciever_email == "super@user.com"){
                                                reciever_email = "alex.dominguez-ortega@external.technipenergies.com"
                                            }
                
                                            const html_message = "<p>" + username + " has " + new_status + " your incidence with code " + incidence_number + ".</p>"
                
                                            transporter.sendMail({
                                            from: '3DTracker@technipenergies.com',
                                            to: reciever_email,
                                            subject: project + ' ' + incidence_number + " has been " + new_status,
                                            text: incidence_number,
                                            
                                            html: html_message
                                            }, (err, info) => {
                                                console.log(info.envelope);
                                                console.log(info.messageId);
                                            });
                                        }
                                    }
                                })
                            }
                        })
                    })

                })
            
            res.send({success: true}).status(200)
            }
        })
    }else{
        res.send({success: true}).status(200)
    }
}

const updateObservations = async(req, res) =>{
    const incidence_number = req.body.incidence_number
    const observation = req.body.observation

    if(incidence_number.includes("NRIDS")){
        sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{        
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NWC")){
        sql.query("UPDATE qtracker_not_working_component SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{   
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NVN")){
        sql.query("UPDATE qtracker_not_view_in_navis SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NRI")){
        sql.query("UPDATE qtracker_not_reporting_isometric SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NRB")){
        sql.query("UPDATE qtracker_not_reporting_bfile SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("RR")){
        sql.query("UPDATE qtracker_request_report SET observations = ? WHERE incidence_number = ?", [observation, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }
}

const updateHours = async(req, res) =>{
    const incidence_number = req.body.incidence_number
    const hours = req.body.hours

    if(incidence_number.includes("NRIDS")){
        sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{        
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NWC")){
        sql.query("UPDATE qtracker_not_working_component SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{   
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NVN")){
        sql.query("UPDATE qtracker_not_view_in_navis SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NRI")){
        sql.query("UPDATE qtracker_not_reporting_isometric SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("NRB")){
        sql.query("UPDATE qtracker_not_reporting_bfile SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }else if(incidence_number.includes("RR")){
        sql.query("UPDATE qtracker_request_report SET hours = ? WHERE incidence_number = ?", [hours, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                
                res.send({success: true}).status(200)
            }
        })
    }
}

const updatePriority = async(req, res) =>{
    const incidence_number = req.body.incidence_number
    const priority_id = req.body.priority_id
    const type = req.body.type
    const email = req.body.email
    const project = req.body.project

    console.log(incidence_number)
    

    if(type == "NWC"){
        sql.query("UPDATE qtracker_not_working_component SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NVN"){
        sql.query("UPDATE qtracker_not_view_in_navis SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NRI"){
        sql.query("UPDATE qtracker_not_reporting_isometric SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NRB"){
        sql.query("UPDATE qtracker_not_reporting_bfile SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "NRIDS"){
        sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }else if(type == "RP"){
        sql.query("UPDATE qtracker_request_report SET priority = ? WHERE incidence_number = ?", [priority_id, incidence_number], (err, results) =>{
            if(err){
                console.log(err)
                res.send({success: false}).status(401)
            }else{
                res.send({success: true}).status(200)
            }
        })
    }
}

const statusData = (req, res) =>{
    let pending = 0
    let progress = 0
    let accepted = 0
    let rejected = 0
    sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_not_working_component GROUP BY `status`", (err, results) =>{
        if(!results){
           
        }else if(!results[0]){
           
        }else{
            for(let i = 0; i < results.length; i++){
                if(results[i].status == 0){
                    pending += results[i].qty
                }else if(results[i].status == 1){
                    progress += results[i].qty
                }else if(results[i].status == 2){
                    accepted += results[i].qty
                }else if(results[i].status == 3){
                    rejected += results[i].qty
                }
            }
        }
        sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_not_view_in_navis GROUP BY `status`", (err, results) =>{
            if(!results){
               
            }else if(!results[0]){
               
            }else{
                for(let i = 0; i < results.length; i++){
                    if(results[i].status == 0){
                        pending += results[i].qty
                    }else if(results[i].status == 1){
                        progress += results[i].qty
                    }else if(results[i].status == 2){
                        accepted += results[i].qty
                    }else if(results[i].status == 3){
                        rejected += results[i].qty
                    }
                }
            }
            sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_not_reporting_isometric GROUP BY `status`", (err, results) =>{
                if(!results){
                   
                }else if(!results[0]){
                   
                }else{
                    for(let i = 0; i < results.length; i++){
                        if(results[i].status == 0){
                            pending += results[i].qty
                        }else if(results[i].status == 1){
                            progress += results[i].qty
                        }else if(results[i].status == 2){
                            accepted += results[i].qty
                        }else if(results[i].status == 3){
                            rejected += results[i].qty
                        }
                    }
                }
                sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_not_reporting_bfile GROUP BY `status`", (err, results) =>{
                    if(!results){
                       
                    }else if(!results[0]){
                       
                    }else{
                        for(let i = 0; i < results.length; i++){
                            if(results[i].status == 0){
                                pending += results[i].qty
                            }else if(results[i].status == 1){
                                progress += results[i].qty
                            }else if(results[i].status == 2){
                                accepted += results[i].qty
                            }else if(results[i].status == 3){
                                rejected += results[i].qty
                            }
                        }
                    }
                    sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_not_reporting_ifc_dgn_step GROUP BY `status`", (err, results) =>{
                        if(!results){
                           
                        }else if(!results[0]){
                           
                        }else{
                            for(let i = 0; i < results.length; i++){
                                if(results[i].status == 0){
                                    pending += results[i].qty
                                }else if(results[i].status == 1){
                                    progress += results[i].qty
                                }else if(results[i].status == 2){
                                    accepted += results[i].qty
                                }else if(results[i].status == 3){
                                    rejected += results[i].qty
                                }
                            }
                        }
                        sql.query("SELECT `status`, COUNT(*) as qty FROM qtracker_request_report GROUP BY `status`", (err, results) =>{
                            if(!results){
                               
                            }else if(!results[0]){
                               
                            }else{
                                for(let i = 0; i < results.length; i++){
                                    if(results[i].status == 0){
                                        pending += results[i].qty
                                    }else if(results[i].status == 1){
                                        progress += results[i].qty
                                    }else if(results[i].status == 2){
                                        accepted += results[i].qty
                                    }else if(results[i].status == 3){
                                        rejected += results[i].qty
                                    }
                                }
                            }

                            res.send({pending: pending, progress: progress, accepted: accepted, rejected: rejected}).status(200)
                        })
                    })
                })
            })
        })
    })
}

const getProjects = async(req, res) =>{
    sql.query("SELECT projects.name as name, projects.code, users.name as admin, projects.id FROM projects LEFT JOIN users ON projects.default_admin_id = users.id", (err, results) =>{
        res.json({projects : results}).status(200)
    })
}

const submitProjects = async(req, res) =>{
    const rows = req.body.rows
    for(let i = 0; i < rows.length; i++){
      if(!rows[i]["Project"] || rows[i]["Project"] == ""){
        sql.query("DELETE FROM projects WHERE id = ?", [rows[i]["id"]], (err, results)=>{
            if(err){
                console.log(err)
                res.send({success:false}).status(401)
            }
        })
      }else{
        sql.query("SELECT id FROM users WHERE name = ?", [rows[i]["Admin"]], (err, results) =>{
            if(!results[0]){
                console.log("Admin not found")
            }else{
                const admin_id = results[0].id
                sql.query("SELECT * FROM projects WHERE id = ?", [rows[i]["id"]], (err, results)=>{
                    if(!results[0]){
                      sql.query("INSERT INTO projects(name, code, default_admin_id) VALUES(?,?,?)", [rows[i]["Project"], rows[i]["Code"], admin_id], (err, results)=>{
                        if(err){
                                console.log(err)
                                res.send({success:false}).status(401)
                            }
                        })
                    }else{
                        
                        sql.query("UPDATE projects SET name = ?, code = ?, default_admin_id = ? WHERE id = ?", [rows[i]["Project"], rows[i]["Code"], admin_id, rows[i]["id"]], (err, results) =>{
                            if(err){
                                console.log(err)
                                res.send({success:false}).status(401)
                            }
                        })
                    }
                }) 
            }
        })
        
      }
    }
    res.send({success:true}).status(200)
}



module.exports = {
    requestNWC,
    requestNVN,
    requestNRI,
    requestNRB,
    requestNRIDS,
    requestRR,
    requestIS,
    uploadAttach,
    existsAttach,
    getAttach,
    getNWC,
    getNVN,
    getNRI,
    getNRB,
    getNRIDS,
    getRP,
    getIS,
    getNWCByProjects,
    getNVNByProjects,
    getNRIByProjects,
    getNRBByProjects,
    getNRIDSByProjects,
    getRPByProjects,
    getISByProjects,
    updateStatus,
    updateObservations,
    updateHours,
    updatePriority,
    statusData,
    getProjects,
    submitProjects,
    
  };