interface BuildingProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export function Grassland({ position, scale = 1, rotation = [0, 0, 0] }: BuildingProps) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[0.25, 20]} />
        <meshStandardMaterial color="#32cd32" />
      </mesh>
      <mesh position={[0.1, 0.06, 0.05]}>
        <coneGeometry args={[0.018, 0.12, 4]} />
        <meshStandardMaterial color="#7cfc00" />
      </mesh>
      <mesh position={[-0.08, 0.05, 0.1]}>
        <coneGeometry args={[0.015, 0.1, 4]} />
        <meshStandardMaterial color="#98fb98" />
      </mesh>
      <mesh position={[0.05, 0.07, -0.08]}>
        <coneGeometry args={[0.02, 0.14, 4]} />
        <meshStandardMaterial color="#7cfc00" />
      </mesh>
      <mesh position={[-0.12, 0.045, -0.05]}>
        <coneGeometry args={[0.014, 0.09, 4]} />
        <meshStandardMaterial color="#90ee90" />
      </mesh>
      <mesh position={[0, 0.065, 0.12]}>
        <coneGeometry args={[0.016, 0.13, 4]} />
        <meshStandardMaterial color="#7cfc00" />
      </mesh>
      <mesh position={[0.12, 0.055, -0.02]}>
        <coneGeometry args={[0.017, 0.11, 4]} />
        <meshStandardMaterial color="#98fb98" />
      </mesh>
      <mesh position={[-0.05, 0.06, -0.12]}>
        <coneGeometry args={[0.015, 0.12, 4]} />
        <meshStandardMaterial color="#7cfc00" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.15]}>
        <coneGeometry args={[0.013, 0.1, 4]} />
        <meshStandardMaterial color="#90ee90" />
      </mesh>
    </group>
  );
}
