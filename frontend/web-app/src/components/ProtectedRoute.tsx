import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActive?: boolean; // default true; when false, allow deactivated users
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireActive = true }) => {
  const { isAuthenticated, isActive, checkUserStatus } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated) {
        await checkUserStatus();
      }
      setIsChecking(false);
    };
    checkStatus();
  }, [isAuthenticated, checkUserStatus]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireActive && !isActive) {
    return <Navigate to="/restricted" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 