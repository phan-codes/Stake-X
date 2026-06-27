import { useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Crypto Icon SVG paths (32×32 viewBox) ──────────────────────────
const CRYPTO_ICONS: Record<string, { path: string; color: string }> = {
  bitcoin: {
    path: "M21.5 13.5c1.1-0.6 1.8-1.6 1.8-2.8 0-2.3-1.8-4.2-4.1-4.2h-3v-4h-2v4h-2v-4h-2v4h-3v2h2.5c0.8 0 1.5 0.7 1.5 1.5v12c0 0.8-0.7 1.5-1.5 1.5h-2.5v2h3v4h2v-4h2v4h2v-4h3.5c2.5 0 4.5-2 4.5-4.5 0-1.6-0.8-3.1-2.2-3.9 1.4-0.6 2.3-2 2.3-3.6zM15.2 8.5h3c1.1 0 2 0.9 2 2s-0.9 2-2 2h-3v-4zM16.2 21.5h-4v-5h4c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5z",
    color: '#F7931A',
  },
  ethereum: {
    path: "M15.925 23.969L15.875 24v7.175l15.975-22.3zM16.075 23.969L16.125 24v7.175L0.15 8.875zM15.925 0L15.875 0.175v16.1l15.975-7.3zM16.075 0L16.125 0.175v16.1L0.15 8.975z",
    color: '#627EEA',
  },
  solana: {
    path: "M5.5 23.6l4.2-4.2h20.8l-4.2 4.2zM1.5 16l4.2-4.2h20.8l-4.2 4.2zM5.5 8.4l4.2-4.2h20.8l-4.2 4.2z",
    color: '#14F195',
  },
  tether: {
    path: "M16 2c7.7 0 14 6.3 14 14s-6.3 14-14 14S2 23.7 2 16 8.3 2 16 2zm4.5 9h-3.5v-2h-2v2H11.5v2h3.5v5.5c0 1.4 0.6 2.5 1.5 3 0.6 0.3 1.3 0.5 2.5 0.5v-2c-0.6 0-1-0.1-1.3-0.2-0.4-0.2-0.7-0.6-0.7-1.3v-5.5h3.5v-2z",
    color: '#8b5cf6',
  },
  bnb: {
    path: "M16 3l-7 7 2.5 2.5 4.5-4.5 4.5 4.5 2.5-2.5zM7 16l2.5-2.5 2.5 2.5-2.5 2.5zM25 16l-2.5-2.5-2.5 2.5 2.5 2.5zM16 29l-7-7 2.5-2.5 4.5 4.5 4.5-4.5 2.5 2.5zM16 21.5l-2.5-2.5 2.5-2.5 2.5 2.5z",
    color: '#F3BA2F',
  },
  xrp: {
    path: "M8 8l5.5 5.5L16 11l2.5 2.5L24 8h4l-9.5 9.5L16 15l-2.5 2.5L4 8zM8 24l5.5-5.5L16 21l2.5-2.5L24 24h4l-9.5-9.5L16 17l-2.5-2.5L4 24z",
    color: '#06b6d4',
  },
  cardano: {
    path: "M16 4a2 2 0 110 4 2 2 0 010-4zm0 20a2 2 0 110 4 2 2 0 010-4zm10-10a2 2 0 110 4 2 2 0 010-4zM6 14a2 2 0 110 4 2 2 0 010-4zm17.07-6.07a1.5 1.5 0 112.12 2.12 1.5 1.5 0 01-2.12-2.12zM6.81 21.95a1.5 1.5 0 112.12 2.12 1.5 1.5 0 01-2.12-2.12zm16.26 0a1.5 1.5 0 112.12 2.12 1.5 1.5 0 01-2.12-2.12zM6.81 7.93a1.5 1.5 0 112.12 2.12 1.5 1.5 0 01-2.12-2.12zM16 12a4 4 0 110 8 4 4 0 010-8z",
    color: '#a78bfa',
  },
  polkadot: {
    path: "M16 6a4 4 0 110 8 4 4 0 010-8zm0 12a4 4 0 110 8 4 4 0 010-8zm-7-2a3 3 0 110 6 3 3 0 010-6zm14 0a3 3 0 110 6 3 3 0 010-6zM9 6a3 3 0 110 6 3 3 0 010-6zm14 0a3 3 0 110 6 3 3 0 010-6z",
    color: '#06b6d4',
  },
  avalanche: {
    path: "M20.5 24H26l-10-18-3.5 6.5L16 18.5l-3.5 5.5h5l2.5-4zM6 24h7l-3.5-6z",
    color: '#8b5cf6',
  },
};

// ── Build coin texture matching CryptoWorldBackground style ────────
function createCoinTexture(pathD: string, logoColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Tile background (violet-like dark circle)
  ctx.fillStyle = '#2e1065';
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
  ctx.translate(128, 128);
  ctx.scale(8, 8);
  ctx.fill(p);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Pre‑build textures once at module scope
const coinTextures = Object.fromEntries(
  Object.entries(CRYPTO_ICONS).map(([key, { path, color }]) => [
    key,
    createCoinTexture(path, color),
  ])
) as Record<string, THREE.CanvasTexture>;

const COIN_GEOMETRY = new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24);
COIN_GEOMETRY.rotateX(Math.PI / 2); // face towards camera

// ── Orbiting Crypto Coins ──────────────────────────────────────────
const COPIES_PER_TYPE = 3; // spawn multiple copies of each coin type

const OrbitingCryptoCoins = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Build per-coin data – multiple copies per type
  const coins = useMemo(() => {
    const keys = Object.keys(CRYPTO_ICONS);
    const allCoins: {
      key: string;
      baseAngle: number;
      tiltX: number;
      tiltZ: number;
      radius: number;
      orbitSpeed: number;
      spinSpeed: number;
      yOffset: number;
      scale: number;
    }[] = [];

    keys.forEach((key, typeIdx) => {
      for (let copy = 0; copy < COPIES_PER_TYPE; copy++) {
        const idx = typeIdx * COPIES_PER_TYPE + copy;
        const totalCoins = keys.length * COPIES_PER_TYPE;
        const baseAngle = (idx / totalCoins) * Math.PI * 2 + copy * 1.2;
        const tiltX = (Math.random() - 0.5) * 0.6;
        const tiltZ = (Math.random() - 0.5) * 0.4;
        allCoins.push({
          key,
          baseAngle,
          tiltX,
          tiltZ,
          radius: 3.0 + Math.random() * 1.2,      // 3.0 – 4.2
          orbitSpeed: 0.06 + Math.random() * 0.06,  // slow orbit
          spinSpeed: 0.25 + Math.random() * 0.3,
          yOffset: (Math.random() - 0.5) * 1.0,
          scale: 0.8 + Math.random() * 0.5,          // varied sizes
        });
      }
    });
    return allCoins;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const c = coins[i];
      if (!c) return;
      const angle = c.baseAngle + t * c.orbitSpeed;
      child.position.x = Math.cos(angle) * c.radius;
      child.position.z = Math.sin(angle) * c.radius;
      child.position.y = c.yOffset + Math.sin(t * 0.35 + c.baseAngle) * 0.35;

      // Gentle local spin so faces catch the light
      child.rotation.y = t * c.spinSpeed;
      child.rotation.x = c.tiltX + Math.sin(t * 0.25 + i) * 0.2;
      child.rotation.z = c.tiltZ;

      child.scale.setScalar(c.scale);
    });
  });

  return (
    <group ref={groupRef}>
      {coins.map((c, i) => (
        <mesh key={`${c.key}-${i}`} geometry={COIN_GEOMETRY}>
          <meshStandardMaterial
            map={coinTextures[c.key]}
            metalness={0.5}
            roughness={0.2}
            emissive={CRYPTO_ICONS[c.key].color}
            emissiveIntensity={0.35}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

// ── Faint orbit ring to visually anchor the coins ──────────────────
const CoinOrbitRing = () => (
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[3.3, 0.008, 12, 100]} />
    <meshBasicMaterial color="#8b5cf6" transparent opacity={0.18} />
  </mesh>
);

const GlobePoints = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const ConnectingLines = () => {
  const linesRef = useRef<THREE.Group>(null);
  const linesCount = 20;
  
  const curves = useMemo(() => {
    const paths: THREE.Vector3[][] = [];
    for (let i = 0; i < linesCount; i++) {
      const startPhi = Math.acos(2 * Math.random() - 1);
      const startTheta = Math.random() * Math.PI * 2;
      const r = 2.6;
      const endPhi = Math.acos(2 * Math.random() - 1);
      const endTheta = Math.random() * Math.PI * 2;
      
      const start = new THREE.Vector3(
        r * Math.sin(startPhi) * Math.cos(startTheta),
        r * Math.sin(startPhi) * Math.sin(startTheta),
        r * Math.cos(startPhi)
      );
      
      const end = new THREE.Vector3(
        r * Math.sin(endPhi) * Math.cos(endTheta),
        r * Math.sin(endPhi) * Math.sin(endTheta),
        r * Math.cos(endPhi)
      );
      
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(r * 1.5);
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      paths.push(curve.getPoints(50));
    }
    return paths;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      linesRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={linesRef}>
      {curves.map((points, idx) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: "#06b6d4", transparent: true, opacity: 0.3 });
        const line = new THREE.Line(geometry, material);
        return <primitive key={idx} object={line} />;
      })}
    </group>
  );
};

const OrbitingElements = () => {
  const groupRef = useRef<THREE.Group>(null);
  const elementsCount = 5;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * (Math.PI * 2 / 5)) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: elementsCount }).map((_, i) => {
        const angle = (i / elementsCount) * Math.PI * 2;
        const radius = 3.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Sphere key={i} position={[x, 0, z]} args={[0.1, 16, 16]}>
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"} 
              emissive={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
              emissiveIntensity={0.8}
            />
          </Sphere>
        );
      })}
    </group>
  );
};

const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Smoothly interpolate rotation towards mouse position
      const targetX = (mouse.y * Math.PI) / 6;
      const targetY = (mouse.x * Math.PI) / 6;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      
      <Sphere args={[2.45, 32, 32]}>
        <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
      </Sphere>
      
      <GlobePoints />
      <ConnectingLines />
      <OrbitingElements />
      <CoinOrbitRing />
      <OrbitingCryptoCoins />
    </group>
  );
};

export default function GlobalNetworkAnimation() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
