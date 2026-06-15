interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export function Forest({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[0.28, 20]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.95} />
      </mesh>
      <group position={[0.1, 0, 0.05]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.025, 0.16, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <coneGeometry args={[0.07, 0.18, 6]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <coneGeometry args={[0.05, 0.14, 6]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <coneGeometry args={[0.035, 0.1, 6]} />
          <meshStandardMaterial color="#388e3c" roughness={0.8} />
        </mesh>
      </group>
      <group position={[-0.08, 0, 0.1]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.02, 0.14, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <coneGeometry args={[0.06, 0.15, 6]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <coneGeometry args={[0.045, 0.12, 6]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
      </group>
      <group position={[0.05, 0, -0.1]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.028, 0.18, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <coneGeometry args={[0.08, 0.2, 6]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <coneGeometry args={[0.06, 0.16, 6]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
      </group>
      <group position={[-0.12, 0, -0.05]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.018, 0.12, 6]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <coneGeometry args={[0.05, 0.12, 6]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <coneGeometry args={[0.038, 0.1, 6]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
