export type BuildingType = 'forest' | 'glacier' | 'city' | 'grassland';
export type CreatureType = 'bird' | 'squirrel' | 'deer' | 'butterfly' | 'rabbit' | 'penguin' | 'snowOwl' | 'pigeon';
export type ToolType = BuildingType | CreatureType | 'delete';

export type DisasterType = 'earthquake' | 'volcano' | 'flood' | 'meteor';

export type PlanetThemeType = 'forest' | 'desert' | 'ice' | 'lava' | 'ocean';

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

export interface PlanetThemeConfig {
  type: PlanetThemeType;
  name: string;
  icon: string;
  description: string;
  baseColor: string;
  secondaryColor: string;
  atmosphereColor: string;
  cloudColor: string;
  hasClouds: boolean;
  rotationSpeed: number;
}

export interface PlanetState {
  id: string;
  name: string;
  theme: PlanetThemeType;
  buildings: Building[];
  creatures: Creature[];
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

export interface MultiPlanetGameState {
  planets: PlanetState[];
  currentPlanetId: string;
  selectedTool: ToolType | null;
}

