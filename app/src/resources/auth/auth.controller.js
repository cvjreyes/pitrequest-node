const jwt = require('jsonwebtoken');
const sql = require("../../db.js");
const md5 = require("md5");


const login = async(req, res) => {
    const { email, password } = req.body;
    
    sql.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (!results[0]){
        res.status(401).send("Username or password incorrect");
      }
      else if(md5(password) !== results[0].password){
        res.status(401).send("Username or password incorrect");
      }else{
        const token = jwt.sign({email: email, role: 'admin'}, process.env.NODE_TOKEN_SECRET);
        
        res.json({
          token: token,
          user: email
        });
      }
    })       
    console.log("The user "+ email +" logged in.");    
};

module.exports = {
  login
};

