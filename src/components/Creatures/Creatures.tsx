import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDayNight } from '../../contexts/DayNightContext';
import * as THREE from 'three';

interface BirdProps {
  position: [number, number, number];
  color?: string;
  speed?: number;
  radius?: number;
  height?: number;
}

export function Bird({
  position,
  color = '#4a3728',
  speed = 1,
  radius = 0.25,
  height = 0.3,
}: BirdProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const phaseOffset = useRef(Math.random() * Math.PI * 2);
  const basePos = useRef(position);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset.current;

    if (groupRef.current) {
      groupRef.current.position.x =
        basePos.current[0] + Math.cos(t) * radius;
      groupRef.current.position.y =
        basePos.current[1] + Math.sin(t * 0.5) * 0.05 + height;
      groupRef.current.position.z =
        basePos.current[2] + Math.sin(t) * radius;

      const dx = -Math.sin(t) * radius * speed;
      const dz = Math.cos(t) * radius * speed;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    const wingAngle = Math.sin(state.clock.elapsedTime * 8 + phaseOffset.current) * 0.6;
    if (wingLeftRef.current) {
      wingLeftRef.current.rotation.z = wingAngle + 0.3;
    }
    if (wingRightRef.current) {
      wingRightRef.current.rotation.z = -wingAngle - 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.008, 0, 0]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.013, 0.002, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.003, 0.01, 4]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.7} />
      </mesh>
      <mesh ref={wingLeftRef} position={[-0.003, 0.003, 0]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[0.025, 0.008]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={wingRightRef} position={[-0.003, 0.003, 0]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.025, 0.008]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[-0.01, 0.002, 0]}>
        <coneGeometry args={[0.004, 0.015, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

interface FlockBirdsProps {
  center: [number, number, number];
  count?: number;
  colors?: string[];
}

export function FlockBirds({ center, count = 3, colors = ['#4a3728', '#8b4513', '#2c1810'] }: FlockBirdsProps) {
  const birds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      offset: [Math.random() * 0.15 - 0.075, Math.random() * 0.1, Math.random() * 0.15 - 0.075] as [number, number, number],
      speed: 0.8 + Math.random() * 0.6,
      radius: 0.2 + Math.random() * 0.15,
      height: 0.25 + Math.random() * 0.15,
      color: colors[i % colors.length],
      phaseOffset: Math.random() * Math.PI * 2,
    }));
  }, [count, colors]);

  return (
    <group>
      {birds.map((bird, i) => (
        <Bird
          key={`bird-${i}`}
          position={[
            center[0] + bird.offset[0],
            center[1] + bird.offset[1],
            center[2] + bird.offset[2],
          ]}
          color={bird.color}
          speed={bird.speed}
          radius={bird.radius}
          height={bird.height}
        />
      ))}
    </group>
  );
}

interface SquirrelProps {
  position: [number, number, number];
}

