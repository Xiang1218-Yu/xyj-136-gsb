export type BuildingType = 'forest' | 'glacier' | 'city' | 'grassland';
export type CreatureType = 'bird' | 'squirrel' | 'deer' | 'butterfly' | 'rabbit' | 'penguin' | 'snowOwl' | 'pigeon';
export type ToolType = BuildingType | CreatureType | 'delete';

/** 星球类型标识 */
export type PlanetId = 'earth' | 'mars' | 'ice' | 'desert' | 'ocean';

export type DisasterType = 'earthquake' | 'volcano' | 'flood' | 'meteor';

export interface Building {
  id: string;
  type: BuildingType;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  health: number;
  maxHealth: number;
  damaged: boolean;
}

export interface Creature {
  id: string;
  type: CreatureType;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

export interface GameState {
  buildings: Building[];
  creatures: Creature[];
  selectedTool: ToolType | null;
  lifeIndex: number;
  forestCount: number;
  glacierCount: number;
  cityCount: number;
  grasslandCount: number;
  birdCount: number;
  squirrelCount: number;
  deerCount: number;
  butterflyCount: number;
  rabbitCount: number;
  penguinCount: number;
  snowOwlCount: number;
  pigeonCount: number;
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  color: string;
  icon: string;
  lifeValue: number;
  description: string;
  baseHealth: number;
}

export interface CreatureConfig {
  type: CreatureType;
  name: string;
  color: string;
  icon: string;
  lifeValue: number;
  description: string;
  biome: 'forest' | 'grassland' | 'glacier' | 'city';
}

export interface DisasterDamageInfo {
  buildingType: BuildingType;
  damageMultiplier: number;
  description: string;
}

export interface DisasterConfig {
  type: DisasterType;
  name: string;
  icon: string;
  color: string;
  warningColor: string;
  description: string;
  longDescription: string;
  causes: string[];
  damageRadius: number;
  baseDamage: number;
  affectedBuildings: DisasterDamageInfo[];
  minInterval: number;
  maxInterval: number;
  probability: number;
  warningTime: number;
  tips: string[];
  historicalEvents: string[];
}

export interface ActiveDisaster {
  id: string;
  type: DisasterType;
  position: [number, number, number];
  timestamp: number;
  duration: number;
  intensity: number;
  affectedBuildingIds: string[];
}

export interface DisasterWarning {
  id: string;
  type: DisasterType;
  estimatedPosition: [number, number, number];
  countdown: number;
  estimatedIntensity: number;
  timestamp: number;
}

/**
 * 星球视觉风格配置
 * 定义星球的颜色、纹理等外观属性
 */
export interface PlanetStyle {
  /** 星球 ID */
  id: PlanetId;
  /** 星球名称 */
  name: string;
  /** 星球描述 */
  description: string;
  /** 图标 emoji */
  icon: string;
  /** 基础颜色（低生命指数时的颜色） */
  baseColor: string;
  /** 主色调（纹理主色） */
  primaryColor: string;
  /** 次要颜色 */
  secondaryColor: string;
  /** 第三颜色 */
  tertiaryColor: string;
  /** 高生命指数时的颜色 */
  vibrantColor: string;
  /** 大气层颜色 */
  atmosphereColor: string;
  /** 云层颜色 */
  cloudColor: string;
  /** 是否有云层 */
  hasClouds: boolean;
  /** 地形起伏强度 */
  terrainHeight: number;
  /** 生命指数变化时的颜色过渡目标 RGB */
  lifeTint: { r: number; g: number; b: number };
}

/**
 * 单颗星球的独立数据
 * 包含该星球独有的建造进度和生命指数
 */
export interface PlanetData {
  /** 星球 ID */
  planetId: PlanetId;
  /** 建筑列表 */
  buildings: Building[];
  /** 生物列表 */
  creatures: Creature[];
  /** 生命指数 */
  lifeIndex: number;
  /** 各类建筑数量统计 */
  forestCount: number;
  glacierCount: number;
  cityCount: number;
  grasslandCount: number;
  /** 各类生物数量统计 */
  birdCount: number;
  squirrelCount: number;
  deerCount: number;
  butterflyCount: number;
  rabbitCount: number;
  penguinCount: number;
  snowOwlCount: number;
  pigeonCount: number;
}

/**
 * 多星球游戏状态
 * 管理所有星球的数据及当前选中的星球
 */
export interface MultiPlanetGameState {
  /** 当前选中的星球 ID */
  currentPlanetId: PlanetId;
  /** 所有星球的数据映射 */
  planets: Record<PlanetId, PlanetData>;
  /** 当前选中的工具 */
  selectedTool: ToolType | null;
}

