import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, BuildingType, Creature, CreatureType, GameState, ToolType } from '../types/game';
import { generateId, calculateLifeIndex, PLANET_RADIUS, BUILDING_CONFIGS, CREATURE_CONFIGS } from '../utils/helpers';

function createInitialBuildings(): Building[] {
  const buildings: Building[] = [];

  const forestPositions: [number, number, number][] = [
    [0.5, 1.5, 1.2],
    [-0.8, 1.0, 1.5],
    [1.2, 0.5, 1.3],
  ];

  forestPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    const baseHealth = BUILDING_CONFIGS.forest.baseHealth;
    buildings.push({
      id: `forest-${i}`,
      type: 'forest',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      health: baseHealth,
      maxHealth: baseHealth,
      damaged: false,
    });
  });

  const glacierPositions: [number, number, number][] = [
    [-0.3, 1.8, 0.8],
    [0.6, -1.6, 1.0],
  ];

  glacierPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    const baseHealth = BUILDING_CONFIGS.glacier.baseHealth;
    buildings.push({
      id: `glacier-${i}`,
      type: 'glacier',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      health: baseHealth,
      maxHealth: baseHealth,
      damaged: false,
    });
  });

  const cityPositions: [number, number, number][] = [
    [1.5, 0.3, 1.0],
    [-1.0, -0.5, 1.5],
  ];

  cityPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    const baseHealth = BUILDING_CONFIGS.city.baseHealth;
    buildings.push({
      id: `city-${i}`,
      type: 'city',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      health: baseHealth,
      maxHealth: baseHealth,
      damaged: false,
    });
  });

  const grasslandPositions: [number, number, number][] = [
    [0.2, 1.2, 1.6],
    [-1.2, 0.8, 1.2],
    [0.8, -1.0, 1.5],
  ];

  grasslandPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    const baseHealth = BUILDING_CONFIGS.grassland.baseHealth;
    buildings.push({
      id: `grassland-${i}`,
      type: 'grassland',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      health: baseHealth,
      maxHealth: baseHealth,
      damaged: false,
    });
  });

  return buildings;
}

function createInitialCreatures(): Creature[] {
  const creatures: Creature[] = [];
  return creatures;
}

function updateCountsAndLifeIndex(buildings: Building[], creatures: Creature[]) {
  const forestCount = buildings.filter(b => b.type === 'forest').length;
  const glacierCount = buildings.filter(b => b.type === 'glacier').length;
  const cityCount = buildings.filter(b => b.type === 'city').length;
  const grasslandCount = buildings.filter(b => b.type === 'grassland').length;

  const birdCount = creatures.filter(c => c.type === 'bird').length;
  const squirrelCount = creatures.filter(c => c.type === 'squirrel').length;
  const deerCount = creatures.filter(c => c.type === 'deer').length;
  const butterflyCount = creatures.filter(c => c.type === 'butterfly').length;
  const rabbitCount = creatures.filter(c => c.type === 'rabbit').length;
  const penguinCount = creatures.filter(c => c.type === 'penguin').length;
  const snowOwlCount = creatures.filter(c => c.type === 'snowOwl').length;
  const pigeonCount = creatures.filter(c => c.type === 'pigeon').length;

  const lifeIndex = calculateLifeIndex(
    forestCount, glacierCount, cityCount, grasslandCount,
    birdCount, squirrelCount, deerCount, butterflyCount,
    rabbitCount, penguinCount, snowOwlCount, pigeonCount
  );

  return {
    forestCount, glacierCount, cityCount, grasslandCount,
    birdCount, squirrelCount, deerCount, butterflyCount,
    rabbitCount, penguinCount, snowOwlCount, pigeonCount,
    lifeIndex
  };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialBuildings = createInitialBuildings();
    const initialCreatures = createInitialCreatures();
    const counts = updateCountsAndLifeIndex(initialBuildings, initialCreatures);

    return {
      buildings: initialBuildings,
      creatures: initialCreatures,
      selectedTool: null,
      ...counts,
    };
  });

  const selectTool = useCallback((tool: ToolType | null) => {
    setGameState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const addBuilding = useCallback((type: BuildingType, position: [number, number, number]) => {
    const baseHealth = BUILDING_CONFIGS[type].baseHealth;
    const building: Building = {
      id: generateId(),
      type,
      position,
      scale: 1,
      rotation: [0, Math.random() * Math.PI * 2, 0],
      health: baseHealth,
      maxHealth: baseHealth,
      damaged: false,
    };

    setGameState(prev => {
      const newBuildings = [...prev.buildings, building];
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, []);

  const addCreature = useCallback((type: CreatureType, position: [number, number, number]) => {
    const creature: Creature = {
      id: generateId(),
      type,
      position,
      scale: 1,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    };

    setGameState(prev => {
      const newCreatures = [...prev.creatures, creature];
      const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
      return { ...prev, creatures: newCreatures, ...counts };
    });
  }, []);

  const damageBuildings = useCallback((damages: { id: string; damage: number }[]) => {
    setGameState(prev => {
      const damageMap = new Map(damages.map(d => [d.id, d.damage]));
      const newBuildings = prev.buildings.map(b => {
        const damage = damageMap.get(b.id);
        if (damage !== undefined) {
          const newHealth = Math.max(0, b.health - damage);
          return {
            ...b,
            health: newHealth,
            damaged: newHealth < b.maxHealth * 0.6,
          };
        }
        return b;
      });
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, []);

  const removeBuildings = useCallback((ids: string[]) => {
    setGameState(prev => {
      const idSet = new Set(ids);
      const newBuildings = prev.buildings.filter(b => !idSet.has(b.id));
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, []);

  const removeBuilding = useCallback((id: string) => {
    setGameState(prev => {
      const newBuildings = prev.buildings.filter(b => b.id !== id);
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, []);

  const removeCreature = useCallback((id: string) => {
    setGameState(prev => {
      const newCreatures = prev.creatures.filter(c => c.id !== id);
      const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
      return { ...prev, creatures: newCreatures, ...counts };
    });
  }, []);

  const resetBuildings = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      buildings: [],
      creatures: [],
      forestCount: 0,
      glacierCount: 0,
      cityCount: 0,
      grasslandCount: 0,
      birdCount: 0,
      squirrelCount: 0,
      deerCount: 0,
      butterflyCount: 0,
      rabbitCount: 0,
      penguinCount: 0,
      snowOwlCount: 0,
      pigeonCount: 0,
      lifeIndex: 0,
    }));
  }, []);

  return {
    gameState,
    selectTool,
    addBuilding,
    addCreature,
    damageBuildings,
    removeBuildings,
    removeBuilding,
    removeCreature,
    resetBuildings,
  };
}

