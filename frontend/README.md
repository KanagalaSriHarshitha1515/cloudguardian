# CloudGuardian Frontend

A project-centric Docker monitoring dashboard: log in → pick/create a project →
connect that project's Docker Host → manage its containers, images, volumes,
networks, swarm, services, and stacks. Sidebar navigation only expands to show
infrastructure pages once a Docker Host is actually connected for the
selected project — that gating is the core design decision of this app.

## Getting started

```bash
npm install
cp .env.example .env   # then point VITE_API_URL at your backend
npm run dev
```

Requires your backend running (default expected at `http://localhost:5000/api`
via `VITE_API_URL`).

## Architecture at a glance

```
main.jsx
  → BrowserRouter + ThemeProvider + AuthProvider + ProjectProvider + DockerHostProvider
  → App.jsx → AppRoutes.jsx
      → AuthLayout        (Login, Register)
      → DashboardLayout    (Sidebar + Topbar + <Outlet/>)
          → Dashboard, Projects, Containers, Images, Volumes,
            Networks, Swarm, Services, Stacks, Settings
```

- **`context/`** — global state. `AuthContext` (session/JWT), `ThemeContext`
  (light/dark), `ProjectContext` (project list + selected project),
  `DockerHostContext` (connection status **per project**, not globally).
- **`hooks/`** — thin wrappers around the contexts above (`useAuth`,
  `useProjects`, `useDockerHost`) so pages don't import context files directly.
- **`services/`** — the only files that call `axios`. `api.js` holds the
  shared instance (base URL + JWT header + 401 handling); the other
  `*.service.js` files are just typed wrappers around specific routes.
- **`components/docker/ResourceTable.jsx`** — one generic table shared by
  Containers/Images/Volumes/Services/Stacks, instead of five near-duplicate
  table implementations.

## The project-centric gate, concretely

`Sidebar.jsx` only renders the Infrastructure section when
`useDockerHost().connected` is true for whatever `:projectId` is in the URL.
Every resource page (`Containers.jsx`, `Images.jsx`, etc.) checks the same
flag and shows an `EmptyState` ("Connect a Docker Host first") instead of
calling the API if it's false. This mirrors reality: Docker resources don't
exist independent of a host connection.

## What you MUST adjust before this actually works

1. **API routes are placeholders.** Every path in `services/*.service.js`
   (e.g. `/projects/:id/docker-host`, `/projects/:id/containers`) is a
   reasonable REST guess, not your real Swagger routes. Update them to match.
2. **Response shapes are assumed.** e.g. `login()` expects `{ token, user }`
   back; containers are expected as an array of
   `{ id, name, status, cpu, mem }`. Adjust the service files and/or page
   columns to match your actual API responses.
3. **`connectHost` payload** (`{ name, url, port, username, password }`) is a
   guess at what your backend needs to actually reach a Docker Engine —
   likely needs TLS cert fields instead of/alongside a password depending on
   how you're authenticating to the daemon.

## Known simplifications (intentional, to keep scope sane)

- **Topbar page title** is a simple pathname lookup and won't show
  project-specific titles (e.g. "Payments Service — Containers"). Easy fix:
  add a small `useDocumentTitle`-style context, or have each page set it.
- **Search bar and notification bell** are visual only — no logic wired up.
- **Swarm/Services/Stacks** pages call the service layer but the exact
  request/response contract for `initSwarm`, `createService`,
  `deployStack` (compose file upload) is a best guess — deploying a stack
  in particular usually needs `FormData` for the compose file, not JSON.
