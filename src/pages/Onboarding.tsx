import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [houseName, setHouseName] = useState('아늑한 펭귄가족 🏠');
  const [inviteCode, setInviteCode] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat' | 'rabbit'>('dog');
  const [customPetName, setCustomPetName] = useState('루미');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setInviteCode(roomParam);
      setStep(1); 
    }
  }, [searchParams]);

  const archetypes: Archetype[] = [
    { id: 'diligent', icon: "🧹", title: "꼼꼼한 수석 집사", badge: "수석 집사 🧹", desc: "코코의 집안 청결과 위생 담당!", detail: "정해진 규칙과 가사 배려를 어김없이 완수하여 코코와 방 전체의 쾌적함을 든든하게 보살핍니다." },
    { id: 'free', icon: "🍕", title: "부드러운 정서 집사", badge: "정서 집사 🍕", desc: "코코의 힐링과 따뜻한 소통!", detail: "방안의 딱딱한 가사 규칙보다 구성원들의 피로도와 유연한 교감을 더 소중히 여기는 힐링 메이커입니다." },
    { id: 'strategic', icon: "💡", title: "스마트한 관리 집사", badge: "관리 집사 💡", desc: "효율적인 돌봄 일정 설계!", detail: "누가 언제 돌봄 배려를 수행해야 서로 스트레스를 덜 받고 코코의 건강을 챙길지 분석하여 합리적인 스케줄을 제안합니다." },
    { id: 'delayed', icon: "⚡", title: "해결사 번개 집사", badge: "번개 집사 ⚡", desc: "막판 스퍼트로 깔끔하게 해결!", detail: "평소에는 여유롭다가도, 돌봄 마감이나 먼지가 쌓이기 직전 초인적인 속도로 깔끔하게 배려를 마무리합니다." }
  ];

  const handleStartNewRoom = () => {
    if (!houseName.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 우리 집사 모임의 팀명을 적어주세요!" }
      }));
      return;
    }
    const randCode = 'RP-' + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem('roompeace_room_code', randCode);
    localStorage.setItem('roompeace_house_name', houseName.trim());
    setStep(3); // Go to Pet selection
  };



  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 공동 양육 코드를 입력해 주세요." }
      }));
      return;
    }
    localStorage.setItem('roompeace_room_code', inviteCode.trim());
    localStorage.setItem('roompeace_house_name', '초대받은 숲속 가옥 🏡');
    localStorage.setItem('roompeace_pet_id', 'dog');
    localStorage.setItem('roompeace_pet_type', 'dog');
    localStorage.setItem('roompeace_pet_name', '코코');
    localStorage.setItem('roompeace_pet_emoji', '🐶');
    setStep(4); // Go straight to choosing archetype
  };

  const handleChoosePet = () => {
    if (!customPetName.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "❌ 반려동물의 이름을 지어주세요!" }
      }));
      return;
    }
    localStorage.setItem('roompeace_pet_id', petType);
    localStorage.setItem('roompeace_pet_type', petType);
    localStorage.setItem('roompeace_pet_name', customPetName.trim());
    localStorage.setItem('roompeace_pet_emoji', petType === 'dog' ? '🐶' : petType === 'cat' ? '🐱' : '🐰');
    setStep(4); // Go to Archetype choice
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
    localStorage.setItem('roompeace_trust', '100');
    localStorage.setItem('roompeace_streak', '14');
    localStorage.setItem('roompeace_team_berry', '8420');
    localStorage.setItem('roompeace_my_status', '🙂 평온함');
    
    // Set starter room decorations (Empty initially)
    localStorage.setItem('roompeace_equipped_items', JSON.stringify([]));
    localStorage.setItem('roompeace_unlocked_pets', JSON.stringify(['dog']));
    
    // Initial memory diaries
    const starterPet = localStorage.getItem('roompeace_pet_name') || '루미';
    const petEmoji = localStorage.getItem('roompeace_pet_emoji') || '🐶';
    const initDiaries = [
      { id: 1, text: `${starterPet}(이)가 우리 방(${localStorage.getItem('roompeace_house_name')})에 처음 입양되었습니다! 🎉`, date: '방 생성일' },
      { id: 2, text: `집사들이 ${starterPet}와 함께한 연속 돌봄 14일을 축하해주었습니다. ✨`, date: '기본 기록' }
    ];
    localStorage.setItem('roompeace_diaries', JSON.stringify(initDiaries));
    localStorage.setItem('roompeace_inventory', JSON.stringify({}));

    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🎁 ${petEmoji} ${starterPet}(이)가 입주 완료했습니다! 웰컴 보급 Berry +100 적립!` }
      }));
    }, 800);

    navigate('/dashboard');
  };

  const queryRoom = searchParams.get('room');

  // Step 1: Landing, naming, join/create trigger
  if (step === 1) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '85vh', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem', animation: 'petIdle 2s infinite alternate' }}>
            🐧
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 10px 0', letterSpacing: '-1.5px' }}>
            RoomPeace
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5, margin: '0 0 16px 0' }}>
            "우리 방 펫을 행복하게 가꾸는 아늑한 하우스"<br />
            <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>규칙 강제 없이 정서로 교감하는</span> 동반자 생활 시뮬레이터
          </p>
        </div>

        {/* Dynamic Join Message if referred by Link */}
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
              메이트들의 하우스 양육 초대를 받았습니다!
            </strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
              방 코드 [<b>{queryRoom}</b>]의 공동 집사로 가입해 보세요.
            </span>
          </div>
        ) : (
          <div className="toss-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
              🏡 우리 방/집사 모임의 이름 정하기
            </h3>
            <input 
              type="text" 
              placeholder="예: Moonlight Penguins 🌙" 
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
              onClick={() => {
                localStorage.setItem('roompeace_room_code', queryRoom);
                localStorage.setItem('roompeace_house_name', '달빛 펭귄 하우스 🌙');
                setStep(4);
              }}
              style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
            >
              🤝 공동 집사로 합류하기
            </button>
          ) : (
            <>
              <button 
                className="btn-cta"
                onClick={handleStartNewRoom}
                style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
              >
                🐣 새로운 펫 데려오기 (새 집 개설)
              </button>
              <button 
                className="btn-cta btn-secondary"
                onClick={() => setStep(2)}
                style={{ padding: '16px', borderRadius: '18px', fontSize: '0.98rem', fontWeight: 800 }}
              >
                🔑 룸메이트 하우스에 합류하기
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
          <span className="mini-badge" style={{ marginBottom: '8px' }}>🔑 양육 합류</span>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
            공동 하우스 코드 입력
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
            메이트들이 이미 펫을 돌보고 있는<br/>
            하우스 코드를 입력해 주세요.
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

  // Step 3: Starter Pet Selection
  if (step === 3) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="mini-badge success" style={{ marginBottom: '8px' }}>🐣 펫 입양</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
            함께 공동 양육할 펫 설정
          </h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
            메이트와 한 집에서 공동으로 키우고 교감할<br/>
            반려동물의 종류와 개성 가득한 이름을 지어주세요.
          </p>
        </div>

        {/* Custom Pet Name Input Card */}
        <div className="toss-card" style={{ marginBottom: '16px', padding: '16px' }}>
          <h3 style={{ fontSize: '0.86rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            반려동물 이름 지어주기 ✏️
          </h3>
          <input 
            type="text" 
            placeholder="예: 루미, 코코, 초코" 
            value={customPetName}
            onChange={(e) => setCustomPetName(e.target.value)}
            style={{ fontSize: '0.95rem', padding: '12px' }}
          />
        </div>

        {/* Pet Species Selection List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div 
            onClick={() => setPetType('dog')}
            className="toss-card"
            style={{ 
              margin: 0, 
              cursor: 'pointer',
              border: petType === 'dog' ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: petType === 'dog' ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '3rem', animation: petType === 'dog' ? 'petIdle 2s infinite alternate' : 'none' }}>🐶</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>포메라니안 강아지</h3>
                <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>선택 가능</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                온화하고 호기심이 가득하며 집사들의 차분한 배려와 3D 공간 속 교감을 좋아해요.
              </p>
            </div>
          </div>

          <div 
            onClick={() => setPetType('cat')}
            className="toss-card"
            style={{ 
              margin: 0, 
              cursor: 'pointer',
              border: petType === 'cat' ? '2px solid var(--accent-blue)' : '1px solid var(--card-border)',
              background: petType === 'cat' ? 'var(--accent-blue-light)' : '#ffffff',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '3rem', animation: petType === 'cat' ? 'petIdle 2s infinite alternate' : 'none' }}>🐱</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>러시안 블루 고양이</h3>
                <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue)', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>선택 가능</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                도도하면서도 가끔 부리는 애교가 일품인 매력적인 고양이 친구.
              </p>
            </div>
          </div>

          <div 
            className="toss-card"
            style={{ 
              margin: 0, 
              opacity: 0.6,
              cursor: 'not-allowed',
              border: '1px dashed var(--card-border)',
              background: '#fafafa',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <span style={{ fontSize: '3rem' }}>🐰</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>솜꼬리 토끼</h3>
                <span style={{ fontSize: '0.62rem', background: '#8b95a1', color: '#ffffff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>준비 중</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                귀를 쫑긋거리며 방 안 가득 깡총깡총 뛰어다니는 극강의 귀여운 토끼 친구 (Coming Soon).
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

  // Step 4: Choose Relational Archetype
  return (
    <div className="animate-fade-in" style={{ padding: '20px 16px', minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="mini-badge warning" style={{ marginBottom: '8px' }}>🌱 집사 성향 진단</span>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.8px' }}>
          나의 집사 돌봄 성향
        </h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
          하우스 [<b>{localStorage.getItem('roompeace_house_name') || '달빛 펭귄네'}</b>]에 배정되었습니다!<br/>
          동료 집사들에게 공개될 나의 맞춤 돌봄 스타일을 선택해 주세요.
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
        💡 돌봄 스타일을 터치하면 즉시 하우스 펫 육성이 시작됩니다!
      </p>
    </div>
  );
}
