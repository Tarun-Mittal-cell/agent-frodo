const { createServer } = require("http");
const { createServer: createHttpsServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const compression = require("compression");
const { initWebSocket } = require("./lib/WebSocketServer");
const { config } = require("dotenv");

// Load .env.local explicitly
config({ path: path.resolve(__dirname, ".env.local") });

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const isHttps = process.env.HTTPS === "true";

const sslOptions = isHttps
  ? {
      key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
    }
  : null;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const logger = winston.createLogger({
  level: dev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    ...(dev ? [new winston.transports.Console()] : []),
  ],
});

app
  .prepare()
  .then(() => {
    const server = isHttps
      ? createHttpsServer(sslOptions, (req, res) => handleRequest(req, res))
      : createServer((req, res) => handleRequest(req, res));

    initWebSocket(server);

    async function handleRequest(req, res) {
      try {
        const parsedUrl = parse(req.url, true);
        compression()(req, res, async () => {
          await handle(req, res, parsedUrl);
        });
      } catch (err) {
        logger.error("Error handling request:", {
          error: err.message,
          stack: err.stack,
        });
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }

    server.on("request", (req, res) => {
      if (req.url === "/health") {
        res.statusCode = 200;
        res.end("OK");
      }
    });

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    function gracefulShutdown() {
      logger.info("Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
      setTimeout(() => {
        logger.error("Force shutdown due to timeout");
        process.exit(1);
      }, 10000);
    }

    server.listen(port, (err) => {
      if (err) {
        logger.error("Server failed to start:", err);
        throw err;
      }
      logger.info(
        `Server running on ${isHttps ? "https" : "http"}://${hostname}:${port}`
      );
      logger.info(`Using ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to prepare Next.js app:", err);
    process.exit(1);
  });
