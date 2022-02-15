module.exports = app => {
    const qtracker = require("./qtracker.controller.js");

    app.post("/qtracker/requestNWC", qtracker.requestNWC)
    app.post("/qtracker/requestNVN", qtracker.requestNVN)
    app.post("/qtracker/requestNRI", qtracker.requestNRI)
    app.post("/qtracker/requestNRB", qtracker.requestNRB)
    app.post("/qtracker/requestNRIDS", qtracker.requestNRIDS)
    app.post("/qtracker/requestRR", qtracker.requestRR)
    app.post("/qtracker/uploadAttach", qtracker.uploadAttach)
    app.get("/qtracker/existsAttach/:incidence_number", qtracker.existsAttach)
    app.get("/qtracker/getAttach/:fileName", qtracker.getAttach)
    
    app.get("/qtracker/getNWC", qtracker.getNWC)
    app.get("/qtracker/getNVN", qtracker.getNVN)
    app.get("/qtracker/getNRI", qtracker.getNRI)
    app.get("/qtracker/getNRB", qtracker.getNRB)
    app.get("/qtracker/getNRIDS", qtracker.getNRIDS)
    app.get("/qtracker/getRP", qtracker.getRP)

    app.post("/qtracker/updateStatus", qtracker.updateStatus)
    app.post("/qtracker/updateObservations", qtracker.updateObservations)

    app.get("/statusData", qtracker.statusData)
    app.get("/getProjects", qtracker.getProjects)
    app.post("/submitProjects", qtracker.submitProjects)
  };