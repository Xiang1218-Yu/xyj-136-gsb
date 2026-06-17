export type BuildingType = 'forest' | 'glacier' | 'city' | 'grassland';
export type CreatureType = 'bird' | 'squirrel' | 'deer' | 'butterfly' | 'rabbit' | 'penguin' | 'snowOwl' | 'pigeon';
export type ToolType = BuildingType | CreatureType | 'delete';

export type DisasterType = 'earthquake' | 'volcano' | 'flood' | 'meteor';

export type PlanetStyleId = 'terra' | 'volcanic' | 'frozen' | 'desert';

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

export interface PlanetStyleConfig {
  id: PlanetStyleId;
  name: string;
  icon: string;
  description: string;
  surfaceGradient: string[];
  surfaceBlobColors: string[];
  atmosphereColor: string;
  atmosphereColor2: string;
  atmosphereColor3: string;
  cloudOpacity: number;
  initialBuildings: { type: BuildingType; positions: [number, number, number][] }[];
}

export interface PlanetCounts {
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
  lifeIndex: number;
}

export interface PlanetData {
  id: string;
  name: string;
  styleId: PlanetStyleId;
  buildings: Building[];
  creatures: Creature[];
  counts: PlanetCounts;
}

export interface GameState {
  planets: PlanetData[];
  activePlanetId: string;
  selectedTool: ToolType | null;
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
