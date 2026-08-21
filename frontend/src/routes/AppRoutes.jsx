import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Loader from "../components/common/Loader";

const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ProjectList = lazy(() => import("../pages/Projects/ProjectList"));
const CreateProject = lazy(() => import("../pages/Projects/CreateProject"));
const ProjectOverview = lazy(() => import("../pages/Projects/ProjectOverview"));
const ConnectDockerHost = lazy(() => import("../pages/DockerHost/ConnectDockerHost"));
const Containers = lazy(() => import("../pages/Containers/Containers"));
const Images = lazy(() => import("../pages/Images/Images"));
const Volumes = lazy(() => import("../pages/Volumes/Volumes"));
const Networks = lazy(() => import("../pages/Networks/Networks"));
const Swarm = lazy(() => import("../pages/Swarm/Swarm"));
const Services = lazy(() => import("../pages/Services/Services"));
const Stacks = lazy(() => import("../pages/Stacks/Stacks"));
const Experiments = lazy(() => import("../pages/Experiments/Experiments"));
const Teams = lazy(() => import("../pages/Teams/Teams"));
const Settings = lazy(() => import("../pages/Settings/Settings"));
const UserList = lazy(() => import("../pages/Admin/UserList"));
const UserDetail = lazy(() => import("../pages/Admin/UserDetail"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ---------- Public / auth routes ---------- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ---------- Protected app routes ----------
          Every route below requires a valid session AND renders inside
          the shared Sidebar/Topbar shell via DashboardLayout's <Outlet/>. */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<CreateProject />} />
        <Route path="/projects/:projectId" element={<ProjectOverview />} />
        <Route path="/projects/:projectId/docker-host" element={<ConnectDockerHost />} />

        {/* These pages internally gate on "is a Docker Host connected
            for this project?" via useDockerHost() — see each page file. */}
        <Route path="/projects/:projectId/containers" element={<Containers />} />
        <Route path="/projects/:projectId/images" element={<Images />} />
        <Route path="/projects/:projectId/volumes" element={<Volumes />} />
        <Route path="/projects/:projectId/networks" element={<Networks />} />
        <Route path="/projects/:projectId/swarm" element={<Swarm />} />
        <Route path="/projects/:projectId/services" element={<Services />} />
        <Route path="/projects/:projectId/stacks" element={<Stacks />} />
        <Route path="/projects/:projectId/experiments" element={<Experiments />} />

        <Route path="/teams" element={<Teams />} />
        <Route path="/settings" element={<Settings />} />

        {/* Admin-only — AdminRoute redirects non-admins to /dashboard */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <AdminRoute>
              <UserDetail />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
}