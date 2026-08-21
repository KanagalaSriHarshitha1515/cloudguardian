import prisma from "../config/prisma.js";
import { projectAccessFilter } from "../middleware/authorization.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const allowedProjectMemberRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

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
    project: {
      ...project,
      dockerHostConnected: false,
    },
  });
});

// Get All Projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: projectAccessFilter(req.user.id),
    include: {
      dockerHosts: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const serializedProjects = projects.map((project) => ({
    ...project,
    dockerHostConnected: project.dockerHosts.length > 0,
  }));

  res.json({
    success: true,
    count: serializedProjects.length,
    projects: serializedProjects,
  });
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectAccessFilter(req.user.id),
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      projectMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const members = [
    {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      role: "OWNER",
    },
    ...project.projectMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    })),
  ];

  res.json({
    success: true,
    members,
  });
});

export const addProjectMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, role = "MEMBER" } = req.body;

  if (!email) {
    throw new ApiError(400, "Member email is required");
  }

  if (!allowedProjectMemberRoles.includes(role)) {
    throw new ApiError(400, "Role must be one of OWNER, ADMIN, MEMBER, VIEWER");
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.ownerId !== req.user.id) {
    throw new ApiError(403, "Only the project owner can add members");
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user) {
    throw new ApiError(404, "User not found with that email");
  }

  if (user.id === project.ownerId) {
    throw new ApiError(400, "The project owner is already a member");
  }

  const existingMembership = await prisma.projectMember.findFirst({
    where: {
      projectId: id,
      userId: user.id,
    },
  });

  if (existingMembership) {
    throw new ApiError(400, "User is already a member of this project");
  }

  const projectMember = await prisma.projectMember.create({
    data: {
      projectId: id,
      userId: user.id,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Project member added successfully",
    member: {
      id: projectMember.user.id,
      name: projectMember.user.name,
      email: projectMember.user.email,
      role: projectMember.role,
    },
  });
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.ownerId !== req.user.id) {
    throw new ApiError(403, "Only the project owner can remove project members");
  }

  if (userId === project.ownerId) {
    throw new ApiError(400, "Project owner cannot be removed from the project");
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId: id,
      userId,
    },
  });

  if (!membership) {
    throw new ApiError(404, "Project member not found");
  }

  await prisma.projectMember.delete({
    where: { id: membership.id },
  });

  res.json({
    success: true,
    message: "Project member removed successfully",
  });
});

// Get Project By ID
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectAccessFilter(req.user.id),
    },
    include: {
      dockerHosts: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
        },
      },
      projectMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({
    success: true,
    project: {
      ...project,
      dockerHostConnected: project.dockerHosts.length > 0,
      members: [
        {
          id: project.owner.id,
          name: project.owner.name,
          email: project.owner.email,
          role: "OWNER",
        },
        ...project.projectMembers.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
        })),
      ],
    },
  });
});

// Update Project
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, environment, teamId } = req.body;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...projectAccessFilter(req.user.id),
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const updateData = {};
  if (typeof name === "string") updateData.name = name;
  if (typeof description === "string") updateData.description = description;
  if (typeof environment === "string") updateData.environment = environment;

  if (teamId !== undefined) {
    if (teamId !== null) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          ownerId: req.user.id,
        },
      });
      if (!team) {
        throw new ApiError(403, "Cannot assign project to a team you do not own");
      }
    }
    updateData.teamId = teamId;
  }

  const updatedProject = await prisma.project.update({
    where: {
      id,
    },
    data: updateData,
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
      ...projectAccessFilter(req.user.id),
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