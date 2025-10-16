import {
  PackageNode,
  CircularDependency,
  GraphStats,
} from '../types/dependency.types';

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
  depId: string,
  packages: PackageNode[]
): string => {
  const dep = packages.find(pkg => pkg.id === depId);
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
    (sum, pkg) => sum + pkg.dependencies.length,
    0
  );

  // Find packages with no dependencies (leaf packages)
  const leafPackages = packages.filter(
    pkg => pkg.dependencies.length === 0
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

  const dfs = (packageId: string, depth: number): number => {
    if (visited.has(packageId)) return depth;
    visited.add(packageId);

    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return depth;

    let currentMaxDepth = depth;
    for (const depId of pkg.dependencies) {
      const depDepth = dfs(depId, depth + 1);
      currentMaxDepth = Math.max(currentMaxDepth, depDepth);
    }

    return currentMaxDepth;
  };

  for (const pkg of packages) {
    if (!visited.has(pkg.id)) {
      const depth = dfs(pkg.id, 0);
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

  const dfs = (packageId: string): boolean => {
    if (recursionStack.has(packageId)) {
      // Found a cycle
      const cycleStart = currentPath.indexOf(packageId);
      const cycle = currentPath.slice(cycleStart).concat(packageId);

      cycles.push({
        cycle,
        severity:
          cycle.length > 5 ? 'high' : cycle.length > 3 ? 'medium' : 'low',
        impact: `Circular dependency involving ${cycle.length} packages`,
      });
      return true;
    }

    if (visited.has(packageId)) return false;

    visited.add(packageId);
    recursionStack.add(packageId);
    currentPath.push(packageId);

    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      for (const depId of pkg.dependencies) {
        if (dfs(depId)) return true;
      }
    }

    recursionStack.delete(packageId);
    currentPath.pop();
    return false;
  };

  for (const pkg of packages) {
    if (!visited.has(pkg.id)) {
      dfs(pkg.id);
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
        aValue = a.dependencies.length;
        bValue = b.dependencies.length;
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
  const assignLayers = (packageId: string, layer: number) => {
    if (visited.has(packageId)) return;
    visited.add(packageId);

    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(packageId);

    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      pkg.dependents.forEach(depId => assignLayers(depId, layer + 1));
    }
  };

  // Start with packages that have no dependencies
  packages
    .filter(pkg => pkg.dependencies.length === 0)
    .forEach(pkg => {
      assignLayers(pkg.id, 0);
    });

  // Position packages
  return packages.map(pkg => {
    const layer = layers.findIndex(l => l.includes(pkg.id));
    const positionInLayer = layers[layer]?.indexOf(pkg.id) || 0;
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
        if (other.id !== pkg.id) {
          const dx = pkg.x - other.x;
          const dy = pkg.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (distance * distance);
          forceX += (dx / distance) * force;
          forceY += (dy / distance) * force;
        }
      });

      // Attraction to connected nodes
      pkg.dependencies.forEach(depId => {
        const dep = positioned.find(p => p.id === depId);
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
export const getPackageTypeIcon = (type: string): string => {
  switch (type) {
    case 'app':
      return '🚀';
    case 'lib':
      return '📚';
    case 'tool':
      return '🔧';
    default:
      return '📦';
  }
};

// Format package name for display
export const formatPackageName = (name: string): string => {
  return name.length > 12 ? `${name.substring(0, 12)}...` : name;
};
