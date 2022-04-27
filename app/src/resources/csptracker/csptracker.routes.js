const express = require("express");
const router = express.Router();
const controller = require("../csptracker/csptracker.controller");

let routes = (app) => {
  router.get("/csptracker", controller.csptracker);
  router.post("/readye3d", controller.readye3d);
  router.post("/cancelreadye3d", controller.cancelReadye3d);
  router.post("/uploadDrawing", controller.uploadDrawing);
  router.post("/uploadDrawingDB", controller.uploadDrawingDB);
  router.post("/updateDrawing", controller.updateDrawing)
  router.post("/updateDrawingDB", controller.updateDrawingDB)
  router.post("/editCSP", controller.editCSP)
  router.post("/exitEditCSP", controller.exitEditCSP)
  router.get("/getDrawing/:fileName", controller.getDrawing)
  router.get("/getListsData", controller.getListsData)
  router.post("/submitCSP", controller.submitCSP)
  router.post("/update_ready_load", controller.update_ready_load)
  router.get("/tags", controller.tags)
  router.post("/requestSP", controller.requestSP)
  router.get("/csptrackerRequests/:email", controller.csptrackerRequests)
  router.post("/markAsRead", controller.markAsRead)
  router.post("/markAsUnread", controller.markAsUnread)
  router.post("/rejectRequest", controller.rejectRequest)
  router.post("/acceptRequest", controller.acceptRequest)
  router.post("/deleteCSPNotification", controller.deleteCSPNotification)
  router.get("/downloadCSP", controller.downloadCSP)

  router.get("/csptracker/ratings", controller.getRatings)
  router.get("/csptracker/specs", controller.getSpecs)
  router.get("/csptracker/endPreparations", controller.getEndPreparations)
  router.get("/csptracker/boltTypes", controller.getBoltTypes)
  router.get("/csptracker/pids", controller.getPids)
  router.get("/csptracker/pids/:project", controller.getPidsByProject)

  router.post("/submit/csptracker/ratings", controller.submitRatings)
  router.post("/submit/csptracker/specs", controller.submitSpecs)
  router.post("/submit/csptracker/endPreparations", controller.submitEndPreparations)
  router.post("/submit/csptracker/boltTypes", controller.submitBoltTypes)
  router.post("/submit/csptracker/pids", controller.submitPids)
  router.post("/deleteSP", controller.deleteSP);
  router.post("/excludeSP", controller.excludeSP);
  router.get("/spStatusData", controller.spStatusData)
  
  app.use(router);
};

module.exports = routes;