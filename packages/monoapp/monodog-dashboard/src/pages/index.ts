// Export all page components for clean imports

// Direct component exports (for backward compatibility)
export { default as Dashboard } from '../components/main-dashboard/Dashboard';
export { default as PackagesOverview } from '../components/modules/packages/PackagesOverview';
export { default as PackageDetail } from '../components/modules/packages/PackageDetail';
export { default as DependencyGraph } from '../components/modules/dependency-graph/DependencyGraph';
export { default as HealthStatus } from '../components/modules/health-status/HealthStatus';
export { default as PublishControl } from '../components/publish-control/PublishControl';
export { default as CIIntegration } from '../components/modules/ci-integration/CIIntegration';
export { default as ConfigInspector } from '../components/modules/config-inspector/ConfigInspector';

// Page wrapper components (recommended approach)
export { default as DashboardPage } from './DashboardPage';
export { default as PackagesPage } from './PackagesPage';
export { default as PackageDetailPage } from './PackageDetailPage';
export { default as DependenciesPage } from './DependenciesPage';
export { default as HealthPage } from './HealthPage';
export { default as PublishPage } from './PublishPage';
export { default as CIPage } from './CIPage';
export { default as ConfigPage } from './ConfigPage';

// Layout component
export { default as Layout } from '../components/main-dashboard/Layout';
