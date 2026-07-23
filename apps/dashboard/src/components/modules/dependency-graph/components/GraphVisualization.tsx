import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphVisualizationProps } from '../types/dependency.types';
import { getNodeLayout } from '../utils/dependency.utils';
import PackageNode from './PackageNode';
import { LinkIcon } from '../../../../icons/heroicons';

const nodeTypes = {
  packageNode: PackageNode,
};

export default function GraphVisualization({
  packages,
  selectedPackage,
  hoveredPackage,
  onPackageSelect,
  onPackageHover,
  layout,
}: GraphVisualizationProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = packages.map(pkg => ({
      id: pkg.name,
      type: 'packageNode',
      position: { x: 0, y: 0 },
      data: pkg,
    }));

    const edges: Edge[] = [];
    packages.forEach(pkg => {
      Object.keys(pkg.dependencies || {}).forEach(depName => {
        if (!packages.some(p => p.name === depName)) return;

        edges.push({
          id: `e-${pkg.name}-${depName}`,
          source: pkg.name,
          target: depName,
          animated: true,
          type: 'smoothstep',
          style: { stroke: '#94A3B8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#94A3B8',
          },
        });
      });
    });

    return getNodeLayout(nodes, edges, layout);
  }, [packages, layout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onPackageSelect(selectedPackage === node.id ? null : node.id);
    },
    [selectedPackage, onPackageSelect]
  );

  const onPaneClick = useCallback(() => {
    onPackageSelect(null);
  }, [onPackageSelect]);

  const activePackage = hoveredPackage || selectedPackage;

  useEffect(() => {
    if (!activePackage) {
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          style: { ...n.style, opacity: 1 },
        }))
      );
      setEdges(eds =>
        eds.map(e => ({
          ...e,
          style: {
            ...e.style,
            opacity: 1,
            stroke: '#94A3B8',
            strokeWidth: 2,
          },
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#94A3B8',
          },
          zIndex: 0,
        }))
      );
      return;
    }

    // Find all transitive connections
    const connectedNodeIds = new Set<string>();
    const queue = [activePackage];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!connectedNodeIds.has(current)) {
        connectedNodeIds.add(current);
        initialEdges.forEach(e => {
          if (e.source === current && !connectedNodeIds.has(e.target))
            queue.push(e.target);
        });
      }
    }

    setNodes(nds =>
      nds.map(n => ({
        ...n,
        style: {
          ...n.style,
          opacity: connectedNodeIds.has(n.id) ? 1 : 0.2,
          transition: 'opacity 0.2s ease-in-out',
        },
      }))
    );

    setEdges(eds =>
      eds.map(e => {
        const isConnected =
          connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target);
        return {
          ...e,
          style: {
            ...e.style,
            opacity: isConnected ? 1 : 0.15,
            stroke: isConnected ? '#3B82F6' : '#94A3B8',
            strokeWidth: isConnected ? 3 : 2,
            transition: 'opacity 0.2s, stroke 0.2s, stroke-width 0.2s',
          },
          animated: isConnected,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isConnected ? '#3B82F6' : '#94A3B8',
          },
          zIndex: isConnected ? 10 : 0,
        };
      })
    );
  }, [activePackage, initialEdges, setNodes, setEdges]);

  if (packages.length === 0) {
    return (
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex items-center justify-center">
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
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={(_, node) => onPackageHover(node.id)}
        onNodeMouseLeave={() => onPackageHover(null)}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        translateExtent={[
          [-1000, -1000],
          [4000, 4000],
        ]}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
