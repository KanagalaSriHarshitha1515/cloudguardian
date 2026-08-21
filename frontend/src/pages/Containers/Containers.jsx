import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import * as dockerService from "../../services/docker.service";
import ResourceTable from "../../components/docker/ResourceTable";
import ContainerCard from "../../components/docker/ContainerCard";
import Button from "../../components/common/Button";
import useDockerHost from "../../hooks/useDockerHost";

const columns = [
  { key: "name", label: "Name" },
  { key: "id", label: "Container ID" },
  { key: "status", label: "Status" },
  { key: "cpu", label: "CPU" },
  { key: "mem", label: "Memory" },
];

export default function Containers() {
  // IMPORTANT: every call below uses host.id — the Docker Host's own
  // Prisma-generated UUID — NOT projectId. These are different values;
  // using projectId here is what caused the earlier 500 errors.
  const { connected, host } = useDockerHost();
  const { projectId } = useParams();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    if (!host) return;
    setError("");
    setLoading(true);
    try {
      const data = await dockerService.getContainers(host.id);
      setContainers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load containers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id]);

  const handleAction = async (containerId, action) => {
    if (!host) return;
    setError("");
    setActionLoading((prev) => ({ ...prev, [containerId]: true }));
    try {
      await dockerService.containerAction(host.id, containerId, action);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${action} container.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [containerId]: false }));
    }
  };

  const running = containers.filter((c) => c.status === "running").length;

  return (
    <Box>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <ContainerCard label="Total" value={containers.length} />
        <ContainerCard label="Running" value={running} color="success.main" />
        <ContainerCard label="Stopped" value={containers.length - running} color="error.main" />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ResourceTable
        title="Containers"
        columns={columns}
        rows={containers}
        loading={loading}
        action={
          !connected ? (
            <Button component={Link} to={`/projects/${projectId}/docker-host`}>
              Connect Docker Host
            </Button>
          ) : (
            <Button onClick={load} disabled={loading}>
              Refresh
            </Button>
          )
        }
        emptyTitle={connected ? "No containers found" : "Connect a Docker Host first"}
        emptyDescription={
          connected
            ? "Containers running on this host will appear here."
            : "This project has no Docker Host connected yet. Connect a host to begin viewing containers."
        }
        renderRowActions={(row) => (
          <Button
            variant="outlined"
            size="small"
            disabled={actionLoading[row.id]}
            onClick={() => handleAction(row.id, row.status === "running" ? "stop" : "start")}
          >
            {row.status === "running" ? "Stop" : "Start"}
          </Button>
        )}
      />
    </Box>
  );
}