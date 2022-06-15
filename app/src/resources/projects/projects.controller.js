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
    sql.query("SELECT projects.* FROM model_has_projects JOIN projects ON model_has_projects.project_id = projects.id JOIN users ON model_has_projects.user_id = users.id WHERE users.email = ? ORDER BY projects.name ASC", [email], (err, results)=>{
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

const getTasks = async(req, res) =>{
    sql.query("SELECT softwares.id as software_id, softwares.name as software, tasks.id as task_id, tasks.name as task, subtasks1.id as subtask_id, subtasks1.name as subtask FROM softwares LEFT JOIN tasks ON softwares.id = tasks.software_id LEFT JOIN subtasks1 ON tasks.id = subtasks1.task_id ORDER BY tasks.name ASC", (err, results)=>{
        if(!results[0]){
            console.log("No tasks created")
            res.json({tasks: null}).status(401)
        }else{
            let currentTasks = {}
            current = null
            let tasks = []
            for(let i = 0; i < results.length; i++){
                if(results[i].task_id == current){
                    currentTasks[results[i].subtask] = results[i].subtask_id
                    currentTasks["software"] = results[i].software
                }else{
                    current = results[i].task_id
                    tasks.push(currentTasks)
                    
                    currentTasks = {}
                    currentTasks[results[i].task] = results[i].task_id
                    currentTasks[results[i].subtask] = results[i].subtask_id
                    currentTasks["software"] = results[i].software
                }
            }
            tasks.push(currentTasks)
            res.json({tasks: tasks}).status(200)
        }
    })
}

const getTasksPopUp = async(req, res) =>{
    sql.query("SELECT softwares.id as software_id, softwares.name as software, tasks.id as task_id, tasks.name as task, subtasks1.id as subtask_id, subtasks1.name as subtask FROM softwares LEFT JOIN tasks ON softwares.id = tasks.software_id LEFT JOIN subtasks1 ON tasks.id = subtasks1.task_id ORDER BY software ASC", (err, results)=>{
        if(!results[0]){
            console.log("No tasks created")
            res.json({tasks: null}).status(401)
        }else{
            let softwares = {}
            let software = []
            currentSoftware = results[0].software
            let task = {}
            let subtask = {}
            for(let i = 0; i < results.length; i++){
                if(currentSoftware == results[i].software){
                    task = {}
                    if(results[i].task_id){
                        task[results[i].task_id] = results[i].task
                        software.push(task)
                    }
                    subtask = {}
                    if(results[i].subtask_id){
                        subtask[results[i].subtask_id] = results[i].subtask
                        software.push(subtask)
                    }
                }else{
                    if(software.length > 0){
                        softwares[currentSoftware] = software
                    }
                    currentSoftware = results[i].software
                    software = []
                    task = {}
                    if(results[i].task_id){
                        task[results[i].task_id] = results[i].task
                        software.push(task)
                    }
                    subtask = {}
                    if(results[i].subtask_id){
                        subtask[results[i].subtask_id] = results[i].subtask
                        software.push(subtask)
                    }
                }
            }
            if(software.length > 0){
                softwares[currentSoftware] = software
            }
            res.json({softwares: softwares}).status(200)
        }
    })
}

const getSoftwares = async(req, res) =>{
    sql.query("SELECT name FROM softwares", (err, results)=>{
        if(!results[0]){
            res.json({softwares: null}).status(401)
        }else{
            res.json({softwares: results}).status(200)
        }
    })
}

const createProject = async(req, res) =>{
    const name = req.body.name
    const code = req.body.code
    const admin = req.body.admin
    const tasks = req.body.tasks
    const hours = req.body.hours
    sql.query("SELECT id FROM users WHERE name = ?", [admin], (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            const admin_id = results[0].id
            sql.query("INSERT INTO projects(name, code, default_admin_id, sup_estihrs) VALUES(?,?,?,?)", [name, code, admin_id, hours], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(401)
                }else{
                    sql.query("SELECT id FROM projects WHERE name = ?", [name], (err, results) =>{
                        if(!results[0]){
                            res.status(401)
                        }else{
                            const project_id = results[0].id
                            if(tasks){
                                for(let i = 0; i < tasks.length; i++){
                                    sql.query("INSERT INTO project_has_tasks(project_id, subtask1_id, admin_id) VALUES(?,?,?)", [project_id, parseInt(tasks[i], 10), admin_id], (err, results) =>{
                                        if(err){
                                            console.log(err)
                                        }
                                    })

                                }
                            }
                            res.json({success: 1}).status(200)
                        }
                    })
                }
            })
        }
    })
}

