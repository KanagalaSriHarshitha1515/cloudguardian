import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const getUserTeamAccessWhere = (userId) => ({
  OR: [{ ownerId: userId }, { members: { some: { userId } } }],
});

export const listTeams = asyncHandler(async (req, res) => {
  const teams = await prisma.team.findMany({
    where: getUserTeamAccessWhere(req.user.id),
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
      projects: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    count: teams.length,
    teams,
  });
});

export const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, "Team name is required");
  }

  const team = await prisma.team.create({
    data: {
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      ownerId: req.user.id,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    team,
  });
});

export const addTeamMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { email, role = "MEMBER" } = req.body;

  if (!email) {
    throw new ApiError(400, "Member email is required");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: req.user.id,
    },
  });

  if (!team) {
    throw new ApiError(404, "Team not found or you are not the owner");
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });

  if (!user) {
    throw new ApiError(404, "User not found with that email");
  }

  if (user.id === team.ownerId) {
    throw new ApiError(400, "The team owner is already on the team");
  }

  const existing = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId: user.id,
    },
  });

  if (existing) {
    throw new ApiError(400, "User is already a member of this team");
  }

  const member = await prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role: String(role).toUpperCase(),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Team member added successfully",
    member: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    },
  });
});

export const removeTeamMember = asyncHandler(async (req, res) => {
  const { teamId, userId } = req.params;

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: req.user.id,
    },
  });

  if (!team) {
    throw new ApiError(404, "Team not found or you are not the owner");
  }

  if (userId === team.ownerId) {
    throw new ApiError(400, "The team owner cannot be removed");
  }

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
    },
  });

  if (!membership) {
    throw new ApiError(404, "Team member not found");
  }

  await prisma.teamMember.delete({
    where: { id: membership.id },
  });

  res.json({
    success: true,
    message: "Team member removed successfully",
  });
});

export const assignProjectToTeam = asyncHandler(async (req, res) => {
  const { teamId, projectId } = req.params;

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: req.user.id,
    },
  });

  if (!team) {
    throw new ApiError(404, "Team not found or you are not the owner");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found or you are not the owner");
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { teamId },
  });

  res.json({
    success: true,
    message: "Project assigned to team successfully",
    project: updatedProject,
  });
});

export const removeProjectFromTeam = asyncHandler(async (req, res) => {
  const { teamId, projectId } = req.params;

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: req.user.id,
    },
  });

  if (!team) {
    throw new ApiError(404, "Team not found or you are not the owner");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      teamId: teamId,
    },
  });

  if (!project) {
    throw new ApiError(404, "Project not found or not assigned to this team");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { teamId: null },
  });

  res.json({
    success: true,
    message: "Project unassigned from team successfully",
  });
});
