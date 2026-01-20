import { PackageDetail } from '../types/packages.types';
import { getCommitTypeColor, formatDate } from '../utils/packages.utils';

interface RecentCommitsTabProps {
  packageData: PackageDetail;
}

export default function RecentCommitsTab({
  packageData,
}: RecentCommitsTabProps) {
  return (
    <div className="py-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Commits</h3>

      <div className="space-y-4">
        {packageData.commits.map(commit => (
          <div
            key={commit.hash}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCommitTypeColor(commit.type)}`}
                  >
                    {commit.type}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    {commit.hash}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-900 mb-2">
                  {commit.message}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>by {commit.author}</span>
                  <span>{formatDate(commit.date)}</span>
                </div>
              </div>

              <div className="hidden ml-4">
                <button className="text-blue-600 hover:text-blue-500 text-sm">
                  View Diff
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packageData.commits.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📝</div>
          <p className="text-gray-500">No recent commits found</p>
        </div>
      )}

      {/* Commit Summary */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Commit Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-800">Features:</span>
            <span className="ml-2 text-gray-600">
              {packageData.commits.filter(c => c.type === 'feat').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Fixes:</span>
            <span className="ml-2 text-gray-600">
              {packageData.commits.filter(c => c.type === 'fix').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Chores:</span>
            <span className="ml-2 text-gray-600">
              {packageData.commits.filter(c => c.type === 'chore').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Breaking:</span>
            <span className="ml-2 text-gray-600">
              {packageData.commits.filter(c => c.type === 'breaking').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
