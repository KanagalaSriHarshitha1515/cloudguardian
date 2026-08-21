import api from "./api";

export async function getTeams() {
  const { data } = await api.get("/teams");
  return data.teams || [];
}

export async function createTeam(payload) {
  const { data } = await api.post("/teams", payload);
  return data.team;
}

export async function addTeamMember(teamId, payload) {
  const { data } = await api.post(`/teams/${teamId}/members`, payload);
  return data.member;
}

export async function removeTeamMember(teamId, userId) {
  await api.delete(`/teams/${teamId}/members/${userId}`);
}

export async function assignProjectToTeam(teamId, projectId) {
  const { data } = await api.post(`/teams/${teamId}/projects/${projectId}`);
  return data.project;
}

export async function removeProjectFromTeam(teamId, projectId) {
  const { data } = await api.delete(`/teams/${teamId}/projects/${projectId}`);
  return data;
}
