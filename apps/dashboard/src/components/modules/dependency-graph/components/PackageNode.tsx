import { Handle, Position } from '@xyflow/react';
import { getPackageTypeIcon, getStatusColor } from '../utils/dependency.utils';
import { PackageNode as PackageNodeType } from '../types/dependency.types';

export default function PackageNode({
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: {
  data: PackageNodeType;
  targetPosition?: Position;
  sourcePosition?: Position;
}) {
  return (
    <div className="card-interactive w-[320px] h-[120px] p-4 flex flex-col justify-between">
      <Handle
        type="target"
        position={targetPosition}
        className="w-3 h-3 bg-gray-400"
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
            {getPackageTypeIcon(data.type)}
          </div>
          <div>
            <h3
              className="text-sm font-semibold text-gray-900 truncate max-w-[170px]"
              title={data.name}
            >
              {data.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {data.version}
            </p>
          </div>
        </div>
        <span className={getStatusColor(data.status)}>{data.status}</span>
      </div>

      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 mr-1">
            {Object.keys(data.dependencies || {}).length}
          </span>{' '}
          Deps
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 mr-1">
            {data.dependents?.length || 0}
          </span>{' '}
          Users
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  );
}
