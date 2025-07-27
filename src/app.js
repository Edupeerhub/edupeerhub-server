const express = require("express");
const httpLogger = require("./shared/middlewares/httpLogger.middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const errorHandler = require("./shared/middlewares/error.middleware");

// Load DB
require("./shared/database");

const app = express();

app.set("trust proxy", true);

// Middleware
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

// Routes
app.get("/api", (req, res) => {
  res.send("Hello edupeerhub");
});

// Error handling
app.use(errorHandler);

module.exports = app;
