import { useState, useEffect, useCallback, useRef } from 'react';
import { audioSystem, AudioSettings, MusicStyle } from '../audio/AudioSystem';
import { BuildingType, DisasterType } from '../types/game';

interface BuildingCounts {
  forestCount: number;
  glacierCount: number;
  cityCount: number;
  grasslandCount: number;
}

export function useAudio(lifeIndex: number, buildingCounts: BuildingCounts) {
  const [settings, setSettings] = useState<AudioSettings>(audioSystem.getSettings());
  const [currentStyle, setCurrentStyle] = useState<MusicStyle>('barren');
  const [isInitialized, setIsInitialized] = useState(false);
  const prevLifeIndexRef = useRef(lifeIndex);

  const updateSettings = useCallback(() => {
    setSettings(audioSystem.getSettings());
  }, []);

  const startMusic = useCallback(() => {
    audioSystem.startMusic(lifeIndex, buildingCounts);
    setCurrentStyle(audioSystem.getMusicStyleForLifeIndex(lifeIndex));
    setIsInitialized(true);
    updateSettings();
  }, [lifeIndex, buildingCounts, updateSettings]);

  const stopMusic = useCallback(() => {
    audioSystem.stopMusic();
    setIsInitialized(false);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    audioSystem.setMusicVolume(volume);
    updateSettings();
  }, [updateSettings]);

  const setSfxVolume = useCallback((volume: number) => {
    audioSystem.setSfxVolume(volume);
    updateSettings();
  }, [updateSettings]);

  const setMuted = useCallback((muted: boolean) => {
    audioSystem.setMuted(muted);
    updateSettings();
  }, [updateSettings]);

  const toggleMute = useCallback(() => {
    audioSystem.toggleMute();
    updateSettings();
  }, [updateSettings]);

  const playToolSelect = useCallback(() => {
    audioSystem.playToolSelect();
  }, []);

  const playBuildingPlace = useCallback((type: BuildingType) => {
    audioSystem.playBuildingPlace(type);
  }, []);

  const playCreaturePlace = useCallback(() => {
    audioSystem.playCreaturePlace();
  }, []);

  const playDelete = useCallback(() => {
    audioSystem.playDelete();
  }, []);

  const playReset = useCallback(() => {
    audioSystem.playReset();
  }, []);

  const playDisaster = useCallback((type: DisasterType) => {
    audioSystem.playDisaster(type);
  }, []);

  const playDisasterWarning = useCallback(() => {
    audioSystem.playDisasterWarning();
  }, []);

  const playMilestone = useCallback(() => {
    audioSystem.playMilestone();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      audioSystem.updateMusic(lifeIndex, buildingCounts);
      const newStyle = audioSystem.getMusicStyleForLifeIndex(lifeIndex);
      if (newStyle !== currentStyle) {
        setCurrentStyle(newStyle);
      }

      const milestones = [10, 30, 50, 70, 90];
      const prevIndex = prevLifeIndexRef.current;
      for (const milestone of milestones) {
        if (prevIndex < milestone && lifeIndex >= milestone) {
          audioSystem.playMilestone();
          break;
        }
      }
      prevLifeIndexRef.current = lifeIndex;
    }
  }, [lifeIndex, buildingCounts, isInitialized, currentStyle]);

  useEffect(() => {
    return () => {
      audioSystem.destroy();
    };
  }, []);

  return {
    settings,
    currentStyle,
    isInitialized,
    startMusic,
    stopMusic,
    setMusicVolume,
    setSfxVolume,
    setMuted,
    toggleMute,
    playToolSelect,
    playBuildingPlace,
    playCreaturePlace,
    playDelete,
    playReset,
    playDisaster,
    playDisasterWarning,
    playMilestone,
  };
}
