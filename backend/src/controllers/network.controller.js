import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";

export const getNetworks = async (req, res) => {
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

        const networks = await docker.listNetworks();

        res.json({
            success: true,
            count: networks.length,
            networks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const inspectNetwork = async (req, res) => {
    try {
        const { dockerHostId, networkId } = req.params;

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

        const network = docker.getNetwork(networkId);

        const info = await network.inspect();

        res.status(200).json({
            success: true,
            network: info
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const createNetwork = async (req, res) => {
    try {
        const { dockerHostId } = req.params;
        const { name, driver = "bridge" } = req.body;

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

        const network = await docker.createNetwork({
            Name: name,
            Driver: driver
        });

        res.status(201).json({
            success: true,
            message: "Network created successfully",
            network
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const deleteNetwork = async (req, res) => {
    try {
        const { dockerHostId, networkId } = req.params;

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

        const network = docker.getNetwork(networkId);

        await network.remove();

        res.json({
            success: true,
            message: "Network deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const connectContainer = async (req, res) => {
    try {
        const { dockerHostId, networkId } = req.params;
        const { containerId } = req.body;

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

        const network = docker.getNetwork(networkId);

        await network.connect({
            Container: containerId
        });

        res.status(201).json({
            success: true,
            message: "Container connected successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const disconnectContainer = async (req, res) => {
    try {
        const { dockerHostId, networkId } = req.params;
        const { containerId } = req.body;

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

        const network = docker.getNetwork(networkId);

        await network.disconnect({
            Container: containerId
        });

        res.json({
            success: true,
            message: "Container disconnected successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};