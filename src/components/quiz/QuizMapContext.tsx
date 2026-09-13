'use client';

import React, { useMemo } from 'react';
import { DEPARTMENT_MAP_PATHS } from '../../data/franceMapPaths';
import { DEPARTMENTS } from '../../data/departments';
import { MapPin } from 'lucide-react';

interface QuizMapContextProps {
  targetCode?: string;
  relatedCodes?: string[];
  isAnswered: boolean;
  isCorrect: boolean;
  className?: string;
}

export const QuizMapContext: React.FC<QuizMapContextProps> = ({
  targetCode,
  relatedCodes = [],
  isAnswered,
  isCorrect,
  className = '',
}) => {
  const targetDept = useMemo(() => {
    if (!targetCode) return null;
    return DEPARTMENTS[targetCode] || null;
  }, [targetCode]);

  const targetCentroid = useMemo(() => {
    if (!targetCode) return null;
    const p = DEPARTMENT_MAP_PATHS.find((d) => d.code === targetCode);
    return p ? p.centroid : null;
  }, [targetCode]);

  return (
    <div className={`relative w-full aspect-square max-w-[560px] mx-auto select-none ${className}`}>
      {/* Background Ambience / Subtle Solar Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,23,0.06)_0%,transparent_75%)] pointer-events-none rounded-3xl" />

      {/* Top Left Badge: Plateau Terroir Indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] font-mono font-medium text-clay-muted bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-clay-border shadow-sm z-10">
        <span className="w-2 h-2 rounded-full bg-honey animate-pulse" />
        <span>Plateau Hexagonal RGF93</span>
      </div>

      {/* Territorial Target Focus Pill (Shown when answered) */}
      {isAnswered && targetDept && (
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-clay-border shadow-md flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
          <span className="px-1.5 py-0.5 rounded-lg bg-terracotta-light text-terracotta font-mono font-bold text-[11px] border border-terracotta/20">
            {targetDept.code}
          </span>
          <span className="font-bold text-clay">{targetDept.name}</span>
          <span className="text-[11px] text-clay-muted">• {targetDept.prefecture}</span>
        </div>
      )}

      {/* SVG Map */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full overflow-visible drop-shadow-[0_15px_30px_rgba(112,87,60,0.08)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#756B64" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* DROM Inset Boxes */}
        {DEPARTMENT_MAP_PATHS.filter((d) => d.isDrom && d.insetBox).map((d) => {
          const b = d.insetBox!;
          const isThisDrom = targetCode === d.code || relatedCodes.includes(d.code);
          return (
            <g key={`drom-box-${d.code}`}>
              <rect
                x={b.x - 3}
                y={b.y - 3}
                width={b.w + 6}
                height={b.h + 6}
                rx={10}
                fill={isThisDrom ? '#FEF7EB' : '#FFFFFF'}
                stroke={isThisDrom ? '#E8A317' : '#E8E0D5'}
                strokeWidth={isThisDrom ? 2 : 1.2}
                filter="url(#softShadow)"
              />
              <text
                x={b.x + b.w / 2}
                y={b.y - 5}
                textAnchor="middle"
                fill={isThisDrom ? '#D96B43' : '#756B64'}
                fontSize="9"
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
              >
                {b.label}
              </text>
            </g>
          );
        })}

        {/* Department Paths */}
        <g id="departments" filter="url(#softShadow)">
          {DEPARTMENT_MAP_PATHS.map((dept) => {
            const isTarget = targetCode === dept.code;
            const isRelated = relatedCodes.includes(dept.code);

            // Nature & Terroir Solaire Palette
            let fill = '#EDF3EF'; // Soft sage linen resting
            let stroke = '#D5E2D9'; // Warm sage-gray border
            let strokeWidth = 0.9;

            if (isAnswered) {
              if (isTarget) {
                fill = isCorrect ? '#48A878' : '#F5A623'; // Sunny Sage or Honey Gold
                stroke = isCorrect ? '#2F8F62' : '#C47D0B';
                strokeWidth = 2.5;
              } else if (isRelated) {
                fill = '#D4EBF3'; // Soft Lagon
                stroke = '#72B5CC';
                strokeWidth = 1.2;
              }
            } else {
              if (isRelated && !isTarget) {
                fill = '#E4F1F6';
                stroke = '#A0CEE0';
                strokeWidth = 1.2;
              }
            }

            return (
              <path
                key={dept.code}
                d={dept.path}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* 3D Bouncing Marker Pin on Target Centroid when Answered */}
        {isAnswered && targetCentroid && (
          <g transform={`translate(${targetCentroid[0]}, ${targetCentroid[1] - 14})`}>
            {/* Soft Shadow on ground */}
            <ellipse
              cx="0"
              cy="16"
              rx="9"
              ry="4"
              fill="rgba(44, 38, 35, 0.2)"
              className="animate-pulse"
            />
            {/* Animated Pin */}
            <g className="animate-bounce-gentle">
              {/* Outer Pin Body */}
              <path
                d="M 0 14 C -7 7 -9 1 -9 -3 C -9 -8 -5 -12 0 -12 C 5 -12 9 -8 9 -3 C 9 1 7 7 0 14 Z"
                fill={isCorrect ? '#2F8F62' : '#D96B43'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Inner Dot */}
              <circle cx="0" cy="-3" r="3.5" fill="#FFFFFF" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
