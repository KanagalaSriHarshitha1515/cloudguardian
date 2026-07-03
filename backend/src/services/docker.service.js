import Docker from "dockerode";

// Create Docker client
export const createDockerClient = (host, port) => {
  // Windows + Docker Desktop
  if (process.platform === "win32") {
    return new Docker({
      socketPath: "//./pipe/docker_engine",
    });
  }

  // Linux / Remote Docker Host
  return new Docker({
    host,
    port,
  });
};

// =========================
// Container Helpers
// =========================

export const startContainer = async (docker, containerId) => {
  const container = docker.getContainer(containerId);
  await container.start();
};

export const stopContainer = async (docker, containerId) => {
  const container = docker.getContainer(containerId);
  await container.stop();
};

export const restartContainer = async (docker, containerId) => {
  const container = docker.getContainer(containerId);
  await container.restart();
};

// =========================
// Docker Service Helpers
// =========================

// List all services
export const listServices = async (docker) => {
  return await docker.listServices();
};

// Get one service
export const getService = async (docker, serviceId) => {
  const service = docker.getService(serviceId);
  return await service.inspect();
};

// Create a service
export const createService = async (docker, options) => {
  return await docker.createService(options);
};

// Remove a service
export const removeService = async (docker, serviceId) => {
  const service = docker.getService(serviceId);
  return await service.remove();
};