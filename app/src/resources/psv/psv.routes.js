const express = require("express");
const router = express.Router();
const psv = require("../psv/psv.controller");

//Funciona exactamente igual que expansion joins solo que con otros campos
let routes = (app) => {
  router.get("/getPSVByProject/:project_id", psv.getPSVByProject)
  router.get("/psvStatusDataByProject/:project_id", psv.psvStatusDataByProject)
  router.get("/downloadPSVByProject/:project_id", psv.downloadPSVByProject)

  router.post("/submitPSV", psv.submitPSV)
  router.post("/psvReadye3d", psv.psvReadye3d)
  router.post("/deletePSV", psv.deletePSV)
  router.post("/excludePSV", psv.excludePSV)
  router.post("/psvCancelreadye3d", psv.psvCancelreadye3d)
  app.use(router);
};

module.exports = routes;