import { BuildingType, BuildingConfig } from '../types/game';

export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  forest: {
    type: 'forest',
    name: '森林',
    color: '#2d5a27',
    icon: '🌲',
    lifeValue: 15,
    description: '郁郁葱葱的森林，为星球带来生机',
  },
  glacier: {
    type: 'glacier',
    name: '冰川',
    color: '#87ceeb',
    icon: '🏔️',
    lifeValue: 10,
    description: '晶莹剔透的冰川，调节星球气候',
  },
  city: {
    type: 'city',
    name: '城市',
    color: '#ffa500',
    icon: '🏙️',
    lifeValue: 20,
    description: '繁华的城市，文明的象征',
  },
  grassland: {
    type: 'grassland',
    name: '草地',
    color: '#7cfc00',
    icon: '🌿',
    lifeValue: 8,
    description: '翠绿的草地，覆盖大地',
  },
};

export const PLANET_RADIUS = 2;

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function calculateLifeIndex(
  forestCount: number,
  glacierCount: number,
  cityCount: number,
  grasslandCount: number
): number {
  const total =
    forestCount * 15 +
    glacierCount * 10 +
    cityCount * 20 +
    grasslandCount * 8;
  return Math.min(100, total / 5);
}
