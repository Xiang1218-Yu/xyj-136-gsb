import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_RADIUS, PLANET_STYLES } from '../utils/helpers';
import { createPlanetTexture, createCloudTexture } from '../utils/texture';
import { Building, Creature, ActiveDisaster, ToolType, PlanetStyle, PlanetId } from '../types/game';
import { Forest } from './Buildings/Forest';
import { Glacier } from './Buildings/Glacier';
import { City } from './Buildings/City';
import { Grassland } from './Buildings/Grassland';
import { Creature as CreatureComponent } from './Creatures/Creatures';
import { DisasterEffect } from './DisasterEffect';

interface PlanetProps {
  onClick?: (point: THREE.Vector3) => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onRemoveBuilding?: (id: string) => void;
  onRemoveCreature?: (id: string) => void;
  selectedTool?: ToolType | null;
  lifeIndex: number;
  buildings?: Building[];
  creatures?: Creature[];
  disasters?: ActiveDisaster[];
  /** 星球视觉风格 */
  planetStyle?: PlanetStyle;
  /** 星球 ID，用于从预设中获取风格 */
  planetId?: PlanetId;
}

/**
 * 创建带地形起伏的球体几何
 *
 * @param radius 星球半径
 * @param widthSeg 横向分段数
 * @param heightSeg 纵向分段数
 * @param heightScale 地形起伏强度系数
 */
function createTerrainGeometry(
  radius: number,
  widthSeg: number,
  heightSeg: number,
  heightScale: number = 0.015
): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    const noise =
      Math.sin(vertex.x * 2.5) * Math.cos(vertex.y * 2.5) * heightScale +
      Math.sin(vertex.x * 5 + vertex.y * 3) * Math.cos(vertex.z * 4) * (heightScale * 0.5) +
      Math.cos(vertex.y * 6) * Math.sin(vertex.z * 6) * (heightScale * 0.3);

    vertex.normalize().multiplyScalar(radius + noise);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * 解析十六进制颜色为 RGB 数值
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }
  return { r: 0.5, g: 0.5, b: 0.5 };
}

