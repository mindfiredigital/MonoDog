import { GraphVisualizationProps } from '../types/dependency.types';
import {
  getStatusColor,
  getTypeColor,
  formatPackageName,
} from '../utils/dependency.utils';

export default function GraphVisualization({
  packages,
  selectedPackage,
  hoveredPackage,
  onPackageSelect,
  onPackageHover,
  layout,
}: GraphVisualizationProps) {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[600px]">
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 600">
        {/* Render dependency arrows */}
        {packages.map(pkg =>
          Object.keys(pkg.dependencies).map(depName => {
            const dep = packages.find(d => d.name === depName);
            if (!dep) return null;

            const isHighlighted =
              hoveredPackage === pkg.name ||
              hoveredPackage === depName ||
              selectedPackage === pkg.name ||
              selectedPackage === depName;

            return (
              <g key={`${pkg.name}-${depName}`}>
                <defs>
                  <marker
                    id={`arrow-${pkg.name}-${depName}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M0,0 L0,6 L9,3 z"
                      fill={isHighlighted ? '#3B82F6' : '#6B7280'}
                    />
                  </marker>
                </defs>
                <line
                  x1={dep.x + 50}
                  y1={dep.y + 25}
                  x2={pkg.x}
                  y2={pkg.y + 25}
                  stroke={isHighlighted ? '#3B82F6' : '#6B7280'}
                  strokeWidth={isHighlighted ? '3' : '2'}
                  markerEnd={`url(#arrow-${pkg.name}-${depName})`}
                  className="transition-all duration-200"
                  style={{
                    opacity: isHighlighted ? 1 : 0.6,
                  }}
                />
              </g>
            );
          })
        )}

        {/* Render package nodes */}
        {packages.map(pkg => {
          const isSelected = selectedPackage === pkg.name;
          const isHovered = hoveredPackage === pkg.name;
          const isConnected =
            selectedPackage &&
            (Object.keys(pkg.dependencies).includes(selectedPackage) ||
              Object.keys(pkg.dependents).includes(selectedPackage));

          return (
            <g key={pkg.name}>
              <rect
                x={pkg.x}
                y={pkg.y}
                width="100"
                height="50"
                rx="8"
                fill="white"
                stroke={
                  isSelected
                    ? '#3B82F6'
                    : isConnected
                      ? '#10B981'
                      : isHovered
                        ? '#6B7280'
                        : '#E5E7EB'
                }
                strokeWidth={isSelected ? '3' : isConnected ? '2' : '2'}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter:
                    isHovered || isSelected || isConnected
                      ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                      : 'none',
                }}
                onMouseEnter={() => onPackageHover(pkg.name)}
                onMouseLeave={() => onPackageHover(null)}
                onClick={() => onPackageSelect(isSelected ? null : pkg.name)}
              />

              {/* Package name */}
              <text
                x={pkg.x + 50}
                y={pkg.y + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-900 pointer-events-none"
              >
                {formatPackageName(pkg.name)}
              </text>

              {/* Package version */}
              <text
                x={pkg.x + 50}
                y={pkg.y + 35}
                textAnchor="middle"
                className="text-xs fill-gray-500 pointer-events-none"
              >
                v{pkg.version}
              </text>

              {/* Status indicator */}
              <circle
                cx={pkg.x + 85}
                cy={pkg.y + 15}
                r="6"
                fill={
                  pkg.status === 'healthy'
                    ? '#10B981'
                    : pkg.status === 'warning'
                      ? '#F59E0B'
                      : '#EF4444'
                }
                className="pointer-events-none"
              />

              {/* Type indicator */}
              <rect
                x={pkg.x + 5}
                y={pkg.y + 5}
                width="12"
                height="8"
                rx="2"
                fill={
                  pkg.type === 'app'
                    ? '#3B82F6'
                    : pkg.type === 'lib'
                      ? '#8B5CF6'
                      : '#F97316'
                }
                className="pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* No packages state */}
      {packages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No dependencies found
            </h3>
            <p className="text-gray-600">No package dependencies to display.</p>
          </div>
        </div>
      )}
    </div>
  );
}
