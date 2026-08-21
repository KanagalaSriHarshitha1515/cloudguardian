import prisma from "../config/prisma.js";
import { dockerHostAccessFilter } from "../middleware/authorization.middleware.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const getAuthorizedDockerHost = async (dockerHostId, userId) => {
  return prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      ...dockerHostAccessFilter(userId),
    },
  });
};

// Get Images
export const getImages = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;

  const dockerHost = await getAuthorizedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(dockerHost.host, dockerHost.port);
  const images = await docker.listImages();

  const formattedImages = images.map((image) => ({
    id: image.Id,
    tags: image.RepoTags,
    size: image.Size,
    created: image.Created,
  }));

  res.json({
    success: true,
    count: formattedImages.length,
    images: formattedImages,
  });
});

// Pull Image
export const pullImage = asyncHandler(async (req, res) => {
  const { dockerHostId } = req.params;
  const { image } = req.body;

  if (!image) {
    throw new ApiError(400, "Image name is required");
  }

  const dockerHost = await getAuthorizedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(dockerHost.host, dockerHost.port);

  await new Promise((resolve, reject) => {
    docker.pull(image, (err, stream) => {
      if (err) return reject(err);

      docker.modem.followProgress(stream, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  res.status(201).json({
    success: true,
    message: "Image pulled successfully",
  });
});

// Delete Image
export const deleteImage = asyncHandler(async (req, res) => {
  const { dockerHostId, imageId } = req.params;

  const dockerHost = await getAuthorizedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(dockerHost.host, dockerHost.port);
  await docker.getImage(imageId).remove();

  res.json({
    success: true,
    message: "Image deleted successfully",
  });
});

// Tag Image
export const tagImage = asyncHandler(async (req, res) => {
  const { dockerHostId, imageId } = req.params;
  const { repo, tag } = req.body;

  if (!repo) {
    throw new ApiError(400, "Repository name is required");
  }

  const dockerHost = await getAuthorizedDockerHost(dockerHostId, req.user.id);

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(dockerHost.host, dockerHost.port);
  const image = docker.getImage(imageId);

  await image.tag({
    repo,
    tag: tag || "latest",
  });

  res.status(200).json({
    success: true,
    message: "Image tagged successfully",
  });
});