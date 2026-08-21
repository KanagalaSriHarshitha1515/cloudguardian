import { useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useProjects from "../../hooks/useProjects";

export default function CreateProject() {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await createProject({ name, description });
      navigate(`/projects/${project.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={560} mx="auto" py={4}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Create a new project
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Projects let you group hosts, containers, and deployment resources together.
      </Typography>
      <Card component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField label="Project name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Creating project…" : "Create project"}
        </Button>
      </Card>
    </Box>
  );
}
