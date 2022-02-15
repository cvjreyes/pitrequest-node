const sql = require("../../db.js");

// constructor
const Role = function(role) {
  this.name = role.name;
  this.guard_name = role.guard_name;
  this.created_at = role.created_at;
  this.updated_at = role.updated_at;
};

Role.getAll = result => {
    sql.query("SELECT * FROM roles", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      result(null, res);
    });
  };


  module.exports = Role;