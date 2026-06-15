export type BuildingType = 'forest' | 'glacier' | 'city' | 'grassland';

export interface Building {
  id: string;
  type: BuildingType;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
}

export interface GameState {
  buildings: Building[];
  selectedTool: BuildingType | null;
  lifeIndex: number;
  forestCount: number;
  glacierCount: number;
  cityCount: number;
  grasslandCount: number;
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  color: string;
  icon: string;
  lifeValue: number;
  description: string;
}
