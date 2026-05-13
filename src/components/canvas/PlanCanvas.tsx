'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text } from 'react-konva/lib/ReactKonvaCore';
import 'konva/lib/shapes/Circle';
import 'konva/lib/shapes/Image';
import 'konva/lib/shapes/Line';
import 'konva/lib/shapes/Rect';
import 'konva/lib/shapes/Text';
import type Konva from 'konva';
import { flattenPoints, isNearPoint, polygonCenter, screenPointToCanvasPoint } from '@/lib/canvas/geometry';
import { statusColors } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { Point, Zone } from '@/types/domain';

const today = () => new Date().toISOString().slice(0, 10);
const minScale = 0.05;
const maxScale = 5;
const zoomStep = 1.14;
const miniMapWidth = 210;
const miniMapMaxHeight = 150;

function useFloorplanImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!src) {
        setImage(undefined);
        return;
      }
      const next = new Image();
      next.crossOrigin = 'anonymous';
      next.onload = () => { if (!cancelled) setImage(next); };
      next.src = src;
    }
    void load();
    return () => { cancelled = true; };
  }, [src]);
  return image;
}

export function PlanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const lastFittedFloorplanId = useRef<string>();
  const { floorplans, activeFloorplanId, zones, selectedZoneId, hoveredZoneId, toolMode, setSelectedZone, setHoveredZone, updateZone, addZone } = useProjectStore();
  const [scale, setScale] = useState(0.55);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 1200, height: 720 });
  const [draft, setDraft] = useState<Point[]>([]);
  const floorplan = floorplans.find((item) => item.id === activeFloorplanId);
  const floorplanImage = useFloorplanImage(floorplan?.fileUrl);
  const visibleZones = useMemo(() => zones.filter((zone) => zone.floorplanId === activeFloorplanId), [activeFloorplanId, zones]);
  const selectedZone = useMemo(() => visibleZones.find((zone) => zone.id === selectedZoneId), [selectedZoneId, visibleZones]);

  const fitToScreen = useCallback(() => {
    if (!floorplan) return;
    const nextScale = Math.min(stageSize.width / floorplan.width, stageSize.height / floorplan.height) * 0.92;
    if (Number.isFinite(nextScale) && nextScale > 0) {
      setScale(nextScale);
      setStagePos({ x: (stageSize.width - floorplan.width * nextScale) / 2, y: (stageSize.height - floorplan.height * nextScale) / 2 });
      lastFittedFloorplanId.current = floorplan.id;
    }
  }, [floorplan, stageSize.height, stageSize.width]);

  const zoomAt = useCallback((factor: number, anchor: Point = { x: stageSize.width / 2, y: stageSize.height / 2 }) => {
    setScale((oldScale) => {
      const newScale = Math.min(maxScale, Math.max(minScale, oldScale * factor));
      setStagePos((position) => {
        const canvasPoint = { x: (anchor.x - position.x) / oldScale, y: (anchor.y - position.y) / oldScale };
        return { x: anchor.x - canvasPoint.x * newScale, y: anchor.y - canvasPoint.y * newScale };
      });
      return newScale;
    });
  }, [stageSize.height, stageSize.width]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!floorplan || lastFittedFloorplanId.current === floorplan.id) return;
    fitToScreen();
  }, [fitToScreen, floorplan]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomAt(zoomStep);
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomAt(1 / zoomStep);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomAt]);

  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    if (!floorplan) return;
    event.evt.preventDefault();
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;
    zoomAt(event.evt.deltaY > 0 ? 1 / 1.08 : 1.08, pointer);
  }

  function handleStageClick(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    if (toolMode !== 'draw' || !floorplan) return;
    if (event.target !== event.target.getStage()) return;
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;
    const point = screenPointToCanvasPoint(pointer, { x: stage.x(), y: stage.y() }, scale);
    if (draft.length > 2 && isNearPoint(draft[0], point, 28 / Math.max(scale, 0.05))) {
      const zone: Zone = {
        id: `zone-${crypto.randomUUID()}`,
        floorplanId: floorplan.id,
        name: `Zona ${visibleZones.length + 1}`,
        color: '#4f8cff',
        status: 'not_started',
        progress: 0,
        notes: '',
        responsible: '',
        startDate: today(),
        endDate: today(),
        points: draft,
        checklist: [],
        attachments: [],
        tags: [],
        priority: 'medium'
      };
      void addZone(zone).catch((error) => {
        console.error('No se pudo guardar la zona.', error);
      });
      setDraft([]);
      return;
    }
    setDraft((points) => [...points, point]);
  }

  function handleMiniMapPointer(event: PointerEvent<HTMLButtonElement>) {
    if (!floorplan) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const miniScale = Math.min(miniMapWidth / floorplan.width, miniMapMaxHeight / floorplan.height);
    const canvasPoint = { x: (event.clientX - rect.left) / miniScale, y: (event.clientY - rect.top) / miniScale };
    setStagePos({ x: stageSize.width / 2 - canvasPoint.x * scale, y: stageSize.height / 2 - canvasPoint.y * scale });
  }

  function renderZone(zone: Zone) {
    const isSelected = selectedZoneId === zone.id;
    const isHovered = hoveredZoneId === zone.id;
    const center = polygonCenter(zone.points);
    const fill = toolMode === 'heatmap' ? statusColors[zone.status] : zone.color;
    return <Group key={zone.id} onClick={(event) => { event.cancelBubble = true; setSelectedZone(zone.id); }} onTap={() => setSelectedZone(zone.id)} onMouseEnter={() => setHoveredZone(zone.id)} onMouseLeave={() => setHoveredZone(undefined)}>
      <Line points={flattenPoints(zone.points)} closed fill={fill} opacity={isSelected || isHovered ? 0.42 : 0.24} stroke={statusColors[zone.status]} strokeWidth={isSelected ? 5 : 2} shadowColor={statusColors[zone.status]} shadowBlur={isHovered || isSelected ? 24 : 0} />
      <Text x={center.x - 70} y={center.y - 15} width={140} align="center" text={`${zone.name}\n${zone.progress}%`} fill="white" fontSize={18 / Math.max(scale, 0.45)} fontStyle="700" />
      {isSelected && zone.points.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={8 / Math.max(scale, 0.6)} fill="#ffffff" stroke={statusColors[zone.status]} strokeWidth={3 / Math.max(scale, 0.7)} draggable onDragMove={(event) => {
        const next = zone.points.map((existing, i) => (i === index ? { x: event.target.x(), y: event.target.y() } : existing));
        updateZone(zone.id, { points: next });
      }} />)}
    </Group>;
  }

  const miniMapScale = floorplan ? Math.min(miniMapWidth / floorplan.width, miniMapMaxHeight / floorplan.height) : 1;
  const miniMapSize = floorplan ? { width: floorplan.width * miniMapScale, height: floorplan.height * miniMapScale } : { width: miniMapWidth, height: 118 };
  const viewport = floorplan ? {
    x: Math.max(0, (-stagePos.x / scale) * miniMapScale),
    y: Math.max(0, (-stagePos.y / scale) * miniMapScale),
    width: Math.min(miniMapSize.width, (stageSize.width / scale) * miniMapScale),
    height: Math.min(miniMapSize.height, (stageSize.height / scale) * miniMapScale)
  } : undefined;

  return <div ref={containerRef} className="relative h-full min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian shadow-panel">
    {!floorplan && <div className="absolute inset-0 z-10 grid place-items-center p-6 text-center"><div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-panel backdrop-blur"><p className="text-xs uppercase tracking-[0.28em] text-muted">Canvas listo</p><h2 className="mt-2 text-2xl font-semibold text-white">Sube un plano real para empezar</h2><p className="mt-3 text-sm text-muted">Usa el botón “Subir plano” y carga una imagen PNG, JPG, WebP o PDF. Después selecciona “Dibujar” y cierra el polígono tocando cerca del primer punto.</p></div></div>}
    <Stage ref={stageRef} width={stageSize.width} height={stageSize.height} scaleX={scale} scaleY={scale} x={stagePos.x} y={stagePos.y} draggable={toolMode === 'pan'} onDragEnd={(event) => setStagePos({ x: event.target.x(), y: event.target.y() })} onWheel={handleWheel} onClick={handleStageClick} onTap={handleStageClick} className="touch-none">
      <Layer listening={false}>
        <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#06070a" />
        {floorplan && <Rect x={0} y={0} width={floorplan.width} height={floorplan.height} fill="#10151f" stroke="#2b3446" strokeWidth={2 / Math.max(scale, 0.4)} />}
        {floorplanImage && <KonvaImage image={floorplanImage} x={0} y={0} width={floorplan?.width} height={floorplan?.height} />}
      </Layer>
      <Layer>{visibleZones.map(renderZone)}{draft.length > 0 && <Line points={flattenPoints(draft)} stroke="#36d3ff" strokeWidth={3 / Math.max(scale, 0.7)} dash={[8, 8]} />}{draft.length > 2 && <Line points={flattenPoints([...draft, draft[0]])} stroke="#36d3ff" strokeWidth={1.5 / Math.max(scale, 0.7)} opacity={0.35} dash={[4, 10]} />}{draft.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={(index === 0 ? 11 : 7) / Math.max(scale, 0.7)} fill={index === 0 && draft.length > 2 ? '#ffffff' : '#36d3ff'} stroke="#36d3ff" strokeWidth={index === 0 && draft.length > 2 ? 3 / Math.max(scale, 0.7) : 0} listening={false} />)}</Layer>
    </Stage>
    <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white backdrop-blur">Modo: <b>{toolMode}</b> · Zoom {Math.round(scale * 100)}% · Zonas {visibleZones.length}{toolMode === 'draw' && draft.length > 2 ? <span className="block text-xs text-cyan-100">Toca el primer punto blanco para cerrar la zona.</span> : null}</div>
    <div className="absolute right-4 top-4 flex overflow-hidden rounded-2xl border border-white/10 bg-black/55 text-white shadow-panel backdrop-blur" aria-label="Controles de zoom">
      <button type="button" onClick={() => zoomAt(1 / zoomStep)} className="grid size-10 place-items-center border-r border-white/10 text-xl font-semibold hover:bg-white/10" aria-label="Alejar">−</button>
      <button type="button" onClick={() => zoomAt(zoomStep)} className="grid size-10 place-items-center text-xl font-semibold hover:bg-white/10" aria-label="Acercar">+</button>
      <button type="button" onClick={fitToScreen} className="border-l border-white/10 px-3 text-xs font-semibold uppercase tracking-wide text-muted hover:bg-white/10 hover:text-white">Fit</button>
    </div>
    <div className="absolute bottom-4 right-4 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur">
      {floorplan ? <button type="button" onPointerDown={handleMiniMapPointer} className="relative block overflow-hidden rounded-xl border border-white/10 bg-obsidian" style={{ width: miniMapSize.width, height: miniMapSize.height }} aria-label="Navegar usando mini mapa">
        {floorplanImage ? <span className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${floorplan.fileUrl})` }} /> : <span className="absolute inset-0 bg-industrial-grid bg-[length:18px_18px]" />}
        {visibleZones.map((zone) => <div key={zone.id} className="absolute rounded-sm border" style={{ left: Math.min(...zone.points.map((point) => point.x)) * miniMapScale, top: Math.min(...zone.points.map((point) => point.y)) * miniMapScale, width: Math.max(3, (Math.max(...zone.points.map((point) => point.x)) - Math.min(...zone.points.map((point) => point.x))) * miniMapScale), height: Math.max(3, (Math.max(...zone.points.map((point) => point.y)) - Math.min(...zone.points.map((point) => point.y))) * miniMapScale), borderColor: statusColors[zone.status], backgroundColor: `${statusColors[zone.status]}33` }} />)}
        {viewport && <span className="absolute rounded-md border-2 border-electric bg-electric/20 shadow-glow" style={{ left: viewport.x, top: viewport.y, width: viewport.width, height: viewport.height }} />}
      </button> : <div className="grid h-28 w-44 place-items-center rounded-xl bg-industrial-grid bg-[length:18px_18px] text-xs text-muted">Sin plano</div>}
    </div>
    {selectedZone && <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-sm text-white backdrop-blur">{selectedZone.id.slice(0, 12)} · {selectedZone.name}</div>}
  </div>;
}
