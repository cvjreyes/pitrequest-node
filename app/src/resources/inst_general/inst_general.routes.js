const express = require("express");
const router = express.Router();
const inst_general = require("../inst_general/inst_general.controller");

let routes = (app) => {
  router.get("/getInstGeneral", inst_general.getInstGeneral)
  router.get("/getSpecsByProject", inst_general.getSpecsByProject)
  router.get("/getInstTypes", inst_general.getInstTypes)
  router.get("/getPComs", inst_general.getPComs)
  app.use(router);
};

module.exports = routes;