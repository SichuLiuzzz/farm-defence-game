import { COLS, MAX_WAVES, PATH_COL, ROWS } from "../core/GameConfig";
import type { GameState, Phase } from "../core/GameState";

export function tickGame(previous: GameState): GameState {
  if (previous.phase === "won" || previous.phase === "lost") return previous;

  let cells = previous.cells.map((cell) => ({
    ...cell,
    crop: cell.crop ? { ...cell.crop, progress: Math.min(8, cell.crop.progress + 0.25) } : null,
    towerCooldown: Math.max(0, cell.towerCooldown - 0.25),
  }));
  let enemies = previous.enemies.map((enemy) => ({ ...enemy }));
  let projectiles = previous.projectiles
    .map((projectile) => ({ ...projectile, progress: projectile.progress + 0.5 }))
    .filter((projectile) => projectile.progress < 1);
  let spawnRemaining = previous.spawnRemaining;
  let spawnTimer = previous.spawnTimer;
  let nextEnemyId = previous.nextEnemyId;
  let coreHp = previous.coreHp;
  let wood = previous.wood;
  let grain = previous.grain;
  let phase: Phase = previous.phase;
  let wave = previous.wave;
  let message = previous.message;

  if (phase === "night") {
    spawnTimer -= 0.25;
    if (spawnRemaining > 0 && spawnTimer <= 0) {
      const hp = 3 + wave;
      enemies.push({ id: nextEnemyId, x: PATH_COL, y: ROWS - 1, hp, maxHp: hp, speed: 0.55 + wave * 0.04 });
      nextEnemyId += 1;
      spawnRemaining -= 1;
      spawnTimer = 1.5;
    }

    enemies = enemies.map((enemy) => ({ ...enemy, y: enemy.y - enemy.speed * 0.25 }));
    const reachedCore = enemies.filter((enemy) => enemy.y <= 0);
    if (reachedCore.length > 0) {
      coreHp = Math.max(0, coreHp - reachedCore.length * 2);
      enemies = enemies.filter((enemy) => enemy.y > 0);
      message = { key: "coreHit", params: { health: coreHp } };
    }

    cells = cells.map((cell, idx) => {
      if (!cell.tower || cell.towerCooldown > 0 || enemies.length === 0) return cell;
      const tx = (idx % COLS) + 0.5;
      const ty = Math.floor(idx / COLS) + 0.5;
      let targetIndex = -1;
      let nearest = Infinity;
      enemies.forEach((enemy, enemyIndex) => {
        const distance = Math.hypot(enemy.x + 0.5 - tx, enemy.y + 0.5 - ty);
        if (distance <= 3.2 && distance < nearest) {
          nearest = distance;
          targetIndex = enemyIndex;
        }
      });
      if (targetIndex === -1) return cell;
      const target = enemies[targetIndex];
      projectiles.push({ x: tx, y: ty, targetX: target.x + 0.5, targetY: target.y + 0.5, progress: 0 });
      target.hp -= 1;
      return { ...cell, towerCooldown: 0.75 };
    });

    enemies = enemies.filter((enemy) => enemy.hp > 0);
    if (coreHp <= 0) {
      phase = "lost";
      message = { key: "coreDestroyed" };
    } else if (spawnRemaining === 0 && enemies.length === 0) {
      if (wave >= MAX_WAVES) {
        phase = "won";
        message = { key: "gameWon" };
      } else {
        phase = "day";
        wave += 1;
        wood += 4;
        grain += 2;
        message = { key: "waveCleared", params: { wave } };
      }
    }
  }

  return { ...previous, cells, enemies, projectiles, spawnRemaining, spawnTimer, nextEnemyId, coreHp, wood, grain, phase, wave, message };
}
