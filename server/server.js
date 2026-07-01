import "dotenv/config";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
import express from "express";
import { createServer } from "http";
import net from "net";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

// Import Routes
import authRouter from "./routes/auth.js";
import posesRouter from "./routes/poses.js";
import categoriesRouter from "./routes/categories.js";
import aiRouter from "./routes/ai.js";
import moodboardRouter from "./routes/moodboard.js";
import studentRouter from "./routes/student.js";
import adminRouter from "./routes/admin.js";
import pexelsRouter from "./routes/pexels.js";
import searchRouter from "./routes/search.js";

// Import Vite Helper
import { setupVite, serveStatic } from "./vite.js";

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 5000) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for local Vite dev HMR support
      crossOriginEmbedderPolicy: false,
    })
  );

  // Gzip Compression
  app.use(compression());

  // CORS Configuration - restricted to client origin
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  );

  // Rate Limiting (100 req per 15 minutes per IP on /api/)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many requests from this IP, please try again after 15 minutes",
        code: "RATE_LIMIT_EXCEEDED",
      },
    },
  });
  app.use("/api/", apiLimiter);

  // Body Parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/poses", posesRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/moodboard", moodboardRouter);
  app.use("/api/student", studentRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/pexels", pexelsRouter);
  app.use("/api/search", searchRouter);

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/poseverse";
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.warn("\n[Warning] Failed to connect to MongoDB:", error.message);
    console.warn("The server will run in OFFLINE/DEMO mode using local in-memory fallback datasets.\n");
  }

  // Centralized Error-Handling Middleware
  app.use((err, req, res, next) => {
    console.error("Centralized Error:", err.stack || err);
    const status = err.status || 500;
    res.status(status).json({
      error: {
        message: err.message || "An unexpected server error occurred",
        code: err.code || "INTERNAL_SERVER_ERROR",
      },
    });
  });

  // HTTPS Redirect in production (optional helper shape)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.header("x-forwarded-proto") !== "https") {
        res.redirect(`https://${req.header("host")}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Frontend integration (Vite dev server or static build)
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
});
