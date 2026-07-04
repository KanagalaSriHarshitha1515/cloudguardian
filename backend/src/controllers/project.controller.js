import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Create Project
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, environment } = req.body;

  if (!name) {
    throw new ApiError(400, "Project name is required");
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      environment,
      ownerId: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    project,
  });
});

// Get All Projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      ownerId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: projects.length,
    projects,
  });
});

// Get Project By ID
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({
    success: true,
    project,
  });
});

// Update Project
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, environment } = req.body;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const updatedProject = await prisma.project.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      environment,
    },
  });

  res.json({
    success: true,
    message: "Project updated successfully",
    project: updatedProject,
  });
});

// Delete Project
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
});