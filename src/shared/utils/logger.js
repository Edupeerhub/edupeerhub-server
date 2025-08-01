const winston = require("winston");
// const CloudWatchTransport = require("winston-cloudwatch"); // Optional: Uncomment if using structured CloudWatch transport

// ─── Env Setup ──────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

const allowedLevels = [
  "error",
  "warn",
  "info",
  "http",
  "verbose",
  "debug",
  "silly",
];
const envLevel = process.env.LOG_LEVEL?.toLowerCase();
const logLevel = allowedLevels.includes(envLevel)
  ? envLevel
  : isProduction
    ? "info"
    : "debug";

// ─── Console Format ─────────────────────────────────────────

const consoleFormat = isProduction
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json() // CloudWatch-friendly JSON
    )
  : winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        const { timestamp, level, message, stack, ...meta } = info;
        const base = `${timestamp} ${level}: ${message}`;
        const stackText = stack ? `\n${stack}` : "";
        const metaText =
          Object.keys(meta).length > 0
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
        return base + stackText + metaText;
      })
    );

// ─── File Format ────────────────────────────────────────────

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ─── Transports ─────────────────────────────────────────────

const transports = [
  new winston.transports.Console({
    level: logLevel,
    handleExceptions: true,
    format: consoleFormat,
  }),
];

// Optional local file logging (dev only)
if (!isProduction) {
  transports.push(
    new winston.transports.File({
      level: "debug",
      filename: "./logs/app.log",
      handleExceptions: true,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      format: fileFormat,
    })
  );
}

// ─── Optional CloudWatch Transport ──────────────────────────

// Uncomment below to send *structured* JSON logs directly to CloudWatch (instead of relying on console piping)

// if (isProduction) {
//   transports.push(
//     new CloudWatchTransport({
//       logGroupName: process.env.CLOUDWATCH_LOG_GROUP || "your-app-logs",
//       logStreamName: `${os.hostname()}-${process.env.NODE_ENV}-app`,
//       awsRegion: process.env.AWS_REGION || "us-east-1",
//       level: "info",
//       jsonMessage: true,
//       // Optional: Add credentials if not using IAM roles
//       // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     })
//   );
// }

// ─── Logger ─────────────────────────────────────────────────

const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

// ─── Global Error Handlers ──────────────────────────────────

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(
    "Unhandled Rejection",
    reason instanceof Error ? reason : { message: String(reason) }
  );
});

module.exports = logger;
