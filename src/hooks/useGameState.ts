import { useState, useCallback } from 'react';
import { Building, BuildingType, Creature, CreatureType, GameState, ToolType, PlanetStyleId, PlanetData, PlanetCounts } from '../types/game';
import { generateId, PLANET_RADIUS, BUILDING_CONFIGS, updateCountsAndLifeIndex, createPlanetData } from '../utils/helpers';

/* 创建初始星球列表，包含4个不同风格的星球 */
function createInitialPlanets(): PlanetData[] {
  const styles: PlanetStyleId[] = ['terra', 'volcanic', 'frozen', 'desert'];
  return styles.map((styleId) => createPlanetData(generateId(), PLANET_STYLE_NAMES[styleId], styleId));
}

/* 星球风格对应的默认名称 */
const PLANET_STYLE_NAMES: Record<PlanetStyleId, string> = {
  terra: '盖亚星',
  volcanic: '炎核星',
  frozen: '霜晶星',
  desert: '沙海星',
};

/**
 * 通用辅助函数：仅更新当前活跃星球的建筑/生物，并自动重算计数和生命指数。
 * 所有只涉及修改 buildings/creatures 的操作都通过此函数消除重复的 map + filter + updateCounts 模式。
 */
function updateActivePlanet(
  prev: GameState,
  updater: (planet: PlanetData) => Partial<Pick<PlanetData, 'buildings' | 'creatures'>>
): GameState {
  const newPlanets = prev.planets.map(planet => {
    if (planet.id !== prev.activePlanetId) return planet;
    const changes = updater(planet);
    const buildings = changes.buildings ?? planet.buildings;
    const creatures = changes.creatures ?? planet.creatures;
    const counts = updateCountsAndLifeIndex(buildings, creatures);
    return { ...planet, ...changes, counts };
  });
  return { ...prev, planets: newPlanets };
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const planets = createInitialPlanets();
    return {
      planets,
      activePlanetId: planets[0].id,
      selectedTool: null,
    };
  });

  /* 获取当前活跃星球数据 */
  const activePlanet = gameState.planets.find(p => p.id === gameState.activePlanetId);

  /* 切换当前活跃星球 */
  const switchPlanet = useCallback((planetId: string) => {
    setGameState(prev => ({ ...prev, activePlanetId: planetId }));
  }, []);

  /* 选择建造/删除工具 */
  const selectTool = useCallback((tool: ToolType | null) => {
    setGameState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  /* 在当前星球上添加建筑 */
  const addBuilding = useCallback((type: BuildingType, position: [number, number, number]) => {
    if (!activePlanet) return;

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

    setGameState(prev => updateActivePlanet(prev, planet => ({
      buildings: [...planet.buildings, building],
    })));
  }, [activePlanet]);

  /* 在当前星球上添加生物 */
  const addCreature = useCallback((type: CreatureType, position: [number, number, number]) => {
    if (!activePlanet) return;

    const creature: Creature = {
      id: generateId(),
      type,
      position,
      scale: 1,
      rotation: [0, Math.random() * Math.PI * 2, 0],
    };

    setGameState(prev => updateActivePlanet(prev, planet => ({
      creatures: [...planet.creatures, creature],
    })));
  }, [activePlanet]);

  /* 对当前星球的建筑造成伤害（灾害系统调用） */
  const damageBuildings = useCallback((damages: { id: string; damage: number }[]) => {
    setGameState(prev => updateActivePlanet(prev, planet => {
      const damageMap = new Map(damages.map(d => [d.id, d.damage]));
      const newBuildings = planet.buildings.map(b => {
        const damage = damageMap.get(b.id);
        if (damage !== undefined) {
          const newHealth = Math.max(0, b.health - damage);
          return { ...b, health: newHealth, damaged: newHealth < b.maxHealth * 0.6 };
        }
        return b;
      });
      return { buildings: newBuildings };
    }));
  }, []);

  /* 批量删除当前星球的建筑（灾害摧毁） */
  const removeBuildings = useCallback((ids: string[]) => {
    setGameState(prev => updateActivePlanet(prev, planet => {
      const idSet = new Set(ids);
      return { buildings: planet.buildings.filter(b => !idSet.has(b.id)) };
    }));
  }, []);

  /* 删除当前星球的单个建筑 */
  const removeBuilding = useCallback((id: string) => {
    setGameState(prev => updateActivePlanet(prev, planet => ({
      buildings: planet.buildings.filter(b => b.id !== id),
    })));
  }, []);

  /* 删除当前星球的单个生物 */
  const removeCreature = useCallback((id: string) => {
    setGameState(prev => updateActivePlanet(prev, planet => ({
      creatures: planet.creatures.filter(c => c.id !== id),
    })));
  }, []);

  /* 重置当前星球的所有建筑和生物 */
  const resetBuildings = useCallback(() => {
    if (!activePlanet) return;

    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        return createPlanetData(planet.id, planet.name, planet.styleId);
      });
      return { ...prev, planets: newPlanets };
    });
  }, [activePlanet]);

  return {
    gameState,
    activePlanet,
    switchPlanet,
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
