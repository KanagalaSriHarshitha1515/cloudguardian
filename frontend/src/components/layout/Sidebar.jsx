import { useState, useRef, useCallback, useEffect } from "react";
import { Box, Typography, Divider, List, IconButton, Tooltip } from "@mui/material";
import {
  LayoutDashboard,
  FolderKanban,
  Server,
  Boxes,
  Image as ImageIcon,
  HardDrive,
  Network,
  GitBranch,
  Wrench,
  Layers3,
  FlaskConical,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  MoreHorizontal,
  Trash2,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import UserMenu from "./UserMenu";
import Logo from "../common/Logo";
import useDockerHost from "../../hooks/useDockerHost";
import useProjects from "../../hooks/useProjects";
import useAuth from "../../hooks/useAuth";
import { useThemeContext } from "../../context/ThemeContext";
import { isAdminRole } from "../../utils/roles";

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 76;
const DEFAULT_WIDTH = 256;

const baseNav = [
  { key: "dashboard", to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "projects", to: "/projects", icon: FolderKanban, label: "Projects" },
];

export default function Sidebar() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { selectedProject, deleteProject } = useProjects();
  const { user } = useAuth();
  const { connected } = useDockerHost();
  const { darkMode, toggleDarkMode } = useThemeContext();

  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(() => Number(localStorage.getItem("cg_sidebar_width")) || DEFAULT_WIDTH);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const isResizing = useRef(false);

  // Real drag-to-resize: mousedown on the thin edge handle starts tracking
  // mousemove on the window (not just the handle) so the drag keeps working
  // even if the cursor moves faster than the sidebar edge.
  const startResize = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isResizing.current) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(next);
    };
    const onMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setWidth((w) => {
        localStorage.setItem("cg_sidebar_width", String(w));
        return w;
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const dockerLinks = projectId
    ? [
        { to: `/projects/${projectId}/containers`, icon: Boxes, label: "Containers" },
        { to: `/projects/${projectId}/images`, icon: ImageIcon, label: "Images" },
        { to: `/projects/${projectId}/volumes`, icon: HardDrive, label: "Volumes" },
        { to: `/projects/${projectId}/networks`, icon: Network, label: "Networks" },
        { to: `/projects/${projectId}/swarm`, icon: GitBranch, label: "Swarm" },
        { to: `/projects/${projectId}/services`, icon: Wrench, label: "Services" },
        { to: `/projects/${projectId}/stacks`, icon: Layers3, label: "Stacks" },
        { to: `/projects/${projectId}/experiments`, icon: FlaskConical, label: "Experiments" },
      ]
    : [];

  const handleDeleteProject = async () => {
    setProjectMenuOpen(false);
    if (!selectedProject) return;
    const ok = window.confirm(`Delete "${selectedProject.name}"? This cannot be undone.`);
    if (!ok) return;
    await deleteProject(selectedProject.id);
    navigate("/projects");
  };

  return (
    <Box
      component="aside"
      width={collapsed ? COLLAPSED_WIDTH : width}
      flexShrink={0}
      display="flex"
      flexDirection="column"
      p={collapsed ? 1.25 : 2}
      height="100vh"
      position="sticky"
      top={0}
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative",
        transition: isResizing.current ? "none" : "width .18s ease",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} px={collapsed ? 0 : 0.5}>
        <Box display="flex" alignItems="center" gap={1.2} minWidth={0}>
          <Logo size={28} />
          {!collapsed && (
            <Typography noWrap fontWeight={700} fontSize={17} letterSpacing={-0.3} sx={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              CloudGuardian
            </Typography>
          )}
        </Box>
        {!collapsed && (
          <Box display="flex" alignItems="center" gap={0.25}>
            <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton size="small" onClick={toggleDarkMode} sx={{ color: "text.secondary" }}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Collapse sidebar">
              <IconButton size="small" onClick={() => setCollapsed(true)} sx={{ color: "text.secondary" }}>
                <PanelLeftClose size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      {collapsed && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.25} mb={1.5}>
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"} placement="right">
            <IconButton size="small" onClick={toggleDarkMode} sx={{ color: "text.secondary" }}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton size="small" onClick={() => setCollapsed(false)} sx={{ color: "text.secondary" }}>
              <PanelLeftOpen size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Divider sx={{ mb: 2 }} />

      <Box flex={1} overflow="auto">
        {!collapsed && (
          <Typography fontSize={11} fontWeight={600} color="text.secondary" letterSpacing={0.4} px={1.5} mb={0.75}>
            Main
          </Typography>
        )}
        <List disablePadding>
          {baseNav.map((item) => (
            <SidebarItem key={item.key} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
          ))}
          <SidebarItem to="/teams" icon={BriefcaseBusiness} label="Teams" collapsed={collapsed} />
        </List>

        {isAdminRole(user?.role) && (
          <>
            <Divider sx={{ my: 2 }} />
            {!collapsed && (
              <Typography fontSize={11} fontWeight={600} color="text.secondary" letterSpacing={0.4} px={1.5} mb={0.75}>
                Admin
              </Typography>
            )}
            <List disablePadding>
              <SidebarItem to="/admin/users" icon={Users} label="Registered Users" collapsed={collapsed} />
            </List>
          </>
        )}

        {projectId && (
          <>
            <Divider sx={{ my: 2 }} />
            {!collapsed && (
              <Box position="relative" display="flex" alignItems="center" justifyContent="space-between" px={1.5} mb={0.75}>
                <Typography noWrap fontSize={11} fontWeight={600} color="text.secondary" letterSpacing={0.4}>
                  {selectedProject?.name?.toUpperCase() || "PROJECT"}
                </Typography>
                <IconButton size="small" onClick={() => setProjectMenuOpen((v) => !v)} sx={{ color: "text.secondary", p: 0.25 }}>
                  <MoreHorizontal size={15} />
                </IconButton>

                {projectMenuOpen && (
                  <>
                    <Box onClick={() => setProjectMenuOpen(false)} sx={{ position: "fixed", inset: 0, zIndex: 1200 }} />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        mt: 0.5,
                        width: 180,
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
                        onClick={handleDeleteProject}
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
              </Box>
            )}
            <List disablePadding>
              <SidebarItem to={`/projects/${projectId}`} icon={FolderKanban} label="Overview" collapsed={collapsed} />
              <SidebarItem to={`/projects/${projectId}/docker-host`} icon={Server} label="Docker Host" collapsed={collapsed} />
            </List>

            {connected && (
              <>
                <Divider sx={{ my: 2 }} />
                {!collapsed && (
                  <Typography fontSize={11} fontWeight={600} color="text.secondary" letterSpacing={0.4} px={1.5} mb={0.75}>
                    Infrastructure
                  </Typography>
                )}
                <List disablePadding>
                  {dockerLinks.map((item) => (
                    <SidebarItem key={item.to} {...item} collapsed={collapsed} />
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ my: 1.5 }} />
      <List disablePadding sx={{ mb: 1 }}>
        <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" collapsed={collapsed} />
      </List>
      <UserMenu collapsed={collapsed} />

      {/* Drag handle — thin invisible strip on the right edge. Widens on
          hover so it's easy to grab without adding a visible border always. */}
      {!collapsed && (
        <Box
          onMouseDown={startResize}
          sx={{
            position: "absolute",
            top: 0,
            right: -3,
            width: 6,
            height: "100%",
            cursor: "col-resize",
            zIndex: 5,
            "&:hover": { bgcolor: "primary.main", opacity: 0.4 },
          }}
        />
      )}
    </Box>
  );
}