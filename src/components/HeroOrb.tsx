import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh, Points } from "three";

function Seed() {
  const mesh = useRef<Mesh>(null);
  const pts = useRef<Points>(null);
  useFrame((_, d) => {
    if (mesh.current) {
      mesh.current.rotation.y += d * 0.12;
      mesh.current.rotation.x += d * 0.04;
    }
    if (pts.current) pts.current.rotation.y -= d * 0.05;
  });
  return (
    <>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial color="#2c4a45" wireframe transparent opacity={0.35} />
      </mesh>
      <points ref={pts}>
        <icosahedronGeometry args={[2.1, 4]} />
        <pointsMaterial color="#d9622b" size={0.025} transparent opacity={0.7} />
      </points>
    </>
  );
}

export default function HeroOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Seed />
    </Canvas>
  );
}
