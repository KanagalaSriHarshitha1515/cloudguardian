import prisma from "../config/prisma.js";
import { projectAccessFilter } from "../middleware/authorization.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { runChaosExperimentBackground } from "../services/chaos.service.js";

const VALID_EXPERIMENT_TYPES = ["CPU", "MEMORY", "DISK", "NETWORK"];

export const listExperiments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
    include: {
      dockerHosts: {
        include: {
          containers: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const containerIds = project.dockerHosts.flatMap((host) =>
    host.containers.map((container) => container.id)
  );

  const experiments = await prisma.experiment.findMany({
    where: containerIds.length
      ? { containerId: { in: containerIds } }
      : { containerId: "__none__" },
    include: {
      container: {
        include: {
          host: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: experiments.length,
    experiments,
  });
});

export const createExperiment = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { containerId, type, duration } = req.body;

  if (!containerId || !type) {
    throw new ApiError(400, "containerId and type are required");
  }

  if (!VALID_EXPERIMENT_TYPES.includes(String(type).toUpperCase())) {
    throw new ApiError(400, "Unsupported experiment type");
  }

  const container = await prisma.container.findFirst({
    where: {
      id: containerId,
      host: {
        project: {
          ...projectAccessFilter(req.user.id),
          id: projectId,
        },
      },
    },
    include: {
      host: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!container) {
    throw new ApiError(404, "Container not found in this project");
  }

  const durationMinutes = Number(duration) || 60;

  const experiment = await prisma.experiment.create({
    data: {
      containerId: container.id,
      type: String(type).toUpperCase(),
      status: "PENDING",
      duration: durationMinutes,
      startedAt: new Date(),
      endedAt: null,
    },
  });

  runChaosExperimentBackground(container, experiment.id, experiment.type, durationMinutes);

  res.status(201).json({
    success: true,
    message: "Experiment queued successfully",
    experiment,
  });
});

export const updateExperimentStatus = asyncHandler(async (req, res) => {
  const { projectId, experimentId } = req.params;
  const { status } = req.body;

  const experiment = await prisma.experiment.findFirst({
    where: {
      id: experimentId,
      container: {
        host: {
          project: {
            id: projectId,
            ...projectAccessFilter(req.user.id),
          },
        },
      },
    },
  });

  if (!experiment) {
    throw new ApiError(404, "Experiment not found");
  }

  const nextStatus = String(status || "RUNNING").toUpperCase();
  const validStatuses = ["PENDING", "RUNNING", "COMPLETED", "FAILED"];

  if (!validStatuses.includes(nextStatus)) {
    throw new ApiError(400, "Unsupported experiment status");
  }

  const updated = await prisma.experiment.update({
    where: { id: experimentId },
    data: {
      status: nextStatus,
      endedAt: nextStatus === "COMPLETED" || nextStatus === "FAILED" ? new Date() : null,
    },
  });

  res.json({
    success: true,
    experiment: updated,
  });
});
