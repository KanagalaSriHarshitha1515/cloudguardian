import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth.service";
import { TOKEN_KEY, USER_KEY } from "../utils/constants";

const AuthContext = createContext(null);

const readStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!token || !storedUser) return null;
  try {
    return { token, user: JSON.parse(storedUser) };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readStoredSession();
    if (session) setUser(session.user);
    setLoading(false);
  }, []);

  const persistSession = ({ token, user: sessionUser }, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const login = async (email, password, remember = false) => {
    const data = await authService.login(email, password);
    persistSession(data, remember);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data, true);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
