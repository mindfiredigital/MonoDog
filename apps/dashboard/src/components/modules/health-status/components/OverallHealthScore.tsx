import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { OverallHealthProps } from '../types/health.types';
import {
  getHealthScoreColor,
  getHealthScoreBgColor,
} from '../utils/health.utils';

export default function OverallHealthScore({
  score,
  trend,
  loading = false,
}: OverallHealthProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />;
      default:
        return <MinusIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getHealthStatus = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg shadow border ${getHealthScoreBgColor(score)}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Overall Health Score
        </h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span
            className={`text-sm font-medium ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {getTrendText()}
          </span>
        </div>
      </div>

      <div className="flex items-baseline space-x-4">
        <div className={`text-4xl font-bold ${getHealthScoreColor(score)}`}>
          {score}%
        </div>
        <div className="text-lg text-gray-600">{getHealthStatus()}</div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              score >= 90
                ? 'bg-green-500'
                : score >= 80
                  ? 'bg-yellow-500'
                  : score >= 70
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Health Status Description */}
      <p className="mt-3 text-sm text-gray-600">
        {score >= 90 &&
          'Your monorepo is in excellent health with all systems running optimally.'}
        {score >= 80 &&
          score < 90 &&
          'Your monorepo is in good health with minor areas for improvement.'}
        {score >= 70 &&
          score < 80 &&
          'Your monorepo health is fair but could benefit from attention to key areas.'}
        {score < 70 &&
          'Your monorepo needs attention. Several critical issues require immediate action.'}
      </p>
    </div>
  );
}
