const express = require("express");
const router = express.Router();
const expansion_joins = require("../expansion_joins/expansion_joins.controller");

let routes = (app) => {
  router.get("/getExpansionJoinsByProject/:project_id", expansion_joins.getExpansionJoinsByProject) //Get de las expansion joins por proyecto
  router.get("/expansionJoinsStatusDataByProject/:project_id", expansion_joins.expansionJoinsStatusDataByProject) //Get del status de las expansion joins por proyecto
  router.get("/downloadExpansionJoinsByProject/:project_id", expansion_joins.downloadExpansionJoinsByProject) //Reporte

  router.post("/submitExpansionJoins", expansion_joins.submitExpansionJoins) //Post de las expansion joins
  router.post("/expansionJoinsReadye3d", expansion_joins.expansionJoinsReadye3d) //Poner una expansion join en ready e3d
  router.post("/deleteExpansionJoin", expansion_joins.deleteExpansionJoins) //Marcar una expansion join como deleted
  router.post("/excludeExpansionJoin", expansion_joins.excludeExpansionJoins) //Excluir una expansion join
  router.post("/expansionJoinsCancelreadye3d", expansion_joins.expansionJoinsCancelreadye3d) //Cancelar el ready e3d
  app.use(router);
};

module.exports = routes;