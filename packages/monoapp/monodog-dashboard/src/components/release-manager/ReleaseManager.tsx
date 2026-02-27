/**
 * Release Manager Component
 *
 * Comprehensive UI-driven version control and package publishing for monorepos using Changesets.
 * Allows users to:
 * - Select packages and version bumps
 * - Generate changesets
 * - Preview releases
 * - Trigger publishing pipeline
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/auth-context';
import apiClient from '../../services/api';
import PackageSelector from './components/PackageSelector';
import VersionBumpSelector from './components/VersionBumpSelector';
import ChangesetPreview from './components/ChangesetPreview';
import ReleaseValidation from './components/ReleaseValidation';
import PublishConfirmation from './components/PublishConfirmation';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { DASHBOARD_ERROR_MESSAGES } from '../../constants/messages';
import { DASHBOARD_API_ENDPOINTS } from '../../constants/api-config';
import type { SelectedPackage, ChangesetData, ValidationResult } from './types';

// Re-export types for backward compatibility
export type { SelectedPackage, ChangesetData, ValidationResult };

export default function ReleaseManager() {
  const { isAuthenticated, hasPermission } = useAuth();
  const [currentStep, setCurrentStep] = useState<'select' | 'bump' | 'preview' | 'validate' | 'confirm'>('select');
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);
  const [changesetSummary, setChangesetSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [allPackages, setAllPackages] = useState<Array<{ name: string; version: string; dependents?: string[] }>>([]);
  const [existingChangesets, setExistingChangesets] = useState<Array<{ id: string; summary: string }>>([]);

  // Fetch workspace packages on mount
  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);

      // Fetch packages
      const packagesRes = await apiClient.get(DASHBOARD_API_ENDPOINTS.PUBLISH.PACKAGES);
      if (packagesRes.success) {
        setAllPackages(packagesRes.data.packages || []);
      } else {
        console.warn('Failed to fetch packages:', packagesRes.error?.message);
        // Fallback to regular packages endpoint
        const fallbackRes = await apiClient.get(DASHBOARD_API_ENDPOINTS.PACKAGES.LIST);
        if (fallbackRes.success) {
          setAllPackages(fallbackRes.data || []);
        }
      }

      // Fetch existing changesets
      const changesetsRes = await apiClient.get(DASHBOARD_API_ENDPOINTS.PUBLISH.CHANGESETS);
      if (changesetsRes.success) {
        setExistingChangesets(changesetsRes.data.changesets || []);
      } else {
        if (changesetsRes.error?.status === 401 || changesetsRes.error?.status === 403) {
          window.location.href = '/login';
        }
      }

      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES;
      setError(message);
      console.error('Error fetching workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePackagesSelected = (packages: Array<{ name: string; version: string; dependents?: string[] }>) => {
    const selected: SelectedPackage[] = packages.map(pkg => ({
      name: pkg.name,
      currentVersion: pkg.version,
      newVersion: pkg.version, // Will be updated in bump step
      bumpType: 'patch',
      affectedDependencies: pkg.dependents || [],
    }));
    setSelectedPackages(selected);
    setCurrentStep('bump');
  };

  const handleVersionBumpsConfirmed = (updatedPackages: SelectedPackage[]) => {
    setSelectedPackages(updatedPackages);
    setCurrentStep('preview');
  };

  const handlePreviewConfirmed = (summary: string) => {
    setChangesetSummary(summary);
    validateRelease(selectedPackages, summary);
  };

  const validateRelease = async (packages: SelectedPackage[], summary: string) => {
    try {
      setLoading(true);

      const response = await apiClient.post(DASHBOARD_API_ENDPOINTS.PUBLISH.PREVIEW, {
        packages: packages.map(p => p.name),
        bumps: packages.map(p => ({
          package: p.name,
          bumpType: p.bumpType,
        })),
        summary,
      });

      if (!response.success) {
        throw new Error(DASHBOARD_ERROR_MESSAGES.VALIDATION_FAILED);
      }

      const result = response.data;

      // Ensure the result has the expected structure
      const validationData: ValidationResult = {
        isValid: result.isValid ?? true,
        errors: result.errors ?? [],
        warnings: result.warnings ?? [],
        checks: result.checks ?? {
          permissions: true,
          workingTreeClean: true,
          ciPassing: true,
          versionAvailable: true,
        },
      };

      setValidationResult(validationData);
      setCurrentStep('validate');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation error';
      setError(message);
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishConfirmed = async () => {
    try {
      // Check permission before publishing
      if (!hasPermission('maintain')) {
        setError(DASHBOARD_ERROR_MESSAGES.PERMISSION_ERROR);
        return;
      }

      setLoading(true);

      // Create changeset
      const changesetRes = await apiClient.post(DASHBOARD_API_ENDPOINTS.PUBLISH.CHANGESETS, {
        packages: selectedPackages.map(p => p.name),
        bumps: selectedPackages.map(p => ({
          package: p.name,
          bumpType: p.bumpType,
        })),
        summary: changesetSummary,
      });

      if (!changesetRes.success) {
        throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_CREATE_CHANGESET);
      }

      // Trigger publish
      const publishRes = await apiClient.post(DASHBOARD_API_ENDPOINTS.PUBLISH.TRIGGER, {
        packages: selectedPackages,
      });

      if (!publishRes.success) {
        throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_TRIGGER_PUBLISH);
      }

      setCurrentStep('confirm');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publishing error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('select');
    setSelectedPackages([]);
    setChangesetSummary('');
    setValidationResult(null);
    setError(null);
    fetchWorkspaceData();
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to access release management.</p>
      </div>
    );
  }

  if (loading && currentStep === 'select' && allPackages.length === 0) {
    return <LoadingState message="Loading workspace packages..." />;
  }

  if (error && currentStep === 'select') {
    return <ErrorState error={error} onRetry={fetchWorkspaceData} />;
  }

  // Check if user has required permissions
  const canCreateChangeset = hasPermission('write');
  const canPublish = hasPermission('maintain');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Release Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage package versions and publish releases with Changesets
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Step {['select', 'bump', 'preview', 'validate', 'confirm'].indexOf(currentStep) + 1} of 5
        </div>
      </div>

      {/* Permission Check */}
      {!canCreateChangeset && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-medium"> Limited Access</p>
          <p className="text-yellow-600 text-sm mt-1">
            You do not have write permission to create and publish changesets. Contact your repository administrator to request access.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Existing Changesets Warning */}
      {existingChangesets.length > 0 && currentStep === 'select' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 font-medium">
            {existingChangesets.length} unpublished changeset(s) detected
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Consider reviewing existing changesets before creating new ones
          </p>
        </div>
      )}

      {/* Step Content */}
      {currentStep === 'select' && !canCreateChangeset && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">🚫 Access Denied</p>
          <p className="text-red-600 text-sm mt-1">
            You do not have write permission to create changesets. Contact your repository administrator.
          </p>
        </div>
      )}

      {currentStep === 'select' && canCreateChangeset && (
        <PackageSelector
          packages={allPackages}
          onConfirm={handlePackagesSelected}
          loading={loading}
        />
      )}

      {currentStep === 'bump' && canCreateChangeset && (
        <VersionBumpSelector
          packages={selectedPackages}
          onConfirm={handleVersionBumpsConfirmed}
          onBack={() => setCurrentStep('select')}
        />
      )}

      {currentStep === 'preview' && canCreateChangeset && (
        <ChangesetPreview
          packages={selectedPackages}
          existingChangesets={existingChangesets}
          onConfirm={handlePreviewConfirmed}
          onBack={() => setCurrentStep('select')}
          loading={loading}
        />
      )}

      {currentStep === 'validate' && !canPublish && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">🚫 Access Denied</p>
          <p className="text-red-600 text-sm mt-1">
            You do not have maintain permission to publish changesets. Contact your repository administrator.
          </p>
        </div>
      )}
      {currentStep === 'validate' && canPublish && validationResult && (
        <ReleaseValidation
          validation={validationResult}
          packages={selectedPackages}
          onConfirm={handlePublishConfirmed}
          onBack={() => setCurrentStep('preview')}
          loading={loading}
        />
      )}

      {currentStep === 'confirm' && (
        <PublishConfirmation
          packages={selectedPackages}
          summary={changesetSummary}
          onReset={handleReset}
        />
      )}

      {/* Progress Indicator */}
      <div className="flex gap-2 justify-center">
        {['select', 'bump', 'preview', 'validate', 'confirm'].map((step, index) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-full transition-colors ${
              ['select', 'bump', 'preview', 'validate', 'confirm'].indexOf(currentStep) >= index
                ? 'bg-primary-500'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
