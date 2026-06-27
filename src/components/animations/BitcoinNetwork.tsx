import { useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Sphere, Line, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const Nodes = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodesCount = 15;

  const { positions, connections } = useMemo(() => {
    const pos = [];
    const conn = [];
    for (let i = 0; i < nodesCount; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        )
      );
    }
    
    for (let i = 0; i < nodesCount; i++) {
      for (let j = i + 1; j < nodesCount; j++) {
        if (pos[i].distanceTo(pos[j]) < 3.5) {
          conn.push([pos[i], pos[j]]);
        }
      }
    }
    return { positions: pos, connections: conn };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {connections.map((points, idx) => (
        <Line
          key={idx}
          points={points}
          color="#06b6d4"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      {positions.map((pos, idx) => (
        <Sphere key={idx} position={pos} args={[0.08, 16, 16]}>
          <meshBasicMaterial color="#06b6d4" />
        </Sphere>
      ))}
    </group>
  );
};

const CentralCoin = () => {
  const coinRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={coinRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.22, 32]} />
          <meshStandardMaterial color="#a78bfa" metalness={0.9} roughness={0.1} />
        </mesh>
        <Text
          position={[0, 0, 0.12]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ₿
        </Text>
        <Text
          position={[0, 0, -0.12]}
          rotation={[0, Math.PI, 0]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ₿
        </Text>
      </group>
    </Float>
  );
};

const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Smoothly interpolate rotation towards mouse position
      const targetX = (mouse.y * Math.PI) / 4;
      const targetY = (mouse.x * Math.PI) / 4;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#8b5cf6" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#06b6d4" />
      
      <CentralCoin />
      <Nodes />
    </group>
  );
};

export default function BitcoinNetworkAnimation() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
