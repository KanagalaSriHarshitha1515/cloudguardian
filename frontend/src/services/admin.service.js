import api from "./api";
import { normalizeList } from "../utils/normalizeList";

// Everything here is admin-only on the backend — your API should reject
// these calls with 403 for any non-admin JWT, regardless of what the
// frontend shows/hides in the UI. The sidebar/route gating here is just UX,
// not security; the real enforcement has to live server-side.

export async function getUsers() {
  const { data } = await api.get("/admin/users");
  return normalizeList(data);
}

export async function getUser(id) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

export async function suspendUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data;
}

export async function activateUser(id) {
  const { data } = await api.patch(`/admin/users/${id}/activate`);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/admin/users/${id}`);
}

export async function getUserProjects(id) {
  const { data } = await api.get(`/admin/users/${id}/projects`);
  return normalizeList(data);
}