const getProjectsTasks = async(req, res) =>{
    sql.query("SELECT project_has_tasks.id as id, tasks.name as task, subtasks1.name as subtask, projects.name as project, projects.code as code, project_has_tasks.created_at as date, project_has_tasks.observations, project_has_tasks.accept_reject_date, users.name as admin, project_has_tasks.status as status, project_has_tasks.realhrs as hours, subtasks1.estihrs as estimated FROM project_has_tasks JOIN projects ON project_has_tasks.project_id = projects.id JOIN subtasks1 ON project_has_tasks.subtask1_id = subtasks1.id JOIN tasks ON subtasks1.task_id = tasks.id JOIN users ON project_has_tasks.admin_id = users.id", (err, results) =>{
        if(!results[0]){
            res.status(401)
        }else{
            res.json({tasks: results}).status(200)
        }
    })
}

const updateStatus = async(req, res) =>{
    const task_id = req.body.task_id
    const status_id = req.body.status_id
    sql.query("UPDATE project_has_tasks SET status = ? WHERE id = ?", [status_id, task_id], (err, results) =>{
        if(err){
            console.log(err)
            res.send({success: false}).status(401)
        }else{
            let currentDate = new Date()
            sql.query("UPDATE project_has_tasks SET accept_reject_date = ? WHERE ID = ?", [currentDate, task_id], (err, results) =>{
                if(err){
                    console.log(err)
                    res.send({success: false}).status(401)
                }else{
                    res.send({success: true}).status(200)
                }
            })
        }
    })

}

const updateObservations = async(req, res) =>{
    const task_id = req.body.task_id
    const observation = req.body.observation

    sql.query("UPDATE project_has_tasks SET observations = ? WHERE id = ?", [observation, task_id], (err, results) =>{
        if(err){
            console.log(err)
            res.send({success: false}).status(401)
        }else{        
            res.send({success: true}).status(200)
        }
    })  
}

const updateHours = async(req, res) =>{
    const task_id = req.body.incidence_number
    const hours = req.body.hours

    sql.query("UPDATE project_has_tasks SET realhrs = ? WHERE id = ?", [hours, task_id], (err, results) =>{
        if(err){
            console.log(err)
            res.send({success: false}).status(401)
        }else{        
            res.send({success: true}).status(200)
        }
    })
}

