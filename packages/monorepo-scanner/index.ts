// Monorepo Scanner
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { 
  PackageInfo, 
  DependencyInfo, 
  PackageHealth, 
  MonorepoStats,
  scanMonorepo,
  analyzeDependencies,
  calculatePackageHealth,
  generateMonorepoStats,
  findCircularDependencies,
  generateDependencyGraph,
  checkOutdatedDependencies,
  getPackageSize
} from '../../libs/utils/helpers';

export interface ScanResult {
  packages: PackageInfo[];
  stats: MonorepoStats;
  dependencyGraph: any;
  circularDependencies: string[][];
  outdatedPackages: string[];
  scanTimestamp: Date;
  scanDuration: number;
}

export interface PackageReport {
  package: PackageInfo;
  health: PackageHealth;
  size: { size: number; files: number };
  outdatedDeps: DependencyInfo[];
  lastModified: Date;
  gitInfo?: {
    lastCommit: string;
    lastCommitDate: Date;
    author: string;
    branch: string;
  };
}

export class MonorepoScanner {
  private rootDir: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  /**
   * Performs a complete scan of the monorepo
   */
  async scan(): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = 'full-scan';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      console.log('🔍 Starting monorepo scan...');
      
      // Scan all packages
      const packages = scanMonorepo(this.rootDir);
      console.log(`📦 Found ${packages.length} packages`);
      
      // Generate statistics
      const stats = generateMonorepoStats(packages);
      
      // Generate dependency graph
      const dependencyGraph = generateDependencyGraph(packages);
      
      // Find circular dependencies
      const circularDependencies = findCircularDependencies(packages);
      
      // Check for outdated packages
      const outdatedPackages = this.findOutdatedPackages(packages);
      
      const result: ScanResult = {
        packages,
        stats,
        dependencyGraph,
        circularDependencies,
        outdatedPackages,
        scanTimestamp: new Date(),
        scanDuration: Date.now() - startTime,
      };
      
      // Cache the result
      this.setCache(cacheKey, result);
      
