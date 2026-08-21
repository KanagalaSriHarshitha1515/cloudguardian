import { useEffect } from "react";
import { useProjectContext } from "../context/ProjectContext";
import { useDockerHostContext } from "../context/DockerHostContext";

// Combines ProjectContext + DockerHostContext so components only need
// one hook: "is the CURRENTLY SELECTED project's host connected?"
// Auto-fetches connection status whenever the selected project changes.
export default function useDockerHost() {
  const { selectedProject } = useProjectContext();
  const { fetchHostForProject, connectHost, disconnectHost, isConnected, getHost, loading } = useDockerHostContext();

  useEffect(() => {
    if (selectedProject?.id) fetchHostForProject(selectedProject.id);
  }, [selectedProject?.id, fetchHostForProject]);

  const projectId = selectedProject?.id;

  return {
    connected: projectId ? isConnected(projectId) : false,
    host: projectId ? getHost(projectId) : null,
    loading,
    connectHost: (payload) => connectHost(projectId, payload),
    disconnectHost: () => disconnectHost(projectId),
  };
}
