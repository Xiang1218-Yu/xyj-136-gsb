import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Planet } from './Planet';
import { Moon } from './Moon';
import { Starfield } from './Starfield';
import { Forest } from './Buildings/Forest';
import { Glacier } from './Buildings/Glacier';
import { City } from './Buildings/City';
import { Grassland } from './Buildings/Grassland';
import { Building, BuildingType } from '../types/game';
import { PLANET_RADIUS } from '../utils/helpers';

interface GameCanvasProps {
  buildings: Building[];
  selectedTool: BuildingType | null;
  onAddBuilding: (type: BuildingType, position: [number, number, number]) => void;
  lifeIndex: number;
}

function BuildingRenderer({ buildings }: { buildings: Building[] }) {
  return (
    <>
      {buildings.map((building) => {
        const normal = new THREE.Vector3(...building.position).normalize();
        const surfacePos = normal.clone().multiplyScalar(PLANET_RADIUS + 0.02);
        const position: [number, number, number] = [
          surfacePos.x,
          surfacePos.y,
          surfacePos.z,
        ];

        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        const rotation: [number, number, number] = [
          euler.x + building.rotation[0],
          euler.y + building.rotation[1],
          euler.z + building.rotation[2],
        ];

        switch (building.type) {
          case 'forest':
            return (
              <Forest
                key={building.id}
                position={position}
                scale={building.scale}
                rotation={rotation}
              />
            );
          case 'glacier':
            return (
              <Glacier
                key={building.id}
                position={position}
                scale={building.scale}
                rotation={rotation}
              />
            );
          case 'city':
            return (
              <City
                key={building.id}
                position={position}
                scale={building.scale}
                rotation={rotation}
              />
            );
          case 'grassland':
            return (
              <Grassland
                key={building.id}
                position={position}
                scale={building.scale}
                rotation={rotation}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

function SceneContent({
  buildings,
  selectedTool,
  onAddBuilding,
  lifeIndex,
}: GameCanvasProps) {
  const [hovered, setHovered] = useState(false);

  const handlePlanetClick = (point: THREE.Vector3) => {
    if (selectedTool) {
      const normalized = point.clone().normalize();
      const surfacePoint = normalized.multiplyScalar(PLANET_RADIUS);
      onAddBuilding(selectedTool, [surfacePoint.x, surfacePoint.y, surfacePoint.z]);
    }
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.5}
        color="#fff8e7"
        castShadow
      />
      <pointLight position={[-5, 2, -5]} intensity={0.4} color="#6a9eff" />
      <hemisphereLight args={['#87ceeb', '#5d7a5d', 0.4]} />

      <Starfield />
      <Moon />

      <Planet
        onClick={handlePlanetClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        lifeIndex={lifeIndex}
      />

      {/* <BuildingRenderer buildings={buildings} /> */}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI - 0.1}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export function GameCanvas(props: GameCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #0a0e27, #1a1f4e)' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      shadows
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