export function Squirrel({ position }: SquirrelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const jumpPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset.current;

    if (groupRef.current) {
      const jumpCycle = Math.sin(t * 2 + jumpPhase.current);
      const isJumping = jumpCycle > 0.7;
      const jumpHeight = isJumping ? (jumpCycle - 0.7) * 0.15 : 0;
      groupRef.current.position.y = position[1] + jumpHeight;

      const moveX = Math.sin(t * 0.5) * 0.08;
      const moveZ = Math.cos(t * 0.3) * 0.06;
      groupRef.current.position.x = position[0] + moveX;
      groupRef.current.position.z = position[2] + moveZ;

      if (Math.abs(Math.cos(t * 0.5)) > 0.1) {
        groupRef.current.rotation.y = Math.cos(t * 0.5) > 0 ? 0 : Math.PI;
      }
    }

    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3 + offset.current) * 0.3 - 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      <mesh position={[0.009, 0.02, 0]}>
        <sphereGeometry args={[0.007, 6, 6]} />
        <meshStandardMaterial color="#a0522d" roughness={0.9} />
      </mesh>
      <mesh position={[0.013, 0.02, 0]}>
        <sphereGeometry args={[0.002, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={tailRef} position={[-0.015, 0.02, 0]} rotation={[-0.5, 0, 0.2]}>
        <cylinderGeometry args={[0.003, 0.008, 0.025, 5]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface ButterflyProps {
  position: [number, number, number];
  color?: string;
  speed?: number;
}

export function Butterfly({
  position,
  color = '#ff69b4',
  speed = 1,
}: ButterflyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const basePos = useRef(position);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset.current;

    if (groupRef.current) {
      groupRef.current.position.x =
        basePos.current[0] + Math.sin(t * 1.3) * 0.12;
      groupRef.current.position.y =
        basePos.current[1] + Math.sin(t * 0.7) * 0.06 + 0.08;
      groupRef.current.position.z =
        basePos.current[2] + Math.cos(t * 1.1) * 0.12;

      groupRef.current.rotation.y = t * 0.5;
    }

    const wingFlap = Math.sin(state.clock.elapsedTime * 10 + offset.current) * 0.8;
    if (wingLeftRef.current) {
      wingLeftRef.current.rotation.y = wingFlap;
    }
    if (wingRightRef.current) {
      wingRightRef.current.rotation.y = -wingFlap;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.003, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh ref={wingLeftRef} position={[0, 0.001, 0.002]} rotation={[0, 0.5, 0.3]}>
        <planeGeometry args={[0.015, 0.012]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh ref={wingRightRef} position={[0, 0.001, -0.002]} rotation={[0, -0.5, 0.3]}>
        <planeGeometry args={[0.015, 0.012]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <cylinderGeometry args={[0.001, 0.0005, 0.01, 3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface RabbitProps {
  position: [number, number, number];
}

export function Rabbit({ position }: RabbitProps) {
  const groupRef = useRef<THREE.Group>(null);
  const earLeftRef = useRef<THREE.Mesh>(null);
  const earRightRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const hopPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset.current;

    if (groupRef.current) {
      const hopCycle = Math.sin(t * 1.5 + hopPhase.current);
      const isHopping = hopCycle > 0.85;
      const hopHeight = isHopping ? (hopCycle - 0.85) * 0.5 : 0;
      groupRef.current.position.y = position[1] + hopHeight;

      const moveAngle = t * 0.3;
      const moveRadius = 0.1;
      groupRef.current.position.x = position[0] + Math.sin(moveAngle) * moveRadius;
      groupRef.current.position.z = position[2] + Math.cos(moveAngle) * moveRadius;

      const dx = Math.cos(moveAngle) * moveRadius;
      const dz = -Math.sin(moveAngle) * moveRadius;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    const earTwitch = Math.sin(state.clock.elapsedTime * 4 + offset.current) * 0.15;
    if (earLeftRef.current) {
      earLeftRef.current.rotation.z = earTwitch + 0.15;
    }
    if (earRightRef.current) {
      earRightRef.current.rotation.z = -earTwitch - 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.012, 0]}>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.9} />
      </mesh>
      <mesh position={[0.008, 0.016, 0]}>
        <sphereGeometry args={[0.007, 6, 6]} />
        <meshStandardMaterial color="#e0d5c0" roughness={0.9} />
      </mesh>
      <mesh position={[0.012, 0.016, 0.002]}>
        <sphereGeometry args={[0.0015, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.012, 0.017, -0.001]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshStandardMaterial color="#ffaacc" roughness={0.9} />
      </mesh>
      <mesh ref={earLeftRef} position={[0.006, 0.028, 0.003]} rotation={[0.2, 0, 0.15]}>
        <cylinderGeometry args={[0.002, 0.003, 0.015, 4]} />
        <meshStandardMaterial color="#e0d5c0" roughness={0.9} />
      </mesh>
      <mesh ref={earRightRef} position={[0.006, 0.028, -0.003]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.002, 0.003, 0.015, 4]} />
        <meshStandardMaterial color="#e0d5c0" roughness={0.9} />
      </mesh>
      <mesh position={[-0.01, 0.01, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface PenguinProps {
  position: [number, number, number];
}

export function Penguin({ position }: PenguinProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftFootRef = useRef<THREE.Mesh>(null);
  const rightFootRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset.current;

    if (groupRef.current) {
      const waddle = Math.sin(t * 2) * 0.08;
      groupRef.current.rotation.z = waddle;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.005;

      const moveAngle = t * 0.2 + offset.current;
      const moveRadius = 0.08;
      groupRef.current.position.x = position[0] + Math.sin(moveAngle) * moveRadius;
      groupRef.current.position.z = position[2] + Math.cos(moveAngle) * moveRadius;

      const dx = Math.cos(moveAngle) * moveRadius;
      const dz = -Math.sin(moveAngle) * moveRadius;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    const stepCycle = Math.sin(state.clock.elapsedTime * 2 + offset.current);
    if (leftFootRef.current) {
      leftFootRef.current.rotation.x = stepCycle * 0.2;
    }
    if (rightFootRef.current) {
      rightFootRef.current.rotation.x = -stepCycle * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, 0.005]}>
        <sphereGeometry args={[0.009, 6, 6]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>
      <mesh position={[0.01, 0.022, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[0.014, 0.023, 0.002]}>
        <coneGeometry args={[0.002, 0.006, 4]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.7} />
      </mesh>
      <mesh position={[0.013, 0.024, 0.001]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.013, 0.022, -0.002]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.005, 0.015, 0.008]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.003, 0.002, 0.015, 4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[-0.005, 0.015, -0.008]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.003, 0.002, 0.015, 4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh ref={leftFootRef} position={[-0.003, 0.002, 0.006]}>
        <boxGeometry args={[0.006, 0.003, 0.01]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.7} />
      </mesh>
      <mesh ref={rightFootRef} position={[-0.003, 0.002, -0.006]}>
        <boxGeometry args={[0.006, 0.003, 0.01]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.7} />
      </mesh>
    </group>
  );
}

interface SnowOwlProps {
  position: [number, number, number];
  flyRadius?: number;
}

export function SnowOwl({ position, flyRadius = 0.2 }: SnowOwlProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const basePos = useRef(position);
  const isFlying = useRef(true);
  const flyTimer = useRef(0);
  const perchTimer = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + offset.current;

    if (isFlying.current) {
      flyTimer.current += delta;
      if (groupRef.current) {
        groupRef.current.position.x =
          basePos.current[0] + Math.cos(t * 0.7) * flyRadius;
        groupRef.current.position.y =
          basePos.current[1] + Math.sin(t * 0.3) * 0.04 + 0.25;
        groupRef.current.position.z =
          basePos.current[2] + Math.sin(t * 0.7) * flyRadius;

        const dx = -Math.sin(t * 0.7) * flyRadius;
        const dz = Math.cos(t * 0.7) * flyRadius;
        groupRef.current.rotation.y = Math.atan2(dx, dz);
      }

      const wingAngle = Math.sin(state.clock.elapsedTime * 6) * 0.5;
      if (wingLeftRef.current) {
        wingLeftRef.current.rotation.z = wingAngle + 0.2;
      }
      if (wingRightRef.current) {
        wingRightRef.current.rotation.z = -wingAngle - 0.2;
      }

      if (flyTimer.current > 8 + Math.random() * 5) {
        isFlying.current = false;
        perchTimer.current = 0;
      }
    } else {
      perchTimer.current += delta;
      if (groupRef.current) {
        groupRef.current.position.set(...basePos.current);
        groupRef.current.position.y += 0.15;
        groupRef.current.rotation.y = 0;
      }
      if (wingLeftRef.current) {
        wingLeftRef.current.rotation.z = 0.4;
      }
      if (wingRightRef.current) {
        wingRightRef.current.rotation.z = -0.4;
      }

      if (perchTimer.current > 4 + Math.random() * 3) {
        isFlying.current = true;
        flyTimer.current = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.01, 6, 6]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.9} />
      </mesh>
      <mesh position={[0.008, 0.002, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.9} />
      </mesh>
      <mesh position={[0.012, 0.004, 0.003]}>
        <sphereGeometry args={[0.003, 6, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.012, 0.004, -0.003]}>
        <sphereGeometry args={[0.003, 6, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.014, 0.003, 0.003]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.014, 0.003, -0.003]}>
        <sphereGeometry args={[0.001, 4, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh ref={wingLeftRef} position={[-0.003, 0.003, 0.006]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[0.02, 0.012]} />
        <meshStandardMaterial
          color="#e8e0d0"
          roughness={0.9}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={wingRightRef} position={[-0.003, 0.003, -0.006]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.02, 0.012]} />
        <meshStandardMaterial
          color="#e8e0d0"
          roughness={0.9}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

interface DeerProps {
  position: [number, number, number];
}

export function Deer({ position }: DeerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const offset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const t = state.clock.elapsedTime + offset.current;

    if (groupRef.current) {
      const moveAngle = t * 0.15 + offset.current;
      const moveRadius = 0.12;
      groupRef.current.position.x = position[0] + Math.sin(moveAngle) * moveRadius;
      groupRef.current.position.z = position[2] + Math.cos(moveAngle) * moveRadius;
      groupRef.current.position.y = position[1];

      const dx = Math.cos(moveAngle) * moveRadius;
      const dz = -Math.sin(moveAngle) * moveRadius;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + offset.current) * 0.3;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.015, 0.02, 0.008]} />
        <meshStandardMaterial color="#8b6914" roughness={0.9} />
      </mesh>
      <mesh position={[-0.004, 0.012, 0.005]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.002, 0.002, 0.025, 4]} />
        <meshStandardMaterial color="#7a5c10" roughness={0.9} />
      </mesh>
      <mesh position={[-0.004, 0.012, -0.005]} rotation={[-0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.002, 0.002, 0.025, 4]} />
        <meshStandardMaterial color="#7a5c10" roughness={0.9} />
      </mesh>
      <mesh position={[0.006, 0.012, 0.005]} rotation={[0.1, 0, -0.1]}>
        <cylinderGeometry args={[0.002, 0.002, 0.025, 4]} />
        <meshStandardMaterial color="#7a5c10" roughness={0.9} />
      </mesh>
      <mesh position={[0.006, 0.012, -0.005]} rotation={[-0.1, 0, -0.1]}>
        <cylinderGeometry args={[0.002, 0.002, 0.025, 4]} />
        <meshStandardMaterial color="#7a5c10" roughness={0.9} />
      </mesh>
      <mesh position={[-0.015, 0.022, 0]}>
        <sphereGeometry args={[0.005, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <group ref={headRef} position={[0.012, 0.032, 0]}>
        <mesh>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshStandardMaterial color="#8b6914" roughness={0.9} />
        </mesh>
        <mesh position={[0.005, 0.001, 0]}>
          <sphereGeometry args={[0.003, 6, 6]} />
          <meshStandardMaterial color="#5a4010" roughness={0.9} />
        </mesh>
        <mesh position={[0.007, 0.002, 0.001]}>
          <sphereGeometry args={[0.0008, 4, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0.007, 0.002, -0.001]}>
          <sphereGeometry args={[0.0008, 4, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0.004, 0.008, 0.003]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.001, 0.001, 0.012, 4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.9} />
        </mesh>
        <mesh position={[0.004, 0.008, -0.003]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.001, 0.001, 0.012, 4]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.9} />
        </mesh>
        <mesh position={[0.004, 0.014, 0.003]} rotation={[0.2, 0, 0.2]}>
          <cylinderGeometry args={[0.0008, 0.002, 0.008, 3]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.9} />
        </mesh>
        <mesh position={[0.004, 0.014, -0.003]} rotation={[0.2, 0, -0.2]}>
          <cylinderGeometry args={[0.0008, 0.002, 0.008, 3]} />
          <meshStandardMaterial color="#7a5c10" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

interface PigeonProps {
  position: [number, number, number];
}

export function Pigeon({ position }: PigeonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const basePos = useRef(position);
  const isFlying = useRef(true);
  const flyTimer = useRef(0);
  const peckTimer = useRef(0);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime + offset.current;

    if (isFlying.current) {
      flyTimer.current += delta;
      if (groupRef.current) {
        groupRef.current.position.x =
          basePos.current[0] + Math.cos(t * 0.8) * 0.2;
        groupRef.current.position.y =
          basePos.current[1] + Math.sin(t * 0.4) * 0.04 + 0.2;
        groupRef.current.position.z =
          basePos.current[2] + Math.sin(t * 0.8) * 0.2;

        const dx = -Math.sin(t * 0.8) * 0.2;
        const dz = Math.cos(t * 0.8) * 0.2;
        groupRef.current.rotation.y = Math.atan2(dx, dz);
      }

      const wingAngle = Math.sin(state.clock.elapsedTime * 7) * 0.5;
      if (wingLeftRef.current) {
        wingLeftRef.current.rotation.z = wingAngle + 0.2;
      }
      if (wingRightRef.current) {
        wingRightRef.current.rotation.z = -wingAngle - 0.2;
      }

      if (flyTimer.current > 6 + Math.random() * 4) {
        isFlying.current = false;
        peckTimer.current = 0;
      }
    } else {
      peckTimer.current += delta;
      if (groupRef.current) {
        groupRef.current.position.x =
          basePos.current[0] + Math.sin(t * 0.3) * 0.06;
        groupRef.current.position.y = basePos.current[1] + 0.005;
        groupRef.current.position.z =
          basePos.current[2] + Math.cos(t * 0.3) * 0.06;
        groupRef.current.rotation.y = t * 0.3;
      }

      if (wingLeftRef.current) {
        wingLeftRef.current.rotation.z = 0.1;
      }
      if (wingRightRef.current) {
        wingRightRef.current.rotation.z = -0.1;
      }

      if (headRef.current) {
        const peckCycle = Math.sin(peckTimer.current * 3);
        headRef.current.rotation.x = peckCycle > 0.5 ? (peckCycle - 0.5) * 0.8 : 0;
      }

      if (peckTimer.current > 5 + Math.random() * 3) {
        isFlying.current = true;
        flyTimer.current = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.007, 6, 6]} />
        <meshStandardMaterial color="#708090" roughness={0.8} />
      </mesh>
      <group ref={headRef} position={[0.006, 0.002, 0]}>
        <mesh>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshStandardMaterial color="#607080" roughness={0.8} />
        </mesh>
        <mesh position={[0.004, 0, 0]}>
          <coneGeometry args={[0.0015, 0.005, 4]} />
          <meshStandardMaterial color="#888888" roughness={0.7} />
        </mesh>
        <mesh position={[0.003, 0.002, 0.002]}>
          <sphereGeometry args={[0.001, 4, 4]} />
          <meshStandardMaterial color="#ff6600" roughness={0.7} />
        </mesh>
        <mesh position={[0.003, 0.002, -0.002]}>
          <sphereGeometry args={[0.001, 4, 4]} />
          <meshStandardMaterial color="#ff6600" roughness={0.7} />
        </mesh>
      </group>
      <mesh ref={wingLeftRef} position={[-0.002, 0.002, 0.005]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[0.018, 0.008]} />
        <meshStandardMaterial
          color="#708090"
          roughness={0.8}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={wingRightRef} position={[-0.002, 0.002, -0.005]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[0.018, 0.008]} />
        <meshStandardMaterial
          color="#708090"
          roughness={0.8}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[-0.008, -0.003, 0.003]}>
        <cylinderGeometry args={[0.001, 0.001, 0.008, 4]} />
        <meshStandardMaterial color="#cc3333" roughness={0.7} />
      </mesh>
      <mesh position={[-0.008, -0.003, -0.003]}>
        <cylinderGeometry args={[0.001, 0.001, 0.008, 4]} />
        <meshStandardMaterial color="#cc3333" roughness={0.7} />
      </mesh>
    </group>
  );
}

interface FishProps {
  position: [number, number, number];
  color?: string;
  speed?: number;
}

export function Fish({ position, color = '#4488cc', speed = 1 }: FishProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const offset = useRef(Math.random() * Math.PI * 2);
  const basePos = useRef(position);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset.current;

    if (groupRef.current) {
      groupRef.current.position.x =
        basePos.current[0] + Math.sin(t * 0.8) * 0.1;
      groupRef.current.position.y =
        basePos.current[1] + Math.sin(t * 0.5) * 0.02;
      groupRef.current.position.z =
        basePos.current[2] + Math.cos(t * 0.6) * 0.1;

      const dx = Math.cos(t * 0.8) * 0.1;
      const dz = -Math.sin(t * 0.6) * 0.1;
      groupRef.current.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;
    }

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 5 + offset.current) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.006, 6, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh ref={tailRef} position={[-0.01, 0, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.005, 0.008, 3]} />
        <meshStandardMaterial color={color} roughness={0.6} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

interface FireflySwarmProps {
  center: [number, number, number];
  count?: number;
}

export function FireflySwarm({ center, count = 6 }: FireflySwarmProps) {
  const { nightFactor, isNight } = useDayNight();
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const offsets = useMemo(() => {
    return Array.from({ length: count }, () => ({
      phase: Math.random() * Math.PI * 2,
      speedX: 0.8 + Math.random() * 1.2,
      speedY: 0.5 + Math.random() * 1,
      speedZ: 0.8 + Math.random() * 1.2,
      radiusX: 0.05 + Math.random() * 0.15,
      radiusY: 0.03 + Math.random() * 0.08,
      radiusZ: 0.05 + Math.random() * 0.15,
      baseOffset: [
        (Math.random() - 0.5) * 0.2,
        Math.random() * 0.15,
        (Math.random() - 0.5) * 0.2,
      ] as [number, number, number],
      pulseSpeed: 2 + Math.random() * 3,
      color: ['#ffff88', '#aaffaa', '#88ffff', '#ffaa88'][Math.floor(Math.random() * 4)],
    }));
  }, [count]);

  useFrame((state) => {
    meshRefs.current.forEach((ref, i) => {
      if (ref && offsets[i]) {
        const o = offsets[i];
        const t = state.clock.elapsedTime + o.phase;
        ref.position.x = center[0] + o.baseOffset[0] + Math.sin(t * o.speedX) * o.radiusX;
        ref.position.y = center[1] + o.baseOffset[1] + Math.sin(t * o.speedY) * o.radiusY;
        ref.position.z = center[2] + o.baseOffset[2] + Math.cos(t * o.speedZ) * o.radiusZ;

        const pulse = 0.4 + Math.sin(t * o.pulseSpeed) * 0.6;
        const mat = ref.material as THREE.MeshBasicMaterial;
        mat.opacity = nightFactor * pulse;
      }
    });
  });

  if (!isNight) return null;

  return (
    <group>
      {offsets.map((o, i) => (
        <mesh
          key={`firefly-swarm-${i}`}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[
            center[0] + o.baseOffset[0],
            center[1] + o.baseOffset[1],
            center[2] + o.baseOffset[2],
          ]}
        >
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshBasicMaterial
            color={o.color}
            transparent
            opacity={nightFactor * 0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

interface CreatureProps {
  type: string;
  position: [number, number, number];
  scale?: number;
  baseScale?: number;
}

export function Creature({ type, position, scale = 1, baseScale = 5 }: CreatureProps) {
  const scaledPos: [number, number, number] = [
    position[0] * scale,
    position[1] * scale,
    position[2] * scale,
  ];

  const totalScale = scale * baseScale;

  const renderCreature = () => {
    switch (type) {
      case 'bird':
        return <Bird position={scaledPos} speed={1} radius={0.15} height={0.15} />;
      case 'squirrel':
        return <Squirrel position={scaledPos} />;
      case 'deer':
        return <Deer position={scaledPos} />;
      case 'butterfly':
        return <Butterfly position={scaledPos} speed={1} />;
      case 'rabbit':
        return <Rabbit position={scaledPos} />;
      case 'penguin':
        return <Penguin position={scaledPos} />;
      case 'snowOwl':
        return <SnowOwl position={scaledPos} flyRadius={0.15} />;
      case 'pigeon':
        return <Pigeon position={scaledPos} />;
      default:
        return null;
    }
  };

  return (
    <group scale={totalScale}>
      {renderCreature()}
    </group>
  );
}
