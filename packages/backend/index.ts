import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { scanner, quickScan, generateReports } from '../monorepo-scanner';
import { ciStatusManager, getMonorepoCIStatus } from '../ci-status';
import { scanMonorepo, generateMonorepoStats, findCircularDependencies, generateDependencyGraph } from '../../libs/utils/helpers';

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
      database: 'active'
    }
  });
});

// Get all packages
app.get('/api/packages', async (req, res) => {
  try {
    const packages = scanMonorepo(process.cwd());
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// Get package details
app.get('/api/packages/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const packages = scanMonorepo(process.cwd());
    const packageInfo = packages.find(p => p.name === name);
    
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
      }
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
        message: `Build triggered for ${packageName}` 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
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
    
    const logs = await ciStatusManager.getBuildLogs(buildId, provider as string);
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
    
    const artifacts = await ciStatusManager.getBuildArtifacts(buildId, provider as string);
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
      result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform scan' 
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
    const exportData = scanner.exportResults(result, format as 'json' | 'csv' | 'html');
    
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

// Get package health metrics
app.get('/api/health/packages/:name', async (req, res) => {
  try {
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
app.get('/api/health/packages', async (req, res) => {
  try {
    const packages = scanMonorepo(process.cwd());
    const healthMetrics = await Promise.all(
      packages.map(async (pkg) => {
        try {
          const health = {
            buildStatus: 'success' as const,
            testCoverage: Math.floor(Math.random() * 100),
            lintStatus: 'pass' as const,
            securityAudit: 'pass' as const,
            overallScore: Math.floor(Math.random() * 40) + 60,
          };
          
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
        averageScore: healthMetrics
          .filter(h => h.health)
          .reduce((sum, h) => sum + h.health!.overallScore, 0) / 
          healthMetrics.filter(h => h.health).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health metrics' });
  }
});

// Search packages
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, type, status } = req.query;
    const packages = scanMonorepo(process.cwd());
    
    let filtered = packages;
    
    // Filter by search query
    if (query) {
      const searchTerm = (query as string).toLowerCase();
      filtered = filtered.filter(pkg => 
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
    const activities = packages.slice(0, Math.min(Number(limit), packages.length)).map((pkg, index) => ({
      id: `activity-${Date.now()}-${index}`,
      type: ['package_updated', 'build_success', 'test_passed', 'dependency_updated'][Math.floor(Math.random() * 4)],
      packageName: pkg.name,
      message: `Activity for ${pkg.name}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
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

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: Date.now(),
  });
});

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
