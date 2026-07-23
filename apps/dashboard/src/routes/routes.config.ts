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
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/packages',
    name: 'packages',
    component: 'PackagesOverview',
    title: 'Packages',
    description: 'Package management and overview',
    exact: true,
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/packages/:name',
    name: 'package-detail',
    component: 'PackageDetail',
    title: 'Package Details',
    description: 'Detailed view of a specific package',
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/dependencies',
    name: 'dependencies',
    component: 'DependencyGraph',
    title: 'Dependencies',
    description: 'Dependency graph visualization',
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/health',
    name: 'health',
    component: 'HealthStatus',
    title: 'Health Status',
    description: 'Monorepo health monitoring',
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/publish',
    name: 'publish',
    component: 'PublishControl',
    title: 'Publish Control',
    description: 'Package publishing and versioning',
    allowedRoles: ['Admin', 'Maintainer'],
  },
  {
    path: '/release',
    name: 'release',
    component: 'ReleaseManager',
    title: 'Release Manager',
    description: 'Comprehensive release management with Changesets',
    protected: true,
    exact: true,
    allowedRoles: ['Admin', 'Maintainer'],
  },
  {
    path: '/release/scheduled',
    name: 'scheduled-releases',
    component: 'ScheduledReleasesPage',
    title: 'Scheduled Releases',
    description: 'View previously scheduled releases',
    protected: true,
    allowedRoles: ['Admin', 'Maintainer'],
  },
  {
    path: '/release/schedule/new',
    name: 'create-schedule',
    component: 'CreateSchedulePage',
    title: 'Schedule Release',
    description: 'Create a new scheduled release',
    protected: true,
    allowedRoles: ['Admin', 'Maintainer'],
  },
  {
    path: '/pipeline',
    name: 'pipeline',
    component: 'Pipeline',
    title: 'Pipeline Manager',
    description: 'Real-time monitoring of CI/CD pipelines',
    protected: true,
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
  },
  {
    path: '/config',
    name: 'config',
    component: 'ConfigInspector',
    title: 'Configuration Explorer',
    description: 'Inspect Monodog workspace configuration',
    allowedRoles: ['Admin'],
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: 'ChangelogPage',
    title: 'Changelog',
    description: 'View package changelogs and version history',
    allowedRoles: ['Admin', 'Maintainer', 'Collaborator', 'Viewer'],
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
