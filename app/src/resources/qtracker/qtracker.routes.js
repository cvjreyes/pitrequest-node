module.exports = app => {
    const qtracker = require("./qtracker.controller.js");

    app.post("/qtracker/requestNWC", qtracker.requestNWC)
    app.post("/qtracker/requestNVN", qtracker.requestNVN)
    app.post("/qtracker/requestNRI", qtracker.requestNRI)
    app.post("/qtracker/requestNRB", qtracker.requestNRB)
    app.post("/qtracker/requestNRIDS", qtracker.requestNRIDS)
    app.post("/qtracker/requestRR", qtracker.requestRR)
    app.post("/qtracker/requestIS", qtracker.requestIS)
    app.post("/qtracker/uploadAttach", qtracker.uploadAttach)
    app.get("/qtracker/existsAttach/:incidence_number", qtracker.existsAttach)
    app.get("/qtracker/getAttach/:fileName", qtracker.getAttach)
    
    app.get("/qtracker/getNWC", qtracker.getNWC)
    app.get("/qtracker/getNVN", qtracker.getNVN)
    app.get("/qtracker/getNRI", qtracker.getNRI)
    app.get("/qtracker/getNRB", qtracker.getNRB)
    app.get("/qtracker/getNRIDS", qtracker.getNRIDS)
    app.get("/qtracker/getRP", qtracker.getRP)
    app.get("/qtracker/getIS", qtracker.getIS)

    app.get("/qtracker/getNWCByProjects/:email", qtracker.getNWCByProjects)
    app.get("/qtracker/getNVNByProjects/:email", qtracker.getNVNByProjects)
    app.get("/qtracker/getNRIByProjects/:email", qtracker.getNRIByProjects)
    app.get("/qtracker/getNRBByProjects/:email", qtracker.getNRBByProjects)
    app.get("/qtracker/getNRIDSByProjects/:email", qtracker.getNRIDSByProjects)
    app.get("/qtracker/getRPByProjects/:email", qtracker.getRPByProjects)
    app.get("/qtracker/getISByProjects/:email", qtracker.getISByProjects)

    app.post("/qtracker/updateStatus", qtracker.updateStatus)
    app.post("/qtracker/updateObservations", qtracker.updateObservations)
    app.post("/qtracker/updateHours", qtracker.updateHours)
    app.post("/qtracker/updatePriority", qtracker.updatePriority)

    app.get("/statusData", qtracker.statusData)
    app.get("/getProjects", qtracker.getProjects)
    app.post("/submitProjects", qtracker.submitProjects)
  };