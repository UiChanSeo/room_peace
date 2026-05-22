import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PetRenderer from '../components/PetRenderer';
import CozyRoom from '../components/CozyRoom';
import { AmbientParticles, DynamicLights } from '../components/PetSceneShared';

interface Diary {
  id: number;
  text: string;
  date: string;
}

// 🎥 Dynamic Camera component that smoothly transitions positions & targets based on states
interface DynamicCameraProps {
  mood: string;
  isInteracting: boolean;
  interactionType: 'pet' | 'feed' | 'toy' | 'none';
  controlsRef: React.RefObject<any>;
}

function DynamicCamera({ mood, isInteracting, interactionType, controlsRef }: DynamicCameraProps) {
  const { camera } = useThree();

  // Target positions & focus target vectors (calm, cozy wide room view default)
  const targetPos = new THREE.Vector3(0, 1.6, 6.5); 
  const targetLook = new THREE.Vector3(0, 0.05, 0);

  if (isInteracting) {
    if (interactionType === 'pet') {
      // Extremely subtle dolly closer (only 6% closer: Z moves from 6.5 down to 6.1)
      targetPos.set(0, 1.55, 6.1);
      targetLook.set(0, 0.02, 0);
    } else if (interactionType === 'feed') {
      // Very tiny focus shift toward food bowl area
      targetPos.set(0.12, 1.5, 6.2);
      targetLook.set(0.1, -0.05, 0.1);
    } else if (interactionType === 'toy') {
      // Barely noticeable zoom back to capture the wider room
      targetPos.set(0, 1.68, 6.7);
      targetLook.set(0, 0.05, 0);
    }
  } else if (mood === 'sleep') {
    // Cinematic slow diagonal tilt
    targetPos.set(-0.25, 1.7, 6.4);
    targetLook.set(-0.1, -0.02, -0.1);
  } else if (mood === 'stressed') {
    // Very gentle lean toward back left huddle corner
    targetPos.set(-0.2, 1.62, 6.3);
    targetLook.set(-0.2, 0.0, -0.2);
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 🎥 Subtle ambient camera sway (cinematic handheld parallax effect)
    const swayX = Math.sin(time * 0.45) * 0.08;
    const swayY = Math.cos(time * 0.35) * 0.04;

    const finalPos = targetPos.clone().add(new THREE.Vector3(swayX, swayY, 0));

    // Smoothly LERP camera position (0.045 factor ensures ease equivalent of 0.8s)
    camera.position.lerp(finalPos, 0.045);

    // Smoothly LERP OrbitControls center target point
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, 0.045);
      controlsRef.current.update();
    }
  });

  return null;
}

