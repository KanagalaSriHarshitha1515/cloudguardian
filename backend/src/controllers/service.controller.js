import prisma from "../config/prisma.js";
import { projectAccessFilter } from "../middleware/authorization.middleware.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const getAuthorizedProject = async (projectId, userId) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(userId),
    },
    include: {
      dockerHosts: true,
    },
  });
};

const resolveProjectAndHost = async (projectId, userId) => {
  const project = await getAuthorizedProject(projectId, userId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (!project.dockerHosts.length) {
    throw new ApiError(404, "No Docker Host attached to this project");
  }
  return project.dockerHosts[0];
};

// List Services
export const listServices = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const dockerHost = await resolveProjectAndHost(projectId, req.user.id);

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

  const dockerHost = await resolveProjectAndHost(projectId, req.user.id);

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
    serviceName,
    image,
    replicas,
    publishedPort,
    targetPort,
  } = req.body;

  const dockerHost = await resolveProjectAndHost(projectId, req.user.id);

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const serviceSpec = {
    Name: serviceName,

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
  };

  if (publishedPort && targetPort) {
    serviceSpec.EndpointSpec = {
      Ports: [
        {
          Protocol: "tcp",
          PublishedPort: publishedPort,
          TargetPort: targetPort,
        },
      ],
    };
  }

  const service = await docker.createService(serviceSpec);

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

  const dockerHost = await resolveProjectAndHost(projectId, req.user.id);

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

  const dockerHost = await resolveProjectAndHost(projectId, req.user.id);

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