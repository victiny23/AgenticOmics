import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
  isActive: boolean;
  login: (token: string, username: string, role: string, isActive?: boolean) => void;
  logout: () => void;
  checkUserStatus: () => Promise<boolean>;
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
  const [isActive, setIsActive] = useState<boolean>(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedIsActive = localStorage.getItem('isActive');

    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setRole(storedRole);
      setIsActive(storedIsActive !== 'false');
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

  const login = (token: string, username: string, role: string, isActive: boolean = true) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    localStorage.setItem('isActive', isActive.toString());
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
    setIsActive(isActive);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('isActive');
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setIsActive(true);
    window.dispatchEvent(new CustomEvent('logout'));
  };

  const checkUserStatus = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('jwtToken');
      const currentUsername = localStorage.getItem('username');
      
      if (!token || !currentUsername) {
        return false;
      }

      const response = await fetch(`http://localhost:12001/api/auth/admin/users/status/${currentUsername}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Username': currentUsername
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userIsActive = data.isActive;
        setIsActive(userIsActive);
        localStorage.setItem('isActive', userIsActive.toString());
        return userIsActive;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user status:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    username,
    role,
    isActive,
    login,
    logout,
    checkUserStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 