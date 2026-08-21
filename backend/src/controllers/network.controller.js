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

// Get Networks
export const getNetworks = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const networks = await docker.listNetworks();

  res.json({
    success: true,
    count: networks.length,
    networks,
  });
});

// Inspect Network
export const inspectNetwork = asyncHandler(async (req, res) => {
  const { dockerHostId, networkId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const network = docker.getNetwork(networkId);

  const info = await network.inspect();

  res.status(200).json({
    success: true,
    network: info,
  });
});

// Create Network
export const createNetwork = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;
  const { name, driver = "bridge" } = req.body;

  if (!name) {
    throw new ApiError(400, "Network name is required");
  }

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const network = await docker.createNetwork({
    Name: name,
    Driver: driver,
  });

  res.status(201).json({
    success: true,
    message: "Network created successfully",
    network,
  });
});

// Delete Network
export const deleteNetwork = asyncHandler(async (req, res) => {
  const { dockerHostId, networkId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const network = docker.getNetwork(networkId);

  await network.remove();

  res.json({
    success: true,
    message: "Network deleted successfully",
  });
});

// Connect Container
export const connectContainer = asyncHandler(async (req, res) => {
  const { dockerHostId, networkId } = req.params;
  const { containerId } = req.body;

  if (!containerId) {
    throw new ApiError(400, "Container ID is required");
  }

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const network = docker.getNetwork(networkId);

  await network.connect({
    Container: containerId,
  });

  res.status(200).json({
    success: true,
    message: "Container connected successfully",
  });
});

// Disconnect Container
export const disconnectContainer = asyncHandler(async (req, res) => {
  const { dockerHostId, networkId } = req.params;
  const { containerId } = req.body;

  if (!containerId) {
    throw new ApiError(400, "Container ID is required");
  }

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const network = docker.getNetwork(networkId);

  await network.disconnect({
    Container: containerId,
  });

  res.json({
    success: true,
    message: "Container disconnected successfully",
  });
});