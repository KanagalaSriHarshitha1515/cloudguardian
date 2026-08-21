import prisma from "../config/prisma.js";
import { projectAccessFilter } from "../middleware/authorization.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

// Create Stack
export const createStack = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { stackName, composeFile } = req.body;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const safeStackName = stackName.replace(/[^a-zA-Z0-9_-]/g, "-");
  const filePath = path.join(os.tmpdir(), `${safeStackName}-${Date.now()}.yml`);

  await fs.writeFile(filePath, composeFile, "utf8");

  await execFileAsync("docker", ["stack", "deploy", "-c", filePath, safeStackName]);

  await fs.unlink(filePath);

  res.status(201).json({
    success: true,
    message: "Stack deployed successfully",
  });
});

// List Stacks
export const listStacks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const { stdout } = await execFileAsync("docker", ["stack", "ls"]);

  const stacks = stdout
    .trim()
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = line.trim().split(/\s+/);

      return {
        name: parts[0],
        services: Number(parts[1]),
        orchestrator: parts[2],
      };
    });

  res.status(200).json({
    success: true,
    count: stacks.length,
    stacks,
  });
});

// Get Stack
export const getStack = asyncHandler(async (req, res) => {
  const { projectId, stackName } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const { stdout } = await execFileAsync("docker", ["stack", "ls"]);

  const stacks = stdout
    .trim()
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = line.trim().split(/\s+/);

      return {
        name: parts[0],
        services: Number(parts[1]),
        orchestrator: parts[2],
      };
    });

  const stack = stacks.find((s) => s.name === stackName);

  if (!stack) {
    throw new ApiError(404, "Stack not found");
  }

  res.status(200).json({
    success: true,
    stack,
  });
});

// Delete Stack
export const deleteStack = asyncHandler(async (req, res) => {
  const { projectId, stackName } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await execFileAsync("docker", ["stack", "rm", stackName]);

  res.status(200).json({
    success: true,
    message: "Stack deleted successfully",
  });
});

// Get Stack Services
export const getStackServices = asyncHandler(async (req, res) => {
  const { projectId, stackName } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const { stdout } = await execFileAsync("docker", ["stack", "services", stackName]);

  const services = stdout
    .trim()
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = line.trim().split(/\s+/);

      return {
        id: parts[0],
        name: parts[1],
        mode: parts[2],
        replicas: parts[3],
        image: parts[4],
        ports: parts.slice(5).join(" "),
      };
    });

  res.status(200).json({
    success: true,
    count: services.length,
    services,
  });
});

// Get Stack Tasks
export const getStackTasks = asyncHandler(async (req, res) => {
  const { projectId, stackName } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const { stdout } = await execFileAsync("docker", ["stack", "ps", stackName]);

  const tasks = stdout
    .trim()
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const parts = line.trim().split(/\s+/);

      return {
        id: parts[0],
        name: parts[1],
        image: parts[3],
        node: parts[4],
        desiredState: parts[5],
        currentState: parts.slice(6).join(" "),
      };
    });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});