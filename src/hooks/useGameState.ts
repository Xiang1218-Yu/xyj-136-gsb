import { useState, useCallback, useMemo } from 'react';
import {
  Building,
  BuildingType,
  Creature,
  CreatureType,
  GameState,
  ToolType,
  PlanetId,
  PlanetData,
  MultiPlanetGameState,
} from '../types/game';
import {
  generateId,
  BUILDING_CONFIGS,
  PLANET_IDS,
  createInitialPlanetData,
  updateCountsAndLifeIndex,
} from '../utils/helpers';

/**
 * 创建所有星球的初始数据映射
 */
function createInitialPlanets(): Record<PlanetId, PlanetData> {
  const planets = {} as Record<PlanetId, PlanetData>;
  PLANET_IDS.forEach((id) => {
    planets[id] = createInitialPlanetData(id);
  });
  return planets;
}

/**
 * 多星球游戏状态管理 Hook
 *
 * 职责：
 * - 管理所有星球的独立数据（建筑、生物、生命指数）
 * - 处理星球切换逻辑
 * - 提供对当前星球的建造/删除操作
 * - 保持对原有 GameState 接口的兼容
 */
export function useGameState() {
  /** 完整的多星球游戏状态 */
  const [state, setState] = useState<MultiPlanetGameState>(() => ({
    currentPlanetId: 'earth',
    planets: createInitialPlanets(),
    selectedTool: null,
  }));

  /**
   * 当前选中星球的数据
   * 通过 useMemo 派生，避免重复计算
   */
  const currentPlanetData = useMemo<PlanetData>(
    () => state.planets[state.currentPlanetId],
    [state.planets, state.currentPlanetId]
  );

  /**
   * 兼容旧版 GameState 的派生数据
   * 所有原有的 gameState 属性都指向当前星球
   */
  const gameState: GameState & { currentPlanetId: PlanetId } = useMemo(
    () => ({
      ...currentPlanetData,
      selectedTool: state.selectedTool,
      currentPlanetId: state.currentPlanetId,
    }),
    [currentPlanetData, state.selectedTool, state.currentPlanetId]
  );

  /**
   * 更新指定星球的数据
   * 通用的不可变更新工具函数
   */
  const updatePlanet = useCallback(
    (planetId: PlanetId, updater: (data: PlanetData) => PlanetData) => {
      setState((prev) => ({
        ...prev,
        planets: {
          ...prev.planets,
          [planetId]: updater(prev.planets[planetId]),
        },
      }));
    },
    []
  );

  /**
   * 更新当前星球的数据
   */
  const updateCurrentPlanet = useCallback(
    (updater: (data: PlanetData) => PlanetData) => {
      updatePlanet(state.currentPlanetId, updater);
    },
    [state.currentPlanetId, updatePlanet]
  );

  /**
   * 切换当前查看的星球
   */
  const switchPlanet = useCallback((planetId: PlanetId) => {
    setState((prev) => ({
      ...prev,
      currentPlanetId: planetId,
    }));
  }, []);

  /**
   * 选择建造工具
   * 工具选择是全局的，切换星球时保持选中状态
   */
  const selectTool = useCallback((tool: ToolType | null) => {
    setState((prev) => ({ ...prev, selectedTool: tool }));
  }, []);

  /**
   * 在当前星球添加建筑
   */
  const addBuilding = useCallback(
    (type: BuildingType, position: [number, number, number]) => {
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

      updateCurrentPlanet((prev) => {
        const newBuildings = [...prev.buildings, building];
        const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
        return { ...prev, buildings: newBuildings, ...counts };
      });
    },
    [updateCurrentPlanet]
  );

  /**
   * 在当前星球添加生物
   */
  const addCreature = useCallback(
    (type: CreatureType, position: [number, number, number]) => {
      const creature: Creature = {
        id: generateId(),
        type,
        position,
        scale: 1,
        rotation: [0, Math.random() * Math.PI * 2, 0],
      };

      updateCurrentPlanet((prev) => {
        const newCreatures = [...prev.creatures, creature];
        const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
        return { ...prev, creatures: newCreatures, ...counts };
      });
    },
    [updateCurrentPlanet]
  );

  /**
   * 对当前星球的建筑造成伤害
   */
  const damageBuildings = useCallback(
    (damages: { id: string; damage: number }[]) => {
      updateCurrentPlanet((prev) => {
        const damageMap = new Map(damages.map((d) => [d.id, d.damage]));
        const newBuildings = prev.buildings.map((b) => {
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
    },
    [updateCurrentPlanet]
  );

  /**
   * 从当前星球批量移除建筑
   */
  const removeBuildings = useCallback(
    (ids: string[]) => {
      updateCurrentPlanet((prev) => {
        const idSet = new Set(ids);
        const newBuildings = prev.buildings.filter((b) => !idSet.has(b.id));
        const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
        return { ...prev, buildings: newBuildings, ...counts };
      });
    },
    [updateCurrentPlanet]
  );

  /**
   * 从当前星球移除单个建筑
   */
  const removeBuilding = useCallback(
    (id: string) => {
      updateCurrentPlanet((prev) => {
        const newBuildings = prev.buildings.filter((b) => b.id !== id);
        const counts = updateCountsAndLifeIndex(newBuildings, prev.creatures);
        return { ...prev, buildings: newBuildings, ...counts };
      });
    },
    [updateCurrentPlanet]
  );

  /**
   * 从当前星球移除单个生物
   */
  const removeCreature = useCallback(
    (id: string) => {
      updateCurrentPlanet((prev) => {
        const newCreatures = prev.creatures.filter((c) => c.id !== id);
        const counts = updateCountsAndLifeIndex(prev.buildings, newCreatures);
        return { ...prev, creatures: newCreatures, ...counts };
      });
    },
    [updateCurrentPlanet]
  );

  /**
   * 重置当前星球的所有建筑和生物
   */
  const resetBuildings = useCallback(() => {
    updateCurrentPlanet((prev) => ({
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
   * 重置所有星球
   */
  const resetAllPlanets = useCallback(() => {
    setState((prev) => ({
      ...prev,
      planets: createInitialPlanets(),
    }));
  }, []);

  return {
    // 兼容旧接口的属性（指向当前星球）
    gameState,
    selectTool,
    addBuilding,
    addCreature,
    damageBuildings,
    removeBuildings,
    removeBuilding,
    removeCreature,
    resetBuildings,
    // 多星球专属接口
    currentPlanetId: state.currentPlanetId,
    currentPlanetData,
    allPlanets: state.planets,
    switchPlanet,
    resetAllPlanets,
    // 工具方法
    updatePlanet,
  };
}
