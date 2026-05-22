import { useState, useEffect } from 'react';

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: string;
  status: string;
  personality: string;
  contribution: number;
  isMe: boolean;
}

interface HouseRank {
  rank: number;
  badge: string;
  name: string;
  score: number;
  isUs: boolean;
}

export default function Crew() {
  const [jackPersonality, setJackPersonality] = useState('수석 집사 🧹');
  const [jackStatus, setJackStatus] = useState('🙂 평온함');
  const [jackTrust, setJackTrust] = useState(100);
  const [roomCode, setRoomCode] = useState('RP-7749');
  
  // Active Pet info
  const [petName, setPetName] = useState('코코');
  const [petEmoji, setPetEmoji] = useState('🐧');
  const [houseName, setHouseName] = useState('아늑한 펭귄가족 🏠');

  // Hardcoded House Rankings (strengthening collective pride)
  const [rankings, setRankings] = useState<HouseRank[]>([
    { rank: 1, badge: "🥇", name: "달빛 펭귄 하우스 🌙 (우리 방)", score: 8420, isUs: true },
    { rank: 2, badge: "🥈", name: "햇살 가득 수달 하우스 🦦", score: 7950, isUs: false },
    { rank: 3, badge: "🥉", name: "조용한 숲속 토끼 둥지 🐰", score: 7200, isUs: false },
    { rank: 4, badge: "4", name: "뒹굴뒹굴 아기여우 모임 🦊", score: 6810, isUs: false }
  ]);

  useEffect(() => {
    const handleSync = () => {
      setJackPersonality(localStorage.getItem('roompeace_my_personality') || '수석 집사 🧹');
      setJackStatus(localStorage.getItem('roompeace_my_status') || '🙂 평온함');
      setJackTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setRoomCode(localStorage.getItem('roompeace_room_code') || 'RP-7749');
      
      const pName = localStorage.getItem('roompeace_pet_name') || '코코';
      setPetName(pName);
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐧');

      const hName = localStorage.getItem('roompeace_house_name') || '아늑한 펭귄가족 🏠';
      setHouseName(hName);

      const teamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
      // Update our score dynamically in rankings board
      setRankings(prev => 
        prev.map(r => r.isUs ? { ...r, name: `${hName} (우리 방)`, score: teamBerry } : r)
            .sort((a, b) => b.score - a.score)
            .map((r, idx) => ({ ...r, rank: idx + 1, badge: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1).toString() }))
      );
    };

    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const members: Member[] = [
    { 
      id: 1, 
      name: "잭 (Jack - 나)", 
      avatar: "👱", 
      role: "거실 구역 보살핌", 
      status: jackStatus, 
      personality: jackPersonality,
      contribution: jackTrust,
      isMe: true
    },
    { 
      id: 2, 
      name: "윌 (Will)", 
      avatar: "👨‍💻", 
      role: "주방 구역 보살핌", 
      status: "😴 피곤함", 
      personality: "정서 집사 🍕",
      contribution: 80,
      isMe: false
    },
    { 
      id: 3, 
      name: "엘리자베스 (Elizabeth)", 
      avatar: "👩‍🎓", 
      role: "공용 구역 보살핌", 
      status: "🍕 외출 중", 
      personality: "관리 집사 💡",
      contribution: 95,
      isMe: false
    }
  ];

  const handleCheer = (name: string) => {
    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.min(150, currentTrust + 2);
    localStorage.setItem('roompeace_trust', newTrust.toString());

    // Add diary log
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `집사 잭(나)이 동료 ${name} 집사님에게 응원 시그널을 전달하여 ${petName}와 더 친해졌습니다.`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `💖 [${name}] 집사님에게 응원 신호를 전했습니다. (${petName} 친밀도 +2)`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `📋 양육 초대 링크가 복사되었습니다! 룸메이트에게 보내보세요: ${inviteLink}` }
      }));
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `초대 코드: ${roomCode}` }
      }));
    });
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '1.5rem' }}>
        <span className="mini-badge" style={{ marginBottom: '6px' }}>👥 하우스 공동체</span>
        <h1 className="section-title">{houseName} 집사들</h1>
        <p className="section-subtitle" style={{ margin: 0 }}>
          룸메이트들의 상태를 파악하고, 일정이 바쁜 집사에게 {petEmoji} {petName}와 함께 은은한 응원을 전해 보세요.
        </p>
      </header>

      {/* 🏆 HOUSE RANKINGS BOARD (Cooperative and team pride) */}
      <div className="toss-card" style={{ background: '#ffffff', border: '1px solid var(--card-border)', marginBottom: '20px', padding: '18px 20px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🏆 최고의 협동 하우스 랭킹
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          메이트끼리 서로 격려하고 배려를 실천할수록 우리 하우스의 랭킹 점수가 올라갑니다!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rankings.map(rank => (
            <div 
              key={rank.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: rank.isUs ? 'var(--accent-blue-light)' : '#fdfcfb',
                border: rank.isUs ? '1.5px solid var(--accent-blue)' : '1px solid var(--card-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, width: '24px', textAlign: 'center' }}>
                  {rank.badge}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: rank.isUs ? 800 : 600, color: 'var(--text-main)' }}>
                  {rank.name}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: rank.isUs ? 'var(--accent-blue)' : 'var(--text-sub)' }}>
                🍓 {rank.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔑 ROOMMATE INVITE CARD */}
      <div className="toss-card" style={{ 
        background: 'linear-gradient(135deg, var(--accent-blue-light) 0%, #ffffff 100%)', 
        border: '1.5px solid var(--accent-blue)', 
        marginBottom: '20px',
        borderRadius: '24px'
      }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
          🔑 {petName} 같이 키우기 (초대)
        </h3>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.45, fontWeight: 500 }}>
          아직 들어오지 않은 메이트가 있나요? 아래 링크를 복사하여 전달하면 {petEmoji} {petName}의 공동 집사로 함께 방을 따뜻하게 가꿀 수 있습니다.
        </p>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ 
            flex: 1, 
            background: '#ffffff', 
            border: '1px solid var(--card-border)', 
            padding: '10px 14px', 
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: 'var(--text-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>양육 방 코드</span>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800 }}>
              {roomCode}
            </span>
          </div>
          <button 
            onClick={handleCopyInviteLink}
            style={{ 
              background: 'var(--accent-blue)', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '12px 18px', 
              fontSize: '0.82rem', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            링크 복사
          </button>
        </div>
      </div>

      {/* Member Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {members.map(member => {
          const needsCare = member.status === '📚 시험기간' || member.status === '😴 피곤함';
          return (
            <div key={member.id} className="toss-card" style={{ marginBottom: 0, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  background: '#fdfcfb', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: member.isMe && localStorage.getItem('roompeace_has_border') === 'true' ? '3px double var(--accent-blue)' : '1px solid var(--card-border)',
                  boxShadow: member.isMe && localStorage.getItem('roompeace_has_border') === 'true' ? '0 0 8px rgba(74, 108, 247, 0.2)' : 'none'
                }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {member.name}
                    {needsCare && <span style={{ fontSize: '0.62rem', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>🌱 배려 집중 지원</span>}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <span className="mini-badge" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', fontSize: '0.65rem' }}>
                      {member.role}
                    </span>
                    <span className="mini-badge" style={{ background: '#f4f3f0', color: 'var(--text-sub)', fontSize: '0.65rem' }}>
                      {member.personality}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-sub)', background: '#f4f3f0', padding: '4px 8px', borderRadius: '8px' }}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Closeness Bar */}
              <div style={{ background: '#fdfcfb', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--card-border)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-sub)', marginBottom: '4px', fontWeight: 'bold' }}>
                  <span>{member.isMe ? `나의 ${petName} 친밀도` : `동료의 ${petName} 친밀도`}</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{member.contribution} / 150 점</span>
                </div>
                <div className="bar-container" style={{ margin: 0, height: '6px' }}>
                  <div className="bar-fill" style={{ width: `${(member.contribution / 150) * 100}%`, background: 'var(--accent-blue)' }}></div>
                </div>
              </div>

              {/* Action Button */}
              {member.isMe ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', textAlign: 'center', padding: '6px', fontStyle: 'italic', fontWeight: 500 }}>
                  💡 마이 페이지에서 돌봄 성향과 공유 상태를 실시간 변경할 수 있습니다.
                </div>
              ) : (
                <button 
                  className="btn-cta btn-secondary" 
                  onClick={() => handleCheer(member.name)}
                  style={{ padding: '10px', borderRadius: '12px', fontSize: '0.8rem', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', border: '1px solid #dbe5ff' }}
                >
                  💖 응원의 시그널 보내기 ({petName} 친밀도 +2)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
