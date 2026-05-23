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
  const [selectedRecipient, setSelectedRecipient] = useState('Will');
  
  // Active Pet info
  const [petName, setPetName] = useState('루미');
  const [petEmoji, setPetEmoji] = useState('🐶');

  useEffect(() => {
    const handleSync = () => {
      setPetName(localStorage.getItem('roompeace_pet_name') || '루미');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const [templates] = useState([
    { id: 1, text: "오늘 피로 누적으로 개꿀잠 솔드아웃 예정... 조용조용 모드 플리즈! 😴💤", color: "#b45309", bg: "#fef9c3", border: "#fde047", badge: "💛 개꿀잠 조용조용" },
    { id: 2, text: "오늘 현생 바빠서 퀘스트 하루 미루고 싶음... 조율 원츄! 🔄", color: "#1d4ed8", bg: "#dbe5ff", border: "#bfdbfe", badge: "💙 퀘스트 일정 조율" },
    { id: 3, text: "항상 보이지 않는 곳에서 조용히 챙겨줘서 ㄹㅇ 고마움! 오늘도 평화롭네 🫶❤️", color: "#047857", bg: "#d1fae5", border: "#a7f3d0", badge: "💚 메이트 압도적 감사" },
    { id: 4, text: "시험기간 열공 폼 미쳤다... 밤샘 예정이니 들어올 때 살금살금 부탁함! 📚🔥", color: "#6d28d9", bg: "#f3e8ff", border: "#e9d5ff", badge: "💜 시험공부 열공모드" }
  ]);

  const [receivedMessages] = useState<Msg[]>([
    { id: 1, from: "Will", text: "방 청소 에이스 잭! 진짜 최고임... 덕분에 루미도 꼬리 헬리콥터 돌리고 난리남 🐶🔥", time: "2시간 전", colorAccent: "#047857", bgAccent: "#d1fae5" },
    { id: 2, from: "Elizabeth", text: "나 오늘 개꿀잠 모드... 불 끄고 살금살금 배려해줘서 ㄹㅇ 감동받았잖아 🥺", time: "어제", colorAccent: "#b45309", bgAccent: "#fef9c3" }
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
      text: `집사 잭(나)이 ${selectedRecipient}에게 [${badge}] 엽서를 띄웠어요. 루미가 신나서 우다다 배달해줬습니다 🐶💌`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `💌 [${cardColorName} 엽서] ${petEmoji} ${petName}가 [${selectedRecipient}] 집사님에게 "${badge} ${text}" 엽서를 안고 슝 날아갔습니다! (방 분위기 +5)`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <span className="mini-badge" style={{ marginBottom: '6px' }}>💌 {petName} 우체통</span>
        <h1 className="section-title">정서적인 엽서 배달</h1>
        <p className="section-subtitle" style={{ margin: 0 }}>
          직접 이야기하기 살짝 어색한 부탁이나 응원도, {petEmoji} {petName}를 거치면 은은하게 전할 수 있어요.
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
          <option value="Will">윌 (Will) • 주방 구역 보살핌</option>
          <option value="Elizabeth">엘리자베스 (Elizabeth) • 공용 구역 보살핌</option>
        </select>
      </div>

      {/* Cozy Sticky Notes Selector */}
      <div className="toss-card" style={{ background: '#fdfcfb' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 800 }}>
          엽서 골라보기 (선택하면 {petName}가 우다다 출발합니다)
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
              <span style={{ fontSize: '0.62rem', background: '#ffffff', padding: '2px 8px', borderRadius: '8px', opacity: 0.9, fontWeight: 800 }}>
                {tpl.badge}
              </span>
              <p style={{ margin: '8px 0 0 0', lineHeight: 1.45, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>
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
          📬 메이트들이 보내서 루미가 물어다준 엽서
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
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5, fontWeight: 700, fontStyle: 'italic' }}>
                "{msg.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
