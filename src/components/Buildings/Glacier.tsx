interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export function Glacier({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color="#e0f7fa" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.18, 0.6, 6]} />
        <meshStandardMaterial color="#b2ebf2" />
      </mesh>
      <mesh position={[0.12, 0.18, 0.05]}>
        <coneGeometry args={[0.1, 0.36, 6]} />
        <meshStandardMaterial color="#80deea" />
      </mesh>
      <mesh position={[-0.1, 0.22, -0.08]}>
        <coneGeometry args={[0.12, 0.44, 6]} />
        <meshStandardMaterial color="#4dd0e1" />
      </mesh>
      <mesh position={[0.05, 0.1, 0.15]}>
        <coneGeometry args={[0.07, 0.2, 5]} />
        <meshStandardMaterial color="#b3e5fc" />
      </mesh>
    </group>
  );
}
