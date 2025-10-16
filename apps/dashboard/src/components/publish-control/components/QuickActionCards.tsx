import React from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';
import { PublishStats } from '../types/publish.types';

interface QuickActionCardsProps {
  stats: PublishStats;
}

export default function QuickActionCards({ stats }: QuickActionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <PlayIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Ready to Publish
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.readyToPublish}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.inProgress}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Published Today</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.published}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
