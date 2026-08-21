import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import useProjects from "../hooks/useProjects";

// The one layout every protected page shares. Sidebar + Topbar never
// unmount between page navigations — only the <Outlet/> content swaps.
export default function DashboardLayout() {
  const { projectId } = useParams();
  const { projects, fetchProjects, selectProjectById } = useProjects();

  // Load the project list once, then keep ProjectContext's
  // selectedProject in sync with whatever :projectId is in the URL —
  // this is what lets Sidebar know which project's Docker Host status
  // to check, without every page having to do this itself.
  useEffect(() => {
    if (projects.length === 0) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (projectId) selectProjectById(projectId);
  }, [projectId, projects, selectProjectById]);

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      <Sidebar />
      <Box flex={1} minWidth={0}>
        <Topbar />
        <Box component="main" p={3} maxWidth={1200}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
