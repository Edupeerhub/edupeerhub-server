const winston = require("winston");
const CloudWatchTransport = require("winston-cloudwatch");

const options = {
  file: {
    level: "info",
    filename: "./logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.colorize()
    ),
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
    format: winston.format.colorize(),
  },
};

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

// Add CloudWatch in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new CloudWatchTransport({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP || "your-app-logs",
      logStreamName: `${process.env.NODE_ENV}-app`,
      awsRegion: process.env.AWS_REGION || "us-east-1",
      level: "info",
      jsonMessage: true,
    })
  );
}

module.exports = logger;
