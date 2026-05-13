'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { flattenPoints, isNearPoint, polygonCenter, screenPointToCanvasPoint } from '@/lib/canvas/geometry';
import { statusColors } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { Point, Zone } from '@/types/domain';

const today = () => new Date().toISOString().slice(0, 10);

function useFloorplanImage(src?: string) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    if (!src) {
      setImage(undefined);
      return;
    }
    const next = new Image();
    next.onload = () => setImage(next);
    next.src = src;
  }, [src]);
  return image;
}

export function PlanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const { floorplans, activeFloorplanId, zones, selectedZoneId, hoveredZoneId, toolMode, setSelectedZone, setHoveredZone, updateZone, addZone } = useProjectStore();
  const [scale, setScale] = useState(0.55);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 1200, height: 720 });
  const [draft, setDraft] = useState<Point[]>([]);
  const floorplan = floorplans.find((item) => item.id === activeFloorplanId);
  const floorplanImage = useFloorplanImage(floorplan?.fileUrl);
  const visibleZones = useMemo(() => zones.filter((zone) => zone.floorplanId === activeFloorplanId), [activeFloorplanId, zones]);
  const selectedZone = useMemo(() => visibleZones.find((zone) => zone.id === selectedZoneId), [selectedZoneId, visibleZones]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!floorplan) return;
    const nextScale = Math.min(stageSize.width / floorplan.width, stageSize.height / floorplan.height) * 0.92;
    if (Number.isFinite(nextScale) && nextScale > 0) {
      setScale(nextScale);
      setStagePos({ x: (stageSize.width - floorplan.width * nextScale) / 2, y: (stageSize.height - floorplan.height * nextScale) / 2 });
    }
  }, [floorplan?.id, floorplan?.height, floorplan?.width, floorplan, stageSize.height, stageSize.width]);

  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    if (!floorplan) return;
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(5, Math.max(0.05, direction > 0 ? oldScale * 1.08 : oldScale / 1.08));
    setScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  }

  function handleStageClick() {
    if (toolMode !== 'draw' || !floorplan) return;
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;
    const point = screenPointToCanvasPoint(pointer, { x: stage.x(), y: stage.y() }, scale);
    if (draft.length > 2 && isNearPoint(draft[0], point)) {
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
        tags: [],
        priority: 'medium'
      };
      addZone(zone);
      setDraft([]);
      return;
    }
    setDraft((points) => [...points, point]);
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

  return <div ref={containerRef} className="relative h-full min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian shadow-panel">
    {!floorplan && <div className="absolute inset-0 z-10 grid place-items-center p-6 text-center"><div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-panel backdrop-blur"><p className="text-xs uppercase tracking-[0.28em] text-muted">Canvas listo</p><h2 className="mt-2 text-2xl font-semibold text-white">Sube un plano real para empezar</h2><p className="mt-3 text-sm text-muted">Usa el botón “Subir plano” y carga una imagen PNG, JPG, WebP o PDF. Después selecciona “Dibujar” y cierra el polígono tocando cerca del primer punto.</p></div></div>}
    <Stage ref={stageRef} width={stageSize.width} height={stageSize.height} scaleX={scale} scaleY={scale} x={stagePos.x} y={stagePos.y} draggable={toolMode === 'pan'} onDragEnd={(event) => setStagePos({ x: event.target.x(), y: event.target.y() })} onWheel={handleWheel} onClick={handleStageClick} onTap={handleStageClick} className="touch-none">
      <Layer listening={false}>
        <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#06070a" />
        {floorplan && <Rect x={0} y={0} width={floorplan.width} height={floorplan.height} fill="#10151f" stroke="#2b3446" strokeWidth={2 / Math.max(scale, 0.4)} />}
        {floorplanImage && <KonvaImage image={floorplanImage} x={0} y={0} width={floorplan?.width} height={floorplan?.height} />}
      </Layer>
      <Layer>{visibleZones.map(renderZone)}{draft.length > 0 && <Line points={flattenPoints(draft)} stroke="#36d3ff" strokeWidth={3 / Math.max(scale, 0.7)} dash={[8, 8]} />}{draft.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={7 / Math.max(scale, 0.7)} fill="#36d3ff" />)}</Layer>
    </Stage>
    <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white backdrop-blur">Modo: <b>{toolMode}</b> · Zoom {Math.round(scale * 100)}% · Zonas {visibleZones.length}</div>
    <div className="absolute bottom-4 right-4 h-28 w-44 rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur"><div className="h-full rounded-xl bg-industrial-grid bg-[length:18px_18px]"><div className="h-8 w-14 translate-x-12 translate-y-8 rounded bg-electric/30 ring-1 ring-electric" /></div></div>
    {selectedZone && <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-sm text-white backdrop-blur">{selectedZone.id.slice(0, 12)} · {selectedZone.name}</div>}
  </div>;
}
