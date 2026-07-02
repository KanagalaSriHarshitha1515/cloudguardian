import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";

export const createDockerHost = async (req, res) => {
  try {
    const { name, host, port, description, projectId } = req.body;

    // Check project belongs to logged-in user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
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

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const testDockerConnection = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Docker Host not found",
      });
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

  } catch (error) {
  console.error("Docker Error:", error);

  res.status(500).json({
    success: false,
    error,
  });
}
};