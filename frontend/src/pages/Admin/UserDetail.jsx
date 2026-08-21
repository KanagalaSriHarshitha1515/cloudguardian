import { useEffect, useState } from "react";
import { Box, Typography, Grid, Avatar, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FolderKanban, Server, Crown } from "lucide-react";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import * as adminService from "../../services/admin.service";
import { isAdminRole } from "../../utils/roles";

export default function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminService.getUser(userId), adminService.getUserProjects(userId)])
      .then(([u, p]) => {
        setUser(u);
        setProjects(p);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader />;
  if (!user) return <EmptyState title="User not found" description="This account may have been deleted." />;

  const initials = user.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const connectedHosts = projects.filter((p) => p.dockerHostConnected).length;

  return (
    <Box>
      <Box
        component={Link}
        to="/admin/users"
        display="inline-flex"
        alignItems="center"
        gap={0.75}
        mb={2}
        sx={{ textDecoration: "none", color: "text.secondary", fontSize: 13, "&:hover": { color: "text.primary" } }}
      >
        <ArrowLeft size={15} /> Back to all users
      </Box>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ width: 52, height: 52, fontSize: 18, fontWeight: 700, bgcolor: "text.primary", color: "background.paper" }}>
          {initials}
        </Avatar>
        <Box>
          <Box display="flex" alignItems="center" gap={0.75}>
            <Typography variant="h5">{user.name}</Typography>
            {isAdminRole(user.role) && <Crown size={16} color="#D97706" />}
          </Box>
          <Typography color="text.secondary" fontSize={13.5}>
            {user.email} · <span style={{ textTransform: "capitalize" }}>{user.status}</span>
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
            <Typography variant="h4">{projects.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <Typography variant="body2" color="text.secondary">
              Connected Hosts
            </Typography>
            <Typography variant="h4">{connectedHosts}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <Typography variant="body2" color="text.secondary">
              Joined
            </Typography>
            <Typography variant="h4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 0, overflow: "hidden" }}>
        <Box px={3} py={2} borderBottom="1px solid" borderColor="divider" fontWeight={700} fontSize={14}>
          Projects
        </Box>
        {projects.length === 0 ? (
          <EmptyState icon={<FolderKanban size={32} />} title="No projects" description={`${user.name} hasn't created any projects yet.`} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Docker Host</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography fontSize={13.5} fontWeight={600}>
                      {p.name}
                    </Typography>
                    <Typography fontSize={11.5} color="text.secondary">
                      {p.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.6}>
                      <Server size={13} color={p.dockerHostConnected ? "#16A34A" : "#94A3B8"} />
                      <Typography fontSize={12.5} color={p.dockerHostConnected ? "success.main" : "text.secondary"}>
                        {p.dockerHostConnected ? "Connected" : "Not connected"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={12.5} color="text.secondary">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}