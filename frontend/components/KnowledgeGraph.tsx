'use client';

import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import { graphApi } from '@/lib/api';

interface KnowledgeGraphProps {
  onNodeClick?: (nodeId: string, nodeLabel: string, nodeType: string) => void;
  highlightedNodes?: string[];
}

export default function KnowledgeGraph({ onNodeClick, highlightedNodes = [] }: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    // Update highlighted nodes
    if (cyRef.current && highlightedNodes.length > 0) {
      cyRef.current.nodes().removeClass('highlighted');
      highlightedNodes.forEach(nodeId => {
        cyRef.current?.getElementById(nodeId).addClass('highlighted');
      });
    }
  }, [highlightedNodes]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const data = await graphApi.getGraph();
      
      if (containerRef.current) {
        initializeGraph(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  const initializeGraph = (data: any) => {
    if (!containerRef.current) return;

    // Color scheme for different node types
    const nodeColors = {
      project: '#3b82f6',  // blue
      skill: '#10b981',     // green
      experience: '#f59e0b' // amber
    };

    const elements = [
      // Nodes
      ...data.nodes.map((node: any) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          ...node
        },
        classes: node.type
      })),
      // Edges
      ...data.edges.map((edge: any) => ({
        data: {
          source: edge.source,
          target: edge.target,
          label: edge.relationship
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': (ele: NodeSingular) => nodeColors[ele.data('type') as keyof typeof nodeColors] || '#6b7280',
            'color': '#fff',
            'text-outline-color': (ele: NodeSingular) => nodeColors[ele.data('type') as keyof typeof nodeColors] || '#6b7280',
            'text-outline-width': 2,
            'font-size': '12px',
            'width': '60px',
            'height': '60px',
            'font-weight': 'bold'
          }
        },
        {
          selector: 'node.project',
          style: {
            'shape': 'round-rectangle',
            'width': '80px',
            'height': '50px'
          }
        },
        {
          selector: 'node.skill',
          style: {
            'shape': 'ellipse',
            'width': '70px',
            'height': '70px'
          }
        },
        {
          selector: 'node.experience',
          style: {
            'shape': 'diamond',
            'width': '75px',
            'height': '75px'
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': '4px',
            'border-color': '#ec4899',
            'border-style': 'solid',
            'background-color': '#ec4899'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': '3px',
            'border-color': '#ffffff',
            'overlay-opacity': 0.2,
            'overlay-color': '#000'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5
          }
        },
        {
          selector: 'edge[label]',
          style: {
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'color': '#64748b'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        componentSpacing: 100,
        nodeOverlap: 20,
        idealEdgeLength: (edge: any) => 100,
        edgeElasticity: (edge: any) => 100,
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      minZoom: 0.5,
      maxZoom: 2
    });

    // Add click handler
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      if (onNodeClick) {
        onNodeClick(nodeData.id, nodeData.label, nodeData.type);
      }
    });

    // Hover effects
    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      node.style('cursor', 'pointer');
      document.body.style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node', () => {
      document.body.style.cursor = 'default';
    });

    cyRef.current = cy;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadGraph}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="w-full h-full bg-white rounded-xl shadow-inner" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <h3 className="font-semibold text-sm mb-3 text-gray-700">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-gray-600">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span className="text-gray-600">Skills</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rotate-45 bg-amber-600"></div>
            <span className="text-gray-600">Experience</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Click nodes to explore in chat
        </div>
      </div>
    </div>
  );
}
