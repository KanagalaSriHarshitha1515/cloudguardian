import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { DockerHostProvider } from "./context/DockerHostContext";
import "./index.css";
import App from "./App";

// Provider order matters: Theme wraps everything so both auth and
// docker-host screens are themed; Project must sit above DockerHost
// since DockerHost context looks up the currently selected project.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <DockerHostProvider>
              <App />
            </DockerHostProvider>
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
