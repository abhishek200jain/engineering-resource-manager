import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

type Role = "engineer" | "manager";

interface User {
  id: string;
  _id?: string; // Backend might return _id instead of id
  name: string;
  email: string;
  role: Role;
  // Engineer fields (optional)
  skills?: string[];
  seniority?: string;
  maxCapacity?: number;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(!!token);

  const navigate = useNavigate();

  const login = (token: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setToken(token);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const fetchUser = async () => {
    try {
      const data = await getProfile();
      // Map the backend's _id to both id and _id fields
      setUser({
        ...data,
        id: data._id || data.id, // Use _id if available, fallback to id
        _id: data._id || data.id, // Store original _id as well
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}; 