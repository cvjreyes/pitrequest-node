const express = require("express");
const router = express.Router();
const inst_general = require("../inst_general/inst_general.controller");

let routes = (app) => {
  router.get("/getInstGeneral", inst_general.getInstGeneral)
  router.get("/getSpecsByProject", inst_general.getSpecsByProject)
  router.get("/getInstTypes", inst_general.getInstTypes)
  router.get("/getPComs", inst_general.getPComs)
  router.get("/getDiameters", inst_general.getDiameters)
  router.post("/submitInstGeneral", inst_general.submitInstGeneral)
  router.post("/setInstReadyE3d", inst_general.setInstReadyE3d)
  router.post("/cancelInstReadyE3d", inst_general.cancelInstReadyE3d)

  app.use(router);
};

module.exports = routes;