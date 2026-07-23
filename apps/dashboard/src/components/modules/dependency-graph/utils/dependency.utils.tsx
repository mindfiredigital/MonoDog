import {
  PackageNode,
  CircularDependency,
  GraphStats,
  DependentsMap,
} from '../types/dependency.types';
import { BuildingLibraryIcon } from '../../../../icons/heroicons';
import { RocketLaunchIcon } from '../../../../icons/heroicons';
import { CubeIcon } from '../../../../icons/heroicons';
import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'badge-success';
    case 'warning':
      return 'badge-warning';
    case 'error':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'app':
      return 'badge-info';
    case 'lib':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800';
    case 'tool':
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
    default:
      return 'badge-neutral';
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
    let aValue: string | number;
    let bValue: string | number;

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

// Standard dimensions for our PackageNode cards
const nodeWidth = 320;
const nodeHeight = 120;

export const getNodeLayout = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR'
) => {
  // React Flow + Dagre Layout Engine
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 150, ranksep: 200 });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
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
