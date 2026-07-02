import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";

export const getVolumes = async (req, res) => {
    try {
        const { dockerHostId } = req.params;

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

        const result = await docker.listVolumes();

        res.status(200).json({
            success: true,
            count: result.Volumes?.length || 0,
            volumes: result.Volumes || []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createVolume = async (req, res) => {
    try {
        const { dockerHostId } = req.params;
        const { name } = req.body;

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

        const volume = await docker.createVolume({
            Name: name
        });

        res.status(201).json({
            success: true,
            message: "Volume created successfully",
            volume
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const inspectVolume = async (req, res) => {
    try {
        const { dockerHostId, volumeName } = req.params;

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

        const volume = docker.getVolume(volumeName);

        const details = await volume.inspect();

        res.status(200).json({
            success: true,
            volume: details
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const deleteVolume = async (req, res) => {
    try {
        const { dockerHostId, volumeName } = req.params;

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

        const volume = docker.getVolume(volumeName);

        await volume.remove();

        res.status(200).json({
            success: true,
            message: "Volume deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const pruneVolumes = async (req, res) => {
    try {
        const { dockerHostId } = req.params;

        const dockerHost = await prisma.dockerHost.findUnique({
            where: {
                id: dockerHostId
            }
        });

        if (!dockerHost) {
            return res.status(404).json({
                success: false,
                message: "Docker host not found"
            });
        }

        const docker = createDockerClient(dockerHost);

        const result = await docker.pruneVolumes();

        res.status(200).json({
            success: true,
            message: "Unused volumes pruned successfully",
            reclaimedSpace: result.SpaceReclaimed,
            volumesDeleted: result.VolumesDeleted || []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};