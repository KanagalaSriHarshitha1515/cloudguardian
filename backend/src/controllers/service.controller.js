import { createDockerClient } from "../services/docker.service.js";
import prisma from "../config/prisma.js";

export const listServices = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        dockerHosts: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.dockerHosts.length) {
      return res.status(404).json({
        success: false,
        message: "No Docker Host attached to this project",
      });
    }

    const dockerHost = project.dockerHosts[0];

    const docker = createDockerClient(
      dockerHost.host,
      dockerHost.port
    );

    const services = await docker.listServices();

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const docker = createDockerClient();

    const service = docker.getService(serviceId);

    const info = await service.inspect();

    return res.status(200).json({
      success: true,
      service: info,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createService = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.dockerHosts.length) {
      return res.status(404).json({
        success: false,
        message: "No Docker Host attached",
      });
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

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId: service.ID,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const scaleService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { replicas } = req.body;

    const docker = createDockerClient();

    const service = docker.getService(serviceId);

    const serviceInfo = await service.inspect();

    serviceInfo.Spec.Mode.Replicated.Replicas = replicas;

    await service.update({
      version: serviceInfo.Version.Index,
      ...serviceInfo.Spec,
    });

    return res.status(200).json({
      success: true,
      message: "Service scaled successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const docker = createDockerClient();

    const service = docker.getService(serviceId);

    await service.remove();

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};