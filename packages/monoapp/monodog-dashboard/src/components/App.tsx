import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppRouter } from '../routes';
import { Layout } from '../pages';
import { AuthProvider } from '../services/auth-context';
import { PermissionProvider } from '../services/permission-context';
import LoginPage from '../pages/LoginPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import ProtectedRoute from './ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionProvider>
          <Routes>
            {/* Auth routes - no layout needed */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppRouter />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </PermissionProvider>
      </AuthProvider>
    </Router>
  );
}
