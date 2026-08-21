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

// Get Volumes
export const getVolumes = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const result = await docker.listVolumes();

  res.status(200).json({
    success: true,
    count: result.Volumes?.length || 0,
    volumes: result.Volumes || [],
  });
});

// Create Volume
export const createVolume = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Volume name is required");
  }

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const volume = await docker.createVolume({
    Name: name,
  });

  res.status(201).json({
    success: true,
    message: "Volume created successfully",
    volume,
  });
});

// Inspect Volume
export const inspectVolume = asyncHandler(async (req, res) => {
  const { dockerHostId, volumeName } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const volume = docker.getVolume(volumeName);

  const details = await volume.inspect();

  res.status(200).json({
    success: true,
    volume: details,
  });
});

// Delete Volume
export const deleteVolume = asyncHandler(async (req, res) => {
  const { dockerHostId, volumeName } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const volume = docker.getVolume(volumeName);

  await volume.remove();

  res.status(200).json({
    success: true,
    message: "Volume deleted successfully",
  });
});

// Prune Volumes
export const pruneVolumes = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getOwnedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const result = await docker.pruneVolumes();

  res.status(200).json({
    success: true,
    message: "Unused volumes pruned successfully",
    reclaimedSpace: result.SpaceReclaimed,
    volumesDeleted: result.VolumesDeleted || [],
  });
});