      console.log(`✅ Scan completed in ${result.scanDuration}ms`);
      return result;
      
    } catch (error) {
      console.error('❌ Error during scan:', error);
      throw error;
    }
  }

  /**
   * Generates detailed reports for all packages
   */
  async generatePackageReports(): Promise<PackageReport[]> {
    const packages = scanMonorepo(this.rootDir);
    const reports: PackageReport[] = [];
    
    for (const pkg of packages) {
      try {
        const report = await this.generatePackageReport(pkg);
        reports.push(report);
      } catch (error) {
        console.error(`Error generating report for ${pkg.name}:`, error);
      }
    }
    
    return reports;
  }

  /**
   * Generates a detailed report for a specific package
   */
  async generatePackageReport(pkg: PackageInfo): Promise<PackageReport> {
    const health = await this.assessPackageHealth(pkg);
    const size = getPackageSize(pkg.path);
    const outdatedDeps = checkOutdatedDependencies(pkg);
    const lastModified = this.getLastModified(pkg.path);
    const gitInfo = await this.getGitInfo(pkg.path);
    
    return {
      package: pkg,
      health,
      size,
      outdatedDeps,
      lastModified,
      gitInfo,
    };
  }

  /**
   * Assesses the health of a package
   */
  private async assessPackageHealth(pkg: PackageInfo): Promise<PackageHealth> {
    // Check build status
    const buildStatus = await this.checkBuildStatus(pkg);
    
    // Check test coverage
    const testCoverage = await this.checkTestCoverage(pkg);
    
    // Check lint status
    const lintStatus = await this.checkLintStatus(pkg);
    
    // Check security audit
    const securityAudit = await this.checkSecurityAudit(pkg);
    
    return calculatePackageHealth(buildStatus, testCoverage, lintStatus, securityAudit);
  }

  /**
   * Checks if a package builds successfully
   */
  private async checkBuildStatus(pkg: PackageInfo): Promise<PackageHealth['buildStatus']> {
    try {
      if (pkg.scripts.build) {
        // Try to run build command
        execSync('npm run build', { 
          cwd: pkg.path, 
          stdio: 'pipe',
          timeout: 30000 
        });
        return 'success';
      }
      return 'unknown';
    } catch (error) {
      return 'failed';
    }
  }

  /**
   * Checks test coverage for a package
   */
  private async checkTestCoverage(pkg: PackageInfo): Promise<number> {
    try {
      if (pkg.scripts.test) {
        // This would typically run tests and parse coverage reports
        // For now, return a mock value
        return Math.floor(Math.random() * 100);
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Checks lint status for a package
   */
  private async checkLintStatus(pkg: PackageInfo): Promise<PackageHealth['lintStatus']> {
    try {
      if (pkg.scripts.lint) {
        // Try to run lint command
        execSync('npm run lint', { 
          cwd: pkg.path, 
          stdio: 'pipe',
          timeout: 10000 
        });
        return 'pass';
      }
      return 'unknown';
    } catch (error) {
      return 'fail';
    }
  }

  /**
   * Checks security audit for a package
   */
  private async checkSecurityAudit(pkg: PackageInfo): Promise<PackageHealth['securityAudit']> {
    try {
      // Run npm audit
      const result = execSync('npm audit --json', { 
        cwd: pkg.path, 
        stdio: 'pipe',
        timeout: 15000 
      });
      
      const audit = JSON.parse(result.toString());
      return audit.metadata.vulnerabilities.total === 0 ? 'pass' : 'fail';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Finds packages with outdated dependencies
   */
  private findOutdatedPackages(packages: PackageInfo[]): string[] {
    const outdated: string[] = [];
    
    for (const pkg of packages) {
      const outdatedDeps = checkOutdatedDependencies(pkg);
      if (outdatedDeps.length > 0) {
        outdated.push(pkg.name);
      }
    }
    
    return outdated;
  }

  /**
   * Gets the last modified date of a package
   */
  private getLastModified(packagePath: string): Date {
    try {
      const stats = fs.statSync(packagePath);
      return stats.mtime;
    } catch (error) {
      return new Date();
    }
  }

  /**
   * Gets git information for a package
   */
  private async getGitInfo(packagePath: string): Promise<PackageReport['gitInfo'] | undefined> {
    try {
      // Check if this is a git repository
      const gitPath = path.join(packagePath, '.git');
      if (!fs.existsSync(gitPath)) {
        return undefined;
      }
      
      // Get last commit info
      const lastCommit = execSync('git rev-parse HEAD', { 
        cwd: packagePath, 
        stdio: 'pipe' 
      }).toString().trim();
      
      const lastCommitDate = new Date(
        execSync('git log -1 --format=%cd', { 
          cwd: packagePath, 
          stdio: 'pipe' 
        }).toString().trim()
      );
      
      const author = execSync('git log -1 --format=%an', { 
        cwd: packagePath, 
        stdio: 'pipe' 
      }).toString().trim();
      
      const branch = execSync('git branch --show-current', { 
        cwd: packagePath, 
        stdio: 'pipe' 
      }).toString().trim();
      
      return {
        lastCommit: lastCommit.substring(0, 7),
        lastCommitDate,
        author,
        branch,
      };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Scans for specific file types in packages
   */
  scanForFileTypes(fileTypes: string[]): Record<string, string[]> {
    const results: Record<string, string[]> = {};
    
    for (const fileType of fileTypes) {
      results[fileType] = [];
    }
    
    const packages = scanMonorepo(this.rootDir);
    
    for (const pkg of packages) {
      this.scanPackageForFiles(pkg.path, fileTypes, results);
    }
    
    return results;
  }

  /**
   * Recursively scans a package directory for specific file types
   */
  private scanPackageForFiles(
    packagePath: string, 
    fileTypes: string[], 
    results: Record<string, string[]>
  ): void {
    try {
      const items = fs.readdirSync(packagePath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(packagePath, item.name);
        
        if (item.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
            this.scanPackageForFiles(fullPath, fileTypes, results);
          }
        } else {
          // Check file extension
          const ext = path.extname(item.name);
          if (fileTypes.includes(ext)) {
            results[ext].push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  /**
   * Gets cache value if not expired
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Sets cache value with timestamp
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Exports scan results to various formats
   */
  exportResults(results: ScanResult, format: 'json' | 'csv' | 'html'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      case 'csv':
        return this.exportToCSV(results);
      case 'html':
        return this.exportToHTML(results);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Exports results to CSV format
   */
  private exportToCSV(results: ScanResult): string {
    const headers = ['Package', 'Type', 'Version', 'Dependencies', 'Health Score'];
    const rows = results.packages.map(pkg => [
      pkg.name,
      pkg.type,
      pkg.version,
      Object.keys(pkg.dependencies).length,
      'N/A' // Would need health calculation
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Exports results to HTML format
   */
  private exportToHTML(results: ScanResult): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monorepo Scan Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Monorepo Scan Report</h1>
          <p>Generated: ${results.scanTimestamp}</p>
          <p>Duration: ${results.scanDuration}ms</p>
          
          <h2>Summary</h2>
          <ul>
            <li>Total Packages: ${results.stats.totalPackages}</li>
            <li>Applications: ${results.stats.apps}</li>
            <li>Libraries: ${results.stats.libraries}</li>
            <li>Tools: ${results.stats.tools}</li>
          </ul>
          
          <h2>Packages</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Version</th>
              <th>Dependencies</th>
            </tr>
            ${results.packages.map(pkg => `
              <tr>
                <td>${pkg.name}</td>
                <td>${pkg.type}</td>
                <td>${pkg.version}</td>
                <td>${Object.keys(pkg.dependencies).length}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  }
}

// Export default instance
export const scanner = new MonorepoScanner();

// Export convenience functions
export async function quickScan(): Promise<ScanResult> {
  return scanner.scan();
}

export async function generateReports(): Promise<PackageReport[]> {
  return scanner.generatePackageReports();
}

export function scanForFiles(fileTypes: string[]): Record<string, string[]> {
  return scanner.scanForFileTypes(fileTypes);
}
