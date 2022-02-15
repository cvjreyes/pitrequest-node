const sql = require("../../db.js");

// constructor
const User = function(user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.remember_token = user.remember_token;
  this.created_at = user.created_at;
  this.updated_at = user.updated_at;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

User.findById = (userId, result) => {
  sql.query(`SELECT * FROM users WHERE id = ${userId}`, (err, res) => {
    
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

User.findByEmail = async (userEmail, result) =>{
  sql.query(`SELECT * FROM users WHERE email = ?`,[userEmail], async (err, res) => {
    
    if (err) {
      console.log("error: ", err);
      result(err, null)
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
   
  });
};

User.findByUsername = async (email, result) =>{
  sql.query(`SELECT * FROM users WHERE email = ?`,[email], async (err, res) => {
    
    if (err) {
      console.log("error: ", err);
      result(err, null)
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
   
  });
};

User.getAll = result => {
  sql.query("SELECT * FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  sql.query(
    "UPDATE users SET email = ?, name = ?, password = ?, remember_token = ?, created_at = ?, updated_at = ? WHERE id = ?",
    [user.email, user.name, user.password, user.remember_token, user.created_at, user.updated_at, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated user: ", { id: id, ...user });
      result(null, { id: id, ...user });
    }
  );
};

User.remove = (id, result) => {
  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found user with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user with id: ", id);
    result(null, res);
  });
};

User.removeAll = result => {
  sql.query("DELETE FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

module.exports = User;