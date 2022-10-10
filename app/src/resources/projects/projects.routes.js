module.exports = app => {
    const projects = require("./projects.controller.js");

    app.get("/getProjectsByUser/:userid", projects.getProjectsByUser); //Get de los proyectos del usuario por id
    app.get("/getProjectsByEmail/:email", projects.getProjectsByEmail); //Get de los proyectos del usuario por email
    app.get("/getAdmins", projects.getAdmins);  //Get de los admins
    app.post("/updateProjects", projects.updateProjects);  //Get de los proyectos del usuario por id
    app.post("/changeAdmin", projects.changeAdmin); //Cambio de admin
    app.get("/getTasks", projects.getTasks); //Select de las tareas
    app.get("/getTasksPopUp", projects.getTasksPopUp); //Select de las tareas para el popup de crear proyectos
    app.get("/getSoftwares", projects.getSoftwares); //Select softwares
    app.post("/createProject", projects.createProject); //Creacion de un proyecto
    app.get("/getProjectsTasks", projects.getProjectsTasks); //Cogemos las tareas de un proyecto
    app.post("/projects/updateStatus", projects.updateStatus) //Actualizamos el status de una tarea
    app.post("/projects/updateObservations", projects.updateObservations) //Actualizamos las observacion es de una tarea
    app.post("/projects/updateHours", projects.updateHours) //Actualizamos las horas de una tarea
    app.post("/changeAdminProjectTask", projects.changeAdminProjectTask) //Cambiamos el admin de una tarea
    app.get("/getProjectsTreeData", projects.getProjectsTreeData) //Get de los datos del arbol de proyectos
    app.get("/getAllPTS", projects.getAllPTS) //Select de todos los proyectos, tareas y subtareas
    app.post("/submitProjectsChanges", projects.submitProjectsChanges) //Guardamos los cambios en los proyectos
    app.get("/getSubtaskHours/:subtask", projects.getSubtaskHours) //Guardamos las horas de las subtareas
    app.post("/submitTasks", projects.submitTasks) //Guardamos las tareas
    app.post("/submitSubtasks", projects.submitSubtasks) //Guardamos las subtareas
    app.get("/isAdmin/:email", projects.isAdmin) //Comprobamos si el usuario tiene el rol de admin
    app.get("/getProjectsWithHours", projects.getProjectsWithHours) //Cogemos los proyectos con sus horas
    app.post("/submitProjectsHours", projects.submitProjectsHours) //Guaradmos los proyectos con sus horas
    app.get("/getProjectsTotalHours", projects.getProjectsTotalHours) //Cogemos los proyectos con sus horas totales (estimadas + las tareas)
    
    //Lo mismo que para projects pero para ofertas
    app.get("/getOffersWithHours", projects.getOffersWithHours)
    app.get("/getOffersTreeData", projects.getOffersTreeData)
    app.get("/getAllOTS", projects.getAllOTS)
    app.post("/submitOffersChanges", projects.submitOffersChanges)
    app.post("/submitOffersHours", projects.submitOffersHours)
    app.post("/createOffer", projects.createOffer)

    app.get("/getAllProjects", projects.getAllProjects) //Select de todos los proyectos
    app.get("/getUsersByProject/:project_id", projects.getUsersByProject) //Select de los proyectos en los que participa el usuario
  };