import { GraphVisualizationProps } from '../types/dependency.types';
import {
  getStatusColor,
  getTypeColor,
  formatPackageName,
} from '../utils/dependency.utils';
import { LinkIcon } from '../../../../icons/heroicons';

export default function GraphVisualization({
  packages,
  selectedPackage,
  hoveredPackage,
  onPackageSelect,
  onPackageHover,
  layout,
}: GraphVisualizationProps) {
  const getConnectionPoints = (pkg: any, dep: any) => {
    const sourceX = dep.x + 50;
    const sourceY = dep.y + 25;
    let targetX = pkg.x + 50;
    let targetY = pkg.y + 25;

    if (sourceX < pkg.x) {
      targetX = pkg.x;
    } else if (sourceX > pkg.x + 100) {
      targetX = pkg.x + 100;
    } else if (sourceY < pkg.y) {
      targetY = pkg.y;
    } else {
      targetY = pkg.y + 50;
    }

    return { sourceX, sourceY, targetX, targetY };
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[600px]">
      <svg
        className="w-full h-full absolute inset-0"
        viewBox={`-50 -50 ${600} ${600 + 50 * 2}`}
      >
        {/* Render dependency arrows */}
        {packages.map(pkg =>
          Object.keys(pkg.dependencies).map(depName => {
            const dep = packages.find(d => d.name === depName);
            if (!dep) return null;

            const isHighlighted = [pkg.name, depName].some(
              name => name === hoveredPackage || name === selectedPackage
            );

            const { sourceX, sourceY, targetX, targetY } = getConnectionPoints(
              pkg,
              dep
            );

            return (
              <g key={`${pkg.name}-${depName}`}>
                <defs>
                  <marker
                    id={`arrow-${pkg.name}-${depName}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M 0 0 L 10 5 L 0 10 z"
                      fill={isHighlighted ? '#3B82F6' : '#94A3B8'}
                    />
                  </marker>
                </defs>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
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
            <g key={pkg.name} className="select-none">
              {/* Main Card */}
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
                strokeWidth={isSelected ? '3' : '2'}
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

              {/* Status Indicator */}
              <circle
                cx={pkg.x + 90}
                cy={pkg.y + 10}
                r="4"
                fill={
                  pkg.status === 'healthy'
                    ? '#10B981'
                    : pkg.status === 'warning'
                      ? '#F59E0B'
                      : '#EF4444'
                }
                className="pointer-events-none"
              />

              {/* Type Indicator */}
              <rect
                x={pkg.x + 8}
                y={pkg.y + 7}
                width="10"
                height="6"
                rx="1"
                fill={
                  pkg.type === 'app'
                    ? '#3B82F6'
                    : pkg.type === 'lib'
                      ? '#8B5CF6'
                      : '#F97316'
                }
                className="pointer-events-none"
              />

              {/* Package Name */}
              <text
                x={pkg.x + 50}
                y={pkg.y + 26}
                textAnchor="middle"
                className="text-[10px] font-bold fill-gray-900 pointer-events-none"
              >
                {formatPackageName(pkg.name)}
              </text>

              {/* Package Version */}
              <text
                x={pkg.x + 50}
                y={pkg.y + 38}
                textAnchor="middle"
                className="text-[9px] fill-gray-500 pointer-events-none"
              >
                v{pkg.version}
              </text>
            </g>
          );
        })}
      </svg>

      {/* No packages state */}
      {packages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center text-gray-400 text-6xl mb-4">
              <LinkIcon className="w-6 h-6 text-primary-600" />
            </div>
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
