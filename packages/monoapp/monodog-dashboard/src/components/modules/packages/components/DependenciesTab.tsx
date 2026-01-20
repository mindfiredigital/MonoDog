import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { PackageDetail } from '../types/packages.types';
import { getDependencyStatusColor } from '../utils/packages.utils';

interface DependenciesTabProps {
  packageData: PackageDetail;
}

export default function DependenciesTab({ packageData }: DependenciesTabProps) {
  if (!packageData.dependenciesInfo.length) {
    return <p className="py-6 text-gray-600">No dependency found.</p>;
  }
  const renderDependencyTable = (
    dependencies: PackageDetail['dependenciesInfo'],
    title: string
  ) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dependencies.map(dep => (
              <tr key={dep.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {dep.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-700">
                    {dep.version}
                  </span>
                </td>
                <td className="hidden px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-700">
                    {dep.latest}
                  </span>
                </td>
                <td className="hidden px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDependencyStatusColor(dep.status)}`}
                  >
                    {dep.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="hidden px-6 py-4 whitespace-nowrap text-sm">
                  {dep.status !== 'up-to-date' && (
                    <button className="text-blue-600 hover:text-blue-500 flex items-center space-x-1">
                      <ArrowUpIcon className="w-4 h-4" />
                      <span>Update</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      {renderDependencyTable(
        packageData.dependenciesInfo.filter(d => d.type == 'dependency'),
        'Dependencies'
      )}
      {renderDependencyTable(
        packageData.dependenciesInfo.filter(d => d.type == 'devDependency'),
        'Dev Dependencies'
      )}
      {renderDependencyTable(
        packageData.dependenciesInfo.filter(d => d.type == 'peerDependency'),
        'Peer Dependencies'
      )}

      {/* Dependency Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Dependency Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">
              Total Dependencies:
            </span>
            <span className="ml-2 text-blue-700">
              {
                packageData.dependenciesInfo.filter(d => d.type == 'dependency')
                  .length
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Dev Dependencies:</span>
            <span className="ml-2 text-blue-700">
              {
                packageData.dependenciesInfo.filter(
                  d => d.type == 'devDependency'
                ).length
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">
              Peer Dependencies:
            </span>
            <span className="ml-2 text-blue-700">
              {
                packageData.dependenciesInfo.filter(
                  d => d.type == 'peerDependency'
                ).length
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Outdated:</span>
            <span className="ml-2 text-blue-700">
              {
                packageData.dependenciesInfo.filter(
                  d => d.status === 'outdated'
                ).length
              }
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Major Updates:</span>
            <span className="ml-2 text-blue-700">
              {
                packageData.dependenciesInfo.filter(
                  d => d.status === 'major-update'
                ).length
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
