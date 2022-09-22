const express = require("express");
const router = express.Router();
const special_instruments = require("../special_instruments/special_instruments.controller");

let routes = (app) => {
  router.get("/getSpecialsByProject/:project_id", special_instruments.getSpecialsByProject)
  router.get("/specialsStatusDataByProject/:project_id", special_instruments.specialsStatusDataByProject)
  router.get("/downloadSpecialsByProject/:project_id", special_instruments.downloadSpecialsByProject)
  router.get("/specialsDrawingCodes", special_instruments.specialsDrawingCodes)
  router.get("/getSpecialsDrawing", special_instruments.getSpecialsDrawing)

  router.post("/submitSpecialInstruments", special_instruments.submitSpecials)
  router.post("/specialsReadye3d", special_instruments.specialsReadye3d)
  router.post("/deleteSpecials", special_instruments.deleteSpecials)
  router.post("/excludeSpecials", special_instruments.excludeSpecials)
  router.post("/specialsCancelreadye3d", special_instruments.specialsCancelreadye3d)
  router.post("/uploadSpecialsDrawing", special_instruments.uploadSpecialsDrawing);
  router.post("/uploadSpecialsDrawingDB", special_instruments.uploadSpecialsDrawingDB);
  router.post("/updateSpecialsDrawing", special_instruments.updateSpecialsDrawing)
  router.post("/updateSpecialsDrawingDB", special_instruments.updateSpecialsDrawingDB)
  app.use(router);
};

module.exports = routes;