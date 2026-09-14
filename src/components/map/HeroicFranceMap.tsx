'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { DEPARTMENT_MAP_PATHS, DepartmentMapPath } from '../../data/franceMapPaths';
import { DEPARTMENTS } from '../../data/departments';
import { REGIONS } from '../../data/regions';
import {
  METROPOLITAN_OUTLINE_PATH,
  REGION_BOUNDARIES,
  getRegionViewBox,
} from '../../data/franceRegionBoundaries';
import { soundManager } from '../../lib/audio';
import { RotateCcw, Search, Compass, ZoomIn, ZoomOut } from 'lucide-react';

const NOUVELLE_AQUITAINE_BOUNDARY_PATH = REGION_BOUNDARIES['75'].path.replaceAll('Z', '');

type MapViewBox = { x: number; y: number; w: number; h: number };
/** CSS-pixel camera — GPU transform, never mutates SVG viewBox during gestures. */
type MapCamera = { scale: number; x: number; y: number };

/** Crop empty SVG margins so metropolitan France fills the stage. */
const FRANCE_DESKTOP: MapViewBox = { x: 152, y: 110, w: 636, h: 570 };
/** Tighter crop on phones — departments render larger for finger taps. */
const FRANCE_MOBILE: MapViewBox = { x: 165, y: 118, w: 610, h: 545 };
const IDF_VIEW: MapViewBox = { x: 380, y: 160, w: 140, h: 140 };

const MIN_CAMERA_SCALE = 1;
const MAX_CAMERA_SCALE = 4.5;
const DEFAULT_CAMERA: MapCamera = { scale: 1, x: 0, y: 0 };

function parseViewBox(raw: string): MapViewBox {
  const [x, y, w, h] = raw.split(/\s+/).map(Number);
  return { x, y, w, h };
}

