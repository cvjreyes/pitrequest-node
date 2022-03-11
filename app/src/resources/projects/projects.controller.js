const sql = require("../../db.js");
const nodemailer = require("nodemailer");

const getProjectsByUser = async(req, res) =>{
    const userid = req.params.userid
    sql.query("SELECT projects.id, projects.code FROM model_has_projects JOIN projects ON model_has_projects.project_id = projects.id WHERE user_id = ?", [userid], (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            let projects_ids = []
            let codes = []
            for(let i = 0; i < results.length; i++){
                projects_ids.push(results[i].id)
                codes.push(results[i].code)
            }
            
            res.send({projects: projects_ids, codes: codes}).status(200)
        }
    })
}

const getProjectsByEmail = async(req, res) =>{
    const email = req.params.email
    sql.query("SELECT projects.* FROM model_has_projects JOIN projects ON model_has_projects.project_id = projects.id JOIN users ON model_has_projects.user_id = users.id WHERE users.email = ?", [email], (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{           
            res.send({projects: results}).status(200)
        }
    })
}

const updateProjects = async(req, res) =>{
    const userid = req.body.userid
    const projects = req.body.projects
    sql.query("DELETE FROM model_has_projects WHERE user_id = ?", [userid], (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            for(let i = 0; i < projects.length; i++){
                sql.query("INSERT INTO model_has_projects(user_id, project_id) VALUES(?,?)", [userid, projects[i]], (err, results)=>{
                    if(err){
                        console.log(err)
                    }
                })
            }
            res.status(200)
        }
    })
}

const getAdmins = async(req, res) =>{
    sql.query("SELECT users.name FROM users LEFT JOIN model_has_roles ON users.id = model_has_roles.model_id WHERE role_id = 14", (err, results)=>{
        if(!results[0]){
            console.log("No admins")
            res.status(200)
        }else{
            let admins = []
            for(let i = 0; i < results.length; i++){
                admins.push(results[i].name)
            }
            res.send({admins: admins}).status(200)
        }
    })
}

