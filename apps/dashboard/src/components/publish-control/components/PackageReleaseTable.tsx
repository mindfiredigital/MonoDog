import { TagIcon, ClockIcon } from '../../../icons/heroicons';
import { Package } from '../types/publish.types';
import { getStatusColor, getPublishTypeColor } from '../utils/publish.utils';

interface PackageReleaseTableProps {
  packages: Package[];
  selectedPackage: string;
  onPackageChange: (packageName: string) => void;
}

export default function PackageReleaseTable({
  packages,
  selectedPackage,
  onPackageChange,
}: PackageReleaseTableProps) {
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Package Release Status
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Filter by package:</span>
            <select
              value={selectedPackage}
              onChange={e => onPackageChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Packages</option>
              {[...new Set(packages.map(p => p.name))].map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map(pkg => (
              <tr key={pkg.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <TagIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Object.keys(pkg.dependencies).length} dependencies
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.currentVersion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.nextVersion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPublishTypeColor(pkg.publishType)}`}
                  >
                    {pkg.publishType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}
                  >
                    {pkg.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pkg.commits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {pkg.lastPublished}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {pkg.status === 'ready' && (
                      <button className="text-green-600 hover:text-green-900">
                        Publish
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">
                      Details
                    </button>
                    <button className="text-purple-600 hover:text-purple-900">
                      Changelog
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
