import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';
import { usePermission } from '../services/permission-context';

export interface PermissionGuardProps {
  children: React.ReactNode;
  owner: string;
  repo: string;
  requiredPermission?: 'read' | 'write' | 'maintain' | 'admin';
}

/**
 * Permission Guard Component
 * Enforces repository-level permission checks
 */
export function PermissionGuard({
  children,
  owner,
  repo,
  requiredPermission = 'read',
}: PermissionGuardProps) {
  const { session, isLoading } = useAuth();
  const { checkPermission, isLoading: permLoading, error } = usePermission();
  const [permission, setPermission] = React.useState<any>(null);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!session?.sessionToken) {
      return;
    }

    const checkPerm = async () => {
      const result = await checkPermission(session.sessionToken, owner, repo);
      setPermission(result);
      setChecked(true);
    };

    checkPerm();
  }, [session?.sessionToken, owner, repo, checkPermission]);

  if (isLoading || !checked) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!permission || permission.denied) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this repository.</p>
          <p>
            Repository: <code>{owner}/{repo}</code>
          </p>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  // Check if user has required permission level
  const hasRequiredPermission = {
    read: permission.canRead,
    write: permission.canWrite,
    maintain: permission.canMaintain,
    admin: permission.canAdmin,
  }[requiredPermission] ?? false;

  if (!hasRequiredPermission) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <h2>Insufficient Permissions</h2>
          <p>
            This action requires <strong>{requiredPermission}</strong> permission.
          </p>
          <p>Your current role: <strong>{permission.role}</strong></p>
          <p>
            Repository: <code>{owner}/{repo}</code>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default PermissionGuard;
