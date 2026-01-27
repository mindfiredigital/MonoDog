import {
  PackageNode,
  CircularDependency,
  GraphStats,
} from '../types/dependency.types';
import { BuildingLibraryIcon } from '../../../../icons/heroicons';
import { RocketLaunchIcon } from '../../../../icons/heroicons';
import { CubeIcon } from '../../../../icons/heroicons';

// Get status color classes
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-100';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'error':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Get type color classes
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'app':
      return 'text-blue-600 bg-blue-100';
    case 'lib':
      return 'text-purple-600 bg-purple-100';
    case 'tool':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Get dependency status color for visualization
export const getDependencyStatusColor = (
  depName: string,
  packages: PackageNode[]
): string => {
  const dep = packages.find(pkg => pkg.name === depName);
  if (!dep) return 'text-gray-400';

  switch (dep.status) {
    case 'healthy':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

// Calculate graph statistics
export const calculateGraphStats = (packages: PackageNode[]): GraphStats => {
  const totalPackages = packages.length;
  const totalDependencies = packages.reduce(
    (sum, pkg) => sum + Object.keys(pkg.dependencies).length,
    0
  );

  // Find packages with no dependencies (leaf packages)
  const leafPackages = packages.filter(
    pkg => Object.keys(pkg.dependencies).length === 0
  ).length;

  // Find packages with no dependents (root packages)
  const rootPackages = packages.filter(
    pkg => pkg.dependents.length === 0
  ).length;

  // Calculate max depth and average dependencies
  const maxDepth = calculateMaxDepth(packages);
  const avgDependencies =
    totalPackages > 0 ? totalDependencies / totalPackages : 0;

  // Detect circular dependencies
  const cycles = detectCircularDependencies(packages);

  return {
    totalPackages,
    totalDependencies,
    circularDependencies: cycles.length,
    leafPackages,
    rootPackages,
    maxDepth,
    avgDependencies: Math.round(avgDependencies * 10) / 10,
  };
};

// Calculate maximum dependency depth
export const calculateMaxDepth = (packages: PackageNode[]): number => {
  const visited = new Set<string>();
  let maxDepth = 0;

  const dfs = (packageName: string, depth: number): number => {
    if (visited.has(packageName)) return depth;
    visited.add(packageName);

    const pkg = packages.find(p => p.name === packageName);
    if (!pkg) return depth;

    let currentMaxDepth = depth;
    for (const depId of Object.keys(pkg.dependencies)) {
      const depDepth = dfs(depId, depth + 1);
      currentMaxDepth = Math.max(currentMaxDepth, depDepth);
    }

    return currentMaxDepth;
  };

  for (const pkg of packages) {
    if (!visited.has(pkg.name)) {
      const depth = dfs(pkg.name, 0);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
};

// Detect circular dependencies
export const detectCircularDependencies = (
  packages: PackageNode[]
): CircularDependency[] => {
  const cycles: CircularDependency[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  const dfs = (packageName: string): boolean => {
    if (recursionStack.has(packageName)) {
      // Found a cycle
      const cycleStart = currentPath.indexOf(packageName);
      const cycle = currentPath.slice(cycleStart).concat(packageName);

      cycles.push({
        cycle,
        severity:
          cycle.length > 5 ? 'high' : cycle.length > 3 ? 'medium' : 'low',
        impact: `Circular dependency involving ${cycle.length} packages`,
      });
      return true;
    }

    if (visited.has(packageName)) return false;

    visited.add(packageName);
    recursionStack.add(packageName);
    currentPath.push(packageName);

    const pkg = packages.find(p => p.name === packageName);
    if (pkg) {
      for (const depId of Object.keys(pkg.dependencies)) {
        if (dfs(depId)) return true;
      }
    }

    recursionStack.delete(packageName);
    currentPath.pop();
    return false;
  };

  for (const pkg of packages) {
    if (!visited.has(pkg.name)) {
      dfs(pkg.name);
    }
  }

  return cycles;
};

// Sort packages by different criteria
export const sortPackages = (
  packages: PackageNode[],
  sortBy: 'name' | 'dependencies' | 'dependents' | 'status',
  order: 'asc' | 'desc'
): PackageNode[] => {
  return [...packages].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'dependencies':
        aValue = Object.keys(a.dependencies).length;
        bValue = Object.keys(b.dependencies).length;
        break;
      case 'dependents':
        aValue = a.dependents.length;
        bValue = b.dependents.length;
        break;
      case 'status': {
        const statusOrder = { error: 0, warning: 1, healthy: 2 };
        aValue = statusOrder[a.status] || 3;
        bValue = statusOrder[b.status] || 3;
        break;
      }
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Calculate layout positions for different algorithms
export const calculateLayout = (
  packages: PackageNode[],
  layout: 'hierarchical' | 'circular' | 'force',
  width: number = 800,
  height: number = 600
): PackageNode[] => {
  switch (layout) {
    case 'hierarchical':
      return calculateHierarchicalLayout(packages, width, height);
    case 'circular':
      return calculateCircularLayout(packages, width, height);
    case 'force':
      return calculateForceLayout(packages, width, height);
    default:
      return packages;
  }
};

// Hierarchical layout algorithm
const calculateHierarchicalLayout = (
  packages: PackageNode[],
  width: number,
  height: number
): PackageNode[] => {
  const layers: string[][] = [];
  const visited = new Set<string>();

  // Group packages by dependency level
  const assignLayers = (packageName: string, layer: number) => {
    if (visited.has(packageName)) return;
    visited.add(packageName);

    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(packageName);

    const pkg = packages.find(p => p.name === packageName);
    if (pkg) {
      pkg.dependents.forEach(depName => assignLayers(depName, layer + 1));
    }
  };
  // Start with packages that have no dependencies and build downwards with their dependents
  packages
    .filter(
      pkg =>
        Object.keys(pkg.dependencies).length === 0 && pkg.dependents.length > 0
    )
    .forEach(pkg => {
      assignLayers(pkg.name, 0);
    });
  if (layers.length === 0) {
    // In case there are no root packages with dependents, start with others
    packages
      .filter(
        pkg =>
          Object.keys(pkg.dependencies).length > 0 && pkg.dependents.length > 0
      )
      .forEach(pkg => {
        assignLayers(pkg.name, 0);
      });
  }

  // Position packages
  return packages.map(pkg => {
    const layer = layers.findIndex(l => l.includes(pkg.name));
    const positionInLayer = layers[layer]?.indexOf(pkg.name) || 0;
    const layerSize = layers[layer]?.length || 1;

    return {
      ...pkg,
      x: (width / (layers.length + 1)) * (layer + 1) - 50,
      y: (height / (layerSize + 1)) * (positionInLayer + 1) - 25,
    };
  });
};

// Circular layout algorithm
const calculateCircularLayout = (
  packages: PackageNode[],
  width: number,
  height: number
): PackageNode[] => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  return packages.map((pkg, index) => {
    const angle = (2 * Math.PI * index) / packages.length;
    return {
      ...pkg,
      x: centerX + radius * Math.cos(angle) - 50,
      y: centerY + radius * Math.sin(angle) - 25,
    };
  });
};

// Force-directed layout algorithm (simplified)
const calculateForceLayout = (
  packages: PackageNode[],
  width: number,
  height: number
): PackageNode[] => {
  // This is a simplified version - in a real implementation you'd use a proper force simulation
  const positioned = packages.map((pkg, index) => ({
    ...pkg,
    x: Math.random() * (width - 100),
    y: Math.random() * (height - 50),
  }));

  // Apply simple force-based positioning
  for (let iteration = 0; iteration < 50; iteration++) {
    positioned.forEach(pkg => {
      let forceX = 0;
      let forceY = 0;

      // Repulsion from other nodes
      positioned.forEach(other => {
        if (other.name !== pkg.name) {
          const dx = pkg.x - other.x;
          const dy = pkg.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);
          forceX += (dx / distance) * force;
          forceY += (dy / distance) * force;
        }
      });

      // Attraction to connected nodes
      Object.keys(pkg.dependencies).forEach(depId => {
        const dep = positioned.find(p => p.name === depId);
        if (dep) {
          const dx = dep.x - pkg.x;
          const dy = dep.y - pkg.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance * 0.01;
          forceX += (dx / distance) * force;
          forceY += (dy / distance) * force;
        }
      });

      // Apply forces with damping
      pkg.x += forceX * 0.1;
      pkg.y += forceY * 0.1;

      // Keep within bounds
      pkg.x = Math.max(50, Math.min(width - 100, pkg.x));
      pkg.y = Math.max(25, Math.min(height - 50, pkg.y));
    });
  }

  return positioned;
};

// Get package type icon
export const getPackageTypeIcon = (type: string): React.ReactNode => {
  switch (type) {
    case 'app':
      return <RocketLaunchIcon className="w-6 h-6 text-primary-600" />;
    case 'lib':
      return <BuildingLibraryIcon className="w-6 h-6 text-primary-600" />;
    case 'tool':
      return '🔧';
    default:
      return <CubeIcon className="w-6 h-6 text-primary-600" />;
  }
};

// Format package name for display
export const formatPackageName = (name: string): string => {
  return name.length > 12 ? `${name.substring(0, 12)}...` : name;
};

// --- DATA TRANSFORMATION UTILITY ---

/**
 * Type definition for the final output map.
 * Key: Dependency Name (e.g., 'react', '@monodog/backend')
 * Value: Array of Package Names that depend on the key (e.g., ['@monodog/dashboard'])
 */
type DependentsMap = Record<string, string[]>;

/**
 * Calculates and returns a map of all packages that depend on every other package
 * and third-party library in the monorepo.
 * * @param packages The array of packages, where dependency lists are already parsed into string arrays.
 * @returns A map where keys are dependencies and values are arrays of dependents.
 */
export const mapAllDependents = (packages: PackageNode[]): DependentsMap => {
  // Use a Record to build the map efficiently.
  const allDependentsMap: DependentsMap = {};

  // 1. First, ensure every package itself is registered as a dependency, even if nothing
  // currently depends on it (it will start with an empty array).
  packages.forEach(pkg => {
    allDependentsMap[pkg.name] = [];
  });

  // 2. Iterate through every package to find out what depends on them.
  packages.forEach(dependentPkg => {
    const dependentName = dependentPkg.name;

    // Combine runtime and dev dependencies into a single set for efficient iteration
    const allDependencies = [
      ...Object.keys(dependentPkg.dependencies ?? {}),
      ...Object.keys(dependentPkg.devDependencies ?? {}),
      ...Object.keys(dependentPkg.peerDependencies ?? {}),
    ];

    allDependencies.forEach(dependencyName => {
      // Initialize the array for the dependency if it doesn't exist yet (for external libraries)
      if (!allDependentsMap[dependencyName]) {
        allDependentsMap[dependencyName] = [];
      }

      // Add the current package (the dependent) to the dependency's list
      // Check to prevent duplicates, although it's rare in this context
      if (!allDependentsMap[dependencyName].includes(dependentName)) {
        allDependentsMap[dependencyName].push(dependentName);
      }
    });
  });

  return allDependentsMap;
};
