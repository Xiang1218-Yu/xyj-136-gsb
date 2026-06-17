import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, BuildingType, Creature, CreatureType, GameState, ToolType, PlanetState, PlanetStyle } from '../types/game';
import { generateId, PLANET_RADIUS, BUILDING_CONFIGS, PLANET_STYLE_CONFIGS, updateCountsAndLifeIndex } from '../utils/helpers';

function createInitialBuildings(style: PlanetStyle): Building[] {
  const buildings: Building[] = [];

  if (style === 'verdant') {
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
  }

  if (style === 'ice') {
    const glacierPositions: [number, number, number][] = [
      [-0.3, 1.8, 0.8],
      [0.6, -1.6, 1.0],
      [-1.0, 0.5, 1.4],
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
  }

  if (style === 'desert') {
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
  }

  return buildings;
}

function createInitialCreatures(): Creature[] {
  return [];
}

function createPlanet(id: string, name: string, style: PlanetStyle): PlanetState {
  const buildings = createInitialBuildings(style);
  const creatures = createInitialCreatures();
  const counts = updateCountsAndLifeIndex(buildings, creatures);

  return {
    id,
    name,
    style,
    buildings,
    creatures,
    ...counts,
  };
}

function createInitialPlanets(): PlanetState[] {
  return [
    createPlanet('planet-1', '翠绿之星', 'verdant'),
    createPlanet('planet-2', '冰封世界', 'ice'),
    createPlanet('planet-3', '沙漠绿洲', 'desert'),
    createPlanet('planet-4', '熔岩星球', 'volcanic'),
  ];
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const planets = createInitialPlanets();
    return {
      planets,
      currentPlanetId: planets[0].id,
      selectedTool: null,
    };
  });

  const currentPlanet = gameState.planets.find(p => p.id === gameState.currentPlanetId) || gameState.planets[0];

  const selectTool = useCallback((tool: ToolType | null) => {
    setGameState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const switchPlanet = useCallback((planetId: string) => {
    setGameState(prev => ({ ...prev, currentPlanetId: planetId }));
  }, []);

  const updateCurrentPlanet = useCallback((updater: (planet: PlanetState) => PlanetState) => {
    setGameState(prev => ({
      ...prev,
      planets: prev.planets.map(p =>
        p.id === prev.currentPlanetId ? updater(p) : p
      ),
    }));
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

    updateCurrentPlanet(prev => {
      const newBuildings = [...prev.buildings, building];
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, [updateCurrentPlanet]);

  const addCreature = useCallback((type: CreatureType, position: [number, number, number]) => {
    const creature: Creature = {
      id: generateId(),
      type,
      position,
      scale: 1,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    };

    updateCurrentPlanet(prev => {
      const newCreatures = [...prev.creatures, creature];
      const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
      return { ...prev, creatures: newCreatures, ...counts };
    });
  }, [updateCurrentPlanet]);

  const damageBuildings = useCallback((damages: { id: string; damage: number }[]) => {
    updateCurrentPlanet(prev => {
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
  }, [updateCurrentPlanet]);

  const removeBuildings = useCallback((ids: string[]) => {
    updateCurrentPlanet(prev => {
      const idSet = new Set(ids);
      const newBuildings = prev.buildings.filter(b => !idSet.has(b.id));
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, [updateCurrentPlanet]);

  const removeBuilding = useCallback((id: string) => {
    updateCurrentPlanet(prev => {
      const newBuildings = prev.buildings.filter(b => b.id !== id);
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, [updateCurrentPlanet]);

  const removeCreature = useCallback((id: string) => {
    updateCurrentPlanet(prev => {
      const newCreatures = prev.creatures.filter(c => c.id !== id);
      const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
      return { ...prev, creatures: newCreatures, ...counts };
    });
  }, [updateCurrentPlanet]);

  const resetBuildings = useCallback(() => {
    updateCurrentPlanet(prev => ({
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
  }, [updateCurrentPlanet]);

  return {
    gameState,
    currentPlanet,
    selectTool,
    switchPlanet,
    addBuilding,
    addCreature,
    damageBuildings,
    removeBuildings,
    removeBuilding,
    removeCreature,
    resetBuildings,
  };
}
