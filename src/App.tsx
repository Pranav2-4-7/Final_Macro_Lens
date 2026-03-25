import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MacroTracker from './components/MacroTracker';
import WeightTracker from './components/WeightTracker';
import ActivityTracker from './components/ActivityTracker';
import Goals from './components/Goals';
import Login from './components/Login';
import InstallPrompt from './components/InstallPrompt';
import { auth } from './services/firebase';
import { useTrackerStore } from './store/useTrackerStore';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser, checkAndReset } = useTrackerStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    checkAndReset();
    const interval = setInterval(checkAndReset, 60000);
    return () => clearInterval(interval);
  }, [checkAndReset]);

  const renderMainContent = () => {
    if (!user.isLoggedIn) {
      return <Login />;
    }

    const renderSecondaryContent = () => {
      switch (activeTab) {
        case 'dashboard':
          return <Dashboard onAddMeal={() => setActiveTab('calorie')} />;
        case 'calorie':
          return <MacroTracker />;
        case 'weight':
          return <WeightTracker />;
        case 'steps':
          return <ActivityTracker />;
        case 'goals':
          return <Goals />;
        default:
          return <Dashboard onAddMeal={() => setActiveTab('dashboard')} />;
      }
    };

    return (
      <div className="app-container" style={{ display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Edge trigger for swiping open */}
        <motion.div 
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '20px',
            zIndex: 800,
            background: 'transparent'
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_: any, info: { offset: { x: number } }) => {
            if (info.offset.x > 30) setSidebarOpen(true);
          }}
        />

        <header className="mobile-header">
          <button className="menu-trigger" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>
            Macro<span style={{ color: 'var(--accent-protein)' }}>Lens</span>
          </h2>
          <button className="menu-trigger" onClick={() => setActiveTab('calorie')}>
            <Camera size={22} />
          </button>
        </header>

        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }} 
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="main-content">
          {renderSecondaryContent()}
        </main>
      </div>
    );
  };

  return (
    <>
      {renderMainContent()}
      <InstallPrompt />
    </>
  );
}

export default App;
