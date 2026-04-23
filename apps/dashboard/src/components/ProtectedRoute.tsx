import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';
import type { ProtectedRouteProps } from '../types/component.types';
import LoadingState from '../components/LoadingState';
/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
