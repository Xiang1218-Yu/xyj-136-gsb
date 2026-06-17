import { GameCanvas } from './components/GameCanvas';
import { BuildPanel } from './components/UI/BuildPanel';
import { StatusBar } from './components/UI/StatusBar';
import { HintText } from './components/UI/HintText';
import { DisasterAlert } from './components/UI/DisasterAlert';
import { DisasterInfoPanel } from './components/UI/DisasterInfoPanel';
import { TimeControlPanel } from './components/UI/TimeControlPanel';
import { VolumeControl } from './components/UI/VolumeControl';
import { PlanetSelector } from './components/UI/PlanetSelector';
import { useGameState } from './hooks/useGameState';
import { useDisasters } from './hooks/useDisasters';
import { useAudio } from './hooks/useAudio';
import { DayNightProvider } from './contexts/DayNightContext';
import { useEffect, useRef } from 'react';

function AppContent() {
  const {
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
  } = useGameState();

  const audio = useAudio(currentPlanet.lifeIndex, {
    forestCount: currentPlanet.forestCount,
    glacierCount: currentPlanet.glacierCount,
    grasslandCount: currentPlanet.grasslandCount,
    cityCount: currentPlanet.cityCount,
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
    buildings: currentPlanet.buildings,
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
        buildings={currentPlanet.buildings}
        creatures={currentPlanet.creatures}
        selectedTool={gameState.selectedTool}
        onAddBuilding={handleAddBuilding}
        onAddCreature={handleAddCreature}
        onRemoveBuilding={handleRemoveBuilding}
        onRemoveCreature={handleRemoveCreature}
        lifeIndex={currentPlanet.lifeIndex}
        disasters={activeDisasters}
        planetStyle={currentPlanet.style}
      />

      <PlanetSelector
        planets={gameState.planets}
        currentPlanetId={gameState.currentPlanetId}
        onSelectPlanet={switchPlanet}
      />

      <StatusBar
        lifeIndex={currentPlanet.lifeIndex}
        forestCount={currentPlanet.forestCount}
        glacierCount={currentPlanet.glacierCount}
        cityCount={currentPlanet.cityCount}
        grasslandCount={currentPlanet.grasslandCount}
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
