import api from "./api";
import { normalizeList } from "../utils/normalizeList";

export async function getProjects() {
  const { data } = await api.get("/projects");
  return normalizeList(data);
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data?.project ?? data;
}

export async function createProject(payload) {
  const { data } = await api.post("/projects", payload);
  return data?.project ?? data;
}

export async function getProjectMembers(id) {
  const { data } = await api.get(`/projects/${id}/members`);
  return data.members || [];
}

export async function addProjectMember(id, payload) {
  const { data } = await api.post(`/projects/${id}/members`, payload);
  return data.member;
}

export async function removeProjectMember(id, userId) {
  await api.delete(`/projects/${id}/members/${userId}`);
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`);
}