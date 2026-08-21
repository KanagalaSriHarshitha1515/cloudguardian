import { useEffect, useState } from "react";
import { Box, Typography, Grid, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { FolderKanban, MoreHorizontal, Trash2 } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import useProjects from "../../hooks/useProjects";

// Manual dropdown here too — see UserMenu.jsx for why MUI's <Menu> was
// dropped app-wide (its Modal-based backdrop was blocking clicks after close).
function ProjectCard({ project, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Card sx={{ position: "relative", "&:hover .project-card-menu-btn": { opacity: 1 } }}>
      <Box component={Link} to={`/projects/${project.id}`} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Typography fontWeight={600} pr={4} noWrap>
          {project.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.5}
          sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {project.description || "No description"}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Assigned team: <strong>{project.team?.name || "None"}</strong>
        </Typography>
      </Box>

      <IconButton
        className="project-card-menu-btn"
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        sx={{ position: "absolute", top: 10, right: 10, opacity: 0, transition: "opacity .15s ease", color: "text.secondary" }}
      >
        <MoreHorizontal size={16} />
      </IconButton>

      {menuOpen && (
        <>
          <Box
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(false);
            }}
            sx={{ position: "fixed", inset: 0, zIndex: 1200 }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 40,
              right: 10,
              width: 170,
              zIndex: 1201,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              boxShadow: (theme) => theme.customShadows?.soft,
              overflow: "hidden",
              py: 0.5,
            }}
          >
            <Box
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(project);
              }}
              display="flex"
              alignItems="center"
              gap={1.25}
              px={1.5}
              py={1}
              sx={{ cursor: "pointer", color: "error.main", "&:hover": { bgcolor: "action.hover" } }}
            >
              <Trash2 size={14} />
              <Typography fontSize={13}>Delete project</Typography>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}

export default function ProjectList() {
  const { projects, fetchProjects, deleteProject, loading } = useProjects();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (project) => {
    const ok = window.confirm(`Delete "${project.name}"? This cannot be undone.`);
    if (!ok) return;
    await deleteProject(project.id);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Projects</Typography>
        <Button component={Link} to="/projects/new">
          + New Project
        </Button>
      </Box>

      {loading && <Loader />}

      {!loading && projects.length === 0 && (
        <EmptyState
          icon={<FolderKanban size={36} />}
          title="No projects yet"
          description="Create a project to start connecting a Docker Host and managing containers."
          action={
            <Button component={Link} to="/projects/new">
              Create Project
            </Button>
          }
        />
      )}

      <Grid container spacing={2}>
        {projects.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <ProjectCard project={p} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}