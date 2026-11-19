import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import "./App.css";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, MAX_WAVES, ROWS, TILE } from "./game/core/GameConfig";
import { makeInitialState, type GameState, type Tool } from "./game/core/GameState";
import { indexOf } from "./game/map/GridMap";
import { applyFarmAction } from "./game/systems/FarmingSystem";
import { tickGame } from "./game/systems/GameLoop";
import { drawGame } from "./rendering/CanvasRenderer";
import { translate, type Language } from "./i18n/translations";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<GameState>(makeInitialState);
  const [tool, setTool] = useState<Tool>("plant");
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) => translate(language, key, params);

  const getCellFromEvent = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) * CANVAS_WIDTH / rect.width) / TILE);
    const y = Math.floor(((event.clientY - rect.top) * CANVAS_HEIGHT / rect.height) / TILE);
    return x >= 0 && x < COLS && y >= 0 && y < ROWS ? indexOf(x, y) : null;
  }, []);
  const handleCanvasMove = useCallback((event: MouseEvent<HTMLCanvasElement>) => setHoveredCell(getCellFromEvent(event)), [getCellFromEvent]);
  const handleCanvasClick = useCallback((event: MouseEvent<HTMLCanvasElement>) => {
    const idx = getCellFromEvent(event);
    if (idx === null) return;
    setGame((previous) => applyFarmAction(previous, idx % COLS, Math.floor(idx / COLS), tool));
  }, [getCellFromEvent, tool]);
  const startNight = () => setGame((previous) => previous.phase !== "day" ? previous : ({
    ...previous,
    phase: "night",
    spawnRemaining: previous.wave + 2,
    spawnTimer: 0.2,
    message: { key: "waveIncoming", params: { wave: previous.wave } },
  }));
  const resetGame = () => { setGame(makeInitialState()); setTool("plant"); setHoveredCell(null); };

  useEffect(() => {
    const timer = window.setInterval(() => setGame(tickGame), 250);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (canvasRef.current) drawGame(canvasRef.current, game, tool, hoveredCell, language);
  }, [game, tool, hoveredCell, language]);

  const phaseLabel = t(game.phase === "day" ? "day" : game.phase === "night" ? "night" : game.phase === "won" ? "victory" : "gameOver");
  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">{t("appEyebrow")}</p><h1>{t("appTitle")}</h1></div>
        <label className="language-picker"><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="en">English</option><option value="zh-CN">简体中文</option></select></label>
        <div className="day-pill">{t("wave", { current: Math.min(game.wave, MAX_WAVES), total: MAX_WAVES })}</div>
      </header>
      <section className="status-grid" aria-label={t("phase")}>
        <div className="stat-card"><span>{t("phase")}</span><strong>{phaseLabel}</strong></div>
        <div className="stat-card"><span>{t("wood")}</span><strong>{game.wood}</strong></div>
        <div className="stat-card"><span>{t("grain")}</span><strong>{game.grain}</strong></div>
        <div className="stat-card"><span>{t("coreHealth")}</span><strong>{game.coreHp} / 10</strong></div>
      </section>
      <section className="game-panel">
        <div className="panel-heading">
          <div><h2>{t("farmMap")}</h2><p>{t("mapDescription")}</p></div>
          <span className={`phase-tag ${game.phase}`}>{phaseLabel}</span>
        </div>
        <div className="canvas-wrap">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onMouseMove={handleCanvasMove} onMouseLeave={() => setHoveredCell(null)} onClick={handleCanvasClick} aria-label={t("mapAria")} />
        </div>
        <div className="toolbar">
          <button className={tool === "plant" ? "tool-button selected" : "tool-button"} onClick={() => setTool("plant")}>{t("plant")} <small>{t("plantCost")}</small></button>
          <button className={tool === "harvest" ? "tool-button selected" : "tool-button"} onClick={() => setTool("harvest")}>{t("harvest")} <small>{t("harvestYield")}</small></button>
          <button className={tool === "tower" ? "tool-button selected" : "tool-button"} onClick={() => setTool("tower")}>{t("buildTower")} <small>{t("towerCost")}</small></button>
          <button className="primary-button" onClick={startNight} disabled={game.phase !== "day"}>{t("startNight")}</button>
        </div>
        <div className="message-bar"><span className="message-dot" /><span>{t(game.message.key, game.message.params)}</span></div>
        {(game.phase === "won" || game.phase === "lost") && (
          <div className="end-banner">
            <strong>{t(game.phase === "won" ? "wonBanner" : "lostBanner")}</strong>
            <button className="primary-button" onClick={resetGame}>{t("playAgain")}</button>
          </div>
        )}
      </section>
      <footer className="hint-row">
        <span>{t("tip")}</span>
        <span>{t("footer")}</span>
      </footer>
    </main>
  );
}
