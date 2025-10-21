import { DocumentTextIcon, TagIcon } from '@heroicons/react/24/outline';

interface ChangelogEntry {
  id: string;
  packageName: string;
  version: string;
  date: string;
  changes: string[];
  author: string;
  type: 'feature' | 'bugfix' | 'breaking' | 'docs';
}

export default function ChangelogViewer() {
  const mockChangelogs: ChangelogEntry[] = [
    {
      id: '1',
      packageName: 'dashboard',
      version: '1.0.0',
      date: '2024-01-15',
      changes: [
        'Added new dashboard layout',
        'Improved search functionality',
        'Fixed responsive design issues',
      ],
      author: 'team-frontend',
      type: 'feature',
    },
    {
      id: '2',
      packageName: 'backend',
      version: '1.2.0',
      date: '2024-01-14',
      changes: [
        'Added authentication middleware',
        'Implemented rate limiting',
        'Fixed database connection pool',
      ],
      author: 'team-backend',
      type: 'feature',
    },
  ];

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'bugfix':
        return 'bg-blue-100 text-blue-800';
      case 'breaking':
        return 'bg-red-100 text-red-800';
      case 'docs':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Changelogs</h3>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {mockChangelogs.map(changelog => (
            <div key={changelog.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {changelog.packageName} v{changelog.version}
                    </div>
                    <div className="text-sm text-gray-500">
                      {changelog.date} • by {changelog.author}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChangeTypeColor(changelog.type)}`}
                >
                  {changelog.type}
                </span>
              </div>

              <div className="space-y-1">
                {changelog.changes.map((change, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{change}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
