import React from 'react';

interface GraphLegendProps {
  show: boolean;
}

export default function GraphLegend({ show }: GraphLegendProps) {
  if (!show) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>

      <div className="space-y-4">
        {/* Package Types */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Package Types
          </h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-blue-500 rounded"></div>
              <span>App</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-purple-500 rounded"></div>
              <span>Library</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-2 bg-orange-500 rounded"></div>
              <span>Tool</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Health Status
          </h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error</span>
            </div>
          </div>
        </div>

        {/* Visual Elements */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Visual Elements
          </h5>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <svg width="16" height="8">
                <line
                  x1="0"
                  y1="4"
                  x2="16"
                  y2="4"
                  stroke="#6B7280"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L9,3 z" fill="#6B7280" />
                  </marker>
                </defs>
              </svg>
              <span>Dependency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 border-2 border-blue-500 rounded bg-white"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 border-2 border-green-500 rounded bg-white"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Interaction Guide */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Interactions
          </h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Click a package to select and view details</div>
            <div>• Hover to highlight connections</div>
            <div>• Use toolbar to change layout and zoom</div>
          </div>
        </div>
      </div>
    </div>
  );
}
