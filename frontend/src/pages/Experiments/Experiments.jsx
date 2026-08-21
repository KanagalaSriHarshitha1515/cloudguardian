import { useEffect, useState } from "react";
import { Box, Typography, Chip, Alert, MenuItem, Select, FormControl, InputLabel, TextField } from "@mui/material";
import { FlaskConical } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import ResourceTable from "../../components/docker/ResourceTable";
import useDockerHost from "../../hooks/useDockerHost";
import useProjects from "../../hooks/useProjects";
import api from "../../services/api";

const columns = [
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "containerName", label: "Container" },
  { key: "duration", label: "Duration" },
  { key: "createdAt", label: "Started" },
];

export default function Experiments() {
  const { connected, host } = useDockerHost();
  const { selectedProject } = useProjects();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [statusMap, setStatusMap] = useState({});

  const [containers, setContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState("");
  const [selectedType, setSelectedType] = useState("CPU");
  const [duration, setDuration] = useState(15);

  const load = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const [experimentsRes, containersRes] = await Promise.all([
        api.get(`/experiments/${selectedProject.id}`),
        host ? api.get(`/containers/${host.id}`) : Promise.resolve({ data: { containers: [] } }),
      ]);

      setItems((experimentsRes.data.experiments || []).map((item) => ({
        ...item,
        containerName: item.container?.name || item.containerId,
        createdAt: new Date(item.createdAt).toLocaleString(),
        duration: `${item.duration} min`,
      })));

      setContainers(containersRes.data.containers || []);
      if (containersRes.data.containers?.length && !selectedContainer) {
        setSelectedContainer(containersRes.data.containers[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load experiments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && host) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, host?.id, selectedProject?.id]);

  const createExperiment = async () => {
    if (!selectedProject || !host || !selectedContainer) return;
    setCreating(true);
    setError("");
    try {
      await api.post(`/experiments/${selectedProject.id}`, {
        containerId: selectedContainer,
        type: selectedType,
        duration,
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create experiment");
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (experimentId, nextStatus) => {
    try {
      await api.patch(`/experiments/${selectedProject.id}/${experimentId}/status`, { status: nextStatus });
      setStatusMap((prev) => ({ ...prev, [experimentId]: "" }));
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update experiment status");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="h5">Experiments</Typography>
          <Typography color="text.secondary">Track container load and behavior checks across this project.</Typography>
        </Box>
        {connected && (
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="container-select-label">Container</InputLabel>
            <Select
              labelId="container-select-label"
              label="Container"
              value={selectedContainer}
              onChange={(e) => setSelectedContainer(e.target.value)}
            >
              {containers.map((container) => (
                <MenuItem key={container.id} value={container.id}>
                  {container.name || container.id.slice(0, 12)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              label="Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="CPU">CPU</MenuItem>
              <MenuItem value="MEMORY">MEMORY</MenuItem>
              <MenuItem value="DISK">DISK</MenuItem>
              <MenuItem value="NETWORK">NETWORK</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="number"
            label="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
            sx={{ width: 140 }}
            inputProps={{ min: 1, max: 60 }}
          />

          <Button onClick={createExperiment} disabled={creating || !selectedContainer}>
            {creating ? "Running…" : "+ Run Experiment"}
          </Button>
        </Box>
      )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ResourceTable
        title="Experiment timeline"
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle={connected ? "No experiments yet" : "Connect a Docker Host first"}
        emptyDescription={
          connected
            ? "Run a load or diagnostics experiment to begin tracking it here."
            : "This project has no Docker Host connected yet."
        }
        renderRowActions={(row) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={row.status}
              color={
                row.status === "COMPLETED"
                  ? "success"
                  : row.status === "FAILED"
                    ? "error"
                    : row.status === "RUNNING"
                      ? "warning"
                      : "default"
              }
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id={`status-${row.id}`}>Update</InputLabel>
              <Select
                labelId={`status-${row.id}`}
                value={statusMap[row.id] || row.status}
                label="Update"
                onChange={(e) => updateStatus(row.id, e.target.value)}
                sx={{ minWidth: 110 }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="RUNNING">Running</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      />

      {!connected && !loading && (
        <Card sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <FlaskConical size={18} color="#6366F1" />
          <Typography color="text.secondary">Experiment tracking is available once a Docker host is connected to the project.</Typography>
        </Card>
      )}
    </Box>
  );
}
