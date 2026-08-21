import api from "./api";

// NOTE: these paths (/auth/login, /auth/register) are the common REST
// convention — swap them for your actual Swagger routes if different.

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // expected shape: { token, user }
}

export async function register({ name, email, password, confirmPassword }) {
  const { data } = await api.post("/auth/register", { name, email, password, confirmPassword });
  return data; // expected shape: { token, user }
}
