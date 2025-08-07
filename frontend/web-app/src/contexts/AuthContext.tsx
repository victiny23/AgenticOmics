import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

    // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setRole(storedRole);
    }
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const handleLoginStateChanged = (event: CustomEvent) => {
      if (event.detail.isLoggedIn) {
        setIsAuthenticated(true);
        setUsername(event.detail.username);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setUsername(null);
    };

    window.addEventListener('loginStateChanged', handleLoginStateChanged as EventListener);
    window.addEventListener('logout', handleLogout);

    return () => {
      window.removeEventListener('loginStateChanged', handleLoginStateChanged as EventListener);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const login = (token: string, username: string, role: string) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    window.dispatchEvent(new CustomEvent('logout'));
  };

  const value = {
    isAuthenticated,
    username,
    role,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 