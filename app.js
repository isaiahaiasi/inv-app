var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

// dotenv setup
require("dotenv").config();

// routes setup
const indexRouter = require("./routes/index");
const invRouter = require("./routes/inv");

var app = express();

// set secure http headers
app.use(helmet());

// mongoose setup
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// VIEW ENGINE SETUP
const hbs = require("hbs");

// watch changes in partials so changes are reflected w/o restarting server
const hbsutils = require("hbs-utils")(hbs);
hbsutils.registerWatchedPartials(__dirname + "/views/partials");

// register necessary helper functions for view engine
hbs.registerHelper("link", require("./views/helpers/hbs-utility-helpers").link);
hbs.registerHelper("ifeq", require("./views/helpers/hbs-utility-helpers").ifeq);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// compress routes
app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/inv", invRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
