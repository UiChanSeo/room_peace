import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import PeaceCard from './pages/PeaceCard';
import Crew from './pages/Crew.tsx';
import CharacterGrowth from './pages/CharacterGrowth';
import PetHouse from './pages/PetHouse';
import { Home, Send, Users, User, Dog } from 'lucide-react';
import { useEffect, useState } from 'react';

// Shared Status Bar for the top of the mobile screen
function TopStatusBar() {
  const location = useLocation();
  const [isPremium, setIsPremium] = useState(false);
  const [trust, setTrust] = useState(100);

  useEffect(() => {
    const handleStorage = () => {
      // Initialize states if not exists
      if (!localStorage.getItem('roompeace_berry')) localStorage.setItem('roompeace_berry', '320');
      if (!localStorage.getItem('roompeace_trust')) localStorage.setItem('roompeace_trust', '100');
      if (!localStorage.getItem('roompeace_streak')) localStorage.setItem('roompeace_streak', '14');
      if (!localStorage.getItem('roompeace_offense_count')) localStorage.setItem('roompeace_offense_count', '0');
      
      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
      setIsPremium(localStorage.getItem('roompeace_premium') === 'true');
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  // Hide on onboarding
  if (location.pathname === '/' || location.pathname === '/onboarding') return null;

  const isLowTrust = trust < 50;

  return (
    <div className={`status-bar animate-fade-in ${isLowTrust ? 'low-trust' : ''}`} style={isLowTrust ? { backgroundColor: '#fff5f5', borderBottomColor: '#ffe3e3' } : {}}>
      <div className="status-profile">
        <Link to="/character" style={{ textDecoration: 'none' }}>
          <div className="status-avatar">{isPremium ? "👑" : "🌿"}</div>
        </Link>
        <div className="status-info">
          <span className="status-title" style={isLowTrust ? { color: '#ff5252' } : {}}>
            우리 방
            {isPremium && <span style={{ marginLeft: '4px', fontSize: '0.62rem', background: '#ffe3e3', color: '#ff6f61', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>PASS</span>}
          </span>
          <span className="status-subtitle" style={isLowTrust ? { color: '#ff8a8a' } : {}}>평화로운 공간</span>
        </div>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();

  if (location.pathname === '/' || location.pathname === '/onboarding') return null;

  return (
    <nav className="bottom-nav">
      <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
        <Home size={22} />
        <span>홈</span>
      </Link>
      <Link to="/pethouse" className={location.pathname === '/pethouse' ? 'active' : ''}>
        <Dog size={22} />
        <span>펫하우스</span>
      </Link>
      <Link to="/peacecard" className={location.pathname === '/peacecard' ? 'active' : ''}>
        <Send size={22} />
        <span>소통</span>
      </Link>
      <Link to="/crew" className={location.pathname === '/crew' ? 'active' : ''}>
        <Users size={22} />
        <span>우리방</span>
      </Link>
      <Link to="/character" className={location.pathname === '/character' ? 'active' : ''}>
        <User size={22} />
        <span>마이</span>
      </Link>
    </nav>
  );
}

// Simple Toast message display wrapper
function ToastContainer() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setToast(customEvent.detail.message);
    };
    window.addEventListener('roompeace_toast', handleToast);
    return () => window.removeEventListener('roompeace_toast', handleToast);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="toss-toast">
      <span>{toast}</span>
    </div>
  );
}

function App() {
  const [trust, setTrust] = useState(100);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      setTrust(parseInt(localStorage.getItem('roompeace_trust') || '100'));
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleEffect = (e: Event) => {
      const customEvent = e as CustomEvent<{ itemId: number }>;
      const itemId = customEvent.detail.itemId;
      if (itemId === 1) {
        setActiveEffect('fireworks');
      } else if (itemId === 2) {
        setActiveEffect('coffee');
      } else if (itemId === 3) {
        setActiveEffect('sos');
      } else if (itemId === 4) {
        setActiveEffect('swap');
      }
    };
    window.addEventListener('roompeace_item_effect', handleEffect);
    return () => window.removeEventListener('roompeace_item_effect', handleEffect);
  }, []);

  useEffect(() => {
    if (activeEffect) {
      const timer = setTimeout(() => {
        setActiveEffect(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [activeEffect]);

  return (
    <BrowserRouter>
      <div className={`app-container ${trust < 20 ? 'danger-mode' : ''}`} style={{ position: 'relative' }}>
        {activeEffect === 'fireworks' && (
          <div className="fullscreen-effect-overlay fireworks-overlay">
            <div className="effect-emoji">🎆</div>
            <div className="effect-text">피드가 반짝이며 축하를 날립니다!</div>
          </div>
        )}
        {activeEffect === 'coffee' && (
          <div className="fullscreen-effect-overlay coffee-overlay">
            <div className="effect-emoji">☕</div>
            <div className="effect-text">따뜻한 화해의 커피가 도착했습니다!</div>
          </div>
        )}
        {activeEffect === 'sos' && (
          <div className="fullscreen-effect-overlay sos-overlay">
            <div className="effect-emoji">🚨</div>
            <div className="effect-text">룸메이트에게 SOS 지원을 요청했습니다!</div>
          </div>
        )}
        {activeEffect === 'swap' && (
          <div className="fullscreen-effect-overlay swap-overlay">
            <div className="effect-emoji">🔄</div>
            <div className="effect-text">역할 교체 요청을 발송했습니다!</div>
          </div>
        )}
        <ToastContainer />
        <TopStatusBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pethouse" element={<PetHouse />} />
            <Route path="/houserule" element={<Crew />} />
            <Route path="/peacecard" element={<PeaceCard />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/character" element={<CharacterGrowth />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
