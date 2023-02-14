module.exports = app => {
  const qtracker = require("./qtracker.controller.js");

  //Creacion de incidencias
  app.post("/qtracker/requestNWC", qtracker.requestNWC)
  app.post("/qtracker/requestNVN", qtracker.requestNVN)
  app.post("/qtracker/requestDIS", qtracker.requestDIS)
  app.post("/qtracker/requestPER", qtracker.requestPER)
  app.post("/qtracker/requestMOD", qtracker.requestMOD)
  app.post("/qtracker/requestDSO", qtracker.requestDSO)
  app.post("/qtracker/requestDOR", qtracker.requestDOR)
  app.post("/qtracker/requestCIT", qtracker.requestCIT)
  app.post("/qtracker/requestAIS", qtracker.requestAIS)
  app.post("/qtracker/requestINMG", qtracker.requestINMG)
  app.post("/qtracker/requestCHA", qtracker.requestCHA)
  app.post("/qtracker/requestOTH", qtracker.requestOTH)
  app.post("/qtracker/requestNRI", qtracker.requestNRI)
  app.post("/qtracker/requestNRB", qtracker.requestNRB)
  app.post("/qtracker/requestNRIDS", qtracker.requestNRIDS)
  app.post("/qtracker/requestRR", qtracker.requestRR)
  app.post("/qtracker/requestIS", qtracker.requestIS)

  //Subir un attach a la incidencia, comprobar si existe y obtenerlo
  app.post("/qtracker/uploadAttach", qtracker.uploadAttach)
  app.get("/qtracker/existsAttach/:incidence_number", qtracker.existsAttach)
  app.get("/qtracker/getAttach/:fileName", qtracker.getAttach)
  
  //Select de las incidencias
  app.get("/qtracker/getNWC", qtracker.getNWC)
  app.get("/qtracker/getNVN", qtracker.getNVN)
  app.get("/qtracker/getDIS", qtracker.getDIS)
  app.get("/qtracker/getPER", qtracker.getPER)
  app.get("/qtracker/getMOD", qtracker.getMOD)
  app.get("/qtracker/getDSO", qtracker.getDSO)
  app.get("/qtracker/getDOR", qtracker.getDOR)
  app.get("/qtracker/getCIT", qtracker.getCIT)
  app.get("/qtracker/getAIS", qtracker.getAIS)
  app.get("/qtracker/getINMG", qtracker.getINMG)
  app.get("/qtracker/getCHA", qtracker.getCHA)
  app.get("/qtracker/getOTH", qtracker.getOTH)
  app.get("/qtracker/getNRI", qtracker.getNRI)
  app.get("/qtracker/getNRB", qtracker.getNRB)
  app.get("/qtracker/getNRIDS", qtracker.getNRIDS)
  app.get("/qtracker/getRP", qtracker.getRP)
  app.get("/qtracker/getIS", qtracker.getIS)

  //Select de las incidencias urgentes de un usuario
  app.get("/qtracker/urgent/:email", qtracker.getUrgentIncidences)

  //Select de las incidencias por usuario
  app.get("/qtracker/getNWCByProjects/:email", qtracker.getNWCByProjects)
  app.get("/qtracker/getNVNByProjects/:email", qtracker.getNVNByProjects)
  app.get("/qtracker/getDISByProjects/:email", qtracker.getDISByProjects)
  app.get("/qtracker/getPERByProjects/:email", qtracker.getPERByProjects)
  app.get("/qtracker/getMODByProjects/:email", qtracker.getMODByProjects)
  app.get("/qtracker/getDSOByProjects/:email", qtracker.getDSOByProjects)
  app.get("/qtracker/getDORByProjects/:email", qtracker.getDORByProjects)
  app.get("/qtracker/getCITByProjects/:email", qtracker.getCITByProjects)
  app.get("/qtracker/getAISByProjects/:email", qtracker.getAISByProjects)
  app.get("/qtracker/getINMGByProjects/:email", qtracker.getINMGByProjects)
  app.get("/qtracker/getCHAByProjects/:email", qtracker.getCHAByProjects)
  app.get("/qtracker/getOTHByProjects/:email", qtracker.getOTHByProjects)
  app.get("/qtracker/getNRIByProjects/:email", qtracker.getNRIByProjects)
  app.get("/qtracker/getNRBByProjects/:email", qtracker.getNRBByProjects)
  app.get("/qtracker/getNRIDSByProjects/:email", qtracker.getNRIDSByProjects)
  app.get("/qtracker/getRPByProjects/:email", qtracker.getRPByProjects)
  app.get("/qtracker/getISByProjects/:email", qtracker.getISByProjects)

  app.post("/qtracker/updateStatus", qtracker.updateStatus) //Actualizar el status de una incidencia
  app.post("/qtracker/updateObservations", qtracker.updateObservations) //Actualizar las obsevaciones de una incidencia
  app.post("/qtracker/updateHours", qtracker.updateHours) //Actualizar las horas de una incidencia
  app.post("/qtracker/updatePriority", qtracker.updatePriority) //Actualizar la prioridad de una incidencia

  app.get("/statusData", qtracker.statusData) //Select del status de las incidencais para la grafica
  app.get("/getProjects", qtracker.getProjects) //Select de los proyectos
  app.post("/submitProjects", qtracker.submitProjects) //Submit de los proyectos

  //Descarga de las guias
  app.get("/downloadGuideES", qtracker.downloadGuideES)
  app.get("/downloadGuideEN", qtracker.downloadGuideEN)
};