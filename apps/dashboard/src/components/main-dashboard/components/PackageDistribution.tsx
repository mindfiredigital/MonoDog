import { Package } from '../Dashboard';

interface PackageDistributionProps {
  packages: Package[];
  packageTypes: string[];
  getTypeIcon: (type: string) => string;
}

export default function PackageDistribution({
  packages,
  packageTypes,
  getTypeIcon,
}: PackageDistributionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Package Distribution
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {packageTypes.map(type => (
          <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">{getTypeIcon(type)}</div>
            <div className="text-sm font-medium text-gray-600 capitalize">
              {type}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {packages.filter(p => p.type === type).length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
