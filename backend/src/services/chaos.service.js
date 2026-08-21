import prisma from "../config/prisma.js";
import { createDockerClient } from "./docker.service.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const followExec = (docker, stream) =>
  new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const execInContainer = async (docker, containerId, cmd) => {
  const container = docker.getContainer(containerId);
  const exec = await container.exec({
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
  });
  const stream = await exec.start();
  await followExec(docker, stream);
};

const runCpuStress = async (docker, containerId, durationSeconds) =>
  execInContainer(docker, containerId, [
    "sh",
    "-c",
    `timeout ${durationSeconds}s sh -c 'while true; do :; done'`,
  ]);

const runMemoryStress = async (docker, containerId, durationSeconds) =>
  execInContainer(docker, containerId, [
    "sh",
    "-c",
    `timeout ${durationSeconds}s sh -c 'python3 -c "import time; a=[]; [a.append(\"x\"*1024*1024) for _ in range(50)]; time.sleep(${durationSeconds})"'`,
  ]);

const runDiskStress = async (docker, containerId, durationSeconds) =>
  execInContainer(docker, containerId, [
    "sh",
    "-c",
    `timeout ${durationSeconds}s sh -c 'dd if=/dev/zero of=/tmp/chaos-${Date.now()}.bin bs=4M count=128 >/dev/null 2>&1'`,
  ]);

const runNetworkStress = async (docker, containerId, durationSeconds) => {
  const container = docker.getContainer(containerId);
  await container.pause();
  await wait(durationSeconds * 1000);
  await container.unpause();
};

export const runChaosExperiment = async (dockerHost, containerId, type, durationMinutes) => {
  const durationSeconds = Math.max(10, Math.min(durationMinutes * 60, 3600));
  const docker = createDockerClient(dockerHost.host, dockerHost.port);

  switch (String(type).toUpperCase()) {
    case "CPU":
      return runCpuStress(docker, containerId, durationSeconds);
    case "MEMORY":
      return runMemoryStress(docker, containerId, durationSeconds);
    case "DISK":
      return runDiskStress(docker, containerId, durationSeconds);
    case "NETWORK":
      return runNetworkStress(docker, containerId, durationSeconds);
    default:
      throw new Error(`Unsupported experiment type: ${type}`);
  }
};

export const runChaosExperimentBackground = async (container, experimentId, type, durationMinutes) => {
  const dockerHost = container.host;

  try {
    await runChaosExperiment(dockerHost, container.id, type, durationMinutes);
    await prisma.experiment.update({
      where: { id: experimentId },
      data: { status: "COMPLETED", endedAt: new Date() },
    });
  } catch (error) {
    await prisma.experiment.update({
      where: { id: experimentId },
      data: { status: "FAILED", endedAt: new Date() },
    });
  }
};
