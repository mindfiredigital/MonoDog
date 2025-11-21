import { Routes, Route } from 'react-router-dom';
import {
  DashboardPage,
  PackagesPage,
  PackageDetailPage,
  DependenciesPage,
  HealthPage,
  PublishPage,
  CIPage,
  ConfigPage,
} from '../pages';

// Alternative AppRouter using dedicated page components
export default function AppRouterPages() {
  return (
    <Routes>
      {/* Main Dashboard */}
      <Route path="/" element={<DashboardPage />} />

      {/* Packages */}
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/packages/:name" element={<PackageDetailPage />} />

      {/* Other Pages */}
      <Route path="/dependencies" element={<DependenciesPage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/publish" element={<PublishPage />} />
      <Route path="/ci" element={<CIPage />} />
      <Route path="/config" element={<ConfigPage />} />

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
