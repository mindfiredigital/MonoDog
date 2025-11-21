import { Link } from 'react-router-dom';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dependencies"
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Dependency Graph</h4>
              <p className="text-sm text-gray-600">
                Visualize package relationships
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/health"
          className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Health Check</h4>
              <p className="text-sm text-gray-600">Monitor package health</p>
            </div>
          </div>
        </Link>

        <Link
          to="/ci"
          className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🧪</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">CI/CD Status</h4>
              <p className="text-sm text-gray-600">View build status</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
