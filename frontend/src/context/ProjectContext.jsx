import { createContext, useCallback, useContext, useState } from "react";
import * as projectService from "../services/project.service";

// Provide a safe default context so components using the hook
// won't crash if the Provider is temporarily missing or during HMR.
const ProjectContext = createContext({
  projects: [],
  selectedProject: null,
  setSelectedProject: () => {},
  selectProjectById: async () => null,
  fetchProjects: async () => [],
  createProject: async () => null,
  deleteProject: async () => {},
  loading: false,
  error: null,
});

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // project.service.getProjects() already normalizes the response
      // into a plain array regardless of backend wrapping shape.
      const data = await projectService.getProjects();
      setProjects(data);
      return data;
    } catch (err) {
      console.error("[ProjectContext] Failed to fetch projects:", err);
      setError(err);
      setProjects([]); // guarantee it's always an array, never undefined/object
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (payload) => {
    const project = await projectService.createProject(payload);
    setProjects((prev) => [...prev, project]);
    return project;
  };

  const deleteProject = async (id) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));
    setSelectedProject((prev) => (String(prev?.id) === String(id) ? null : prev));
  };

  const selectProjectById = useCallback(
    async (id) => {
      if (!id) return;
      const cached = projects.find((p) => String(p.id) === String(id));
      if (cached && cached.team !== undefined) {
        setSelectedProject(cached);
        return cached;
      }
      try {
        const fetched = await projectService.getProject(id);
        setSelectedProject(fetched);
        return fetched;
      } catch (err) {
        console.error("[ProjectContext] Failed to fetch project", id, err);
        return null;
      }
    },
    [projects]
  );

  return (
    <ProjectContext.Provider
      value={{ projects, selectedProject, setSelectedProject, selectProjectById, fetchProjects, createProject, deleteProject, loading, error }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjectContext = () => useContext(ProjectContext);
