const express = require("express");
const router = express.Router();
const controller = require("../csptracker/csptracker.controller");

let routes = (app) => {
  router.get("/csptracker", controller.csptracker); //Get de todos los datos de sptracker
  router.post("/readye3d", controller.readye3d); //Poner una pieza especial en ready e3d
  router.post("/cancelreadye3d", controller.cancelReadye3d); //Cancelar el ready e3d
  router.post("/uploadDrawing", controller.uploadDrawing); //Subir un dibujo
  router.post("/uploadDrawingDB", controller.uploadDrawingDB); //indicar en la bd que se ha subido un dibujo
  router.post("/updateDrawing", controller.updateDrawing) //Actualizar un dibujo  
  router.post("/updateDrawingDB", controller.updateDrawingDB) //Indicar en la bd que se ha actualizado un dibujo 
  router.post("/editCSP", controller.editCSP) //No se usa
  router.post("/exitEditCSP", controller.exitEditCSP) //No se usa
  router.get("/getDrawing/:fileName", controller.getDrawing) //Get de un dibujo
  router.get("/getListsData", controller.getListsData) //Get de toda la informacion referente a los atriburos que componen un especial (diametro, rating, etc)
  router.post("/submitCSP", controller.submitCSP) //Post de sptracker
  router.post("/update_ready_load", controller.update_ready_load) //Actualizar la fecha en la que la pieza especial se puso lista para cargarse
  router.get("/tags", controller.tags) //Get de los tags
  router.post("/requestSP", controller.requestSP) //Creacion de una request para una pieza especial
  router.get("/csptrackerRequests/:email", controller.csptrackerRequests) //Select de las requests que se han hecho para las piezas especiales
  router.post("/markAsRead", controller.markAsRead) //Marcar una peticion como leida
  router.post("/markAsUnread", controller.markAsUnread) //Desmarcarla
  router.post("/rejectRequest", controller.rejectRequest) //Rechazar la peticion 
  router.post("/acceptRequest", controller.acceptRequest) //Aceptar la peticion
  router.post("/deleteCSPNotification", controller.deleteCSPNotification) //Eliminar la peticion
  router.get("/downloadCSP", controller.downloadCSP) //Reporte de csptracker

  //Gets de toda la informacion referente a los atriburos que componen un especial por separado
  router.get("/csptracker/ratings", controller.getRatings) 
  router.get("/csptracker/specs", controller.getSpecs)
  router.get("/csptracker/endPreparations", controller.getEndPreparations)
  router.get("/csptracker/boltTypes", controller.getBoltTypes)
  router.get("/csptracker/pids", controller.getPids)
  router.get("/csptracker/pids/:project", controller.getPidsByProject)

   //Posts de toda la informacion referente a los atriburos que componen un especial por separado
  router.post("/submit/csptracker/ratings", controller.submitRatings)
  router.post("/submit/csptracker/specs", controller.submitSpecs)
  router.post("/submit/csptracker/endPreparations", controller.submitEndPreparations)
  router.post("/submit/csptracker/boltTypes", controller.submitBoltTypes)
  router.post("/submit/csptracker/pids", controller.submitPids)

  router.post("/deleteSP", controller.deleteSP); //Eliminar pieza especial
  router.post("/excludeSP", controller.excludeSP); //Excluir una pieza especial
  router.get("/spStatusData", controller.spStatusData) //Get del status de sptracker (grafica)
  
  app.use(router);
};

module.exports = routes;