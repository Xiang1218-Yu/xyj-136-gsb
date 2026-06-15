import { useMemo } from 'react';
import { createGrassTexture } from '../../utils/texture';

interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

interface GrassBladeProps {
  position: [number, number, number];
  height?: number;
  color?: string;
  rotation?: number;
  lean?: number;
}

function GrassBlade({
  position,
  height = 0.06,
  color = '#4caf50',
  rotation = 0,
  lean = 0,
}: GrassBladeProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[lean * 0.3, 0, 0]} position={[0, height / 2, 0]} castShadow>
        <coneGeometry args={[0.006, height, 4]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh rotation={[lean * 0.5, 0, 0]} position={[0.004, height * 0.6, 0.002]} castShadow>
        <coneGeometry args={[0.004, height * 0.7, 4]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Flower({
  position,
  color = '#ff69b4',
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.003, 0.004, 0.1, 4]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={0.2} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI * 2) / 5) * 0.012,
            0.11,
            Math.sin((i * Math.PI * 2) / 5) * 0.012,
          ]}
        >
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function Mushroom({
  position,
  capColor = '#e57373',
}: {
  position: [number, number, number];
  capColor?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.01, 0.04, 6]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.045, 0]} castShadow>
        <sphereGeometry args={[0.02, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={capColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.008, 0.048, 0]}>
        <sphereGeometry args={[0.004, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.006, 0.05, 0.005]}>
        <sphereGeometry args={[0.003, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function Grassland({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  const grassData = useMemo(() => {
    const blades: {
      pos: [number, number, number];
      height: number;
      color: string;
      rotation: number;
      lean: number;
    }[] = [];
    const colors = [
      '#4caf50', '#66bb6a', '#81c784',
      '#388e3c', '#2e7d32', '#43a047',
      '#9ccc65', '#aed581',
    ];

    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.3;
      blades.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        height: 0.04 + Math.random() * 0.07,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        lean: (Math.random() - 0.5) * 0.6,
      });
    }
    return blades;
  }, []);

  const flowerData = useMemo(() => {
    const colors = ['#ff69b4', '#ffeb3b', '#ff5722', '#e91e63', '#9c27b0', '#00bcd4'];
    const flowers: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.08 + Math.random() * 0.22;
      flowers.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return flowers;
  }, []);

  const mushroomData = useMemo(() => {
    const capColors = ['#e57373', '#ff9800', '#8d6e63', '#795548'];
    const mushrooms: { pos: [number, number, number]; capColor: string }[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.1 + Math.random() * 0.2;
      mushrooms.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        capColor: capColors[Math.floor(Math.random() * capColors.length)],
      });
    }
    return mushrooms;
  }, []);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial map={grassTexture} roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshStandardMaterial
          color="#388e3c"
          transparent
          opacity={0.5}
          roughness={1}
        />
      </mesh>

      {grassData.map((blade, i) => (
        <GrassBlade
          key={`grass-${i}`}
          position={blade.pos}
          height={blade.height}
          color={blade.color}
          rotation={blade.rotation}
          lean={blade.lean}
        />
      ))}

      {flowerData.map((flower, i) => (
        <Flower key={`flower-${i}`} position={flower.pos} color={flower.color} />
      ))}

      {mushroomData.map((mushroom, i) => (
        <Mushroom
          key={`mushroom-${i}`}
          position={mushroom.pos}
          capColor={mushroom.capColor}
        />
      ))}

      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={`stone-${i}`}
          position={[
            (Math.random() - 0.5) * 0.5,
            0.01,
            (Math.random() - 0.5) * 0.5,
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.015 + Math.random() * 0.015, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
