import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, LOCKED_REGIONS, PATH_COL, ROWS, TILE } from "../game/core/GameConfig";
import type { GameState, Tool } from "../game/core/GameState";
import { isBuildable, isLockedRegion, isPath, indexOf } from "../game/map/GridMap";
import { translate, type Language } from "../i18n/translations";

export function drawGame(canvas: HTMLCanvasElement, game: GameState, selectedTool: Tool, hoveredCell: number | null, language: Language) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const idx = indexOf(x, y);
      const cell = game.cells[idx];
      const px = x * TILE;
      const py = y * TILE;
      ctx.fillStyle = isPath(x, y) ? "#bca47a" : isLockedRegion(x, y) ? "#59634a" : (x + y) % 2 === 0 ? "#79a95d" : "#6d9d53";
      ctx.fillRect(px, py, TILE, TILE);

      if (isPath(x, y)) {
        ctx.fillStyle = "#cdb78e";
        ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = "#b7a078";
        ctx.fillRect(px + 8, py + 10, 7, 5);
        ctx.fillRect(px + 28, py + 29, 8, 4);
      }
      if (isLockedRegion(x, y)) {
        ctx.strokeStyle = "rgba(30, 38, 27, 0.28)";
        ctx.beginPath(); ctx.moveTo(px + 7, py + TILE - 5); ctx.lineTo(px + TILE - 5, py + 7); ctx.stroke();
      }
      if (cell.crop) {
        if (cell.crop.progress < 4) {
          ctx.fillStyle = "#5c3f26"; ctx.fillRect(px + 14, py + 17, 20, 16);
          ctx.fillStyle = "#4d8c38"; ctx.fillRect(px + 22, py + 12, 5, 15);
        } else if (cell.crop.progress < 7) {
          ctx.fillStyle = "#4e8735"; ctx.fillRect(px + 12, py + 15, 7, 18); ctx.fillRect(px + 25, py + 12, 7, 21);
          ctx.fillStyle = "#b6ce54"; ctx.fillRect(px + 17, py + 17, 12, 5);
        } else {
          ctx.fillStyle = "#d7b943"; ctx.fillRect(px + 11, py + 10, 7, 25); ctx.fillRect(px + 20, py + 7, 7, 28); ctx.fillRect(px + 29, py + 12, 7, 23);
          ctx.fillStyle = "#5c8b38"; ctx.fillRect(px + 9, py + 30, 30, 5);
        }
      }
      if (cell.tower) {
        ctx.fillStyle = "#61442e"; ctx.fillRect(px + 12, py + 18, 24, 22);
        ctx.fillStyle = "#d9d0b4"; ctx.fillRect(px + 16, py + 9, 16, 12);
        ctx.fillStyle = "#76573a"; ctx.fillRect(px + 22, py + 5, 4, 14);
      }
      ctx.strokeStyle = "rgba(28, 55, 29, 0.28)"; ctx.strokeRect(px, py, TILE, TILE);
      if (hoveredCell === idx) {
        ctx.fillStyle = selectedTool === "tower" ? "rgba(255, 220, 80, .22)" : "rgba(255,255,255,.18)";
        ctx.fillRect(px, py, TILE, TILE); ctx.strokeStyle = "#fff3a6"; ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4); ctx.lineWidth = 1;
      }
    }
  }

  for (const region of LOCKED_REGIONS) {
    const x = region.x * TILE, y = region.y * TILE, width = region.width * TILE, height = region.height * TILE;
    ctx.fillStyle = "rgba(25, 33, 22, 0.22)"; ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#d0bd7a"; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    ctx.fillStyle = "rgba(24, 33, 25, 0.82)"; ctx.fillRect(x + width / 2 - 48, y + height / 2 - 13, 96, 26);
    ctx.fillStyle = "#f0df9c"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(translate(language, "locked"), x + width / 2, y + height / 2);
  }
  ctx.textAlign = "start"; ctx.textBaseline = "alphabetic"; ctx.lineWidth = 1;
  ctx.fillStyle = "#e8dfc7"; ctx.fillRect(PATH_COL * TILE + 5, 5, TILE - 10, TILE - 10);
  ctx.fillStyle = "#b64e42"; ctx.fillRect(PATH_COL * TILE + 11, 12, TILE - 22, TILE - 17);
  ctx.fillStyle = "#5e4937"; ctx.fillRect(PATH_COL * TILE + 20, 25, 9, 14);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px sans-serif"; ctx.fillText(translate(language, "core"), PATH_COL * TILE + 7, 46);

  for (const projectile of game.projectiles) {
    const cx = (projectile.x + (projectile.targetX - projectile.x) * projectile.progress) * TILE;
    const cy = (projectile.y + (projectile.targetY - projectile.y) * projectile.progress) * TILE;
    ctx.fillStyle = "#39e75f"; ctx.shadowColor = "#39e75f"; ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const enemy of game.enemies) {
    const cx = enemy.x * TILE + TILE / 2, cy = enemy.y * TILE + TILE / 2;
    ctx.fillStyle = "#7b3da1"; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f6eaff"; ctx.fillRect(cx - 6, cy - 4, 4, 4); ctx.fillRect(cx + 3, cy - 4, 4, 4);
    ctx.fillStyle = "#3d263f"; ctx.fillRect(cx - 12, cy - 20, 24, 4);
    ctx.fillStyle = "#e75b5b"; ctx.fillRect(cx - 12, cy - 20, 24 * Math.max(0, enemy.hp / enemy.maxHp), 4);
  }
  if (selectedTool === "tower" && hoveredCell !== null) {
    const x = hoveredCell % COLS, y = Math.floor(hoveredCell / COLS);
    if (isBuildable(x, y)) {
      ctx.strokeStyle = "rgba(255, 245, 160, .6)"; ctx.setLineDash([5, 4]); ctx.beginPath();
      ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE * 3.2, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
  }
}
