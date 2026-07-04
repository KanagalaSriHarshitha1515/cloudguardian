import prisma from "../config/prisma.js";
import { createDockerClient } from "../services/docker.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
export const getContainers = asyncHandler(async (req, res) => {

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
        throw new ApiError(404, "Docker Host not found");
    }

    const docker = createDockerClient(
        dockerHost.host,
        dockerHost.port
    );

    const containers = await docker.listContainers({ all: true });

    const result = containers.map((container) => ({
        id: container.Id,
        name: container.Names[0].replace("/", ""),
        image: container.Image,
        status: container.State,
        ports: container.Ports,
    }));

    res.json({
        success: true,
        count: result.length,
        containers: result,
    });

});
export const startContainer = asyncHandler(async (req, res) => {

    const { dockerHostId, containerId } = req.params;

    const dockerHost = await prisma.dockerHost.findFirst({
        where: {
            id: dockerHostId,
            project: {
                ownerId: req.user.id,
            },
        },
    });

    if (!dockerHost) {
        throw new ApiError(404, "Docker Host not found");
    }

    const docker = createDockerClient(
        dockerHost.host,
        dockerHost.port
    );

    const container = docker.getContainer(containerId);

    await container.start();

    res.json({
        success: true,
        message: "Container started successfully",
    });

});

export const stopContainer = asyncHandler(async (req, res) => {
  const { dockerHostId, containerId } = req.params;

  const dockerHost = await prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      project: {
        ownerId: req.user.id,
      },
    },
  });

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const container = docker.getContainer(containerId);

  await container.stop();

  res.json({
    success: true,
    message: "Container stopped successfully",
  });
});
export const restartContainer = asyncHandler(async (req, res) => {
  const { dockerHostId, containerId } = req.params;

  const dockerHost = await prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      project: {
        ownerId: req.user.id,
      },
    },
  });

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const container = docker.getContainer(containerId);

  await container.restart();

  res.json({
    success: true,
    message: "Container restarted successfully",
  });
});
export const deleteContainer = asyncHandler(async (req, res) => {
  const { dockerHostId, containerId } = req.params;

  const dockerHost = await prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      project: {
        ownerId: req.user.id,
      },
    },
  });

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const container = docker.getContainer(containerId);

  await container.remove({
    force: true,
  });

  res.json({
    success: true,
    message: "Container deleted successfully",
  });
});

export const getContainerLogs = asyncHandler(async (req, res) => {
  const { dockerHostId, containerId } = req.params;

  const dockerHost = await prisma.dockerHost.findFirst({
    where: {
      id: dockerHostId,
      project: {
        ownerId: req.user.id,
      },
    },
  });

  if (!dockerHost) {
    throw new ApiError(404, "Docker Host not found");
  }

  const docker = createDockerClient(
    dockerHost.host,
    dockerHost.port
  );

  const container = docker.getContainer(containerId);

  const logs = await container.logs({
    stdout: true,
    stderr: true,
    timestamps: true,
  });

  res.json({
    success: true,
    logs: logs.toString(),
  });
});

export const getContainerStats = asyncHandler(async (req, res) => {
  
    const { dockerHostId, containerId } = req.params;

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

    const container = docker.getContainer(containerId);

    const stats = await container.stats({ stream: false });

    // CPU %
const cpuDelta =
  (stats.cpu_stats?.cpu_usage?.total_usage || 0) -
  (stats.precpu_stats?.cpu_usage?.total_usage || 0);

const systemDelta =
  (stats.cpu_stats?.system_cpu_usage || 0) -
  (stats.precpu_stats?.system_cpu_usage || 0);

const cpuPercent =
  systemDelta > 0
    ? (
        (cpuDelta / systemDelta) *
        (stats.cpu_stats?.online_cpus || 1) *
        100
      ).toFixed(2)
    : "0.00";


// Memory
const memoryUsage = stats.memory_stats?.usage
  ? (stats.memory_stats.usage / 1024 / 1024).toFixed(2)
  : "0.00";

const memoryLimit = stats.memory_stats?.limit
  ? (stats.memory_stats.limit / 1024 / 1024).toFixed(2)
  : "0.00";

// Network
let rx = 0;
let tx = 0;

if (stats.networks) {
  Object.values(stats.networks).forEach((net) => {
    rx += net.rx_bytes;
    tx += net.tx_bytes;
  });
}

res.json({
  success: true,
  stats: {
    id: stats.id,
    name: stats.name.replace("/", ""),
    cpu: `${cpuPercent}%`,
    memory: `${memoryUsage} MB`,
    memoryLimit: `${memoryLimit} MB`,
    networkRx: `${(rx / 1024 / 1024).toFixed(2)} MB`,
    networkTx: `${(tx / 1024 / 1024).toFixed(2)} MB`,
    pids: stats.pids_stats?.current || 0,
  },
});
});

export const createContainer = asyncHandler(async (req, res) => {
  
    const { dockerHostId } = req.params;

    const {
      image,
      name,
      ports = {},
      env = [],
      cmd = []
    } = req.body;

    // Find Docker Host
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

    // Pull image if it doesn't exist
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

    // Create container
    const container = await docker.createContainer({
      Image: image,
      name,
      Env: env,
      Cmd: cmd,
      ExposedPorts: Object.keys(ports).reduce((obj, key) => {
        obj[key] = {};
        return obj;
      }, {}),
      HostConfig: {
        PortBindings: ports,
      },
    });

    // Start container
    await container.start();

    res.status(201).json({
      success: true,
      message: "Container created successfully",
      id: container.id,
    });
});