const express = require("express");
const router = express.Router();
const expansion_joins = require("../expansion_joins/expansion_joins.controller");

let routes = (app) => {
  router.get("/getExpansionJoinsByProject/:project_id", expansion_joins.getExpansionJoinsByProject)
  router.get("/expansionJoinsStatusDataByProject/:project_id", expansion_joins.expansionJoinsStatusDataByProject)
  router.get("/downloadExpansionJoinsByProject/:project_id", expansion_joins.downloadExpansionJoinsByProject)

  router.post("/submitExpansionJoins", expansion_joins.submitExpansionJoins)
  router.post("/expansionJoinsReadye3d", expansion_joins.expansionJoinsReadye3d)
  router.post("/deleteExpansionJoin", expansion_joins.deleteExpansionJoins)
  router.post("/excludeExpansionJoin", expansion_joins.excludeExpansionJoins)
  router.post("/expansionJoinsCancelreadye3d", expansion_joins.expansionJoinsCancelreadye3d)
  app.use(router);
};

module.exports = routes;