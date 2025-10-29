import { Link } from 'react-router-dom';
import { Package } from '../Dashboard';

interface PackageTableProps {
  packages: Package[];
  getTypeIcon: (type: string) => string;
  getStatusColor: (type: string) => string;
}

export default function PackageTable({
  packages,
  getTypeIcon,
  getStatusColor,
}: PackageTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Package
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dependencies
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
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
                  <div className="text-2xl mr-3">{getTypeIcon(pkg.type)}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {pkg.name}
                    </div>
                    <div className="text-sm text-gray-500">{pkg.path}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.type)}`}
                >
                  {pkg.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {pkg.version}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {Object.keys(pkg.dependencies).length +
                  Object.keys(pkg.devDependencies).length +
                  Object.keys(pkg.peerDependencies).length}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {pkg.description || 'No description'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/packages/${pkg.name}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
