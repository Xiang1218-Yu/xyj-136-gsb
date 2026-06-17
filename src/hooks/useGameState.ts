import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, BuildingType, Creature, CreatureType, ToolType, PlanetState, PlanetThemeType, MultiPlanetGameState } from '../types/game';
import { generateId, calculateLifeIndex, PLANET_RADIUS, BUILDING_CONFIGS, CREATURE_CONFIGS, PLANET_THEME_CONFIGS } from '../utils/helpers';

/**
 * 根据主题类型生成初始建筑配置
 * 不同主题的星球有不同的初始建筑布局，符合该星球的生态特征
 */
function createInitialBuildings(theme: PlanetThemeType): Building[] {
  const buildings: Building[] = [];

  const positionsByTheme: Record<PlanetThemeType, Record<BuildingType, [number, number, number][]>> = {
    forest: {
      forest: [[0.5, 1.5, 1.2], [-0.8, 1.0, 1.5], [1.2, 0.5, 1.3]],
      glacier: [[-0.3, 1.8, 0.8], [0.6, -1.6, 1.0]],
      city: [[1.5, 0.3, 1.0], [-1.0, -0.5, 1.5]],
      grassland: [[0.2, 1.2, 1.6], [-1.2, 0.8, 1.2], [0.8, -1.0, 1.5]],
    },
    desert: {
      forest: [[0.8, 0.6, 1.5]],
      glacier: [],
      city: [[1.2, 0.2, 1.2], [-0.9, -0.4, 1.4]],
      grassland: [[0.3, 1.0, 1.5], [-0.7, 0.9, 1.3]],
    },
    ice: {
      forest: [],
      glacier: [[-0.5, 1.5, 1.0], [0.7, -1.2, 1.2], [-1.0, 0.5, 1.3]],
      city: [[1.0, 0.4, 1.3]],
      grassland: [],
    },
    lava: {
      forest: [],
      glacier: [],
      city: [[0.9, 0.5, 1.4]],
      grassland: [[-1.0, 0.6, 1.3]],
    },
    ocean: {
      forest: [[0.6, 1.2, 1.4], [-0.7, 0.8, 1.5]],
      glacier: [[0.2, 1.6, 1.0]],
      city: [[1.3, 0.1, 1.1]],
      grassland: [[-0.4, 1.1, 1.6], [0.9, -0.8, 1.4]],
    },
  };

  const positions = positionsByTheme[theme];

  (Object.keys(positions) as BuildingType[]).forEach((type) => {
    positions[type].forEach((pos, i) => {
      const normalized = new THREE.Vector3(...pos).normalize().multiplyScalar(PLANET_RADIUS);
      const baseHealth = BUILDING_CONFIGS[type].baseHealth;
      buildings.push({
        id: `${type}-${i}`,
        type,
        position: [normalized.x, normalized.y, normalized.z],
        scale: 2,
        rotation: [0, Math.random() * Math.PI * 2, 0],
        health: baseHealth,
        maxHealth: baseHealth,
        damaged: false,
      });
    });
  });

  return buildings;
}

function createInitialCreatures(): Creature[] {
  return [];
}

/**
 * 统计建筑和生物数量，并计算生命指数
 * 纯函数，避免重复的计数逻辑
 */
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

/**
 * 创建单个星球的初始状态
 * 封装星球创建逻辑，确保每个星球都有独立的状态
 */
function createPlanet(id: string, name: string, theme: PlanetThemeType): PlanetState {
  const initialBuildings = createInitialBuildings(theme);
  const initialCreatures = createInitialCreatures();
  const counts = updateCountsAndLifeIndex(initialBuildings, initialCreatures);

  return {
    id,
    name,
    theme,
    buildings: initialBuildings,
    creatures: initialCreatures,
    ...counts,
  };
}

/**
 * 创建所有初始星球列表
 * 目前包含五种不同主题的星球
 */
