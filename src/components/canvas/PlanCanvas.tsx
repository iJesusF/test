'use client';

import { useMemo, useRef, useState } from 'react';
import { Circle, Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { statusColors } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { Point, Zone } from '@/types/domain';

const flatten = (points: Point[]) => points.flatMap((point) => [point.x, point.y]);
const centerOf = (points: Point[]) => points.reduce((acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }), { x: 0, y: 0 });

export function PlanCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const { zones, selectedZoneId, hoveredZoneId, toolMode, setSelectedZone, setHoveredZone, updateZone } = useProjectStore();
  const [scale, setScale] = useState(0.55);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [draft, setDraft] = useState<Point[]>([]);

  const selectedZone = useMemo(() => zones.find((zone) => zone.id === selectedZoneId), [selectedZoneId, zones]);

  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(2.5, Math.max(0.22, direction > 0 ? oldScale * 1.08 : oldScale / 1.08));
    setScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  }

  function handleStageClick() {
    if (toolMode !== 'draw') return;
    const stage = stageRef.current;
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;
    const point = { x: (pointer.x - stage.x()) / scale, y: (pointer.y - stage.y()) / scale };
    if (draft.length > 2 && Math.hypot(draft[0].x - point.x, draft[0].y - point.y) < 28) {
      const zone: Zone = { id: `Z-${Date.now().toString().slice(-5)}`, floorplanId: 'fp-001', name: 'Nueva zona', color: '#4f8cff', status: 'not_started', progress: 0, notes: '', responsible: 'Sin asignar', startDate: '2026-05-13', endDate: '2026-05-20', points: draft, checklist: [], tags: [], priority: 'medium' };
      useProjectStore.getState().addZone(zone);
      setSelectedZone(zone.id);
      setDraft([]);
      return;
    }
    setDraft((points) => [...points, point]);
  }

  function renderZone(zone: Zone) {
    const isSelected = selectedZoneId === zone.id;
    const isHovered = hoveredZoneId === zone.id;
    const center = centerOf(zone.points);
    const fill = toolMode === 'heatmap' ? statusColors[zone.status] : zone.color;
    return <Group key={zone.id} onClick={(event) => { event.cancelBubble = true; setSelectedZone(zone.id); }} onTap={() => setSelectedZone(zone.id)} onMouseEnter={() => setHoveredZone(zone.id)} onMouseLeave={() => setHoveredZone(undefined)}>
      <Line points={flatten(zone.points)} closed fill={fill} opacity={isSelected || isHovered ? 0.42 : 0.24} stroke={statusColors[zone.status]} strokeWidth={isSelected ? 5 : 2} shadowColor={statusColors[zone.status]} shadowBlur={isHovered || isSelected ? 24 : 0} />
      <Text x={center.x - 70} y={center.y - 15} width={140} align="center" text={`${zone.name}\n${zone.progress}%`} fill="white" fontSize={18} fontStyle="700" />
      {isSelected && zone.points.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={8} fill="#ffffff" stroke={statusColors[zone.status]} strokeWidth={3} draggable onDragMove={(event) => {
        const next = zone.points.map((existing, i) => (i === index ? { x: event.target.x(), y: event.target.y() } : existing));
        updateZone(zone.id, { points: next });
      }} />)}
    </Group>;
  }

  return <div className="relative h-full min-h-[460px] overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian shadow-panel">
    <Stage ref={stageRef} width={1400} height={850} scaleX={scale} scaleY={scale} x={stagePos.x} y={stagePos.y} draggable={toolMode === 'pan'} onDragEnd={(event) => setStagePos({ x: event.target.x(), y: event.target.y() })} onWheel={handleWheel} onClick={handleStageClick} onTap={handleStageClick} className="touch-none">
      <Layer listening={false}><Rect x={0} y={0} width={1600} height={1000} fill="#10151f" /><Rect x={80} y={90} width={1440} height={820} fill="#121a26" stroke="#2b3446" strokeWidth={4} /><Line points={[80,460,1520,460,760,90,760,910,80,90,1520,910]} stroke="#2f3a4e" strokeWidth={2} dash={[18,14]} opacity={0.7} /></Layer>
      <Layer>{zones.map(renderZone)}{draft.length > 0 && <Line points={flatten(draft)} stroke="#36d3ff" strokeWidth={3} dash={[8,8]} />}{draft.map((point, index) => <Circle key={index} x={point.x} y={point.y} radius={7} fill="#36d3ff" />)}</Layer>
    </Stage>
    <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white backdrop-blur">Modo: <b>{toolMode}</b> · Zoom {Math.round(scale * 100)}%</div>
    <div className="absolute bottom-4 right-4 h-28 w-44 rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur"><div className="h-full rounded-xl bg-industrial-grid bg-[length:18px_18px]"><div className="h-8 w-14 translate-x-12 translate-y-8 rounded bg-electric/30 ring-1 ring-electric" /></div></div>
    {selectedZone && <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-sm text-white backdrop-blur">{selectedZone.id} · {selectedZone.name}</div>}
  </div>;
}
