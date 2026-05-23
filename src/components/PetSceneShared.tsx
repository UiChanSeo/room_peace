import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SharedProps {
  mood?: string;
  equippedItems?: Record<string, string>;
}

export function AmbientParticles() {
  // Spawn 15 particles with random initial positions and speeds
  const count = 12;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 3,
    y: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2,
    speed: 0.15 + Math.random() * 0.25,
    wobbleSpeed: 1 + Math.random() * 2,
    size: 0.015 + Math.random() * 0.02
  }));

  return (
    <group>
      {particles.map((p) => (
        <ParticleItem key={p.id} {...p} />
      ))}
    </group>
  );
}

function ParticleItem({ x, y, z, speed, wobbleSpeed, size }: { x: number; y: number; z: number; speed: number; wobbleSpeed: number; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const initialY = y;

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    
    // Float upwards
    ref.current.position.y += speed * 0.005;
    
    // Horizontal wobble
    ref.current.position.x = x + Math.sin(time * wobbleSpeed) * 0.1;
    
    // Reset if it goes too high
    if (ref.current.position.y > 1.2) {
      ref.current.position.y = -1.0;
    }

    // Gentle size pulsing
    const scale = 1 + Math.sin(time * 3) * 0.25;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref} position={[x, initialY, z]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="#ffe082" transparent opacity={0.45} />
    </mesh>
  );
}

export function PetShadow({ mood = "idle" }: SharedProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const material = ref.current.material as THREE.MeshBasicMaterial;
    if (!material) return;

    const time = state.clock.getElapsedTime();

    // Reset basics
    ref.current.position.x = 0;
    ref.current.scale.setScalar(1);

    if (mood === "happy") {
      // Shadow shrinks/expands as pet bounces
      const bounce = Math.abs(Math.sin(time * 6)) * 0.25;
      const sizeScale = 1 - bounce * 0.4;
      ref.current.scale.setScalar(sizeScale);
      material.opacity = 0.35 - bounce * 0.15;
    } else if (mood === "excited") {
      const jump = Math.abs(Math.sin(time * 12)) * 0.65;
      const sizeScale = Math.max(0.3, 1 - jump * 0.6);
      ref.current.scale.setScalar(sizeScale);
      material.opacity = Math.max(0.05, 0.4 - jump * 0.3);
    } else if (mood === "sleep") {
      // Slightly larger shadow when slumped
      ref.current.scale.setScalar(1.05);
      material.opacity = 0.38 + Math.sin(time * 1.8) * 0.03;
    } else if (mood === "stressed") {
      // Shadow moved to left corner with the pet
      ref.current.position.x = -0.45;
      ref.current.scale.setScalar(0.75); // smaller scale for shrunk posture
      material.opacity = 0.25;
    } else {
      // Idle breathing pulsing
      const breath = Math.sin(time * 2) * 0.02;
      ref.current.scale.setScalar(1 + breath);
      material.opacity = 0.3 + breath * 0.05;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.394, 0]}>
      <ringGeometry args={[0, 0.36, 32]} />
      <meshBasicMaterial color="#0f172a" transparent opacity={0.3} />
    </mesh>
  );
}

export function DynamicLights({ mood = "idle", equippedItems = {} }: SharedProps) {
  let ambientIntensity = 1.6;
  let dirIntensity = 1.8;
  let lightColor = "#fff7ed"; // warm cream

  if (mood === "sleep" || mood === "stressed") {
    ambientIntensity = 0.8;
    dirIntensity = 0.6;
    lightColor = "#c7d2fe"; // indigo/dim blue
  } else if (mood === "happy" || mood === "excited") {
    ambientIntensity = 2.0;
    dirIntensity = 2.4;
    lightColor = "#fffbeb"; // bright amber/sunlight
  }

  // Override / adjust based on lighting decor
  if (equippedItems['lighting'] === 'sunset-lamp') {
    lightColor = "#fdba74"; // orange sunset tint
    ambientIntensity = Math.max(ambientIntensity, 1.4) * 1.2;
    dirIntensity *= 1.1;
  } else if (equippedItems['lighting'] === 'warm-stand') {
    lightColor = "#fef08a"; // warm yellow tint
    ambientIntensity = Math.max(ambientIntensity, 1.2) * 1.1;
  }

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={dirIntensity} 
        color={lightColor}
        castShadow 
      />
      <pointLight 
        position={[-5, 5, -5]} 
        intensity={ambientIntensity * 0.3} 
        color={lightColor} 
      />
    </>
  );
}