function BuildingHealthBar({ health, maxHealth }: { health: number; maxHealth: number }) {
  const percent = health / maxHealth;
  const color = percent > 0.6 ? '#7cfc00' : percent > 0.3 ? '#ffa500' : '#ff6b6b';
  
  return (
    <group position={[0, 0.18, 0]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.2, 0.025]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-(0.1 - 0.1 * percent), 0, 0.001]}>
        <planeGeometry args={[0.2 * percent, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export function Planet({
  onClick,
  onPointerOver,
  onPointerOut,
  onRemoveBuilding,
  onRemoveCreature,
  selectedTool,
  lifeIndex,
  buildings = [],
  creatures = [],
  disasters = [],
  planetStyle: customPlanetStyle,
  planetId = 'earth',
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const terrainRef = useRef<THREE.Mesh>(null);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [hoveredCreatureId, setHoveredCreatureId] = useState<string | null>(null);

  /**
   * 解析星球风格：优先使用传入的 style，否则根据 planetId 从预设获取
   */
  const style = useMemo<PlanetStyle>(() => {
    return customPlanetStyle || PLANET_STYLES[planetId] || PLANET_STYLES.earth;
  }, [customPlanetStyle, planetId]);

  const planetTexture = useMemo(() => createPlanetTexture(style), [style]);
  const cloudTexture = useMemo(() => createCloudTexture(style.cloudColor), [style]);

  const terrainGeometry = useMemo(
    () => createTerrainGeometry(PLANET_RADIUS + 0.005, 128, 128, style.terrainHeight),
    [style]
  );

  /**
   * 根据生命指数调整星球颜色
   * 基于星球风格的基础颜色和目标色调进行插值
   */
  useEffect(() => {
    const t = lifeIndex / 100;
    if (planetRef.current) {
      const mat = planetRef.current.material as THREE.MeshStandardMaterial;
      const baseRgb = hexToRgb(style.primaryColor);
      mat.color.setRGB(
        baseRgb.r + t * style.lifeTint.r,
        baseRgb.g + t * style.lifeTint.g,
        baseRgb.b + t * style.lifeTint.b
      );
    }
  }, [lifeIndex, style]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.015;
    }
    if (terrainRef.current) {
      terrainRef.current.rotation.y += delta * 0.03;
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onClick && groupRef.current) {
      const localPoint = groupRef.current.worldToLocal(event.point.clone());
      onClick(localPoint);
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        onClick={handleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[PLANET_RADIUS, 128, 128]} />
        <meshStandardMaterial
          map={planetTexture}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      <mesh ref={terrainRef} receiveShadow>
        <primitive object={terrainGeometry} attach="geometry" />
        <meshStandardMaterial
          map={planetTexture}
          transparent
          opacity={0.6}
          roughness={0.95}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {style.hasClouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[PLANET_RADIUS + 0.05, 64, 64]} />
          <meshStandardMaterial
            map={cloudTexture}
            color={style.cloudColor}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      )}

      {buildings.map((building) => {
        const normal = new THREE.Vector3(...building.position).normalize();
        const surfacePos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.03);
        const position: [number, number, number] = [
          surfacePos.x,
          surfacePos.y,
          surfacePos.z,
        ];
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );

        const healthPercent = building.health / building.maxHealth;
        const isDamaged = building.damaged;
        const buildingOpacity = isDamaged ? 0.7 + Math.sin(Date.now() * 0.005) * 0.1 : 1;
        const isDeleteMode = selectedTool === 'delete';
        const isHovered = hoveredBuildingId === building.id;

        let BuildingComponent;
        if (building.type === 'forest') BuildingComponent = Forest;
        else if (building.type === 'glacier') BuildingComponent = Glacier;
        else if (building.type === 'city') BuildingComponent = City;
        else BuildingComponent = Grassland;

        const handleBuildingClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isDeleteMode && onRemoveBuilding) {
            onRemoveBuilding(building.id);
          }
        };

        const handleBuildingPointerOver = (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (isDeleteMode) {
            setHoveredBuildingId(building.id);
            document.body.style.cursor = 'pointer';
          }
        };

        const handleBuildingPointerOut = (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (isDeleteMode) {
            setHoveredBuildingId(null);
            document.body.style.cursor = 'auto';
          }
        };

        return (
          <group 
            key={building.id} 
            position={position} 
            quaternion={quaternion} 
            scale={building.scale}
            onClick={handleBuildingClick}
            onPointerOver={handleBuildingPointerOver}
            onPointerOut={handleBuildingPointerOut}
          >
            <group scale={healthPercent < 0.3 ? [0.85, 0.85, 0.85] : [1, 1, 1]}>
              <BuildingComponent position={[0, 0, 0]} scale={1} />
            </group>
            {isDamaged && (
              <BuildingHealthBar health={building.health} maxHealth={building.maxHealth} />
            )}
            {isDamaged && (
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.02 + Math.random() * 0.01, 8, 8]} />
                <meshBasicMaterial color="#666666" transparent opacity={0.6} />
              </mesh>
            )}
            {isDeleteMode && isHovered && (
              <mesh position={[0, 0.05, 0]}>
                <ringGeometry args={[0.15, 0.17, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {creatures.map((creature) => {
        const normal = new THREE.Vector3(...creature.position).normalize();
        const surfacePos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.03);
        const position: [number, number, number] = [
          surfacePos.x,
          surfacePos.y,
          surfacePos.z,
        ];
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );

        const isDeleteMode = selectedTool === 'delete';
        const isHovered = hoveredCreatureId === creature.id;

        const handleCreatureClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isDeleteMode && onRemoveCreature) {
            onRemoveCreature(creature.id);
          }
        };

        const handleCreaturePointerOver = (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (isDeleteMode) {
            setHoveredCreatureId(creature.id);
            document.body.style.cursor = 'pointer';
          }
        };

        const handleCreaturePointerOut = (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (isDeleteMode) {
            setHoveredCreatureId(null);
            document.body.style.cursor = 'auto';
          }
        };

        return (
          <group
            key={creature.id}
            position={position}
            quaternion={quaternion}
            scale={creature.scale}
            onClick={handleCreatureClick}
            onPointerOver={handleCreaturePointerOver}
            onPointerOut={handleCreaturePointerOut}
          >
            <CreatureComponent type={creature.type} position={[0, 0, 0]} scale={1} />
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {isDeleteMode && isHovered && (
              <mesh position={[0, 0.2, 0]}>
                <ringGeometry args={[0.25, 0.3, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}

      {disasters.map((disaster) => (
        <DisasterEffect key={disaster.id} disaster={disaster} />
      ))}

      {/* 大气层效果 - 基于星球风格颜色 */}
      <mesh scale={1.06}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={style.atmosphereColor}
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.15}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={style.atmosphereColor}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.28}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={style.atmosphereColor}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

