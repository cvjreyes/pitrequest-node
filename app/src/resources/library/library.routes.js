const express = require("express");
const router = express.Router();
const library = require("../library/library.controller");

let routes = (app) => {

  //Getters
  router.get("/getLibrary", library.getLibrary);
  router.get("/getProjectTypes", library.getProjectTypes);
  router.get("/getComponentTypes", library.getComponentTypes);
  router.get("/getComponentBrands", library.getComponentBrands);
  router.get("/getComponentCodes", library.getComponentCodes);
  router.get("/getComponentDisciplines", library.getComponentDisciplines);
  router.get("/getComponentNames", library.getComponentNames);
  router.get("/getGroupProjects", library.getGroupProjects);
  router.get("/getComponentImage/:componentName", library.getComponentImage);
  router.get("/getComponentRFA/:componentName", library.getComponentRFA)

  //Setters
  router.post("/createComponent", library.createComponent)
  router.post("/updateComponent", library.updateComponent)
  router.post("/deleteComponent", library.deleteComponent)
  router.post("/uploadComponentImage", library.uploadComponentImage)
  router.post("/uploadComponentRFA", library.uploadComponentRFA)
  router.post("/addProjectType", library.addProjectType)
  router.post("/addComponentType", library.addComponentType)
  router.post("/addComponentBrand", library.addComponentBrand)
  router.post("/addComponentDiscipline", library.addComponentDiscipline)
  app.use(router);

};

module.exports = routes;