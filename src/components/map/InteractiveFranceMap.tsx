'use client';

import React, { useState, useMemo } from 'react';
import { DEPARTMENT_MAP_PATHS, DepartmentMapPath } from '../../data/franceMapPaths';
import { DEPARTMENTS } from '../../data/departments';
import { soundManager } from '../../lib/audio';

interface InteractiveFranceMapProps {
  onDepartmentClick?: (code: string) => void;
  selectedCode?: string | null;
  targetCode?: string | null;
  highlightCodes?: string[];
  feedbackState?: {
    code: string;
    isCorrect: boolean;
  } | null;
  interactive?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const InteractiveFranceMap: React.FC<InteractiveFranceMapProps> = ({
  onDepartmentClick,
  selectedCode = null,
  targetCode = null,
  highlightCodes = [],
  feedbackState = null,
  interactive = true,
  className = '',
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const hoveredDept = useMemo(() => {
    if (!hoveredCode) return null;
    return DEPARTMENTS[hoveredCode] || null;
  }, [hoveredCode]);

  const handleMouseEnter = (dept: DepartmentMapPath, e: React.MouseEvent) => {
    if (!interactive) return;
    setHoveredCode(dept.code);
    soundManager.playRadarPing();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCode(null);
  };

  const handleClick = (code: string) => {
    if (!interactive || !onDepartmentClick) return;
    soundManager.playClick();
    onDepartmentClick(code);
  };

  // Get dynamic styling for each department path
  const getPathStyle = (dept: DepartmentMapPath) => {
    const isHovered = hoveredCode === dept.code;
    const isSelected = selectedCode === dept.code;
    const isTarget = targetCode === dept.code;
    const isHighlighted = highlightCodes.includes(dept.code);

    // Feedback priority
    if (feedbackState && feedbackState.code === dept.code) {
      if (feedbackState.isCorrect) {
        return {
          fill: '#10b981', // Emerald 500
          stroke: '#34d399',
          strokeWidth: 2.5,
          filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))',
        };
      } else {
        return {
          fill: '#ef4444', // Red 500
          stroke: '#f87171',
          strokeWidth: 2.5,
          filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))',
        };
      }
    }

    // Reveal target if user made an error
    if (feedbackState && !feedbackState.isCorrect && isTarget) {
      return {
        fill: 'rgba(245, 158, 11, 0.75)', // Amber reveal
        stroke: '#fbbf24',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.9))',
      };
    }

    if (isSelected) {
      return {
        fill: '#0284c7', // Sky 600
        stroke: '#38bdf8',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))',
      };
    }

    if (isHighlighted) {
      return {
        fill: 'rgba(16, 185, 129, 0.35)',
        stroke: '#34d399',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.5))',
      };
    }

    if (isHovered) {
      return {
        fill: 'rgba(56, 189, 248, 0.35)',
        stroke: '#38bdf8',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))',
      };
    }

    // Default resting state: dark slate with subtle blueprint lines
    return {
      fill: 'rgba(24, 34, 53, 0.75)',
      stroke: 'rgba(71, 85, 105, 0.45)',
      strokeWidth: 0.9,
    };
  };

  return (
    <div 
      className={`relative w-full aspect-square max-w-[760px] mx-auto select-none ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background Topo & Radar Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none rounded-2xl" />

      {/* Cartographic Compass Rose / Coordinates HUD */}
      <div className="absolute top-3 left-4 flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400/70 pointer-events-none z-10 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/20">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>RGF93 / LAMBERT-93 • 46°N 02°E</span>
      </div>

      {/* DROM Inset Legend Box */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-10 bg-slate-950/70 backdrop-blur-md p-2 rounded-lg border border-slate-800 text-[11px] text-slate-400">
        <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
          DROM (Outre-Mer)
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <div><span className="text-emerald-400 font-mono">971</span> Gpe</div>
          <div><span className="text-emerald-400 font-mono">972</span> Mtq</div>
          <div><span className="text-emerald-400 font-mono">973</span> Guy</div>
          <div><span className="text-emerald-400 font-mono">974</span> Réu</div>
          <div className="col-span-2"><span className="text-emerald-400 font-mono">976</span> Mayotte</div>
        </div>
      </div>

      {/* SVG Map Container */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Subtle grid backdrop inside SVG */}
        <rect width="800" height="800" fill="url(#mapGrid)" rx="16" />

        {/* DROM Inset Frames & Visual Boxes */}
        {DEPARTMENT_MAP_PATHS.filter(d => d.isDrom && d.insetBox).map(d => {
          const b = d.insetBox!;
          return (
            <g key={`inset-${d.code}`} className="pointer-events-none">
              <rect
                x={b.x - 3}
                y={b.y - 3}
                width={b.w + 6}
                height={b.h + 6}
                rx={6}
                fill="rgba(15, 23, 42, 0.65)"
                stroke="rgba(51, 65, 85, 0.7)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={b.x + b.w / 2}
                y={b.y - 6}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {b.label} ({d.code})
              </text>
            </g>
          );
        })}

        {/* Department Paths */}
        <g id="departments-layer">
          {DEPARTMENT_MAP_PATHS.map((dept) => {
            const style = getPathStyle(dept);
            return (
              <path
                key={dept.code}
                id={`dept-${dept.code}`}
                d={dept.path}
                style={style}
                className={`transition-all duration-150 ${interactive ? 'cursor-pointer hover:opacity-90' : ''}`}
                onMouseEnter={(e) => handleMouseEnter(dept, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(dept.code)}
              />
            );
          })}
        </g>

        {/* Centroid Numbers or Labels (active when selected or feedback) */}
        {feedbackState && (
          <circle
            cx={DEPARTMENT_MAP_PATHS.find(d => d.code === feedbackState.code)?.centroid[0] || 0}
            cy={DEPARTMENT_MAP_PATHS.find(d => d.code === feedbackState.code)?.centroid[1] || 0}
            r={14}
            fill={feedbackState.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
            stroke={feedbackState.isCorrect ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            className="animate-ping"
          />
        )}
      </svg>

      {/* Floating Tactical Tooltip */}
      {interactive && hoveredDept && (
        <div
          className="fixed pointer-events-none z-50 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-emerald-500/40 shadow-xl shadow-black/60 text-white transform -translate-x-1/2 -translate-y-14 transition-transform duration-75"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              {hoveredDept.code}
            </span>
            <span className="font-semibold text-sm tracking-wide text-slate-100">
              {hoveredDept.name}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
            <span>Préfecture : <strong className="text-slate-200">{hoveredDept.prefecture}</strong></span>
            <span>•</span>
            <span>{hoveredDept.regionName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
