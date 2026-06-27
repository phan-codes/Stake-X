import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const symbols = [
  { char: '₿', color: '#a78bfa' }, // BTC (Violet)
  { char: 'Ξ', color: '#8b5cf6' }, // ETH (Purple)
  { char: '₮', color: '#10b981' }, // USDT (Green)
  { char: 'Ł', color: '#94a3b8' }, // LTC (Slate)
  { char: 'Ð', color: '#c4b5fd' }, // DOGE (Lavender)
  { char: '💼', color: '#3b82f6' }, // Wallet
  { char: '💳', color: '#06b6d4' }, // Wallet/Card
  { char: '🏦', color: '#f43f5e' }, // Bank/Exchange
];

const RevolvingSymbols = () => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 30; // Number of floating symbols
  
  const items = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      // Distribute in a wide cylinder or sphere
      const radius = 8 + Math.random() * 10; // 8 to 18
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 15; // -7.5 to 7.5
      
      data.push({
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
        symbol: symbol.char,
        color: symbol.color,
        scale: 0.5 + Math.random() * 1.5,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <Float key={i} speed={item.speed} rotationIntensity={2} floatIntensity={2}>
          <Text
            position={item.position}
            rotation={item.rotation}
            fontSize={item.scale}
            color={item.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.4}
          >
            {item.symbol}
          </Text>
        </Float>
      ))}
    </group>
  );
};

export default function CryptoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-surface-950">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <RevolvingSymbols />
        </Suspense>
      </Canvas>
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-[2px] z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-950/50 via-transparent to-surface-950 z-10 pointer-events-none" />
    </div>
  );
}
