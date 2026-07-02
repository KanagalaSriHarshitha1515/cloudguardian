import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";

export const initializeSwarm = async (req, res) => {
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

        const result = await docker.swarmInit({
            ListenAddr: "0.0.0.0:2377",
            AdvertiseAddr: "127.0.0.1"
        });

        res.status(201).json({
            success: true,
            message: "Swarm initialized successfully",
            nodeId: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const inspectSwarm = async (req, res) => {
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

        const swarm = await docker.swarmInspect();

        res.json({
            success: true,
            swarm
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const leaveSwarm = async (req, res) => {
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

        await docker.swarmLeave({
            force: true
        });

        res.json({
            success: true,
            message: "Left swarm successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const listSwarmNodes = async (req, res) => {
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

        const nodes = await docker.listNodes();

        res.json({
            success: true,
            count: nodes.length,
            nodes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};