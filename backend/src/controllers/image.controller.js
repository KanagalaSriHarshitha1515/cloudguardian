import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";

export const getImages = async (req, res) => {
  try {
    const { dockerHostId } = req.params;

    const dockerHost = await prisma.dockerHost.findFirst({
      where: {
        id: dockerHostId,
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

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const pullImage = async (req, res) => {
  try {
    const { dockerHostId } = req.params;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image name is required",
      });
    }

    const dockerHost = await prisma.dockerHost.findFirst({
      where: {
        id: dockerHostId,
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

    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);

        docker.modem.followProgress(
          stream,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });

    res.status(201).json({
      success: true,
      message: "Image pulled successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const deleteImage = async (req, res) => {
  try {
    const { dockerHostId, imageId } = req.params;

    const dockerHost = await prisma.dockerHost.findFirst({
      where: {
        id: dockerHostId,
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

    await docker.getImage(imageId).remove();

    res.json({
      success: true,
      message: "Image deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const tagImage = async (req, res) => {
    try {
        const { dockerHostId, imageId } = req.params;
        const { repo, tag } = req.body;

        const dockerHost = await prisma.dockerHost.findUnique({
            where: { id: dockerHostId }
        });

        if (!dockerHost) {
            return res.status(404).json({
                success: false,
                message: "Docker host not found"
            });
        }

        const docker = createDockerClient(dockerHost);

        const image = docker.getImage(imageId);

        await image.tag({
            repo,
            tag
        });

        res.status(200).json({
            success: true,
            message: "Image tagged successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};