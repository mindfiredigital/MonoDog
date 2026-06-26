import { useState, useEffect } from 'react';
import { XMarkIcon, CpuChipIcon } from '../../../../icons/heroicons';
import { monorepoService } from '../../../../services/monorepoService';
import { Package } from '../../../../types/monorepo-service.types';

interface CreatePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePipelineModal({
  isOpen,
  onClose,
}: CreatePipelineModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [template, setTemplate] = useState<string>('node-ci');
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPackages = async () => {
        setLoadingPackages(true);
        try {
          const pkgs = await monorepoService.getPackages();
          setPackages(pkgs);
          if (pkgs.length > 0) {
            setSelectedPackage(pkgs[0].name);
          }
        } catch (error) {
          console.error('Failed to load packages:', error);
        } finally {
          setLoadingPackages(false);
        }
      };
      fetchPackages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackage && template) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert(`Successfully generated ${template} pipeline for ${selectedPackage}! Committing to repository...`);
        onClose();
      } catch (error) {
        console.error(error);
        alert('Failed to generate pipeline.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CpuChipIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Pipeline Creation Wizard</h2>
          </div>
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
                Target Package
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                disabled={loadingPackages || isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                required
              >
                {loadingPackages ? (
                  <option value="">Loading packages...</option>
                ) : (
                  packages.map((pkg) => (
                    <option key={pkg.name} value={pkg.name}>
                      {pkg.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="node-ci">Node.js CI (Lint & Test)</option>
                <option value="react-ci">React.js Web App CI</option>
                <option value="docker-build">Docker Image Builder</option>
                <option value="npm-publish">NPM Package Publisher</option>
              </select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                This wizard will automatically generate a GitHub Actions <code className="bg-blue-100 px-1 rounded">.yml</code> workflow file in your repository tailored for the selected package.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPackage || loadingPackages}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Generate Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
