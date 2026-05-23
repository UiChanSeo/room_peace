import { useState, useEffect } from 'react';
import { QUEST_TEMPLATES, QuestTemplate } from './questsData';

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

interface ActiveQuest {
  id: string;
  title: string;
  desc: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  contribution: number;
  completed: boolean;
}

export default function Crew() {
  const [jackPersonality, setJackPersonality] = useState('수석 집사 🧹');
  const [jackStatus, setJackStatus] = useState('🙂 평온함');
  const [jackTrust, setJackTrust] = useState(100);
  const [roomCode, setRoomCode] = useState('RP-7749');
  
  // Active Pet info
  const [petName, setPetName] = useState('루미');
  const [petEmoji, setPetEmoji] = useState('🐶');
  const [houseName, setHouseName] = useState('달빛 펭귄 하우스 🏠');
  const [teamBerry, setTeamBerry] = useState(8420);

  // Active Quests
  const [activeQuests, setActiveQuests] = useState<ActiveQuest[]>([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [showSkipWarning, setShowSkipWarning] = useState<string | null>(null);

  // Custom Quest states
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Hardcoded House Rankings (collective pride)
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
      
      const pName = localStorage.getItem('roompeace_pet_name') || '루미';
      setPetName(pName);
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');

      const hName = localStorage.getItem('roompeace_house_name') || '달빛 펭귄 하우스 🏠';
      setHouseName(hName);

      const tb = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
      setTeamBerry(tb);

      // Load active quests
      const storedQuests = localStorage.getItem('roompeace_active_quests');
      if (storedQuests) {
        setActiveQuests(JSON.parse(storedQuests));
      } else {
        const defaultStarter = QUEST_TEMPLATES.slice(0, 6).map(q => ({
          ...q,
          completed: false
        }));
        localStorage.setItem('roompeace_active_quests', JSON.stringify(defaultStarter));
        setActiveQuests(defaultStarter);
      }

      // Update our score dynamically in rankings board
      setRankings(prev => 
        prev.map(r => r.isUs ? { ...r, name: `${hName} (우리 방)`, score: tb } : r)
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
      text: `집사 잭(나)이 동료 [${name}] 집사님에게 응원 메시지를 던졌어요. 루미가 꼬리를 프로펠러마냥 흔듭니다! 🐶💖`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `💖 [${name}] 집사님에게 응원 신호를 보냈어요! (방 분위기 +2)`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `📋 초대 링크 복사 완료! 메이트한테 카톡으로 던져줘: ${inviteLink}` }
      }));
    }).catch(err => {
      console.error('Failed to copy: ', err);
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `초대 코드: ${roomCode}` }
      }));
    });
  };

  // Quest Actions
  const toggleQuest = (id: string) => {
    const updated = activeQuests.map(q => {
      if (q.id === id) {
        const isNowCompleted = !q.completed;
        
        // update berry, team_berry, trust
        const rewardMultiplier = (localStorage.getItem('roompeace_premium') === 'true' && jackTrust >= 80) ? 2 : 1;
        const pointsDelta = isNowCompleted ? q.points * rewardMultiplier : -q.points * rewardMultiplier;
        const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
        localStorage.setItem('roompeace_berry', Math.max(0, currentBerry + pointsDelta).toString());

        const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
        const teamDelta = isNowCompleted ? Math.round(q.points * 0.5) : -Math.round(q.points * 0.5);
        localStorage.setItem('roompeace_team_berry', Math.max(0, Math.min(10000, currentTeamBerry + teamDelta)).toString());

        const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
        const trustDelta = isNowCompleted ? q.contribution : -q.contribution;
        const newTrust = Math.max(0, Math.min(150, currentTrust + trustDelta));
        localStorage.setItem('roompeace_trust', newTrust.toString());
        setJackTrust(newTrust);

        if (isNowCompleted) {
          const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
          const newDiary = {
            id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
            text: `집사 잭(나)이 [${q.title}] 퀘스트를 격파했습니다! ㄹㅇ 에이스 ⚡`,
            date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          };
          localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));
        }

        return { ...q, completed: isNowCompleted };
      }
      return q;
    });

    setActiveQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `⚡ 퀘스트 상태가 반영되었습니다!` }
    }));
  };

  const deleteQuest = (id: string) => {
    const updated = activeQuests.filter(q => q.id !== id);
    setActiveQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🗑️ 퀘스트를 삭제했습니다.` }
    }));
  };

  const handleSkipClick = (id: string) => {
    setShowSkipWarning(id);
  };

  const applySkipDelay = (id: string) => {
    const updated = activeQuests.map(q => q.id === id ? { ...q, completed: true } : q);
    setActiveQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));

    // Log to diary
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newDiary = {
      id: currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1,
      text: `바쁜 일정 때문에 메이트 협의 하에 퀘스트를 다음 기회로 미뤘습니다. 🍀`,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('roompeace_diaries', JSON.stringify([newDiary, ...currentDiaries]));

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🍀 다음 일정을 위해 미루기로 등록했어요!` }
    }));
    setShowSkipWarning(null);
  };

  const addQuestFromTemplate = (template: QuestTemplate) => {
    if (activeQuests.some(q => q.id === template.id)) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `⚠️ 이미 등록된 퀘스트입니다!` }
      }));
      return;
    }

    const newQuest: ActiveQuest = {
      ...template,
      completed: false
    };

    const updated = [...activeQuests, newQuest];
    setActiveQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `📌 퀘스트 [${template.title}] 추가 완료!` }
    }));
  };

  const createCustomQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `❌ 퀘스트 제목을 입력해주세요!` }
      }));
      return;
    }

    const points = customDifficulty === 'easy' ? 5 : customDifficulty === 'medium' ? 15 : 40;
    const contribution = customDifficulty === 'easy' ? 1 : customDifficulty === 'medium' ? 3 : 8;

    const newQuest: ActiveQuest = {
      id: 'custom-' + Date.now(),
      title: customTitle.trim() + ' 🔧',
      desc: customDesc.trim() || '우리 방의 커스텀 청소 약속입니다.',
      difficulty: customDifficulty,
      points,
      contribution,
      completed: false
    };

    const updated = [...activeQuests, newQuest];
    setActiveQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🛠️ 커스텀 퀘스트 [${newQuest.title}] 생성 완료!` }
    }));

    setCustomTitle('');
    setCustomDesc('');
  };

  // Filter templates list
  const filteredTemplates = QUEST_TEMPLATES.filter(tpl => {
    const matchesSearch = tpl.title.includes(searchQuery) || tpl.desc.includes(searchQuery);
    const matchesDiff = difficultyFilter === 'all' || tpl.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // Real-time Atmosphere Mapping
  let atmosphereEmoji = '😐';
  let atmosphereText = '애매함';
  let atmosphereColor = '#f59e0b';
  let atmosphereBg = '#fef3c7';

  if (jackTrust >= 130) {
    atmosphereEmoji = '🔥';
    atmosphereText = '최고의 팀워크';
    atmosphereColor = '#3b82f6';
    atmosphereBg = '#dbe5ff';
  } else if (jackTrust >= 80) {
    atmosphereEmoji = '😊';
    atmosphereText = '훈훈함';
    atmosphereColor = '#10b981';
    atmosphereBg = '#d1fae5';
  } else if (jackTrust < 40) {
    atmosphereEmoji = '😡';
    atmosphereText = '냉전 상태';
    atmosphereColor = '#ef4444';
    atmosphereBg = '#fee2e2';
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="mini-badge" style={{ marginBottom: '6px' }}>🏠 우리방 관리 보드 • {houseName}</span>
          <h1 className="section-title">우리 같이 굴리는 생활 시스템</h1>
          <p className="section-subtitle" style={{ margin: 0 }}>
            억지 잔소리나 벌금 없이, 퀘스트와 응원의 시그널로 은은하게 평화를 굴려봐요.
          </p>
        </div>
        <div className="stat-pill points" style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>
          🏆 {teamBerry} 점
        </div>
      </header>

      {/* 🏡 ATMOSPHERE OVERVIEW */}
      <div className="toss-card highlight" style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)',
        borderColor: '#eee7de',
        padding: '16px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
              우리방 평화 온도
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 600 }}>
              메이트들의 누적 퀘스트 기여도 합산 점수
            </span>
          </div>
          <span style={{ 
            fontSize: '0.85rem', 
            background: atmosphereBg, 
            color: atmosphereColor, 
            padding: '6px 12px', 
            borderRadius: '12px',
            fontWeight: 800
          }}>
            {atmosphereEmoji} {atmosphereText} ({jackTrust}도)
          </span>
        </div>
        <div className="bar-container" style={{ margin: '8px 0 0 0', height: '10px', background: '#f2ece4' }}>
          <div className="bar-fill" style={{ width: `${(jackTrust / 150) * 100}%`, background: atmosphereColor }}></div>
        </div>
      </div>

      {/* 🤝 ACTIVE QUESTS BOARD */}
      <div className="toss-card" style={{ background: '#ffffff', borderColor: '#eee7de', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📌 우리방 실시간 퀘스트 ({activeQuests.length}개)
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 500 }}>
              체크박스를 터치하여 가사를 완료하면, 보급 베리와 온도를 얻습니다.
            </span>
          </div>
          <button 
            className="btn-cta" 
            onClick={() => setShowAddModal(true)}
            style={{ padding: '8px 14px', fontSize: '0.78rem', borderRadius: '12px', width: 'auto', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', border: '1px solid #dbe5ff' }}
          >
            ➕ 퀘스트 추가
          </button>
        </div>

        {activeQuests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)', fontSize: '0.82rem', fontWeight: 600 }}>
            등록된 퀘스트가 없습니다. 메이트들과 함께할 퀘스트를 추가해보세요!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeQuests.map(q => {
              const diffColor = q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444';
              return (
                <div 
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '18px',
                    background: q.completed ? 'var(--accent-blue-light)' : '#fdfcfb',
                    border: q.completed ? '1.5px solid #dbe5ff' : '1px solid var(--card-border)'
                  }}
                >
                  <div 
                    style={{ display: 'flex', alignItems: 'start', gap: '12px', flex: 1, cursor: 'pointer' }}
                    onClick={() => toggleQuest(q.id)}
                  >
                    <div style={{
                      marginTop: '2px', width: '20px', height: '20px', borderRadius: '50%', 
                      border: q.completed ? 'none' : '2px solid #ccc',
                      background: q.completed ? 'var(--accent-blue)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                    }}>
                      {q.completed && <span style={{ color: '#fff', fontSize: '0.62rem', fontWeight: 900 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)', textDecoration: q.completed ? 'line-through' : 'none' }}>
                          {q.title}
                        </strong>
                        <span style={{ 
                          fontSize: '0.58rem', 
                          color: diffColor, 
                          background: q.difficulty === 'easy' ? '#d1fae5' : q.difficulty === 'medium' ? '#fef3c7' : '#fee2e2', 
                          padding: '1px 5px', 
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', fontWeight: 800, marginRight: '4px' }}>
                      +{q.points}B
                    </span>
                    {!q.completed && (
                      <button 
                        onClick={() => handleSkipClick(q.id)}
                        style={{ border: '1px solid var(--card-border)', background: '#ffffff', borderRadius: '8px', padding: '4px 8px', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-sub)', cursor: 'pointer' }}
                      >
                        미루기
                      </button>
                    )}
                    <button 
                      onClick={() => deleteQuest(q.id)}
                      style={{ border: 'none', background: 'transparent', fontSize: '1rem', cursor: 'pointer', opacity: 0.6 }}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 👥 HOUSE ROOMMATES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
          👥 우리방 메이트들
        </h3>
        {members.map(member => {
          const needsCare = member.status === '📚 시험기간' || member.status === '😴 피곤함';
          return (
            <div key={member.id} className="toss-card" style={{ marginBottom: 0, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  background: '#fdfcfb', 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: member.isMe && localStorage.getItem('roompeace_has_border') === 'true' ? '3px double var(--accent-blue)' : '1px solid var(--card-border)'
                }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {member.name}
                    {needsCare && <span style={{ fontSize: '0.6rem', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>🌱 배려 필요!</span>}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className="mini-badge" style={{ background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', fontSize: '0.62rem' }}>
                      {member.role}
                    </span>
                    <span className="mini-badge" style={{ background: '#f4f3f0', color: 'var(--text-sub)', fontSize: '0.62rem' }}>
                      {member.personality}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-sub)', background: '#f4f3f0', padding: '4px 8px', borderRadius: '8px' }}>
                    {member.status}
                  </span>
                </div>
              </div>

              {/* Closeness Bar */}
              <div style={{ background: '#fdfcfb', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-sub)', marginBottom: '2px', fontWeight: 'bold' }}>
                  <span>{member.isMe ? `나의 ${petEmoji} 친밀도 기여` : `동료의 ${petEmoji} 친밀도 기여`}</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 800 }}>{member.contribution} / 150</span>
                </div>
                <div className="bar-container" style={{ margin: 0, height: '5px' }}>
                  <div className="bar-fill" style={{ width: `${(member.contribution / 150) * 100}%`, background: 'var(--accent-blue)' }}></div>
                </div>
              </div>

              {/* Cheer Button */}
              {!member.isMe && (
                <button 
                  className="btn-cta btn-secondary" 
                  onClick={() => handleCheer(member.name)}
                  style={{ padding: '8px', borderRadius: '10px', fontSize: '0.76rem', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', border: '1px solid #dbe5ff' }}
                >
                  💖 응원의 멘트 던지기 (방 분위기 +2)
                </button>
              )}
            </div>
          );
        })}
      </div>

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
          아직 룸메이트들이 가입 안했나요? 초대링크를 카톡으로 던져서 루미의 공동 집사로 방의 퀘스트를 함께 나눠보세요.
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
            <span>공동방 가입 코드</span>
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

      {/* ➕ ADD QUEST MODAL (Cozy templates list + Custom build) */}
      {showAddModal && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.45)', zIndex: 100 }}>
          <div className="toss-modal-content animate-fade-in" style={{ padding: '20px', maxWidth: '420px', width: '92%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 className="toss-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                🛠️ 우리방 생활 퀘스트 설계
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-sub)', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* Switch / Scrollable area split into "predefined" and "custom creation" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Part A: Create Custom Quest Form */}
              <form onSubmit={createCustomQuest} style={{ 
                background: '#fafbfc', 
                border: '1px solid var(--card-border)', 
                borderRadius: '18px', 
                padding: '12px 14px' 
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                  ✏️ 직접 퀘스트 만들기
                </span>
                
                <input 
                  type="text" 
                  placeholder="예: 금요일 냉장고 청소 ❄️" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '8px 10px', marginBottom: '8px', width: '100%', boxSizing: 'border-box' }}
                />
                
                <input 
                  type="text" 
                  placeholder="상세 설명 (선택)" 
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  style={{ fontSize: '0.75rem', padding: '8px 10px', marginBottom: '8px', width: '100%', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => setCustomDifficulty(diff)}
                        style={{
                          fontSize: '0.68rem', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
                          background: customDifficulty === diff ? 'var(--accent-blue)' : '#ffffff',
                          color: customDifficulty === diff ? '#ffffff' : 'var(--text-sub)',
                          border: customDifficulty === diff ? 'none' : '1px solid var(--card-border)'
                        }}
                      >
                        {diff === 'easy' ? '쉬움' : diff === 'medium' ? '보통' : '어려움'}
                      </button>
                    ))}
                  </div>
                  <button 
                    type="submit" 
                    className="btn-cta"
                    style={{ fontSize: '0.72rem', padding: '8px 12px', width: 'auto', borderRadius: '8px' }}
                  >
                    추가하기
                  </button>
                </div>
              </form>

              {/* Part B: Predefined Quest templates selection */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                  📦 검증된 하우스 퀘스트 목록 ({filteredTemplates.length}개)
                </span>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 퀘스트 검색..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '0.76rem', padding: '6px 10px', flex: 1 }}
                  />
                  <select
                    value={difficultyFilter}
                    onChange={(e: any) => setDifficultyFilter(e.target.value)}
                    style={{ fontSize: '0.72rem', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '6px' }}
                  >
                    <option value="all">난이도 전체</option>
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>

                {/* Templates Box */}
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px',
                  paddingRight: '2px'
                }}>
                  {filteredTemplates.map(tpl => {
                    const isAdded = activeQuests.some(q => q.id === tpl.id);
                    const diffColor = tpl.difficulty === 'easy' ? '#10b981' : tpl.difficulty === 'medium' ? '#f59e0b' : '#ef4444';
                    return (
                      <div 
                        key={tpl.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: '1px solid var(--card-border)',
                          background: '#ffffff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: isAdded ? 0.65 : 1
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{tpl.title}</strong>
                            <span style={{ 
                              fontSize: '0.55rem', 
                              color: diffColor, 
                              background: tpl.difficulty === 'easy' ? '#d1fae5' : tpl.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                              padding: '1px 4px', 
                              borderRadius: '4px',
                              fontWeight: 800 
                            }}>
                              {tpl.difficulty === 'easy' ? '쉬움' : tpl.difficulty === 'medium' ? '보통' : '어려움'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', display: 'block', marginTop: '1px' }}>{tpl.desc}</span>
                        </div>

                        <button
                          onClick={() => addQuestFromTemplate(tpl)}
                          disabled={isAdded}
                          style={{
                            fontSize: '0.68rem', padding: '4px 8px', borderRadius: '8px', border: 'none', cursor: isAdded ? 'not-allowed' : 'pointer',
                            background: isAdded ? '#f3f4f6' : 'var(--accent-blue-light)',
                            color: isAdded ? '#9ca3af' : 'var(--accent-blue)',
                            fontWeight: 'bold'
                          }}
                        >
                          {isAdded ? '등록됨' : '담기'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <button
              className="btn-cta"
              onClick={() => setShowAddModal(false)}
              style={{ width: '100%', marginTop: '16px', background: '#f4f3f0', color: 'var(--text-main)' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 🍀 NON-CONFRONTATIONAL SKIP DELAY MODAL */}
      {showSkipWarning !== null && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '30px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍀</div>
            <h2 className="toss-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              바쁜 일정이 있으신가요?
            </h2>
            <p className="toss-modal-desc" style={{ fontSize: '0.85rem', marginBottom: '24px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              바쁘시다면 미루셔도 전혀 괜찮습니다! 🍀<br />
              미루기는 룸메이트 간의 조율일 뿐이며, 메이트들에게 어떠한 감시 알림이나 벌점을 통보하지 않아요.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-cta btn-secondary"
                onClick={() => setShowSkipWarning(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.85rem' }}
              >
                그냥 지금 할래요
              </button>
              <button
                className="btn-cta"
                onClick={() => applySkipDelay(showSkipWarning)}
                style={{ flex: 1, background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #dbe5ff' }}
              >
                미뤄둘래요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
