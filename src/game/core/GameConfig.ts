export const COLS = 27;
export const ROWS = 18;
export const TILE = 48;
export const CANVAS_WIDTH = COLS * TILE;
export const CANVAS_HEIGHT = ROWS * TILE;
export const PATH_COL = Math.floor(COLS / 2);
export const MAX_WAVES = 3;

export const LOCKED_REGIONS = [
  { x: 1, y: 5, width: 8, height: 5 },
  { x: COLS - 9, y: 1, width: 8, height: 6 },
  { x: 1, y: ROWS - 8, width: 8, height: 5 },
  { x: COLS - 9, y: ROWS - 8, width: 8, height: 5 },
];
