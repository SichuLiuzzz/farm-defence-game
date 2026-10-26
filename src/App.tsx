import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import "./App.css";

const COLS = 16;
const ROWS = 10;
const TILE = 48;
const CANVAS_WIDTH = COLS * TILE;
const CANVAS_HEIGHT = ROWS * TILE;
const PATH_ROW = 4;
const MAX_WAVES = 3;

type Tool = "plant" | "harvest" | "tower";
type Phase = "day" | "night" | "won" | "lost";

type Crop = {
  progress: number;
};

type Cell = {
  crop: Crop | null;
  tower: boolean;
  towerCooldown: number;
};

type Enemy = {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
};

type GameState = {
  cells: Cell[];
  enemies: Enemy[];
  wood: number;
  grain: number;
  coreHp: number;
  wave: number;
  phase: Phase;
  spawnRemaining: number;
  spawnTimer: number;
  nextEnemyId: number;
  message: string;
};

function makeInitialState(): GameState {
  return {
    cells: Array.from({ length: COLS * ROWS }, () => ({
      crop: null,
      tower: false,
      towerCooldown: 0,
    })),
    enemies: [],
    wood: 10,
    grain: 6,
    coreHp: 10,
    wave: 1,
    phase: "day",
    spawnRemaining: 0,
    spawnTimer: 0,
    nextEnemyId: 1,
    message: "白天：种植作物，收获粮食，再建造箭塔。",
  };
}

function indexOf(x: number, y: number) {
  return y * COLS + x;
}

function isPath(x: number, y: number) {
  return y === PATH_ROW;
}

function isBuildable(x: number, y: number) {
  return !isPath(x, y) && !(x === 0 && y === PATH_ROW);
}

