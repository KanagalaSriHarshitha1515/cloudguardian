import { useCallback, useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Alert, Chip } from "@mui/material";
import { Users } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import * as teamService from "../../services/team.service";
import * as projectService from "../../services/project.service";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [assignProjectId, setAssignProjectId] = useState("");
  const [error, setError] = useState("");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const [nextTeams, nextProjects] = await Promise.all([
        teamService.getTeams(),
        projectService.getProjects(),
      ]);
      setTeams(nextTeams);
      setProjects(nextProjects);
      if (nextProjects.length > 0 && !assignProjectId) {
        setAssignProjectId(nextProjects[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load teams");
    } finally {
      setLoading(false);
    }
  }, [assignProjectId]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await teamService.createTeam({ name, description });
      setName("");
      setDescription("");
      await loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (teamId) => {
    if (!memberEmail.trim()) return;
    try {
      await teamService.addTeamMember(teamId, { email: memberEmail, role: memberRole });
      setMemberEmail("");
      setMemberRole("MEMBER");
      await loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add team member");
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await teamService.removeTeamMember(teamId, userId);
      await loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove team member");
    }
  };

  const handleAssignProject = async (teamId) => {
    if (!assignProjectId) return;
    try {
      await teamService.assignProjectToTeam(teamId, assignProjectId);
      await loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Could not assign project to team");
    }
  };

  const handleRemoveProject = async (teamId, projectId) => {
    try {
      await teamService.removeProjectFromTeam(teamId, projectId);
      await loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove project from team");
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Teams</Typography>

      <Card component="form" onSubmit={handleCreateTeam} sx={{ mb: 3 }}>
        <Typography fontWeight={700} mb={2}>Create Team</Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField label="Team name" fullWidth required value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting ? "Creating…" : "Create team"}
        </Button>
      </Card>

      {loading ? (
        <Loader />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No teams yet"
          description="Create a team to group projects and collaborators."
        />
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {teams.map((team) => (
            <Card key={team.id}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                <Box>
                  <Typography variant="h6">{team.name}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {team.description || "No description"}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                  <TextField
                    select
                    size="small"
                    label="Project"
                    value={assignProjectId}
                    onChange={(e) => setAssignProjectId(e.target.value)}
                    sx={{ minWidth: 180 }}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                    ))}
                  </TextField>
                  <Button onClick={() => handleAssignProject(team.id)}>Assign</Button>
                </Box>
              </Box>

              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap" mb={2}>
                <TextField
                  size="small"
                  label="Add member"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  sx={{ minWidth: 220, flex: 1 }}
                />
                <TextField
                  size="small"
                  select
                  label="Role"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="OWNER">OWNER</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="MEMBER">MEMBER</MenuItem>
                  <MenuItem value="VIEWER">VIEWER</MenuItem>
                </TextField>
                <Button onClick={() => handleAddMember(team.id)}>Add</Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {team.members?.length ? (
                  team.members.map((member) => (
                    <Chip
                      key={member.user.id}
                      label={`${member.user.name} · ${member.role}`}
                      onDelete={member.user.id !== team.ownerId ? () => handleRemoveMember(team.id, member.user.id) : undefined}
                      color={member.user.id === team.ownerId ? "primary" : "default"}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No members yet</Typography>
                )}
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {team.projects?.length ? (
                  team.projects.map((project) => (
                    <Chip
                      key={project.id}
                      label={project.name}
                      onDelete={() => handleRemoveProject(team.id, project.id)}
                      color="info"
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No projects assigned</Typography>
                )}
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
