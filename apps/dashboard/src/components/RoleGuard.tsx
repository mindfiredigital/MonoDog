import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const userRole = session?.permission?.role || 'Denied';

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mb-6 max-w-md text-gray-600">
          You do not have the required permissions to view this page. Your
          current role is <strong>{userRole}</strong>, but this page requires
          one of: {allowedRoles.join(', ')}.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
