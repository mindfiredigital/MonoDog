import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';
import type { ProtectedRouteProps } from '../types/component.types';
import { CardGridSkeleton } from './skeletons';
/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-6">
        <CardGridSkeleton cards={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
