import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PetRenderer from '../components/PetRenderer';
import CozyRoom from '../components/CozyRoom';
import { AmbientParticles, DynamicLights } from '../components/PetSceneShared';
import { decorItemsList, DecorItem, DecorCategory } from '../data/decorData';
import DecorRenderer from '../components/DecorRenderer';

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
  const [petId, setPetId] = useState('lumi');
  const [petName, setPetName] = useState('루미');
  const [petType, setPetType] = useState('dog');
  const [petEmoji, setPetEmoji] = useState('🐶');
  const [trust, setTrust] = useState(100);
  const [houseName, setHouseName] = useState('달빛 펭귄가족 🏠');

  // Customization choices
  const [wallpaper, setWallpaper] = useState('cream');
  const [rugColor, setRugColor] = useState('yellow');

  // Interactive states
  const [activeMood, setActiveMood] = useState<'idle' | 'happy' | 'excited' | 'sleep' | 'lonely' | 'stressed'>('idle');
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionType, setInteractionType] = useState<'pet' | 'feed' | 'toy' | 'none'>('none');
  const [interactionText, setInteractionText] = useState('');

  // --- Decor System States ---
  const [showDecorShop, setShowDecorShop] = useState(false);
  const [decorCategory, setDecorCategory] = useState<DecorCategory | 'all'>('all');
  const [ownedDecorItems, setOwnedDecorItems] = useState<string[]>([]);
  const [equippedDecorItems, setEquippedDecorItems] = useState<Record<string, string>>({});
  const [previewDecorItems, setPreviewDecorItems] = useState<Record<string, string>>({});
  
  // Toy Ball simulation states
  const [showToy, setShowToy] = useState(false);
  const [toyPosition, setToyPosition] = useState<[number, number, number]>([0, -0.4, 0]);

  // Derived base stats
  const streak = parseInt(localStorage.getItem('roompeace_streak') || '14');
  const teamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');

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
      setPetId(localStorage.getItem('roompeace_pet_id') || 'lumi');
      setPetName(localStorage.getItem('roompeace_pet_name') || '루미');
      setPetType(localStorage.getItem('roompeace_pet_type') || 'dog');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');
      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setHouseName(localStorage.getItem('roompeace_house_name') || '달빛 펭귄가족 🏠');
      setDiaries(JSON.parse(localStorage.getItem('roompeace_diaries') || '[]'));
      setOwnedDecorItems(JSON.parse(localStorage.getItem('roompeace_owned_decor') || '[]'));
      setEquippedDecorItems(JSON.parse(localStorage.getItem('roompeace_equipped_decor') || '{}'));

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

    const isCat = petType === 'cat' || petId === 'momo';
    const isRabbit = petType === 'rabbit' || petId === 'boni';
    const isShiba = petId === 'shiba-lumi';
    const isTurtle = petType === 'turtle' || petId === 'tori-turtle';
    setInteractionText(
      isTurtle ? `🥬 ${petName}에게 신선한 청경채를 건네주었습니다! (보급 -10 🍓)` :
      isRabbit ? `☘️ ${petName}에게 신선한 토끼풀을 건네주었습니다! (보급 -10 🍓)` :
      isCat ? `🐟 ${petName}에게 맛있는 연어 츄르를 짜주었습니다! (보급 -10 🍓)` : 
      `🍖 ${petName}에게 맛있는 뼈다귀 과자를 던져주었습니다! (보급 -10 🍓)`
    );
    addMemoryDiary(
      isTurtle ? `🥬 집사가 둥지 방에서 청경채를 내밀자 ${petName}(이)가 느릿느릿 다가와 한 입씩 정성껏 베어 먹습니다.` :
      isRabbit ? `☘️ 집사가 둥지 방에서 토끼풀을 내밀자 ${petName}(이)가 코를 씰룩이며 오물오물 귀엽게 먹습니다.` :
      isShiba ? `🍖 집사가 둥지 방으로 뼈다귀 간식을 던져주자 ${petName}(이)가 거만한 표정으로 천천히 다가와 물고 갑니다.` :
      isCat ? `🐟 집사가 둥지 방에서 연어 츄르 간식을 주자 ${petName}(이)가 냠냠 핥아먹으며 골골송을 부릅니다.` : 
      `🍖 집사가 둥지 방으로 뼈다귀 간식을 던져주자 ${petName}(이)가 껑충 뛰어 공중에서 낚아챘습니다.`
    );

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

      const isCat = petType === 'cat' || petId === 'momo';
      const isRabbit = petType === 'rabbit' || petId === 'boni';
      const isShiba = petId === 'shiba-lumi';
      const isTurtle = petType === 'turtle' || petId === 'tori-turtle';
      setInteractionText(`⚽ 앙! ${petName}(이)가 굴러가는 공을 붙잡았습니다! 친밀도 +8 (보급 -15 🍓)`);
      addMemoryDiary(
        isTurtle ? `⚽ 방 안에서 집사가 굴려준 빨간 공을 향해 ${petName}(이)가 천천히 다가가 묵직하게 머리로 툭 밀어냅니다.` :
        isRabbit ? `⚽ 방 안에서 집사가 굴려준 빨간 공을 향해 ${petName}(이)가 조심스레 다가가 코로 통통 건드립니다.` :
        isShiba ? `⚽ 방 안에서 집사가 굴려준 빨간 공을 보고 ${petName}(이)가 우다다 달려가 낚아채더니 자랑스럽게 물고 빙빙 돕니다.` :
        isCat ? `⚽ 방 안에서 집사가 굴려준 빨간 공을 향해 ${petName}(이)가 솜방망이를 휘두르며 신나게 낚아챘습니다.` :
        `⚽ 방 안에서 집사가 굴려준 빨간 공을 쫓아 ${petName}(이)가 신나게 우다다 달려 공을 물어왔습니다.`
      );
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

    const isCat = petType === 'cat' || petId === 'momo';
    const isRabbit = petType === 'rabbit' || petId === 'boni';
    const isShiba = petId === 'shiba-lumi';
    const isTurtle = petType === 'turtle' || petId === 'tori-turtle';
    setInteractionText(
      isTurtle ? `👋 ${petName}의 단단한 등껍질을 조심스럽게 쓰다듬어 주었습니다.` :
      isRabbit ? `👋 ${petName}의 부드러운 귀와 등을 살살 쓰다듬어 주었습니다.` :
      isShiba ? `👋 ${petName}의 볼살을 주욱 늘려 쓰다듬어 주었습니다.` :
      isCat ? `👋 ${petName}의 턱 밑과 귀 뒤를 살살 쓰다듬어 눈을 지그시 감게 했습니다.` :
      `👋 ${petName}의 이마와 복슬복슬한 등을 쓰다듬어 주었습니다.`
    );

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

  // --- Decor System Handlers ---
  const handlePreviewDecor = (item: DecorItem) => {
    setPreviewDecorItems(prev => ({
      ...prev,
      [item.category]: item.id
    }));
  };

  const handlePurchaseOrEquipDecor = (item: DecorItem) => {
    const isOwned = ownedDecorItems.includes(item.id);
    const isEquipped = equippedDecorItems[item.category] === item.id;

    if (isEquipped) {
      // Unequip
      const newEquipped = { ...equippedDecorItems };
      delete newEquipped[item.category];
      setEquippedDecorItems(newEquipped);
      setPreviewDecorItems(newEquipped);
      localStorage.setItem('roompeace_equipped_decor', JSON.stringify(newEquipped));
      return;
    }

    if (isOwned) {
      // Equip
      const newEquipped = { ...equippedDecorItems, [item.category]: item.id };
      setEquippedDecorItems(newEquipped);
      setPreviewDecorItems(newEquipped);
      localStorage.setItem('roompeace_equipped_decor', JSON.stringify(newEquipped));
      return;
    }

    // Purchase / Unlock logic
    if (item.price > 0) {
      const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
      if (currentBerry < item.price) {
        window.dispatchEvent(new CustomEvent('roompeace_toast', { detail: { message: `🔒 베리가 부족합니다! (${item.price} 🍓 필요)` } }));
        return;
      }
      localStorage.setItem('roompeace_berry', (currentBerry - item.price).toString());
      window.dispatchEvent(new Event('storage'));
    } else if (item.unlockCondition) {
      // Very basic conditional logic check (e.g., streak >= 14 if condition string mentions 14)
      if (item.unlockCondition.includes('14일') && streak < 14) {
        window.dispatchEvent(new CustomEvent('roompeace_toast', { detail: { message: `🔒 ${item.unlockCondition} 달성 필요!` } }));
        return;
      }
      if (item.unlockCondition.includes('7일') && streak < 7) {
        window.dispatchEvent(new CustomEvent('roompeace_toast', { detail: { message: `🔒 ${item.unlockCondition} 달성 필요!` } }));
        return;
      }
      if (item.unlockCondition.includes('10일') && streak < 10) {
        window.dispatchEvent(new CustomEvent('roompeace_toast', { detail: { message: `🔒 ${item.unlockCondition} 달성 필요!` } }));
        return;
      }
      // If peace card condition, mock pass for now unless strictly tracked
    }

    const newOwned = [...ownedDecorItems, item.id];
    setOwnedDecorItems(newOwned);
    localStorage.setItem('roompeace_owned_decor', JSON.stringify(newOwned));
    
    // Auto equip upon purchase
    const newEquipped = { ...equippedDecorItems, [item.category]: item.id };
    setEquippedDecorItems(newEquipped);
    setPreviewDecorItems(newEquipped);
    localStorage.setItem('roompeace_equipped_decor', JSON.stringify(newEquipped));

    window.dispatchEvent(new CustomEvent('roompeace_toast', { detail: { message: `🎉 [${item.name}] 획득 및 배치 완료!` } }));
  };

  const handleCloseDecorShop = () => {
    setShowDecorShop(false);
    // Revert previews back to actually equipped
    setPreviewDecorItems({ ...equippedDecorItems });
  };

  // Dynamic Contextual Dialogue bubble text mapping in casual Gen-Z Korean
  let dialogueText = '';
  let moodStatusText = '평온함';
  let moodEmojiIndicator = '🙂';

  const isCat = petType === 'cat' || petId === 'momo';
  const isRabbit = petType === 'rabbit' || petId === 'boni';
  const isShiba = petId === 'shiba-lumi';
  const isTurtle = petType === 'turtle' || petId === 'tori-turtle';

  // --- Emotional Decor Influence ---
  const hasSunsetLamp = previewDecorItems['lighting'] === 'sunset-lamp';
  const hasPlant = previewDecorItems['plant'] === 'plant-monstera';

  if (activeMood === 'sleep') {
    moodStatusText = isTurtle ? '등껍질 속에 쏙 들어가 명상 중' : isRabbit ? '조용히 눈을 감고 쉬는 중' : isShiba ? '대자로 뻗어 꿀잠 중' : '곤히 코자고 있는 중';
    moodEmojiIndicator = '😴';
    dialogueText = isTurtle
      ? `${petName}: Zzz... 평온함이... 제일 좋아... 💤`
      : isRabbit
      ? `${petName}: Zzz... 새근새근... (오늘 집 분위기 꽤 포근한데…) 💤`
      : isShiba
      ? `${petName}: Zzz... 퓨흐흥... 나 자니까 건드리지 마라... 💤`
      : isCat 
      ? `${petName}: Zzz... 새근새근... 건드리지 마라 냐옹 💤`
      : `${petName}: Zzz... 쉿! ${petName}는 곤히 꿈나라 여행 중 💤 발소리 사뿐사뿐 해줘!`;
  } else if (activeMood === 'stressed') {
    moodStatusText = isTurtle ? '껍질 속으로 몸을 숨김' : isRabbit ? '구석에 숨음' : isShiba ? '어이없다는 듯 쳐다봄' : isCat ? '눈치보는 중' : '냉전 상태 삐짐';
    moodEmojiIndicator = '😡';
    dialogueText = isTurtle
      ? `${petName}: 공기가 무거워... 조금 숨어 있을래... 🐢💦`
      : isRabbit
      ? `${petName}: (작은 소리로) 훌쩍... 집 안이 차가워요... 구석에 숨어 있을래요 🐰💦`
      : isShiba
      ? `${petName}: 하... 집구석 꼬라지 봐라. 내가 다 어이가 없네 🙄`
      : isCat
      ? `${petName}: 방 공기가 왠지 서늘한데... 다들 조용히 눈치 게임 하는 거임? 😿`
      : `${petName}: 요즘 집 분위기 살짝 축 처진 거 같지 않음...? 다들 피곤한가봄 🥺 ${petName} 서운해...`;
  } else if (activeMood === 'lonely') {
    moodStatusText = isTurtle ? '느릿하게 주위를 둘러보는 중' : isRabbit ? '가만히 앉아 있음' : isShiba ? '지루해 죽으려 함' : isCat ? '조용히 관찰 중' : '쓸쓸하고 심심함';
    moodEmojiIndicator = '🐾';
    dialogueText = isTurtle
      ? `${petName}: 조금 쓸쓸하네... 누군가 곁에 와줬으면 좋겠다... 🐢`
      : isRabbit
      ? `${petName}: 오늘은 조용해서 좋아... 그래도 메이트들이 한 번 쓰다듬어 주면 좋겠어요 🐰`
      : isShiba
      ? `${petName}: 아 심심해... 집사들아, 재밌는 거 없냐? 나 좀 놀아줘봐 🐕💨`
      : isCat
      ? `${petName}: 심심하다냥... 메이트들 가사 퀘스트하고 내 앞에 와서 재롱이라도 떨어봐라옹 🐾`
      : `${petName}: 오늘 우리방 온도 살짝 애매한데... 다들 바쁜가? 나랑 퀘스트 한 판 꼬우? 🐾`;
  } else if (activeMood === 'excited') {
    moodStatusText = isTurtle ? '기분 좋은 껍질 흔들기' : isRabbit ? '귀가 쫑긋!' : isShiba ? '갑작스런 우다다' : isCat ? '골골송 가동!' : '꼬리 헬리콥터!';
    moodEmojiIndicator = '🤩';
    dialogueText = isTurtle
      ? `${petName}: 마음이 붕 뜨는 것 같아... 너무 기분 좋아... ✨`
      : isRabbit
      ? `${petName}: 깡총깡총! 여기 있으니까 너무 안심돼요... 집사님 최고! ☘️✨`
      : isShiba
      ? `${petName}: 끄와아아앙!! 기분 째진다!! 우다다다다다다다!! 🚀🐕💨`
      : isCat
      ? `${petName}: 냐앙! 이거 너무 맛있다옹! 꼬리가 살랑살랑 기분 최고다냥! 🐟✨`
      : `${petName}: 우와악! 맛있는 거 주니까 꼬리 헬리콥터 가동! 🚀 집사들이랑 노는 게 세상에서 제일 신나!`;
  } else if (streak >= 14) {
    moodStatusText = isTurtle ? '깊은 안정감' : isRabbit ? '안정감 100%' : isShiba ? '꽤나 만족스러움' : '스트릭 폼 미쳤다';
    moodEmojiIndicator = '🔥';
    dialogueText = isTurtle
      ? `${petName}: ${streak}일의 평화... 이 따뜻함이 오래오래 갔으면 좋겠어 🐢💖`
      : isRabbit
      ? `${petName}: 다정하게 지내는 집사님들을 보니까 마음이 몽글몽글해요... 연속 ${streak}일 너무 따뜻해 🐰💖`
      : isShiba
      ? `${petName}: 오, 이 집구석 생각보다 제법 잘 굴러가는데? 은근 마음에 들어 🐕🔥`
      : isCat
      ? `${petName}: 벌써 연속 평화 ${streak}일 달성이라니 실화임? 집사들 꽤 친하게 지내네 냐옹 🔥`
      : `${petName}: 우리방 연속 평화 ${streak}일째 유지 중! 폼 미쳤다 🔥 이대로 쭉 가보자고!`;
  } else if (isNight) {
    moodStatusText = isTurtle ? '조용한 밤의 수호자' : isRabbit ? '귀를 접고 웅크림' : isShiba ? '어둠 속의 눈빛' : '밤 깊은 시각';
    moodEmojiIndicator = '🌙';
    dialogueText = isTurtle
      ? `${petName}: 🌙 어둠 속에서도... 내가 우리 집을 지켜볼게... 편히 자... 🐢`
      : isRabbit
      ? `${petName}: 🌙 달빛이 들어오네요... 다들 조심조심 다니는 모습이 예뻐요 🐰`
      : isShiba
      ? `${petName}: 🌙 밤이다... 다들 자냐? 나만 빼고 자는 거 아니지? 👀`
      : isCat
      ? `${petName}: 🌙 메이트들 밤에는 조용조용 걷자냥. 야행성인 내가 다 지켜보고 있다옹 🐱`
      : `${petName}: 🌙 밤 깊었는데 조심히 걷기 약속! 오늘도 메이트들 다들 살아남느라 수고했어 🐶`;
  } else if (currentHour >= 6 && currentHour < 12) {
    moodStatusText = isTurtle ? '느긋한 아침 인사' : isRabbit ? '코를 씰룩이는 아침' : isShiba ? '당당한 기상' : '활기찬 아침';
    moodEmojiIndicator = '☀️';
    dialogueText = isTurtle
      ? `${petName}: ☀️ 아침이 밝았네... 오늘도 서두르지 말고 천천히 가자... 🐢`
      : isRabbit
      ? `${petName}: ☀️ 따스한 아침 햇살... 기분 좋은 하루가 될 것 같아요 🐰`
      : isShiba
      ? `${petName}: ☀️ 아침이냐? 빨리 밥 줘, 배고파. 오늘 하루도 열심히 뫼셔라 🐕`
      : isCat
      ? `${petName}: ☀️ 하품 한 판 완료. 집사들 오늘 하루도 부지런히 살아봐라옹.`
      : `${petName}: ☀️ 좋은 아침! 기지개 쭉 켜고 오늘도 파이팅 해보자고!`;
  } else {
    moodStatusText = isTurtle ? '평화로운 등껍질' : isRabbit ? '평화로운 토끼' : isShiba ? '집안 꼴 관전 중' : isCat ? '훈훈한 골골송' : '오 오늘 좀 훈훈한데?';
    moodEmojiIndicator = '💖';
    dialogueText = hasSunsetLamp
      ? `${petName}: 무드등 켜니까 방이 노을처럼 예뻐졌어 ✨ 마음이 편안해져...`
      : hasPlant && Math.random() > 0.5
      ? `${petName}: 킁킁... 화분에서 좋은 자연 냄새가 나 🪴`
      : isTurtle
      ? `${petName}: 오늘은 집이 꽤 편안하네... 천천히 가도 괜찮아... 🐢✨`
      : isRabbit
      ? `${petName}: 메이트들이 사이좋게 지내는 소리가 참 듣기 좋아요... 🐰✨`
      : isShiba
      ? `${petName}: 오늘 집 상태 꽤 괜찮은데? 다들 조용히 잘 지내서 봐줄 만하네 🐕`
      : isCat
      ? `${petName}: 볕 잘 드는 데서 낮잠 자고 싶다 🐱💤 다들 사이 좋아 보여서 봐준다냥 🫶`
      : `${petName}: 오 오늘 좀 훈훈한데? 다들 배려력 폭발 중 ✨ 기분 개째져!`;
  }

  // Dynamic light settings based on trust (cooperation atmosphere)
  const isAtmosphereStrained = trust < 40;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 74px)', overflow: 'hidden', background: '#f8fafc' }}>
      
      {/* 🚀 3D Room Centerpiece (66% Height) - Dynamic Cinematic Camera */}
      <div style={{
        height: '64%',
        background: isNight 
          ? (isTurtle ? 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)' : 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)')
          : (isTurtle ? 'linear-gradient(180deg, #fef3c7 0%, #ffedd5 100%)' : 'linear-gradient(180deg, #bae6fd 0%, #f0f9ff 100%)'),
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setShowDecorShop(true);
                setPreviewDecorItems({ ...equippedDecorItems });
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: '14px',
                cursor: 'pointer',
                color: 'var(--accent-purple)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}
            >
              ✨ 꾸미기
            </button>
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

        {/* ==================================
          DECORATION SHOP MODAL (OVERLAY)
          ================================== */}
      {showDecorShop && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
          zIndex: 40,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800 }}>룸 꾸미기 ✨</h3>
            <button 
              onClick={handleCloseDecorShop}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-sub)' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', scrollbarWidth: 'none' }}>
            {['all', 'floor', 'lighting', 'plant', 'petFurniture', 'wall'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setDecorCategory(cat as any)}
                style={{
                  background: decorCategory === cat ? 'var(--text-main)' : '#f1f5f9',
                  color: decorCategory === cat ? '#fff' : 'var(--text-sub)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {cat === 'all' ? '전체' : cat === 'floor' ? '바닥' : cat === 'lighting' ? '조명' : cat === 'plant' ? '식물' : cat === 'petFurniture' ? '펫 가구' : '벽 꾸미기'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {decorItemsList.filter(item => decorCategory === 'all' || item.category === decorCategory).map(item => {
              const isOwned = ownedDecorItems.includes(item.id);
              const isEquipped = previewDecorItems[item.category] === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => handlePreviewDecor(item)}
                  style={{
                    background: isEquipped ? '#eff6ff' : '#ffffff',
                    border: isEquipped ? '2px solid var(--accent-blue)' : '2px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isEquipped ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '8px' }}>{item.emoji}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>{item.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textAlign: 'center', marginTop: '4px' }}>
                    {isOwned ? '보유중' : item.price > 0 ? `🍓 ${item.price}` : `🔒 ${item.unlockCondition}`}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchaseOrEquipDecor(item);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      background: isEquipped ? 'var(--text-main)' : isOwned ? 'var(--accent-blue)' : '#f1f5f9',
                      color: isEquipped || isOwned ? '#fff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isEquipped ? '해제' : isOwned ? '장착하기' : item.price > 0 ? '구매하기' : '조건 달성 시 획득'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            <DynamicLights mood={activeMood} equippedItems={previewDecorItems} />

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

            {/* Dynamic Modular Room Decorations */}
            <DecorRenderer equippedItems={previewDecorItems} />

            {/* Main Pet model with tracking props */}
            <PetRenderer 
              mood={activeMood} 
              petId={petId}
              petType={petType} 
              toyPosition={toyPosition} 
              showToy={showToy} 
              isInteracting={isInteracting}
              interactionType={interactionType}
              equippedItems={previewDecorItems}
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