function drawGame(
  canvas: HTMLCanvasElement,
  game: GameState,
  selectedTool: Tool,
  hoveredCell: number | null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const idx = indexOf(x, y);
      const cell = game.cells[idx];
      const px = x * TILE;
      const py = y * TILE;

      ctx.fillStyle = isPath(x, y) ? "#bca47a" : (x + y) % 2 === 0 ? "#79a95d" : "#6d9d53";
      ctx.fillRect(px, py, TILE, TILE);

      if (isPath(x, y)) {
        ctx.fillStyle = "#cdb78e";
        ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = "#b7a078";
        ctx.fillRect(px + 8, py + 10, 7, 5);
        ctx.fillRect(px + 28, py + 29, 8, 4);
      }

      if (cell.crop) {
        if (cell.crop.progress < 4) {
          ctx.fillStyle = "#5c3f26";
          ctx.fillRect(px + 14, py + 17, 20, 16);
          ctx.fillStyle = "#4d8c38";
          ctx.fillRect(px + 22, py + 12, 5, 15);
        } else if (cell.crop.progress < 7) {
          ctx.fillStyle = "#4e8735";
          ctx.fillRect(px + 12, py + 15, 7, 18);
          ctx.fillRect(px + 25, py + 12, 7, 21);
          ctx.fillStyle = "#b6ce54";
          ctx.fillRect(px + 17, py + 17, 12, 5);
        } else {
          ctx.fillStyle = "#d7b943";
          ctx.fillRect(px + 11, py + 10, 7, 25);
          ctx.fillRect(px + 20, py + 7, 7, 28);
          ctx.fillRect(px + 29, py + 12, 7, 23);
          ctx.fillStyle = "#5c8b38";
          ctx.fillRect(px + 9, py + 30, 30, 5);
        }
      }

      if (cell.tower) {
        ctx.fillStyle = "#61442e";
        ctx.fillRect(px + 12, py + 18, 24, 22);
        ctx.fillStyle = "#d9d0b4";
        ctx.fillRect(px + 16, py + 9, 16, 12);
        ctx.fillStyle = "#76573a";
        ctx.fillRect(px + 22, py + 5, 4, 14);
      }

      ctx.strokeStyle = "rgba(28, 55, 29, 0.28)";
      ctx.strokeRect(px, py, TILE, TILE);

      if (hoveredCell === idx) {
        ctx.fillStyle = selectedTool === "tower" ? "rgba(255, 220, 80, .22)" : "rgba(255,255,255,.18)";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = "#fff3a6";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
        ctx.lineWidth = 1;
      }
    }
  }

  // Farm core at the end of the path.
  ctx.fillStyle = "#e8dfc7";
  ctx.fillRect(5, PATH_ROW * TILE + 5, TILE - 10, TILE - 10);
  ctx.fillStyle = "#b64e42";
  ctx.fillRect(11, PATH_ROW * TILE + 12, TILE - 22, TILE - 17);
  ctx.fillStyle = "#5e4937";
  ctx.fillRect(20, PATH_ROW * TILE + 25, 9, 14);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("CORE", 7, PATH_ROW * TILE + 46);

  // Enemies.
  for (const enemy of game.enemies) {
    const cx = enemy.x * TILE + TILE / 2;
    const cy = enemy.y * TILE + TILE / 2;
    ctx.fillStyle = "#7b3da1";
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6eaff";
    ctx.fillRect(cx - 6, cy - 4, 4, 4);
    ctx.fillRect(cx + 3, cy - 4, 4, 4);
    ctx.fillStyle = "#3d263f";
    ctx.fillRect(cx - 12, cy - 20, 24, 4);
    ctx.fillStyle = "#e75b5b";
    ctx.fillRect(cx - 12, cy - 20, 24 * Math.max(0, enemy.hp / enemy.maxHp), 4);
  }

  // Subtle line showing tower range when the tower tool is selected.
  if (selectedTool === "tower" && hoveredCell !== null) {
    const x = hoveredCell % COLS;
    const y = Math.floor(hoveredCell / COLS);
    if (isBuildable(x, y)) {
      ctx.strokeStyle = "rgba(255, 245, 160, .6)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE * 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<GameState>(makeInitialState);
  const [tool, setTool] = useState<Tool>("plant");
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const handleCanvasMove = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = Math.floor(((event.clientX - rect.left) * scaleX) / TILE);
    const y = Math.floor(((event.clientY - rect.top) * scaleY) / TILE);
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
      setHoveredCell(indexOf(x, y));
    } else {
      setHoveredCell(null);
    }
  }, []);

  const handleCanvasClick = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) * (CANVAS_WIDTH / rect.width)) / TILE);
    const y = Math.floor(((event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height)) / TILE);
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    const idx = indexOf(x, y);

    setGame((previous) => {
      if (previous.phase !== "day") return { ...previous, message: "只能在白天操作农场。" };
      const cell = previous.cells[idx];
      const cells = previous.cells.map((item) => ({ ...item, crop: item.crop ? { ...item.crop } : null }));

      if (tool === "plant") {
        if (!isBuildable(x, y)) return { ...previous, message: "道路和农场核心不能种植。" };
        if (cell.tower) return { ...previous, message: "这里已经建造了箭塔。" };
        if (cell.crop) return { ...previous, message: "这块地已经种了作物。" };
        if (previous.grain < 1) return { ...previous, message: "粮食不足，收获成熟作物后才能继续播种。" };
        cells[idx].crop = { progress: 0 };
        return { ...previous, cells, grain: previous.grain - 1, message: "播种成功！等待作物成熟。" };
      }

      if (tool === "harvest") {
        if (!cell.crop) return { ...previous, message: "这里没有可以收获的作物。" };
        if (cell.crop.progress < 7) return { ...previous, message: "作物还没成熟，再等一会儿。" };
        cells[idx].crop = null;
        return { ...previous, cells, grain: previous.grain + 4, message: "收获成功：获得 4 粮食。" };
      }

      if (!isBuildable(x, y)) return { ...previous, message: "不能在道路上建造箭塔。" };
      if (cell.crop) return { ...previous, message: "请先收获或清理这块地上的作物。" };
      if (cell.tower) return { ...previous, message: "这里已经有一座箭塔。" };
      if (previous.wood < 3 || previous.grain < 2) {
        return { ...previous, message: "建造箭塔需要 3 木材和 2 粮食。" };
      }
      cells[idx].tower = true;
      return {
        ...previous,
        cells,
        wood: previous.wood - 3,
        grain: previous.grain - 2,
        message: "箭塔建造完成！夜晚会自动攻击附近怪物。",
      };
    });
  }, [tool]);

  const startNight = () => {
    setGame((previous) => {
      if (previous.phase !== "day") return previous;
      const count = previous.wave + 2;
      return {
        ...previous,
        phase: "night",
        spawnRemaining: count,
        spawnTimer: 0.2,
        message: `第 ${previous.wave} 波来袭！箭塔会自动攻击。`,
      };
    });
  };

  const resetGame = () => {
    setGame(makeInitialState());
    setTool("plant");
    setHoveredCell(null);
  };

  // A small game loop: crops grow, enemies spawn/move, and towers attack.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((previous) => {
        if (previous.phase === "won" || previous.phase === "lost") return previous;

        let cells = previous.cells.map((cell) => ({
          ...cell,
          crop: cell.crop ? { ...cell.crop, progress: Math.min(8, cell.crop.progress + 0.25) } : null,
          towerCooldown: Math.max(0, cell.towerCooldown - 0.25),
        }));

        let enemies = previous.enemies.map((enemy) => ({ ...enemy }));
        let spawnRemaining = previous.spawnRemaining;
        let spawnTimer = previous.spawnTimer;
        let nextEnemyId = previous.nextEnemyId;
        let coreHp = previous.coreHp;
        let wood = previous.wood;
        let grain = previous.grain;
        let phase = previous.phase;
        let wave = previous.wave;
        let message = previous.message;

        if (phase === "night") {
          spawnTimer -= 0.25;
          if (spawnRemaining > 0 && spawnTimer <= 0) {
            const hp = 3 + wave;
            enemies.push({
              id: nextEnemyId,
              x: COLS - 1,
              y: PATH_ROW,
              hp,
              maxHp: hp,
              speed: 0.55 + wave * 0.04,
            });
            nextEnemyId += 1;
            spawnRemaining -= 1;
            spawnTimer = 1.5;
          }

          enemies = enemies.map((enemy) => ({ ...enemy, x: enemy.x - enemy.speed * 0.25 }));
          const reachedCore = enemies.filter((enemy) => enemy.x <= 0);
          if (reachedCore.length > 0) {
            coreHp = Math.max(0, coreHp - reachedCore.length * 2);
            enemies = enemies.filter((enemy) => enemy.x > 0);
            message = `怪物冲击农场核心！核心生命值：${coreHp}`;
          }

          // Each tower shoots the nearest enemy in range when its cooldown expires.
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
            enemies[targetIndex].hp -= 1;
            return { ...cell, towerCooldown: 0.75 };
          });

          enemies = enemies.filter((enemy) => enemy.hp > 0);

          if (coreHp <= 0) {
            phase = "lost";
            message = "农场核心被摧毁了！点击重新开始再试一次。";
          } else if (spawnRemaining === 0 && enemies.length === 0) {
            if (wave >= MAX_WAVES) {
              phase = "won";
              message = "胜利！你守住了农场的三个夜晚。";
            } else {
              phase = "day";
              wave += 1;
              wood += 4;
              grain += 2;
              message = `成功守住这一夜！奖励：4 木材、2 粮食。准备第 ${wave} 天。`;
            }
          }
        }

        return {
          ...previous,
          cells,
          enemies,
          spawnRemaining,
          spawnTimer,
          nextEnemyId,
          coreHp,
          wood,
          grain,
          phase,
          wave,
          message,
        };
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    drawGame(canvasRef.current, game, tool, hoveredCell);
  }, [game, tool, hoveredCell]);

  const phaseLabel = {
    day: "☀️ 白天",
    night: "🌙 夜晚战斗",
    won: "🏆 胜利",
    lost: "💥 游戏结束",
  }[game.phase];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">A TINY FARM DEFENSE PROTOTYPE</p>
          <h1>田园守卫</h1>
        </div>
        <div className="day-pill">第 {Math.min(game.wave, MAX_WAVES)} / {MAX_WAVES} 夜</div>
      </header>

      <section className="status-grid" aria-label="游戏状态">
        <div className="stat-card"><span>阶段</span><strong>{phaseLabel}</strong></div>
        <div className="stat-card"><span>木材</span><strong>🪵 {game.wood}</strong></div>
        <div className="stat-card"><span>粮食</span><strong>🌾 {game.grain}</strong></div>
        <div className="stat-card"><span>核心生命</span><strong>❤️ {game.coreHp} / 10</strong></div>
      </section>

      <section className="game-panel">
        <div className="panel-heading">
          <div>
            <h2>农场地图</h2>
            <p>点击格子执行当前工具。紫色怪物沿土路向左移动。</p>
          </div>
          <span className={`phase-tag ${game.phase}`}>{phaseLabel}</span>
        </div>

        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredCell(null)}
            onClick={handleCanvasClick}
            aria-label="农场游戏地图"
          />
        </div>

        <div className="toolbar">
          <button className={tool === "plant" ? "tool-button selected" : "tool-button"} onClick={() => setTool("plant")}>
            🌱 播种 <small>消耗 1 粮食</small>
          </button>
          <button className={tool === "harvest" ? "tool-button selected" : "tool-button"} onClick={() => setTool("harvest")}>
            🌾 收获 <small>成熟后 +4 粮食</small>
          </button>
          <button className={tool === "tower" ? "tool-button selected" : "tool-button"} onClick={() => setTool("tower")}>
            🏹 建箭塔 <small>3 木材 + 2 粮食</small>
          </button>
          <button className="primary-button" onClick={startNight} disabled={game.phase !== "day"}>
            🌙 开始夜晚
          </button>
        </div>

        <div className="message-bar">
          <span className="message-dot" />
          <span>{game.message}</span>
        </div>

        {(game.phase === "won" || game.phase === "lost") && (
          <div className="end-banner">
            <strong>{game.phase === "won" ? "农场守卫成功！" : "农场失守了"}</strong>
            <button className="primary-button" onClick={resetGame}>重新开始</button>
          </div>
        )}
      </section>

      <footer className="hint-row">
        <span>小提示：先在道路旁种几块地，再收获建造箭塔。</span>
        <span>原型版本 · React + TypeScript + Canvas</span>
      </footer>
    </main>
  );
}
