import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Quest {
  id: number;
  title: string;
  points: number;
  completed: boolean;
}

interface Signal {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'loss';
  time: string;
}



export default function Dashboard() {
  const [isPremium, setIsPremium] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([
    { id: 1, title: '설거지 그릇 정리하기 🍽️', points: 10, completed: false },
    { id: 2, title: '분리수거 봉투 비우기 🧹', points: 20, completed: false }
  ]);

  // House Identity
  const [houseName, setHouseName] = useState('아늑한 펭귄가족 🏠');
  const [petName, setPetName] = useState('코코');
  const [petEmoji, setPetEmoji] = useState('🐧');

  // Stats
  const [trust, setTrust] = useState(100);
  const [streak, setStreak] = useState(14);
  const [jackStatus, setJackStatus] = useState('🙂 평온함');
  const [teamBerry, setTeamBerry] = useState(8420);

  // Skip Modal state
  const [showSkipWarning, setShowSkipWarning] = useState<number | null>(null);

  // Flash Event state (Coco's sudden help request)
  const [flashCompleted, setFlashCompleted] = useState(false);
  const [flashSeconds, setFlashSeconds] = useState(860);

  // Daily surprise box states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [boxState, setBoxState] = useState<'closed' | 'open'>('closed');
  const [lootReward, setLootReward] = useState<string | null>(null);

  // Rewarded Ads state (Reframed to supportive donations for Coco)
  const [adModalType, setAdModalType] = useState<'coffee' | 'ticket' | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  // House Signals (Emotional Collective Feed)
  const [signals] = useState<Signal[]>([
    { id: 1, text: "Will 집사님이 코코 방에 감사 카드를 꽂아두었어요 💌", type: "info", time: "2시간 전" },
    { id: 2, text: "최근 방 전체의 배려 활동 신호가 약해졌어요. 코코의 활기 충전을 권해드립니다 🐾", type: "warning", time: "오늘" },
    { id: 3, text: "연속 돌봄 기록이 안정적으로 14일째 가꾸어지는 중입니다.", type: "loss", time: "오늘" }
  ]);

  const handleWatchAd = (type: 'coffee' | 'ticket') => {
    setAdModalType(type);
    setAdLoading(true);

    // Simulate 2 seconds of ad watching
    setTimeout(() => {
      setAdLoading(false);

      // Grant item to inventory
      const currentInv = JSON.parse(localStorage.getItem('roompeace_inventory') || '{}');
      const itemId = type === 'coffee' ? 2 : 6;
      currentInv[itemId] = (currentInv[itemId] || 0) + 1;
      localStorage.setItem('roompeace_inventory', JSON.stringify(currentInv));

      // Trigger sync
      window.dispatchEvent(new Event('storage'));

      const itemName = type === 'coffee' ? '화해용 커피 선물 ☕' : '코코 기록 복구권 🎟';

      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🎁 지원 시청 완료! [${itemName}]이(가) 집사 보관함에 지급되었습니다.` }
      }));

      setAdModalType(null);
    }, 2000);
  };

  useEffect(() => {
    const handleSync = () => {
      setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
      setHouseName(localStorage.getItem('roompeace_house_name') || '아늑한 펭귄가족 🏠');
      setPetName(localStorage.getItem('roompeace_pet_name') || '코코');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐧');

      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setStreak(parseInt(localStorage.getItem('roompeace_streak') || '14'));
      setJackStatus(localStorage.getItem('roompeace_my_status') || '🙂 평온함');
      setTeamBerry(parseInt(localStorage.getItem('roompeace_team_berry') || '8420'));

    };

    handleSync();
    window.addEventListener('storage', handleSync);

    const interval = setInterval(() => {
      setFlashSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (!sessionStorage.getItem('roompeace_daily_shown')) {
      setShowDailyModal(true);
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);

  const rewardMultiplier = (isPremium && trust >= 50) ? 2 : 1;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenLootbox = () => {
    if (boxState === 'open') return;

    const rewards = ['+20 베리 보너스', '코코 영양 간식 🐟', '집사 전용 양말 🧦'];
    const chosen = rewards[Math.floor(Math.random() * rewards.length)];
    setLootReward(chosen);
    setBoxState('open');

    let bonusBerry = 50;
    if (chosen === '+20 베리 보너스') {
      bonusBerry = 70;
    }

    if (trust >= 120) bonusBerry = 100;
    else if (trust >= 80) bonusBerry = 50;
    else if (trust >= 50) bonusBerry = 20;
    else if (trust >= 20) bonusBerry = 10;
    else bonusBerry = 5;

    const finalReward = bonusBerry * rewardMultiplier;
    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + finalReward;

    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
    const newTeamBerry = Math.min(10000, currentTeamBerry + Math.round(finalReward * 0.5));
    localStorage.setItem('roompeace_team_berry', newTeamBerry.toString());

    // Save to diary
    addDiaryLog(`보급 상자에서 [${chosen}]을(를) 획득하여 집사 지갑에 베리가 보충되었습니다.`);

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `🎁 [${chosen}] 확인! 펫 육성을 위한 +${finalReward} 베리가 적립되었습니다.`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  const handleCloseDaily = () => {
    sessionStorage.setItem('roompeace_daily_shown', 'true');
    setShowDailyModal(false);
  };

  const addDiaryLog = (text: string) => {
    const currentDiaries = JSON.parse(localStorage.getItem('roompeace_diaries') || '[]');
    const newId = currentDiaries.length > 0 ? currentDiaries[0].id + 1 : 1;
    const newDiary = {
      id: newId,
      text: text,
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newDiary, ...currentDiaries].slice(0, 30);
    localStorage.setItem('roompeace_diaries', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const toggleQuest = (id: number) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    const isNowCompleted = !targetQuest.completed;
    setQuests(quests.map(q => q.id === id ? { ...q, completed: isNowCompleted } : q));

    const finalPoints = targetQuest.points * rewardMultiplier;
    const pointsDelta = isNowCompleted ? finalPoints : -finalPoints;

    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + pointsDelta;
    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
    const teamDelta = isNowCompleted ? Math.round(finalPoints * 0.5) : -Math.round(finalPoints * 0.5);
    const newTeamBerry = Math.max(0, Math.min(10000, currentTeamBerry + teamDelta));
    localStorage.setItem('roompeace_team_berry', newTeamBerry.toString());

    // Closeness increase
    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const trustDelta = isNowCompleted ? 6 : -6;
    const newTrust = Math.max(0, Math.min(150, currentTrust + trustDelta));
    localStorage.setItem('roompeace_trust', newTrust.toString());
    setTrust(newTrust);

    if (isNowCompleted) {
      addDiaryLog(`집사 잭(나)이 [${targetQuest.title}] 돌봄 활동을 완료하여 ${petName}와 친해졌습니다.`);
    }

    window.dispatchEvent(new Event('storage'));

    const toastMsg = isNowCompleted
      ? `🎉 [${targetQuest.title}] 돌봄 완료! ${petName} 친밀도 +6 점 및 +${finalPoints} 베리 획득!`
      : `돌봄 상태를 변경했습니다.`;

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  const handleSkipClick = (id: number) => {
    setShowSkipWarning(id);
  };

  const applySkipPunishment = (id: number) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    const offenses = parseInt(localStorage.getItem('roompeace_offense_count') || '0');
    const newOffenses = offenses + 1;
    localStorage.setItem('roompeace_offense_count', newOffenses.toString());

    let trustLoss = 0;
    if (newOffenses >= 2) {
      trustLoss = newOffenses >= 3 ? 8 : 4;
    }

    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.max(0, currentTrust - trustLoss);

    localStorage.setItem('roompeace_trust', newTrust.toString());
    localStorage.setItem('roompeace_streak', '0'); // Soft streak reset
    setTrust(newTrust);
    setStreak(0);

    setQuests(quests.map(q => q.id === id ? { ...q, completed: true } : q));

    addDiaryLog(`바쁜 일정으로 인해 [${targetQuest.title}] 돌봄 활동을 미루기로 등록했습니다.`);

    window.dispatchEvent(new Event('storage'));

    let toastMsg = `🐾 [${targetQuest.title}] 일정을 미뤘습니다.`;
    if (trustLoss > 0) {
      toastMsg += ` ${petName}가 졸린 기색을 보이며 연속 돌봄 기록이 환기되었습니다.`;
    } else {
      toastMsg += ` (일정 미룸 등록 완료)`;
    }

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));

    setShowSkipWarning(null);
  };

  const toggleFlashQuest = () => {
    if (flashCompleted) return;

    if (trust < 50) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `💤 ${petName}가 웅크려 있어 깜짝 도움 미션에 참여할 수 없습니다.` }
      }));
      return;
    }

    setFlashCompleted(true);
    let baseReward = 40;
    if (trust < 80) baseReward = 20;
    if (trust < 50) baseReward = 10;

    const finalReward = baseReward * rewardMultiplier;
    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + finalReward;
    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
    const newTeamBerry = Math.min(10000, currentTeamBerry + Math.round(finalReward * 0.5));
    localStorage.setItem('roompeace_team_berry', newTeamBerry.toString());

    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.min(150, currentTrust + 5);
    localStorage.setItem('roompeace_trust', newTrust.toString());
    setTrust(newTrust);

    addDiaryLog(`깜짝 돌봄 [코코의 물그릇 비우기] 도움 완수로 ${petName} 친밀도가 상승했습니다.`);

    window.dispatchEvent(new Event('storage'));

    const flashMsg = `⚡ 깜짝 물그릇 비우기 완수! 친밀도 +5 및 +${finalReward} 베리 적립!`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: flashMsg }
    }));
  };

  const handleCompleteAll = () => {
    const uncompletedQuests = quests.filter(q => !q.completed);
    if (uncompletedQuests.length === 0) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "오늘의 모든 돌봄 약속을 이미 완료했습니다!" }
      }));
      return;
    }

    const earnedBasePoints = uncompletedQuests.reduce((sum, q) => sum + q.points, 0);
    const earnedBerry = earnedBasePoints * rewardMultiplier;

    setQuests(quests.map(q => ({ ...q, completed: true })));

    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + earnedBerry;
    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.min(150, currentTrust + 12);
    localStorage.setItem('roompeace_trust', newTrust.toString());
    setTrust(newTrust);

    addDiaryLog(`오늘 하루 모든 가사 돌봄 일정을 한 번에 완료하여 ${petName}의 둥지가 포근해졌습니다.`);

    window.dispatchEvent(new Event('storage'));

    const successMsg = `🎉 전체 돌봄 약속 완료! ${petName} 친밀도 +12 상승!`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: successMsg }
    }));
  };

  // Real-time Emotional Configuration
  let moodEmoji = '🙂';
  let moodText = '평온함';

  if (trust < 20) {
    moodEmoji = '😴';
    moodText = '웅크려 잠듦';
  } else if (trust < 50) {
    moodEmoji = '🥺';
    moodText = '외롭고 지침';
  } else if (trust < 80) {
    moodEmoji = '🐾';
    moodText = '어색해함';
  } else if (trust >= 120) {
    moodEmoji = '✨';
    moodText = '행복함';
  }


  // Growth Stage Mapping
  let growthStage = '🥚 알';
  let nextStage = '🐣 아기';
  let nextTarget = 1000;
  let percent = 0;

  if (teamBerry < 1000) {
    growthStage = '🥚 알';
    nextStage = '🐣 아기';
    nextTarget = 1000;
    percent = (teamBerry / 1000) * 100;
  } else if (teamBerry < 3000) {
    growthStage = '🐣 아기';
    nextStage = '👦 청소년';
    nextTarget = 3000;
    percent = ((teamBerry - 1000) / 2000) * 100;
  } else if (teamBerry < 6000) {
    growthStage = '👦 청소년';
    nextStage = '✨ 단짝 친구';
    nextTarget = 6000;
    percent = ((teamBerry - 3000) / 3000) * 100;
  } else if (teamBerry < 9000) {
    growthStage = '✨ 단짝 친구';
    nextStage = '🏆 수호령';
    nextTarget = 9000;
    percent = ((teamBerry - 6000) / 3000) * 100;
  } else {
    growthStage = '🏆 수호령';
    nextStage = 'MAX';
    nextTarget = 10000;
    percent = 100;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '1.25rem', padding: '0 4px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 800, background: 'var(--accent-blue-light)', padding: '2px 8px', borderRadius: '6px' }}>
          🏡 {houseName}
        </span>
        <h1 className="section-title" style={{ fontSize: '1.45rem', marginTop: '4px' }}>
          우리 방 대시보드
        </h1>
      </header>

      {/* 🐾 Emotional Pet Summary Card (Finch inspired) */}
      <div className="toss-card highlight animate-fade-in" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)',
        borderColor: '#eee7de',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          {petEmoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>{petName}의 정서 요약</span>
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              background: '#f2ece4',
              padding: '2px 8px',
              borderRadius: '10px',
              color: 'var(--text-sub)'
            }}>
              {moodEmoji} {moodText}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: 1.4 }}>
            {petEmoji} "{petName}가 오늘 {moodText} 상태로 집사를 기다리고 있어요!"
          </p>
        </div>
        <Link to="/pethouse" style={{
          textDecoration: 'none',
          fontSize: '0.74rem',
          fontWeight: 800,
          color: 'var(--accent-blue)',
          background: 'var(--accent-blue-light)',
          padding: '6px 12px',
          borderRadius: '12px',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease'
        }}>
          방 가기 ➔
        </Link>
      </div>

      {/* Relational Status Wording (Roommates' shared status) */}
      {(jackStatus === '📚 시험기간' || jackStatus === '😴 피곤함' || jackStatus === '🌙 야행성') && (
        <div className="toss-card animate-fade-in" style={{
          background: jackStatus === '📚 시험기간' ? 'var(--accent-red-light)' : jackStatus === '😴 피곤함' ? 'var(--accent-gold-light)' : '#fdfcfb',
          border: jackStatus === '📚 시험기간' ? '1.5px solid var(--accent-red)' : jackStatus === '😴 피곤함' ? '1.5px solid var(--accent-gold)' : '1px solid var(--card-border)',
          color: jackStatus === '📚 시험기간' ? 'var(--accent-red)' : jackStatus === '😴 피곤함' ? 'var(--accent-gold)' : 'var(--text-main)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          borderRadius: '20px'
        }}>
          <span style={{ fontSize: '1.8rem' }}>{jackStatus === '📚 시험기간' ? '📚' : jackStatus === '😴 피곤함' ? '😴' : '🌙'}</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 800 }}>
              {jackStatus === '📚 시험기간' ? '내가 현재 시험기간 상태를 룸메들에게 알렸습니다.' : jackStatus === '😴 피곤함' ? '내가 지금 매우 노곤한 상태임을 공유했습니다.' : '내가 밤중에 깨어있는 야행성 모드입니다.'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>
              {jackStatus === '📚 시험기간' ? `${petName}도 조용한 발걸음 모드로 걷고 있습니다. 소음 배려에 동참해 보아요.` : jackStatus === '😴 피곤함' ? `${petName}의 스트레스 방지를 위해 서로 따뜻한 격려를 전해 보세요.` : '늦은 밤 작은 불빛이나 문여닫는 소리에 세심하게 배려 중입니다.'}
            </p>
          </div>
        </div>
      )}

      {/* 🐧 Supportive Donation Ad Card */}
      {trust < 50 && (
        <div className="toss-card animate-fade-in" style={{
          background: 'linear-gradient(135deg, var(--accent-gold-light) 0%, #fff9db 100%)',
          border: '1.5px solid var(--accent-gold)',
          color: 'var(--text-main)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>☕</span>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {petName}의 에너지가 지쳐 있습니다.
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                가벼운 정서 보급을 시청해 룸메이트들과 따뜻하게 화해할 수 있는 <b>화해용 커피 선물 ☕</b> 아이템을 수령하세요! (친밀도 +15 즉시 회복)
              </p>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ background: 'var(--accent-gold)', color: '#ffffff', fontSize: '0.78rem', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleWatchAd('coffee')}
          >
            정서적 기프티콘 받기 (광고 30초)
          </button>
        </div>
      )}

      {/* 🎟 Recovery Ticket for Coco Streak */}
      {(trust < 20 || streak === 0) && (
        <div className="toss-card animate-fade-in" style={{
          background: 'linear-gradient(135deg, var(--accent-red-light) 0%, #fff5f5 100%)',
          border: '1.5px solid var(--accent-red)',
          color: 'var(--text-main)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎟</span>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                연속 돌봄 기록(Streak) 위기!
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                연속 돌봄 기록이 중단되었습니다. 지원 기프티콘을 통해 <b>코코 기록 복구권 🎟</b>을 보관함에 받아보세요.
              </p>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ background: 'var(--accent-red)', color: '#ffffff', fontSize: '0.78rem', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleWatchAd('ticket')}
          >
            기록 복구 티켓 받기 (광고 30초)
          </button>
        </div>
      )}


      {/* 🏠 PET EVOLUTION & COOPERATIVE REWARD POOL */}
      <div className="toss-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)', borderColor: '#eee7de' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🧬 {petName}의 성장 단계: <b style={{ color: 'var(--accent-blue)' }}>{growthStage}</b>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>
            다음 단계 ({nextStage}): {teamBerry} / {nextTarget} 🍓
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#f2ece4', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${percent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #ff8787 0%, #ff6b6b 100%)', 
            borderRadius: '4px',
            transition: 'width 0.5s ease-out' 
          }} />
        </div>

        <div style={{ 
          background: teamBerry >= 10000 ? 'var(--accent-green-light)' : '#fdfbf9', 
          border: teamBerry >= 10000 ? '1px solid var(--accent-green)' : '1px solid #f2ece4', 
          borderRadius: '16px', 
          padding: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <span style={{ fontSize: '1.6rem' }}>☕</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: teamBerry >= 10000 ? 'var(--accent-green)' : 'var(--text-main)' }}>
              {teamBerry >= 10000 ? '스타벅스 커피 쿠폰 언락!' : '집사 공동 협동 보상: 스타벅스 기프티콘'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', fontWeight: 500 }}>
              {teamBerry >= 10000 ? '쿠폰이 지급되었습니다. 우리 방 전원 획득!' : '함께 펫을 키워 10,000 베리를 채우면 구성원 전원에게 실제 커피 쿠폰이 발송됩니다.'}
            </div>
          </div>
        </div>
      </div>

      {/* Collective Signals Feed */}
      <div className="toss-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', borderColor: '#eee7de' }}>
        <h3 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📡 방 안의 잔잔한 신호 피드 (비처벌)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {signals.map(sig => (
            <div
              key={sig.id}
              style={{
                display: 'flex',
                alignItems: 'start',
                gap: '10px',
                padding: '12px',
                borderRadius: '16px',
                background: '#faf9f6',
                border: '1px solid #f2ece4'
              }}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>
                {sig.type === 'loss' ? '🕊️' : sig.type === 'warning' ? '🐾' : '💌'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.45 }}>
                  {sig.text}
                </p>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-sub)', fontWeight: 500, display: 'block', marginTop: '2px' }}>{sig.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relational Checklist */}
      <div className="toss-card highlight" style={{ background: '#ffffff', borderColor: '#eee7de' }}>
        <h2 style={{ fontSize: '1.0rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          🤝 오늘 {petName}와 방을 위한 돌봄 약속
        </h2>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          내가 할 수 있는 만큼 돌봄에 참여해보세요. 1명의 참여만으로도 {petName}는 행복해집니다.
        </p>

        {/* Quest check items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {quests.map(q => (
            <div
              key={q.id}
              className={`checklist-item ${q.completed ? 'checked' : ''}`}
              style={{ 
                margin: 0, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '14px 16px', 
                background: q.completed ? 'var(--accent-blue-light)' : '#faf9f6', 
                border: q.completed ? '1px solid #e0e7ff' : '1px solid #f2ece4',
                borderRadius: '18px'
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                onClick={() => toggleQuest(q.id)}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', border: q.completed ? 'none' : '2px solid #dcdad5',
                  background: q.completed ? 'var(--accent-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {q.completed && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
                </div>
                <span className="checklist-title" style={{ fontSize: '0.82rem', fontWeight: 600, color: q.completed ? 'var(--accent-blue)' : 'var(--text-main)' }}>
                  {q.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="checklist-points" style={{ cursor: 'pointer', fontSize: '0.68rem', color: q.completed ? 'var(--accent-blue)' : 'var(--accent-red)', fontWeight: 700 }} onClick={() => toggleQuest(q.id)}>
                  +{q.points * rewardMultiplier} 베리
                </span>
                {!q.completed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSkipClick(q.id); }}
                    style={{ background: '#ffffff', border: '1px solid #e2ded8', padding: '5px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-sub)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    미루기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-cta" onClick={handleCompleteAll} style={{ background: '#faf9f6', color: 'var(--text-main)', border: '1px solid #f2ece4', fontSize: '0.8rem', padding: '12px', borderRadius: '14px', cursor: 'pointer' }}>
          오늘 돌봄 행동 일괄 완료 처리 (친밀도 +12)
        </button>
      </div>

      {/* Flash Event Missions Card */}
      {flashSeconds > 0 && (
        <div className="flash-card animate-fade-in" style={{ opacity: trust < 50 ? 0.5 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.4)', padding: '4px 8px', borderRadius: '8px', color: '#e65100' }}>
              {petName}가 전하는 깜짝 메시지
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#ffffff', color: '#e65100', padding: '3px 8px', borderRadius: '8px', fontFamily: 'monospace' }}>
              ⏱ {formatTime(flashSeconds)}
            </span>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: '#d84315' }}>
            방 구석 휴지통을 가볍게 비워주실 분 있나요?
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#ef6c00', lineHeight: 1.4, margin: '0 0 14px 0', fontWeight: 500 }}>
            누구든 지금 손이 남는 집사가 비워주면, {petName}가 친밀도 Berry를 보급 주머니에 넉넉히 담아 드릴게요.
          </p>

          <button
            className="btn-cta btn-secondary"
            onClick={toggleFlashQuest}
            style={{
              background: flashCompleted ? 'rgba(255,255,255,0.5)' : '#ffffff',
              color: flashCompleted ? '#e65100' : '#d84315',
              border: 'none',
              padding: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: trust < 50 ? 'not-allowed' : 'pointer'
            }}
            disabled={flashCompleted || trust < 50}
          >
            {trust < 50 ? `💤 ${petName}가 휴식 중이라 닫힘` : flashCompleted ? `✅ ${petName}와 더 친해졌어요! (+${40 * rewardMultiplier} 베리)` : `제가 챙겨줄게요 (+${40 * rewardMultiplier} 베리)`}
          </button>
        </div>
      )}

      {/* Non-confrontational Pause/Skip Modal */}
      {showSkipWarning !== null && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '30px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍀</div>
            <h2 className="toss-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              지금 바쁜 일정이 있으신가요?
            </h2>
            <p className="toss-modal-desc" style={{ fontSize: '0.85rem', marginBottom: '24px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              바쁘거나 힘든 시기라면 미루셔도 전혀 괜찮습니다.<br />
              미루기는 집사 공동체의 자연스러운 완급조절이며, 룸메이트에게 어떠한 감시 알림이나 벌점을 알리지 않습니다. 나중에 한가할 때 챙겨주세요.
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
                onClick={() => applySkipPunishment(showSkipWarning)}
                style={{ flex: 1, background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #dbe5ff' }}
              >
                바빠서 미룰래요
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Daily Surprise Gift Modal */}
      {showDailyModal && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '30px 24px' }}>
            <h2 className="toss-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ✉️ {petName}가 보낸 아침 편지
            </h2>
            <p className="toss-modal-desc" style={{ fontSize: '0.82rem', marginBottom: '24px', color: 'var(--text-sub)' }}>
              오늘도 은은한 조화를 만들어 가시는 집사님을 위해 {petName}가 보급 Berry를 품고 찾아왔어요.
            </p>

            <div style={{ margin: '20px 0' }}>
              <div
                className="supercell-box"
                onClick={handleOpenLootbox}
                style={{
                  fontSize: '4.5rem',
                  filter: boxState === 'closed' ? 'drop-shadow(0 4px 12px rgba(74, 108, 247, 0.15))' : 'none'
                }}
              >
                {boxState === 'closed' ? '✉️' : '🐟'}
              </div>
            </div>

            {boxState === 'open' && lootReward && (
              <div className="animate-fade-in" style={{ background: 'var(--accent-blue-light)', border: '1px solid #dbe5ff', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  보급 편지 획득!
                </span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>{lootReward}</strong>
              </div>
            )}

            <button
              className="btn-cta"
              onClick={boxState === 'open' ? handleCloseDaily : handleOpenLootbox}
              style={{ width: '100%', background: boxState === 'open' ? '#f4f3f0' : 'var(--accent-blue)', color: boxState === 'open' ? 'var(--text-main)' : '#ffffff' }}
            >
              {boxState === 'open' ? "닫기" : "보급 편지 열기"}
            </button>
          </div>
        </div>
      )}

      {/* Simulated Ad Modal (Caring Donations for Coco) */}
      {adModalType !== null && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 9999 }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '40px 24px', background: '#1e293b', color: '#ffffff', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#8b95a1', marginBottom: '20px', letterSpacing: '1px' }}>
              {petName.toUpperCase()}'S SUPPORT FUND
            </div>

            <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', borderRadius: '16px', margin: '20px 0', position: 'relative', overflow: 'hidden' }}>
              {adLoading ? (
                <>
                  <div className="danger-pulse" style={{ fontSize: '3rem', marginBottom: '14px' }}>📺</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e5e8eb' }}>정서 보급품 로딩 중... (남은 시간: 2초)</div>
                  <div style={{ fontSize: '0.72rem', color: '#8b95a1', marginTop: '6px' }}>{petName}의 정서 완화 간식이 발송 중입니다.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🐟</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-green)' }}>지급 완료!</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b95a1', marginTop: '4px' }}>지원 물품이 집사 보관함에 전달되었습니다.</div>
                </>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#8b95a1', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              RoomPeace는 관계 속의 피로를 줄입니다.<br />
              본 보급소 지원은 오직 정서 회복과 커피 힐링용 도구만을 제공하며,<br />
              <b>상대방에게 특정한 노동을 물리적으로 강제하거나 감시하지 않습니다.</b>
            </p>

            <button
              className="btn-cta"
              style={{ width: '100%', background: adLoading ? '#334155' : 'var(--accent-blue)', color: '#ffffff', cursor: adLoading ? 'not-allowed' : 'pointer' }}
              disabled={adLoading}
              onClick={() => setAdModalType(null)}
            >
              {adLoading ? "로딩 중..." : "아이템 수령하고 돌아가기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
