import { Routes, Route } from 'react-router-dom';
import {
  DashboardPage,
  PackagesPage,
  PackageDetailPage,
  DependenciesPage,
  HealthPage,
  PublishPage,
  ConfigPage,
  ScheduledReleasesPage,
  CreateSchedulePage,
} from '../pages';
import { RoleGuard } from '../components/RoleGuard';

// Alternative AppRouter using dedicated page components
export default function AppRouterPages() {
  const readOnlyRoles = ['Admin', 'Maintainer', 'Collaborator', 'Viewer'];
  const writeRoles = ['Admin', 'Maintainer', 'Collaborator'];
  const maintainerRoles = ['Admin', 'Maintainer'];
  const adminRoles = ['Admin'];

  return (
    <Routes>
      {/* Main Dashboard */}
      <Route
        path="/"
        element={
          <RoleGuard allowedRoles={readOnlyRoles}>
            <DashboardPage />
          </RoleGuard>
        }
      />

      {/* Packages */}
      <Route
        path="/packages"
        element={
          <RoleGuard allowedRoles={readOnlyRoles}>
            <PackagesPage />
          </RoleGuard>
        }
      />
      <Route
        path="/packages/:name"
        element={
          <RoleGuard allowedRoles={readOnlyRoles}>
            <PackageDetailPage />
          </RoleGuard>
        }
      />

      {/* Other Pages */}
      <Route
        path="/dependencies"
        element={
          <RoleGuard allowedRoles={readOnlyRoles}>
            <DependenciesPage />
          </RoleGuard>
        }
      />
      <Route
        path="/health"
        element={
          <RoleGuard allowedRoles={readOnlyRoles}>
            <HealthPage />
          </RoleGuard>
        }
      />
      <Route
        path="/release/scheduled"
        element={
          <RoleGuard allowedRoles={maintainerRoles}>
            <ScheduledReleasesPage />
          </RoleGuard>
        }
      />
      <Route
        path="/release/schedule/new"
        element={
          <RoleGuard allowedRoles={maintainerRoles}>
            <CreateSchedulePage />
          </RoleGuard>
        }
      />
      {/* <Route path="/publish" element={<RoleGuard allowedRoles={maintainerRoles}><PublishPage /></RoleGuard>} /> */}
      <Route
        path="/config"
        element={
          <RoleGuard allowedRoles={adminRoles}>
            <ConfigPage />
          </RoleGuard>
        }
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                404 - Page Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <a
                href="/"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Go back to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
