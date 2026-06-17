import { useRef, useMemo, useEffect, useState, ReactNode } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_RADIUS, PLANET_THEME_CONFIGS } from '../utils/helpers';
import { createThemedPlanetTexture, createCloudTexture } from '../utils/texture';
import { Building, Creature, ActiveDisaster, ToolType, PlanetThemeType, BuildingType } from '../types/game';
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
  theme?: PlanetThemeType;
}

interface SurfaceObjectProps {
  id: string;
  position: [number, number, number];
  scale: number;
  children: ReactNode;
  isDeleteMode: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  deleteRingSize?: number;
  hitAreaSize?: number;
}

const BUILDING_COMPONENTS: Record<BuildingType, typeof Forest> = {
  forest: Forest,
  glacier: Glacier,
  city: City,
  grassland: Grassland,
};

/**
 * 生成带有噪声的地形几何体
 * 通过多层正弦/余弦函数叠加模拟自然地形起伏
 */
function createTerrainGeometry(radius: number, widthSeg: number, heightSeg: number): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    const noise =
      Math.sin(vertex.x * 2.5) * Math.cos(vertex.y * 2.5) * 0.015 +
      Math.sin(vertex.x * 5 + vertex.y * 3) * Math.cos(vertex.z * 4) * 0.008 +
      Math.cos(vertex.y * 6) * Math.sin(vertex.z * 6) * 0.005;

    vertex.normalize().multiplyScalar(radius + noise);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * 建筑血条组件
 * 显示建筑当前生命值占最大生命值的百分比
 * 生命值越低颜色越红
 */
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

/**
 * 计算星球表面物体的位置和朝向
 * 将物体放置在球面上，并使其法线方向与球面法向一致
 */
function computeSurfaceTransform(position: [number, number, number]): {
  position: [number, number, number];
  quaternion: THREE.Quaternion;
} {
  const normal = new THREE.Vector3(...position).normalize();
  const surfacePos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.03);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    normal
  );
  return {
    position: [surfacePos.x, surfacePos.y, surfacePos.z],
    quaternion,
  };
}

/**
 * 星球表面物体通用容器组件
 * 处理建筑和生物共有的：表面放置、删除模式、悬停高亮等逻辑
 * 消除建筑和生物渲染中的重复代码
 */
