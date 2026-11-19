export type Language = "en" | "zh-CN";

const en = {
  appEyebrow: "A TINY FARM DEFENSE PROTOTYPE", appTitle: "Farm Defense", wave: "Wave {current} / {total}",
  phase: "Phase", day: "Day", night: "Night battle", victory: "Victory", gameOver: "Game over",
  wood: "Wood", grain: "Grain", coreHealth: "Core health", farmMap: "Farm map",
  mapDescription: "Click a tile to use the selected tool. Purple monsters follow the dirt path.", mapAria: "Farm game map",
  plant: "Plant", plantCost: "Costs 1 grain", harvest: "Harvest", harvestYield: "+4 grain when ripe",
  buildTower: "Build tower", towerCost: "3 wood + 2 grain", startNight: "Start night", playAgain: "Play again",
  wonBanner: "Farm defended!", lostBanner: "The farm was overrun.",
  tip: "Tip: plant beside the path, harvest crops, then build towers.", footer: "Prototype · React + TypeScript + Canvas",
  locked: "LOCKED", core: "CORE", welcome: "Daytime: plant crops, harvest grain, and build towers.",
  dayOnly: "You can only manage the farm during the day.", lockedLand: "Locked land: unlock it with an upgrade before farming here.",
  pathCannotPlant: "You cannot plant on the path or the farm core.", towerAlreadyThere: "There is already a tower here.",
  cropAlreadyThere: "This plot already has a crop.", notEnoughGrainToPlant: "Not enough grain. Harvest ripe crops before planting more.",
  planted: "Crop planted! Wait for it to grow.", nothingToHarvest: "There is no crop to harvest here.",
  cropNotRipe: "This crop is not ripe yet. Wait a little longer.", harvested: "Harvest successful: +4 grain.",
  cannotBuildOnPath: "You cannot build a tower on the path.", clearCropFirst: "Harvest or clear the crop here before building a tower.",
  towerAlreadyBuilt: "There is already a tower here.", towerTooExpensive: "A tower costs 3 wood and 2 grain.",
  towerBuilt: "Tower built! It will automatically attack nearby monsters at night.",
  waveIncoming: "Wave {wave} is coming! Towers will attack automatically.",
  coreHit: "Monsters hit the farm core! Core health: {health}",
  coreDestroyed: "The farm core was destroyed! Start a new game to try again.",
  gameWon: "Victory! You defended the farm for all three nights.",
  waveCleared: "Night survived! Reward: 4 wood and 2 grain. Prepare for day {wave}.",
} as const;

type TranslationKey = keyof typeof en;
type Dictionary = Record<TranslationKey, string>;

const zhCN: Dictionary = {
  appEyebrow: "田园守卫小游戏", appTitle: "田园守卫", wave: "第 {current} / {total} 波",
  phase: "阶段", day: "白天", night: "夜间战斗", victory: "胜利", gameOver: "游戏结束",
  wood: "木材", grain: "粮食", coreHealth: "核心生命", farmMap: "农场地图",
  mapDescription: "点击格子使用当前工具。紫色怪物会沿着土路前进。", mapAria: "农场游戏地图",
  plant: "播种", plantCost: "消耗 1 粮食", harvest: "收获", harvestYield: "成熟后获得 4 粮食",
  buildTower: "建造箭塔", towerCost: "3 木材 + 2 粮食", startNight: "开始夜晚", playAgain: "重新开始",
  wonBanner: "成功守住农场！", lostBanner: "农场失守了。", tip: "提示：先在路边播种，收获作物后再建造箭塔。",
  footer: "原型 · React + TypeScript + Canvas", locked: "未解锁", core: "核心",
  welcome: "白天：种植作物、收获粮食，然后建造箭塔。", dayOnly: "只能在白天管理农场。",
  lockedLand: "这片土地尚未解锁，请先通过升级解锁。", pathCannotPlant: "不能在道路或农场核心上播种。",
  towerAlreadyThere: "这里已经有一座箭塔了。", cropAlreadyThere: "这块地已经种了作物。",
  notEnoughGrainToPlant: "粮食不足。收获成熟作物后才能继续播种。", planted: "播种成功！等待作物成熟。",
  nothingToHarvest: "这里没有可以收获的作物。", cropNotRipe: "作物还没有成熟，请再等一会儿。",
  harvested: "收获成功：获得 4 粮食。", cannotBuildOnPath: "不能在道路上建造箭塔。",
  clearCropFirst: "请先收获或清除这块地上的作物，再建造箭塔。", towerAlreadyBuilt: "这里已经有一座箭塔了。",
  towerTooExpensive: "建造箭塔需要 3 木材和 2 粮食。", towerBuilt: "箭塔建造完成！夜晚会自动攻击附近的怪物。",
  waveIncoming: "第 {wave} 波怪物来袭！箭塔会自动攻击。", coreHit: "怪物冲击农场核心！核心生命：{health}",
  coreDestroyed: "农场核心被摧毁了！重新开始再试一次吧。", gameWon: "胜利！你成功守住了农场的三个夜晚。",
  waveCleared: "成功守住了这一夜！奖励：4 木材和 2 粮食。准备迎接第 {wave} 天。",
};

const dictionaries: Record<Language, Dictionary> = { en, "zh-CN": zhCN };

export function translate(language: Language, key: TranslationKey, params: Record<string, string | number> = {}) {
  return dictionaries[language][key].replace(/\{(\w+)\}/g, (placeholder, name: string) => String(params[name] ?? placeholder));
}

export type { TranslationKey };
