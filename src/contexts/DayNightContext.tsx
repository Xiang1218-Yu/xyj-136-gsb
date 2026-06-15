import { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import * as THREE from 'three';

interface DayNightContextType {
  timeOfDay: number;
  daySpeed: number;
  sunPosition: THREE.Vector3;
  moonPosition: THREE.Vector3;
  sunIntensity: number;
  ambientIntensity: number;
  skyColor: THREE.Color;
  sunColor: THREE.Color;
  isNight: boolean;
  isDaytime: boolean;
  isDawn: boolean;
  isDusk: boolean;
  nightFactor: number;
  dayFactor: number;
  setDaySpeed: (speed: number) => void;
  setTimeOfDay: (time: number) => void;
  togglePause: () => void;
  isPaused: boolean;
}

const DayNightContext = createContext<DayNightContextType | null>(null);

const SUN_ORBIT_RADIUS = 15;
const MOON_ORBIT_RADIUS = 12;
const UI_UPDATE_INTERVAL = 60;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

interface ComputedValues {
  sunPosition: THREE.Vector3;
  moonPosition: THREE.Vector3;
  sunIntensity: number;
  ambientIntensity: number;
  skyColor: THREE.Color;
  sunColor: THREE.Color;
  isNight: boolean;
  isDaytime: boolean;
  isDawn: boolean;
  isDusk: boolean;
  nightFactor: number;
  dayFactor: number;
}

function computeDayNightValues(timeOfDay: number): ComputedValues {
  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunPosition = new THREE.Vector3(
    Math.cos(sunAngle) * SUN_ORBIT_RADIUS,
    Math.sin(sunAngle) * SUN_ORBIT_RADIUS,
    0
  );

  const moonAngle = sunAngle + Math.PI;
  const moonPosition = new THREE.Vector3(
    Math.cos(moonAngle) * MOON_ORBIT_RADIUS,
    Math.sin(moonAngle) * MOON_ORBIT_RADIUS,
    0
  );

  const sunHeight = Math.sin(sunAngle);

  const nightColor = new THREE.Color('#0a0e27');
  const dawnColor = new THREE.Color('#ff9966');
  const dayColor = new THREE.Color('#87ceeb');
  const duskColor = new THREE.Color('#ff7e5f');
  const deepNightColor = new THREE.Color('#050814');

  const middaySunColor = new THREE.Color('#fff8e7');
  const dawnSunColor = new THREE.Color('#ff7e5f');
  const duskSunColor = new THREE.Color('#ff6b35');

  let sunIntensity: number;
  let ambientIntensity: number;
  let skyColor: THREE.Color;
  let sunColor: THREE.Color;
  let isNight = false;
  let isDaytime = false;
  let isDawn = false;
  let isDusk = false;
  let nightFactor: number;
  let dayFactor: number;

  if (sunHeight < -0.3) {
    isNight = true;
    nightFactor = 1;
    dayFactor = 0;
    sunIntensity = 0;
    ambientIntensity = 0.12;
    const nightT = Math.min(1, (-sunHeight - 0.3) / 0.4);
    skyColor = nightColor.clone().lerp(deepNightColor, nightT);
    sunColor = middaySunColor.clone();
  } else if (sunHeight < -0.1) {
    const t = (sunHeight + 0.3) / 0.2;
    nightFactor = t;
    dayFactor = 0;
    if (timeOfDay > 0.2 && timeOfDay < 0.5) {
      isDawn = true;
      skyColor = nightColor.clone().lerp(dawnColor, t);
    } else {
      isDusk = true;
      skyColor = nightColor.clone().lerp(duskColor, t);
    }
    sunIntensity = t * 0.5;
    ambientIntensity = 0.12 + t * 0.2;
    sunColor = dawnSunColor.clone();
  } else if (sunHeight < 0.3) {
    const t = (sunHeight + 0.1) / 0.4;
    nightFactor = 0;
    dayFactor = t;
    isDaytime = true;
    if (timeOfDay > 0.2 && timeOfDay < 0.5) {
      isDawn = true;
      skyColor = dawnColor.clone().lerp(dayColor, t);
      sunColor = dawnSunColor.clone().lerp(middaySunColor, t);
    } else {
      isDusk = true;
      skyColor = duskColor.clone().lerp(dayColor, t);
      sunColor = duskSunColor.clone().lerp(middaySunColor, t);
    }
    sunIntensity = 0.5 + t * 0.8;
    ambientIntensity = 0.32 + t * 0.28;
  } else if (sunHeight < 0.7) {
    const t = (sunHeight - 0.3) / 0.4;
    nightFactor = 0;
    dayFactor = 1;
    isDaytime = true;
    sunIntensity = 1.3 + t * 0.4;
    ambientIntensity = 0.6 + t * 0.15;
    skyColor = dayColor.clone();
    sunColor = middaySunColor.clone();
  } else {
    nightFactor = 0;
    dayFactor = 1;
    isDaytime = true;
    sunIntensity = 1.7;
    ambientIntensity = 0.75;
    skyColor = dayColor.clone();
    sunColor = middaySunColor.clone();
  }

  return {
    sunPosition,
    moonPosition,
    sunIntensity,
    ambientIntensity,
    skyColor,
    sunColor,
    isNight,
    isDaytime,
    isDawn,
    isDusk,
    nightFactor,
    dayFactor,
  };
}

interface DayNightProviderProps {
  children: ReactNode;
  initialTime?: number;
  initialSpeed?: number;
}

export function DayNightProvider({ 
  children, 
  initialTime = 0.25, 
  initialSpeed = 1 
}: DayNightProviderProps) {
  const [timeOfDay, setTimeOfDayState] = useState(initialTime);
  const [daySpeed, setDaySpeedState] = useState(initialSpeed);
  const [isPaused, setIsPaused] = useState(false);
  
  const timeRef = useRef(initialTime);
  const speedRef = useRef(initialSpeed);
  const pausedRef = useRef(false);
  const computedRef = useRef<ComputedValues>(computeDayNightValues(initialTime));
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  const computed = useMemo(() => computeDayNightValues(timeOfDay), [timeOfDay]);

  const setDaySpeed = useCallback((speed: number) => {
    const clamped = clamp(speed, 0, 20);
    speedRef.current = clamped;
    setDaySpeedState(clamped);
  }, []);

  const setTimeOfDay = useCallback((time: number) => {
    const clamped = ((time % 1) + 1) % 1;
    timeRef.current = clamped;
    computedRef.current = computeDayNightValues(clamped);
    setTimeOfDayState(clamped);
  }, []);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      timeRef.current = (timeRef.current + delta * speedRef.current * 0.03) % 1;
      computedRef.current = computeDayNightValues(timeRef.current);

      if (timestamp - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL) {
        lastUiUpdateRef.current = timestamp;
        setTimeOfDayState(timeRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const contextValue = useMemo<DayNightContextType>(() => ({
    timeOfDay,
    daySpeed,
    sunPosition: computed.sunPosition,
    moonPosition: computed.moonPosition,
    sunIntensity: computed.sunIntensity,
    ambientIntensity: computed.ambientIntensity,
    skyColor: computed.skyColor,
    sunColor: computed.sunColor,
    isNight: computed.isNight,
    isDaytime: computed.isDaytime,
    isDawn: computed.isDawn,
    isDusk: computed.isDusk,
    nightFactor: computed.nightFactor,
    dayFactor: computed.dayFactor,
    setDaySpeed,
    setTimeOfDay,
    togglePause,
    isPaused,
  }), [
    timeOfDay,
    daySpeed,
    computed.sunPosition,
    computed.moonPosition,
    computed.sunIntensity,
    computed.ambientIntensity,
    computed.skyColor,
    computed.sunColor,
    computed.isNight,
    computed.isDaytime,
    computed.isDawn,
    computed.isDusk,
    computed.nightFactor,
    computed.dayFactor,
    setDaySpeed,
    setTimeOfDay,
    togglePause,
    isPaused,
  ]);

  return (
    <DayNightContext.Provider value={contextValue}>
      {children}
    </DayNightContext.Provider>
  );
}

export function useDayNight() {
  const context = useContext(DayNightContext);
  if (!context) {
    throw new Error('useDayNight must be used within a DayNightProvider');
  }
  return context;
}
