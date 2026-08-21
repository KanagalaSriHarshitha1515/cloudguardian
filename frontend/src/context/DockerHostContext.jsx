import { createContext, useCallback, useContext, useState } from "react";
import * as dockerService from "../services/docker.service";

const DockerHostContext = createContext(null);

// Keyed by projectId, since a Docker Host connection belongs to a
// specific project, not to the app globally. This is what enforces
// "you must connect a host before you see containers/images/etc."
export function DockerHostProvider({ children }) {
  const [hostsByProject, setHostsByProject] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchHostForProject = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const host = await dockerService.getHost(projectId);
      setHostsByProject((prev) => ({ ...prev, [projectId]: host }));
      return host;
    } finally {
      setLoading(false);
    }
  }, []);

  const connectHost = async (projectId, payload) => {
    const host = await dockerService.connectHost(projectId, payload);
    setHostsByProject((prev) => ({ ...prev, [projectId]: host }));
    return host;
  };

  const disconnectHost = async (projectId) => {
    await dockerService.disconnectHost(projectId);
    setHostsByProject((prev) => ({ ...prev, [projectId]: null }));
  };

  const isConnected = (projectId) => Boolean(hostsByProject[projectId]);
  const getHost = (projectId) => hostsByProject[projectId] || null;

  return (
    <DockerHostContext.Provider
      value={{ fetchHostForProject, connectHost, disconnectHost, isConnected, getHost, loading }}
    >
      {children}
    </DockerHostContext.Provider>
  );
}

export const useDockerHostContext = () => useContext(DockerHostContext);
