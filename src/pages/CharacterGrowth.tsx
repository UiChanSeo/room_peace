import { useState, useEffect } from 'react';

interface ShopItem {
  id: number;
  name: string;
  emoji: string;
  type: 'furniture' | 'consumable' | 'wallpaper';
  desc: string;
  price: number;
  effect: string;
}

interface PetCompanion {
  id: string;
  name: string;
  emoji: string;
  type: string;
  desc: string;
  unlockCondition: string;
  unlocked: boolean;
  petType: 'dog' | 'cat' | 'rabbit' | 'turtle';
  species: string;
  breed: string;
  isSpecial: boolean;
  rarity: string;
}

export default function CharacterGrowth() {
  const isDevTesting = true; // 🛠 TEMPORARY: Set to false in production

  const [isPremium, setIsPremium] = useState(false);
  
  // Profile settings
  const [myPersonality, setMyPersonality] = useState('수석 집사 🧹');
  const [myStatus, setMyStatus] = useState('🙂 평온함');
  const [hasBorder, setHasBorder] = useState(false);

  // Currency
  const [berry, setBerry] = useState(320);
  const [streak, setStreak] = useState(isDevTesting ? 40 : 14);
  const [teamBerry, setTeamBerry] = useState(8420);

  // Active Pet info
  const [petId, setPetId] = useState('lumi');
  const [petName, setPetName] = useState('루미');
  const [petEmoji, setPetEmoji] = useState('🐶');

  // Inventory & Equipped room items
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [equippedItems, setEquippedItems] = useState<number[]>([]);

  // Shop Items list
  const shopItems: ShopItem[] = [
    { id: 1, name: `${petName} 봉제인형 🧸`, emoji: '🧸', type: 'furniture', desc: `방 한 켠을 아기자기하게 채워주는 귀여운 ${petName} 모양 인형`, price: 250, effect: '방 바닥에 배치 가능' },
    { id: 8, name: '포근 미니 러그 🍃', emoji: '🍃', type: 'furniture', desc: '바닥을 아늑한 초록빛으로 채워주는 미니 양탄자', price: 150, effect: '방 바닥에 배치 가능' },
    { id: 9, name: '아늑한 숲속 스탠드 💡', emoji: '💡', type: 'furniture', desc: '방 벽면을 은은하게 비춰주는 감성 숲속 램프', price: 200, effect: '벽면에 조명 추가' },
    { id: 10, name: '포근한 개꿀잠 소파 🛋️', emoji: '🛋️', type: 'furniture', desc: `${petName}가 위에 엎드려서 개꿀잠 잘 수 있는 쿠션 소파`, price: 350, effect: '방 중앙에 배치 가능' },
    { id: 7, name: '숲속 오두막 벽지 🌲', emoji: '🌲', type: 'wallpaper', desc: '방 전체 벽면을 포근한 숲속 나무 질감으로 전환해줍니다.', price: 300, effect: '방 테마 배경 변경' },
    { id: 2, name: '화해용 커피 ☕', emoji: '☕', type: 'consumable', desc: '메이트끼리 말 한 마디 얹으면서 마시는 고소한 라떼 커피', price: 150, effect: '우리방 온도 즉시 +25 상승' },
    { id: 3, name: petId === 'lumi' || petId === 'shiba-lumi' ? '최고급 한우 개껌 🍗' : petId === 'momo' ? '연어 츄르 슬라이스 🐟' : petId === 'tori-turtle' ? '신선한 청경채 🥬' : '신선한 토끼풀 ☘️', emoji: petId === 'lumi' || petId === 'shiba-lumi' ? '🍗' : petId === 'momo' ? '🐟' : petId === 'tori-turtle' ? '🥬' : '☘️', type: 'consumable', desc: petId === 'lumi' || petId === 'shiba-lumi' ? `${petName}가 먹자마자 꼬리 프로펠러 돌리는 수제 한우 개껌` : petId === 'momo' ? `${petName}가 먹자마자 골골송을 부르는 고소한 연어 츄르` : petId === 'tori-turtle' ? `${petName}가 느릿느릿 오물오물 씹어먹는 신선한 청경채` : `${petName}가 코를 씰룩이며 오물오물 먹는 신선한 토끼풀`, price: 120, effect: '친밀도 즉시 +20 상승' }
  ];

  // Unlocked pets from local storage
  const unlockedPets = JSON.parse(localStorage.getItem('roompeace_unlocked_pets') || '["dog", "cat", "rabbit"]');
  if (isDevTesting && !unlockedPets.includes('tori-turtle')) {
    unlockedPets.push('tori-turtle');
  }

  // Pets list (Lumi, Momo, Boni are default, Shiba Lumi and Tori are special)
  const petsList: PetCompanion[] = [
    { id: 'lumi', name: '루미', emoji: '🐶', type: '마스코트 멍뭉', desc: '우다다 뛰놀고 꼬리를 프로펠러처럼 돌리는 포메라니안 강아지', unlockCondition: '기본 입주', unlocked: true, petType: 'dog', species: 'dog', breed: 'pomeranian', isSpecial: false, rarity: 'common' },
    { id: 'momo', name: '모모', emoji: '🐱', type: '러시안 블루', desc: '집사 발목에 머리 부비부비하는 도도하고 애교 넘치는 야옹이', unlockCondition: '기본 입주', unlocked: true, petType: 'cat', species: 'cat', breed: 'russian-blue', isSpecial: false, rarity: 'common' },
    { id: 'boni', name: '보니', emoji: '🐰', type: '솜꼬리 토끼', desc: '가장 부드럽고 조용하게 집사들을 위로해 주는 섬세하고 귀여운 토끼 친구', unlockCondition: '기본 입주', unlocked: true, petType: 'rabbit', species: 'rabbit', breed: 'cottontail', isSpecial: false, rarity: 'common' },
    { id: 'shiba-lumi', name: '시바 루미', emoji: '🐕', type: '시바견', desc: '집사들을 조용히 쳐다보다가 가끔 알 수 없는 우다다를 선보이는 묘한 매력의 강아지', unlockCondition: '연속 평화 14일 달성 시 개방', unlocked: unlockedPets.includes('shiba-lumi'), petType: 'dog', species: 'dog', breed: 'shiba', isSpecial: true, rarity: 'special' },
    { id: 'tori-turtle', name: '토리', emoji: '🐢', type: '육지거북', desc: '느리지만 묵묵하게 우리 방의 평화를 지켜주는 든든한 힐링 메이트', unlockCondition: '연속 평화 30일 달성 시 개방', unlocked: unlockedPets.includes('tori-turtle'), petType: 'turtle', species: 'turtle', breed: 'default', isSpecial: true, rarity: 'legendary' }
  ];

  useEffect(() => {
    const handleSync = () => {
      setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
      setMyPersonality(localStorage.getItem('roompeace_my_personality') || '수석 집사 🧹');
      setMyStatus(localStorage.getItem('roompeace_my_status') || '🙂 평온함');
      setHasBorder(localStorage.getItem('roompeace_has_border') === 'true');
      
      setBerry(parseInt(localStorage.getItem('roompeace_berry') || '320'));
      const storedStreak = parseInt(localStorage.getItem('roompeace_streak') || '14');
      setStreak(isDevTesting ? 40 : storedStreak);
      setTeamBerry(parseInt(localStorage.getItem('roompeace_team_berry') || '8420'));

      setPetId(localStorage.getItem('roompeace_pet_id') || 'lumi');
      setPetName(localStorage.getItem('roompeace_pet_name') || '루미');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');

      const inv = JSON.parse(localStorage.getItem('roompeace_inventory') || '{}');
      setInventory(inv);

      const equipped = JSON.parse(localStorage.getItem('roompeace_equipped_items') || '[]');
      setEquippedItems(equipped);
    };

    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, [streak, teamBerry]);

  // Update Status
  const handleStatusChange = (status: string) => {
    localStorage.setItem('roompeace_my_status', status);
    setMyStatus(status);
    window.dispatchEvent(new Event('storage'));
    
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🔔 내 상태가 [${status}]로 변경되어 메이트들이 볼 수 있습니다.` }
    }));
  };

  // Update Personality Archetype
  const handlePersonalityChange = (personality: string) => {
    localStorage.setItem('roompeace_my_personality', personality);
    setMyPersonality(personality);
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `💼 나의 집사 스타일이 [${personality}]로 장착되었습니다!` }
    }));
  };

  const handleUnlockSpecialPet = (petId: string) => {
    const isTori = petId === 'tori-turtle';
    const reqStreak = isTori ? 30 : 14;

    if (streak < reqStreak) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 연속 평화 ${reqStreak}일이 필요해요! 현재 ${streak}일 달성 중입니다.` }
      }));
      return;
    }
    
    // Unlock sequence
    const unlocked = JSON.parse(localStorage.getItem('roompeace_unlocked_pets') || '["dog", "cat", "rabbit"]');
    if (!unlocked.includes(petId)) {
      unlocked.push(petId);
      localStorage.setItem('roompeace_unlocked_pets', JSON.stringify(unlocked));
      
      // Toast series
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: isTori ? `✨ 조용하지만 특별한 친구가 우리 집을 지켜보기 시작했어요...` : `✨ 새로운 친구가 우리 집 분위기에 관심을 보이기 시작했어요…` }
      }));
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('roompeace_toast', {
          detail: { message: isTori ? `⭐ 전설의 펫 '토리' 등장! 이제 펫하우스에서 설정할 수 있습니다.` : `⭐ 스페셜 펫 '시바 루미' 등장! 이제 펫하우스에서 설정할 수 있습니다.` }
        }));
        window.dispatchEvent(new Event('storage'));
      }, 2500);
    }
  };

  // Toggle active represent companion pet
  const handleSelectActivePet = (pet: PetCompanion) => {
    if (!pet.unlocked) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🔒 준비 중인 펫입니다! 추후 업데이트를 기대해주세요 🐾` }
      }));
      return;
    }
    
    const activeName = localStorage.getItem(`roompeace_pet_name_${pet.id}`) || pet.name;
    
    localStorage.setItem('roompeace_pet_id', pet.id);
    localStorage.setItem('roompeace_pet_type', pet.petType);
    localStorage.setItem('roompeace_pet_name', activeName);
    localStorage.setItem('roompeace_pet_emoji', pet.emoji);
    
    setPetId(pet.id);
    setPetName(activeName);
    setPetEmoji(pet.emoji);

    // Write to diary
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `집사들이 대표 마스코트 펫을 [${pet.emoji} ${activeName}](으)로 설정했습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `✨ 대표 펫이 [${pet.emoji} ${activeName}]으(로) 등록되었습니다!` }
    }));
  };

  // Shop purchase item
  const handleBuyItem = (item: ShopItem) => {
    if (berry < item.price) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `❌ 베리가 부족해요! 가사 퀘스트를 더 해결해주세요 🍒` }
      }));
      return;
    }

    const nextBerry = berry - item.price;
    localStorage.setItem('roompeace_berry', nextBerry.toString());
    setBerry(nextBerry);

    const nextInv = { ...inventory };
    nextInv[item.id] = (nextInv[item.id] || 0) + 1;
    localStorage.setItem('roompeace_inventory', JSON.stringify(nextInv));
    setInventory(nextInv);

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🛒 [${item.name}] 구매 완료! 집사 보관함으로 전송되었습니다.` }
    }));
  };

  // Equip room furniture decoration
  const handleToggleEquip = (itemId: number) => {
    let nextEquipped = [...equippedItems];
    const isCurrentlyEquipped = nextEquipped.includes(itemId);

    if (isCurrentlyEquipped) {
      nextEquipped = nextEquipped.filter(id => id !== itemId);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🛋️ 가구를 배치 해제했습니다.` }
      }));
    } else {
      nextEquipped.push(itemId);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🛋️ 펫하우스에 가구가 장식되었습니다!` }
      }));
    }

    localStorage.setItem('roompeace_equipped_items', JSON.stringify(nextEquipped));
    setEquippedItems(nextEquipped);
    window.dispatchEvent(new Event('storage'));
  };

  // Feed/consume item
  const handleUseConsumable = (itemId: number) => {
    const qty = inventory[itemId] || 0;
    if (qty <= 0) return;

    const nextInv = { ...inventory };
    nextInv[itemId] = qty - 1;
    if (nextInv[itemId] <= 0) {
      delete nextInv[itemId];
    }
    localStorage.setItem('roompeace_inventory', JSON.stringify(nextInv));
    setInventory(nextInv);

    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    let increment = 20;
    if (itemId === 2) increment = 25; // Coffee
    
    const nextTrust = Math.min(150, currentTrust + increment);
    localStorage.setItem('roompeace_trust', nextTrust.toString());

    // Write to diary
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `집사 잭(나)이 [${item.name}] 보급을 사용하여 ${petName}와의 끈끈함을 더 높였습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `😋 ${petEmoji} ${petName}가 [${item.name}]을 먹고 너무 좋아해요! (기여도 +${increment})` }
    }));
  };

  // Toggle plus subscription
  const togglePlus = () => {
    const currentPlus = localStorage.getItem('roompeace_premium') === 'true';
    const nextPlus = !currentPlus;
    localStorage.setItem('roompeace_premium', nextPlus.toString());
    setIsPremium(nextPlus);

    // Apply border to profile if buying premium
    if (nextPlus) {
      localStorage.setItem('roompeace_has_border', 'true');
      setHasBorder(true);
    } else {
      localStorage.setItem('roompeace_has_border', 'false');
      setHasBorder(false);
    }

    window.dispatchEvent(new Event('storage'));

    const msg = nextPlus
      ? "⭐ RoomPeace Plus 패스 가입! 퀘스트 완료 베리 적립 2배 등 혜택 언락!"
      : "RoomPeace Plus 패스를 해지했습니다.";

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: msg }
    }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="mini-badge" style={{ marginBottom: '6px' }}>⚙️ 마이 페이지</span>
          <h1 className="section-title">내 집사 스펙 & 보관함</h1>
        </div>
        <div className="stat-pill points" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
          🍒 {berry} 베리
        </div>
      </header>

      {/* 👱 PROFILE AND RELATIONAL SHARING */}
      <div className="toss-card" style={{ border: '1.5px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ 
            fontSize: '2.5rem', 
            background: '#fdfcfb', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: hasBorder ? '4px double var(--accent-blue)' : '1px solid var(--card-border)',
            boxShadow: hasBorder ? '0 0 12px rgba(74, 108, 247, 0.3)' : 'none'
          }}>
            👱
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800 }}>잭 (Jack - 나)</h3>
            <span className="mini-badge" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', fontWeight: 800 }}>
              {myPersonality}
            </span>
          </div>
        </div>

        {/* Change personality */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            나의 집사 성향 스위칭
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['수석 집사 🧹', '정서 집사 🍕', '관리 집사 💡', '번개 집사 ⚡'].map(p => (
              <button 
                key={p}
                onClick={() => handlePersonalityChange(p)}
                style={{ 
                  background: myPersonality === p ? 'var(--accent-blue-light)' : '#fdfcfb',
                  border: myPersonality === p ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                  color: myPersonality === p ? 'var(--accent-blue)' : 'var(--text-main)',
                  padding: '8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Change Status */}
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            현재 내 기분/상황 공유 (배려 요청)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
            {['🙂 평온함', '📚 시험기간', '😴 피곤함', '🌙 야행성'].map(st => (
              <button 
                key={st}
                onClick={() => handleStatusChange(st)}
                style={{ 
                  background: myStatus === st ? 'var(--accent-blue-light)' : '#fdfcfb',
                  border: myStatus === st ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)',
                  color: myStatus === st ? 'var(--accent-blue)' : 'var(--text-main)',
                  padding: '8px 2px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🐧 PET COMPANION ENCYCLOPEDIA */}
      <div className="toss-card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
          🐶 하우스 동반자 도감
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          우리방 퀘스트를 함께 돌보아줄 반려동물 도감입니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 기본 펫 Section */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-sub)' }}>기본 펫</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {petsList.filter(p => !p.isSpecial).map(pet => {
                const isCurrent = petId === pet.id;
                return (
                  <div 
                    key={pet.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '12px 14px', 
                      borderRadius: '16px',
                      background: pet.unlocked ? (isCurrent ? 'var(--accent-blue-light)' : '#fdfcfb') : '#f8f9fa',
                      border: pet.unlocked ? (isCurrent ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)') : '1px dashed #ced4da',
                      opacity: pet.unlocked ? 1 : 0.65
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>{pet.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{pet.name}</strong>
                        <span style={{ fontSize: '0.62rem', background: '#e5e8eb', color: 'var(--text-sub)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>{pet.type}</span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35, fontWeight: 500 }}>
                        {pet.unlocked ? pet.desc : `🔒 ${pet.unlockCondition}`}
                      </p>
                    </div>
                    {pet.unlocked ? (
                      isCurrent ? (
                        <span style={{ fontSize: '0.72rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                          활동 중
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSelectActivePet(pet)}
                          style={{ background: '#ffffff', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          설정
                        </button>
                      )
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>준비 중</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 스페셜 펫 Section */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              스페셜 펫 ⭐
              {isDevTesting && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#ef4444', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>🛠 테스트 모드 활성화</span>}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {petsList.filter(p => p.isSpecial).map(pet => {
                const isCurrent = petId === pet.id;
                const isLegendary = pet.rarity === 'legendary';
                const reqStreak = pet.id === 'tori-turtle' ? 30 : 14;
                const reqMet = streak >= reqStreak;

                return (
                  <div 
                    key={pet.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '12px 14px', 
                      borderRadius: '16px',
                      background: pet.unlocked ? (isCurrent ? 'var(--accent-blue-light)' : '#ffffff') : '#f4f5f7',
                      border: pet.unlocked ? (isCurrent ? '2px solid var(--accent-blue)' : isLegendary ? '1.5px solid #a855f7' : '1px solid #ffd700') : '1px dashed #ced4da',
                      boxShadow: pet.unlocked && !isCurrent ? (isLegendary ? '0 4px 12px rgba(168, 85, 247, 0.15)' : '0 4px 12px rgba(255, 215, 0, 0.15)') : 'none',
                      opacity: pet.unlocked ? 1 : 0.8
                    }}
                  >
                    <span style={{ fontSize: '2.5rem', filter: pet.unlocked ? 'none' : 'grayscale(100%)' }}>{pet.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.88rem', color: pet.unlocked ? 'var(--text-main)' : 'var(--text-sub)' }}>
                          {pet.unlocked ? pet.name : `🔒 ${pet.name}`}
                        </strong>
                        <span style={{ fontSize: '0.62rem', background: pet.unlocked ? (isLegendary ? '#f3e8ff' : '#fff8e1') : '#e5e8eb', color: pet.unlocked ? (isLegendary ? '#9333ea' : '#b8860b') : 'var(--text-sub)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>{pet.type}</span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-sub)', lineHeight: 1.35, fontWeight: 500 }}>
                        {pet.unlocked ? pet.desc : `${pet.unlockCondition}`}
                      </p>
                    </div>
                    {pet.unlocked ? (
                      isCurrent ? (
                        <span style={{ fontSize: '0.72rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                          활동 중
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSelectActivePet(pet)}
                          style={{ background: '#ffffff', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          설정
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => handleUnlockSpecialPet(pet.id)}
                        style={{ background: reqMet ? 'var(--accent-blue)' : '#e5e8eb', color: reqMet ? '#ffffff' : 'var(--text-sub)', border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold', cursor: reqMet ? 'pointer' : 'not-allowed' }}
                      >
                        {reqMet ? '개방하기' : '미달성'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 🎒 INTERACTIVE ROOM DECORATOR (MY INVENTORY) */}
      <div className="toss-card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
          🎒 나의 집사 인벤토리
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          내가 보유하고 있는 가구 및 보급 소모품 목록이에요.
        </p>

        {Object.keys(inventory).length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '24px 0', fontSize: '0.8rem', fontWeight: 600 }}>
            보유 중인 아이템이 없습니다. 아래 상점에서 데코를 구매해보세요! 🧸
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(inventory).map(([idStr, qty]) => {
              const itemId = parseInt(idStr);
              const item = shopItems.find(i => i.id === itemId);
              if (!item) return null;
              
              const isEquipped = equippedItems.includes(itemId);
              
              return (
                <div 
                  key={itemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: '#fdfcfb',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block' }}>
                        {item.name} <span style={{ color: 'var(--accent-blue)' }}>x{qty}</span>
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', fontWeight: 500 }}>{item.effect}</span>
                    </div>
                  </div>

                  <div>
                    {item.type === 'consumable' ? (
                      <button 
                        onClick={() => handleUseConsumable(itemId)}
                        style={{ background: 'var(--accent-blue)', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {`${petName}에게 주기 ${item?.emoji || '🍖'}`}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggleEquip(itemId)}
                        style={{ 
                          background: isEquipped ? '#f4f3f0' : 'var(--accent-blue-light)', 
                          color: isEquipped ? 'var(--text-sub)' : 'var(--accent-blue)', 
                          border: isEquipped ? '1px solid var(--card-border)' : '1px solid #dbe5ff', 
                          padding: '6px 12px', 
                          borderRadius: '10px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          cursor: 'pointer' 
                        }}
                      >
                        {isEquipped ? '배치 해제' : '배치하기'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🛒 CARING SHOP */}
      <div className="toss-card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
          🛒 펫하우스 보급 상점
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          모은 베리를 사용해 {petName}의 데코 아이템이나 보급 간식을 질러보세요!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shopItems.map(item => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid var(--card-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                <div style={{ paddingRight: '10px' }}>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-sub)', display: 'block', lineHeight: 1.3, fontWeight: 500 }}>{item.desc}</span>
                </div>
              </div>

              <button 
                className="stat-pill points"
                onClick={() => handleBuyItem(item)}
                style={{ 
                  cursor: 'pointer', 
                  border: 'none', 
                  fontSize: '0.75rem', 
                  padding: '8px 12px',
                  background: berry >= item.price ? 'var(--accent-blue-light)' : '#f3f4f6',
                  color: berry >= item.price ? 'var(--accent-blue)' : '#9ca3af'
                }}
              >
                🍒 {item.price} 베리
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ RoomPeace Plus subscription */}
      <div className="toss-card" style={{ 
        background: 'linear-gradient(135deg, #fef9c3 0%, #fff9db 100%)', 
        border: '1.5px solid #facc15',
        borderRadius: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <div>
            <span className="mini-badge warning" style={{ background: '#fef08a', color: '#a16207', marginBottom: '4px' }}>
              Premium Membership
            </span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#713f12' }}>
              RoomPeace Plus ⭐
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a16207', fontWeight: 800 }}>월 3,900원</span>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#713f12', lineHeight: 1.5, fontWeight: 500 }}>
          - 가사 퀘스트 완료 시 베리 2배 획득 🍒<br />
          - 골드 더블라인 프로필 테두리 장착 🏆<br />
          - 프리미엄 감성 테마 벽지 및 룸 가구 5종 증정
        </p>

        <div style={{ 
          background: '#ffffff', 
          border: '1px solid #fef08a', 
          borderRadius: '12px', 
          padding: '10px 12px', 
          fontSize: '0.7rem', 
          color: '#854d0e', 
          marginBottom: '16px',
          lineHeight: 1.4,
          fontWeight: 600
        }}>
          ⚠️ <b>안심 보증</b>: RoomPeace Plus는 동거 구성원들의 기분 교감과 예쁜 방 꾸미기를 즐기기 위한 정서 힐링 구독 패키지입니다. <b>가족이나 메이트 간의 위생 감시, 실시간 동선 추적, 혹은 강제적인 벌점 부과 기능은 절대 포함하지 않습니다.</b>
        </div>

        <button 
          className="btn-cta" 
          onClick={togglePlus}
          style={{ 
            background: '#eab308', 
            color: '#ffffff', 
            border: 'none', 
            fontSize: '0.85rem',
            fontWeight: 800
          }}
        >
          {isPremium ? "Plus 해지하기" : "Plus 구독하기"}
        </button>
      </div>
    </div>
  );
}
