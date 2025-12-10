/**
 * Tests for dashboard component utilities and structure.
 * These are basic unit tests that verify components can be imported and have expected structure.
 */

describe('Dashboard components exist', () => {
  test('ConfigurationTab can be imported', () => {
    // This verifies the file exists and can be imported
    const ConfigurationTab = require('../src/components/modules/packages/components/ConfigurationTab').default;
    expect(ConfigurationTab).toBeDefined();
    expect(typeof ConfigurationTab).toBe('function');
  });

  test('HealthStatus can be imported', () => {
    const HealthStatus = require('../src/components/modules/health-status/HealthStatus').default;
    expect(HealthStatus).toBeDefined();
    expect(typeof HealthStatus).toBe('function');
  });

  test('PackagesOverview can be imported', () => {
    const PackagesOverview = require('../src/components/modules/packages/PackagesOverview').default;
    expect(PackagesOverview).toBeDefined();
    expect(typeof PackagesOverview).toBe('function');
  });

  test('PackageDetail can be imported', () => {
    const PackageDetail = require('../src/components/modules/packages/PackageDetail').default;
    expect(PackageDetail).toBeDefined();
    expect(typeof PackageDetail).toBe('function');
  });

  test('DependencyGraph can be imported', () => {
    const DependencyGraph = require('../src/components/modules/dependency-graph/DependencyGraph').default;
    expect(DependencyGraph).toBeDefined();
    expect(typeof DependencyGraph).toBe('function');
  });

  test('CIIntegration can be imported', () => {
    const CIIntegration = require('../src/components/modules/ci-integration/CIIntegration').default;
    expect(CIIntegration).toBeDefined();
    expect(typeof CIIntegration).toBe('function');
  });

  test('ConfigInspector can be imported', () => {
    const ConfigInspector = require('../src/components/modules/config-inspector/ConfigInspector').default;
    expect(ConfigInspector).toBeDefined();
    expect(typeof ConfigInspector).toBe('function');
  });

  test('PublishControl can be imported', () => {
    const PublishControl = require('../src/components/publish-control/PublishControl').default;
    expect(PublishControl).toBeDefined();
    expect(typeof PublishControl).toBe('function');
  });
});

describe('Dashboard components are React components', () => {
  test('components are functions that can be called', () => {
    const components = [
      require('../src/components/modules/packages/components/ConfigurationTab').default,
      require('../src/components/modules/health-status/HealthStatus').default,
      require('../src/components/modules/packages/PackagesOverview').default,
      require('../src/components/modules/packages/PackageDetail').default,
      require('../src/components/modules/dependency-graph/DependencyGraph').default,
      require('../src/components/modules/ci-integration/CIIntegration').default,
      require('../src/components/modules/config-inspector/ConfigInspector').default,
      require('../src/components/publish-control/PublishControl').default,
    ];

    components.forEach(component => {
      expect(component).toBeInstanceOf(Function);
    });
  });
});
