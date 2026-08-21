import { useEffect, useState } from "react";
import { Box, TextField, Alert, Typography } from "@mui/material";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import useDockerHost from "../../hooks/useDockerHost";
import useProjects from "../../hooks/useProjects";

const columns = [
  { key: "name", label: "Stack" },
  { key: "services", label: "Services" },
  { key: "status", label: "Status" },
];

const composePlaceholder = `version: "3.8"
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"`;

export default function Stacks() {
  // Uses host.id (the real dockerHostId), not projectId — see Containers.jsx for why.
  const { connected, host } = useDockerHost();
  const { selectedProject } = useProjects();
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [stackName, setStackName] = useState("");
  const [composeFile, setComposeFile] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      setStacks(await dockerService.getStacks(selectedProject.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleDelete = async (name) => {
    if (!selectedProject) return;
    await dockerService.removeStack(selectedProject.id, name);
    load();
  };

  const resetForm = () => {
    setStackName("");
    setComposeFile("");
    setError("");
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Payload shape confirmed against your real stack.routes.js:
      // { stackName, composeFile } — composeFile is the raw YAML as a
      // string in a JSON field, NOT a multipart file upload. Real .yml
      // file upload would require a backend route change to accept
      // multipart/form-data, plus swapping this to send FormData instead.
      if (!selectedProject) return;
      await dockerService.deployStack(selectedProject.id, { stackName, composeFile });
      setOpen(false);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not deploy stack");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <ResourceTable
        title="Stacks"
        columns={columns}
        rows={stacks}
        loading={loading}
        emptyTitle={connected ? "No stacks deployed" : "Connect a Docker Host first"}
        emptyDescription={
          connected ? "Deploy a compose file to create your first stack." : "This project has no Docker Host connected yet."
        }
        action={connected && <Button onClick={() => setOpen(true)}>+ Deploy Stack</Button>}
        renderRowActions={(row) => (
          <button
            onClick={() => handleDelete(row.name)}
            style={{ color: "#EF4444", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            Remove
          </button>
        )}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Deploy Stack" width={560}>
        <Box component="form" onSubmit={handleDeploy}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Stack name"
            fullWidth
            required
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="e.g. nginx-stack"
            sx={{ mb: 2 }}
          />
          <Typography fontSize={12} color="text.secondary" mb={0.75}>
            Compose file (paste your docker-compose.yml contents)
          </Typography>
          <TextField
            fullWidth
            required
            multiline
            rows={10}
            value={composeFile}
            onChange={(e) => setComposeFile(e.target.value)}
            placeholder={composePlaceholder}
            sx={{ mb: 1, "& textarea": { fontFamily: "monospace", fontSize: 12.5 } }}
          />
          <Button type="submit" fullWidth disabled={submitting} sx={{ mt: 2 }}>
            {submitting ? "Deploying…" : "Deploy Stack"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}