function createInitialPlanets(): PlanetState[] {
  return [
    createPlanet('planet-1', '翠绿星', 'forest'),
    createPlanet('planet-2', '沙漠星', 'desert'),
    createPlanet('planet-3', '冰雪星', 'ice'),
    createPlanet('planet-4', '熔岩星', 'lava'),
    createPlanet('planet-5', '海洋星', 'ocean'),
  ];
}

/**
 * 多星球游戏状态管理 Hook
 * 管理多个星球的状态，每个星球有独立的建造进度和生命指数
 * 提供统一的操作接口，内部通过 updateCurrentPlanet 避免重复代码
 */
export function useGameState() {
  const [gameState, setGameState] = useState<MultiPlanetGameState>(() => {
    const planets = createInitialPlanets();
    return {
      planets,
      currentPlanetId: planets[0].id,
      selectedTool: null,
    };
  });

  const currentPlanet = gameState.planets.find(p => p.id === gameState.currentPlanetId)!;

  /**
   * 选择/取消选择建造工具
   */
  const selectTool = useCallback((tool: ToolType | null) => {
    setGameState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  /**
   * 切换当前查看/操作的星球
   */
  const switchPlanet = useCallback((planetId: string) => {
    setGameState(prev => ({ ...prev, currentPlanetId: planetId }));
  }, []);

  /**
   * 更新当前星球状态的工具函数
   * 所有修改当前星球的操作都通过此函数，避免重复编写 planets.map 逻辑
   * 单一职责：只负责定位当前星球并应用更新
   */
  const updateCurrentPlanet = useCallback((updater: (planet: PlanetState) => PlanetState) => {
    setGameState(prev => ({
      ...prev,
      planets: prev.planets.map(p =>
        p.id === prev.currentPlanetId ? updater(p) : p
      ),
    }));
  }, []);

  /**
   * 在当前星球上添加建筑
   */
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

  /**
   * 在当前星球上添加生物
   */
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

  /**
   * 对当前星球上的建筑造成伤害
   * 由灾害系统调用，根据建筑类型和距离计算伤害
   */
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

  /**
   * 批量移除当前星球上的建筑
   * 用于灾害导致建筑完全损毁的情况
   */
  const removeBuildings = useCallback((ids: string[]) => {
    updateCurrentPlanet(prev => {
      const idSet = new Set(ids);
      const newBuildings = prev.buildings.filter(b => !idSet.has(b.id));
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, [updateCurrentPlanet]);

  /**
   * 移除单个建筑
   * 用于玩家手动删除建筑
   */
  const removeBuilding = useCallback((id: string) => {
    updateCurrentPlanet(prev => {
      const newBuildings = prev.buildings.filter(b => b.id !== id);
      const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
      return { ...prev, buildings: newBuildings, ...counts };
    });
  }, [updateCurrentPlanet]);

  /**
   * 移除单个生物
   * 用于玩家手动删除生物
   */
  const removeCreature = useCallback((id: string) => {
    updateCurrentPlanet(prev => {
      const newCreatures = prev.creatures.filter(c => c.id !== id);
      const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
      return { ...prev, creatures: newCreatures, ...counts };
    });
  }, [updateCurrentPlanet]);

  /**
   * 重置当前星球的所有建筑和生物
   */
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

  /**
   * 重置所有星球到初始状态
   */
  const resetAllPlanets = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      planets: prev.planets.map(p => createPlanet(p.id, p.name, p.theme)),
    }));
  }, []);

  return {
    gameState,
    currentPlanet,
    planets: gameState.planets,
    selectedTool: gameState.selectedTool,
    currentPlanetId: gameState.currentPlanetId,
    selectTool,
    switchPlanet,
    addBuilding,
    addCreature,
    damageBuildings,
    removeBuildings,
    removeBuilding,
    removeCreature,
    resetBuildings,
    resetAllPlanets,
  };
}
