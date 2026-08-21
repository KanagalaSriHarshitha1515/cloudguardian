import api from "./api";
import { normalizeList } from "../utils/normalizeList";

// ---------- Docker Host ----------
// Backend wraps responses as { success, dockerHost }, so unwrap that here —
// every other file in this app should just deal with a plain host object.
// host.id is the REAL dockerHostId used by every resource below (containers,
// images, etc.) — it is NOT the same as projectId, despite the parameter
// name used to look it up here.
export async function getHost(projectId) {
  try {
    const { data } = await api.get(`/docker-hosts/${projectId}`);
    return data.dockerHost;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}
export async function connectHost(projectId, payload) {
  // payload shape: { name, host, port } — matches your DockerHost Prisma model exactly.
  const { data } = await api.post(`/docker-hosts/${projectId}`, payload);
  return data.dockerHost;
}
export async function disconnectHost(projectId) {
  await api.delete(`/docker-hosts/${projectId}`);
}

// ---------- Containers ----------
// Confirmed against your real container.routes.js (mounted at /api/containers,
// routes keyed by :dockerHostId — which is projectId in this app's model).
export const getContainers = (projectId) =>
  api.get(`/containers/${projectId}`).then((r) => normalizeList(r.data));
export const containerAction = (projectId, containerId, action) =>
  // action: "start" | "stop" | "restart"
  api.post(`/containers/${projectId}/${containerId}/${action}`).then((r) => r.data);
export const deleteContainer = (projectId, containerId) =>
  api.delete(`/containers/${projectId}/${containerId}`).then((r) => r.data);

// ---------- Images ----------
// Confirmed against your real image.routes.js.
export const getImages = (projectId) =>
  api.get(`/images/${projectId}`).then((r) => normalizeList(r.data));
export const pullImage = (projectId, payload) =>
  api.post(`/images/${projectId}/pull`, payload).then((r) => r.data);
export const deleteImage = (projectId, imageId) =>
  api.delete(`/images/${projectId}/${imageId}`).then((r) => r.data);

// ---------- Volumes ----------
// Confirmed against your real volume.routes.js.
export const getVolumes = (projectId) =>
  api.get(`/volumes/${projectId}`).then((r) => normalizeList(r.data));
export const createVolume = (projectId, payload) =>
  api.post(`/volumes/${projectId}`, payload).then((r) => r.data);
export const deleteVolume = (projectId, name) =>
  api.delete(`/volumes/${projectId}/${name}`).then((r) => r.data);

// ---------- Networks ----------
// Confirmed against your real network.routes.js.
export const getNetworks = (projectId) =>
  api.get(`/networks/${projectId}`).then((r) => normalizeList(r.data));
export const createNetwork = (projectId, payload) =>
  api.post(`/networks/${projectId}`, payload).then((r) => r.data);
export const deleteNetwork = (projectId, name) =>
  api.delete(`/networks/${projectId}/${name}`).then((r) => r.data);

// ---------- Swarm ----------
// Confirmed against your real swarm.routes.js — note GET /:dockerHostId is
// "inspect swarm" (a single info object), NOT the node list. Nodes have
// their own dedicated /nodes sub-route.
export const getSwarmNodes = (projectId) =>
  api.get(`/swarm/${projectId}/nodes`).then((r) => normalizeList(r.data));
export const inspectSwarm = (projectId) =>
  api.get(`/swarm/${projectId}`).then((r) => r.data);
export const initSwarm = (projectId) =>
  api.post(`/swarm/${projectId}/init`).then((r) => r.data);
export const leaveSwarm = (projectId) =>
  api.post(`/swarm/${projectId}/leave`).then((r) => r.data);

// ---------- Services ----------
// Confirmed against your real service.routes.js.
// createService payload must be shaped: { serviceName, image, replicas }
// (NOT { name, ... } — your Docker Swarm service model uses "serviceName").
export const getServices = (projectId) =>
  api.get(`/services/${projectId}`).then((r) => normalizeList(r.data));
export const createService = (projectId, payload) =>
  api.post(`/services/${projectId}`, payload).then((r) => r.data);
export const scaleService = (projectId, serviceId, replicas) =>
  api.patch(`/services/${projectId}/${serviceId}/scale`, { replicas }).then((r) => r.data);
export const deleteService = (projectId, serviceId) =>
  api.delete(`/services/${projectId}/${serviceId}`).then((r) => r.data);

// ---------- Stacks ----------
// Confirmed against your real stack.routes.js.
// deployStack payload must be shaped: { stackName, composeFile }
// (composeFile is the raw compose YAML as a string, not a file upload —
// if you want actual file upload later, that route would need to switch
// to multipart/form-data and this function would need FormData instead).
export const getStacks = (projectId) =>
  api.get(`/stacks/${projectId}`).then((r) => normalizeList(r.data));
export const deployStack = (projectId, payload) =>
  api.post(`/stacks/${projectId}`, payload).then((r) => r.data);
export const removeStack = (projectId, stackName) =>
  api.delete(`/stacks/${projectId}/${stackName}`).then((r) => r.data);