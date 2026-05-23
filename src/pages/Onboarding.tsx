import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUEST_TEMPLATES } from './questsData';

interface Archetype {
  id: string;
  icon: string;
  title: string;
  desc: string;
  badge: string;
  detail: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<number>(1);
  const [houseName, setHouseName] = useState('아늑한 펭귄가족 🏠');
  const [inviteCode, setInviteCode] = useState('');
  const [customPetName, setCustomPetName] = useState('루미');
  const [selectedPetType, setSelectedPetType] = useState<'dog' | 'cat' | 'rabbit'>('dog');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Selected quest IDs (must be exactly 6)
  const [selectedQuestIds, setSelectedQuestIds] = useState<string[]>([]);

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setInviteCode(roomParam);
      setStep(1); 
    }
  }, [searchParams]);

  const archetypes: Archetype[] = [
    { id: 'diligent', icon: "🧹", title: "꼼꼼한 수석 집사", badge: "수석 집사 🧹", desc: "루미의 쾌적한 둥지를 위해 가사 격파! 🧼", detail: "정해진 가사 퀘스트를 완벽히 격파하여 우리 방의 쾌적함과 평화를 수호하는 든든한 에이스입니다." },
    { id: 'free', icon: "🍕", title: "부드러운 정서 집사", badge: "정서 집사 🍕", desc: "메이트들의 멘탈 케어 & 힐링 요정! 💕", detail: "가끔은 퀘스트가 밀려도 메이트들의 컨디션을 존중하고 따뜻하게 소통해주는 분위기 메이커입니다." },
    { id: 'strategic', icon: "💡", title: "스마트한 관리 집사", badge: "관리 집사 💡", desc: "효율 폼 미쳤다! 합리적 역할 조율 📊", detail: "어떻게 역할을 분담해야 서로 덜 귀찮을지, 최적의 배려 루트와 스케줄을 설계하는 브레인입니다." },
    { id: 'delayed', icon: "⚡", title: "해결사 번개 집사", badge: "번개 집사 ⚡", desc: "막판 뒤집기 폭풍 스퍼트! 🏃‍♂️", detail: "평소에는 뒹굴거리다가도 메이트들이 먼지 때문에 지치기 직전, 번개 속도로 해치우는 실전 해결사입니다." }
  ];

  const handleStartNewRoom = () => {
    if (!houseName.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 우리방 모임의 이름을 정해달라고! 🏠" }
      }));
      return;
    }
    const randCode = 'RP-' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('roompeace_room_code', randCode);
    localStorage.setItem('roompeace_house_name', houseName.trim());
    setStep(3); // Go to Lumi selection/naming
  };

  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 메이트방의 초대 코드를 입력해줘!" }
      }));
      return;
    }
    localStorage.setItem('roompeace_room_code', inviteCode.trim());
    localStorage.setItem('roompeace_house_name', '초대받은 숲속 가옥 🏡');
    localStorage.setItem('roompeace_pet_id', 'dog');
    localStorage.setItem('roompeace_pet_type', 'dog');
    localStorage.setItem('roompeace_pet_name', '루미');
    localStorage.setItem('roompeace_pet_emoji', '🐶');
    
    // Joint roommates default to these 6 starter quests
    const defaultStarterQuests = QUEST_TEMPLATES.slice(0, 6).map(q => ({
      ...q,
      completed: false
    }));
    localStorage.setItem('roompeace_active_quests', JSON.stringify(defaultStarterQuests));
    
    setStep(4); // Go straight to choosing archetype
  };

  const handleChoosePet = () => {
    if (!customPetName.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: selectedPetType === 'dog' ? "❌ 우리 댕댕이 이름은 지어줘야지! 🐶" : selectedPetType === 'cat' ? "❌ 우리 야옹이 이름은 지어줘야지! 🐱" : "❌ 우리 토끼 이름은 지어줘야지! 🐰" }
      }));
      return;
    }
    localStorage.setItem(`roompeace_pet_name_${selectedPetType}`, customPetName.trim());
    localStorage.setItem('roompeace_pet_id', selectedPetType === 'rabbit' ? 'boni' : selectedPetType === 'cat' ? 'momo' : 'lumi');
    localStorage.setItem('roompeace_pet_type', selectedPetType);
    localStorage.setItem('roompeace_pet_name', customPetName.trim());
    localStorage.setItem('roompeace_pet_emoji', selectedPetType === 'dog' ? '🐶' : selectedPetType === 'cat' ? '🐱' : '🐰');
    
    setStep(5); // Go to Quest Selection step
  };

  const toggleQuestSelection = (id: string) => {
    if (selectedQuestIds.includes(id)) {
      setSelectedQuestIds(selectedQuestIds.filter(qid => qid !== id));
    } else {
      if (selectedQuestIds.length >= 6) {
        window.dispatchEvent(new CustomEvent('roompeace_toast', {
          detail: { message: "⚠️ 퀘스트는 딱 6개만 골라주세요! 📌" }
        }));
        return;
      }
      setSelectedQuestIds([...selectedQuestIds, id]);
    }
  };

  const handleSaveQuests = () => {
    if (selectedQuestIds.length !== 6) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 정확히 6개의 퀘스트를 선택해줘! (현재 " + selectedQuestIds.length + "개)" }
      }));
      return;
    }

    const initialQuests = QUEST_TEMPLATES.filter(q => selectedQuestIds.includes(q.id)).map(q => ({
      ...q,
      completed: false
    }));

    localStorage.setItem('roompeace_active_quests', JSON.stringify(initialQuests));
    setStep(4); // Go to Archetype Selection
  };

  const handleChooseArchetype = (id: string) => {
    setSelectedType(id);
    const chosen = archetypes.find(a => a.id === id);
    if (!chosen) return;

    // Set starter stats
    localStorage.setItem('roompeace_berry', '320');
    localStorage.setItem('roompeace_my_personality', chosen.badge);
    localStorage.setItem('roompeace_archetype_title', chosen.title);
    localStorage.setItem('roompeace_archetype_icon', chosen.icon);
    localStorage.setItem('roompeace_premium', 'false');
    localStorage.setItem('roompeace_trust', '100'); // Our Room Atmosphere score
    localStorage.setItem('roompeace_streak', '14');
    localStorage.setItem('roompeace_team_berry', '8420');
    localStorage.setItem('roompeace_my_status', '🙂 평온함');
    localStorage.setItem('roompeace_offense_count', '0');
    
    // Set starter room decorations (Empty initially)
    localStorage.setItem('roompeace_equipped_items', JSON.stringify([]));
    localStorage.setItem('roompeace_unlocked_pets', JSON.stringify(['dog', 'cat', 'rabbit']));
    localStorage.setItem('roompeace_equipped_wallpaper', 'cream');
    localStorage.setItem('roompeace_equipped_rug', 'yellow');
    
    // Initial memory diaries
    const starterPet = localStorage.getItem('roompeace_pet_name') || '루미';
    const starterPetEmoji = localStorage.getItem('roompeace_pet_emoji') || '🐶';
    const initDiaries = [
      { id: 1, text: `${starterPet}(이)가 우리 방(${localStorage.getItem('roompeace_house_name')})에 합류했습니다! 🎉`, date: '방 생성일' },
      { id: 2, text: `방의 첫 시작을 메이트들과 함께 약속했습니다. 오늘도 살아남아보자고 ${starterPetEmoji}`, date: '기본 기록' }
    ];
    localStorage.setItem('roompeace_diaries', JSON.stringify(initDiaries));
    localStorage.setItem('roompeace_inventory', JSON.stringify({}));

    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🎁 🐶 ${starterPet}(이)가 입주 완료했습니다! 웰컴 보급 Berry +100 적립!` }
      }));
    }, 800);

    navigate('/dashboard');
  };

  const queryRoom = searchParams.get('room');

  // Step 1: Landing & Group Naming
  if (step === 1) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '85vh', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem', animation: 'petIdle 2s infinite alternate' }}>
            🐶
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 10px 0', letterSpacing: '-1.5px' }}>
            RoomPeace
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5, margin: '0 0 16px 0' }}>
            "우리 방 평화를 굴려줄 귀여운 하우스 동반자"<br />
            <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>가사 잔소리 대신 따뜻한 교감으로</span> 뭉치는 라이프 시뮬레이터
          </p>
        </div>

        {queryRoom ? (
          <div className="toss-card" style={{ 
            background: 'linear-gradient(135deg, var(--accent-green-light) 0%, #ffffff 100%)',
            border: '1.5px solid var(--accent-green)',
            padding: '16px 20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: '4px' }}>🏠</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-green)', display: 'block', fontWeight: 800 }}>
              메이트들의 하우스 공동방 초대를 받았어요!
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
              방 코드 [<b>{queryRoom}</b>]의 공동 집사로 가입해보세요.
            </span>
          </div>
        ) : (
          <div className="toss-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              🏡 우리 방/집사 모임의 이름은?
            </h3>
            <input 
              type="text" 
              placeholder="예: 301호 에이스들 ⚡" 
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              style={{ fontSize: '0.95rem', padding: '12px' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px', width: '100%', margin: '0 auto' }}>
          {queryRoom ? (
            <button 
              className="btn-cta"
              onClick={handleJoinWithCode}
              style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
            >
              🤝 공동 메이트로 합류하기
            </button>
          ) : (
            <>
              <button 
                className="btn-cta"
                onClick={handleStartNewRoom}
                style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
              >
                🐣 새로운 룸 가방 개설하기 (새 집 개설)
              </button>
              <button 
                className="btn-cta btn-secondary"
                onClick={() => setStep(2)}
                style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
              >
                🔑 이미 생성된 방에 코드 합류
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Invite Code Join
  if (step === 2) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="mini-badge" style={{ marginBottom: '8px' }}>🔑 코드 입력</span>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
            메이트 초대 코드 입력
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
            메이트가 알려준 하우스 코드를 적고<br/>
            공동 입주를 진행해보세요.
          </p>
        </div>

        <div className="toss-card" style={{ maxWidth: '340px', width: '100%', margin: '0 auto 24px auto', boxSizing: 'border-box' }}>
          <input 
            type="text" 
            placeholder="예: RP-7749" 
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold', padding: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px', width: '100%', margin: '0 auto' }}>
          <button 
            className="btn-cta"
            onClick={handleJoinWithCode}
            disabled={!inviteCode.trim()}
            style={{ padding: '14px', borderRadius: '16px', opacity: inviteCode.trim() ? 1 : 0.6 }}
          >
            하우스 입장하기
          </button>
          <button 
            className="btn-cta btn-secondary"
            onClick={() => setStep(1)}
            style={{ padding: '14px', borderRadius: '16px' }}
          >
            이전으로
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Starter Pet Selection and Naming
  if (step === 3) {
    const isDog = selectedPetType === 'dog';
    return (
      <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="mini-badge success" style={{ marginBottom: '8px' }}>🐣 하우스 동반자 선택</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
            우리 방의 동반자 펫 선택
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
            우리 방에서 함께 자라날 첫 반려동물을 골라주세요.<br/>
            나만의 귀여운 애칭을 직접 지어줄 수도 있어요!
          </p>
        </div>

        {/* Custom Pet Name Input Card */}
        <div className="toss-card" style={{ marginBottom: '20px', padding: '16px' }}>
          <h3 style={{ fontSize: '0.86rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            {isDog ? '댕댕이' : selectedPetType === 'cat' ? '야옹이' : '토끼'} 이름 정하기 ✏️
          </h3>
          <input 
            type="text" 
            placeholder={isDog ? "루미" : selectedPetType === 'cat' ? "모모" : "보니"} 
            value={customPetName}
            onChange={(e) => setCustomPetName(e.target.value)}
            style={{ fontSize: '0.95rem', padding: '12px' }}
          />
        </div>

        {/* Companion Species Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* Dog Option */}
          <div 
            onClick={() => {
              setSelectedPetType('dog');
              if (customPetName === '모모' || customPetName === '보니') setCustomPetName('루미');
            }}
            className="toss-card"
            style={{ 
              margin: 0, 
              border: isDog ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: isDog ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '3rem', animation: isDog ? 'petIdle 2s infinite alternate' : 'none' }}>🐶</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>포메라니안 루미</h3>
                {isDog && <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>선택됨</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                메이트들이 퀘스트를 깰 때마다 우다다 꼬리를 흔드는 활발하고 애교 넘치는 댕댕이.
              </p>
            </div>
          </div>

          {/* Cat Option */}
          <div 
            onClick={() => {
              setSelectedPetType('cat');
              if (customPetName === '루미' || customPetName === '보니') setCustomPetName('모모');
            }}
            className="toss-card"
            style={{ 
              margin: 0, 
              border: selectedPetType === 'cat' ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: selectedPetType === 'cat' ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '3rem', animation: selectedPetType === 'cat' ? 'petIdle 2s infinite alternate' : 'none' }}>🐱</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>러시안 블루 모모</h3>
                {selectedPetType === 'cat' && <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>선택됨</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                얌전하고 도도하며 조용하게 집사들 곁에서 골골송을 들려주는 평온한 야옹이.
              </p>
            </div>
          </div>

          {/* Rabbit Option */}
          <div 
            onClick={() => {
              setSelectedPetType('rabbit');
              if (customPetName === '루미' || customPetName === '모모') setCustomPetName('보니');
            }}
            className="toss-card"
            style={{ 
              margin: 0, 
              border: selectedPetType === 'rabbit' ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: selectedPetType === 'rabbit' ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '3rem', animation: selectedPetType === 'rabbit' ? 'petIdle 2s infinite alternate' : 'none' }}>🐰</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>솜꼬리 토끼 보니</h3>
                {selectedPetType === 'rabbit' && <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>선택됨</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                가장 부드럽고 조용하게 집사들을 위로해 주는 섬세하고 귀여운 토끼 친구.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', maxWidth: '340px', width: '100%', margin: '0 auto' }}>
          <button 
            className="btn-cta btn-secondary" 
            onClick={() => setStep(1)}
            style={{ padding: '14px', borderRadius: '16px', flex: 1 }}
          >
            이전
          </button>
          <button 
            className="btn-cta" 
            onClick={handleChoosePet}
            style={{ padding: '14px', borderRadius: '16px', flex: 2 }}
          >
            선택 완료 ➔
          </button>
        </div>
      </div>
    );
  }

  // Step 5: Choose Exactly 6 Default Quests
  if (step === 5) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="mini-badge warning" style={{ marginBottom: '8px' }}>📌 우리방 6대 약속</span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
            우리방 6대 퀘스트 선택
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.82rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
            공동생활을 평화롭게 유지하기 위해 꼭 지킬<br/>
            <b>기본 퀘스트 6개</b>를 골라 방의 아이덴티티를 세워주세요.
          </p>
          <span style={{ 
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '0.78rem',
            background: selectedQuestIds.length === 6 ? 'var(--accent-green-light)' : 'var(--accent-blue-light)',
            color: selectedQuestIds.length === 6 ? 'var(--accent-green)' : 'var(--accent-blue)',
            padding: '4px 12px',
            borderRadius: '10px',
            fontWeight: 800
          }}>
            현재 선택: {selectedQuestIds.length} / 6개
          </span>
        </div>

        {/* Scrollable Quest Templates Selection Box */}
        <div style={{ 
          background: '#ffffff',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '16px',
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '24px'
        }}>
          {QUEST_TEMPLATES.map(q => {
            const isSelected = selectedQuestIds.includes(q.id);
            const diffColor = q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444';
            return (
              <div 
                key={q.id}
                onClick={() => toggleQuestSelection(q.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
                  background: isSelected ? 'var(--accent-blue-light)' : '#fdfcfb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '10px',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    readOnly
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{q.title}</strong>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      color: diffColor, 
                      background: q.difficulty === 'easy' ? '#d1fae5' : q.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', 
                      padding: '1px 6px', 
                      borderRadius: '6px', 
                      fontWeight: 800 
                    }}>
                      {q.difficulty === 'easy' ? '쉬움' : q.difficulty === 'medium' ? '보통' : '어려움'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.3 }}>
                    {q.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', maxWidth: '340px', width: '100%', margin: '0 auto' }}>
          <button 
            className="btn-cta btn-secondary" 
            onClick={() => setStep(3)}
            style={{ padding: '14px', borderRadius: '16px', flex: 1 }}
          >
            이전
          </button>
          <button 
            className="btn-cta" 
            onClick={handleSaveQuests}
            disabled={selectedQuestIds.length !== 6}
            style={{ padding: '14px', borderRadius: '16px', flex: 2, opacity: selectedQuestIds.length === 6 ? 1 : 0.6 }}
          >
            선택 완료 ({selectedQuestIds.length}/6) ➔
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Choose Relational Archetype
  return (
    <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="mini-badge warning" style={{ marginBottom: '8px' }}>🌱 집사 성향 진단</span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
          나의 돌봄 스타일 진단
        </h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
          하우스 [<b>{localStorage.getItem('roompeace_house_name') || '달빛 펭귄네'}</b>]에 오신 걸 환영해요!<br/>
          방 메이트들에게 공개될 나만의 집사 스타일을 골라주세요.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {archetypes.map(ach => (
          <div 
            key={ach.id}
            onClick={() => handleChooseArchetype(ach.id)}
            className="toss-card"
            style={{ 
              margin: 0, 
              cursor: 'pointer',
              border: selectedType === ach.id ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: selectedType === ach.id ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px 12px',
              borderRadius: '20px',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{ach.icon}</div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{ach.title}</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>{ach.desc}</p>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, fontWeight: 'bold' }}>
        💡 마음에 드는 집사 카드를 터치하면 방에 즉시 입주합니다!
      </p>
    </div>
  );
}
