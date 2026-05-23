import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

// GLOBAL GLTF TEXTURE PATH FIX
// Ensures that if users upload texture files in the same directory as the GLTF (flattened),
// but the GLTF file internally references a "textures/" subfolder, the loader intercepts 
// and resolves it correctly to the same directory.
THREE.DefaultLoadingManager.setURLModifier((url) => {
  if (url.includes('/textures/')) {
    return url.replace('/textures/', '/');
  }
  return url;
});

interface PetRendererProps {
  petId?: string;
  petType?: string;
  mood?: string;
  toyPosition?: [number, number, number];
  showToy?: boolean;
  isInteracting?: boolean;
  interactionType?: 'pet' | 'feed' | 'toy' | 'none';
  equippedItems?: Record<string, string>;
}

export default function PetRenderer({ 
  petId = "lumi",
  petType = "dog",
  mood = "idle", 
  toyPosition = [0, -0.4, 0], 
  showToy = false,
  isInteracting = false,
  interactionType = 'none',
  equippedItems = {}
}: PetRendererProps) {
  const isShiba = petId === 'shiba-lumi';
  const isRabbit = petType === 'rabbit' || petId === 'boni';
  const isCat = petType === 'cat' || petId === 'momo';
  const isTurtle = petType === 'turtle' || petId === 'tori-turtle';

  // Dynamic path loading based on species & breed
  const path = isShiba ? "/models/dog/shiba/scene.gltf" : isTurtle ? "/models/turtle/scene.gltf" : isRabbit ? "/models/rabbit/scene.gltf" : isCat ? "/models/cat/scene.gltf" : "/models/dog/scene.gltf";
  const gltf = useGLTF(path);

  // Fix GLTF materials and color spaces (texture binding & SRGBColorSpace)
  useEffect(() => {
    if (gltf && gltf.scene) {
      let textureFound = false;
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
            mat.needsUpdate = true;
            if (mat.map) {
              textureFound = true;
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.needsUpdate = true;
            }
          }
        }
      });
      
      if (!textureFound) {
        console.warn(`[Global Pet Renderer] Texture failed to load or map is missing on material for petId: ${petId}`);
      }
    }
  }, [gltf, petId]);

  const ref = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  // Floor Y plane surface sits at -0.4, Rug sits at -0.395
  const yBase = -0.39;

  // Calculate the bounding box of the loaded glTF scene to automatically compensate for pivot center offsets
  const offset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Midpoints on X and Z axis, and the absolute minimum Y boundary coordinate
    const centerX = (box.max.x + box.min.x) / 2;
    const centerZ = (box.max.z + box.min.z) / 2;
    const minY = box.min.y;

    return {
      x: -centerX,
      y: -minY,
      z: -centerZ,
      height: size.y
    };
  }, [gltf.scene]);

  // Scale normalization: all pets normalized to a target room height of 0.85 units
  const normScale = useMemo(() => {
    if (!offset.height || offset.height === 0) return 1.0;
    return 0.85 / offset.height;
  }, [offset.height]);

  // Autonomous behavior states:
  // 'idle' (stand) | 'wander' (random rug coords) | 'goBed' | 'goRug' | 'goWindow' | 'goFood' | 'goToys'
  const [autoBehavior, setAutoBehavior] = useState<'idle' | 'wander' | 'goBed' | 'goRug' | 'goWindow' | 'goFood' | 'goToys'>('idle');
  const [autoTarget, setAutoTarget] = useState<{ x: number, z: number }>({ x: 0, z: 0 });

  // Periodically change behaviors when not sleeping, stressed, or actively playing with user
  useEffect(() => {
    if (mood === 'sleep' || mood === 'stressed' || isInteracting) {
      return;
    }

    const selectBehavior = () => {
      let rand = Math.random();
      
      // Emotional decor modifications
      const hasCozyRug = equippedItems['floor'] === 'cozy-rug';
      const hasPetCushion = equippedItems['petFurniture'] === 'pet-cushion';

      // If they have cozy items, slightly bias towards resting
      if (hasCozyRug && rand > 0.85) rand -= 0.5; // push towards goRug
      if (hasPetCushion && rand > 0.85) rand = 0.65; // push towards goBed

      if (rand < 0.20) {
        // Sit quietly in place
        setAutoBehavior('idle');
      } else if (rand < 0.35) {
        // Walk towards rug center area
        setAutoBehavior('goRug');
        setAutoTarget({ x: (Math.random() - 0.5) * 0.7, z: (Math.random() - 0.5) * 0.7 });
      } else if (rand < 0.45) {
        // Stand and look out window
        setAutoBehavior('goWindow');
        setAutoTarget({ x: 1.8, z: -3.8 });
      } else if (rand < 0.60) {
        // Inspect toy basket area
        setAutoBehavior('goToys');
        setAutoTarget({ x: -1.7, z: 1.0 });
      } else if (rand < 0.72) {
        // Rest on cushion bed
        setAutoBehavior('goBed');
        setAutoTarget({ x: -1.6, z: -1.2 });
      } else if (rand < 0.85) {
        // Idle near food bowl area
        setAutoBehavior('goFood');
        setAutoTarget({ x: 0.6, z: 0.4 });
      } else {
        // Wander randomly around the room
        setAutoBehavior('wander');
        setAutoTarget({
          x: (Math.random() - 0.5) * 2.2,
          z: -1.5 + (Math.random() * 2.8)
        });
      }
    };

    selectBehavior();

    // Cat moves slightly less frequently than dog, Rabbit is even more shy/timid
    // Shiba is erratic (can be fast or slow)
    // Turtle is extremely slow and moves rarely
    const intervalMultiplier = isTurtle ? 2.5 : isRabbit ? 1.6 : isCat ? 1.4 : isShiba ? 0.8 : 1.0;
    const intervalTime = (9000 + Math.random() * 6000) * intervalMultiplier;
    const timer = setInterval(selectBehavior, intervalTime);

    return () => clearInterval(timer);
  }, [mood, isInteracting, petType]);

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();

    // 1. Determine Target coordinates based on current active state/overrides
    let targetX = ref.current.position.x;
    let targetZ = ref.current.position.z;

    if (mood === "stressed") {
      targetX = -1.4;
      targetZ = -1.4;
    } else if (mood === "sleep") {
      targetX = -1.6;
      targetZ = -1.2;
    } else if (isInteracting) {
      if (interactionType === 'toy' && showToy) {
        targetX = toyPosition[0];
        targetZ = toyPosition[2];
      } else if (interactionType === 'feed') {
        // Run near food bowl
        targetX = 0.6;
        targetZ = 0.4;
      } else {
        // Petting: sit in front
        targetX = 0.0;
        targetZ = 0.1;
      }
    } else {
      // Autonomous walking targets
      if (autoBehavior !== 'idle') {
        targetX = autoTarget.x;
        targetZ = autoTarget.z;
      }
    }

    // 2. Check distance and apply organic locomotion wiggles to prevent visual sliding
    const dx = targetX - ref.current.position.x;
    const dz = targetZ - ref.current.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isWalking = dist > 0.08 && mood !== 'sleep';

    // Lerp translation coordinates (Cat walks a bit slower and more stealthily, rabbit moves cautiously)
    const lerpFactor = isWalking ? (isTurtle ? 0.012 : isRabbit ? 0.04 : isCat ? 0.035 : isShiba ? 0.065 : 0.05) : 0.08;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, lerpFactor);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, lerpFactor);

    // 3. Apply state-specific animations, rotations, and scales on body sub-group
    let currentY = yBase;
    let shadowScale = 1.0;
    let shadowOpacity = 0.28;

    if (bodyRef.current) {
      // Reset defaults
      bodyRef.current.scale.set(1.0, 1.0, 1.0);
      bodyRef.current.rotation.x = 0;
      bodyRef.current.rotation.y = 0;
      bodyRef.current.rotation.z = 0;

      if (isWalking) {
        // 🚶 Walking Animation wiggles
        // Dog: energetic bouncy walk
        // Cat: slow, elegant, low-height stealth walk
        // Rabbit: tiny hopping (fast frequency, slightly jumpy amplitude)
        // Shiba: arrogant strut (slower freq, higher bounce)
        // Turtle: extremely slow wobble
        const walkFreq = isTurtle ? 4 : isRabbit ? 14 : isShiba ? 6.5 : isCat ? 5.5 : 8.5;
        const walkAmp = isTurtle ? 0.02 : isRabbit ? 0.08 : isShiba ? 0.15 : isCat ? 0.04 : 0.12;
        const walkBounce = Math.abs(Math.sin(time * walkFreq)) * walkAmp;
        currentY = yBase + walkBounce;
        
        shadowScale = 1.0 - walkBounce * 0.4;
        shadowOpacity = 0.28 - walkBounce * 0.15;

        // Side-to-side body roll wiggles
        const rollFreq = isTurtle ? 4 : isRabbit ? 20 : isShiba ? 12 : isCat ? 11 : 17;
        const rollAmp = isTurtle ? 0.08 : isRabbit ? 0.04 : isShiba ? 0.08 : isCat ? 0.03 : 0.06;
        bodyRef.current.rotation.z = Math.sin(time * rollFreq) * rollAmp;

        // Face heading direction
        const headingAngle = Math.atan2(dx, dz);
        let diff = headingAngle - bodyRef.current.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        bodyRef.current.rotation.y += diff * 0.12;

      } else {
        // Arrived / Stationary Postures
        if (mood === "happy") {
          if (isShiba) {
            // Shiba happy: proud sitting, chest puffed, side eye
            const puff = Math.abs(Math.sin(time * 3)) * 0.04;
            currentY = yBase;
            bodyRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
            bodyRef.current.rotation.x = -0.15; // chest out
            bodyRef.current.scale.set(1.0, 1.0 + puff, 1.0);
          } else if (isTurtle) {
            // Turtle happy: head bops up and down very gently
            const hop = Math.abs(Math.sin(time * 2)) * 0.03;
            currentY = yBase + hop;
            bodyRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
          } else if (isCat) {
            // Cat happy: elegant sitting, tail sway (represented by tilt), slow purr/breathing wiggles
            const purr = Math.sin(time * 4) * 0.015;
            currentY = yBase + purr;
            bodyRef.current.rotation.y = Math.sin(time * 1.5) * 0.08;
            bodyRef.current.rotation.z = Math.sin(time * 3) * 0.02;
            
            const squash = Math.sin(time * 4) * 0.02;
            bodyRef.current.scale.set(1.0 - squash, 1.0 + squash, 1.0 - squash);
          } else if (isRabbit) {
            // Rabbit happy: small cute hops
            const hop = Math.abs(Math.sin(time * 8)) * 0.12;
            currentY = yBase + hop;
            bodyRef.current.rotation.y = Math.sin(time * 2) * 0.1;
            const squash = Math.sin(time * 8) * 0.03;
            bodyRef.current.scale.set(1.0 - squash, 1.0 + squash, 1.0 - squash);
          } else {
            // Dog happy
            const bounce = Math.abs(Math.sin(time * 6.5)) * 0.18;
            currentY = yBase + bounce;
            shadowScale = 1.0 - bounce * 0.45;
            shadowOpacity = 0.28 - bounce * 0.2;
            bodyRef.current.rotation.z = Math.sin(time * 15) * 0.08;
            bodyRef.current.rotation.y = Math.sin(time * 2.5) * 0.14; // look around
            
            const squash = Math.sin(time * 12) * 0.045;
            bodyRef.current.scale.set(1.0 - squash, 1.0 + squash, 1.0 - squash);
          }

        } else if (mood === "excited") {
          if (isShiba) {
            // Shiba excited: Playful spinning and sudden zoomies
            const runBounce = Math.abs(Math.sin(time * 18)) * 0.25;
            currentY = yBase + runBounce;
            shadowScale = 1.0 - runBounce * 0.5;
            shadowOpacity = 0.28 - runBounce * 0.25;
            bodyRef.current.rotation.y = time * 10; // fast spin
            const stretch = Math.sin(time * 28) * 0.06;
            bodyRef.current.scale.set(1.0 - stretch, 1.0 + stretch, 1.0 - stretch);
          } else if (isTurtle) {
            // Turtle excited: slightly faster head bop, no zoomies
            const hop = Math.abs(Math.sin(time * 4)) * 0.05;
            currentY = yBase + hop;
            bodyRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
          } else if (isCat) {
            // Cat excited: alert ears/posture, quick little playful pounces/jumps
            const pounce = Math.abs(Math.sin(time * 7)) * 0.16;
            currentY = yBase + pounce;
            shadowScale = 1.0 - pounce * 0.4;
            shadowOpacity = 0.28 - pounce * 0.18;
            bodyRef.current.rotation.x = -pounce * 0.2; // tilt forward
            bodyRef.current.rotation.y = Math.sin(time * 4) * 0.12;
          } else if (isRabbit) {
            // Rabbit excited: fast zoomies / quick hops in place
            const zoomie = Math.abs(Math.sin(time * 18)) * 0.15;
            currentY = yBase + zoomie;
            bodyRef.current.rotation.y = Math.sin(time * 6) * 0.2;
            bodyRef.current.rotation.x = -0.1;
          } else {
            // Dog excited
            const runBounce = Math.abs(Math.sin(time * 14)) * 0.22;
            currentY = yBase + runBounce;
            shadowScale = 1.0 - runBounce * 0.5;
            shadowOpacity = 0.28 - runBounce * 0.25;
            
            bodyRef.current.rotation.y = time * 7.5; // spin happily

            const stretch = Math.sin(time * 24) * 0.05;
            bodyRef.current.scale.set(1.0 - stretch, 1.0 + stretch, 1.0 - stretch);
          }

        } else if (mood === "sleep" || autoBehavior === 'goBed') {
          // Lay flat on cushion/floor
          currentY = yBase - 0.03;
          shadowScale = 1.15;
          shadowOpacity = 0.32;

          if (isCat) {
            // Cat: loaf sitting posture
            bodyRef.current.rotation.y = -0.6;
            const breath = Math.sin(time * 1.2) * 0.015;
            bodyRef.current.scale.set(1.0 + breath, 1.0 - breath, 1.0 + breath);
          } else if (isTurtle) {
            // Turtle sleeping: tucked slightly
            bodyRef.current.rotation.y = -0.4;
            bodyRef.current.rotation.x = 0.1; // head down
            const breath = Math.sin(time * 1.0) * 0.01;
            bodyRef.current.scale.set(1.0 - breath, 1.0 + breath, 1.0 - breath);
          } else if (isRabbit) {
            // Rabbit: curled up tight
            bodyRef.current.rotation.y = -0.3;
            bodyRef.current.rotation.x = 0.1;
            const breath = Math.sin(time * 1.8) * 0.012;
            bodyRef.current.scale.set(1.0 + breath, 1.0 - breath, 1.0 + breath);
          } else {
            // Dog & Shiba: laying flat
            bodyRef.current.rotation.x = Math.PI / 2.3; // Lay flat
            bodyRef.current.rotation.y = -0.5;
            const breath = Math.sin(time * 1.5) * 0.02;
            bodyRef.current.scale.set(1.0 + breath, 1.0 - breath, 1.0 + breath);
          }

        } else if (mood === "lonely") {
          currentY = yBase;
          bodyRef.current.rotation.z = Math.sin(time * 2) * 0.025;
          bodyRef.current.rotation.x = 0.18; // look down
          bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, 0.1);

        } else if (mood === "stressed") {
          if (isTurtle) {
            // Turtle stressed: hide in shell
            bodyRef.current.scale.set(0.9, 0.85, 0.9);
            bodyRef.current.rotation.x = 0.15;
            currentY = yBase - 0.03;
          } else {
            // Shiver corner
            const shiver = Math.sin(time * 48) * 0.01;
            currentY = yBase + shiver;
            shadowScale = 0.75;
            shadowOpacity = 0.18;

            bodyRef.current.rotation.y = 2.25; // face corner
            bodyRef.current.scale.setScalar(0.75); // shrink
          }

        } else {
          // Autonomous behavioral postures when stationary
          if (autoBehavior === 'goWindow') {
            // Face the window
            bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, Math.PI, 0.08);
            if (petType === 'cat') {
              // Cat stands up tall to look out window
              bodyRef.current.scale.y = 1.08;
            }
          } else if (autoBehavior === 'goFood') {
            // Face the food bowl
            bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, -Math.PI / 4, 0.08);
            const snackAnim = Math.sin(time * (petType === 'dog' ? 8 : 4.5)) * 0.025;
            bodyRef.current.rotation.x = Math.max(0, snackAnim);
          } else {
            // Idle breathing wiggles & slow head gaze turns
            const breathFreq = isShiba ? 1.8 : isTurtle ? 1.0 : isCat ? 1.4 : isRabbit ? 2.5 : 2;
            const breath = Math.sin(time * breathFreq) * 0.01;
            currentY = yBase + breath;
            shadowScale = 1.0 + breath * 0.4;
            shadowOpacity = 0.28 + breath * 0.1;

            if (isShiba) {
              // Shiba erratic actions: occasional back turn (ignoring), silent side-eye stare
              const shibaActionTimer = (time % 18);
              if (shibaActionTimer < 5) {
                // Ignore user (turn back)
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 2.5, 0.05);
              } else if (shibaActionTimer < 10) {
                // Side-eye staring
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, -0.6, 0.05);
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -0.05, 0.05);
              } else {
                // Proud sit
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.2, 0.05);
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -0.15, 0.05);
              }
            } else if (isTurtle) {
              // Turtle idle: very slow breathing, occasional slow blink (simulated by scale/rotation)
              const turtleActionTimer = (time % 12);
              if (turtleActionTimer < 4) {
                // look around slowly
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.2, 0.02);
              } else {
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, 0.02);
              }
            } else if (isCat) {
              // Cat elegant actions: slow blinking, ignoring user, head tilt sways, tail flicking
              const catActionTimer = (time % 15);
              // Add a periodic tail flick wiggle (swaying body back and forth gently on Z/Y)
              const tailFlick = Math.sin(time * 2) * 0.025;
              bodyRef.current.rotation.z = tailFlick;
              
              if (catActionTimer < 4) {
                // Ignore user (turn head away, classic cat attitude)
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, -0.7, 0.05);
              } else if (catActionTimer < 8) {
                // Grooming tilt (rotate body side to side like grooming paw)
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.35, 0.05);
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.15, 0.05);
                bodyRef.current.rotation.z += Math.sin(time * 4) * 0.06;
              } else if (catActionTimer < 11) {
                // Curl up / sit in sunlight look
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.1, 0.05);
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.08, 0.05);
              } else {
                // Slow blinking look around (micro head turns)
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(
                  bodyRef.current.rotation.y, 
                  Math.sin(time * 0.3) * 0.25, 
                  0.05
                );
              }
            } else if (isRabbit) {
              // Rabbit timid actions: ear twitching, sitting quietly, cautious movements
              const rabbitActionTimer = (time % 10);
              
              if (rabbitActionTimer < 3) {
                // Ear twitching (represented by quick slight head shakes)
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, Math.sin(time * 15) * 0.04, 0.2);
              } else if (rabbitActionTimer < 7) {
                // Cautious sniffing / leaning forward
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.12, 0.08);
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0.15, 0.05);
              } else {
                // Sitting quietly / gentle breathing
                bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, 0, 0.05);
                bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.05);
              }
            } else {
              // Dog idle
              bodyRef.current.rotation.y = THREE.MathUtils.lerp(
                bodyRef.current.rotation.y, 
                Math.sin(time * 0.35) * 0.35, 
                0.08
              );
            }
          }
        }
      }
    }

    // Update parent position Y axis
    ref.current.position.y = currentY;

    // Force shadow position Y coordinate to stay flat on the ground plane (absolute Y = -0.395)
    if (shadowRef.current) {
      shadowRef.current.position.y = -0.394 - currentY;
      shadowRef.current.scale.setScalar(shadowScale);

      const mat = shadowRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = shadowOpacity;
      }
    }
  });

  return (
    <group ref={ref} position={[0, yBase, 0]}>
      {/* 👤 Local Flat Soft Contact Shadow */}
      <mesh 
        ref={shadowRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.002, 0]} 
        receiveShadow
      >
        <ringGeometry args={[0, 0.38, 32]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.28} />
      </mesh>

      {/* Floating Emojis / Particles over the Pet */}
      {mood === "sleep" && (
        <Html position={[0, 0.45, 0]} center>
          <div style={{ position: "relative", pointerEvents: "none", userSelect: "none" }}>
            <style>{`
              @keyframes float-zzz {
                0% { transform: translateY(10px) scale(0.6); opacity: 0; }
                30% { opacity: 0.9; }
                80% { opacity: 0.9; }
                100% { transform: translateY(-45px) scale(1.1); opacity: 0; }
              }
              .zzz-1 { animation: float-zzz 3s infinite linear; }
              .zzz-2 { animation: float-zzz 3s infinite linear; animation-delay: 1s; }
              .zzz-3 { animation: float-zzz 3s infinite linear; animation-delay: 2s; }
            `}</style>
            <span className="zzz-1" style={{ position: "absolute", left: "-8px", color: "#818cf8", fontSize: "1.05rem", fontWeight: 700 }}>Z</span>
            <span className="zzz-2" style={{ position: "absolute", left: "6px", color: "#a5b4fc", fontSize: "0.85rem", fontWeight: 600 }}>z</span>
            <span className="zzz-3" style={{ position: "absolute", left: "-2px", top: "-12px", color: "#c7d2fe", fontSize: "0.7rem", fontWeight: 500 }}>z</span>
          </div>
        </Html>
      )}

      {mood === "happy" && (
        <Html position={[0, 0.55, 0]} center>
          <div style={{ position: "relative", pointerEvents: "none", userSelect: "none" }}>
            <style>{`
              @keyframes float-heart {
                0% { transform: translateY(5px) scale(0.5) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translateY(-35px) scale(1.1) rotate(15deg); opacity: 0; }
              }
              .heart-1 { animation: float-heart 2s infinite ease-out; }
              .heart-2 { animation: float-heart 2s infinite ease-out; animation-delay: 1s; }
            `}</style>
            <span className="heart-1" style={{ position: "absolute", left: "-14px", fontSize: "0.9rem" }}>💖</span>
            <span className="heart-2" style={{ position: "absolute", left: "10px", fontSize: "0.75rem" }}>✨</span>
          </div>
        </Html>
      )}

      {mood === "excited" && (
        <Html position={[0, 0.65, 0]} center>
          <div style={{ position: "relative", pointerEvents: "none", userSelect: "none" }}>
            <style>{`
              @keyframes float-star {
                0% { transform: translate(0, 5px) scale(0.4) rotate(0deg); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translate(var(--dx), -40px) scale(1.2) rotate(180deg); opacity: 0; }
              }
              .star-1 { --dx: -15px; animation: float-star 1.2s infinite ease-out; }
              .star-2 { --dx: 15px; animation: float-star 1.2s infinite ease-out; animation-delay: 0.4s; }
              .star-3 { --dx: -5px; animation: float-star 1.2s infinite ease-out; animation-delay: 0.8s; }
            `}</style>
            <span className="star-1" style={{ position: "absolute", left: "-16px", fontSize: "1rem" }}>⭐</span>
            <span className="star-2" style={{ position: "absolute", left: "12px", fontSize: "0.85rem" }}>✨</span>
            <span className="star-3" style={{ position: "absolute", left: "-2px", top: "-10px", fontSize: "0.9rem" }}>🔥</span>
          </div>
        </Html>
      )}

      {mood === "lonely" && (
        <Html position={[0, 0.5, 0]} center>
          <div style={{ position: "relative", pointerEvents: "none", userSelect: "none" }}>
            <style>{`
              @keyframes float-q {
                0% { transform: translateY(5px) scale(0.6); opacity: 0; }
                30% { opacity: 0.8; }
                100% { transform: translateY(-25px) scale(1); opacity: 0; }
              }
              .q-1 { animation: float-q 2.2s infinite ease-in-out; }
            `}</style>
            <span className="q-1" style={{ position: "absolute", left: "-6px", fontSize: "1.1rem" }}>🥺</span>
          </div>
        </Html>
      )}

      {mood === "stressed" && (
        <Html position={[-1.4, 0.22, -1.4]} center>
          <div style={{ position: "relative", pointerEvents: "none", userSelect: "none" }}>
            <style>{`
              @keyframes drip-sweat {
                0% { transform: translateY(-8px) scale(0.6); opacity: 0; }
                20% { opacity: 0.9; }
                100% { transform: translateY(12px) scale(1); opacity: 0; }
              }
              .sweat-1 { animation: drip-sweat 1.6s infinite ease-in; }
            `}</style>
            <span className="sweat-1" style={{ position: "absolute", left: "8px", top: "-5px", fontSize: "0.95rem" }}>💧</span>
          </div>
        </Html>
      )}

      {/* 🐕 Pet Body Group that handles mood scale deform & rotations */}
      <group ref={bodyRef}>
        <primitive
          object={gltf.scene}
          scale={normScale}
          position={[offset.x * normScale, offset.y * normScale, offset.z * normScale]}
        />
      </group>
    </group>
  );
}