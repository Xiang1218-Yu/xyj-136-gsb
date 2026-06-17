import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_RADIUS, PLANET_STYLE_CONFIGS } from '../utils/helpers';
import { createPlanetTexture, createCloudTexture } from '../utils/texture';
import { Building, Creature, ActiveDisaster, ToolType, PlanetStyleId } from '../types/game';
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
  styleId: PlanetStyleId;
}

/* 创建带噪声扰动的地形几何体 */
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

/* 建筑健康条组件 */
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

/* 大气辉光层组件，根据星球风格渲染不同颜色 */
function AtmosphereLayers({ styleId }: { styleId: PlanetStyleId }) {
  const style = PLANET_STYLE_CONFIGS[styleId];

  return (
    <>
      <mesh scale={1.06}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial color={style.atmosphereColor} transparent opacity={0.22} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.15}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial color={style.atmosphereColor2} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.28}>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshBasicMaterial color={style.atmosphereColor3} transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

/* 建筑类型到组件的映射，避免 if-else 链 */
const BUILDING_COMPONENT_MAP: Record<string, React.FC<{ position: [number, number, number]; scale: number }>> = {
  forest: Forest,
  glacier: Glacier,
  city: City,
  grassland: Grassland,
};

/* 星球表面放置项的通用组件，统一处理建筑和生物的定位、删除交互、悬浮指示 */
function SurfaceItem({
  id,
  position: rawPosition,
  scale,
  isDeleteMode,
  hoveredId,
  onHoverChange,
  onRemove,
  children,
  deleteRingY = 0.05,
  deleteRingSize = [0.15, 0.17] as [number, number],
}: {
  id: string;
  position: [number, number, number];
  scale: number;
  isDeleteMode: boolean;
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  deleteRingY?: number;
  deleteRingSize?: [number, number];
}) {
  const normal = new THREE.Vector3(...rawPosition).normalize();
  const surfacePos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.03);
  const position: [number, number, number] = [surfacePos.x, surfacePos.y, surfacePos.z];
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  const isHovered = hoveredId === id;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) onRemove(id);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) {
      onHoverChange(id);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDeleteMode) {
      onHoverChange(null);
      document.body.style.cursor = 'auto';
    }
  };

  return (
    <group
      position={position}
      quaternion={quaternion}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
      {isDeleteMode && isHovered && (
        <mesh position={[0, deleteRingY, 0]}>
          <ringGeometry args={[deleteRingSize[0], deleteRingSize[1], 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function Planet({
  onClick, onPointerOver, onPointerOut, onRemoveBuilding, onRemoveCreature,
  selectedTool, lifeIndex, buildings = [], creatures = [], disasters = [],
  styleId,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const terrainRef = useRef<THREE.Mesh>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* 根据星球风格生成纹理 */
  const planetTexture = useMemo(() => createPlanetTexture(styleId), [styleId]);
  const cloudTexture = useMemo(() => createCloudTexture(), []);

  const terrainGeometry = useMemo(
    () => createTerrainGeometry(PLANET_RADIUS + 0.005, 128, 128),
    []
  );

  /* 根据生命指数调整星球颜色 */
  useEffect(() => {
    const t = lifeIndex / 100;
    if (planetRef.current) {
      const mat = planetRef.current.material as THREE.MeshStandardMaterial;
      mat.color.setRGB(0.35 + t * 0.15, 0.3 + t * 0.35, 0.4 + t * 0.05);
    }
  }, [lifeIndex]);

  /* 星球自转动画 */
  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.03;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.015;
    if (terrainRef.current) terrainRef.current.rotation.y += delta * 0.03;
  });

  /* 点击星球表面，转换到局部坐标 */
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onClick && groupRef.current) {
      const localPoint = groupRef.current.worldToLocal(event.point.clone());
      onClick(localPoint);
    }
  };

  const style = PLANET_STYLE_CONFIGS[styleId];
  const isDeleteMode = selectedTool === 'delete';

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
        <meshStandardMaterial map={planetTexture} roughness={0.85} metalness={0.05} />
      </mesh>

      <mesh ref={terrainRef} receiveShadow>
        <primitive object={terrainGeometry} attach="geometry" />
        <meshStandardMaterial map={planetTexture} transparent opacity={0.6} roughness={0.95} metalness={0} depthWrite={false} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[PLANET_RADIUS + 0.05, 64, 64]} />
        <meshStandardMaterial map={cloudTexture} color="#ffffff" transparent opacity={style.cloudOpacity} depthWrite={false} />
      </mesh>

      {buildings.map((building) => {
        const BuildingComponent = BUILDING_COMPONENT_MAP[building.type] || Grassland;
        const healthPercent = building.health / building.maxHealth;

        return (
          <SurfaceItem
            key={building.id}
            id={building.id}
            position={building.position}
            scale={building.scale}
            isDeleteMode={isDeleteMode}
            hoveredId={hoveredId}
            onHoverChange={setHoveredId}
            onRemove={onRemoveBuilding || (() => {})}
            deleteRingY={0.05}
            deleteRingSize={[0.15, 0.17]}
          >
            <group scale={healthPercent < 0.3 ? [0.85, 0.85, 0.85] : [1, 1, 1]}>
              <BuildingComponent position={[0, 0, 0]} scale={1} />
            </group>
            {building.damaged && <BuildingHealthBar health={building.health} maxHealth={building.maxHealth} />}
            {building.damaged && (
              <mesh position={[0, 0.08, 0]}>
                <sphereGeometry args={[0.02 + Math.random() * 0.01, 8, 8]} />
                <meshBasicMaterial color="#666666" transparent opacity={0.6} />
              </mesh>
            )}
          </SurfaceItem>
        );
      })}

      {creatures.map((creature) => (
        <SurfaceItem
          key={creature.id}
          id={creature.id}
          position={creature.position}
          scale={creature.scale}
          isDeleteMode={isDeleteMode}
          hoveredId={hoveredId}
          onHoverChange={setHoveredId}
          onRemove={onRemoveCreature || (() => {})}
          deleteRingY={0.2}
          deleteRingSize={[0.25, 0.3]}
        >
          <CreatureComponent type={creature.type} position={[0, 0, 0]} scale={1} />
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </SurfaceItem>
      ))}

      {disasters.map((disaster) => (
        <DisasterEffect key={disaster.id} disaster={disaster} />
      ))}

      <AtmosphereLayers styleId={styleId} />
    </group>
  );
}
