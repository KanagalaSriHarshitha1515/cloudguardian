import { useEffect, useState } from "react";
import { Box, Typography, Grid, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { Users as UsersIcon, Crown, Ban, ShieldCheck, MoreHorizontal, CircleSlash, CheckCircle2, Trash2 } from "lucide-react";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import * as adminService from "../../services/admin.service";
import { isAdminRole } from "../../utils/roles";

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card sx={{ flex: 1, minWidth: 150 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
        <Typography variant="h4">{value}</Typography>
        <Icon size={18} color="var(--mui-palette-text-secondary, #6B7280)" />
      </Box>
    </Card>
  );
}

function StatusPill({ status }) {
  const isActive = status === "active";
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={0.6}
      px={1.2}
      py={0.4}
      borderRadius={5}
      sx={{ bgcolor: isActive ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)", color: isActive ? "success.main" : "error.main" }}
    >
      <Box width={6} height={6} borderRadius="50%" bgcolor="currentColor" />
      <Typography fontSize={11.5} fontWeight={600} textTransform="capitalize">
        {status}
      </Typography>
    </Box>
  );
}

// Same manual-dropdown pattern used everywhere else in the app (see
// UserMenu.jsx) — no MUI <Menu>, so no risk of the click-freeze bug.
function UserRowMenu({ user, onSuspend, onActivate, onDelete }) {
  const [open, setOpen] = useState(false);
  const isActive = user.status === "active";

  return (
    <Box position="relative" display="inline-block">
      <IconButton size="small" onClick={() => setOpen((v) => !v)} sx={{ color: "text.secondary" }}>
        <MoreHorizontal size={16} />
      </IconButton>
      {open && (
        <>
          <Box onClick={() => setOpen(false)} sx={{ position: "fixed", inset: 0, zIndex: 1200 }} />
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              right: 0,
              mt: 0.5,
              width: 190,
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
              onClick={() => {
                setOpen(false);
                isActive ? onSuspend(user) : onActivate(user);
              }}
              display="flex"
              alignItems="center"
              gap={1.25}
              px={1.5}
              py={1}
              sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
            >
              {isActive ? <CircleSlash size={14} /> : <CheckCircle2 size={14} />}
              <Typography fontSize={13}>{isActive ? "Suspend user" : "Activate user"}</Typography>
            </Box>
            <Box
              onClick={() => {
                setOpen(false);
                onDelete(user);
              }}
              display="flex"
              alignItems="center"
              gap={1.25}
              px={1.5}
              py={1}
              sx={{ cursor: "pointer", color: "error.main", "&:hover": { bgcolor: "action.hover" } }}
            >
              <Trash2 size={14} />
              <Typography fontSize={13}>Delete account</Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await adminService.getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSuspend = async (user) => {
    await adminService.suspendUser(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "suspended" } : u)));
  };
  const handleActivate = async (user) => {
    await adminService.activateUser(user.id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: "active" } : u)));
  };
  const handleDelete = async (user) => {
    const ok = window.confirm(`Permanently delete ${user.name}'s account? This cannot be undone.`);
    if (!ok) return;
    await adminService.deleteUser(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const adminCount = users.filter((u) => isAdminRole(u.role)).length;

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>
        Registered Users
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Every account with access to CloudGuardian.
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}>
          <StatCard label="Total Users" value={users.length} icon={UsersIcon} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Active" value={activeCount} icon={ShieldCheck} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Suspended" value={suspendedCount} icon={Ban} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard label="Administrators" value={adminCount} icon={Crown} />
        </Grid>
      </Grid>

      {loading && <Loader />}

      {!loading && users.length === 0 && (
        <EmptyState icon={<UsersIcon size={36} />} title="No users found" description="Registered users will show up here." />
      )}

      {!loading && users.length > 0 && (
        <Card sx={{ p: 0, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Projects</TableCell>
                <TableCell>Docker Hosts</TableCell>
                <TableCell>Last active</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const initials = u.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box
                        component={Link}
                        to={`/admin/users/${u.id}`}
                        display="flex"
                        alignItems="center"
                        gap={1.25}
                        sx={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: "text.primary", color: "background.paper" }}>
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography fontSize={13.5} fontWeight={600}>
                            {u.name}
                          </Typography>
                          <Typography fontSize={11.5} color="text.secondary">
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5} textTransform="capitalize" fontSize={13}>
                        {isAdminRole(u.role) && <Crown size={13} color="#D97706" />}
                        {u.role}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={u.status} />
                    </TableCell>
                    <TableCell>{u.projectsCount ?? "—"}</TableCell>
                    <TableCell>{u.hostsCount ?? "—"}</TableCell>
                    <TableCell>
                      <Typography fontSize={12.5} color="text.secondary">
                        {u.lastActiveAt || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {!isAdminRole(u.role) && (
                        <UserRowMenu user={u} onSuspend={handleSuspend} onActivate={handleActivate} onDelete={handleDelete} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}