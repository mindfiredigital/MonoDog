import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import PackagesList from './pages/PackagesList.tsx';
import DependencyGraph from './pages/DependencyGraph.tsx';
import RoleManagement from './pages/RoleManagement.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/packages',
    element: <PackagesList />,
  },
  {
    path: '/dependency-graph',
    element: <DependencyGraph />,
  },
  { path: '/roles', element: <RoleManagement /> },
]);

const App = () => {
  const renderPage = () => {
    return <RouterProvider router={router} />;
  };

  return (
    <div>
      <main>{renderPage()}</main>
    </div>
  );
};

export default App;
