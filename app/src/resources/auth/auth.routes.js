/*const { Router } = require('express');
const authController = require('./auth.controller.js');
const router = Router();

router.route('/login').post(authController.login);

module.exports = router;
*/
module.exports = app => {
    const auth = require("./auth.controller.js");

    app.post("/login", auth.login);
    
  };