function formatViewBox(box: MapViewBox): string {
  return `${box.x} ${box.y} ${box.w} ${box.h}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampCssCamera(camera: MapCamera, viewportW: number, viewportH: number): MapCamera {
  const scale = clamp(camera.scale, MIN_CAMERA_SCALE, MAX_CAMERA_SCALE);
  const minX = viewportW * (1 - scale);
  const minY = viewportH * (1 - scale);
  return {
    scale,
    x: clamp(camera.x, minX, 0),
    y: clamp(camera.y, minY, 0),
  };
}

function touchDistance(a: Touch, b: Touch): number {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function touchMidpoint(a: Touch, b: Touch): { x: number; y: number } {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

export interface HeroicFranceMapProps {
  onDepartmentClick?: (code: string) => void;
  onRegionClick?: (regionCode: string) => void;
  interactive?: boolean;
  targetCode?: string | null;
  highlightCodes?: string[];
  feedbackState?: {
    code: string;
    isCorrect: boolean;
  } | null;
  selectionMode?: 'department' | 'region';
  showTargetPin?: boolean;
  showTooltip?: boolean;
  customDeptColors?: Record<string, { fill: string; stroke?: string }>;
  className?: string;
  activeRegion?: string | null;
}

interface DepartmentPathItemProps {
  dept: DepartmentMapPath;
  fill: string;
  stroke: string;
  strokeWidth: number;
  interactive: boolean;
  isHovered: boolean;
  onMouseEnter: (dept: DepartmentMapPath, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: (code: string) => void;
}

// Memoized individual SVG path with physical hover elevation
const DepartmentPathItem = React.memo<DepartmentPathItemProps>(({
  dept,
  fill,
  stroke,
  strokeWidth,
  interactive,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <path
      id={`dept-${dept.code}`}
      d={dept.path}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{
        transition: 'fill 120ms ease, stroke 120ms ease',
      }}
      className={interactive ? 'cursor-pointer' : ''}
      onMouseEnter={(e) => onMouseEnter(dept, e)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(dept.code)}
    />
  );
});
DepartmentPathItem.displayName = 'DepartmentPathItem';

export const HeroicFranceMap: React.FC<HeroicFranceMapProps> = ({
  onDepartmentClick,
  onRegionClick,
  interactive = true,
  targetCode = null,
  highlightCodes = [],
  feedbackState = null,
  selectionMode = 'department',
  showTargetPin,
  showTooltip = false,
  customDeptColors,
  className = '',
  activeRegion = null,
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'auto' | 'france' | 'idf' | 'region'>('auto');
  const [camera, setCamera] = useState<MapCamera>(DEFAULT_CAMERA);
  const [isNarrow, setIsNarrow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef(camera);
  const suppressClickRef = useRef(false);
  const gesturingRef = useRef(false);
  const rafPaintRef = useRef<number | null>(null);
  const gestureRef = useRef<{
    mode: 'pinch' | 'pan';
    startDistance: number;
    startScale: number;
    startX: number;
    startY: number;
    startMidX: number;
    startMidY: number;
    lastClientX: number;
    lastClientY: number;
    moved: boolean;
  } | null>(null);

  cameraRef.current = camera;

  useEffect(() => {
    const syncNarrow = () => setIsNarrow(window.matchMedia('(max-width: 640px)').matches);
    syncNarrow();
    window.addEventListener('resize', syncNarrow);
    return () => window.removeEventListener('resize', syncNarrow);
  }, []);

  useEffect(() => {
    if (activeRegion) {
      setCurrentView('auto');
    }
  }, [activeRegion]);

  const baseViewBox = useMemo((): MapViewBox => {
    if (currentView === 'idf') {
      return IDF_VIEW;
    }
    if ((currentView === 'region' || currentView === 'auto') && activeRegion) {
      return parseViewBox(getRegionViewBox(activeRegion));
    }
    return isNarrow ? FRANCE_MOBILE : FRANCE_DESKTOP;
  }, [currentView, activeRegion, isNarrow]);

  const viewBox = formatViewBox(baseViewBox);
  const isZoomed =
    currentView === 'idf' ||
    ((currentView === 'region' || currentView === 'auto') && Boolean(activeRegion)) ||
    camera.scale > 1.02;

  const getViewportSize = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return { w: 1, h: 1 };
    return { w: viewport.clientWidth || 1, h: viewport.clientHeight || 1 };
  }, []);

  const paintCamera = useCallback((next: MapCamera) => {
    const { w, h } = getViewportSize();
    const clamped = clampCssCamera(next, w, h);
    cameraRef.current = clamped;
    if (rafPaintRef.current != null) return;
    rafPaintRef.current = requestAnimationFrame(() => {
      rafPaintRef.current = null;
      const stage = stageRef.current;
      const latest = cameraRef.current;
      if (!stage) return;
      stage.style.transform = `translate3d(${latest.x}px, ${latest.y}px, 0) scale(${latest.scale})`;
    });
  }, [getViewportSize]);

  const commitCamera = useCallback(() => {
    if (rafPaintRef.current != null) {
      cancelAnimationFrame(rafPaintRef.current);
      rafPaintRef.current = null;
    }
    const { w, h } = getViewportSize();
    const latest = clampCssCamera(cameraRef.current, w, h);
    cameraRef.current = latest;
    const stage = stageRef.current;
    if (stage) {
      stage.style.transform = `translate3d(${latest.x}px, ${latest.y}px, 0) scale(${latest.scale})`;
    }
    setCamera(latest);
  }, [getViewportSize]);

  const resetCamera = useCallback(() => {
    cameraRef.current = DEFAULT_CAMERA;
    setCamera(DEFAULT_CAMERA);
    const stage = stageRef.current;
    if (stage) {
      stage.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
    }
  }, []);

  useEffect(() => {
    resetCamera();
  }, [currentView, activeRegion, resetCamera]);

  useLayoutEffect(() => {
    if (gesturingRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`;
  }, [camera]);

  let focusedRegionCode: string | null = null;
  if (currentView === 'idf') {
    focusedRegionCode = '11';
  } else if ((currentView === 'region' || currentView === 'auto') && activeRegion) {
    focusedRegionCode = activeRegion;
  }

  const visibleDepartmentPaths = useMemo(() => {
    if (!focusedRegionCode) return DEPARTMENT_MAP_PATHS;
    const region = REGIONS[focusedRegionCode];
    if (!region) return DEPARTMENT_MAP_PATHS;
    const visibleCodes = new Set(region.departments);
    return DEPARTMENT_MAP_PATHS.filter((dept) => visibleCodes.has(dept.code));
  }, [focusedRegionCode]);

  const renderedDepartmentPaths = useMemo(
    () => focusedRegionCode
      ? visibleDepartmentPaths
      : visibleDepartmentPaths.filter((dept) => !dept.isDrom),
    [focusedRegionCode, visibleDepartmentPaths]
  );

  const hoveredDept = useMemo(() => {
    if (!hoveredCode) return null;
    return DEPARTMENTS[hoveredCode] || null;
  }, [hoveredCode]);

  // Fast O(1) Sets for Region grouping & highlighting
  const hoveredRegionDeptSet = useMemo(() => {
    if (selectionMode !== 'region' || !hoveredCode) return null;
    const regCode = DEPARTMENTS[hoveredCode]?.regionCode;
    if (!regCode || !REGIONS[regCode]) return null;
    return new Set(REGIONS[regCode].departments);
  }, [selectionMode, hoveredCode]);

  const targetRegionDeptSet = useMemo(() => {
    if (selectionMode !== 'region' || !targetCode) return null;
    const reg = REGIONS[targetCode];
    if (!reg) return null;
    return new Set(reg.departments);
  }, [selectionMode, targetCode]);

  const feedbackRegionDeptSet = useMemo(() => {
    if (selectionMode !== 'region' || !feedbackState) return null;
    const reg = REGIONS[feedbackState.code];
    if (!reg) return null;
    return new Set(reg.departments);
  }, [selectionMode, feedbackState]);

  const highlightSet = useMemo(() => new Set(highlightCodes), [highlightCodes]);

  // Target Centroid for Pin marker
  const targetCentroid = useMemo(() => {
    if (!targetCode) return null;

    if (selectionMode === 'region') {
      const reg = REGIONS[targetCode];
      if (!reg || !reg.departments || reg.departments.length === 0) return null;
      const deptPaths = DEPARTMENT_MAP_PATHS.filter((d) => reg.departments.includes(d.code));
      if (deptPaths.length === 0) return null;
      const sumX = deptPaths.reduce((acc, d) => acc + d.centroid[0], 0);
      const sumY = deptPaths.reduce((acc, d) => acc + d.centroid[1], 0);
      return [sumX / deptPaths.length, sumY / deptPaths.length];
    }

    const p = DEPARTMENT_MAP_PATHS.find((d) => d.code === targetCode);
    return p ? p.centroid : null;
  }, [targetCode, selectionMode]);

  // Tooltip position update
  const updateTooltipPosition = (x: number, y: number) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate3d(${x}px, ${y - 50}px, 0) translate(-50%, -100%)`;
    }
  };

  const handleMouseEnter = useCallback((dept: DepartmentMapPath, e: React.MouseEvent) => {
    if (!interactive || gesturingRef.current) return;
    if (window.matchMedia('(hover: none)').matches) return;
    setHoveredCode(dept.code);
    updateTooltipPosition(e.clientX, e.clientY);
  }, [interactive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    updateTooltipPosition(e.clientX, e.clientY);
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCode(null);
  }, []);

  const handleClick = useCallback((code: string) => {
    if (!interactive) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (selectionMode === 'region') {
      const dept = DEPARTMENTS[code];
      if (dept && onRegionClick) {
        onRegionClick(dept.regionCode);
      }
    } else if (onDepartmentClick) {
      onDepartmentClick(code);
    }
  }, [interactive, selectionMode, onRegionClick, onDepartmentClick]);

  const zoomBy = useCallback((factor: number, focusClient?: { x: number; y: number }) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const current = cameraRef.current;
    const nextScale = clamp(current.scale * factor, MIN_CAMERA_SCALE, MAX_CAMERA_SCALE);
    if (nextScale === current.scale) return;

    const fx = focusClient
      ? focusClient.x - rect.left
      : rect.width / 2;
    const fy = focusClient
      ? focusClient.y - rect.top
      : rect.height / 2;

    const contentX = (fx - current.x) / current.scale;
    const contentY = (fy - current.y) / current.scale;
    const next = clampCssCamera(
      {
        scale: nextScale,
        x: fx - contentX * nextScale,
        y: fy - contentY * nextScale,
      },
      rect.width,
      rect.height
    );
    cameraRef.current = next;
    const stage = stageRef.current;
    if (stage) {
      stage.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
    }
    setCamera(next);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onTouchStart = (event: TouchEvent) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      if (event.touches.length === 2) {
        event.preventDefault();
        const [a, b] = [event.touches[0], event.touches[1]];
        const mid = touchMidpoint(a, b);
        const rect = viewport.getBoundingClientRect();
        const current = cameraRef.current;
        gesturingRef.current = true;
        setHoveredCode(null);
        gestureRef.current = {
          mode: 'pinch',
          startDistance: Math.max(touchDistance(a, b), 1),
          startScale: current.scale,
          startX: current.x,
          startY: current.y,
          startMidX: mid.x - rect.left,
          startMidY: mid.y - rect.top,
          lastClientX: mid.x,
          lastClientY: mid.y,
          moved: false,
        };
        suppressClickRef.current = true;
        return;
      }

      if (event.touches.length === 1 && cameraRef.current.scale > 1.02) {
        const t = event.touches[0];
        gestureRef.current = {
          mode: 'pan',
          startDistance: 0,
          startScale: cameraRef.current.scale,
          startX: cameraRef.current.x,
          startY: cameraRef.current.y,
          startMidX: t.clientX,
          startMidY: t.clientY,
          lastClientX: t.clientX,
          lastClientY: t.clientY,
          moved: false,
        };
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      const viewport = viewportRef.current;
      if (!gesture || !viewport) return;
      const rect = viewport.getBoundingClientRect();

      if (gesture.mode === 'pinch' && event.touches.length === 2) {
        event.preventDefault();
        const [a, b] = [event.touches[0], event.touches[1]];
        const mid = touchMidpoint(a, b);
        const distance = Math.max(touchDistance(a, b), 1);
        const nextScale = clamp(
          gesture.startScale * (distance / gesture.startDistance),
          MIN_CAMERA_SCALE,
          MAX_CAMERA_SCALE
        );
        const fx = mid.x - rect.left;
        const fy = mid.y - rect.top;
        const contentX = (gesture.startMidX - gesture.startX) / gesture.startScale;
        const contentY = (gesture.startMidY - gesture.startY) / gesture.startScale;
        gesture.moved = true;
        suppressClickRef.current = true;
        paintCamera({
          scale: nextScale,
          x: fx - contentX * nextScale,
          y: fy - contentY * nextScale,
        });
        return;
      }

      if (gesture.mode === 'pan' && event.touches.length === 1) {
        const t = event.touches[0];
        const totalDx = t.clientX - gesture.startMidX;
        const totalDy = t.clientY - gesture.startMidY;
        if (Math.hypot(totalDx, totalDy) > 8) {
          gesture.moved = true;
          gesturingRef.current = true;
          suppressClickRef.current = true;
          event.preventDefault();
        }
        if (!gesture.moved) return;

        const dx = t.clientX - gesture.lastClientX;
        const dy = t.clientY - gesture.lastClientY;
        gesture.lastClientX = t.clientX;
        gesture.lastClientY = t.clientY;
        paintCamera({
          scale: cameraRef.current.scale,
          x: cameraRef.current.x + dx,
          y: cameraRef.current.y + dy,
        });
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 1 && cameraRef.current.scale > 1.02) {
        const t = event.touches[0];
        gestureRef.current = {
          mode: 'pan',
          startDistance: 0,
          startScale: cameraRef.current.scale,
          startX: cameraRef.current.x,
          startY: cameraRef.current.y,
          startMidX: t.clientX,
          startMidY: t.clientY,
          lastClientX: t.clientX,
          lastClientY: t.clientY,
          moved: true,
        };
        return;
      }
      if (event.touches.length > 0) return;

      const moved = Boolean(gestureRef.current?.moved);
      gestureRef.current = null;
      gesturingRef.current = false;
      commitCamera();
      if (moved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 120);
      }
    };

    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd);
    node.addEventListener('touchcancel', onTouchEnd);

    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
      node.removeEventListener('touchcancel', onTouchEnd);
      if (rafPaintRef.current != null) {
        cancelAnimationFrame(rafPaintRef.current);
      }
    };
  }, [paintCamera, commitCamera]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (!interactive) return;
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomBy(factor, { x: event.clientX, y: event.clientY });
  }, [interactive, zoomBy]);

  // Compute styling for a department path
  const getDepartmentStyle = useCallback((deptCode: string) => {
    const isHoveredDept = hoveredCode === deptCode;
    const isHoveredReg = hoveredRegionDeptSet?.has(deptCode) ?? false;
    const isTargetDept = selectionMode === 'department' && targetCode === deptCode;
    const isTargetReg = targetRegionDeptSet?.has(deptCode) ?? false;
    const isHighlighted = highlightSet.has(deptCode);

    // FEEDBACK REVEAL STATE (after question answered)
    if (feedbackState) {
      const isClickedMatch =
        selectionMode === 'region'
          ? (feedbackRegionDeptSet?.has(deptCode) ?? false)
          : feedbackState.code === deptCode;

      if (isClickedMatch) {
        if (feedbackState.isCorrect) {
          return {
            fill: '#2F8F62', // Lush Emerald Sage
            stroke: '#1E6B47',
            strokeWidth: 2.2,
          };
        } else {
          return {
            fill: '#DC5D52', // Terracotta Coral
            stroke: '#B83E34',
            strokeWidth: 2.2,
          };
        }
      }

      // Reveal true target in honey
      if (!feedbackState.isCorrect && (isTargetDept || isTargetReg)) {
        return {
          fill: '#F5B738', // Warm Honey
          stroke: '#C47D0B',
          strokeWidth: 2.4,
        };
      }
    }

    // In interactive mode before answering, do NOT reveal target
    const canRevealTarget = feedbackState !== null;
    if (canRevealTarget && (isTargetDept || isTargetReg)) {
      return {
        fill: '#FCE5BC',
        stroke: '#E8A317',
        strokeWidth: 2,
      };
    }

    // Hover state: warm terracotta lift
    if (isHoveredDept || isHoveredReg) {
      return {
        fill: '#FDE8DC', // Warm terracotta glow
        stroke: '#D96B43',
        strokeWidth: 1.8,
      };
    }

    // Highlighted (e.g. QCM related codes)
    if (isHighlighted) {
      return {
        fill: '#DDF0F7', // Soft coastal azure
        stroke: '#3B8AA8',
        strokeWidth: 1.4,
      };
    }

    // Custom department colors (e.g. Mastery Map Heatmap)
    if (customDeptColors && customDeptColors[deptCode]) {
      const c = customDeptColors[deptCode];
      if (isHoveredDept || isHoveredReg) {
        return {
          fill: c.fill,
          stroke: '#D96B43',
          strokeWidth: 2,
        };
      }
      return {
        fill: c.fill,
        stroke: c.stroke || '#D8CDC2',
        strokeWidth: 0.75,
      };
    }

    // Default resting tactile look: Warm archival linen / fine wood
    return {
      fill: '#FAF7F2',
      stroke: '#D8CDC2', // Fine laser cut between intra-regional departments
      strokeWidth: 0.75,
    };
  }, [
    hoveredCode,
    hoveredRegionDeptSet,
    selectionMode,
    targetCode,
    targetRegionDeptSet,
    highlightSet,
    feedbackState,
    feedbackRegionDeptSet,
    interactive,
    customDeptColors,
  ]);

  const shouldShowPin = Boolean(
    targetCentroid &&
    (showTargetPin !== undefined
      ? showTargetPin
      : feedbackState !== null)
  );

  const activeRegionName = activeRegion ? REGIONS[activeRegion]?.name : null;

  return (
    <div
      ref={containerRef}
      className={`relative max-w-[760px] mx-auto select-none flex items-center justify-center touch-none ${className || 'w-full aspect-square'}`}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      {/* Tactical Floating Controls (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-30 flex max-w-[calc(100%-1.75rem)] flex-wrap items-center gap-2 rounded-2xl border-2 border-clay-border/80 bg-white/95 p-2 shadow-soft backdrop-blur-md">
        {/* Regional Framing Toggle (if activeRegion provided) */}
        {activeRegion && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(420);
              setCurrentView((v) => (v === 'region' || (v === 'auto' && activeRegion) ? 'france' : 'region'));
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer ${
              currentView === 'region' || (currentView === 'auto' && Boolean(activeRegion))
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-creme-100 hover:bg-creme-200 text-clay'
            }`}
            title="Cadrer automatiquement sur la région en cours ou voir la France entière"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="max-w-[130px] truncate">
              {currentView === 'region' || (currentView === 'auto' && Boolean(activeRegion))
                ? `Région : ${activeRegionName}`
                : 'Cadrer Région'}
            </span>
          </button>
        )}

        {/* Paris / IDF Loupe Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick(400);
            setCurrentView((v) => (v === 'idf' ? (activeRegion ? 'region' : 'france') : 'idf'));
          }}
          className={`flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-display font-bold transition cursor-pointer ${
            currentView === 'idf'
              ? 'bg-terracotta text-white shadow-sm'
              : 'bg-creme-100 hover:bg-creme-200 text-clay'
          }`}
          title="Zoomer sur Paris / Île-de-France pour cliquer facilement sur les petits départements"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{currentView === 'idf' ? 'IDF ✕' : 'Loupe IDF'}</span>
        </button>

        <div className="flex items-center gap-0.5 rounded-xl border border-clay-border/70 bg-creme-100/80 p-0.5">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(380);
              zoomBy(1 / 1.25);
            }}
            disabled={camera.scale <= MIN_CAMERA_SCALE + 0.01}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-clay transition enabled:hover:bg-white disabled:opacity-40"
            title="Dézoomer"
            aria-label="Dézoomer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(420);
              zoomBy(1.25);
            }}
            disabled={camera.scale >= MAX_CAMERA_SCALE - 0.01}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-clay transition enabled:hover:bg-white disabled:opacity-40"
            title="Zoomer"
            aria-label="Zoomer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Reset Camera to Full France */}
        {isZoomed && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(380);
              resetCamera();
              setCurrentView('france');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-creme-100 text-clay transition hover:bg-creme-200 cursor-pointer"
            title="Revenir à la vue générale France métropolitaine"
            aria-label="Réinitialiser le zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* GPU camera: fixed SVG viewBox + CSS translate3d/scale on the stage */}
      <div
        ref={viewportRef}
        className="absolute inset-0 overflow-hidden [contain:strict]"
      >
        <div
          ref={stageRef}
          className="h-full w-full will-change-transform [backface-visibility:hidden]"
          style={{ transformOrigin: '0 0' }}
        >
          <svg
            viewBox={viewBox}
            preserveAspectRatio={isNarrow ? 'xMidYMid slice' : 'xMidYMid meet'}
            className="h-full w-full overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
          >
        <defs>
          {/* Warm Ambient Drop-Shadow under the whole 3D Plateau */}
          <filter id="plateau-shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#4F3622" floodOpacity="0.16" />
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3D291C" floodOpacity="0.09" />
          </filter>

          {/* Medallion ambient shadow */}
          <filter id="medallion-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#403020" floodOpacity="0.12" />
          </filter>

          {/* Excludes the overseas inset geometry embedded in the outline source. */}
          <clipPath id="metropolitan-clip">
            <rect x="145" y="80" width="655" height="650" />
          </clipPath>
        </defs>

        {!focusedRegionCode && (
          <>
            {/* 1. SOFT MARITIME SHORELINE (Atlantic, Channel, Mediterranean coastal glow) */}
            <g id="maritime-shoreline" pointerEvents="none" clipPath="url(#metropolitan-clip)">
              <path
                d={METROPOLITAN_OUTLINE_PATH}
                fill="none"
                stroke="#8EC3D2"
                strokeWidth="12"
                strokeOpacity="0.16"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={METROPOLITAN_OUTLINE_PATH}
                fill="none"
                stroke="#5A9FB4"
                strokeWidth="5.5"
                strokeOpacity="0.25"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={METROPOLITAN_OUTLINE_PATH}
                fill="none"
                stroke="#36798E"
                strokeWidth="1.8"
                strokeOpacity="0.38"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>

            {/* 2. PHYSICAL PLATEAU BASE (3D wood/cardboard underlay under metropolitan France) */}
            <path
              d={METROPOLITAN_OUTLINE_PATH}
              fill="#ECE4D8"
              filter="url(#plateau-shadow)"
              pointerEvents="none"
              clipPath="url(#metropolitan-clip)"
            />
          </>
        )}

        {/* 3. DROM WOODEN / IVORY MEDALLIONS (Guadeloupe, Martinique, Guyane, Réunion, Mayotte) */}
        {focusedRegionCode && currentView !== 'idf' &&
          visibleDepartmentPaths.filter((d) => d.isDrom && d.insetBox).map((d) => {
            const b = d.insetBox!;
            const deptInfo = DEPARTMENTS[d.code];
            const isTarget =
              selectionMode === 'department'
                ? targetCode === d.code
                : targetCode !== null && deptInfo?.regionCode === targetCode;
            const canReveal = feedbackState !== null;
            const isHighlightedDrom = canReveal && isTarget;
            const isHoveredDrom = hoveredCode === d.code;

            return (
              <g
                key={`drom-medallion-${d.code}`}
                className="cursor-pointer transition-all duration-150"
                onClick={() => handleClick(d.code)}
                onMouseEnter={(e) => handleMouseEnter(d, e)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Medallion Plaque Backing */}
                <rect
                  x={b.x - 4}
                  y={b.y - 4}
                  width={b.w + 8}
                  height={b.h + 8}
                  rx={12}
                  fill={isHighlightedDrom ? '#FEF7EB' : isHoveredDrom ? '#FDF4ED' : '#FAF6F0'}
                  stroke={
                    isHighlightedDrom
                      ? '#E8A317'
                      : isHoveredDrom
                      ? '#D96B43'
                      : '#D8CDC2'
                  }
                  strokeWidth={isHighlightedDrom || isHoveredDrom ? 2 : 1.2}
                  filter="url(#medallion-shadow)"
                />

                {/* Inner Bevel Border */}
                <rect
                  x={b.x - 2}
                  y={b.y - 2}
                  width={b.w + 4}
                  height={b.h + 4}
                  rx={10}
                  fill="none"
                  stroke={isHighlightedDrom ? '#FCE3B4' : '#EFE9DE'}
                  strokeWidth={0.8}
                />

                {/* Top Badge: Code & Label */}
                <g transform={`translate(${b.x + b.w / 2}, ${b.y - 7})`}>
                  {/* Numeral Code Pill */}
                  <rect
                    x="-26"
                    y="-11"
                    width="17"
                    height="11"
                    rx="3.5"
                    fill={isHighlightedDrom ? '#FCE5BC' : isHoveredDrom ? '#F8DDD2' : '#ECE4D8'}
                    stroke={isHighlightedDrom ? '#E8A317' : isHoveredDrom ? '#D96B43' : '#D0C4B6'}
                    strokeWidth="0.6"
                  />
                  <text
                    x="-17.5"
                    y="-3"
                    textAnchor="middle"
                    fill="#5A4E46"
                    fontSize="7.5"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="800"
                  >
                    {d.code}
                  </text>

                  {/* Name Label */}
                  <text
                    x="2"
                    y="-3"
                    textAnchor="start"
                    fill={isHighlightedDrom ? '#A86A08' : isHoveredDrom ? '#B8451D' : '#5A4E46'}
                    fontSize="8.5"
                    fontFamily="Outfit, sans-serif"
                    fontWeight="700"
                  >
                    {b.label}
                  </text>
                </g>
              </g>
            );
          })}

        {/* 4. DEPARTMENT PIECES (Memoized paths with 3D hover elevation) */}
        <g id="departments">
          {renderedDepartmentPaths.map((dept) => {
            const style = getDepartmentStyle(dept.code);
            return (
              <DepartmentPathItem
                key={dept.code}
                dept={dept}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                interactive={interactive}
                isHovered={hoveredCode === dept.code}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
            );
          })}
        </g>

        {/* 5. CARVED REGIONAL GROOVES (Deeper engraved regional boundaries) */}
        <g id="regional-grooves" pointerEvents="none">
          {Object.entries(REGION_BOUNDARIES).map(([regCode, regData]) => {
            // Exclude DROMs from regional groove overlay (they have medallions)
            if (['01', '02', '03', '04', '06'].includes(regCode)) return null;
            if (focusedRegionCode && regCode !== focusedRegionCode) return null;

            const isRegHovered =
              hoveredDept?.regionCode === regCode && (selectionMode === 'region' || hoveredRegionDeptSet !== null);
            const isRegTarget =
              selectionMode === 'region' && targetCode === regCode;

            return (
              <g key={`groove-${regCode}`}>
                {/* Soft groove ambient shadow */}
                <path
                  d={regCode === '75' ? NOUVELLE_AQUITAINE_BOUNDARY_PATH : regData.path}
                  fill="none"
                  stroke="#4D3828"
                  strokeWidth={isRegHovered || isRegTarget ? 3.4 : 2.5}
                  strokeOpacity={isRegHovered || isRegTarget ? 0.35 : 0.16}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Carved groove line */}
                <path
                  d={regCode === '75' ? NOUVELLE_AQUITAINE_BOUNDARY_PATH : regData.path}
                  fill="none"
                  stroke={
                    isRegTarget
                      ? '#E8A317'
                      : isRegHovered
                      ? '#D96B43'
                      : '#82705F'
                  }
                  strokeWidth={isRegHovered || isRegTarget ? 2.4 : 1.6}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>

        {/* Hovered piece cloned to top layer for zero-clipping elevation */}
        {hoveredCode && (
          <use
            href={`#dept-${hoveredCode}`}
            pointerEvents="none"
          />
        )}

        {/* 6. 3D ANIMATED BOUNCING PIN ON TARGET CENTROID */}
        {shouldShowPin && targetCentroid && (
          <g transform={`translate(${targetCentroid[0]}, ${targetCentroid[1] - 14})`}>
            {/* Shadow on board */}
            <ellipse
              cx="0"
              cy="16"
              rx="11"
              ry="4.5"
              fill="rgba(44, 30, 20, 0.30)"
              className="animate-pulse"
            />
            {/* 3D Pin Head */}
            <g className="animate-bounce-gentle">
              <path
                d="M 0 15 C -8 7 -11 0 -11 -4 C -11 -10 -6 -15 0 -15 C 6 -15 11 -10 11 -4 C 11 0 8 7 0 15 Z"
                fill={feedbackState?.isCorrect ? '#2F8F62' : '#D96B43'}
                stroke="#FFFFFF"
                strokeWidth="2.2"
                filter="url(#medallion-shadow)"
              />
              <circle cx="0" cy="-4" r="4.2" fill="#FFFFFF" />
            </g>
          </g>
        )}
          </svg>
        </div>
      </div>

      {/* Readable, finger-sized overseas selector in the free south-west corner. */}
      {(!focusedRegionCode || currentView === 'idf') && (
        <div className="absolute bottom-3 left-3 z-20 w-[112px] rounded-xl border border-clay-border/80 bg-white/95 p-2 shadow-soft backdrop-blur-sm sm:bottom-3.5 sm:left-3.5">
          <div className="mb-1.5 text-center font-display text-[9px] font-bold uppercase tracking-wide text-clay-muted">
            Outre-mer
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DEPARTMENT_MAP_PATHS.filter((dept) => dept.isDrom).map((dept) => {
              const style = getDepartmentStyle(dept.code);
              return (
                <button
                  key={`drom-shortcut-${dept.code}`}
                  type="button"
                  disabled={!interactive}
                  aria-label={`${dept.code} — ${dept.nom}`}
                  title={`${dept.code} — ${dept.nom}`}
                  className={`min-h-11 rounded-lg border font-mono text-[11px] font-extrabold transition ${
                    interactive ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
                  }`}
                  style={{
                    backgroundColor: style.fill,
                    borderColor: style.stroke,
                    color: '#5A4E46',
                  }}
                  onMouseEnter={(event) => handleMouseEnter(dept, event)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(dept.code)}
                >
                  {dept.code}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Tactical Cursor Tooltip (only when showTooltip is explicitly true) */}
      {showTooltip && hoveredDept && (
        <div
          ref={tooltipRef}
          className="fixed top-0 left-0 pointer-events-none z-50 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-clay-border/80 shadow-soft text-clay will-change-transform transition-opacity duration-75"
          style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-terracotta-light text-terracotta font-mono text-xs font-bold border border-terracotta/20">
              {selectionMode === 'region' ? hoveredDept.regionCode : hoveredDept.code}
            </span>
            <span className="font-display font-extrabold text-sm text-clay">
              {selectionMode === 'region' ? hoveredDept.regionName : hoveredDept.name}
            </span>
          </div>
          <div className="text-[11px] text-clay-muted mt-0.5 flex items-center gap-1.5 font-medium whitespace-nowrap">
            {selectionMode === 'region' ? (
              <>
                <span>Chef-lieu : <strong>{REGIONS[hoveredDept.regionCode]?.prefecture || hoveredDept.prefecture}</strong></span>
                <span>•</span>
                <span>{REGIONS[hoveredDept.regionCode]?.departments.length || 0} départements</span>
              </>
            ) : (
              <>
                <span>Préfecture : <strong>{hoveredDept.prefecture}</strong></span>
                <span>•</span>
                <span>{hoveredDept.regionName}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
