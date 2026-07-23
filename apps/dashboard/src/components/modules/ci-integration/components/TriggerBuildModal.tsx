import { useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon } from '../../../../icons/heroicons';
import { monorepoService } from '../../../../services/monorepoService';
import { Package } from '../../../../types/monorepo-service.types';

interface TriggerBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    packageName: string,
    branch: string,
    workflowFileName: string
  ) => void;
  isLoading: boolean;
}

export default function TriggerBuildModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: TriggerBuildModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [branch, setBranch] = useState<string>('main');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [pkgs, wfs] = await Promise.all([
            monorepoService.getPackages(),
            monorepoService.getAvailableWorkflows(),
          ]);
          setPackages(pkgs);
          if (pkgs.length > 0) {
            setSelectedPackage(pkgs[0].name);
          }
          setWorkflows(wfs);
          if (wfs.length > 0) {
            setSelectedWorkflow(wfs[0].path.split('/').pop() || wfs[0].name);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackage && branch && selectedWorkflow) {
      onSubmit(selectedPackage, branch, selectedWorkflow);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Trigger New Build
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Package
              </label>
              <select
                value={selectedPackage}
                onChange={e => setSelectedPackage(e.target.value)}
                disabled={loadingData || isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                required
              >
                {loadingData ? (
                  <option value="">Loading packages...</option>
                ) : (
                  packages.map(pkg => (
                    <option key={pkg.name} value={pkg.name}>
                      {pkg.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Workflow
              </label>
              <select
                value={selectedWorkflow}
                onChange={e => setSelectedWorkflow(e.target.value)}
                disabled={loadingData || isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                required
              >
                {loadingData ? (
                  <option value="">Loading workflows...</option>
                ) : workflows.length === 0 ? (
                  <option value="">No workflows found in repository</option>
                ) : (
                  workflows.map(wf => {
                    const filename = wf.path.split('/').pop() || wf.name;
                    return (
                      <option key={wf.id || filename} value={filename}>
                        {wf.name} ({filename})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. main, develop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedPackage || loadingData}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Trigger Build
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
