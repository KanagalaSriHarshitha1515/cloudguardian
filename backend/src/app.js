import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import prisma from "./config/prisma.js";
import swaggerSpec from "./config/swagger.js";

// Middleware
import limiter from "./middleware/rateLimiter.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

// Routes
import apiRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import teamRoutes from "./routes/team.routes.js";
import dockerHostRoutes from "./routes/dockerHost.routes.js";
import containerRoutes from "./routes/container.routes.js";
import imageRoutes from "./routes/image.routes.js";
import volumeRoutes from "./routes/volume.routes.js";
import networkRoutes from "./routes/network.routes.js";
import swarmRoutes from "./routes/swarm.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import stackRoutes from "./routes/stack.routes.js";
import experimentRoutes from "./routes/experiment.routes.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  credentials: true,
};

/* ===========================
   Global Middleware
=========================== */

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(limiter);
app.use(loggerMiddleware);

/* ===========================
   Root Route
=========================== */

app.get("/", (req, res) => {
  res.status(200).json({
    project: "CloudGuardian",
    version: "1.0.0",
    message: "CloudGuardian Backend is Running 🚀",
  });
});

/* ===========================
   Health Check
=========================== */

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "Healthy",
      database: "Connected",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      status: "Unhealthy",
      database: "Disconnected",
      error: error.message,
    });
  }
});

/* ===========================
   Swagger Documentation
=========================== */

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

/* ===========================
   API Routes
=========================== */

app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/docker-hosts", dockerHostRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/volumes", volumeRoutes);
app.use("/api/networks", networkRoutes);
app.use("/api/swarm", swarmRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stacks", stackRoutes);
app.use("/api/experiments", experimentRoutes);

/* ===========================
   404 Route
=========================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ===========================
   Global Error Handler
=========================== */

app.use(errorHandler);

export default app;