const changeAdmin = async(req, res) =>{
    const current_admin_mail = req.body.currentAdmin
    const admin = req.body.admin
    const incidence_number = req.body.incidence_number
    const type = req.body.type
    sql.query("SELECT users.id, users.email FROM users WHERE name = ?", [admin], (err, results)=>{
        if(!results[0]){
            console.log("No admin")
            res.status(200)
        }else{
            const admin_id = results[0].id
            const admin_email = results[0].email
            sql.query("SELECT `name` FROM users WHERE email = ?", [current_admin_mail], (err, results)=>{
                if(!results[0]){
                    console.log("No current admin mail")
                }else{
                    const current_admin = results[0].name
                    
                    if(type == "NWC"){
                        sql.query("UPDATE qtracker_not_working_component SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_not_working_component.*, projects.name as project, users.name as user, users.email FROM qtracker_not_working_component JOIN projects ON qtracker_not_working_component.project_id = projects.id JOIN users ON qtracker_not_working_component.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> NOT WORKING COMPONENT</p> <p><b>REFERENCE</b> " + incidence_number + " </p> <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>SPREF</b> " + incidence.spref + "</p> <p><b>DESCRIPTION</b> " + incidence.description + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                                
                            }
                        })
                    }else if(type == "NVN"){
                        sql.query("UPDATE qtracker_not_view_in_navis SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_not_view_in_navis.*, projects.name as project, users.name as user, users.email FROM qtracker_not_view_in_navis JOIN projects ON qtracker_not_view_in_navis.project_id = projects.id JOIN users ON qtracker_not_view_in_navis.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> NOT VIEW IN NAVIS</p> <p><b>REFERENCE</b> " + incidence_number + " </p> <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>NAME</b> " + incidence.name + "</p> <p><b>DESCRIPTION</b> " + incidence.description + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                            }
                        })
                    }else if(type == "NRI"){
                        sql.query("UPDATE qtracker_not_reporting_isometric SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_not_reporting_isometric.*, projects.name as project, users.name as user, users.email FROM qtracker_not_reporting_isometric JOIN projects ON qtracker_not_reporting_isometric.project_id = projects.id JOIN users ON qtracker_not_reporting_isometric.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN ISOMETRIC</p> <p><b>REFERENCE</b> " + incidence_number + + " </p> <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>PIPE</b> " + incidence.pipe + "</p> <p><b>DESCRIPTION</b> " + incidence.description + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                            }
                        })
                    }else if(type == "NRB"){
                        sql.query("UPDATE qtracker_not_reporting_bfile SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_not_reporting_bfile.*, projects.name as project, users.name as user, users.email FROM qtracker_not_reporting_bfile JOIN projects ON qtracker_not_reporting_bfile.project_id = projects.id JOIN users ON qtracker_not_reporting_bfile.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN BFILE</p> <p><b>REFERENCE</b> " + incidence_number + " </p> <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>PIPE</b> " + incidence.pipe + "</p> <p><b>DESCRIPTION</b> " + incidence.description + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                            }
                        })
                    }else if(type == "NRIDS"){
                        sql.query("UPDATE qtracker_not_reporting_ifc_dgn_step SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_not_reporting_ifc_dgn_step.*, projects.name as project, users.name as user, users.email FROM qtracker_not_reporting_ifc_dgn_step JOIN projects ON qtracker_not_reporting_ifc_dgn_step.project_id = projects.id JOIN users ON qtracker_not_reporting_ifc_dgn_step.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> NOT REPORTING IN IFC/DGN/STEP</p> <p><b>REFERENCE</b> " + incidence_number + " </p> <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>NAME</b> " + incidence.name + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                            }
                        })
                    }else if(type == "RP"){
                        sql.query("UPDATE qtracker_request_report SET admin_id = ? WHERE incidence_number = ?", [admin_id, incidence_number], (err, results)=>{
                            if(err){
                                console.log(err)
                                res.status(401)
                            }else{
                                if(process.env.NODE_MAILING == "1"){
                                    sql.query("SELECT qtracker_request_report.*, projects.name as project, users.name as user, users.email FROM qtracker_request_report JOIN projects ON qtracker_request_report.project_id = projects.id JOIN users ON qtracker_request_report.user_id = users.id WHERE incidence_number = ?", [incidence_number], (err, results) =>{
                                        if(!results[0]){
                                            console.log("No admin mail")
                                        }else{
                                            const incidence = results[0]
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
        
                                            const html_message = "<p><b>INCIDENCE</b> REQUEST REPORT</p> <p><b>REFERENCE</b> " + incidence_number + " <p><b>PROJECT</b> " + incidence.project + " </p> <p><b>USER</b> " + incidence.email + "</p> <p><b>ITEMS TO REPORT</b> " + incidence.items + "</p>" + "</p> <p><b>SCOPE</b> " + incidence.scope + "</p>" + "</p> <p><b>DESCRIPTION</b> " + incidence.description + "</p>"
        
                                            sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                                if(!results[0]){
                                                    console.log("No mail")
                                                }else{
                                                        transporter.sendMail({
                                                            from: '3DTracker@technipenergies.com',
                                                            to: admin_email,
                                                            subject: "The administrator " + current_admin + " has asigned the incidence " + incidence_number + " to you",
                                                            text: incidence_number,
                                                            
                                                            html: html_message
                                                        }, (err, info) => {
                                                            console.log(info.envelope);
                                                            console.log(info.messageId);
                                                        });
                                                    
                                                }
                                            })
        
                                            }
                                        
                                        })
                                    
                                    
                                }
                                res.send({success:true}).status(200)
                            }
                        })
                    }
                }
            })
        }
    })
}

module.exports = {
    getProjectsByUser,
    getAdmins,
    getProjectsByEmail,
    updateProjects,
    changeAdmin
  };