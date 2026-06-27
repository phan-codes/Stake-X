import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Standard SVG paths for 32x32 viewBox
const ICONS = {
  bitcoin: "M21.5 13.5c1.1-0.6 1.8-1.6 1.8-2.8 0-2.3-1.8-4.2-4.1-4.2h-3v-4h-2v4h-2v-4h-2v4h-3v2h2.5c0.8 0 1.5 0.7 1.5 1.5v12c0 0.8-0.7 1.5-1.5 1.5h-2.5v2h3v4h2v-4h2v4h2v-4h3.5c2.5 0 4.5-2 4.5-4.5 0-1.6-0.8-3.1-2.2-3.9 1.4-0.6 2.3-2 2.3-3.6zM15.2 8.5h3c1.1 0 2 0.9 2 2s-0.9 2-2 2h-3v-4zM16.2 21.5h-4v-5h4c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5z",
  ethereum: "M15.925 23.969L15.875 24v7.175l15.975-22.3zM16.075 23.969L16.125 24v7.175L0.15 8.875zM15.925 0L15.875 0.175v16.1l15.975-7.3zM16.075 0L16.125 0.175v16.1L0.15 8.975z",
  solana: "M5.5 23.6l4.2-4.2h20.8l-4.2 4.2zM1.5 16l4.2-4.2h20.8l-4.2 4.2zM5.5 8.4l4.2-4.2h20.8l-4.2 4.2z",
  tether: "M16 2c7.7 0 14 6.3 14 14s-6.3 14-14 14S2 23.7 2 16 8.3 2 16 2zm4.5 9h-3.5v-2h-2v2H11.5v2h3.5v5.5c0 1.4 0.6 2.5 1.5 3 0.6 0.3 1.3 0.5 2.5 0.5v-2c-0.6 0-1-0.1-1.3-0.2-0.4-0.2-0.7-0.6-0.7-1.3v-5.5h3.5v-2z",
  bnb: "M16 3l-7 7 2.5 2.5 4.5-4.5 4.5 4.5 2.5-2.5zM7 16l2.5-2.5 2.5 2.5-2.5 2.5zM25 16l-2.5-2.5-2.5 2.5 2.5 2.5zM16 29l-7-7 2.5-2.5 4.5 4.5 4.5-4.5 2.5 2.5zM16 21.5l-2.5-2.5 2.5-2.5 2.5 2.5z",
  wallet: "M26 8H6c-2.2 0-4 1.8-4 4v10c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V12c0-2.2-1.8-4-4-4zm-2 11c-1.1 0-2-0.9-2-2s0.9-2 2-2 2 0.9 2 2-0.9 2-2 2zm2-13H6c-1.1 0-2 0.9-2 2v1h24V8c0-1.1-0.9-2-2-2z"
};

// Create a tile texture dynamically
function createIconTexture(pathD: string, logoColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Tile background (violet-like dark circle)
  ctx.fillStyle = '#2e1065'; // Very dark violet so logos pop
  ctx.beginPath();
  ctx.arc(256, 256, 248, 0, Math.PI * 2);
  ctx.fill();

  // Glow effect setup for border
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 10;

  // Tile border (violet)
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Inner highlight (white-ish)
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 256, 224, 0, Math.PI * 2);
  ctx.stroke();

  // Draw logo
  ctx.shadowColor = logoColor;
  ctx.shadowBlur = 15;
  const p = new Path2D(pathD);
  ctx.fillStyle = logoColor;
  ctx.translate(128, 128); // center the 32x32 icon scaled by 8
  ctx.scale(8, 8); // 32 * 8 = 256
  ctx.fill(p);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate textures once with real-world branding colors
const textures = {
  bitcoin: createIconTexture(ICONS.bitcoin, '#F7931A'),
  ethereum: createIconTexture(ICONS.ethereum, '#627EEA'),
  solana: createIconTexture(ICONS.solana, '#14F195'),
  tether: createIconTexture(ICONS.tether, '#26A17B'),
  bnb: createIconTexture(ICONS.bnb, '#F3BA2F'),
  wallet: createIconTexture(ICONS.wallet, '#3b82f6'),
};

