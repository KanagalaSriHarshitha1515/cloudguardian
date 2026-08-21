import { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import useProjects from "../../hooks/useProjects";
import useDockerHost from "../../hooks/useDockerHost";
import * as projectService from "../../services/project.service";

// This page is the fork in the road: if no Docker Host is connected for
// this project, it shows a "Connect" prompt instead of infrastructure
// data — the Sidebar reads the same connected state to decide whether
// to expand its Infrastructure section.
export default function ProjectOverview() {
  const { projectId } = useParams();
  const { selectedProject, selectProjectById } = useProjects();
  const { connected, host, loading } = useDockerHost();
  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    if (!projectId) return;
    try {
      const nextMembers = await projectService.getProjectMembers(projectId);
      setMembers(nextMembers);
    } catch (err) {
      console.error("Failed to load project members", err);
    }
  };

  useEffect(() => {
    selectProjectById(projectId);
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!projectId || !memberEmail.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await projectService.addProjectMember(projectId, {
        email: memberEmail,
        role: memberRole,
      });
      setMemberEmail("");
      setMemberRole("MEMBER");
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add project member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!projectId) return;
    try {
      await projectService.removeProjectMember(projectId, userId);
      await loadMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove project member");
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        {selectedProject?.name || "Project"}
      </Typography>
      <Typography color="text.secondary" mb={1}>
        {selectedProject?.description}
      </Typography>
      {selectedProject?.team ? (
        <Typography color="text.secondary" mb={3}>
          Assigned team: <strong>{selectedProject.team.name}</strong>
        </Typography>
      ) : (
        <Typography color="text.secondary" mb={3}>
          Assigned team: <strong>None</strong>
        </Typography>
      )}

      <Card sx={{ mb: 3 }}>
        <Typography fontWeight={700} mb={1}>
          Docker Host
        </Typography>
        {loading ? (
          <Typography color="text.secondary">Checking connection…</Typography>
        ) : connected ? (
          <Typography color="success.main" fontWeight={600}>
            ✅ Connected — {host?.name} ({host?.host}:{host?.port})
          </Typography>
        ) : (
          <Box>
            <Typography color="error.main" fontWeight={600} mb={2}>
              ❌ Not Connected
            </Typography>
            <Button component={Link} to={`/projects/${projectId}/docker-host`}>
              Connect Docker Host
            </Button>
          </Box>
        )}
      </Card>

      <Card>
        <Typography fontWeight={700} mb={2}>
          Project Members
        </Typography>

        <Box component="form" onSubmit={handleAddMember} display="flex" gap={1.5} flexWrap="wrap" mb={2}>
          <TextField
            size="small"
            label="Member email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            sx={{ minWidth: 240, flex: 1 }}
          />
          <TextField
            size="small"
            label="Role"
            select
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="OWNER">OWNER</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="MEMBER">MEMBER</MenuItem>
            <MenuItem value="VIEWER">VIEWER</MenuItem>
          </TextField>
          <Button type="submit" disabled={submitting || !memberEmail.trim()}>
            {submitting ? "Adding…" : "Add member"}
          </Button>
        </Box>

        {error && (
          <Typography color="error.main" fontSize={13} mb={1}>
            {error}
          </Typography>
        )}

        {members.length === 0 ? (
          <Typography color="text.secondary">No members yet.</Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.25}>
            {members.map((member) => (
              <Box
                key={member.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                px={1.5}
                py={1}
                border="1px solid"
                borderColor="divider"
                borderRadius={2}
              >
                <Box>
                  <Typography fontWeight={600}>{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.email} · {member.role}
                  </Typography>
                </Box>
                {member.role !== "OWNER" && (
                  <Button variant="text" color="error" onClick={() => handleRemoveMember(member.id)}>
                    Remove
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}