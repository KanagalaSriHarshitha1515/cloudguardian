import Docker from "dockerode";

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