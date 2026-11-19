import { COLS, ROWS } from "./GameConfig";
import type { TranslationKey } from "../../i18n/translations";

export type Tool = "plant" | "harvest" | "tower";
export type Phase = "day" | "night" | "won" | "lost";

export type Crop = { progress: number };

export type Cell = {
  crop: Crop | null;
  tower: boolean;
  towerCooldown: number;
};

export type Enemy = {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
};

export type Projectile = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
};

export type GameState = {
  cells: Cell[];
  enemies: Enemy[];
  projectiles: Projectile[];
  wood: number;
  grain: number;
  coreHp: number;
  wave: number;
  phase: Phase;
  spawnRemaining: number;
  spawnTimer: number;
  nextEnemyId: number;
  message: { key: TranslationKey; params?: Record<string, string | number> };
};

export function makeInitialState(): GameState {
  return {
    cells: Array.from({ length: COLS * ROWS }, () => ({ crop: null, tower: false, towerCooldown: 0 })),
    enemies: [],
    projectiles: [],
    wood: 10,
    grain: 6,
    coreHp: 10,
    wave: 1,
    phase: "day",
    spawnRemaining: 0,
    spawnTimer: 0,
    nextEnemyId: 1,
    message: { key: "welcome" },
  };
}
