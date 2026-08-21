import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// requireRole ensures the user has one of the allowed roles
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!allowedRoles.length) return next();
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
};

export const projectAccessFilter = (userId) => ({
  OR: [
    { ownerId: userId },
    { projectMembers: { some: { userId } } },
    { team: { ownerId: userId } },
    { team: { members: { some: { userId } } } },
  ],
});

export const dockerHostAccessFilter = (userId) => ({
  project: projectAccessFilter(userId),
});

export const isProjectOwner = (project, userId) => project?.ownerId === userId;

export const requireProjectOwnership = (paramName = "projectId") => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    if (!projectId) return res.status(400).json({ success: false, message: "Missing project identifier" });

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...projectAccessFilter(user.id),
      },
    });

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (project.ownerId !== user.id) {
      return res.status(403).json({ success: false, message: "Only the project owner can manage members" });
    }

    req.project = project;
    return next();
  };
};

// requireProjectAccess verifies the authenticated user has access to the project
// It allows owner or a ProjectMember relationship.
export const requireProjectAccess = (paramName = "projectId") => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params[paramName] || req.body[paramName] || req.query[paramName];
    if (!projectId) return res.status(400).json({ success: false, message: "Missing project identifier" });

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...projectAccessFilter(user.id),
      },
    });

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    req.project = project;
    return next();
  };
};

// Simple permission mapping helper (permission strings -> roles)
export const requirePermission = (permission) => {
  // Map permission to minimum role allowed. This is a simple example and
  // can be replaced with a more advanced permission matrix later.
  const permissionRoleMap = {
    'project.manage': ['OWNER', 'ADMIN'],
    'docker.host.manage': ['OWNER', 'ADMIN'],
    'experiment.create': ['OWNER', 'ADMIN', 'MEMBER'],
    'experiment.execute': ['OWNER', 'ADMIN', 'MEMBER'],
    'experiment.view': ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
  };

  const allowed = permissionRoleMap[permission] || [];
  return requireRole(allowed);
};

export default { requireRole, requireProjectAccess, requirePermission };
