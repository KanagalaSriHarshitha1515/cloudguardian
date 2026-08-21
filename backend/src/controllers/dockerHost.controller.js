import prisma from "../config/prisma.js";
import { projectAccessFilter } from "../middleware/authorization.middleware.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Real Prisma-backed implementation, matching the exact pattern your
// container.controller.js already uses (asyncHandler, ApiError, ownership
// check via project.ownerId). Replaces the placeholder in-memory Map.

export const connect = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, host, port } = req.body;

  if (!name || !host || !port) {
    throw new ApiError(400, "name, host, and port are required");
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ...projectAccessFilter(req.user.id) },
  });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Verify the engine is actually reachable BEFORE saving anything —
  // reuses your existing createDockerClient helper, same as every other
  // controller, instead of building a separate Dockerode connection.
  const docker = createDockerClient(host, Number(port));
  try {
    await docker.ping();
  } catch (err) {
    throw new ApiError(502, "Could not reach that Docker Engine — check the address and port.");
  }

  // This app's model is one host per project — replace any existing one
  // rather than accumulating orphaned rows.
  await prisma.dockerHost.deleteMany({ where: { projectId } });

  const dockerHost = await prisma.dockerHost.create({
    data: { name, host, port: Number(port), projectId },
  });

  res.status(201).json({ success: true, dockerHost });
});

export const getStatus = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Access control is already enforced by the `requireProjectAccess`
  // middleware on the route, so simply look up the host by `projectId`.
  // This avoids complex relation-filtering that previously caused
  // intermittent Prisma errors (500) in some environments.
  const dockerHost = await prisma.dockerHost.findFirst({
    where: { projectId },
  });

  if (!dockerHost) {
    // 404 here is expected/normal — the frontend treats this as "not
    // connected yet," not an error.
    throw new ApiError(404, "No Docker Host connected for this project");
  }

  res.json({ success: true, dockerHost });
});

export const disconnect = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  await prisma.dockerHost.deleteMany({
    where: {
      projectId,
      project: projectAccessFilter(req.user.id),
    },
  });

  res.status(204).send();
});