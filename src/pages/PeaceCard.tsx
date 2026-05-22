import { useState, useEffect } from 'react';

interface Msg {
  id: number;
  from: string;
  text: string;
  time: string;
  colorAccent: string;
  bgAccent: string;
}

export default function PeaceCard() {
  const [selectedRecipient, setSelectedRecipient] = useState('Jack');
  
  // Active Pet info
  const [petName, setPetName] = useState('코코');
  const [petEmoji, setPetEmoji] = useState('🐧');

  useEffect(() => {
    const handleSync = () => {
      setPetName(localStorage.getItem('roompeace_pet_name') || '코코');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐧');
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const [templates] = useState([
    { id: 1, text: "오늘 유독 피로도가 쌓여 조용히 푹 쉬는 중입니다 😴", color: "#b45309", bg: "#fef9c3", border: "#fde047", badge: "💛 수면 배려 알림" },
    { id: 2, text: "이번 가사 돌봄 일정을 조금 조율하고 싶습니다 🔄", color: "#1d4ed8", bg: "#dbe5ff", border: "#bfdbfe", badge: "💙 일정 조율 신호" },
    { id: 3, text: "조용히 마음 써주시고 챙겨주셔서 고마워요 ❤️", color: "#047857", bg: "#d1fae5", border: "#a7f3d0", badge: "💚 감사 시그널" },
    { id: 4, text: "과제나 시험 집중 기간이라 불을 끄고 조용히 공부하는 중입니다 📚", color: "#6d28d9", bg: "#f3e8ff", border: "#e9d5ff", badge: "💜 집중 모드 양해" }
  ]);

  const [receivedMessages] = useState<Msg[]>([
    { id: 1, from: "Will", text: "방 안의 공용 구역 정리해주셔서 고마워요! 덕분에 코코도 신이 난 것 같습니다 🐧❤️", time: "2시간 전", colorAccent: "#047857", bgAccent: "#d1fae5" },
    { id: 2, from: "Jack", text: "오늘 일찍 누워 수면에 들 것 같습니다. 조용한 분위기를 배려해주셔서 감사합니다.", time: "어제", colorAccent: "#b45309", bgAccent: "#fef9c3" }
  ]);

  const handleSendCard = (text: string, badge: string, color: string) => {
    let cardColorName = '초록';
    if (color === '#b45309') cardColorName = '노랑';
    else if (color === '#1d4ed8') cardColorName = '파랑';
    else if (color === '#6d28d9') cardColorName = '보라';
    
    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.min(150, currentTrust + 5);
    localStorage.setItem('roompeace_trust', newTrust.toString());

    // Add diary log
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `집사 잭(나)이 ${selectedRecipient}에게 정서 엽서[${badge}]를 발송하여 ${petName}가 기쁜 마음으로 배달하러 갔습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `💌 ${petEmoji} ${petName}가 [${selectedRecipient}] 집사님에게 "${badge} ${text}" (${cardColorName} 엽서)를 품에 안고 얌전히 전달하러 출발했습니다! (친밀도 +5)`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '1.5rem' }}>
        <span className="mini-badge" style={{ marginBottom: '6px' }}>💌 {petName} 우체통</span>
        <h1 className="section-title">정서적인 엽서 배달</h1>
        <p className="section-subtitle" style={{ margin: 0 }}>
          직접 이야기하기 조심스러운 이야기도, {petEmoji} {petName}가 엽서 형태로 메이트들에게 부드럽게 배달해 드립니다.
        </p>
      </header>

      {/* Recipient select */}
      <div className="toss-card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 800 }}>
          배달받을 룸메이트 선택
        </h3>
        <select 
          value={selectedRecipient}
          onChange={(e) => setSelectedRecipient(e.target.value)}
          style={{ width: '100%', border: '1px solid var(--card-border)', borderRadius: '14px', padding: '12px', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600 }}
        >
          <option value="Jack">잭 (Jack) • 거실 구역 보살핌</option>
          <option value="Will">윌 (Will) • 주방 구역 보살핌</option>
          <option value="Elizabeth">엘리자베스 (Elizabeth) • 공용 구역 보살핌</option>
        </select>
      </div>

      {/* Cozy Sticky Notes Selector */}
      <div className="toss-card" style={{ background: '#fdfcfb' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 800 }}>
          엽서 선택하기 (터치 시 {petName}가 출발합니다)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {templates.map(tpl => (
            <button 
              key={tpl.id}
              onClick={() => handleSendCard(tpl.text, tpl.badge, tpl.color)}
              style={{ 
                background: tpl.bg,
                border: `1.5px solid ${tpl.border}`,
                color: tpl.color,
                borderRadius: '20px',
                padding: '16px 14px',
                textAlign: 'left',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '130px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s ease, box-shadow 0.15s',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) rotate(1deg)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.02)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '0.65rem', background: '#ffffff', padding: '2px 8px', borderRadius: '8px', opacity: 0.9, fontWeight: 800 }}>
                {tpl.badge}
              </span>
              <p style={{ margin: '8px 0 0 0', lineHeight: 1.45, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{tpl.text}"
              </p>
              <span style={{ alignSelf: 'flex-end', fontSize: '0.78rem', fontWeight: 800 }}>{petEmoji} 배달 ➔</span>
            </button>
          ))}
        </div>
      </div>

      {/* Received letter-board */}
      <div>
        <h3 style={{ margin: '18px 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
          📬 {petName}가 우리 방 메이트에게서 받아온 엽서
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {receivedMessages.map(msg => (
            <div 
              key={msg.id} 
              className="toss-card" 
              style={{ 
                marginBottom: 0,
                background: msg.bgAccent,
                border: `1.5px solid ${msg.colorAccent}`,
                borderRadius: '24px',
                transform: msg.id % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem' }}>
                <strong style={{ color: msg.colorAccent, fontWeight: 800 }}>보낸 메이트: {msg.from}</strong>
                <span style={{ color: 'var(--text-sub)' }}>{msg.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5, fontWeight: 700, fontStyle: 'italic' }}>
                "{msg.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
