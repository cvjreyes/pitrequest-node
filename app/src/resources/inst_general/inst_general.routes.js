const express = require("express");
const router = express.Router();
const inst_general = require("../inst_general/inst_general.controller");

let routes = (app) => {
  router.get("/getInstGeneralByProject/:project_id", inst_general.getInstGeneralByProject)
  router.get("/getSpecsByProject/:project_id", inst_general.getSpecsByProject)
  router.get("/getInstTypes", inst_general.getInstTypes)
  router.get("/getPComs", inst_general.getPComs)
  router.get("/getDiameters", inst_general.getDiameters)
  router.get("/instStatusDataByProject/:project_id", inst_general.instStatusDataByProject)
  router.get("/downloadInstsGeneralByProject/:project_id", inst_general.downloadInstsGeneralByProject)
  router.get("/getSpecsByAllProjects", inst_general.getSpecsByAllProjects)

  router.post("/submitInstGeneral", inst_general.submitInstGeneral)
  router.post("/instReadyE3d", inst_general.instReadyE3d)
  router.post("/instCancelReadyE3d", inst_general.instCancelReadyE3d)
  router.post("/deleteInst", inst_general.deleteInst)
  router.post("/excludeInst", inst_general.excludeInst)
  router.post("/submitGenerics", inst_general.submitGenerics)
  router.post("/submitPcons", inst_general.submitPcons)
  router.post("/submitSpecsByProject", inst_general.submitSpecsByProject)
  router.post("/submitPIDsByProject", inst_general.submitPIDsByProject)
  app.use(router);
};

module.exports = routes;