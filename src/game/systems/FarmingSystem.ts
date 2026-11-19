import type { GameState, Tool } from "../core/GameState";
import { indexOf, isBuildable, isLockedRegion } from "../map/GridMap";

export function applyFarmAction(previous: GameState, x: number, y: number, tool: Tool): GameState {
  if (previous.phase !== "day") return { ...previous, message: { key: "dayOnly" } };
  if (isLockedRegion(x, y)) return { ...previous, message: { key: "lockedLand" } };

  const idx = indexOf(x, y);
  const cell = previous.cells[idx];
  const cells = previous.cells.map((item) => ({ ...item, crop: item.crop ? { ...item.crop } : null }));

  if (tool === "plant") {
    if (!isBuildable(x, y)) return { ...previous, message: { key: "pathCannotPlant" } };
    if (cell.tower) return { ...previous, message: { key: "towerAlreadyThere" } };
    if (cell.crop) return { ...previous, message: { key: "cropAlreadyThere" } };
    if (previous.grain < 1) return { ...previous, message: { key: "notEnoughGrainToPlant" } };
    cells[idx].crop = { progress: 0 };
    return { ...previous, cells, grain: previous.grain - 1, message: { key: "planted" } };
  }

  if (tool === "harvest") {
    if (!cell.crop) return { ...previous, message: { key: "nothingToHarvest" } };
    if (cell.crop.progress < 7) return { ...previous, message: { key: "cropNotRipe" } };
    cells[idx].crop = null;
    return { ...previous, cells, grain: previous.grain + 4, message: { key: "harvested" } };
  }

  if (!isBuildable(x, y)) return { ...previous, message: { key: "cannotBuildOnPath" } };
  if (cell.crop) return { ...previous, message: { key: "clearCropFirst" } };
  if (cell.tower) return { ...previous, message: { key: "towerAlreadyBuilt" } };
  if (previous.wood < 3 || previous.grain < 2) return { ...previous, message: { key: "towerTooExpensive" } };
  cells[idx].tower = true;
  return { ...previous, cells, wood: previous.wood - 3, grain: previous.grain - 2, message: { key: "towerBuilt" } };
}
