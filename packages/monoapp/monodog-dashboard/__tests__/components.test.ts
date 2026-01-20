/**
 * Tests for dashboard component utilities and structure.
 * These are basic unit tests that verify components can be imported and have expected structure.
 */

describe('Dashboard components exist', () => {
  test('ConfigurationTab can be imported', () => {
    // This verifies the file exists and can be imported
    expect(ConfigurationTab).toBeDefined();
    expect(typeof ConfigurationTab).toBe('function');
  });

  test('HealthStatus can be imported', () => {
    expect(HealthStatus).toBeDefined();
    expect(typeof HealthStatus).toBe('function');
  });

  test('PackagesOverview can be imported', () => {
    expect(PackagesOverview).toBeDefined();
    expect(typeof PackagesOverview).toBe('function');
  });

  test('PackageDetail can be imported', () => {
    expect(PackageDetail).toBeDefined();
    expect(typeof PackageDetail).toBe('function');
  });

  test('DependencyGraph can be imported', () => {
    expect(DependencyGraph).toBeDefined();
    expect(typeof DependencyGraph).toBe('function');
  });

  test('CIIntegration can be imported', () => {
    expect(CIIntegration).toBeDefined();
    expect(typeof CIIntegration).toBe('function');
  });

  test('ConfigInspector can be imported', () => {
    expect(ConfigInspector).toBeDefined();
    expect(typeof ConfigInspector).toBe('function');
  });

  test('PublishControl can be imported', () => {
    expect(PublishControl).toBeDefined();
    expect(typeof PublishControl).toBe('function');
  });
});

describe('Dashboard components are React components', () => {
  test('components are functions that can be called', () => {
    const components = [
      ConfigurationTab,
      HealthStatus,
      PackagesOverview,
      PackageDetail,
      DependencyGraph,
      CIIntegration,
      ConfigInspector,
      PublishControl,
    ];

    components.forEach((component: any) => {
      expect(component).toBeInstanceOf(Function);
    });
  });
});

import ConfigurationTab from '../src/components/modules/packages/components/ConfigurationTab';
import HealthStatus from '../src/components/modules/health-status/HealthStatus';
import PackagesOverview from '../src/components/modules/packages/PackagesOverview';
import PackageDetail from '../src/components/modules/packages/PackageDetail';
import DependencyGraph from '../src/components/modules/dependency-graph/DependencyGraph';
import CIIntegration from '../src/components/modules/ci-integration/CIIntegration';
import ConfigInspector from '../src/components/modules/config-inspector/ConfigInspector';
import PublishControl from '../src/components/publish-control/PublishControl';
