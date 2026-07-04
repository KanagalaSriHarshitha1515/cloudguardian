import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Create Docker Host
export const createDockerHost = asyncHandler(async (req, res) => {
  const { name, host, port, description, projectId } = req.body;

  // Check project belongs to logged-in user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const dockerHost = await prisma.dockerHost.create({
    data: {
      name,
      host,
      port,
      description,
      projectId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Docker Host created successfully",
    dockerHost,
  });
});

// Get Docker Hosts
export const getDockerHosts = asyncHandler(async (req, res) => {
  const dockerHosts = await prisma.dockerHost.findMany({
    where: {
      project: {
        ownerId: req.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: dockerHosts.length,
    dockerHosts,
  });
});

// Test Docker Connection
export const testDockerConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dockerHost = await prisma.dockerHost.findFirst({
    where: {
      id,
      project: {
        ownerId: req.user.id,
      },
    },
  });

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const containers = await docker.listContainers();

  res.json({
    success: true,
    count: containers.length,
    containers,
  });
});