
import React, { useEffect, useRef, useState } from 'react';
import { SkillNode, SkillStatus } from '../types';

interface SkillTreeProps {
  nodes: SkillNode[];
  onNodeClick: (node: SkillNode) => void;
}

interface Connection {
  fromId: string;
  toId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const SkillTree: React.FC<SkillTreeProps> = ({ nodes, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [connections, setConnections] = useState<Connection[]>([]);

  const updateConnections = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: Connection[] = [];

    nodes.forEach((node) => {
      node.dependencies.forEach((depId) => {
        const fromEl = nodeRefs.current[depId];
        const toEl = nodeRefs.current[node.id];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          newConnections.push({
            fromId: depId,
            toId: node.id,
            startX: fromRect.left + fromRect.width / 2 - containerRect.left,
            startY: fromRect.top + fromRect.height / 2 - containerRect.top,
            endX: toRect.left + toRect.width / 2 - containerRect.left,
            endY: toRect.top + toRect.height / 2 - containerRect.top
          });
        }
      });
    });

    setConnections(newConnections);
  };

  useEffect(() => {
    updateConnections();
    
    const resizeObserver = new ResizeObserver(() => {
      updateConnections();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateConnections);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateConnections);
    };
  }, [nodes]);

  return (
    <div 
      ref={containerRef}
      className="relative p-8 overflow-x-hidden min-h-[600px] bg-slate-50 flex flex-col items-center w-full"
    >
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
          </marker>
        </defs>
        {connections.map((conn, i) => {
          const fromNode = nodes.find(n => n.id === conn.fromId);
          const isCompleted = fromNode?.status === SkillStatus.COMPLETED;
          
          return (
            <line
              key={`${conn.fromId}-${conn.toId}-${i}`}
              x1={conn.startX}
              y1={conn.startY}
              x2={conn.endX}
              y2={conn.endY}
              stroke={isCompleted ? "#818cf8" : "#e2e8f0"}
              strokeWidth={isCompleted ? "3" : "2"}
              strokeDasharray={isCompleted ? "0" : "5,5"}
              markerEnd="url(#arrowhead)"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative z-10">
        {nodes.map((node) => {
          const isLocked = node.status === SkillStatus.LOCKED;
          const isCompleted = node.status === SkillStatus.COMPLETED;
          
          return (
            <div 
              key={node.id}
              ref={(el) => { if (el) nodeRefs.current[node.id] = el; }}
              onClick={() => !isLocked && onNodeClick(node)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all cursor-pointer group
                ${isLocked ? 'border-slate-200 bg-slate-100 opacity-60 grayscale cursor-not-allowed' : 'border-white bg-white shadow-md hover:shadow-xl hover:-translate-y-1'}
                ${isCompleted ? 'border-emerald-500 bg-emerald-50' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${isLocked ? 'bg-slate-300' : 'bg-indigo-600 text-white'}
                  ${isCompleted ? 'bg-emerald-500' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-bold">{node.label.charAt(0)}</span>
                  )}
                </div>
                {isLocked && (
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">{node.label}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{node.description}</p>
              
              {!isLocked && !isCompleted && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-indigo-600 tracking-wide uppercase group-hover:translate-x-1 transition-transform inline-block">
                    Unlock Next Use Case →
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
