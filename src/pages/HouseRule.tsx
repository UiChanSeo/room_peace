import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Rule {
  id: number;
  title: string;
  desc: string;
  points: number;
  signed: boolean;
  signedBy: string[];
}

export default function HouseRule() {
  const [isPremium, setIsPremium] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 1,
      title: "24시간 이내 설거지 완료하기",
      desc: "개수대에 더러운 접시를 방치하지 않고, 사용한 컵은 즉시 물로 헹굽니다.",
      points: 15,
      signed: true,
      signedBy: ['Jack', 'Will', '나 (You)']
    },
    {
      id: 2,
      title: "쓰레기통이 차면 즉시 비우기",
      desc: "공용 종량제 봉투와 재활용 박스가 차면 즉시 분리수거하여 비웁니다.",
      points: 20,
      signed: false,
      signedBy: ['Jack', 'Will']
    },
    {
      id: 3,
      title: "매주 주말 화장실 공동 청소",
      desc: "공용 욕실 바닥과 세면대를 청소하여 쾌적한 위생 상태를 유지합니다.",
      points: 30,
      signed: false,
      signedBy: ['Will']
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
  }, []);

  const rewardMultiplier = isPremium ? 2 : 1;

  const toggleSign = (id: number) => {
    setRules(rules.map(rule => {
      if (rule.id === id) {
        const isSigned = !rule.signed;
        const myName = '나 (You)';
        
        // Double reward for premium pass users
        const finalReward = rule.points * rewardMultiplier;
        const pointsDelta = isSigned ? finalReward : -finalReward;
        
        const currentBerry = parseInt(localStorage.getItem('roompeace_berry') || '1250');
        localStorage.setItem('roompeace_berry', (currentBerry + pointsDelta).toString());
        
        let trustMsg = "";
        if (isSigned) {
          const currentTrust = parseInt(localStorage.getItem('roompeace_trust') || '100');
          const newTrust = currentTrust + 2;
          localStorage.setItem('roompeace_trust', newTrust.toString());
          trustMsg = " (신뢰도 +2 회복)";
        }

        // Trigger status bar refresh
        window.dispatchEvent(new Event('storage'));

        // Custom Toast msg
        const toastMsg = isSigned ? 
          `🌿 [${rule.title}] 약속 동의! +${finalReward} 베리 적립${trustMsg} ${isPremium ? '(2배 적용!)' : ''}` :
          `⚠️ [${rule.title}] 약속 동의 해제 (-${finalReward} 베리)`;

        window.dispatchEvent(new CustomEvent('roompeace_toast', {
          detail: { message: toastMsg }
        }));

        return {
          ...rule,
          signed: isSigned,
          signedBy: isSigned ? [...rule.signedBy, myName] : rule.signedBy.filter(name => name !== myName)
        };
      }
      return rule;
    }));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRule: Rule = {
      id: Date.now(),
      title: newTitle,
      desc: newDesc || "룸메이트 간의 배려와 평화를 지키기 위한 공동 생활 약속입니다.",
      points: 10,
      signed: false,
      signedBy: ['나 (You)']
    };
    setRules([...rules, newRule]);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);

    window.dispatchEvent(new CustomEvent('roompeace_toast', {
      detail: { message: "📜 새로운 공동 생활 약속이 제안되었습니다!" }
    }));
  };

  const keptCount = rules.filter(r => r.signed).length;

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <span className="mini-badge" style={{ marginBottom: '6px' }}>📜 공동 생활 수칙</span>
        <h1 className="section-title">우리 방 약속</h1>
        <p className="section-subtitle" style={{ margin: 0 }}>
          룸메이트들과 합의하여 지정한 배려와 존중의 약속 리스트입니다.
        </p>
      </header>

      {/* Rules compliance progress */}
      <div className="toss-card highlight" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', color: '#1b64da', marginBottom: '8px' }}>
          <span>약속 서명률</span>
          <span>{keptCount} / {rules.length} 완료</span>
        </div>
        <div className="bar-container" style={{ height: '8px', margin: 0 }}>
          <div className="bar-fill" style={{ width: `${(keptCount / rules.length) * 100}%`, background: '#1b64da' }}></div>
        </div>
      </div>

      {/* Rules list with padding-bottom to clear the sticky button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '90px' }}>
        {rules.map((rule) => (
          <div 
            key={rule.id} 
            className="toss-card" 
            style={{ 
              marginBottom: 0, 
              borderLeft: rule.signed ? '4px solid #1b64da' : '1px solid #f1f3f5',
              background: rule.signed ? '#f8faff' : '#ffffff',
              cursor: 'pointer'
            }}
            onClick={() => toggleSign(rule.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className={`mini-badge ${rule.signed ? 'success' : ''}`}>
                {rule.signed ? '🌿 동의 완료' : '📜 서명 대기'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1b64da' }}>+{rule.points * rewardMultiplier} 베리</span>
            </div>

            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: '0 0 6px 0', color: '#191f28' }}>{rule.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#4e5968', lineHeight: 1.45, margin: '0 0 12px 0', fontWeight: 500 }}>{rule.desc}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f5', paddingTop: '8px', fontSize: '0.72rem', color: '#8b95a1' }}>
              <span>참여인원:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {rule.signedBy.map((name, idx) => (
                  <span 
                    key={idx} 
                    style={{ background: '#f1f3f5', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold', color: '#4e5968' }}
                  >
                    {name.includes('나') || name === 'You' ? '나' : name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FIXED DOCKING BUTTON CONSTRAINED WITHIN MOCKUP CONTAINER */}
      <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', zIndex: 90 }}>
        <button 
          className="btn-cta" 
          onClick={() => setShowAddModal(true)}
          style={{ width: '100%', borderRadius: '20px', boxShadow: '0 8px 24px rgba(27, 100, 218, 0.25)' }}
        >
          <Plus size={20} /> 새로운 약속 제안하기
        </button>
      </div>

      {/* Simplified Modal */}
      {showAddModal && (
        <div className="toss-modal-backdrop">
          <div className="toss-modal-content">
            <h2 className="toss-modal-title">📜 새로운 약속 제안</h2>
            <p className="toss-modal-desc">함께 지킬 공동 생활 약속의 제목과 내용을 작성해 주세요.</p>
            
            <form onSubmit={handleAddRule}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="약속 제목 (예: 화장실 분리수거)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <textarea 
                  placeholder="구체적인 약속 규칙 내용을 적어주세요..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                  rows={3}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ border: 'none', background: '#f1f3f5', padding: '10px 16px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  닫기
                </button>
                <button type="submit" className="btn-cta" style={{ width: 'auto', padding: '10px 20px', borderRadius: '12px', fontSize: '0.82rem' }}>
                  제안
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
