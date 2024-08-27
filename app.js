const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
dotenv.config();
const app = express();

//Parsing URL-encoded bodies (as sent by HTML forms) and using querystring library for parsing(extended:false)
app.use(bodyParser.urlencoded({ extended: false }));
//Parsing JSON bodies (as sent by API clients)
app.use(bodyParser.json());

//Importing routes
const userRoute = require("./routes/userRoute");
const userAppointments = require("./routes/appointmentRoute");

//Importing models
const User = require("./models/user");
const sequelize = require("./util/database");

//Serving static files from the "public" directory
app.use(express.static("public"));

//Accessing routes
app.use("/user", userRoute, userAppointments);

app.use(cors());

const port = process.env.PORT;

// Running server
sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log("server is running");
      app.get("/", (req, res, next) => {
        res.sendFile(path.join(__dirname, "public", "login.html"));
      });
    });
  })
  .catch((err) => console.log(err));
