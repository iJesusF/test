import type { Point } from '@/types/domain';

export function flattenPoints(points: Point[]) {
  return points.flatMap((point) => [point.x, point.y]);
}

export function polygonCenter(points: Point[]) {
  return points.reduce((acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }), { x: 0, y: 0 });
}

export function screenPointToCanvasPoint(pointer: Point, stagePosition: Point, scale: number) {
  return {
    x: (pointer.x - stagePosition.x) / scale,
    y: (pointer.y - stagePosition.y) / scale
  };
}

export function isNearPoint(a: Point, b: Point, threshold = 28) {
  return Math.hypot(a.x - b.x, a.y - b.y) < threshold;
}
