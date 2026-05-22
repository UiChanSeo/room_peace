import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CozyRoomProps {
  wallpaper?: string;
  rugColor?: string;
  toyPosition?: [number, number, number];
  showToy?: boolean;
  trust?: number;
}

export default function CozyRoom({
  wallpaper = 'cream',
  rugColor = 'yellow',
  toyPosition = [0, -0.4, 0],
  showToy = false,
  trust = 100
}: CozyRoomProps) {
  // Determine wall color based on wallpaper selection
  let wallColor = '#faf6ee'; // Cream
  if (wallpaper === 'blue') wallColor = '#e0f2fe'; // Sky Blue
  if (wallpaper === 'lavender') wallColor = '#f3e8ff'; // Lavender Pink

  // Determine rug color
  let rugMatColor = '#fef08a'; // Sunny Yellow
  if (rugColor === 'green') rugMatColor = '#bbf7d0'; // Forest Green
  if (rugColor === 'pink') rugMatColor = '#fbcfe8'; // Cozy Pink

  // Co-living atmosphere impacts room cleanliness/brightness
  const plantColor = trust >= 50 ? '#4ade80' : '#85a38f'; // Wilting plant color if trust is low

  // Animation Refs
  const leftCurtainRef = useRef<THREE.Group>(null);
  const rightCurtainRef = useRef<THREE.Group>(null);
  const lampLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 💨 Gentle curtain sway (afternoon room breeze simulation)
    if (leftCurtainRef.current) {
      leftCurtainRef.current.rotation.z = Math.sin(time * 0.8) * 0.025;
      leftCurtainRef.current.scale.x = 1.0 + Math.cos(time * 0.8) * 0.015;
    }
    if (rightCurtainRef.current) {
      rightCurtainRef.current.rotation.z = -Math.sin(time * 0.8) * 0.025;
      rightCurtainRef.current.scale.x = 1.0 + Math.cos(time * 0.8) * 0.015;
    }

    // 💡 Warm floor lamp light pulsing simulation
    if (lampLightRef.current) {
      lampLightRef.current.intensity = 1.2 + Math.sin(time * 2.2) * 0.08;
    }
  });

  return (
    <group>
      {/* 🪵 Floor (Cozy parquet wood color) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.405, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5efe6" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Grid lines on floor for isometric styling */}
      <gridHelper args={[10, 10, '#e5dcd3', '#f3eae1']} position={[0, -0.4, 0]} />

      {/* 🧱 Back Left Wall */}
      <mesh position={[-5, 2.1, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* 🧱 Back Right Wall */}
      <mesh position={[0, 2.1, -5]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* 🪟 Cozy Wall Window (on the back wall) */}
      <group position={[1.8, 1.3, -4.95]}>
        {/* Outer Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.4, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Window Glass with warm glow simulation */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial color="#fef9c3" toneMapped={false} />
        </mesh>
        {/* Window Grids */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.06, 1.2, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.2, 0.06, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 🛌 Pet Bed (Cylinder shape with cozy border) */}
      <group position={[-1.6, -0.34, -1.2]} castShadow receiveShadow>
        {/* Outer Cushion */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.65, 0.65, 0.12, 32]} />
          <meshStandardMaterial color="#ffe4e6" roughness={0.7} />
        </mesh>
        {/* Inner Padding */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      </group>

      {/* 🧶 Cozy Rug (positioned directly under the pet) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.395, 0]} receiveShadow>
        <ringGeometry args={[0, 1.1]} />
        <meshStandardMaterial color={rugMatColor} roughness={0.95} />
      </mesh>

      {/* 🪴 Potted Plant (Cylinder pot + spheres for leaves) */}
      <group position={[1.8, -0.4, -2.4]} castShadow>
        {/* Pot */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.15, 0.4, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={plantColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.72, -0.06]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color={plantColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.12, 0.78, 0.08]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={plantColor} roughness={0.9} />
        </mesh>
      </group>

      {/* 🛋️ Soft Cushion sofa (box shape on the back-left wall corner) */}
      <group position={[-2.8, -0.15, -2.8]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        {/* Sofa Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.4, 0.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
        {/* Sofa Backrest */}
        <mesh position={[0, 0.38, -0.28]} castShadow>
          <boxGeometry args={[1.5, 0.45, 0.24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
      </group>

      {/* 🍲 Food Bowl (Outer ceramic bowl + inner kibbles) */}
      <group position={[0.7, -0.4, 0.6]} castShadow>
        {/* Ceramic bowl base */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.12, 16]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>
        {/* Kibble food inside */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      </group>

      {/* Window Curtain Rail & Drapes */}
      <mesh position={[1.8, 2.1, -4.9]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2.0, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
      </mesh>

      {/* Left Curtain Group Hinge at Y = 2.0 */}
      <group ref={leftCurtainRef} position={[0.9, 2.0, -4.88]}>
        <mesh position={[0, -0.8, 0]} castShadow>
          <boxGeometry args={[0.22, 1.6, 0.04]} />
          <meshStandardMaterial color="#fef2f2" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Curtain Group Hinge at Y = 2.0 */}
      <group ref={rightCurtainRef} position={[2.7, 2.0, -4.88]}>
        <mesh position={[0, -0.8, 0]} castShadow>
          <boxGeometry args={[0.22, 1.6, 0.04]} />
          <meshStandardMaterial color="#fef2f2" roughness={0.8} />
        </mesh>
      </group>

      {/* Wall Shelf on Back-Left Wall */}
      <mesh position={[-4.92, 1.2, -1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.04, 1.0]} />
        <meshStandardMaterial color="#b45309" roughness={0.7} />
      </mesh>

      {/* Framed Pet Photo sitting on the shelf */}
      <group position={[-4.88, 1.48, -1.8]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.32, 0.03]} />
          <meshStandardMaterial color="#78350f" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.2, 0.26]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.12, 0.16]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      </group>

      {/* Wicker Toy Basket */}
      <group position={[-2.2, -0.4, 1.2]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.32, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.95} />
        </mesh>
        <mesh position={[0.05, 0.28, -0.05]} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.5} />
        </mesh>
        <mesh position={[-0.06, 0.3, 0.04]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#facc15" roughness={0.6} />
        </mesh>
      </group>

      {/* Floor Lamp emitting warm light */}
      <group position={[-3.6, -0.4, -1.0]}>
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.03, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 1.5, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.22, 0.3, 16]} />
          <meshStandardMaterial color="#fafaf9" roughness={0.2} emissive="#fef08a" emissiveIntensity={0.25} />
        </mesh>
        <pointLight ref={lampLightRef} position={[0, 1.4, 0]} color="#fde047" intensity={1.2} distance={4.5} decay={2} castShadow />
      </group>

      {/* low trust messy room clutter */}
      {trust < 50 && (
        <group>
          <mesh position={[-0.7, -0.38, 0.8]} castShadow>
            <dodecahedronGeometry args={[0.05]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          <mesh position={[1.1, -0.38, -0.4]} castShadow>
            <dodecahedronGeometry args={[0.045]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ⚽ Interactive Toy Ball */}
      {showToy && (
        <mesh position={toyPosition} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f87171" roughness={0.5} metalness={0.1} />
        </mesh>
      )}
    </group>
  );
}
