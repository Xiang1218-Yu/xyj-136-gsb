import { useMemo } from 'react';
import { createBarkTexture, createGrassTexture } from '../../utils/texture';

interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

interface TreeProps {
  position?: [number, number, number];
  scale?: number;
}

function Tree({ position = [0, 0, 0], scale = 1 }: TreeProps) {
  const barkTexture = useMemo(() => createBarkTexture(), []);
  const height = 0.4 + Math.random() * 0.2;
  const crownRadius = 0.08 + Math.random() * 0.04;

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.015, 0.025, height, 8]} />
        <meshStandardMaterial map={barkTexture} roughness={0.95} />
      </mesh>

      {[-0.03, 0.03, -0.015, 0.015].map((off, i) => (
        <mesh
          key={i}
          position={[
            off * 0.5,
            height * 0.3 + i * 0.02,
            (i % 2 === 0 ? 1 : -1) * off * 0.3
          ]}
          rotation={[0, i * 1.5, i * 0.3 - 0.3]}
          castShadow
        >
          <cylinderGeometry args={[0.004, 0.008, 0.05, 4]} />
          <meshStandardMaterial map={barkTexture} roughness={0.9} />
        </mesh>
      ))}

      <mesh position={[0, height * 0.85, 0]} castShadow>
        <coneGeometry args={[crownRadius * 1.4, crownRadius * 2.2, 8]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.85} />
      </mesh>

      <mesh position={[0, height * 1.05, 0]} castShadow>
        <coneGeometry args={[crownRadius * 1.1, crownRadius * 1.8, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.85} />
      </mesh>

      <mesh position={[0, height * 1.22, 0]} castShadow>
        <coneGeometry args={[crownRadius * 0.8, crownRadius * 1.4, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>

      <mesh position={[0, height * 1.35, 0]} castShadow>
        <coneGeometry args={[crownRadius * 0.45, crownRadius * 0.9, 8]} />
        <meshStandardMaterial color="#43a047" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Bush({ position = [0, 0, 0], scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.06, 0.03]} castShadow>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshStandardMaterial color="#388e3c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.03, 0.055, -0.02]} castShadow>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#43a047" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Forest({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial map={grassTexture} roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshStandardMaterial color="#2e7d32" transparent opacity={0.5} roughness={1} />
      </mesh>

      <Tree position={[0.1, 0, 0.08]} scale={1.1} />
      <Tree position={[-0.1, 0, 0.12]} scale={0.85} />
      <Tree position={[0.08, 0, -0.12]} scale={1.2} />
      <Tree position={[-0.14, 0, -0.06]} scale={0.75} />

      <Bush position={[0.05, 0, 0.18]} scale={1} />
      <Bush position={[-0.18, 0, 0.02]} scale={0.8} />
      <Bush position={[0.15, 0, -0.05]} scale={0.9} />

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`flower-${i}`}
          position={[
            (Math.random() - 0.5) * 0.5,
            0.01,
            (Math.random() - 0.5) * 0.5
          ]}
        >
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ff69b4' : '#ffeb3b'}
            emissive={i % 2 === 0 ? '#ff69b4' : '#ffeb3b'}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
