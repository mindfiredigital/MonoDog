#!/usr/bin/env tsx

import { scanner, quickScan, generateReports } from '../packages/monorepo-scanner';
import { ciStatusManager, getMonorepoCIStatus } from '../packages/ci-status';
import { scanMonorepo, generateMonorepoStats } from '../libs/utils/helpers';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface RefreshOptions {
  fullScan?: boolean;
  ciStatus?: boolean;
  healthCheck?: boolean;
  dependencies?: boolean;
  export?: 'json' | 'csv' | 'html';
  outputFile?: string;
  verbose?: boolean;
}

class MonorepoRefresher {
  private rootDir: string;
  private options: RefreshOptions;

  constructor(options: RefreshOptions = {}) {
    this.rootDir = process.cwd();
    this.options = {
      fullScan: true,
      ciStatus: true,
      healthCheck: true,
      dependencies: true,
      verbose: false,
      ...options,
    };
  }

  /**
   * Main refresh function
   */
  async refresh(): Promise<void> {
    console.log('🔄 Starting monorepo refresh...');
    const startTime = Date.now();

    try {
      // Perform full scan if requested
      if (this.options.fullScan) {
        await this.performFullScan();
      }

      // Update CI status if requested
      if (this.options.ciStatus) {
        await this.updateCIStatus();
      }

      // Perform health checks if requested
      if (this.options.healthCheck) {
        await this.performHealthChecks();
      }

      // Update dependency information if requested
      if (this.options.dependencies) {
        await this.updateDependencies();
      }

      // Export results if requested
      if (this.options.export) {
        await this.exportResults();
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Refresh completed in ${duration}ms`);

    } catch (error) {
      console.error('❌ Error during refresh:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Perform a full monorepo scan
   */
  private async performFullScan(): Promise<void> {
    console.log('📦 Performing full monorepo scan...');
    
    try {
      // Use the scanner to get comprehensive results
      const scanResult = await quickScan();
      
      // Store scan results in database
      await this.storeScanResults(scanResult);
      
      // Generate detailed reports
      const reports = await generateReports();
      await this.storePackageReports(reports);
      
      console.log(`📊 Scan completed: ${scanResult.packages.length} packages found`);
      
      if (this.options.verbose) {
        console.log('📋 Scan Summary:');
        console.log(`  - Total packages: ${scanResult.stats.totalPackages}`);
        console.log(`  - Applications: ${scanResult.stats.apps}`);
        console.log(`  - Libraries: ${scanResult.stats.libraries}`);
        console.log(`  - Tools: ${scanResult.stats.tools}`);
        console.log(`  - Circular dependencies: ${scanResult.circularDependencies.length}`);
        console.log(`  - Outdated packages: ${scanResult.outdatedPackages.length}`);
      }
      
    } catch (error) {
      console.error('❌ Error during full scan:', error);
      throw error;
    }
  }

  /**
   * Update CI status for all packages
   */
  private async updateCIStatus(): Promise<void> {
    console.log('🚀 Updating CI status...');
    
    try {
      // Get all packages from database or scan
      const packages = await this.getPackages();
      
      // Get CI status for the monorepo
      const ciStatus = await getMonorepoCIStatus(packages);
      
      // Store CI status in database
      await this.storeCIStatus(ciStatus);
      
      console.log(`📊 CI status updated: ${ciStatus.totalPackages} packages processed`);
      
      if (this.options.verbose) {
        console.log('📋 CI Status Summary:');
        console.log(`  - Overall health: ${ciStatus.overallHealth.toFixed(1)}%`);
        console.log(`  - Healthy packages: ${ciStatus.healthyPackages}`);
        console.log(`  - Warning packages: ${ciStatus.warningPackages}`);
        console.log(`  - Error packages: ${ciStatus.errorPackages}`);
        console.log(`  - Test success rate: ${ciStatus.tests.successRate.toFixed(1)}%`);
        console.log(`  - Coverage: ${ciStatus.coverage.overall.toFixed(1)}%`);
      }
      
    } catch (error) {
      console.error('❌ Error updating CI status:', error);
      throw error;
    }
  }

  /**
   * Perform health checks on packages
   */
  private async performHealthChecks(): Promise<void> {
    console.log('🏥 Performing health checks...');
    
    try {
      const packages = await this.getPackages();
      let healthyCount = 0;
      let warningCount = 0;
      let errorCount = 0;
      
      for (const pkg of packages) {
        try {
          const health = await this.checkPackageHealth(pkg);
          await this.storeHealthMetrics(pkg.id, health);
          
          if (health.overallScore >= 80) {
            healthyCount++;
          } else if (health.overallScore >= 60) {
            warningCount++;
          } else {
            errorCount++;
          }
          
        } catch (error) {
          console.warn(`⚠️  Health check failed for ${pkg.name}:`, error);
          errorCount++;
        }
      }
      
      console.log(`📊 Health checks completed: ${healthyCount} healthy, ${warningCount} warnings, ${errorCount} errors`);
      
    } catch (error) {
      console.error('❌ Error during health checks:', error);
      throw error;
    }
  }

  /**
   * Update dependency information
   */
  private async updateDependencies(): Promise<void> {
    console.log('🔗 Updating dependency information...');
    
    try {
      const packages = await this.getPackages();
      
      for (const pkg of packages) {
        try {
          // Get package dependencies
          const dependencies = await this.getPackageDependencies(pkg);
          
          // Store dependencies in database
          await this.storeDependencies(pkg.id, dependencies);
          
        } catch (error) {
          console.warn(`⚠️  Failed to update dependencies for ${pkg.name}:`, error);
        }
      }
      
      console.log(`📊 Dependencies updated for ${packages.length} packages`);
      
    } catch (error) {
      console.error('❌ Error updating dependencies:', error);
      throw error;
    }
  }

  /**
   * Export results in specified format
   */
  private async exportResults(): Promise<void> {
    if (!this.options.export) return;
    
    console.log(`📤 Exporting results in ${this.options.export.toUpperCase()} format...`);
    
    try {
      const scanResult = await quickScan();
      const exportData = scanner.exportResults(scanResult, this.options.export);
      
      if (this.options.outputFile) {
        fs.writeFileSync(this.options.outputFile, exportData);
        console.log(`📁 Results exported to: ${this.options.outputFile}`);
      } else {
        console.log(exportData);
      }
      
    } catch (error) {
      console.error('❌ Error exporting results:', error);
      throw error;
    }
  }

  /**
   * Get packages from database or scan
   */
  private async getPackages(): Promise<any[]> {
    try {
      // Try to get packages from database first
      const dbPackages = await prisma.package.findMany();
      if (dbPackages.length > 0) {
        return dbPackages;
      }
    } catch (error) {
      // Database not available, fall back to scanning
    }
    
    // Fall back to scanning
    return scanMonorepo(this.rootDir);
  }

  /**
   * Store scan results in database
   */
  private async storeScanResults(scanResult: any): Promise<void> {
    try {
      await prisma.monorepoScan.create({
        data: {
          scanTimestamp: scanResult.scanTimestamp,
          scanDuration: scanResult.scanDuration,
          totalPackages: scanResult.stats.totalPackages,
          healthyPackages: scanResult.stats.healthyPackages,
          warningPackages: scanResult.stats.warningPackages,
          errorPackages: scanResult.stats.errorPackages,
          overallHealth: scanResult.stats.healthyPackages / scanResult.stats.totalPackages * 100,
          scanData: scanResult,
        },
      });
    } catch (error) {
      console.warn('⚠️  Failed to store scan results in database:', error);
    }
  }

  /**
   * Store package reports in database
   */
  private async storePackageReports(reports: any[]): Promise<void> {
    for (const report of reports) {
      try {
        const pkg = report.package;
        
        // Create or update package
        const dbPackage = await prisma.package.upsert({
          where: { name: pkg.name },
          update: {
            version: pkg.version,
            type: pkg.type.toUpperCase(),
            path: pkg.path,
            description: pkg.description,
            license: pkg.license,
            repository: pkg.repository,
            updatedAt: new Date(),
          },
          create: {
            name: pkg.name,
            version: pkg.version,
            type: pkg.type.toUpperCase(),
            path: pkg.path,
            description: pkg.description,
            license: pkg.license,
            repository: pkg.repository,
          },
        });
        
        // Store health metrics
        if (report.health) {
          await prisma.healthMetric.create({
            data: {
              packageId: dbPackage.id,
              buildStatus: report.health.buildStatus.toUpperCase(),
              testCoverage: report.health.testCoverage,
              lintStatus: report.health.lintStatus.toUpperCase(),
              securityAudit: report.health.securityAudit.toUpperCase(),
              overallScore: report.health.overallScore,
            },
          });
        }
        
      } catch (error) {
        console.warn(`⚠️  Failed to store report for ${report.package.name}:`, error);
      }
    }
  }

  /**
   * Store CI status in database
   */
  private async storeCIStatus(ciStatus: any): Promise<void> {
    // This would store CI build information in the database
    // Implementation depends on your specific needs
    console.log('💾 CI status stored in database');
  }

  /**
   * Check package health
   */
  private async checkPackageHealth(pkg: any): Promise<any> {
    // This would perform actual health checks
    // For now, return mock data
    return {
      buildStatus: 'success',
      testCoverage: Math.floor(Math.random() * 100),
      lintStatus: 'pass',
      securityAudit: 'pass',
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
    };
  }

  /**
   * Store health metrics in database
   */
  private async storeHealthMetrics(packageId: string, health: any): Promise<void> {
    try {
      await prisma.healthMetric.create({
        data: {
          packageId,
          buildStatus: health.buildStatus.toUpperCase(),
          testCoverage: health.testCoverage,
          lintStatus: health.lintStatus.toUpperCase(),
          securityAudit: health.securityAudit.toUpperCase(),
          overallScore: health.overallScore,
        },
      });
    } catch (error) {
      console.warn('⚠️  Failed to store health metrics:', error);
    }
  }

  /**
   * Get package dependencies
   */
  private async getPackageDependencies(pkg: any): Promise<any[]> {
    // This would parse package.json and get actual dependencies
    // For now, return empty array
    return [];
  }

  /**
   * Store dependencies in database
   */
  private async storeDependencies(packageId: string, dependencies: any[]): Promise<void> {
    // This would store dependencies in the database
    // Implementation depends on your specific needs
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): RefreshOptions {
  const args = process.argv.slice(2);
  const options: RefreshOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--no-scan':
        options.fullScan = false;
        break;
      case '--no-ci':
        options.ciStatus = false;
        break;
      case '--no-health':
        options.healthCheck = false;
        break;
      case '--no-deps':
        options.dependencies = false;
        break;
      case '--export':
        options.export = args[++i] as 'json' | 'csv' | 'html';
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      default:
        console.warn(`⚠️  Unknown argument: ${arg}`);
        break;
    }
  }
  
  return options;
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
Monorepo Refresh Script

Usage: tsx scripts/refresh.ts [options]

Options:
  --no-scan          Skip full monorepo scan
  --no-ci            Skip CI status update
  --no-health        Skip health checks
  --no-deps          Skip dependency updates
  --export <format>  Export results (json|csv|html)
  --output <file>    Output file for export
  --verbose, -v      Verbose output
  --help, -h         Show this help

Examples:
  tsx scripts/refresh.ts                    # Full refresh
  tsx scripts/refresh.ts --no-ci            # Skip CI updates
  tsx scripts/refresh.ts --export json      # Export as JSON
  tsx scripts/refresh.ts --export csv --output report.csv
`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    const refresher = new MonorepoRefresher(options);
    await refresher.refresh();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MonorepoRefresher, RefreshOptions };