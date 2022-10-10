const express = require("express");
const router = express.Router();
const library = require("../library/library.controller");

let routes = (app) => {

  //Getters
  router.get("/getLibrary", library.getLibrary); //Select de todos los datos de la library
  router.get("/getProjectTypes", library.getProjectTypes); //Tipos de proyecto
  router.get("/getComponentTypes", library.getComponentTypes); //Tipos de componentes
  router.get("/getComponentBrands", library.getComponentBrands); //Marcas
  router.get("/getComponentCodes", library.getComponentCodes); //Codigos
  router.get("/getComponentDisciplines", library.getComponentDisciplines); //Disciplinas
  router.get("/getComponentNames", library.getComponentNames); //Nombres de los componentes
  router.get("/getGroupProjects", library.getGroupProjects); //Proyectos
  router.get("/getComponentImage/:componentName", library.getComponentImage); //Get de la imagen del componente
  router.get("/getComponentRFA/:componentName", library.getComponentRFA) //Get del RFA

  //Setters
  router.post("/createComponent", library.createComponent) //Crear un componente
  router.post("/updateComponent", library.updateComponent) //Actualizar un componente
  router.post("/deleteComponent", library.deleteComponent) //Eliminar un componente
  router.post("/uploadComponentImage", library.uploadComponentImage) //Subir la imagen del componente
  router.post("/uploadComponentRFA", library.uploadComponentRFA) //Subir el RFA de un componente
  router.post("/addProjectType", library.addProjectType) //Añadir un tipo de proyecto
  router.post("/addComponentType", library.addComponentType) //Añadir tipo de componente
  router.post("/addComponentBrand", library.addComponentBrand) //Añadir una marca
  router.post("/addComponentDiscipline", library.addComponentDiscipline) //Añadir una disciplina
  router.post("/updateFilters", library.updateFilters) //Actualizar los filtros
  app.use(router);

};

module.exports = routes;