import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { json } from 'body-parser';
import {
  scanner,
  quickScan,
  generateReports,
  funCheckBuildStatus,
  funCheckTestCoverage,
  funCheckLintStatus,
  funCheckSecurityAudit,
} from '../monorepo-scanner';
import { ciStatusManager, getMonorepoCIStatus } from '../ci-status';
import {
  scanMonorepo,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  calculatePackageHealth,
} from '../../libs/utils/helpers';
import { PrismaClient } from '@prisma/client';
// Import the validateConfig function from your utils
import { validateConfig } from '../../apps/dashboard/src/components/modules/config-inspector/utils/config.utils';
import { GitService } from './gitService';

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'error';
  description: string;
}

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(json());

// Health check
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
    services: {
      scanner: 'active',
      ci: 'active',
      database: 'active',
    },
  });
});

// Get all packages from database (DONE)
app.get('/api/packages', async (req, res) => {
  try {
    // Try to get packages from database first
    const dbPackages = await prisma.package.findMany();

    const transformedPackages = dbPackages.map(pkg => {
      // We create a new object 'transformedPkg' based on the database record 'pkg'
      const transformedPkg = { ...pkg };

      // --- APPLY PARSING TO EACH FIELD ---

      // 1. Maintainers (Your Logic)
      transformedPkg.maintainers = pkg.maintainers
        ? JSON.parse(pkg.maintainers)
        : [];

      // 2. Tags
      // transformedPkg.tags = pkg.tags
      //     ? JSON.parse(pkg.tags)
      //     : [];

      // 3. Scripts (should default to an object, not an array)
      transformedPkg.scripts = pkg.scripts ? JSON.parse(pkg.scripts) : {};

      // 4. Dependencies List
      transformedPkg.dependenciesList = pkg.dependenciesList
        ? JSON.parse(pkg.dependenciesList)
        : [];

      // ... and so on for all serialized fields
      return transformedPkg; // Return the fully transformed object
    });
    res.json(transformedPackages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packagesss' });
  }
});

// Get package details
app.get('/api/packages/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const packageInfo = await prisma.package.findUnique({
      where: {
        name: name,
      },
    });
    console.log('packageInfo -->', packageInfo);
    if (!packageInfo) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Get additional package information
    const reports = await generateReports();
    const packageReport = reports.find(r => r.package.name === name);

    const result = {
      ...packageInfo,
      report: packageReport,
      ciStatus: await ciStatusManager.getPackageStatus(name),
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package details' });
  }
});