function SurfaceObject({
  id,
  position,
  scale,
  children,
  isDeleteMode,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
  deleteRingSize = 0.15,
  hitAreaSize = 0.3,
}: SurfaceObjectProps) {
  const transform = useMemo(() => computeSurfaceTransform(position), [position]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) {
      onClick();
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) {
      onPointerOver();
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) {
      onPointerOut();
      document.body.style.cursor = 'auto';
    }
  };

  return (
    <group
      key={id}
      position={transform.position}
      quaternion={transform.quaternion}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
      {/* 点击碰撞体，扩大点击区域 */}
      <mesh position={[0, hitAreaSize * 0.3, 0]}>
        <sphereGeometry args={[hitAreaSize, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* 删除模式下的悬停高亮圆环 */}
      {isDeleteMode && isHovered && (
        <mesh position={[0, hitAreaSize * 0.5, 0]}>
          <ringGeometry args={[deleteRingSize, deleteRingSize + 0.02, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * 星球主组件
 * 渲染星球本体、地形、云层、建筑、生物、灾害效果和大气层
 * 支持多种主题风格，每个主题有独立的纹理、颜色和旋转速度
 */
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
  theme = 'forest',
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const terrainRef = useRef<THREE.Mesh>(null);

  // 悬停状态追踪
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [hoveredCreatureId, setHoveredCreatureId] = useState<string | null>(null);

  const themeConfig = PLANET_THEME_CONFIGS[theme];

  // 纹理和几何体使用 useMemo 缓存，避免重复创建
  const planetTexture = useMemo(() => createThemedPlanetTexture(theme), [theme]);
  const cloudTexture = useMemo(() => createCloudTexture(), []);
  const terrainGeometry = useMemo(
    () => createTerrainGeometry(PLANET_RADIUS + 0.005, 128, 128),
    []
  );

  /**
   * 生命指数变化时更新星球颜色
   * 生命指数越高，星球颜色越明亮鲜艳
   */
  useEffect(() => {
    const t = lifeIndex / 100;
    if (planetRef.current) {
      const mat = planetRef.current.material as THREE.MeshStandardMaterial;
      const baseColor = new THREE.Color(themeConfig.baseColor);
      mat.color.setRGB(
        baseColor.r * (0.7 + t * 0.3),
        baseColor.g * (0.7 + t * 0.3),
        baseColor.b * (0.7 + t * 0.3)
      );
    }
  }, [lifeIndex, themeConfig.baseColor]);

  /**
   * 每帧更新动画
   * 星球自转、云层飘动、地形跟随旋转
   */
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * themeConfig.rotationSpeed;
    }
    if (cloudsRef.current && themeConfig.hasClouds) {
      cloudsRef.current.rotation.y += delta * themeConfig.rotationSpeed * 0.5;
    }
    if (terrainRef.current) {
      terrainRef.current.rotation.y += delta * themeConfig.rotationSpeed;
    }
  });

  /**
   * 星球表面点击处理
   * 将世界坐标转换为星球局部坐标后传递给父组件
   */
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onClick && groupRef.current) {
      const localPoint = groupRef.current.worldToLocal(event.point.clone());
      onClick(localPoint);
    }
  };

  const isDeleteMode = selectedTool === 'delete';

  return (
    <group ref={groupRef}>
      {/* 星球本体 */}
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

      {/* 地形层 - 增加表面细节 */}
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

      {/* 云层 - 根据主题配置决定是否显示 */}
      {themeConfig.hasClouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[PLANET_RADIUS + 0.05, 64, 64]} />
          <meshStandardMaterial
            map={cloudTexture}
            color={themeConfig.cloudColor}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 建筑列表渲染 */}
      {buildings.map((building) => {
        const BuildingComponent = BUILDING_COMPONENTS[building.type];
        const isDamaged = building.damaged;
        const healthPercent = building.health / building.maxHealth;

        return (
          <SurfaceObject
            key={building.id}
            id={building.id}
            position={building.position}
            scale={building.scale}
            isDeleteMode={isDeleteMode}
            isHovered={hoveredBuildingId === building.id}
            onClick={() => onRemoveBuilding?.(building.id)}
            onPointerOver={() => setHoveredBuildingId(building.id)}
            onPointerOut={() => setHoveredBuildingId(null)}
            deleteRingSize={0.15}
            hitAreaSize={0.3}
          >
            {/* 受损时建筑缩小 */}
            <group scale={healthPercent < 0.3 ? [0.85, 0.85, 0.85] : [1, 1, 1]}>
              <BuildingComponent position={[0, 0, 0]} scale={1} />
            </group>
            {/* 受损时显示血条 */}
            {isDamaged && (
              <BuildingHealthBar health={building.health} maxHealth={building.maxHealth} />
            )}
            {/* 受损时显示烟雾效果 */}
            {isDamaged && (
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.02 + Math.random() * 0.01, 8, 8]} />
                <meshBasicMaterial color="#666666" transparent opacity={0.6} />
              </mesh>
            )}
          </SurfaceObject>
        );
      })}

      {/* 生物列表渲染 */}
      {creatures.map((creature) => (
        <SurfaceObject
          key={creature.id}
          id={creature.id}
          position={creature.position}
          scale={creature.scale}
          isDeleteMode={isDeleteMode}
          isHovered={hoveredCreatureId === creature.id}
          onClick={() => onRemoveCreature?.(creature.id)}
          onPointerOver={() => setHoveredCreatureId(creature.id)}
          onPointerOut={() => setHoveredCreatureId(null)}
          deleteRingSize={0.25}
          hitAreaSize={0.4}
        >
          <CreatureComponent type={creature.type} position={[0, 0, 0]} scale={1} />
        </SurfaceObject>
      ))}

      {/* 灾害效果渲染 */}
      {disasters.map((disaster) => (
        <DisasterEffect key={disaster.id} disaster={disaster} />
      ))}

      {/* 大气层 - 三层渐变营造光晕效果 */}
      <mesh scale={1.06}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={themeConfig.atmosphereColor}
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.15}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={themeConfig.atmosphereColor}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.28}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color={themeConfig.atmosphereColor}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
