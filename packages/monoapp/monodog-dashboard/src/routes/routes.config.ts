// Route configuration for the dashboard application
export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  title: string;
  description?: string;
  protected?: boolean;
  exact?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'dashboard',
    component: 'Dashboard',
    title: 'Dashboard',
    description: 'Main dashboard overview',
    exact: true,
  },
  {
    path: '/packages',
    name: 'packages',
    component: 'PackagesOverview',
    title: 'Packages',
    description: 'Package management and overview',
    exact: true,
  },
  {
    path: '/packages/:name',
    name: 'package-detail',
    component: 'PackageDetail',
    title: 'Package Details',
    description: 'Detailed view of a specific package',
  },
  {
    path: '/dependencies',
    name: 'dependencies',
    component: 'DependencyGraph',
    title: 'Dependencies',
    description: 'Dependency graph visualization',
  },
  {
    path: '/health',
    name: 'health',
    component: 'HealthStatus',
    title: 'Health Status',
    description: 'Monorepo health monitoring',
  },
  // {
  //   path: '/publish',
  //   name: 'publish',
  //   component: 'PublishControl',
  //   title: 'Publish Control',
  //   description: 'Package publishing and versioning',
  // },
  // {
  //   path: '/ci',
  //   name: 'ci',
  //   component: 'CIIntegration',
  //   title: 'CI/CD',
  //   description: 'Continuous integration and deployment',
  // },
  {
    path: '/config',
    name: 'config',
    component: 'ConfigInspector',
    title: 'Configuration',
    description: 'Configuration file inspector',
  },
];

// Navigation items for sidebar (subset of routes)
export const navigationRoutes = routes.filter(
  route => !route.path.includes(':') && route.path !== '/'
);

// Get route by name
export const getRouteByName = (name: string): RouteConfig | undefined => {
  return routes.find(route => route.name === name);
};

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};
