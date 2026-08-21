import axios from "axios";
import { API_BASE_URL, TOKEN_KEY, USER_KEY } from "../utils/constants";

// Single Axios instance used by every *.service.js file — this is the
// "Frontend -> Axios -> Backend API" step from the architecture diagram.
const api = axios.create({ baseURL: API_BASE_URL });

// Attach the JWT to every outgoing request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the backend ever says the token is invalid/expired, clear the
// session and bounce to login instead of leaving the UI in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
