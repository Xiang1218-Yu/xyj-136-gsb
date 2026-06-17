import { GameCanvas } from './components/GameCanvas';
import { BuildPanel } from './components/UI/BuildPanel';
import { StatusBar } from './components/UI/StatusBar';
import { HintText } from './components/UI/HintText';
import { DisasterAlert } from './components/UI/DisasterAlert';
import { DisasterInfoPanel } from './components/UI/DisasterInfoPanel';
import { TimeControlPanel } from './components/UI/TimeControlPanel';
import { VolumeControl } from './components/UI/VolumeControl';
import { PlanetSwitcher } from './components/UI/PlanetSwitcher';
import { useGameState } from './hooks/useGameState';
import { useDisasters } from './hooks/useDisasters';
import { useAudio } from './hooks/useAudio';
import { DayNightProvider } from './contexts/DayNightContext';
import { useEffect, useRef } from 'react';

function AppContent() {
  const {
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
  } = useGameState();

  /* 当前星球不存在时显示加载状态 */
  if (!activePlanet) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-space-dark">
        <p className="text-white text-xl">加载中...</p>
      </div>
    );
  }

  return <AppWithPlanet
    gameState={gameState}
    activePlanet={activePlanet}
    switchPlanet={switchPlanet}
    selectTool={selectTool}
    addBuilding={addBuilding}
    addCreature={addCreature}
    damageBuildings={damageBuildings}
    removeBuildings={removeBuildings}
    removeBuilding={removeBuilding}
    removeCreature={removeCreature}
    resetBuildings={resetBuildings}
  />;
}

/* 包含活跃星球数据的主内容组件 */
function AppWithPlanet({
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
}: {
  gameState: ReturnType<typeof useGameState>['gameState'];
  activePlanet: NonNullable<ReturnType<typeof useGameState>['activePlanet']>;
  switchPlanet: (id: string) => void;
  selectTool: (tool: import('./types/game').ToolType | null) => void;
  addBuilding: (type: import('./types/game').BuildingType, position: [number, number, number]) => void;
  addCreature: (type: import('./types/game').CreatureType, position: [number, number, number]) => void;
  damageBuildings: (damages: { id: string; damage: number }[]) => void;
  removeBuildings: (ids: string[]) => void;
  removeBuilding: (id: string) => void;
  removeCreature: (id: string) => void;
  resetBuildings: () => void;
}) {
  const audio = useAudio(activePlanet.counts.lifeIndex, {
    forestCount: activePlanet.counts.forestCount,
    glacierCount: activePlanet.counts.glacierCount,
    grasslandCount: activePlanet.counts.grasslandCount,
    cityCount: activePlanet.counts.cityCount,
  });

  const prevSelectedToolRef = useRef(gameState.selectedTool);
  useEffect(() => {
    if (gameState.selectedTool !== prevSelectedToolRef.current) {
      if (gameState.selectedTool) {
        audio.playToolSelect();
      }
      prevSelectedToolRef.current = gameState.selectedTool;
    }
  }, [gameState.selectedTool, audio]);
  
  const {
    activeDisasters,
    recentDisaster,
    currentWarning,
    warningCountdown,
    triggerRandomDisaster,
    dismissWarning,
  } = useDisasters({
    buildings: activePlanet.buildings,
    onDamageBuildings: damageBuildings,
    onRemoveBuildings: removeBuildings,
  });

  const prevRecentDisasterRef = useRef<typeof recentDisaster>(null);
  const prevWarningRef = useRef<typeof currentWarning>(null);

  useEffect(() => {
    if (recentDisaster && recentDisaster.id !== prevRecentDisasterRef.current?.id) {
      audio.playDisaster(recentDisaster.type);
    }
    prevRecentDisasterRef.current = recentDisaster;
  }, [recentDisaster, audio]);

  useEffect(() => {
    if (currentWarning && currentWarning.id !== prevWarningRef.current?.id) {
      audio.playDisasterWarning();
    }
    prevWarningRef.current = currentWarning;
  }, [currentWarning, audio]);

  const handleAddBuilding = (type: any, position: [number, number, number]) => {
    addBuilding(type, position);
    audio.playBuildingPlace(type);
  };

  const handleAddCreature = (type: any, position: [number, number, number]) => {
    addCreature(type, position);
    audio.playCreaturePlace();
  };

  const handleRemoveBuilding = (id: string) => {
    removeBuilding(id);
    audio.playDelete();
  };

  const handleRemoveCreature = (id: string) => {
    removeCreature(id);
    audio.playDelete();
  };

  const handleReset = () => {
    resetBuildings();
    audio.playReset();
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-space-dark">
      <GameCanvas
        buildings={activePlanet.buildings}
        creatures={activePlanet.creatures}
        selectedTool={gameState.selectedTool}
        onAddBuilding={handleAddBuilding}
        onAddCreature={handleAddCreature}
        onRemoveBuilding={handleRemoveBuilding}
        onRemoveCreature={handleRemoveCreature}
        lifeIndex={activePlanet.counts.lifeIndex}
        disasters={activeDisasters}
        styleId={activePlanet.styleId}
      />

      <PlanetSwitcher
        planets={gameState.planets}
        activePlanetId={gameState.activePlanetId}
        onSwitchPlanet={switchPlanet}
      />

      <StatusBar
        planetName={activePlanet.name}
        lifeIndex={activePlanet.counts.lifeIndex}
        forestCount={activePlanet.counts.forestCount}
        glacierCount={activePlanet.counts.glacierCount}
        cityCount={activePlanet.counts.cityCount}
        grasslandCount={activePlanet.counts.grasslandCount}
      />

      <BuildPanel
        selectedTool={gameState.selectedTool}
        onSelectTool={selectTool}
        onReset={handleReset}
      />

      <HintText />

      <DisasterAlert
        disaster={recentDisaster}
        warning={currentWarning}
        warningCountdown={warningCountdown}
        onTriggerRandom={triggerRandomDisaster}
        onDismissWarning={dismissWarning}
      />

      <DisasterInfoPanel />

      <TimeControlPanel />

      <VolumeControl
        settings={audio.settings}
        currentStyle={audio.currentStyle}
        isInitialized={audio.isInitialized}
        onStartMusic={audio.startMusic}
        onSetMusicVolume={audio.setMusicVolume}
        onSetSfxVolume={audio.setSfxVolume}
        onToggleMute={audio.toggleMute}
      />

      <div className="fixed bottom-4 right-4 z-10 text-white/30 text-xs">
        <p>🌍 Planet Rebirth Simulator</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <DayNightProvider initialTime={0.3} initialSpeed={1}>
      <AppContent />
    </DayNightProvider>
  );
}

export default App;
