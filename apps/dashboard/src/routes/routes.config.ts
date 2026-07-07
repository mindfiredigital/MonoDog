// Route configuration for the dashboard application
import type { RouteConfig } from '../types/routes.types';

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
  {
    path: '/publish',
    name: 'publish',
    component: 'PublishControl',
    title: 'Publish Control',
    description: 'Package publishing and versioning',
  },
  {
    path: '/release',
    name: 'release',
    component: 'ReleaseManager',
    title: 'Release Manager',
    description: 'Comprehensive release management with Changesets',
    protected: true,
    exact: true,
  },
  {
    path: '/release/scheduled',
    name: 'scheduled-releases',
    component: 'ScheduledReleasesPage',
    title: 'Scheduled Releases',
    description: 'View scheduled releases',
    protected: true,
  },
  {
    path: '/release/schedule/new',
    name: 'create-schedule',
    component: 'CreateSchedulePage',
    title: 'Schedule Release',
    description: 'Create a new scheduled release',
    protected: true,
  },
  {
    path: '/pipeline',
    name: 'pipeline',
    component: 'Pipeline',
    title: 'Release Pipeline',
    description: 'Real-time release pipeline monitoring and management',
    protected: true,
  },
  {
    path: '/config',
    name: 'config',
    component: 'ConfigInspector',
    title: 'Configuration',
    description: 'Configuration file inspector',
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: 'ChangelogPage',
    title: 'Changelog',
    description: 'View release changelogs for all packages',
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