export default function PetHouse() {
  const controlsRef = useRef<any>(null);

  // Sync states with localStorage
  const [petName, setPetName] = useState('루미');
  const [petType, setPetType] = useState('dog');
  const [petEmoji, setPetEmoji] = useState('🐶');
  const [trust, setTrust] = useState(100);
  const [streak, setStreak] = useState(14);
  const [teamBerry, setTeamBerry] = useState(8420);
  const [houseName, setHouseName] = useState('달빛 펭귄가족 🏠');

  // Customization choices
  const [wallpaper, setWallpaper] = useState('cream');
  const [rugColor, setRugColor] = useState('yellow');

  // Interactive states
  const [activeMood, setActiveMood] = useState<'idle' | 'happy' | 'excited' | 'sleep' | 'lonely' | 'stressed'>('idle');
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<'pet' | 'feed' | 'toy' | 'none'>('none');
  const [interactionText, setInteractionText] = useState('');
  
  // Toy Ball simulation states
  const [showToy, setShowToy] = useState(false);
  const [toyPosition, setToyPosition] = useState<[number, number, number]>([0, -0.4, 0]);

  // Drawer Tabs: 'play' | 'decorate'
  const [activeTab, setActiveTab] = useState<'play' | 'decorate'>('play');

  // Diaries states
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  // Time detection
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 20 || currentHour < 6;

  // Load and sync localStorage
  useEffect(() => {
    const handleSync = () => {
      setPetName(localStorage.getItem('roompeace_pet_name') || '루미');
      setPetType(localStorage.getItem('roompeace_pet_type') || 'dog');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');
      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setStreak(parseInt(localStorage.getItem('roompeace_streak') || '14'));
      setTeamBerry(parseInt(localStorage.getItem('roompeace_team_berry') || '8420'));
      setHouseName(localStorage.getItem('roompeace_house_name') || '달빛 펭귄가족 🏠');
      setDiaries(JSON.parse(localStorage.getItem('roompeace_diaries') || '[]'));

      setWallpaper(localStorage.getItem('roompeace_equipped_wallpaper') || 'cream');
      setRugColor(localStorage.getItem('roompeace_equipped_rug') || 'yellow');
    };

    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Determine default pet mood based on trust & time of day
  useEffect(() => {
    if (isInteracting) return;

    if (isNight) {
      setActiveMood('sleep');
    } else if (trust < 20) {
      setActiveMood('sleep');
    } else if (trust < 50) {
      setActiveMood('stressed');
    } else if (trust < 80) {
      setActiveMood('lonely');
    } else if (trust >= 120) {
      setActiveMood('happy');
    } else {
      setActiveMood('idle');
    }
  }, [trust, isNight, isInteracting]);

  // Log a new memory helper
  const addMemoryDiary = (text: string) => {
    const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newDiary: Diary = {
      id: Date.now(),
      text,
      date: dateStr
    };
    const updated = [newDiary, ...diaries];
    setDiaries(updated);
    localStorage.setItem('roompeace_diaries', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  // 🍖 Toss Snack Handler
  const handleFeedSnack = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setInteractionType('feed');
    setActiveMood('excited');
    
    // Add trust
    const nextTrust = Math.min(150, trust + 5);
    setTrust(nextTrust);
    localStorage.setItem('roompeace_trust', nextTrust.toString());

    // Deduct 10 berries
    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const nextBerry = Math.max(0, currentBerry - 10);
    localStorage.setItem('roompeace_berry', nextBerry.toString());
    window.dispatchEvent(new Event('storage'));

    setInteractionText(`🍖 ${petName}에게 맛있는 뼈다귀 과자를 던져주었습니다! (보급 -10 🍓)`);
    addMemoryDiary(`🍖 집사가 둥지 방으로 뼈다귀 간식을 던져주자 ${petName}(이)가 껑충 뛰어 공중에서 낚아챘습니다.`);

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType('none');
      setInteractionText('');
    }, 2800);
  };

  // ⚽ Toss Toy Ball Handler (Rolls ball and makes dog run/slide to catch it!)
  const handleThrowBall = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setInteractionType('toy');
    
    // Random target position in the room
    const targetX = (Math.random() - 0.5) * 1.8;
    const targetZ = -0.5 - Math.random() * 1.2;
    setToyPosition([targetX, -0.4, targetZ]);
    setShowToy(true);
    setActiveMood('excited');

    setInteractionText(`⚽ 공을 굴렸습니다! ${petName}(이)가 쫓아가고 있어요!`);

    // Let the dog chase the ball, wait 1.8s, then catch
    setTimeout(() => {
      const nextTrust = Math.min(150, trust + 8);
      setTrust(nextTrust);
      localStorage.setItem('roompeace_trust', nextTrust.toString());

      // Deduct 15 berries
      const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
      const nextBerry = Math.max(0, currentBerry - 15);
      localStorage.setItem('roompeace_berry', nextBerry.toString());
      window.dispatchEvent(new Event('storage'));

      setInteractionText(`⚽ 앙! ${petName}(이)가 굴러가는 공을 붙잡았습니다! 친밀도 +8 (보급 -15 🍓)`);
      addMemoryDiary(`⚽ 방 안에서 집사가 굴려준 빨간 공을 쫓아 ${petName}(이)가 신나게 우다다 달려 공을 물어왔습니다.`);
    }, 1800);

    // Stop interaction after 3.5s
    setTimeout(() => {
      setShowToy(false);
      setIsInteracting(false);
      setInteractionType('none');
      setInteractionText('');
    }, 3600);
  };

  // 👋 Petting Handler
  const handlePatPet = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    setInteractionType('pet');
    setActiveMood('excited');

    setInteractionText(`👋 ${petName}의 이마와 복슬복슬한 등을 쓰다듬어 주었습니다.`);

    setTimeout(() => {
      setIsInteracting(false);
      setInteractionType('none');
      setInteractionText('');
    }, 2000);
  };

  // Wallpaper equip handler
  const handleEquipWallpaper = (key: string, requiredStreak: number, requiredBerry: number) => {
    if (streak < requiredStreak) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 잠겨있음: 연속 평화 돌봄 ${requiredStreak}일이 달성되어야 합니다!` }
      }));
      return;
    }
    if (teamBerry < requiredBerry) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 잠겨있음: 팀 누적 보급 Berry가 ${requiredBerry}개 이상이어야 합니다!` }
      }));
      return;
    }

    localStorage.setItem('roompeace_equipped_wallpaper', key);
    setWallpaper(key);
    window.dispatchEvent(new Event('storage'));
    
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🎨 벽지가 성공적으로 변경되었습니다!` }
    }));
  };

  // Rug equip handler
  const handleEquipRug = (key: string, requiredStreak: number, requiredBerry: number) => {
    if (streak < requiredStreak) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 잠겨있음: 연속 평화 돌봄 ${requiredStreak}일이 필요합니다!` }
      }));
      return;
    }
    if (teamBerry < requiredBerry) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 잠겨있음: 팀 누적 Berry ${requiredBerry}개가 필요합니다!` }
      }));
      return;
    }

    localStorage.setItem('roompeace_equipped_rug', key);
    setRugColor(key);
    window.dispatchEvent(new Event('storage'));
    
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🎨 바닥 러그 인테리어가 장착되었습니다!` }
    }));
  };

  // Dynamic Contextual Dialogue bubble text mapping
  let dialogueText = `${petName}: 메이트님들과 한 공간에서 지내서 안심이 돼요 🍃`;
  let moodStatusText = '평온함';
  let moodEmojiIndicator = '🙂';

  if (activeMood === 'sleep') {
    moodStatusText = '웅크려 숙면';
    moodEmojiIndicator = '😴';
    dialogueText = `${petName}: Zzz... 둥지 속에서 곤히 자고 있어요. 발소리를 낮춰주세요 💤`;
  } else if (activeMood === 'stressed') {
    moodStatusText = '구석에 찌그러짐';
    moodEmojiIndicator = '🥺';
    dialogueText = `${petName}: 최근엔 메이트들끼리 서먹해서 마음이 조금 추워요... 🥺💧`;
  } else if (activeMood === 'lonely') {
    moodStatusText = '쓸쓸함';
    moodEmojiIndicator = '🐾';
    dialogueText = `${petName}: 최근엔 조금 외로운 것 같아요… 메이트님들, 저 놀아주세요 🥺`;
  } else if (activeMood === 'excited') {
    moodStatusText = '우다다 우쭐!';
    moodEmojiIndicator = '🤩';
    dialogueText = `${petName}: 야호! 달리고 뛰고 굴러요! 집사님들과 노는 게 세상에서 제일 재미있어! 🚀`;
  } else if (streak >= 14) {
    moodStatusText = '자랑스러움';
    moodEmojiIndicator = '🔥';
    dialogueText = `${petName}: 우리 방의 ${streak}일 연속 평화 기록이 너무 자랑스러워요! 🔥`;
  } else if (isNight) {
    moodStatusText = '평온함';
    moodEmojiIndicator = '🌙';
    dialogueText = `${petName}: 🌙 조용한 밤이네요… 오늘 하루 모두 고생 많으셨어요!`;
  } else if (currentHour >= 6 && currentHour < 12) {
    moodStatusText = '활기참';
    moodEmojiIndicator = '☀️';
    dialogueText = `${petName}: ☀️ 오늘도 함께여서 좋아요! 활기찬 아침 시작해 봐요!`;
  } else {
    moodStatusText = '행복함';
    moodEmojiIndicator = '💖';
    dialogueText = `${petName}: 방 안 가득 메이트들의 아늑한 온기가 가득해요! 기분 좋아! 💖`;
  }

  // Dynamic light settings based on trust (cooperation atmosphere)
  const isAtmosphereStrained = trust < 50;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 74px)', overflow: 'hidden', background: '#f8fafc' }}>
      
      {/* 🚀 3D Room Centerpiece (66% Height) - Dynamic Cinematic Camera */}
      <div style={{
        height: '64%',
        background: isNight ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' : 'linear-gradient(180deg, #bae6fd 0%, #f0f9ff 100%)',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        transition: 'background 1.2s ease'
      }}>
        
        {/* Floating Top Control Badges */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px',
              borderRadius: '14px',
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              🏡 {houseName}
            </span>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              background: isAtmosphereStrained ? 'rgba(254, 226, 226, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px',
              borderRadius: '14px',
              color: isAtmosphereStrained ? 'var(--accent-red)' : 'var(--accent-blue)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              {moodEmojiIndicator} {moodStatusText}
            </span>
          </div>

          <button
            onClick={() => setShowDiaryModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '14px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          >
            📖 기억첩
          </button>
        </div>

        {/* Dynamic dialogue balloon bubble */}
        <div style={{
          top: '64px',
          left: '50%',
          transform: 'translateX(-50%)',
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          borderRadius: '18px',
          padding: '10px 16px',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          zIndex: 10,
          maxWidth: '85%',
          textAlign: 'center',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          {dialogueText}
        </div>

        {/* 3D Canvas element centered */}
        <div style={{ width: '100%', height: '100%', cursor: 'pointer' }} onClick={handlePatPet}>
          <Canvas 
            shadows
            camera={{ position: [0, 1.6, 6.5], fov: 45 }}
          >
            {/* Dynamic Camera controller */}
            <DynamicCamera 
              mood={activeMood} 
              isInteracting={isInteracting} 
              interactionType={interactionType} 
              controlsRef={controlsRef}
            />

            {/* Dynamic Room Lights */}
            <DynamicLights mood={activeMood} />

            {/* Float ambient sparkle particles */}
            <AmbientParticles />

            {/* Customizable 3D Room Corner Walls & Floor */}
            <CozyRoom 
              wallpaper={wallpaper} 
              rugColor={rugColor} 
              toyPosition={toyPosition} 
              showToy={showToy} 
              trust={trust}
            />

            {/* Main Pet model with tracking props */}
            <PetRenderer 
              mood={activeMood} 
              petType={petType === 'cat' ? 'cat' : 'dog'} 
              toyPosition={toyPosition} 
              showToy={showToy} 
              isInteracting={isInteracting}
              interactionType={interactionType}
            />

            <OrbitControls 
              ref={controlsRef}
              enableZoom={true} 
              minDistance={2.0}
              maxDistance={8}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.3} 
              minPolarAngle={0.2}
            />
          </Canvas>
        </div>

        {/* Interaction overlay alert text */}
        {interactionText && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.74rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            zIndex: 15,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {interactionText}
          </div>
        )}
      </div>

      {/* 📥 36% Height Cozy Interaction & Decorate Drawer */}
      <div style={{
        height: '36%',
        background: '#ffffff',
        borderTop: '1px solid var(--card-border)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.03)'
      }}>
        
        {/* Drawer Tabs Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', background: '#fafbfc' }}>
          <button 
            onClick={() => setActiveTab('play')}
            style={{
              flex: 1,
              background: activeTab === 'play' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'play' ? '2.5px solid var(--accent-blue)' : 'none',
              padding: '12px 0',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: activeTab === 'play' ? 'var(--accent-blue)' : 'var(--text-sub)',
              cursor: 'pointer'
            }}
          >
            🎮 펫이랑 놀아주기 (Play)
          </button>
          <button 
            onClick={() => setActiveTab('decorate')}
            style={{
              flex: 1,
              background: activeTab === 'decorate' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'decorate' ? '2.5px solid var(--accent-blue)' : 'none',
              padding: '12px 0',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: activeTab === 'decorate' ? 'var(--accent-blue)' : 'var(--text-sub)',
              cursor: 'pointer'
            }}
          >
            🎨 방 인테리어 꾸미기 (Decor)
          </button>
        </div>

        {/* Tab Content Display Area */}
        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
          
          {activeTab === 'play' ? (
            /* Tab 1: Play interactions & stats */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {petEmoji} {petName}과의 정서적 끈끈함 (친밀도)
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {trust} / 150
                  </span>
                </div>
                <div style={{ height: '7px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div 
                    style={{
                      width: `${Math.min(100, (trust / 150) * 100)}%`,
                      height: '100%',
                      background: trust >= 80 ? 'var(--accent-green)' : trust >= 50 ? 'var(--accent-gold)' : 'var(--accent-red)',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: 1.35 }}>
                  💡 메이트들이 칭찬 카드를 보내거나, 펫과 놀아줄수록 둥지 방에 햇살이 들어오고 {petName}가 무척 행복해합니다.
                </p>
              </div>

              {/* Interaction Buttons Row */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={handleThrowBall}
                  disabled={isInteracting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
                    border: '1.5px solid #ffe3e3',
                    borderRadius: '16px',
                    padding: '8px 4px',
                    cursor: isInteracting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 4px 8px rgba(248, 113, 113, 0.05)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>⚽</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c92a2a' }}>공 던지기</span>
                  <span style={{ fontSize: '0.55rem', color: '#ff8787', fontWeight: 700 }}>Berry -15</span>
                </button>

                <button
                  onClick={handleFeedSnack}
                  disabled={isInteracting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #fff9db 0%, #fff3bf 100%)',
                    border: '1.5px solid #fff3bf',
                    borderRadius: '16px',
                    padding: '8px 4px',
                    cursor: isInteracting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 4px 8px rgba(2fab, 152, 0, 0.05)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🍖</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e67700' }}>간식 주기</span>
                  <span style={{ fontSize: '0.55rem', color: '#ffd43b', fontWeight: 700 }}>Berry -10</span>
                </button>

                <button
                  onClick={handlePatPet}
                  disabled={isInteracting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #f8f0fc 0%, #f3d9fa 100%)',
                    border: '1.5px solid #f3d9fa',
                    borderRadius: '16px',
                    padding: '8px 4px',
                    cursor: isInteracting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.05)'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>👋</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#862e9c' }}>쓰다듬기</span>
                  <span style={{ fontSize: '0.55rem', color: '#da77f2', fontWeight: 700 }}>무료 교감</span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: Customization options */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-sub)', display: 'block', marginBottom: '8px' }}>
                  🎨 방 꾸미기 요소 (누적 평화 돌봄 및 베리로 해금)
                </span>
                
                {/* Scrollable list of options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '100px', overflowY: 'auto', paddingRight: '2px' }}>
                  
                  {/* Wallpaper select line */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, minWidth: '40px', color: 'var(--text-main)' }}>벽지:</span>
                    <button 
                      onClick={() => handleEquipWallpaper('cream', 0, 0)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: wallpaper === 'cream' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: wallpaper === 'cream' ? 'var(--accent-blue-light)' : '#ffffff',
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🍦 크림 (기본)
                    </button>
                    <button 
                      onClick={() => handleEquipWallpaper('blue', 14, 0)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: wallpaper === 'blue' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: wallpaper === 'blue' ? 'var(--accent-blue-light)' : '#ffffff',
                        opacity: streak >= 14 ? 1 : 0.5,
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      💧 블루 {streak >= 14 ? '🔓' : '🔒 (14일)'}
                    </button>
                    <button 
                      onClick={() => handleEquipWallpaper('lavender', 0, 5000)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: wallpaper === 'lavender' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: wallpaper === 'lavender' ? 'var(--accent-blue-light)' : '#ffffff',
                        opacity: teamBerry >= 5000 ? 1 : 0.5,
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🍇 퍼플 {teamBerry >= 5000 ? '🔓' : '🔒 (5천B)'}
                    </button>
                  </div>

                  {/* Rug Color select line */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, minWidth: '40px', color: 'var(--text-main)' }}>러그:</span>
                    <button 
                      onClick={() => handleEquipRug('yellow', 0, 0)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: rugColor === 'yellow' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: rugColor === 'yellow' ? 'var(--accent-blue-light)' : '#ffffff',
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      ☀️ 옐로우 (기본)
                    </button>
                    <button 
                      onClick={() => handleEquipRug('green', 14, 0)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: rugColor === 'green' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: rugColor === 'green' ? 'var(--accent-blue-light)' : '#ffffff',
                        opacity: streak >= 14 ? 1 : 0.5,
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🌲 그린 {streak >= 14 ? '🔓' : '🔒 (14일)'}
                    </button>
                    <button 
                      onClick={() => handleEquipRug('pink', 0, 5000)}
                      style={{
                        flex: 1, fontSize: '0.7rem', padding: '6px', borderRadius: '10px',
                        border: rugColor === 'pink' ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        background: rugColor === 'pink' ? 'var(--accent-blue-light)' : '#ffffff',
                        opacity: teamBerry >= 5000 ? 1 : 0.5,
                        fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🌸 핑크 {teamBerry >= 5000 ? '🔓' : '🔒 (5천B)'}
                    </button>
                  </div>

                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                <span>🔥 우리 집 공동 연속 기록: <b>{streak}일</b></span>
                <span>🍒 방 공동 누적 보급 Berry: <b>{teamBerry}개</b></span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Memory Diaries Modal */}
      {showDiaryModal && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.45)', zIndex: 100 }}>
          <div className="toss-modal-content animate-fade-in" style={{ padding: '24px', maxWidth: '360px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="toss-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                📖 {petName}의 소중한 기억첩
              </h2>
              <button
                onClick={() => setShowDiaryModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-sub)', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '0.76rem', color: 'var(--text-sub)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
              {petName}가 하우스에서 보낸 소중한 역사와 집사들의 배려 활동 기록을 일기처럼 모아둡니다.
            </p>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingRight: '4px' }}>
              {diaries.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '20px', fontSize: '0.8rem' }}>
                  아직 기록된 기억이 없습니다.
                </div>
              ) : (
                diaries.map(diary => (
                  <div key={diary.id} style={{ background: '#fdfcfb', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--accent-blue)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                      {diary.date}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.45 }}>
                      {diary.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              className="btn-cta"
              onClick={() => setShowDiaryModal(false)}
              style={{ width: '100%' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
