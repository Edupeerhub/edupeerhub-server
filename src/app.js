const express = require("express");
const httpLogger = require("./shared/middlewares/httpLogger.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const errorHandler = require("./shared/middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);

app.get("/", (req, res) => {
  res.send("Hello edupeerhub");
});

app.use(errorHandler);

module.exports = app;
