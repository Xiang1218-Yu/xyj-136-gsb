import { useMemo } from 'react';
import { createIceTexture } from '../../utils/texture';

interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

interface IcebergProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

function Iceberg({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: IcebergProps) {
  const iceTexture = useMemo(() => createIceTexture(), []);

  const height = 0.25 + Math.random() * 0.15;
  const radius = 0.1 + Math.random() * 0.05;

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, height * 0.55, 0]} castShadow receiveShadow>
        <coneGeometry args={[radius, height * 1.1, 6]} />
        <meshPhysicalMaterial
          color="#e0f0ff"
          map={iceTexture}
          transparent
          opacity={0.88}
          roughness={0.15}
          metalness={0.05}
          transmission={0.3}
          thickness={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      <mesh position={[0, height * 0.1, 0]} castShadow receiveShadow>
        <coneGeometry args={[radius * 1.15, height * 0.5, 6]} />
        <meshPhysicalMaterial
          color="#b8d8ff"
          transparent
          opacity={0.75}
          roughness={0.1}
          metalness={0}
          transmission={0.5}
          thickness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      <mesh position={[radius * 0.3, height * 0.25, radius * 0.2]} rotation={[0.3, 0.8, 0.2]} castShadow>
        <boxGeometry args={[radius * 0.3, radius * 0.4, radius * 0.25]} />
        <meshPhysicalMaterial
          color="#d0e8ff"
          transparent
          opacity={0.9}
          roughness={0.08}
          metalness={0}
          transmission={0.4}
          thickness={0.3}
          clearcoat={0.9}
        />
      </mesh>

      <mesh position={[-radius * 0.25, height * 0.4, -radius * 0.15]} rotation={[-0.2, -0.6, 0.15]} castShadow>
        <octahedronGeometry args={[radius * 0.22, 0]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          transparent
          opacity={0.92}
          roughness={0.05}
          metalness={0}
          transmission={0.35}
          thickness={0.4}
          clearcoat={1}
        />
      </mesh>

      <mesh position={[radius * 0.15, height * 0.9, 0]}>
        <sphereGeometry args={[radius * 0.08, 6, 6]} />
        <meshStandardMaterial
          color="#a8d0ff"
          emissive="#6ab0ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function IceCrystal({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: IcebergProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh castShadow>
        <octahedronGeometry args={[0.03, 0]} />
        <meshPhysicalMaterial
          color="#c0e0ff"
          transparent
          opacity={0.85}
          roughness={0.05}
          metalness={0}
          transmission={0.6}
          thickness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1}
        />
      </mesh>
      <mesh position={[0.015, -0.01, 0.01]} rotation={[0.5, 0.3, 0]} castShadow>
        <tetrahedronGeometry args={[0.02, 0]} />
        <meshPhysicalMaterial
          color="#d0e8ff"
          transparent
          opacity={0.9}
          roughness={0.05}
          transmission={0.5}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

export function Glacier({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  const iceTexture = useMemo(() => createIceTexture(), []);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[0.38, 24]} />
        <meshStandardMaterial
          map={iceTexture}
          color="#d0e8ff"
          transparent
          opacity={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.32, 0.4, 24]} />
        <meshPhysicalMaterial
          color="#88bbee"
          transparent
          opacity={0.5}
          roughness={0.1}
          transmission={0.4}
          thickness={0.5}
          clearcoat={0.8}
        />
      </mesh>

      <Iceberg position={[0.08, 0, 0.05]} scale={1.1} rotation={[0, 0.3, 0]} />
      <Iceberg position={[-0.1, 0, 0.1]} scale={0.85} rotation={[0, -0.4, 0]} />
      <Iceberg position={[0.05, 0, -0.12]} scale={1.3} rotation={[0, 0.8, 0]} />
      <Iceberg position={[-0.15, 0, -0.08]} scale={0.7} rotation={[0, -0.2, 0.1]} />

      <IceCrystal position={[0.2, 0.01, 0.15]} scale={1} rotation={[0.2, 0.5, 0.3]} />
      <IceCrystal position={[-0.18, 0.008, 0.18]} scale={0.8} rotation={[0.1, -0.3, 0.5]} />
      <IceCrystal position={[0.12, 0.012, -0.18]} scale={1.2} rotation={[0.4, 0.2, -0.2]} />
      <IceCrystal position={[-0.22, 0.01, -0.15]} scale={0.9} rotation={[-0.3, 0.6, 0.1]} />
      <IceCrystal position={[0, 0.005, 0.22]} scale={0.7} rotation={[0.1, 0.1, 0.8]} />

      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`sparkle-${i}`}
          position={[
            (Math.random() - 0.5) * 0.6,
            0.02 + Math.random() * 0.15,
            (Math.random() - 0.5) * 0.6,
          ]}
        >
          <sphereGeometry args={[0.005 + Math.random() * 0.005, 4, 4]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#88ccff"
            emissiveIntensity={0.8 + Math.random() * 0.8}
            transparent
            opacity={0.7 + Math.random() * 0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
