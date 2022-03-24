const User = require("./user.model.js");
const sql = require("../../db.js");
const md5 = require("md5");

// Create and Save a new user
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    remember_token: req.body.remember_token,
    created_at: req.body.created_at,
    updated_at: req.body.updated_at
  });

  // Save user in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the user."
      });
    else res.send(data);
  });
};

// Retrieve all users from the database.
exports.findAll = (req, res) => {
    User.getAll((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving users."
          });
        else res.send(data);
      });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.userId, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found user with id ${req.params.userId}.`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving user with id " + req.params.userId
            });
          }
        } else res.send(data);
      });
};

// Find a single user with a user email
exports.findOneByEmail = (req, res) => {
  User.findByEmail(req.params.userEmail, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with email ${req.params.userEmail}.`
          });
        } else {
          res.status(500).send({
            message: "Error retrieving user with email " + req.params.userEmail
          });
        }
      } else res.send(data);
    });
};

exports.findOneByUsername = (req,res) =>{
  User.findByUsername(req.body.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with email ${req.body.email}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with email " + req.body.email
        });
      }
    } else res.send(data);
  });
}

// Update a user identified by the userId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
        message: "Content can not be empty!"
        });
    }

    User.updateById(
        req.params.userId,
        new User(req.body),
        (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
            res.status(404).send({
                message: `Not found user with id ${req.params.userId}.`
            });
            } else {
            res.status(500).send({
                message: "Error updating use with id " + req.params.userId
            });
            }
        } else res.send(data);
        }
    );
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {

    sql.query("SELECT name FROM users WHERE id = ?", [req.params.userId], (err, results)=>{
      const username = results[0].name
      User.remove(req.params.userId, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found use with id ${req.params.userId}.`
            });
          } else {
            res.status(500).send({
              message: "Could not delete user with id " + req.params.userId
            });
          }
        } else res.send({ message: `User was deleted successfully!` });
      
      })
    })
   
};

// Delete all users from the database.
exports.deleteAll = (req, res) => {
    User.removeAll((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while removing all users."
          });
        else res.send({ message: `All users were deleted successfully!` });
      });
};

exports.getUsersByTab = (req,res) =>{
  const tab = req.params.tab
  let ids = []
  sql.query("SELECT id FROM roles WHERE name = ?", [tab], (err, results) =>{
    if(results[0].id == 1){
      ids.push(1)
      ids.push(2)
    }else if (results[0].id === 3){
      ids.push(3)
      ids.push(4)
    }else if(results[0].id === 5){
      ids.push(5)
      ids.push(6)
    }else{
      ids.push(results[0].id)
    }
    let users_id = []
    let ids_q = "("

    if (ids.length === 1){
      ids_q += ids[0] + ")";
    }else if(ids.length === 2){
      ids_q += ids[0] + "," + ids[1] + ")";
    }else{
      for (let i = 0; i < ids.length; i++){
        if(i === 0){
          ids_q += ids[i];
        }else if(i === ids.length - 1){
          ids_q += ids[i] + ")";                
        }else{
          ids_q += "," + ids[i];
        }
      }
    }

    let q = "SELECT model_id FROM model_has_roles WHERE role_id IN " + ids_q
    sql.query(q, (err, results) =>{
      if(!results[0]){
        res.status(401).send("Not found")
      }else{
        let users_ids_q = ""
        ids_q = "("

        if (results.length === 1){
          ids_q += results[0].model_id + ")";
        }else if(results.length === 2){
          ids_q += results[0].model_id + "," + results[1].model_id + ")";
        }else{
          for (let i = 0; i < results.length; i++){
            if(i === 0){
              ids_q += results[i].model_id;
            }else if(i === results.length - 1){
              ids_q += "," + results[i].model_id + ")";                
            }else{
              ids_q += "," + results[i].model_id;
            }
          }
        }
        let q2 = "SELECT name FROM users WHERE id IN " + ids_q
        sql.query(q2, (err, results) =>{
          if(!results[0]){
            res.status(401).send("No users with that role")
          }else{
            usernames = []
            for(let i = 0; i < results.length; i++){
              usernames.push(results[i].name)
            }
            res.json({
              usernames: usernames
            })
          }
        })
      }
      
    })

  })
}

exports.getPassword = (req,res) =>{
  sql.query("SELECT password FROM users WHERE email = ?", [req.body.email], (err,results)=>{
    if(!results[0]){
      res.status(401)
    }else{
      const password = results[0].password
      const introduced = md5(req.body.password)
      if(password == introduced){
        res.json({
          password: "correct"
        }).status(200)
      }else{
        res.json({
          password: "incorrect"
        }).status(200)
      }
    }
  })
} 
exports.changePassword = (req,res) =>{
  const email = req.body.email
  const newPassword = md5(req.body.newPassword)
  sql.query("UPDATE users SET password = ? WHERE email = ?", [newPassword, email], (err, results)=>{
    if(err){
      res.status(401)
    }else{
      console.log("password changed")
      res.status(200).send({changed: true})
    }
  })
}

exports.createUser = (req, res) =>{
  const { username, email, roles} = req.body;

    sql.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, md5("123456")], async (err, result)=>{
        if(err){
            console.log(err)
            res.status(401).send({error: "Error"});
        }else{
            for(let i = 0; i < roles.length; i++){
              sql.query('SELECT id FROM roles WHERE code = ?', [roles[i]], async(err, result) =>{
                  if(err){
                      console.log(err)
                      res.status(401).send({error: "Error"});
                  }else{
                      const role_id = result[0].id;
                      sql.query('SELECT id FROM users WHERE email = ?', [email], async(err, result) =>{
                          if (err){
                              console.log(err);
                              res.status(401).send({error: "Error"});
                          }else{
                              const user_id = result[0].id;
                              sql.query('INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (?,?,?)', [role_id, user_id, "App/User"], async(err, result) =>{
                                  if (err) {
                                      console.log(err);
                                      res.status(401).send({error: "Error"});
                                  }
                              })
                          }
                      })
                  }
              })
          }
          res.send({success: 1}).status(200)
        }
        
    })
}
exports.usersWithRoles = (req, res) =>{
  const { username, email, roles} = req.body;
  sql.query("SELECT * FROM users", (err, results) => {
    if (err) {
      res.status(401).send({error: 1})
    }else{
      const users = results
      
      for(let j = 0; j < users.length; j++){
        let email = users[j].email;
        sql.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
          if (!results[0]){
            res.status(401).send("Username or password incorrect");
          }else{
            const user_id = results[0].id;
            sql.query('SELECT role_id FROM model_has_roles WHERE model_id = ?', [user_id], async (err, results) =>{
              if (err){
                res.status(401).send("Roles not found");
              }else{
                var q = 'SELECT name FROM roles WHERE id IN (';
                if (results.length === 1){
                  q += results[0].role_id + ")";
                }else if(results.length === 2){
                  q += results[0].role_id + "," + results[1].role_id + ")";
                }else{
                  for (var i = 0; i < results.length; i++){
                    if(i === 0){
                      q += results[i].role_id;
                    }else if(i === results.length - 1){
                      q += "," + results[i].role_id + ")";                
                    }else{
                      q += "," + results[i].role_id;
                    }
                  }
                }
                let user = []

                sql.query(q, async (err, results) =>{
                  if(err){
                    user = [users[j], []]
                  }else{
                    var user_roles = [];
                    for (var i = 0; i < results.length; i++){
                      user_roles.push(results[i].name)
                    }
                    user = [users[j], user_roles]
                      
                  }
                  allUsers.push(user)   

                     
                  
                })
              }
            });
          }
        })
      }
    }
  })
  
  res.json({
    users: allUsers
  }).status(401)
    
  
}

exports.manageRoles = (req, res) =>{
  const userId = req.body.id
  const roles = req.body.roles
  sql.query("DELETE FROM model_has_roles WHERE model_id = ?", [userId], (err, results) =>{
    if(err){
      res.status(401)
    }else{
      for(let i = 0; i < roles.length; i++){
        sql.query("SELECT id as role_id FROM roles WHERE code = ?", [roles[i]], (err, results)=>{
          if(!results[0]){
            res.status(401)
          }else{
            let role_id = results[0].role_id
            sql.query("INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (?,?,?)", [role_id, userId, "App/User"], (err, results)=>{
              if(err){
                res.status(401)
              }
            })
          }
        })
      }
      res.send({success: 1}).status(201)
    }
  })
}

exports.notifications = (req, res) =>{
  const email = req.params.email
  sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
    if(!results[0]){
      res.status(401)
    }else{
      const userid = results[0].id
      sql.query("SELECT * FROM notifications WHERE users_id = ? ORDER BY id DESC", [userid], (err, results)=>{
          if(err){
              console.log(err)
              res.status(401)
          }else{
              res.send({rows: results}).status(200)
          }
      })
    }
      
  })
}

exports.markAllNotificationsAsRead = (req, res) =>{
  const email = req.body.email
  sql.query("SELECT id FROM users WHERE email = ?", [email],(err, results)=>{
      const userid = results[0].id
      sql.query("UPDATE notifications SET `read` = 1 WHERE users_id = ?", [userid], (err, results)=>{
          if(err){
              console.log(err)
              res.status(401)
          }else{
              res.send({success: 1}).status(200)
          }
      })
  })
}

exports.markNotificationAsUnread = (req, res) =>{
  sql.query("UPDATE notifications SET `read` = 0 WHERE id = ?", [req.body.id], (err, results)=>{
    if(err){
        console.log(err)
        res.status(401)
    }else{
        res.send({success: 1}).status(200)
    }
  })
}

exports.markNotificationAsRead = (req, res) =>{
  sql.query("UPDATE notifications SET `read` = 1 WHERE id = ?", [req.body.id], (err, results)=>{
    if(err){
        console.log(err)
        res.status(401)
    }else{
        res.send({success: 1}).status(200)
    }
  })
}

exports.deleteNotification = (req, res) =>{
  sql.query("DELETE FROM notifications  WHERE id = ?", [req.body.id], (err, results)=>{
    if(err){
        console.log(err)
        res.status(401)
    }else{
        res.send({success: 1}).status(200)
    }
  })
}

exports.downloadUsers = async(req, res) =>{
  await sql.query("SELECT users.name, users.email, users.name as roles, users.name as projects FROM users", async(err, results)=>{
      res.json({rows: results}).status(200)
  }) 
}

exports.getRolesByEmail = async(req, res) =>{
  const email = req.params.email
  await sql.query("SELECT roles.name FROM users JOIN model_has_roles ON users.id = model_has_roles.model_id JOIN roles ON model_has_roles.role_id = roles.id WHERE users.email = ?", [email], async(err, results)=>{
      if(!results){
          res.json({rows: null}).status(200)
      }else{
          res.json({rows: results}).status(200)
      }
  })
}

exports.getProjectsByEmailExport = async(req, res) =>{
  const email = req.params.email
  await sql.query("SELECT projects.name FROM users JOIN model_has_projects ON users.id = model_has_projects.user_id JOIN projects ON model_has_projects.project_id = projects.id WHERE users.email = ?", [email], async(err, results)=>{
      if(!results[0]){
          res.json({rows: null}).status(200)
      }else{
          res.json({rows: results}).status(200)
      }  
  })
}

exports.getUsersFull = async(req, res) =>{
  await sql.query("SELECT * FROM users_view", (err, results)=>{
    if(!results[0]){
      res.status(200)
    }else{
      res.json({rows: results}).status(200)
    }
  })
}