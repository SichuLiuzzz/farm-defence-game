import { COLS, LOCKED_REGIONS, PATH_COL } from "../core/GameConfig";

export function indexOf(x: number, y: number) {
  return y * COLS + x;
}

export function isPath(x: number, _y: number) {
  return x === PATH_COL;
}

export function isLockedRegion(x: number, y: number) {
  return LOCKED_REGIONS.some(({ x: left, y: top, width, height }) =>
    x >= left && x < left + width && y >= top && y < top + height,
  );
}

export function isBuildable(x: number, y: number) {
  return !isPath(x, y) && !isLockedRegion(x, y);
}