const changeAdminProjectTask = async(req, res) =>{
    const current_admin_mail = req.body.currentAdmin
    const admin = req.body.admin
    const task_id = req.body.task_id
    sql.query("SELECT users.id, users.email FROM users WHERE name = ?", [admin], (err, results)=>{
        if(!results[0]){
            console.log("No admin")
            res.status(200)
        }else{
            const admin_id = results[0].id
            let admin_email = results[0].email
            sql.query("SELECT `name` FROM users WHERE email = ?", [current_admin_mail], (err, results)=>{
                if(!results[0]){
                    console.log("No current admin mail")
                }else{
                    const current_admin = results[0].name
                    sql.query("UPDATE project_has_tasks SET admin_id = ? WHERE id = ?", [admin_id, task_id], (err, results)=>{
                        if(err){
                            console.log(err)
                            res.status(401)
                        }else{
                            if(process.env.NODE_MAILING == "1"){
                                sql.query("SELECT tasks.name as task, subtasks1.name as subtask, projects.name as project, projects.code as code, project_has_tasks.observations,  users.name as admin, users.email as email, project_has_tasks.observations FROM project_has_tasks JOIN projects ON project_has_tasks.project_id = projects.id JOIN subtasks1 ON project_has_tasks.subtask1_id = subtasks1.id JOIN tasks ON subtasks1.task_id = tasks.id JOIN users ON project_has_tasks.admin_id = users.id", [task_id], (err, results) =>{
                                    if(!results[0]){
                                        console.log("No admin mail")
                                    }else{
                                        const task = results[0]
                                        if(!task.observations){
                                            task.observations = "None"
                                        }
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
    
                                        const html_message = "<p><b>TASK: </b>" + task.task + "</p> <p><b>SUBTASK</b> " + task.subtask + " </p> <p><b>PROJECT</b> " + task.project + " </p> <p><b>USER</b> " + task.admin + " - " + task.email + "</p> </p> <p><b>OBSERVATIONS</b> " + task.observations + "</p>"
    
                                        sql.query("SELECT email FROM users WHERE id = ?", [admin_id], (err, results) =>{
                                            if(!results[0]){
                                                console.log("No mail")
                                            }else{
                                                if(admin_email == "super@user.com"){
                                                    admin_email = "alex.dominguez-ortega@external.technipenergies.com"
                                                }
                                                    transporter.sendMail({
                                                        from: '3DTracker@technipenergies.com',
                                                        to: admin_email,
                                                        subject: "The administrator " + current_admin + " has asigned the task " +  task.task + ": " + task.subtask+ " to you",
                                                        text: task.task + ": " + task.subtask,
                                                        
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
            })
        }
    })
}

const getProjectsTreeData = async(req, res) =>{
    sql.query("SELECT projects.id as project_id, projects.name as project, projects.code as code, softwares.id as software_id, softwares.name as software, tasks.id as task_id, tasks.name as task, subtasks1.id as subtask_id, subtasks1.name as subtask, users.name as admin, subtasks1.estihrs as hours FROM projects LEFT JOIN project_has_tasks ON projects.id = project_has_tasks.project_id LEFT JOIN subtasks1 ON project_has_tasks.subtask1_id = subtasks1.id LEFT JOIN tasks ON subtasks1.task_id = tasks.id LEFT JOIN users ON project_has_tasks.admin_id = users.id LEFT JOIN softwares ON software_id = softwares.id ORDER BY project_id, task_id, subtask1_id", (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getAllPTS = async(req, res) =>{
    sql.query("SELECT name, sup_estihrs FROM projects", (err, results) =>{
        if(!results[0]){
            console.log("No hay proyectos")
        }
        const projects = results
        sql.query("SELECT tasks.name as task, softwares.name as software, subtasks1.name as subtask, subtasks1.estihrs as hours FROM tasks LEFT JOIN subtasks1 ON tasks.id = subtasks1.task_id LEFT JOIN softwares ON software_id = softwares.id",(err, results) =>{
            if(!results[0]){
                console.log("No hay tareas")
                res.json({projects: projects, tasks: null}).status(200)
            }else{
                const tasks = results
                res.json({projects: projects, tasks: tasks}).status(200)
            }
        })
        
    })
}

const submitProjectsChanges = async(req, res) =>{
    const new_nodes = req.body.new_nodes
    const removed_nodes = req.body.removed_nodes
    for(let i = 0; i < new_nodes.length; i++){
        sql.query("SELECT id, default_admin_id FROM projects WHERE projects.name = ?", [new_nodes[i].project], (err, results) =>{
            if(results[0]){
                let project_id = results[0].id
                let admin_id = results[0].default_admin_id
                sql.query("SELECT id from subtasks1 WHERE name = ?", [new_nodes[i].subtask], (err, results) =>{
                    if(results[0]){
                        let subtask_id = results[0].id
                        sql.query("INSERT INTO project_has_tasks(project_id, subtask1_id, admin_id) VALUES(?,?,?)", [project_id, subtask_id, admin_id], (err, results) =>{
                            if(err){
                                res.send({success: false}).status(401)
                            }
                        })
                    }
                })
            }
        })
    }
    for(let i = 0; i < removed_nodes.length; i++){
        sql.query("SELECT id, default_admin_id FROM projects WHERE projects.name = ?", [removed_nodes[i].project], (err, results) =>{
            if(results[0]){
                let project_id = results[0].id
                let admin_id = results[0].default_admin_id
                sql.query("SELECT id from subtasks1 WHERE name = ?", [removed_nodes[i].subtask], (err, results) =>{
                    if(results[0]){
                        let subtask_id = results[0].id
                        sql.query("DELETE FROM project_has_tasks WHERE project_id = ? AND subtask1_id = ? AND admin_id = ?", [project_id, subtask_id, admin_id], (err, results) =>{
                            if(err){
                                res.send({success: false}).status(401)
                            }
                        })
                    }
                })
            }
        })
    }

    res.send({success: true}).status(200)
}

const getSubtaskHours = async(req, res) =>{
    const subtask = req.params.subtask
    sql.query("SELECT estihrs FROM subtasks1 WHERE id = ?", [subtask], (err, results) =>{
        if(!results[0]){
            res.send({hours: null}).status(200)
        }else{
            res.send({hours: results[0].estihrs}).status(200)
        }
    })
}

const submitTasks = async(req, res) =>{
    const tasks = req.body.rows
    for(let i = 0; i < tasks.length; i++){
        if(!tasks[i]["Task"] || tasks[i]["Task"] == "" || !tasks[i]["Software"] || tasks[i]["Software"] == ""){
          sql.query("DELETE FROM tasks WHERE id = ?", [tasks[i]["id"]], (err, results)=>{
              if(err){
                  console.log(err)
                  res.send({success: false}).status(401)
              }
          })
        }else{
            sql.query("SELECT id FROM softwares WHERE name = ?", [tasks[i]["Software"]], (err, results)=>{
                if(!results[0]){
                    console.log(err)
                    res.send({success: false}).status(401)
                }else{
                    let software_id = results[0].id
                    sql.query("SELECT * FROM tasks WHERE id = ?", [tasks[i]["id"]], (err, results)=>{
                        if(!results[0]){
                        sql.query("INSERT INTO tasks(name, software_id) VALUES(?,?)", [tasks[i]["Task"], software_id], (err, results)=>{
                            if(err){
                                    console.log(err)
                                    res.send({success: false}).status(401)
                                }
                            })
                        }else{
                            sql.query("UPDATE tasks SET name = ?, software_id = ? WHERE id = ?", [tasks[i]["Task"], software_id, tasks[i]["id"]], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.send({success: false}).status(401)
                                }
                            })
                        }
                    })
                }
            })
             
        }
      }
      res.send({success: 1}).status(200)
}

const submitSubtasks = async(req, res) =>{
    const subtasks = req.body.rows

    for(let i = 0; i < subtasks.length; i++){
        if(!subtasks[i]["Task"] || subtasks[i]["Task"] == "" || !subtasks[i]["Subtask"] || subtasks[i]["Subtask"] == ""){
          sql.query("DELETE FROM subtasks1 WHERE id = ?", [subtasks[i]["id"]], (err, results)=>{
              if(err){
                  console.log(err)
                  res.send({success: false}).status(401)
              }
          })
        }else if (subtasks[i]["Subtask"] == "null"){
        }else{
            sql.query("SELECT id FROM tasks WHERE name = ?", [subtasks[i]["Task"]], (err, results)=>{
                if(!results[0]){
                    res.send({success: false}).status(401)
                }else{
                    let task_id = results[0].id
                    sql.query("SELECT * FROM subtasks1 WHERE id = ?", [subtasks[i]["id"]], (err, results)=>{
                        if(!results[0]){
                            sql.query("INSERT INTO subtasks1(name, task_id, estihrs) VALUES(?,?,?)", [subtasks[i]["Subtask"], task_id, subtasks[i]["Hours"]], (err, results)=>{
                                if(err){
                                    console.log(err)
                                    res.send({success: false}).status(401)
                                }
                            })
                        }else{
                            sql.query("UPDATE subtasks1 SET name = ?, task_id = ?, estihrs = ? WHERE id = ?", [subtasks[i]["Subtask"], task_id, subtasks[i]["Hours"], subtasks[i]["id"]], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.send({success: false}).status(401)
                                }
                            })
                        }
                    })
                }
        })
      }
    }
      res.send({success: 1}).status(200)
}

const isAdmin = async(req, res) =>{
    sql.query("SELECT * FROM model_has_roles JOIN users ON model_has_roles.model_id = users.id WHERE model_has_roles.role_id = 14 AND users.email = ?", [req.params.email], (err, results) =>{
        if(!results[0]){
            res.send({isAdmin: false}).status(200)
        }else{
            res.send({isAdmin: true}).status(200)
        }
    })
}

const getProjectsWithHours = async(req, res) =>{
    sql.query("SELECT projects.*, users.name as admin FROM projects LEFT JOIN users ON projects.default_admin_id = users.id", (err, results) =>{
        if(!results[0]){
            res.send({success: false}).status(401)
        }else{
            res.json({projects: results}).status(200)
        }
    })
}

const submitProjectsHours = async(req, res) =>{
    const projects = req.body.rows
    for(let i = 0; i < projects.length; i++){
        if(!projects[i]["Project"] || projects[i]["Project"] == ""){
          
        }else{
            sql.query("SELECT id FROM projects WHERE name = ?", [projects[i]["Project"]], (err, results)=>{
                if(!results[0]){
                    res.send({success: false}).status(401)
                }else{
                    sql.query("SELECT id FROM users WHERE name = ?", [projects[i]["Admin"]], (err, results)=>{
                        if(!results[0]){
                            res.send({success: false}).status(401)
                        }else{
                            let admin_id = results[0].id
                            sql.query("SELECT * FROM projects WHERE id = ?", [projects[i]["id"]], (err, results)=>{
                                if(results[0]){
                                    sql.query("UPDATE projects SET name = ?, sup_estihrs = ?, default_admin_id = ? WHERE id = ?", [projects[i]["Project"],  projects[i]["Hours"], admin_id, projects[i]["id"]], (err, results) =>{
                                        if(err){
                                            console.log(err)
                                            res.send({success: false}).status(401)
                                        }
                                    })
                                }
                            })
                        }
                    })
                    
                }
        })
      }
    }
      res.send({success: 1}).status(200)
}

const getProjectsTotalHours = async(req, res) =>{
    sql.query("SELECT t.name as name , t.sup_estihrs as estimated, SUM(t.hours) as hours FROM (SELECT projects.name, hours, sup_estihrs FROM qtracker_not_reporting_ifc_dgn_step RIGHT JOIN projects ON qtracker_not_reporting_ifc_dgn_step.project_id = projects.id UNION ALL SELECT projects.name, hours, sup_estihrs FROM qtracker_not_view_in_navis RIGHT JOIN projects ON qtracker_not_view_in_navis.project_id = projects.id UNION ALL SELECT projects.name, hours, sup_estihrs FROM qtracker_not_reporting_isometric RIGHT JOIN projects ON qtracker_not_reporting_isometric.project_id = projects.id UNION ALL SELECT projects.name, hours, sup_estihrs FROM qtracker_not_working_component RIGHT JOIN projects ON qtracker_not_working_component.project_id = projects.id UNION ALL SELECT projects.name, hours, sup_estihrs FROM qtracker_request_report RIGHT JOIN projects ON qtracker_request_report.project_id = projects.id) t GROUP BY t.name", (err, results) =>{
        if(!results[0]){
            res.send({success: false}).status(401)
        }else{
            res.json({projects: results}).status(200)
        }
    })
}

const getOffersWithHours = async(req, res) =>{
    sql.query("SELECT offers.* FROM offers", (err, results) =>{
        if(!results[0]){
            res.send({success: false}).status(401)
        }else{
            res.json({offers: results}).status(200)
        }
    })
}

const getOffersTreeData = async(req, res) =>{
    sql.query("SELECT offers.id as offer_id, offers.name as offer, offers.code as code, softwares.id as software_id, softwares.name as software, tasks.id as task_id, tasks.name as task, subtasks1.id as subtask_id, subtasks1.name as subtask, subtasks1.estihrs as hours FROM offers LEFT JOIN offer_has_tasks ON offers.id = offer_has_tasks.offer_id LEFT JOIN subtasks1 ON offer_has_tasks.subtask1_id = subtasks1.id LEFT JOIN tasks ON subtasks1.task_id = tasks.id LEFT JOIN softwares ON software_id = softwares.id ORDER BY offer_id, task_id, subtask1_id", (err, results) =>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            res.json({rows: results}).status(200)
        }
    })
}

const getAllOTS = async(req, res) =>{
    sql.query("SELECT name, sup_estihrs FROM offers", (err, results) =>{
        if(!results[0]){
            console.log("No hay ofertas")
        }
        const offers = results
        sql.query("SELECT tasks.name as task, softwares.name as software, subtasks1.name as subtask, subtasks1.estihrs as hours FROM tasks LEFT JOIN subtasks1 ON tasks.id = subtasks1.task_id LEFT JOIN softwares ON software_id = softwares.id",(err, results) =>{
            if(!results[0]){
                console.log("No hay tareas")
                res.json({offers: offers, tasks: null}).status(200)
            }else{
                const tasks = results
                res.json({offers: offers, tasks: tasks}).status(200)
            }
        })
        
    })
}

const submitOffersChanges = async(req, res) =>{
    const new_nodes = req.body.new_nodes
    const removed_nodes = req.body.removed_nodes
    for(let i = 0; i < new_nodes.length; i++){
        sql.query("SELECT id FROM offers WHERE offers.name = ?", [new_nodes[i].offer], (err, results) =>{
            if(results[0]){
                let offer_id = results[0].id
                sql.query("SELECT id from subtasks1 WHERE name = ?", [new_nodes[i].subtask], (err, results) =>{
                    if(results[0]){
                        let subtask_id = results[0].id
                        sql.query("INSERT INTO offer_has_tasks(offer_id, subtask1_id) VALUES(?,?)", [offer_id, subtask_id], (err, results) =>{
                            if(err){
                                res.send({success: false}).status(401)
                            }
                        })
                    }
                })
            }
        })
    }
    for(let i = 0; i < removed_nodes.length; i++){
        sql.query("SELECT id FROM offers WHERE offers.name = ?", [removed_nodes[i].offer], (err, results) =>{
            if(results[0]){
                let offer_id = results[0].id
                sql.query("SELECT id from subtasks1 WHERE name = ?", [removed_nodes[i].subtask], (err, results) =>{
                    if(results[0]){
                        let subtask_id = results[0].id
                        sql.query("DELETE FROM offer_has_tasks WHERE offer_id = ? AND subtask1_id = ?", [offer_id, subtask_id], (err, results) =>{
                            if(err){
                                res.send({success: false}).status(401)
                            }
                        })
                    }
                })
            }
        })
    }

    res.send({success: true}).status(200)
}

const submitOffersHours = async(req, res) =>{
    const offers = req.body.rows
    for(let i = 0; i < offers.length; i++){
        if(!offers[i]["Offer"] || offers[i]["Offer"] == ""){
          
        }else{
            sql.query("SELECT id FROM offers WHERE name = ?", [offers[i]["Offer"]], (err, results)=>{
                if(!results[0]){
                    res.send({success: false}).status(401)
                }else{
                    sql.query("SELECT * FROM offers WHERE id = ?", [offers[i]["id"]], (err, results)=>{
                        if(results[0]){
                            sql.query("UPDATE offers SET name = ?, sup_estihrs = ? WHERE id = ?", [offers[i]["Offer"],  offers[i]["Hours"],  offers[i]["id"]], (err, results) =>{
                                if(err){
                                    console.log(err)
                                    res.send({success: false}).status(401)
                                }
                            })
                        }
                    })
                                      
                }
        })
      }
    }
      res.send({success: 1}).status(200)
}

const createOffer = async(req, res) =>{
    const name = req.body.name
    const code = req.body.code
    const tasks = req.body.tasks
    const hours = req.body.hours

    sql.query("INSERT INTO offers(name, code, sup_estihrs) VALUES(?,?,?)", [name, code, hours], (err, results)=>{
        if(err){
            console.log(err)
            res.status(401)
        }else{
            sql.query("SELECT id FROM offers WHERE name = ?", [name], (err, results) =>{
                if(!results[0]){
                    res.status(401)
                }else{
                    const offer_id = results[0].id
                    if(tasks){
                        for(let i = 0; i < tasks.length; i++){
                            sql.query("INSERT INTO offer_has_tasks(offer_id, subtask1_id) VALUES(?,?)", [offer_id, parseInt(tasks[i], 10)], (err, results) =>{
                                if(err){
                                    console.log(err)
                                }
                            })

                        }
                    }
                    res.json({success: 1}).status(200)
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
    changeAdmin,
    getTasks,
    getTasksPopUp,
    getSoftwares,
    createProject,
    getProjectsTasks,
    updateStatus,
    updateObservations,
    updateHours,
    changeAdminProjectTask,
    getProjectsTreeData,
    getAllPTS,
    submitProjectsChanges,
    getSubtaskHours,
    submitTasks,
    submitSubtasks,
    isAdmin,
    getProjectsWithHours,
    submitProjectsHours,
    getProjectsTotalHours,
    getOffersWithHours,
    getOffersTreeData,
    getAllOTS,
    submitOffersChanges,
    submitOffersHours,
    createOffer
  };