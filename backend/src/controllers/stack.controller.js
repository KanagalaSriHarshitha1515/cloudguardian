import prisma from "../config/prisma.js";

import { exec } from "child_process";
import { promisify } from "util";



const execAsync = promisify(exec);

import fs from "fs/promises";
import path from "path";

export const createStack = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stackName, composeFile } = req.body;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Temporary compose file
    const filePath = path.join(process.cwd(), `${stackName}.yml`);

    await fs.writeFile(filePath, composeFile);

    await execAsync(`docker stack deploy -c "${filePath}" ${stackName}`);

    await fs.unlink(filePath);

    res.status(201).json({
      success: true,
      message: "Stack deployed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listStacks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Just verify the project exists
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const { stdout } = await execAsync("docker stack ls");

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

    return res.status(200).json({
      success: true,
      count: stacks.length,
      stacks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStack = async (req, res) => {
  try {
    const { stackName } = req.params;

    const { stdout } = await execAsync("docker stack ls");

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
      return res.status(404).json({
        success: false,
        message: "Stack not found",
      });
    }

    return res.status(200).json({
      success: true,
      stack,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteStack = async (req, res) => {
  try {
    const { stackName } = req.params;

    await execAsync(`docker stack rm ${stackName}`);

    res.status(200).json({
      success: true,
      message: "Stack deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStackServices = async (req, res) => {
  try {
    const { stackName } = req.params;

    const { stdout } = await execAsync(
      `docker stack services ${stackName}`
    );

    const services = stdout
      .trim()
      .split("\n")
      .slice(1)
      .filter((line) => line.length > 0)
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getStackTasks = async (req, res) => {
  try {
    const { projectId, stackName } = req.params;

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

    const { stdout } = await execAsync(`docker stack ps ${stackName}`);

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

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};