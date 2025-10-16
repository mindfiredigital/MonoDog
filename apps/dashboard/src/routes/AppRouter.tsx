import { Routes, Route } from 'react-router-dom';
import { routes } from './routes.config';
import {
  Dashboard,
  PackagesOverview,
  PackageDetail,
  DependencyGraph,
  HealthStatus,
  PublishControl,
  CIIntegration,
  ConfigInspector,
} from '../pages';

// Component mapping for dynamic routing
const componentMap = {
  Dashboard,
  PackagesOverview,
  PackageDetail,
  DependencyGraph,
  HealthStatus,
  PublishControl,
  CIIntegration,
  ConfigInspector,
} as const;

// Route component renderer
const RouteComponent = ({ componentName }: { componentName: string }) => {
  const Component = componentMap[componentName as keyof typeof componentMap];

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The requested page could not be found.
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
};

// Main AppRouter component
export default function AppRouter() {
  return (
    <Routes>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteComponent componentName={route.component} />}
        />
      ))}

      {/* Catch-all route for 404 */}
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