app.get('/api/commits/:packagePath', async (req, res) => {
  try {
    const { packagePath } = req.params;

    // Decode the package path
    const decodedPath = decodeURIComponent(packagePath);

    console.log('🔍 Fetching commits for path:', decodedPath);
    console.log('📁 Current working directory:', process.cwd());

    const gitService = new GitService();

    // Check if this is an absolute path and convert to relative if needed
    let relativePath = decodedPath;
    const projectRoot = process.cwd();

    // If it's an absolute path, make it relative to project root
    if (path.isAbsolute(decodedPath)) {
      relativePath = path.relative(projectRoot, decodedPath);
      console.log('🔄 Converted absolute path to relative:', relativePath);
    }

    // Check if the path exists
    try {
      await fs.promises.access(relativePath);
      console.log('✅ Path exists:', relativePath);
    } catch (fsError) {
      console.log('❌ Path does not exist:', relativePath);
      // Try the original path as well
      try {
        await fs.promises.access(decodedPath);
        console.log('✅ Original path exists:', decodedPath);
        relativePath = decodedPath; // Use original path if it exists
      } catch (secondError) {
        return res.status(404).json({
          error: `Package path not found: ${relativePath} (also tried: ${decodedPath})`,
        });
      }
    }

    const commits = await gitService.getAllCommits(relativePath);

    console.log(
      `✅ Successfully fetched ${commits.length} commits for ${relativePath}`
    );
    res.json(commits);
  } catch (error: any) {
    console.error('💥 Error fetching commit details:', error);
    res.status(500).json({
      error: 'Failed to fetch commit details',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Get dependency graph
app.get('/api/graph', async (req, res) => {
  try {
    const packages = scanMonorepo(process.cwd());
    const graph = generateDependencyGraph(packages);
    const circularDeps = findCircularDependencies(packages);

    res.json({
      ...graph,
      circularDependencies: circularDeps,
      metadata: {
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        circularDependencies: circularDeps.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate dependency graph' });
  }
});

// Get monorepo statistics
app.get('/api/stats', async (req, res) => {
  try {
    const packages = scanMonorepo(process.cwd());
    const stats = generateMonorepoStats(packages);

    res.json({
      ...stats,
      timestamp: Date.now(),
      scanDuration: 0, // Would be calculated from actual scan
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get CI status for all packages
app.get('/api/ci/status', async (req, res) => {
  try {
    const packages = scanMonorepo(process.cwd());
    const ciStatus = await getMonorepoCIStatus(packages);
    res.json(ciStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CI status' });
  }
});

// Get CI status for specific package
app.get('/api/ci/packages/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const status = await ciStatusManager.getPackageStatus(name);

    if (!status) {
      return res.status(404).json({ error: 'Package CI status not found' });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package CI status' });
  }
});

// Trigger CI build for package
app.post('/api/ci/trigger', async (req, res) => {
  try {
    const { packageName, providerName, branch } = req.body;

    if (!packageName) {
      return res.status(400).json({ error: 'Package name is required' });
    }

    const result = await ciStatusManager.triggerBuild(
      packageName,
      providerName || 'github',
      branch || 'main'
    );

    if (result.success) {
      res.json({
        success: true,
        buildId: result.buildId,
        message: `Build triggered for ${packageName}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger build' });
  }
});

// Get build logs
app.get('/api/ci/builds/:buildId/logs', async (req, res) => {
  try {
    const { buildId } = req.params;
    const { provider } = req.query;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const logs = await ciStatusManager.getBuildLogs(
      buildId,
      provider as string
    );
    res.json({ buildId, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch build logs' });
  }
});

// Get build artifacts
app.get('/api/ci/builds/:buildId/artifacts', async (req, res) => {
  try {
    const { buildId } = req.params;
    const { provider } = req.query;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const artifacts = await ciStatusManager.getBuildArtifacts(
      buildId,
      provider as string
    );
    res.json({ buildId, artifacts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch build artifacts' });
  }
});

// Perform full monorepo scan
app.post('/api/scan', async (req, res) => {
  try {
    const { force } = req.body;

    if (force) {
      scanner.clearCache();
    }

    const result = await quickScan();
    res.json({
      success: true,
      message: 'Scan completed successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to perform scan',
    });
  }
});

// Get scan results
app.get('/api/scan/results', async (req, res) => {
  try {
    const result = await quickScan();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan results' });
  }
});

// Export scan results
app.get('/api/scan/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { filename } = req.query;

    if (!['json', 'csv', 'html'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format' });
    }

    const result = await quickScan();
    const exportData = scanner.exportResults(
      result,
      format as 'json' | 'csv' | 'html'
    );

    if (format === 'json') {
      res.json(result);
    } else {
      const contentType = format === 'csv' ? 'text/csv' : 'text/html';
      const contentDisposition = filename
        ? `attachment; filename="${filename}"`
        : `attachment; filename="monorepo-scan.${format}"`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);
      res.send(exportData);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export scan results' });
  }
});

// ---------- HEALTH --------------------
// Get package health metrics
app.get('/api/health/packages/:name', async (req, res) => {
  try {
    console.log('req.params -->', req.params);
    const { name } = req.params;
    const packages = scanMonorepo(process.cwd());
    const packageInfo = packages.find(p => p.name === name);

    if (!packageInfo) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Get health metrics (mock data for now)
    const health = {
      buildStatus: 'success',
      testCoverage: Math.floor(Math.random() * 100),
      lintStatus: 'pass',
      securityAudit: 'pass',
      overallScore: Math.floor(Math.random() * 40) + 60,
      lastUpdated: new Date(),
    };

    res.json({
      packageName: name,
      health,
      size: {
        size: Math.floor(Math.random() * 1024 * 1024), // Random size
        files: Math.floor(Math.random() * 1000),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});

// Get all package health metrics
// app.get('/api/health/packages', async (req, res) => {
//   try {
//     // Try to get health data from database
//     const healthData = await prisma.healthStatus.findMany();
//     console.log('healthData -->', healthData);
//     // Transform the data to match the expected frontend format
//     const transformedHealthData = healthData.map(health => {
//       const transformedHealth = { ...health };

//       // Parse any JSON fields that were stored as strings
//       if (health.metrics) {
//         transformedHealth.metrics = JSON.parse(health.metrics);
//       } else {
//         transformedHealth.metrics = [];
//       }

//       if (health.packageHealth) {
//         transformedHealth.packageHealth = JSON.parse(health.packageHealth);
//       } else {
//         transformedHealth.packageHealth = [];
//       }

//       // Ensure we have all required fields with defaults
//       return {
//         id: transformedHealth.id,
//         overallScore: transformedHealth.overallScore || 0,
//         metrics: transformedHealth.metrics || [],
//         packageHealth: transformedHealth.packageHealth || [],
//         createdAt: transformedHealth.createdAt,
//         updatedAt: transformedHealth.updatedAt,
//       };
//     });

//     // Return the latest health data (you might want to sort by createdAt desc)
//     const latestHealthData = transformedHealthData.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     )[0] || {
//       overallScore: 0,
//       metrics: [],
//       packageHealth: [],
//     };

//     res.json(latestHealthData);
//   } catch (error) {
//     console.error('Error fetching health data:', error);
//     res.status(500).json({ error: 'Failed to fetch health data' });
//   }
// });

app.get('/api/health/packages', async (req, res) => {
  try {
    // Fetch all package health data from database
    const packageHealthData = await prisma.packageHealth.findMany();
    console.log('packageHealthData -->', packageHealthData.length);

    // Transform the data to match the expected frontend format
    const packages = packageHealthData.map(pkg => {
      const health = {
        buildStatus: pkg.packageBuildStatus,
        testCoverage: pkg.packageTestCoverage,
        lintStatus: pkg.packageLintStatus,
        securityAudit: pkg.packageSecurity,
        overallScore: pkg.packageOverallScore,
      };

      return {
        packageName: pkg.packageName,
        health: health,
        isHealthy: pkg.packageOverallScore >= 80,
      };
    });

    // Calculate summary statistics
    const total = packages.length;
    const healthy = packages.filter(pkg => pkg.isHealthy).length;
    const unhealthy = packages.filter(pkg => !pkg.isHealthy).length;
    const averageScore =
      packages.length > 0
        ? packages.reduce((sum, pkg) => sum + pkg.health.overallScore, 0) /
          packages.length
        : 0;

    const response = {
      packages: packages,
      summary: {
        total: total,
        healthy: healthy,
        unhealthy: unhealthy,
        averageScore: averageScore,
      },
    };

    console.log('Transformed health data -->', response.summary);
    res.json(response);
  } catch (error) {
    console.error('Error fetching health data from database:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch health data from database' });
  }
});

app.get('/api/health/refresh', async (req, res) => {
  try {
    const rootDir = path.resolve(__dirname, '../../');
    const packages = scanMonorepo(rootDir);
    console.log('packages -->', packages.length);
    const healthMetrics = await Promise.all(
      packages.map(async pkg => {
        try {
          // Await each health check function since they return promises
          const buildStatus = await funCheckBuildStatus(pkg);
          const testCoverage = await funCheckTestCoverage(pkg);
          const lintStatus = await funCheckLintStatus(pkg);
          const securityAudit = await funCheckSecurityAudit(pkg);
          // Calculate overall health score
          const overallScore = calculatePackageHealth(
            buildStatus,
            testCoverage,
            lintStatus,
            securityAudit
          );

          const health = {
            buildStatus: buildStatus,
            testCoverage: testCoverage,
            lintStatus: lintStatus,
            securityAudit: securityAudit,
            overallScore: overallScore.overallScore,
          };

          console.log(pkg.name, '-->', health);

          // FIX: Use upsert to handle existing packages and proper Prisma syntax
          await prisma.packageHealth.upsert({
            where: {
              packageName: pkg.name,
            },
            update: {
              packageOverallScore: overallScore.overallScore,
              packageBuildStatus: buildStatus,
              packageTestCoverage: testCoverage,
              packageLintStatus: lintStatus,
              packageSecurity: securityAudit,
              packageDependencies: '',
              updatedAt: new Date(),
            },
            create: {
              packageName: pkg.name,
              packageOverallScore: overallScore.overallScore,
              packageBuildStatus: buildStatus,
              packageTestCoverage: testCoverage,
              packageLintStatus: lintStatus,
              packageSecurity: securityAudit,
              packageDependencies: '',
            },
          });

          return {
            packageName: pkg.name,
            health,
            isHealthy: health.overallScore >= 80,
          };
        } catch (error) {
          return {
            packageName: pkg.name,
            health: null,
            isHealthy: false,
            error: 'Failed to fetch health metrics',
          };
        }
      })
    );
    res.json({
      packages: healthMetrics,
      summary: {
        total: packages.length,
        healthy: healthMetrics.filter(h => h.isHealthy).length,
        unhealthy: healthMetrics.filter(h => !h.isHealthy).length,
        averageScore:
          healthMetrics
            .filter(h => h.health)
            .reduce((sum, h) => sum + h.health!.overallScore, 0) /
          healthMetrics.filter(h => h.health).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});
function calculateHealthStatus(
  healthy: number,
  total: number
): 'healthy' | 'warning' | 'error' {
  if (total === 0) return 'healthy';
  const ratio = healthy / total;
  if (ratio >= 0.8) return 'healthy';
  if (ratio >= 0.6) return 'warning';
  return 'error';
}
// Search packages
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, type, status } = req.query;
    const packages = scanMonorepo(process.cwd());

    let filtered = packages;

    // Filter by search query
    if (query) {
      const searchTerm = (query as string).toLowerCase();
      filtered = filtered.filter(
        pkg =>
          pkg.name.toLowerCase().includes(searchTerm) ||
          pkg.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by type
    if (type && type !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === type);
    }

    // Filter by status (would need health data)
    if (status && status !== 'all') {
      // This would filter by actual health status
      // For now, just return all packages
    }

    res.json({
      query,
      results: filtered,
      total: filtered.length,
      filters: { type, status },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search packages' });
  }
});

// Get recent activity
app.get('/api/activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const packages = scanMonorepo(process.cwd());

    // Mock recent activity data
    const activities = packages
      .slice(0, Math.min(Number(limit), packages.length))
      .map((pkg, index) => ({
        id: `activity-${Date.now()}-${index}`,
        type: [
          'package_updated',
          'build_success',
          'test_passed',
          'dependency_updated',
        ][Math.floor(Math.random() * 4)],
        packageName: pkg.name,
        message: `Activity for ${pkg.name}`,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last week
        metadata: {
          version: pkg.version,
          type: pkg.type,
        },
      }));

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json({
      activities: activities.slice(0, Number(limit)),
      total: activities.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Get system information
app.get('/api/system', (_, res) => {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
  });
});

// ------------------------- CONFIGURATION TAB ------------------------- //
// Get all configuration files from the file system
app.get('/api/config/files', async (req, res) => {
  try {
    // Find the monorepo root instead of using process.cwd()
    const rootDir = findMonorepoRoot();
    console.log('Monorepo root directory:', rootDir);
    console.log('Backend directory:', __dirname);

    const configFiles = await scanConfigFiles(rootDir);

    // Transform to match frontend ConfigFile interface
    const transformedFiles = configFiles.map(file => ({
      id: file.id,
      name: file.name,
      path: file.path,
      type: file.type,
      content: file.content,
      size: file.size,
      lastModified: file.lastModified,
      hasSecrets: file.hasSecrets,
      isEditable: true,
      validation: validateConfig(file.content, file.name),
    }));

    res.json({
      success: true,
      files: transformedFiles,
      total: transformedFiles.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching configuration files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration files',
    });
  }
});

/**
 * Find the monorepo root by looking for package.json with workspaces or pnpm-workspace.yaml
 */
function findMonorepoRoot(): string {
  let currentDir = __dirname;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    const pnpmWorkspacePath = path.join(currentDir, 'pnpm-workspace.yaml');

    // Check if this directory has package.json with workspaces or pnpm-workspace.yaml
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        // If it has workspaces or is the root monorepo package
        if (packageJson.workspaces || fs.existsSync(pnpmWorkspacePath)) {
          console.log('✅ Found monorepo root:', currentDir);
          return currentDir;
        }
      } catch (error) {
        // Continue searching if package.json is invalid
      }
    }

    // Check if we're at the git root
    const gitPath = path.join(currentDir, '.git');
    if (fs.existsSync(gitPath)) {
      console.log('✅ Found git root (likely monorepo root):', currentDir);
      return currentDir;
    }

    // Go up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Prevent infinite loop
    currentDir = parentDir;
  }

  // Fallback to process.cwd() if we can't find the root
  console.log(
    '⚠️ Could not find monorepo root, using process.cwd():',
    process.cwd()
  );
  return process.cwd();
}

// Helper function to scan for configuration files
async function scanConfigFiles(rootDir: string): Promise<any[]> {
  const configPatterns = [
    // Root level config files
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'turbo.json',
    'tsconfig.json',
    '.eslintrc.*',
    '.prettierrc',
    '.prettierignore',
    '.editorconfig',
    '.nvmrc',
    '.gitignore',
    'commitlint.config.js',
    '.releaserc.json',
    'env.example',

    // App-specific config files
    'vite.config.*',
    'tailwind.config.*',
    'postcss.config.*',
    'components.json',

    // Package-specific config files
    'jest.config.*',
    '.env*',
    'dockerfile*',
  ];

  const configFiles: any[] = [];
  const scannedPaths = new Set();

  function scanDirectory(dir: string, depth = 0) {
    if (scannedPaths.has(dir) || depth > 8) return; // Limit depth for safety
    scannedPaths.add(dir);

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (!shouldSkipDirectory(item.name, depth)) {
            scanDirectory(fullPath, depth + 1);
          }
        } else {
          // Check if file matches config patterns
          if (isConfigFile(item.name)) {
            try {
              const stats = fs.statSync(fullPath);
              const content = fs.readFileSync(fullPath, 'utf8');
              const relativePath =
                fullPath.replace(rootDir, '').replace(/\\/g, '/') ||
                `/${item.name}`;

              configFiles.push({
                id: relativePath,
                name: item.name,
                path: relativePath,
                type: getFileType(item.name),
                content: content,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
                hasSecrets: containsSecrets(content, item.name),
              });
            } catch (error) {
              console.warn(`Could not read file: ${fullPath}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory: ${dir}`);
    }
  }

  function shouldSkipDirectory(dirName: string, depth: number): boolean {
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.next',
      '.vscode',
      '.turbo',
      '.husky',
      '.github',
      '.vite',
      'migrations',
      'coverage',
      '.cache',
      'tmp',
      'temp',
    ];

    // At root level, be more permissive
    if (depth === 0) {
      return skipDirs.includes(dirName);
    }

    // Deeper levels, skip more directories
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  function isConfigFile(filename: string): boolean {
    return configPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(filename.toLowerCase());
      }
      return filename.toLowerCase() === pattern.toLowerCase();
    });
  }

  console.log(`🔍 Scanning for config files in: ${rootDir}`);

  // Start scanning from root
  scanDirectory(rootDir);

  // Sort files by path for consistent ordering
  configFiles.sort((a, b) => a.path.localeCompare(b.path));

  console.log(`📁 Found ${configFiles.length} configuration files`);

  // Log some sample files for debugging
  if (configFiles.length > 0) {
    console.log('Sample config files found:');
    configFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.path} (${file.type})`);
    });
    if (configFiles.length > 5) {
      console.log(`  ... and ${configFiles.length - 5} more`);
    }
  }

  return configFiles;
}

function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'env':
      return 'env';
    case 'md':
      return 'markdown';
    case 'cjs':
      return 'javascript';
    case 'config':
      return 'text';
    case 'example':
      return filename.includes('.env') ? 'env' : 'text';
    default:
      return 'text';
  }
}

function containsSecrets(content: string, filename: string): boolean {
  // Only check .env files and files that might contain secrets
  if (!filename.includes('.env') && !filename.includes('config')) {
    return false;
  }

  const secretPatterns = [
    /password\s*=\s*[^\s]/i,
    /secret\s*=\s*[^\s]/i,
    /key\s*=\s*[^\s]/i,
    /token\s*=\s*[^\s]/i,
    /auth\s*=\s*[^\s]/i,
    /credential\s*=\s*[^\s]/i,
    /api_key\s*=\s*[^\s]/i,
    /private_key\s*=\s*[^\s]/i,
    /DATABASE_URL/i,
    /JWT_SECRET/i,
    /GITHUB_TOKEN/i,
  ];

  return secretPatterns.some(pattern => pattern.test(content));
}

// Save configuration file
// app.put('/api/config/files/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content } = req.body;

//     if (!content) {
//       return res.status(400).json({
//         success: false,
//         error: 'Content is required',
//       });
//     }

//     const rootDir = process.cwd();
//     const filePath = path.join(rootDir, id.startsWith('/') ? id.slice(1) : id);

//     // Security check: ensure the file is within the project directory
//     if (!filePath.startsWith(rootDir)) {
//       return res.status(403).json({
//         success: false,
//         error: 'Access denied',
//       });
//     }

//     // Check if file exists and is writable
//     try {
//       await fs.promises.access(filePath, fs.constants.W_OK);
//     } catch (error) {
//       return res.status(403).json({
//         success: false,
//         error: 'File is not writable or does not exist',
//       });
//     }

//     // // Backup the original file (optional but recommended)
//     // const backupPath = `${filePath}.backup-${Date.now()}`;
//     // try {
//     //   await fs.promises.copyFile(filePath, backupPath);
//     // } catch (error) {
//     //   console.warn('Could not create backup file:', error);
//     // }

//     // Write the new content
//     await fs.promises.writeFile(filePath, content, 'utf8');

//     // Get file stats for updated information
//     const stats = await fs.promises.stat(filePath);
//     const filename = path.basename(filePath);

//     const updatedFile = {
//       id: id,
//       name: filename,
//       path: id,
//       type: getFileType(filename),
//       content: content,
//       size: stats.size,
//       lastModified: stats.mtime.toISOString(),
//       hasSecrets: containsSecrets(content, filename),
//       isEditable: true,
//       validation: validateConfig(content, filename),
//     };

//     res.json({
//       success: true,
//       file: updatedFile,
//       message: 'File saved successfully',
//       // backupCreated: fs.existsSync(backupPath),
//     });
//   } catch (error) {
//     console.error('Error saving configuration file:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to save configuration file',
//     });
//   }
// });

app.put('/api/config/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    // Use the monorepo root
    const rootDir = findMonorepoRoot();
    const filePath = path.join(rootDir, id.startsWith('/') ? id.slice(1) : id);

    console.log('💾 Saving file:', filePath);
    console.log('📁 Root directory:', rootDir);

    // Security check: ensure the file is within the project directory
    if (!filePath.startsWith(rootDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Check if file exists and is writable
    try {
      await fs.promises.access(filePath, fs.constants.W_OK);
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'File is not writable or does not exist',
      });
    }

    // Write the new content
    await fs.promises.writeFile(filePath, content, 'utf8');

    // Get file stats for updated information
    const stats = await fs.promises.stat(filePath);
    const filename = path.basename(filePath);

    const updatedFile = {
      id: id,
      name: filename,
      path: id,
      type: getFileType(filename),
      content: content,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      hasSecrets: containsSecrets(content, filename),
      isEditable: true,
      validation: validateConfig(content, filename),
    };

    res.json({
      success: true,
      file: updatedFile,
      message: 'File saved successfully',
    });
  } catch (error) {
    console.error('Error saving configuration file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration file',
    });
  }
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: Date.now(),
    });
  }
);

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    timestamp: Date.now(),
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/packages`);
  console.log(`   - GET  /api/packages/:name`);
  console.log(`   - GET  /api/graph`);
  console.log(`   - GET  /api/stats`);
  console.log(`   - GET  /api/ci/status`);
  console.log(`   - POST /api/ci/trigger`);
  console.log(`   - POST /api/scan`);
  console.log(`   - GET  /api/health/packages`);
  console.log(`   - GET  /api/search`);
  console.log(`   - GET  /api/activity`);
  console.log(`   - GET  /api/system`);
});

export default app;

// const overallScore =
//   healthMetrics.reduce((sum, h) => sum + h.health!.overallScore, 0) /
//   healthMetrics.length;

// const metrics: HealthMetric[] = [
//   {
//     name: 'Package Health',
//     value: healthMetrics.filter(h => h.isHealthy).length || 0,
//     status: calculateHealthStatus(
//       healthMetrics.filter(h => h.isHealthy).length,
//       packages.length
//     ),
//     description: `${healthMetrics.filter(h => h.isHealthy).length || 0} healthy packages out of ${packages.length || 0}`,
//   },
//   {
//     name: 'Overall Score',
//     value: Math.round(overallScore),
//     status:
//       Math.round(overallScore) >= 80
//         ? 'healthy'
//         : Math.round(overallScore) >= 60
//           ? 'warning'
//           : 'error',
//     description: `Average health score: ${Math.round(overallScore)}/100`,
//   },
//   {
//     name: 'Unhealthy Packages',
//     value: healthMetrics.filter(h => !h.isHealthy).length || 0,
//     status:
//       (healthMetrics.filter(h => !h.isHealthy).length || 0) === 0
//         ? 'healthy'
//         : (healthMetrics.filter(h => !h.isHealthy).length || 0) <= 2
//           ? 'warning'
//           : 'error',
//     description: `${healthMetrics.filter(h => !h.isHealthy).length || 0} packages need attention`,
//   },
// ];

// const packageHealth = packages.map((pkg: any) => ({
//   package: pkg.packageName,
//   score: pkg.health?.overallScore || 0,
//   issues: pkg.error
//     ? [pkg.error]
//     : (pkg.health?.overallScore || 0) < 80
//       ? ['Needs improvement']
//       : [],
// }));

// res.status(200).json({
//   overallScore,
//   metrics,
//   packageHealth,
// });
