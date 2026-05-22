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
  petType: 'dog' | 'cat';
}

export default function CharacterGrowth() {
  const [isPremium, setIsPremium] = useState(false);
  
  // Profile settings
  const [myPersonality, setMyPersonality] = useState('수석 집사 🧹');
  const [myStatus, setMyStatus] = useState('🙂 평온함');
  const [hasBorder, setHasBorder] = useState(false);

  // Currency
  const [berry, setBerry] = useState(320);
  const [streak, setStreak] = useState(14);
  const [teamBerry, setTeamBerry] = useState(8420);

  // Active Pet info
  const [petId, setPetId] = useState('coco');
  const [petName, setPetName] = useState('코코');
  const [petEmoji, setPetEmoji] = useState('🐧');

  // Inventory & Equipped room items
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [equippedItems, setEquippedItems] = useState<number[]>([]);

  // Shop Items list
  const shopItems: ShopItem[] = [
    { id: 1, name: '코코 인형 🧸', emoji: '🧸', type: 'furniture', desc: '방 한 켠을 아기자기하게 채워주는 코코 봉제 인형', price: 250, effect: '방 바닥에 배치 가능' },
    { id: 8, name: '포근 미니 러그 🍃', emoji: '🍃', type: 'furniture', desc: '바닥을 아늑한 초록빛으로 채워주는 미니 양탄자', price: 150, effect: '방 바닥에 배치 가능' },
    { id: 9, name: '아늑한 오션 램프 💡', emoji: '💡', type: 'furniture', desc: '벽면을 부드러운 오션 블루 조명으로 꾸미는 램프', price: 200, effect: '벽면에 떠서 부유함' },
    { id: 10, name: '포근한 쿠션 소파 🛋️', emoji: '🛋️', type: 'furniture', desc: '코코와 친구들이 포근하게 쉴 수 있는 가죽 소파', price: 350, effect: '방 중앙에 배치 가능' },
    { id: 7, name: '바다마을 벽지 🌊', emoji: '🌊', type: 'wallpaper', desc: '방 배경을 청량한 바닷빛 파란 테마로 전환하는 벽지', price: 300, effect: '방 테마 배경 변경' },
    { id: 2, name: '화해용 커피 ☕', emoji: '☕', type: 'consumable', desc: '동료 집사와 마찰이 있을 때 나누는 고소한 라떼 커피', price: 150, effect: '친밀도 즉시 +25 회복' },
    { id: 3, name: '코코 특급 연어 🐟', emoji: '🐟', type: 'consumable', desc: '펭귄 코코가 가장 좋아하는 신선한 연어 조각', price: 120, effect: '친밀도 즉시 +20 상승' }
  ];

  // Pets list
  const petsList: PetCompanion[] = [
    { id: 'coco', name: '코코', emoji: '🐶', type: '얌전형', desc: '온화하고 수줍음이 많으며 조용하게 보살피는 걸 선호함', unlockCondition: '기본 지급', unlocked: true, petType: 'dog' },
    { id: 'lumi', name: '루미', emoji: '🐶', type: '활발형', desc: '호기심이 풍부하고 노는 걸 매우 좋아하는 강아지', unlockCondition: '기본 지급', unlocked: true, petType: 'dog' },
    { id: 'momo', name: '모모', emoji: '🐈', type: '애교형', desc: '집사 곁에 머물며 골골송 부르기를 사랑하는 아기 고양이', unlockCondition: '기본 지급', unlocked: true, petType: 'cat' },
    { id: 'tuto', name: '투토', emoji: '🦦', type: '호기심형', desc: '수영을 즐기며 작은 조개를 수집해 선물하는 영리한 수달', unlockCondition: '기본 지급', unlocked: true, petType: 'cat' },
    { id: 'boni', name: '보니', emoji: '🐰', type: '순둥형', desc: '포근한 귀를 흔들며 방안의 위생과 향기를 정화하는 흰 토끼', unlockCondition: '기본 지급', unlocked: true, petType: 'cat' }
  ];

  useEffect(() => {
    const handleSync = () => {
      setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
      setMyPersonality(localStorage.getItem('roompeace_my_personality') || '수석 집사 🧹');
      setMyStatus(localStorage.getItem('roompeace_my_status') || '🙂 평온함');
      setHasBorder(localStorage.getItem('roompeace_has_border') === 'true');
      
      setBerry(parseInt(localStorage.getItem('roompeace_berry') || '320'));
      setStreak(parseInt(localStorage.getItem('roompeace_streak') || '14'));
      setTeamBerry(parseInt(localStorage.getItem('roompeace_team_berry') || '8420'));

      setPetId(localStorage.getItem('roompeace_pet_id') || 'coco');
      setPetName(localStorage.getItem('roompeace_pet_name') || '코코');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐧');

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
      detail: { message: `🔔 내 공유 상태가 [${status}]로 변경되어 룸메이트들이 확인 가능합니다.` }
    }));
  };

  // Update Personality Archetype
  const handlePersonalityChange = (personality: string) => {
    localStorage.setItem('roompeace_my_personality', personality);
    setMyPersonality(personality);
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `💼 나의 집사 역할 성향이 [${personality}]로 전환되었습니다.` }
    }));
  };

  // Toggle active represent companion pet
  const handleSelectActivePet = (pet: PetCompanion) => {
    if (!pet.unlocked) return;
    
    localStorage.setItem('roompeace_pet_id', pet.id);
    localStorage.setItem('roompeace_pet_type', pet.petType);
    localStorage.setItem('roompeace_pet_name', pet.name);
    localStorage.setItem('roompeace_pet_emoji', pet.emoji);
    
    setPetId(pet.id);
    setPetName(pet.name);
    setPetEmoji(pet.emoji);

    // Write to diary
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `집사들이 방의 동반 반려동물을 [${pet.emoji} ${pet.name}](으)로 새롭게 매칭했습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `✨ 대표 펫이 [${pet.emoji} ${pet.name}]으(로) 교체되었습니다! 대시보드 룸을 확인해보세요.` }
    }));
  };

  // Shop purchase item
  const handleBuyItem = (item: ShopItem) => {
    if (berry < item.price) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `❌ 베리가 부족합니다! 돌봄 행동(가사)을 완료하여 베리를 채워주세요.` }
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
      detail: { message: `🛒 [${item.name}] 구매 완료! 집사 인벤토리에 보관되었습니다.` }
    }));
  };

  // Equip room furniture decoration
  const handleToggleEquip = (itemId: number) => {
    let nextEquipped = [...equippedItems];
    const isCurrentlyEquipped = nextEquipped.includes(itemId);

    if (isCurrentlyEquipped) {
      nextEquipped = nextEquipped.filter(id => id !== itemId);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🛋️ 아이템 배치를 해제했습니다.` }
      }));
    } else {
      nextEquipped.push(itemId);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🛋️ 방에 아이템을 장식했습니다! 홈 화면에서 확인해 보세요.` }
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
      text: `집사 잭(나)이 ${petName}에게 간식 [${item.name}]을 먹여 친밀도가 상승했습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `😋 ${petEmoji} ${petName}가 [${item.name}]을 맛있게 먹고 친해졌습니다! (친밀도 +${increment})` }
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
      ? "⭐ RoomPeace Plus 가입을 축하합니다! 보급 혜택 2배 및 프리미엄 테마 장식 지원!"
      : "RoomPeace Plus를 해지했습니다.";

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: msg }
    }));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="mini-badge" style={{ marginBottom: '6px' }}>⚙️ 집사 설정 및 보급고</span>
          <h1 className="section-title">나의 집사 기록</h1>
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
            나의 집사 돌봄 성향 스위칭
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
            내 배려 공유 상태 (시험/컨디션)
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
          🐧 하우스 동반자 도감
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          방 메이트들과 평화 스트릭을 가꾸거나 보급고 베리를 모아 여우, 수달, 토끼 펫을 해금해 마이룸의 주인공으로 설정하세요.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {petsList.map(pet => {
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
                    {pet.unlocked ? pet.desc : `🔒 해금 조건: ${pet.unlockCondition}`}
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
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 'bold' }}>🔒 잠김</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎒 INTERACTIVE ROOM DECORATOR (MY INVENTORY) */}
      <div className="toss-card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
          🎒 나의 집사 인벤토리
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          내가 소장하고 있는 방 인테리어 가구와 소모품 목록입니다.
        </p>

        {Object.keys(inventory).length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '24px 0', fontSize: '0.8rem', fontWeight: 600 }}>
            보관함에 보유 중인 아이템이 없습니다. 아래 상점에서 데코를 구매해 보세요!
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
                        {petName}에게 주기
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
                        {isEquipped ? '배치 해제' : '마이룸 배치'}
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
          🛒 펫 보급 상점
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          수집한 베리를 활용해 {petName}의 정서 치료 음식이나 예쁜 방 장식을 마련해 주세요.
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

      {/* ⭐ RoomPeace Plus subscription without surveillance */}
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
          - 가사 돌봄 약속 완료 시 베리 적립 2배 혜택 🍒<br />
          - 스페셜 골드 프로필 테두리 보증 🏆<br />
          - 프리미엄 3D 방 테마 및 잠금 해제 가구 5종 지급
        </p>

        {/* Anti-surveillance guarantee warnings */}
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
          {isPremium ? "가입 해지하기" : "Plus 혜택 가입하기"}
        </button>
      </div>
    </div>
  );
}
