module.exports = app => {
    const projects = require("./projects.controller.js");

    app.get("/getProjectsByUser/:userid", projects.getProjectsByUser);
    app.get("/getProjectsByEmail/:email", projects.getProjectsByEmail);
    app.get("/getAdmins", projects.getAdmins);
    app.post("/updateProjects", projects.updateProjects);
    app.post("/changeAdmin", projects.changeAdmin);
    app.get("/getTasks", projects.getTasks);
    app.get("/getTasksPopUp", projects.getTasksPopUp);
    app.get("/getSoftwares", projects.getSoftwares);
    app.post("/createProject", projects.createProject);
    app.get("/getProjectsTasks", projects.getProjectsTasks);
    app.post("/projects/updateStatus", projects.updateStatus)
    app.post("/projects/updateObservations", projects.updateObservations)
    app.post("/projects/updateHours", projects.updateHours)
    app.post("/changeAdminProjectTask", projects.changeAdminProjectTask)
    app.get("/getProjectsTreeData", projects.getProjectsTreeData)
    app.get("/getAllPTS", projects.getAllPTS)
    app.post("/submitProjectsChanges", projects.submitProjectsChanges)
    app.get("/getSubtaskHours/:subtask", projects.getSubtaskHours)
    app.post("/submitTasks", projects.submitTasks)
    app.post("/submitSubtasks", projects.submitSubtasks)
    app.get("/isAdmin/:email", projects.isAdmin)
    app.get("/getProjectsWithHours", projects.getProjectsWithHours)
    app.post("/submitProjectsHours", projects.submitProjectsHours)
    app.get("/getProjectsTotalHours", projects.getProjectsTotalHours)
    app.get("/getOffersWithHours", projects.getOffersWithHours)
    app.get("/getOffersTreeData", projects.getOffersTreeData)
    app.get("/getAllOTS", projects.getAllOTS)
    app.post("/submitOffersChanges", projects.submitOffersChanges)
    app.post("/submitOffersHours", projects.submitOffersHours)
    app.post("/createOffer", projects.createOffer)
  };