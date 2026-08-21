export const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const isAdminRole = (role) => normalizeRole(role) === "admin";
