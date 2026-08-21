import { useEffect, useState } from "react";
import { Box, TextField, Alert } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import useDockerHost from "../../hooks/useDockerHost";
import useProjects from "../../hooks/useProjects";

const columns = [
  { key: "name", label: "Service" },
  { key: "image", label: "Image" },
  { key: "running", label: "Running", render: (r) => `${r.running} / ${r.desired}` },
  { key: "ports", label: "Ports" },
];

export default function Services() {
  // Uses host.id (the real dockerHostId), not projectId — see Containers.jsx for why.
  const { connected, host } = useDockerHost();
  const { selectedProject } = useProjects();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [image, setImage] = useState("");
  const [replicas, setReplicas] = useState("1");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      setServices(await dockerService.getServices(selectedProject.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleDelete = async (serviceId) => {
    if (!selectedProject) return;
    await dockerService.deleteService(selectedProject.id, serviceId);
    load();
  };

  const resetForm = () => {
    setServiceName("");
    setImage("");
    setReplicas("1");
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Payload shape confirmed against your real service.controller.js
      // expectations: { serviceName, image, replicas } — NOT { name, ... }.
      if (!host) return;
      await dockerService.createService(selectedProject.id, {
        serviceName,
        image,
        replicas: Number(replicas) || 1,
      });
      setOpen(false);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <ResourceTable
        title="Services"
        columns={columns}
        rows={services}
        loading={loading}
        emptyTitle={connected ? "No services found" : "Connect a Docker Host first"}
        emptyDescription={
          connected ? "Deploy a service to this swarm to get started." : "This project has no Docker Host connected yet."
        }
        action={connected && <Button onClick={() => setOpen(true)}>+ New Service</Button>}
        renderRowActions={(row) => (
          <button
            onClick={() => handleDelete(row.id || row.name)}
            style={{ color: "#EF4444", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Remove
          </button>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="New Service">
        <Box component="form" onSubmit={handleCreate}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Service name"
            fullWidth
            required
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="e.g. nginx-service"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Image"
            fullWidth
            required
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. nginx:latest"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Replicas"
            type="number"
            fullWidth
            required
            value={replicas}
            onChange={(e) => setReplicas(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 1 }}
          />
          <Button type="submit" fullWidth disabled={submitting} sx={{ mt: 2 }}>
            {submitting ? "Creating…" : "Create Service"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}