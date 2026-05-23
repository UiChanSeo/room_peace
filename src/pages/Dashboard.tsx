import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QUEST_TEMPLATES } from './questsData';

interface Quest {
  id: string;
  title: string;
  desc: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  contribution: number;
  completed: boolean;
}

interface Signal {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'success';
  time: string;
}

export default function Dashboard() {
  const [isPremium, setIsPremium] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);

  // House Identity
  const [houseName, setHouseName] = useState('달빛 펭귄 하우스 🏠');
  const [petName, setPetName] = useState('루미');
  const [petEmoji, setPetEmoji] = useState('🐶');

  // Stats
  const [trust, setTrust] = useState(100); // Represents "우리방 온도"
  const [streak, setStreak] = useState(14);
  const [jackStatus, setJackStatus] = useState('🙂 평온함');
  const [teamBerry, setTeamBerry] = useState(8420);

  // Skip Modal state
  const [showSkipWarning, setShowSkipWarning] = useState<string | null>(null);

  // Flash Event state (Lumi's sudden request)
  const [flashCompleted, setFlashCompleted] = useState(false);
  const [flashSeconds, setFlashSeconds] = useState(860);

  // Daily surprise box states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [boxState, setBoxState] = useState<'closed' | 'open'>('closed');
  const [lootReward, setLootReward] = useState<string | null>(null);

  // Rewarded Ads state
  const [adModalType, setAdModalType] = useState<'coffee' | 'ticket' | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  // House Signals (Emotional Collective Feed in Gen-Z tone)
  const [signals] = useState<Signal[]>([
    { id: 1, text: "Will 집사님이 루미에게 간식을 던져주고 고맙다는 엽서를 남겼어요 💌", type: "info", time: "2시간 전" },
    { id: 2, text: "요즘 집 분위기 살짝 축 처진 거 같지 않음...? 다들 피곤한가봄 🥺 루미가 기분 UP 시킬 퀘스트를 기다려요!", type: "warning", time: "오늘" },
    { id: 3, text: "우리 룸메이트들 14일 연속 평화 스트릭 유지 중! 이 기세로 쭉 가보자고 🔥", type: "success", time: "오늘" }
  ]);

  // Load and sync localStorage
  useEffect(() => {
    const handleSync = () => {
      setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
      setHouseName(localStorage.getItem('roompeace_house_name') || '달빛 펭귄 하우스 🏠');
      setPetName(localStorage.getItem('roompeace_pet_name') || '루미');
      setPetEmoji(localStorage.getItem('roompeace_pet_emoji') || '🐶');

      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setStreak(parseInt(localStorage.getItem('roompeace_streak') || '14'));
      setJackStatus(localStorage.getItem('roompeace_my_status') || '🙂 평온함');
      setTeamBerry(parseInt(localStorage.getItem('roompeace_team_berry') || '8420'));

      // Load active quests
      const storedQuests = localStorage.getItem('roompeace_active_quests');
      if (storedQuests) {
        setQuests(JSON.parse(storedQuests));
      } else {
        // Default 6 quests if empty
        const defaultStarter = QUEST_TEMPLATES.slice(0, 6).map(q => ({
          ...q,
          completed: false
        }));
        localStorage.setItem('roompeace_active_quests', JSON.stringify(defaultStarter));
        setQuests(defaultStarter);
      }
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

  const rewardMultiplier = (isPremium && trust >= 80) ? 2 : 1;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOpenLootbox = () => {
    if (boxState === 'open') return;

    const rewards = ['+20 베리 보너스 🍒', '루미 영양 캔 간식 🍖', '루미 전용 노란 양말 🧦'];
    const chosen = rewards[Math.floor(Math.random() * rewards.length)];
    setLootReward(chosen);
    setBoxState('open');

    let bonusBerry = 50;
    if (chosen === '+20 베리 보너스 🍒') {
      bonusBerry = 70;
    }

    if (trust >= 130) bonusBerry = 100;
    else if (trust >= 80) bonusBerry = 50;
    else if (trust >= 40) bonusBerry = 20;
    else bonusBerry = 10;

    const finalReward = bonusBerry * rewardMultiplier;
    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + finalReward;

    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
    const newTeamBerry = Math.min(10000, currentTeamBerry + Math.round(finalReward * 0.5));
    localStorage.setItem('roompeace_team_berry', newTeamBerry.toString());

    addDiaryLog(`루미의 선물상자에서 [${chosen}]을(를) 획득하여 집사 지갑에 베리가 보충되었습니다.`);

    window.dispatchEvent(new Event('storage'));

    const toastMsg = `🎁 [${chosen}] 획득! 펫 하우스를 꾸밀 +${finalReward} 베리가 적립되었습니다.`;
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

  const toggleQuest = (id: string) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    const isNowCompleted = !targetQuest.completed;
    const updatedQuests = quests.map(q => q.id === id ? { ...q, completed: isNowCompleted } : q);
    setQuests(updatedQuests);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updatedQuests));

    const finalPoints = targetQuest.points * rewardMultiplier;
    const pointsDelta = isNowCompleted ? finalPoints : -finalPoints;

    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = Math.max(0, currentBerry + pointsDelta);
    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTeamBerry = parseInt(localStorage.getItem('roompeace_team_berry') || '8420');
    const teamDelta = isNowCompleted ? Math.round(finalPoints * 0.5) : -Math.round(finalPoints * 0.5);
    const newTeamBerry = Math.max(0, Math.min(10000, currentTeamBerry + teamDelta));
    localStorage.setItem('roompeace_team_berry', newTeamBerry.toString());

    // Update Room Atmosphere score (trust)
    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const trustDelta = isNowCompleted ? targetQuest.contribution : -targetQuest.contribution;
    const newTrust = Math.max(0, Math.min(150, currentTrust + trustDelta));
    localStorage.setItem('roompeace_trust', newTrust.toString());
    setTrust(newTrust);

    if (isNowCompleted) {
      addDiaryLog(`이 정도면 ㄹㅇ 에이스! 집사 잭(나)이 [${targetQuest.title}] 퀘스트를 격파해 방 온도가 올라갔습니다.`);
    }

    window.dispatchEvent(new Event('storage'));

    const toastMsg = isNowCompleted
      ? `🎉 [${targetQuest.title}] 격파 완료! 우리방 온도 +${targetQuest.contribution}도 및 +${finalPoints} 베리 적립!`
      : `퀘스트 상태가 환기되었습니다.`;

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: toastMsg }
    }));
  };

  const handleSkipClick = (id: string) => {
    setShowSkipWarning(id);
  };

  const applySkipPunishment = (id: string) => {
    const targetQuest = quests.find(q => q.id === id);
    if (!targetQuest) return;

    // Cozy Delay: mark as completed or paused to avoid surveillance feel
    const updatedQuests = quests.map(q => q.id === id ? { ...q, completed: true } : q);
    setQuests(updatedQuests);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updatedQuests));

    addDiaryLog(`바쁜 일정 때문에 [${targetQuest.title}] 퀘스트를 다음으로 미뤘습니다. 다들 힘들 땐 쉬는 거지 🍀`);

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🐾 [${targetQuest.title}] 미루기 완료! 다음번에 여유로울 때 챙겨주세요.` }
    }));

    setShowSkipWarning(null);
  };

  const toggleFlashQuest = () => {
    if (flashCompleted) return;

    if (trust < 40) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `💤 루미가 방 온도가 너무 싸늘해 삐져 있습니다 🥺 먼저 방 퀘스트를 완료해 온도를 높여주세요.` }
      }));
      return;
    }

    setFlashCompleted(true);
    let baseReward = 40;
    if (trust < 80) baseReward = 20;
    if (trust < 40) baseReward = 10;

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

    addDiaryLog(`깜짝 돌봄 [루미의 물그릇 갈아주기] 완수! 루미의 꼬리가 헬리콥터처럼 돌아갑니다 🐶`);

    window.dispatchEvent(new Event('storage'));

    const flashMsg = `⚡ 깜짝 물그릇 갈기 격파! 우리방 온도 +5도 및 +${finalReward} 베리 획득!`;
    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: flashMsg }
    }));
  };

  const handleCompleteAll = () => {
    const uncompletedQuests = quests.filter(q => !q.completed);
    if (uncompletedQuests.length === 0) {
      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: "오늘의 모든 방 퀘스트를 이미 깨부쉈습니다! ⚡" }
      }));
      return;
    }

    const earnedBasePoints = uncompletedQuests.reduce((sum, q) => sum + q.points, 0);
    const earnedBerry = earnedBasePoints * rewardMultiplier;
    const earnedContribution = uncompletedQuests.reduce((sum, q) => sum + q.contribution, 0);

    const updated = quests.map(q => ({ ...q, completed: true }));
    setQuests(updated);
    localStorage.setItem('roompeace_active_quests', JSON.stringify(updated));

    const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '320');
    const newBerry = currentBerry + earnedBerry;
    localStorage.setItem('roompeace_berry', newBerry.toString());

    const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
    const newTrust = Math.min(150, currentTrust + earnedContribution);
    localStorage.setItem('roompeace_trust', newTrust.toString());
    setTrust(newTrust);

    addDiaryLog(`오늘 하루 모든 퀘스트 일괄 완료! 룸 전체 온도가 후끈후끈해졌습니다.`);

    window.dispatchEvent(new Event('storage'));

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: `🎉 전체 가사 퀘스트 올 클리어! 루미 친밀도 +${earnedContribution}도 쑥쑥 상승!` }
    }));
  };

  const handleWatchAd = (type: 'coffee' | 'ticket') => {
    setAdModalType(type);
    setAdLoading(true);

    setTimeout(() => {
      setAdLoading(false);

      const currentInv = JSON.parse(localStorage.getItem('roompeace_inventory') || '{}');
      const itemId = type === 'coffee' ? 2 : 6;
      currentInv[itemId] = (currentInv[itemId] || 0) + 1;
      localStorage.setItem('roompeace_inventory', JSON.stringify(currentInv));

      window.dispatchEvent(new Event('storage'));

      const itemName = type === 'coffee' ? '화해용 커피 선물 ☕' : '루미 기록 복구 티켓 🎟';

      window.dispatchEvent(new CustomEvent('roompeace_toast', {
        detail: { message: `🎁 보급 완료! [${itemName}]이(가) 인벤토리에 들어왔습니다. 메이트들과 나누어보세요!` }
      }));

      setAdModalType(null);
    }, 2000);
  };

  // Real-time Atmosphere Mapping
  let atmosphereEmoji = '😐';
  let atmosphereText = '애매함';
  let atmosphereDescription = `다들 무난무난하게 지내는 중! 가벼운 청소 퀘스트로 루미를 놀아주세요 🐾`;

  if (trust >= 130) {
    atmosphereEmoji = '🔥';
    atmosphereText = '최고의 팀워크';
    atmosphereDescription = `이 방 분위기 ㄹㅇ 폼 미쳤다! 서로 배려 가득한 레전드 하우스 ✨`;
  } else if (trust >= 80) {
    atmosphereEmoji = '😊';
    atmosphereText = '훈훈함';
    atmosphereDescription = `서로 한발짝 양보하며 따뜻한 온기가 가득한 마이룸 🌿`;
  } else if (trust < 40) {
    atmosphereEmoji = '😡';
    atmosphereText = '냉전 상태';
    atmosphereDescription = `최근 다들 바빠서 그런가 방 온도가 뚝 식었어요... 🥺 퀘스트로 평화를 찾자고!`;
  }

  // Growth Stage Mapping
  let growthStage = '🐣 아기 강아지';
  let nextStage = '👦 청소년 멍뭉';
  let nextTarget = 1000;
  let percent = 0;

  if (teamBerry < 1000) {
    growthStage = '🐣 아기 강아지';
    nextStage = '👦 청소년 멍뭉';
    nextTarget = 1000;
    percent = (teamBerry / 1000) * 100;
  } else if (teamBerry < 3000) {
    growthStage = '👦 청소년 멍뭉';
    nextStage = '🐕 늠름한 청년견';
    nextTarget = 3000;
    percent = ((teamBerry - 1000) / 2000) * 100;
  } else if (teamBerry < 6000) {
    growthStage = '🐕 늠름한 청년견';
    nextStage = '✨ 우리집 수호천사';
    nextTarget = 6000;
    percent = ((teamBerry - 3000) / 3000) * 100;
  } else {
    growthStage = '🏆 레전드 파트너';
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
          오늘의 하우스 일상
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
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>우리방 온도: {atmosphereEmoji} {atmosphereText}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-sub)', fontWeight: 600, lineHeight: 1.4 }}>
            {atmosphereDescription}
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
          방 가보기 ➔
        </Link>
      </div>

      {/* Relational Status Wording */}
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
              {jackStatus === '📚 시험기간' ? '나 지금 열공 모드(시험기간) 켜두었어요 📝' : jackStatus === '😴 피곤함' ? '나 지금 완전 기절 직전(피곤함) 켜두었어요 😴' : '나 밤중에 사부작사부작 야행성 모드예요 🌙'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>
              {jackStatus === '📚 시험기간' ? `루미도 발소리를 조용조용 내는 중! 메이트들도 배려 모드에 동참해줘서 든든함 📚` : jackStatus === '😴 피곤함' ? `루미의 애교를 보며 힐링하는 중! 다들 지쳤을 때 한 템포 가사 퀘스트를 조절해봐요.` : '늦은 밤 삐걱거리는 문고리나 조명 불빛에 조용히 배려하고 있습니다.'}
            </p>
          </div>
        </div>
      )}

      {/* Supportive Donation Ad Card */}
      {trust < 40 && (
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
                방 안의 분위기가 싸늘해요... 🥺
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                메이트 간의 미묘한 긴장을 녹여줄 <b>화해용 커피 선물 ☕</b> 보급품을 챙겨보세요! 루미가 꼬리를 흔들며 전달해줄 거예요.
              </p>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ background: 'var(--accent-gold)', color: '#ffffff', fontSize: '0.78rem', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleWatchAd('coffee')}
          >
            커피 기프티콘 받아두기 (30초 보급 광고)
          </button>
        </div>
      )}

      {/* Recovery Ticket for Streak */}
      {streak === 0 && (
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
                우리방 연속 기록(Streak)이 초기화됨!
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 600 }}>
                연속 돌봄 기록이 중단되어 속상한가요? 광고 보급품을 통해 <b>루미 기록 복구권 🎟</b>을 획득해 스트릭을 살려보세요!
              </p>
            </div>
          </div>
          <button
            className="btn-cta"
            style={{ background: 'var(--accent-red)', color: '#ffffff', fontSize: '0.78rem', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleWatchAd('ticket')}
          >
            스트릭 복구권 받기 (30초 보급 광고)
          </button>
        </div>
      )}

      {/* 🏠 PET EVOLUTION & COOPERATIVE REWARD POOL */}
      <div className="toss-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)', borderColor: '#eee7de' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🧬 {petName}의 성장: <b style={{ color: 'var(--accent-blue)' }}>{growthStage}</b>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-sub)', fontWeight: 600 }}>
            다음 레벨 ({nextStage}): {teamBerry} / {nextTarget} 🍓
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#f2ece4', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${percent}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #818cf8 0%, #4f46e5 100%)', 
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
              {teamBerry >= 10000 ? '🎉 커피 쿠폰 언락 성공!' : '우리 메이트 공동 보상: 스타벅스 기프티콘'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)', fontWeight: 500 }}>
              {teamBerry >= 10000 ? '보급품을 다운로드 받으세요. 메이트들과 함께 고생 많았어요!' : '메이트들과 협동 퀘스트로 10,000 베리를 채우면 전원에게 모바일 커피쿠폰을 쏩니다!'}
            </div>
          </div>
        </div>
      </div>

      {/* Collective Signals Feed */}
      <div className="toss-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', borderColor: '#eee7de' }}>
        <h3 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📡 우리방 훈훈 소식통 (피드)
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
                {sig.type === 'success' ? '🔥' : sig.type === 'warning' ? '🐾' : '💌'}
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
          🤝 오늘 우리방 퀘스트
        </h2>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 500 }}>
          각자 무리하지 말고 가능한 만큼 퀘스트를 격파해보세요. 한 명의 작은 배려가 방의 온도를 높여요.
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
                  background: q.completed ? 'var(--accent-blue)' : 'transparent', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {q.completed && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <span className="checklist-title" style={{ fontSize: '0.82rem', fontWeight: 600, color: q.completed ? 'var(--accent-blue)' : 'var(--text-main)', textDecoration: q.completed ? 'line-through' : 'none' }}>
                    {q.title}
                  </span>
                  <span style={{ 
                    fontSize: '0.58rem', 
                    marginLeft: '8px',
                    color: q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                    background: q.difficulty === 'easy' ? '#d1fae5' : q.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: 800
                  }}>
                    {q.difficulty === 'easy' ? '쉬움' : q.difficulty === 'medium' ? '보통' : '어려움'}
                  </span>
                </div>
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
          오늘 방 퀘스트 전부 일괄 격파 처리 🔥 (우리방 온도 상승!)
        </button>
      </div>

      {/* Flash Event Missions Card */}
      {flashSeconds > 0 && (
        <div className="flash-card animate-fade-in" style={{ opacity: trust < 40 ? 0.5 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.4)', padding: '4px 8px', borderRadius: '8px', color: '#e65100' }}>
              💡 루미의 다급한 꼬리침
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#ffffff', color: '#e65100', padding: '3px 8px', borderRadius: '8px', fontFamily: 'monospace' }}>
              ⏱ {formatTime(flashSeconds)}
            </span>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px 0', color: '#d84315' }}>
            거실 물티슈 다 썼는데 새 팩 뜯어주실 분? 💦
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#ef6c00', lineHeight: 1.4, margin: '0 0 14px 0', fontWeight: 500 }}>
            누구든 지금 거실에 물티슈 새거 꺼내주면 루미가 보급 베리를 왕창 챙겨드릴게요!
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
              cursor: trust < 40 ? 'not-allowed' : 'pointer'
            }}
            disabled={flashCompleted || trust < 40}
          >
            {trust < 40 ? `💤 루미가 삐쳐 있어서 닫힘` : flashCompleted ? `✅ 루미가 격렬히 반겨요! (+${40 * rewardMultiplier} 베리)` : `제가 할게요! (+${40 * rewardMultiplier} 베리)`}
          </button>
        </div>
      )}

      {/* Non-confrontational Pause/Skip Modal */}
      {showSkipWarning !== null && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '30px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍀</div>
            <h2 className="toss-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              바쁜 일정이 있으신가요?
            </h2>
            <p className="toss-modal-desc" style={{ fontSize: '0.85rem', marginBottom: '24px', color: 'var(--text-sub)', lineHeight: 1.5 }}>
              바쁘시다면 미루셔도 전혀 괜찮습니다! 🍀<br />
              미루기는 집사 메이트 간의 조율일 뿐이며, 메이트들에게 어떠한 감시나 벌점을 통보하지 않아요.
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
                미뤄둘래요
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
              ✉️ {petName}가 물어온 편지봉투
            </h2>
            <p className="toss-modal-desc" style={{ fontSize: '0.82rem', marginBottom: '24px', color: 'var(--text-sub)' }}>
              오늘 하루도 잘 버텨낸 메이트님들을 위해 {petName}가 보급 베리를 챙겨왔어요!
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
                {boxState === 'closed' ? '✉️' : '🍖'}
              </div>
            </div>

            {boxState === 'open' && lootReward && (
              <div className="animate-fade-in" style={{ background: 'var(--accent-blue-light)', border: '1px solid #dbe5ff', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  편지 봉투 개봉!
                </span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>{lootReward}</strong>
              </div>
            )}

            <button
              className="btn-cta"
              onClick={boxState === 'open' ? handleCloseDaily : handleOpenLootbox}
              style={{ width: '100%', background: boxState === 'open' ? '#f4f3f0' : 'var(--accent-blue)', color: boxState === 'open' ? 'var(--text-main)' : '#ffffff' }}
            >
              {boxState === 'open' ? "닫기" : "보급 편지 열어보기"}
            </button>
          </div>
        </div>
      )}

      {/* Simulated Ad Modal */}
      {adModalType !== null && (
        <div className="toss-modal-backdrop" style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 9999 }}>
          <div className="toss-modal-content text-center animate-fade-in" style={{ textAlign: 'center', padding: '40px 24px', background: '#1e293b', color: '#ffffff', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#8b95a1', marginBottom: '20px', letterSpacing: '1px' }}>
              {petName.toUpperCase()}'S SUPPORT BOOSTER
            </div>

            <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', borderRadius: '16px', margin: '20px 0', position: 'relative', overflow: 'hidden' }}>
              {adLoading ? (
                <>
                  <div className="danger-pulse" style={{ fontSize: '3rem', marginBottom: '14px' }}>📺</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#e5e8eb' }}>루미의 힐링 주머니 포장 중... (2초)</div>
                  <div style={{ fontSize: '0.72rem', color: '#8b95a1', marginTop: '6px' }}>우리 메이트들을 챙겨줄 아이템이 배송 중입니다.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🍖</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-green)' }}>전송 완료!</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b95a1', marginTop: '4px' }}>인벤토리를 확인해보세요.</div>
                </>
              )}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#8b95a1', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              본 보급 지원은 오직 정서 힐링과 커피 교감만을 목적으로 하며,<br />
              <b>메이트 간에 벌점 부과나 강제적 노동 감시를 원천 금지합니다.</b>
            </p>

            <button
              className="btn-cta"
              style={{ width: '100%', background: adLoading ? '#334155' : 'var(--accent-blue)', color: '#ffffff', cursor: adLoading ? 'not-allowed' : 'pointer' }}
              disabled={adLoading}
              onClick={() => setAdModalType(null)}
            >
              {adLoading ? "로딩 중..." : "수령하고 돌아가기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
