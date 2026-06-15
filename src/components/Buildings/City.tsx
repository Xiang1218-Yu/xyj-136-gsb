import { useMemo } from 'react';
import { createWindowTexture, createGrassTexture } from '../../utils/texture';

interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

interface SkyscraperProps {
  position: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  windowLitRatio?: number;
}

function Skyscraper({
  position,
  width = 0.1,
  depth = 0.1,
  height = 0.4,
  color = '#708090',
  windowLitRatio = 0.6,
}: SkyscraperProps) {
  const windowTex1 = useMemo(() => createWindowTexture(windowLitRatio), [windowLitRatio]);
  const windowTex2 = useMemo(() => createWindowTexture(windowLitRatio * 0.9), [windowLitRatio]);

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[0, height / 2, depth / 2 + 0.001]}>
        <planeGeometry args={[width * 0.9, height * 0.95]} />
        <meshStandardMaterial
          map={windowTex1}
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
        />
      </mesh>

      <mesh position={[0, height / 2, -depth / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width * 0.9, height * 0.95]} />
        <meshStandardMaterial
          map={windowTex2}
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
        />
      </mesh>

      <mesh position={[width / 2 + 0.001, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth * 0.9, height * 0.95]} />
        <meshStandardMaterial
          map={windowTex1}
          emissive="#ffffff"
          emissiveIntensity={0.4}
          transparent
        />
      </mesh>

      <mesh position={[-width / 2 - 0.001, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth * 0.9, height * 0.95]} />
        <meshStandardMaterial
          map={windowTex2}
          emissive="#ffffff"
          emissiveIntensity={0.4}
          transparent
        />
      </mesh>

      {height > 0.3 && (
        <>
          <mesh position={[0, height + 0.015, 0]} castShadow>
            <boxGeometry args={[width * 0.4, 0.03, depth * 0.4]} />
            <meshStandardMaterial color="#555" roughness={0.8} metalness={0.5} />
          </mesh>

          <mesh position={[width * 0.15, height + 0.04, -depth * 0.1]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.05, 6]} />
            <meshStandardMaterial color="#888" roughness={0.6} metalness={0.8} />
          </mesh>

          <mesh position={[-width * 0.1, height + 0.05, depth * 0.12]} castShadow>
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color="#666" roughness={0.7} metalness={0.7} />
          </mesh>

          {windowLitRatio > 0.5 && (
            <mesh position={[0, height + 0.06, 0]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#ff3333" />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0.025, 0.15, 0]} castShadow>
        <boxGeometry args={[0.04, 0.006, 0.006]} />
        <meshStandardMaterial color="#444444" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0.04, 0.14, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          color="#ffeb99"
          emissive="#ffcc33"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

export function City({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.34, 0.42, 24]} />
        <meshStandardMaterial map={grassTexture} transparent opacity={0.7} roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.05, 0.28, 24, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>

      <Skyscraper
        position={[-0.12, 0, 0.05]}
        width={0.1}
        depth={0.09}
        height={0.45}
        color="#607080"
        windowLitRatio={0.7}
      />

      <Skyscraper
        position={[0.08, 0, 0.08]}
        width={0.07}
        depth={0.07}
        height={0.32}
        color="#696969"
        windowLitRatio={0.55}
      />

      <Skyscraper
        position={[0.02, 0, -0.08]}
        width={0.11}
        depth={0.1}
        height={0.52}
        color="#556b6f"
        windowLitRatio={0.65}
      />

      <Skyscraper
        position={[-0.05, 0, 0.13]}
        width={0.06}
        depth={0.06}
        height={0.26}
        color="#707080"
        windowLitRatio={0.5}
      />

      <StreetLight position={[0.15, 0, 0.02]} />
      <StreetLight position={[-0.18, 0, 0.1]} />
      <StreetLight position={[0.05, 0, -0.15]} />

      <mesh position={[0.22, 0.008, 0.1]} castShadow>
        <boxGeometry args={[0.03, 0.015, 0.06]} />
        <meshStandardMaterial color="#e63946" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0.22, 0.008, 0.1]} castShadow>
        <boxGeometry args={[0.028, 0.005, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <mesh position={[-0.2, 0.008, -0.05]} castShadow>
        <boxGeometry args={[0.025, 0.012, 0.05]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}
