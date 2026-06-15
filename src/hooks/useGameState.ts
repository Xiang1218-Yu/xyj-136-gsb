import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, BuildingType, GameState } from '../types/game';
import { generateId, calculateLifeIndex, PLANET_RADIUS } from '../utils/helpers';

function createInitialBuildings(): Building[] {
  const buildings: Building[] = [];

  const forestPositions: [number, number, number][] = [
    [0.5, 1.5, 1.2],
    [-0.8, 1.0, 1.5],
    [1.2, 0.5, 1.3],
  ];

  forestPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    buildings.push({
      id: `forest-${i}`,
      type: 'forest',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    });
  });

  const glacierPositions: [number, number, number][] = [
    [-0.3, 1.8, 0.8],
    [0.6, -1.6, 1.0],
  ];

  glacierPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    buildings.push({
      id: `glacier-${i}`,
      type: 'glacier',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    });
  });

  const cityPositions: [number, number, number][] = [
    [1.5, 0.3, 1.0],
    [-1.0, -0.5, 1.5],
  ];

  cityPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    buildings.push({
      id: `city-${i}`,
      type: 'city',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    });
  });

  const grasslandPositions: [number, number, number][] = [
    [0.2, 1.2, 1.6],
    [-1.2, 0.8, 1.2],
    [0.8, -1.0, 1.5],
  ];

  grasslandPositions.forEach((pos, i) => {
    const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
    buildings.push({
      id: `grassland-${i}`,
      type: 'grassland',
      position: [normalized.x, normalized.y, normalized.z],
      scale: 2,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    });
  });

  return buildings;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialBuildings = createInitialBuildings();
    const forestCount = initialBuildings.filter(b => b.type === 'forest').length;
    const glacierCount = initialBuildings.filter(b => b.type === 'glacier').length;
    const cityCount = initialBuildings.filter(b => b.type === 'city').length;
    const grasslandCount = initialBuildings.filter(b => b.type === 'grassland').length;
    const lifeIndex = calculateLifeIndex(forestCount, glacierCount, cityCount, grasslandCount);

    return {
      buildings: initialBuildings,
      selectedTool: null,
      lifeIndex,
      forestCount,
      glacierCount,
      cityCount,
      grasslandCount,
    };
  });

  const selectTool = useCallback((tool: BuildingType | null) => {
    setGameState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const addBuilding = useCallback((type: BuildingType, position: [number, number, number]) => {
    const building: Building = {
      id: generateId(),
      type,
      position,
      scale: 1,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    };

    setGameState(prev => {
      const newBuildings = [...prev.buildings, building];
      const forestCount = newBuildings.filter(b => b.type === 'forest').length;
      const glacierCount = newBuildings.filter(b => b.type === 'glacier').length;
      const cityCount = newBuildings.filter(b => b.type === 'city').length;
      const grasslandCount = newBuildings.filter(b => b.type === 'grassland').length;
      const lifeIndex = calculateLifeIndex(forestCount, glacierCount, cityCount, grasslandCount);

      return {
        ...prev,
        buildings: newBuildings,
        forestCount,
        glacierCount,
        cityCount,
        grasslandCount,
        lifeIndex,
      };
    });
  }, []);

  const resetBuildings = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      buildings: [],
      forestCount: 0,
      glacierCount: 0,
      cityCount: 0,
      grasslandCount: 0,
      lifeIndex: 0,
    }));
  }, []);

  return {
    gameState,
    selectTool,
    addBuilding,
    resetBuildings,
  };
}
