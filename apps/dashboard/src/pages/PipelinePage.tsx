import { useState } from 'react';
import ReleasePipeline from '../components/release-pipeline/ReleasePipeline';
import CIIntegration from '../components/modules/ci-integration/CIIntegration';
import { ArrowPathIcon } from '../icons/heroicons';

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState<'ci' | 'release'>('ci');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Level Navigation Tabs */}
      <div className="border-b border-gray-200 flex items-center justify-between">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('ci')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'ci'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            CI/CD Workflows
          </button>
          <button
            onClick={() => setActiveTab('release')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'release'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Release Pipelines
          </button>
        </nav>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex items-center space-x-2 my-2 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'ci' ? <CIIntegration /> : <ReleasePipeline />}
      </div>
    </div>
  );
}
