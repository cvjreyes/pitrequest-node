const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

app.use(bodyParser.json({limit:"100mb"}));
app.use(cors());
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('app/storage/library')); 
app.use('/images', express.static('images'));

app.get("/api", (req, res) => {
    res.json({ message: "Welcome to the isotracker api." });
  });

const dotenv = require('dotenv');
dotenv.config();

require("./resources/users/user.routes.js")(app);
require("./resources/auth/auth.routes.js")(app);
require("./resources/qtracker/qtracker.routes.js")(app);
require("./resources/roles/role.routes.js")(app);
require("./resources/projects/projects.routes.js")(app);
require("./resources/csptracker/csptracker.routes.js")(app);
require("./resources/library/library.routes.js")(app);
require("./resources/inst_general/inst_general.routes.js")(app);
require("./resources/psv/psv.routes.js")(app);
require("./resources/special_instruments/special_instruments.routes.js")(app);
require("./resources/expansion_joins/expansion_joins.routes.js")(app);

app.listen(process.env.NODE_DB_PORT, () => {
    console.log("Server is running on port "+process.env.NODE_DB_PORT+".");
});