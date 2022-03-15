const Role = require("./role.model.js");
const sql = require("../../db.js");

// Retrieve all tpipes from the database.
exports.findAll = (req, res) => {
  Role.getAll((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving tpipes."
          });
        else res.send(data);
      });
};

exports.findByUser = async(req, res) => {
  const email = req.body;
  sql.query('SELECT * FROM users WHERE email = ?', [email.user], async (err, results) => {
    if (!results[0]){
      res.status(401).send("Username or password incorrect");
    }else{
      const user_id = results[0].id;
      sql.query('SELECT role_id FROM model_has_roles WHERE model_id = ?', [user_id], async (err, results) =>{
        if (err){
          res.status(401).send("Roles not found");
        }else{
          if(results.length > 0){
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
          sql.query(q, async (err, results) =>{
            if(err){
              console.log(err)
              res.status(401).send({roles: ""});
            }else{
              var user_roles = [];
              for (var i = 0; i < results.length; i++){
                user_roles.push(results[i].name)
              }
              res.json({
                roles: user_roles,
                email: email
              }).status(200);
            }
          })
        }else{
          res.json({roles: null, email: email}).status(200)
        }
       
        }
      })
    }
  });
}

exports.findRolesByUsername = async(req,res) =>{
  sql.query('SELECT * FROM users WHERE name = ?', [req.params.username], async (err, results) => {
    if (!results[0]){
      res.status(401).send("Username or password incorrect");
    }else{
      const user_id = results[0].id;
      sql.query('SELECT * FROM model_has_roles WHERE model_id = ?', [user_id], async (err, results) =>{
        if (err){
          res.status(401).send("Roles not found");
        }else{
          var q = 'SELECT code FROM roles WHERE id IN (';
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
          sql.query(q, async (err, results) =>{
            if(err){
              console.log(err)
              res.status(401).send("Roles not found");
            }else{
              var user_roles = [];
              for (var i = 0; i < results.length; i++){
                user_roles.push(results[i].code)
              }
              res.json({
                roles: user_roles
              });
            }
          })
       
        }
      })
    }
  });
}

exports.getAcronyms = async(req,res) =>{

    sql.query('SELECT code, name FROM roles', async (err, results) => {
      if (!results[0]){
        res.status(401).send("Role not found");
      }else{
        res.send(results)
      }
    })

}



