import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { CssGlassPlatesFallback } from './CssGlassPlatesFallback';

function GlassSlab({ position, rotation, index }: { position: [number, number, number]; rotation: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index * 0.3) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[2.4, 3.2, 0.06]} />
      <meshPhysicalMaterial
        color="#3DE06A"
        emissive="#0A3B1B"
        emissiveIntensity={0.4}
        roughness={0.1}
        metalness={0.1}
        transmission={0.88}
        thickness={1.2}
        ior={1.45}
        transparent={true}
        opacity={0.85}
      />
    </mesh>
  );
}

function FloatingShapes() {
  const torusRef = useRef<THREE.Mesh>(null);
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.4;
      torusRef.current.rotation.y = t * 0.6;
    }
    if (cubeRef.current) {
      cubeRef.current.rotation.x = t * 0.5;
      cubeRef.current.rotation.z = t * 0.3;
    }
  });

  return (
    <>
      <mesh ref={torusRef} position={[-2.2, 1.8, 0.5]}>
        <torusGeometry args={[0.35, 0.1, 16, 32]} />
        <meshStandardMaterial color="#55FF76" emissive="#12C94B" emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh ref={cubeRef} position={[2.4, -1.2, 0.8]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#55FF76" emissive="#3DE06A" emissiveIntensity={0.5} roughness={0.1} metalness={0.9} />
      </mesh>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#FFFFFF" />
      <directionalLight position={[-5, -4, -3]} intensity={3.5} color="#55FF76" />
      <pointLight position={[0, 0, 2]} intensity={2.2} color="#12C94B" distance={6} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group position={[-0.2, 0, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <GlassSlab
              key={i}
              index={i}
              position={[i * 0.22 - 0.5, i * 0.16 - 0.3, i * 0.28 - 0.7]}
              rotation={[-0.45 + i * 0.02, 0.55 - i * 0.02, -0.3 + i * 0.02]}
            />
          ))}
          <FloatingShapes />
        </group>
      </Float>
    </>
  );
}

export const HeroGlassPlates: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return <CssGlassPlatesFallback />;
  }

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] select-none">
      <Suspense fallback={<CssGlassPlatesFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default HeroGlassPlates;
