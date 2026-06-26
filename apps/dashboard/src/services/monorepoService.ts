import { DASHBOARD_API_ENDPOINTS } from '../constants/api-config';
import apiClient from './api';
import type {
  Package,
  DependencyInfo,
  HealthMetric,
  BuildStatus,
  BuildStage,
  ConfigFile,
} from '../types/monorepo-service.types';
class MonorepoService {
  async getPackages(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>(
        DASHBOARD_API_ENDPOINTS.PACKAGES.LIST
      );

      if (response.success) {
        return response.data;
      }

      // Log the failure and attempt a refresh, but don't throw so tests
      // that expect a graceful fallback will remain deterministic.
      console.error(
        `getPackages: initial fetch failed with status ${response.error.status}. Attempting refresh...`
      );

      try {
        const refreshedData = await this.refreshPackages();
        return refreshedData;
      } catch (refreshError) {
        console.error('getPackages: refresh failed', refreshError);
        return [];
      }
    } catch (error) {
      console.error('getPackages: unexpected error', error);
      // Final fallback: return empty list so callers don't receive a thrown error
      return [];
    }
  }

  async getPackage(name: string): Promise<Package[]> {
    const response = await apiClient.get<Package[]>(
      DASHBOARD_API_ENDPOINTS.PACKAGES.DETAILS(name)
    );
    if (!response.success) {
      throw new Error(
        `Failed to fetch package details for "${name}" (Status: ${response.error.status})`
      );
    }
    return response.data;
  }

  async getDependencies(): Promise<DependencyInfo[]> {
    const allDeps = new Set<string>();
    try {
      const packages = await this.getPackages();

      packages.forEach(pkg => {
        pkg.dependencies?.forEach(dep => allDeps.add(dep));
      });

      const dependencyInfoArray: DependencyInfo[] = Array.from(allDeps).map(
        dep => ({
          name: dep,
          version: 'unknown',
          type: 'dependency',
          status: 'active',
        })
      );

      return dependencyInfoArray;
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return [];
    }
  }

  async refreshPackages(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>(
        DASHBOARD_API_ENDPOINTS.PACKAGES.REFRESH
      );

      if (!response.success) {
        console.error(
          `refreshPackages: fetch failed with status ${response.error.status}`
        );
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('refreshPackages: unexpected error', error);
      return [];
    }
  }

  async getHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    try {
      // First attempt to get health data
      let response = await apiClient.get(
        DASHBOARD_API_ENDPOINTS.HEALTH.PACKAGES
      );

      if (!response.success) {
        // If initial fetch fails, try to refresh the data
        const refreshResponse = await apiClient.post(
          DASHBOARD_API_ENDPOINTS.HEALTH.REFRESH
        );

        if (!refreshResponse.success) {
          throw new Error('Failed to refresh health data');
        }

        // Wait a moment for the refresh to complete, then fetch again
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Second attempt to get health data after refresh
        response = await apiClient.get(DASHBOARD_API_ENDPOINTS.HEALTH.PACKAGES);

        if (!response.success) {
          throw new Error('Failed to fetch health data after refresh');
        }
      }

      return response.data as any;
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  }

  async refreshHealthStatus(): Promise<{
    overallScore: number;
    metrics: HealthMetric[];
    packageHealth: Array<{ package: string; score: number; issues: string[] }>;
  }> {
    try {
      // Call your real backend API
      const healthRes = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.HEALTH.REFRESH
      );

      if (!healthRes.success) {
        throw new Error('Failed to fetch health data');
      }

      const healthData = healthRes.data;

      return healthData;
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  }

  // Add this method to your MonorepoService class
  async updatePackageConfiguration(
    packageName: string,
    config: string,
    packagePath: string
  ): Promise<{
    success: boolean;
    message: string;
    package: Package;
    healthRefreshed?: boolean;
    preservedFields?: boolean;
  }> {
    try {
      const response = await apiClient.put(
        DASHBOARD_API_ENDPOINTS.PACKAGES.UPDATE_CONFIG,
        JSON.stringify({
          packageName,
          config,
          packagePath,
        })
      );

      if (!response.success) {
        throw new Error(`HTTP error: ${response.error?.message}`);
      }

      const result = response.data;

      return result;
    } catch (error) {
      console.error('Error updating package configuration:', error);
      throw error;
    }
  }

  async getBuildStatus(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        DASHBOARD_API_ENDPOINTS.CI.STATUS
      );

      if (!response.success) {
        throw new Error(
          `getBuildStatus: fetch failed with status ${response.error?.status}`
        );
      }

      return response.data?.pipelines || [];
    } catch (error) {
      console.error('getBuildStatus: ', error);
      throw error;
    }
  }

  async triggerCIBuild(packageName: string, branch: string): Promise<any> {
    try {
      const res = await apiClient.post(DASHBOARD_API_ENDPOINTS.CI.TRIGGER, { packageName, providerName: 'github', branch });
      if (!res.success) throw new Error(res.error?.message || 'Failed to trigger build');
      return res.data;
    } catch (error) {
      console.error('Error triggering build:', error);
      throw error;
    }
  }

  async togglePipeline(pipelineId: string, active: boolean): Promise<any> {
    try {
      const res = await apiClient.post(DASHBOARD_API_ENDPOINTS.CI.TOGGLE(pipelineId), { active });
      if (!res.success) throw new Error(res.error?.message || 'Failed to toggle pipeline');
      return res.data;
    } catch (error) {
      console.error('Error toggling pipeline:', error);
      throw error;
    }
  }

  async cancelPipeline(buildId: string): Promise<any> {
    try {
      const res = await apiClient.post(DASHBOARD_API_ENDPOINTS.CI.CANCEL(buildId));
      if (!res.success) throw new Error(res.error?.message || 'Failed to cancel pipeline');
      return res.data;
    } catch (error) {
      console.error('Error cancelling pipeline:', error);
      throw error;
    }
  }

  async retryPipeline(buildId: string): Promise<any> {
    try {
      const res = await apiClient.post(DASHBOARD_API_ENDPOINTS.CI.RETRY(buildId));
      if (!res.success) throw new Error(res.error?.message || 'Failed to retry pipeline');
      return res.data;
    } catch (error) {
      console.error('Error retrying pipeline:', error);
      throw error;
    }
  }

  async getScheduledReleases(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(
        DASHBOARD_API_ENDPOINTS.PIPELINES.SCHEDULED
      );

      if (!response.success) {
        throw new Error(
          `getScheduledReleases: fetch failed with status ${response.error?.status}`
        );
      }

      return response.data?.releases || [];
    } catch (error) {
      console.error('getScheduledReleases: ', error);
      throw error;
    }
  }

  async getConfigurationFiles(): Promise<ConfigFile[]> {
    try {
      const res = await apiClient.get(DASHBOARD_API_ENDPOINTS.CONFIG.FILES);

      if (!res.success) {
        throw new Error(`Failed to fetch config files: ${res.error?.message}`);
      }

      const response = res.data;

      if (response.success && response.files) {
        return response.files;
      } else {
        throw new Error('Invalid response format from config files API');
      }
    } catch (error) {
      console.error('Error fetching configuration files from backend:', error);
      return [];
    }
  }

  async saveConfigurationFile(
    fileId: string,
    content: string
  ): Promise<ConfigFile> {
    try {
      const res = await apiClient.put(
        DASHBOARD_API_ENDPOINTS.CONFIG.FILE(fileId),
        JSON.stringify({ content })
      );

      if (!res.success) {
        throw new Error(res.error?.message || `Failed to save file`);
      }

      const response = res.data;

      if (response.success && response.file) {
        return response.file;
      } else {
        throw new Error('Invalid response format from save file API');
      }
    } catch (error) {
      console.error('Error saving configuration file:', error);
      throw error;
    }
  }
}

export const monorepoService = new MonorepoService();

// Re-export types for backward compatibility
export type {
  Package,
  DependencyInfo,
  HealthMetric,
  BuildStatus,
  BuildStage,
  ConfigFile,
} from '../types/monorepo-service.types';
