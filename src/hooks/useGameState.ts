import { useState, useCallback } from 'react';
import { Building, BuildingType, Creature, CreatureType, GameState, ToolType, PlanetStyleId, PlanetData, PlanetCounts } from '../types/game';
import { generateId, calculateLifeIndex, PLANET_RADIUS, BUILDING_CONFIGS, CREATURE_CONFIGS, updateCountsAndLifeIndex, createPlanetData } from '../utils/helpers';

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

    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newBuildings = [...planet.buildings, building];
        const counts = updateCountsAndLifeIndex(newBuildings, planet.creatures);
        return { ...planet, buildings: newBuildings, counts };
      });
      return { ...prev, planets: newPlanets };
    });
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

    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newCreatures = [...planet.creatures, creature];
        const counts = updateCountsAndLifeIndex(planet.buildings, newCreatures);
        return { ...planet, creatures: newCreatures, counts };
      });
      return { ...prev, planets: newPlanets };
    });
  }, [activePlanet]);

  /* 对当前星球的建筑造成伤害（灾害系统调用） */
  const damageBuildings = useCallback((damages: { id: string; damage: number }[]) => {
    setGameState(prev => {
      const damageMap = new Map(damages.map(d => [d.id, d.damage]));
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newBuildings = planet.buildings.map(b => {
          const damage = damageMap.get(b.id);
          if (damage !== undefined) {
            const newHealth = Math.max(0, b.health - damage);
            return { ...b, health: newHealth, damaged: newHealth < b.maxHealth * 0.6 };
          }
          return b;
        });
        const counts = updateCountsAndLifeIndex(newBuildings, planet.creatures);
        return { ...planet, buildings: newBuildings, counts };
      });
      return { ...prev, planets: newPlanets };
    });
  }, []);

  /* 批量删除当前星球的建筑（灾害摧毁） */
  const removeBuildings = useCallback((ids: string[]) => {
    setGameState(prev => {
      const idSet = new Set(ids);
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newBuildings = planet.buildings.filter(b => !idSet.has(b.id));
        const counts = updateCountsAndLifeIndex(newBuildings, planet.creatures);
        return { ...planet, buildings: newBuildings, counts };
      });
      return { ...prev, planets: newPlanets };
    });
  }, []);

  /* 删除当前星球的单个建筑 */
  const removeBuilding = useCallback((id: string) => {
    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newBuildings = planet.buildings.filter(b => b.id !== id);
        const counts = updateCountsAndLifeIndex(newBuildings, planet.creatures);
        return { ...planet, buildings: newBuildings, counts };
      });
      return { ...prev, planets: newPlanets };
    });
  }, []);

  /* 删除当前星球的单个生物 */
  const removeCreature = useCallback((id: string) => {
    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const newCreatures = planet.creatures.filter(c => c.id !== id);
        const counts = updateCountsAndLifeIndex(planet.buildings, newCreatures);
        return { ...planet, creatures: newCreatures, counts };
      });
      return { ...prev, planets: newPlanets };
    });
  }, []);

  /* 重置当前星球的所有建筑和生物 */
  const resetBuildings = useCallback(() => {
    if (!activePlanet) return;

    setGameState(prev => {
      const newPlanets = prev.planets.map(planet => {
        if (planet.id !== prev.activePlanetId) return planet;
        const resetPlanet = createPlanetData(planet.id, planet.name, planet.styleId);
        return resetPlanet;
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
