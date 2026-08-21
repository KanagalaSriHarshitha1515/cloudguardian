import { useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { FolderKanban, Server, ShieldCheck, Sparkles } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";
import useProjects from "../../hooks/useProjects";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, fetchProjects, loading } = useProjects();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectedCount = projects.filter((p) => p.dockerHostConnected).length;

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(15,23,42,0.25))"
              : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25} mb={0.75}>
          <Sparkles size={18} color="#6366F1" />
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.2 }}>
            CloudGuardian overview
          </Typography>
        </Box>
        <Typography variant="h5" mb={0.5}>
          Welcome back, {user?.name?.split(" ")[0] || "there"}!
        </Typography>
        <Typography color="text.secondary">
          Here is a live summary of your infrastructure footprint and recent project health.
        </Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card hover sx={{ height: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
              <FolderKanban size={18} color="#6366F1" />
            </Box>
            <Typography variant="h5">{projects.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card hover sx={{ height: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="text.secondary">
                Connected Hosts
              </Typography>
              <Server size={18} color="#10B981" />
            </Box>
            <Typography variant="h5">{connectedCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card hover sx={{ height: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <ShieldCheck size={18} color="#F59E0B" />
            </Box>
            <Typography variant="h5" textTransform="capitalize">
              {user?.role || "user"}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography fontWeight={700}>Recent Projects</Typography>
          <Button component={Link} to="/projects" variant="text">
            View all →
          </Button>
        </Box>

        {loading && <Loader />}

        {!loading &&
          projects.slice(0, 5).map((p) => (
            <Box
              key={p.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
              py={1.2}
              borderTop="1px solid"
              borderColor="divider"
            >
              <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                <FolderKanban size={16} color="#6366F1" />
                <Typography
                  component={Link}
                  to={`/projects/${p.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 600,
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.name}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {p.dockerHostConnected ? "Host connected" : "Awaiting host"}
              </Typography>
            </Box>
          ))}

        {!loading && projects.length === 0 && (
          <Typography color="text.secondary" fontSize={14}>
            No projects yet — create your first one to get started.
          </Typography>
        )}
      </Card>
    </Box>
  );
}
