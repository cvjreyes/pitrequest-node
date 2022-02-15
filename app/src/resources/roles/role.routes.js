module.exports = app => {
    const role = require("./role.controller.js");

    // Retrieve all tpipe
    app.get("/api/roles", role.findAll);
    app.get("/api/getroles/:username", role.findRolesByUsername);
    app.post("/api/roles/user", role.findByUser);
    app.get("/api/roles/acronyms", role.getAcronyms);
  };