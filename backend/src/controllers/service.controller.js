import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// List Services
export const listServices = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      dockerHosts: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached to this project");
  }

  const dockerHost = project.dockerHosts[0];

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const services = await docker.listServices();

  res.status(200).json({
    success: true,
    count: services.length,
    services,
  });
});

// Get Service
export const getService = asyncHandler(async (req, res) => {
  const { projectId, serviceId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      dockerHosts: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached to this project");
  }

  const dockerHost = project.dockerHosts[0];

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const service = docker.getService(serviceId);

  const info = await service.inspect();

  res.status(200).json({
    success: true,
    service: info,
  });
});

// Create Service
export const createService = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const {
    name,
    image,
    replicas,
    publishedPort,
    targetPort,
  } = req.body;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      dockerHosts: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached");
  }

  const dockerHost = project.dockerHosts[0];

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const service = await docker.createService({
    Name: name,

    TaskTemplate: {
      ContainerSpec: {
        Image: image,
      },
    },

    Mode: {
      Replicated: {
        Replicas: replicas || 1,
      },
    },

    EndpointSpec: {
      Ports: [
        {
          Protocol: "tcp",
          PublishedPort: publishedPort,
          TargetPort: targetPort,
        },
      ],
    },
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    serviceId: service.ID,
  });
});

// Scale Service
export const scaleService = asyncHandler(async (req, res) => {
  const { projectId, serviceId } = req.params;
  const { replicas } = req.body;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      dockerHosts: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached");
  }

  const dockerHost = project.dockerHosts[0];

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const service = docker.getService(serviceId);

  const serviceInfo = await service.inspect();

  serviceInfo.Spec.Mode.Replicated.Replicas = replicas;

  await service.update({
    version: serviceInfo.Version.Index,
    ...serviceInfo.Spec,
  });

  res.status(200).json({
    success: true,
    message: "Service scaled successfully",
  });
});

// Delete Service
export const deleteService = asyncHandler(async (req, res) => {
  const { projectId, serviceId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      dockerHosts: true,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached");
  }

  const dockerHost = project.dockerHosts[0];

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const service = docker.getService(serviceId);

  await service.remove();

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});