import { useState } from "react";
import { Box, Typography, TextField, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useDockerHost from "../../hooks/useDockerHost";

// Simplified to match what your DockerHost Prisma model actually stores:
// name, host, port. Nothing else (no TLS certs, no SSH, no socket path)
// is persisted, so offering those options would silently do nothing —
// removed rather than leave misleading UI.
export default function ConnectDockerHost() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { connectHost, connected, host } = useDockerHost();
  const [form, setForm] = useState({ name: "", host: "", port: "2375" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await connectHost(form);
      navigate(`/projects/${projectId}/containers`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to that Docker Host. Check the address and port and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <Box maxWidth={560} mx="auto" py={4}>
        <Card sx={{ textAlign: "center" }}>
          <Typography variant="h5" mb={1}>
            Docker Host already connected
          </Typography>
          <Typography color="success.main" fontWeight={700} mb={1}>
            ✅ {host?.name}
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {host?.host}:{host?.port}
          </Typography>
          <Button component="a" href={`/projects/${projectId}/containers`} fullWidth>
            View Containers
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box maxWidth={560} mx="auto" py={4}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Connect Docker Host
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Securely connect a Docker Engine over TCP for this project. The host will be used by containers, images, volumes, and other infrastructure pages.
      </Typography>

      <Card component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3 }}>
          This connects over unsecured TCP — only use this on a trusted private network, never over the public internet.
        </Alert>

        <TextField label="Host name" fullWidth required value={form.name} onChange={update("name")} placeholder="e.g. prod-host-01" sx={{ mb: 2 }} />
        <Box display="flex" gap={1.5} mb={2}>
          <TextField label="Host address" fullWidth required value={form.host} onChange={update("host")} placeholder="127.0.0.1" />
          <TextField label="Port" required value={form.port} onChange={update("port")} sx={{ width: 130 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Most Docker Engines expose the REST API on port 2375 when TCP is enabled.
        </Typography>

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Testing connection…" : "Test & Connect"}
        </Button>
      </Card>
    </Box>
  );
}