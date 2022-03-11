module.exports = app => {
    const projects = require("./projects.controller.js");

    app.get("/getProjectsByUser/:userid", projects.getProjectsByUser);
    app.get("/getProjectsByEmail/:email", projects.getProjectsByEmail);
    app.get("/getAdmins", projects.getAdmins);
    app.post("/updateProjects", projects.updateProjects);
    app.post("/changeAdmin", projects.changeAdmin);
  };