const TILE_GEOMETRY = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 32);
TILE_GEOMETRY.rotateX(Math.PI / 2); // Rotate so the circular face points towards Z (camera)

function IconSwarm({ type, count, radiusRange, speed }: { type: keyof typeof ICONS, count: number, radiusRange: [number, number], speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Pre-calculate positions, orbits, and rotations
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const radius = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
      // Distribute mostly around the equator but with some tilt
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.5; // slight y variation
      
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.sin(theta);

      data.push({
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        orbitOffset: Math.random() * Math.PI * 2,
        orbitSpeed: (0.05 + Math.random() * 0.15) * speed,
        spinSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015),
        scale: 0.6 + Math.random() * 0.8,
        radius
      });
    }
    return data;
  }, [count, radiusRange, speed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Orbit
      const currentAngle = p.orbitOffset + time * p.orbitSpeed;
      dummy.position.x = Math.cos(currentAngle) * p.radius;
      dummy.position.z = Math.sin(currentAngle) * p.radius;
      // Drift vertically
      dummy.position.y = p.position.y + Math.sin(time * 0.5 + p.orbitOffset) * 2.0;

      // Spin locally
      dummy.rotation.x += p.spinSpeed.x;
      dummy.rotation.y += p.spinSpeed.y;
      dummy.rotation.z += p.spinSpeed.z;

      // Always slightly face outwards but maintain spin
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[TILE_GEOMETRY, undefined, count]} castShadow receiveShadow>
      <meshStandardMaterial 
        map={textures[type]} 
        metalness={0.6} 
        roughness={0.3}
        emissive="#ffffff"
        emissiveIntensity={0.05}
        transparent={true}
      />
    </instancedMesh>
  );
}

const CryptoGlobe = ({ isMobile }: { isMobile: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Parallax interaction on mouse move
  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, y } = state.pointer;
    
    // Smooth damp towards target rotation - greatly slowed down global rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, y * 0.05, 0.02);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.05 + state.clock.getElapsedTime() * 0.015, 0.02);
  });

  return (
    <group ref={groupRef}>
      {/* Invisible anchor sphere inside */}
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.5} />
      </mesh>

      {/* Orbital Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[10, 0.02, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.2, 0.1, 0]}>
        <torusGeometry args={[14, 0.015, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} /> {/* Minimal secondary light blue */}
      </mesh>
      <mesh rotation={[Math.PI / 2 - 0.2, -0.1, 0]}>
        <torusGeometry args={[18, 0.01, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      {/* Icon Swarms */}
      <IconSwarm type="bitcoin" count={isMobile ? 12 : 25} radiusRange={[8, 20]} speed={0.2} />
      <IconSwarm type="ethereum" count={isMobile ? 10 : 20} radiusRange={[10, 22]} speed={0.18} />
      <IconSwarm type="solana" count={isMobile ? 8 : 15} radiusRange={[12, 18]} speed={0.25} />
      <IconSwarm type="tether" count={isMobile ? 8 : 15} radiusRange={[9, 16]} speed={0.22} />
      <IconSwarm type="bnb" count={isMobile ? 8 : 15} radiusRange={[11, 19]} speed={0.19} />
      <IconSwarm type="wallet" count={isMobile ? 5 : 10} radiusRange={[15, 24]} speed={0.15} />
    </group>
  );
};

export default function CryptoWorldBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0a0a]">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }} dpr={isMobile ? [1, 1] : [1, 1.5]}>
        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#8b5cf6" />
        <directionalLight position={[-10, -20, -10]} intensity={0.5} color="#38bdf8" />
        
        {/* Subtle particle field */}
        <Stars radius={50} depth={50} count={isMobile ? 1000 : 3000} factor={4} saturation={0} fade speed={0.5} />
        
        <CryptoGlobe isMobile={isMobile} />
      </Canvas>
      
      {/* Dark overlay gradients for text readability */}
      <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/50 pointer-events-none" />
    </div>
  );
}
