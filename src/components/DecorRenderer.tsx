import { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { decorItemsList } from '../data/decorData';

interface DecorRendererProps {
  equippedItems: Record<string, string>;
}

// Positions for different categories
const DECOR_POSITIONS: Record<string, [number, number, number]> = {
  floor: [0, -0.38, 0],
  lighting: [1.8, -0.38, -1.8], // corner
  plant: [-1.8, -0.38, -1.8], // other corner
  petFurniture: [-1.4, -0.38, 1.2], // front corner
  wall: [0, 1.2, -3.95] // back wall
};

// Simple Fallback meshes when 3D models are missing (primitive:xxx)
function PrimitivePlaceholder({ id, position }: { id: string, position: [number, number, number] }) {
  if (id === 'cozy-rug') {
    return (
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
    );
  }
  if (id === 'cloud-mat') {
    return (
      <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    );
  }
  if (id === 'sunset-lamp') {
    return (
      <group position={position}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#fdba74" />
        </mesh>
      </group>
    );
  }
  if (id === 'warm-stand') {
    return (
      <group position={position}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      </group>
    );
  }
  if (id === 'plant-monstera') {
    return (
      <group position={position}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 16]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>
    );
  }
  if (id === 'plant-cactus') {
    return (
      <group position={position}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.3, 16]} />
          <meshStandardMaterial color="#c2410c" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.3, 16, 16]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
      </group>
    );
  }
  if (id === 'pet-cushion') {
    return (
      <mesh position={position} receiveShadow castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.15, 32]} />
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>
    );
  }
  if (id === 'pet-toy-basket') {
    return (
      <mesh position={position} receiveShadow castShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#d4d4d8" />
      </mesh>
    );
  }
  if (id === 'pet-hideout') {
    return (
      <mesh position={position} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#fed7aa" />
      </mesh>
    );
  }
  if (id === 'wall-poster') {
    return (
      <mesh position={position} receiveShadow>
        <planeGeometry args={[1.2, 1.6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    );
  }
  if (id === 'wall-peace-frame') {
    return (
      <mesh position={position} receiveShadow>
        <planeGeometry args={[1.0, 0.8]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
    );
  }

  // Generic fallback
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
  );
}

function DecorModel({ modelPath, position }: { modelPath: string, position: [number, number, number] }) {
  const gltf = useGLTF(modelPath);
  
  // Safe traversal for shadows and textures
  useMemo(() => {
    if (gltf && gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.needsUpdate = true;
            if (mat.map) {
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [gltf]);

  return <primitive object={gltf.scene.clone()} position={position} />;
}

export default function DecorRenderer({ equippedItems }: DecorRendererProps) {
  return (
    <>
      {Object.entries(equippedItems).map(([category, itemId]) => {
        const itemDef = decorItemsList.find(i => i.id === itemId);
        if (!itemDef) return null;

        const pos = DECOR_POSITIONS[category] || [0, 0, 0];

        // If the path is a primitive placeholder, render it directly
        if (itemDef.modelPath.startsWith('primitive:')) {
          return <PrimitivePlaceholder key={itemId} id={itemId} position={pos} />;
        }

        // If it's a real 3D model, render via Suspense
        return (
          <Suspense key={itemId} fallback={<PrimitivePlaceholder id={itemId} position={pos} />}>
            <DecorModel modelPath={itemDef.modelPath} position={pos} />
          </Suspense>
        );
      })}
    </>
  );
}
