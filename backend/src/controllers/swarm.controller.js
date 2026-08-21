import prisma from "../config/prisma.js";
import { dockerHostAccessFilter } from "../middleware/authorization.middleware.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const getOwnedDockerHost = async (dockerHostId, userId) => {
  return prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      ...dockerHostAccessFilter(userId),
    },
  });
};

// Initialize Swarm
export const initializeSwarm = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const result = await docker.swarmInit({
    ListenAddr: "0.0.0.0:2377",
    AdvertiseAddr: "127.0.0.1",
  });

  res.status(201).json({
    success: true,
    message: "Swarm initialized successfully",
    nodeId: result,
  });
});

// Inspect Swarm
export const inspectSwarm = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const swarm = await docker.swarmInspect();

  res.json({
    success: true,
    swarm,
  });
});

// Leave Swarm
export const leaveSwarm = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  await docker.swarmLeave({
    force: true,
  });

  res.json({
    success: true,
    message: "Left swarm successfully",
  });
});

// List Swarm Nodes
export const listSwarmNodes = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const nodes = await docker.listNodes();

  res.json({
    success: true,
    count: nodes.length,
    nodes,
  });
});