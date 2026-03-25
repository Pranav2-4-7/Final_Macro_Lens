import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Home, Utensils, Scale, Heart } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MacroTracker from './components/MacroTracker';
import WeightTracker from './components/WeightTracker';
import ActivityTracker from './components/ActivityTracker';
import Goals from './components/Goals';
import Login from './components/Login';
import Profile from './components/Profile';
import InstallPrompt from './components/InstallPrompt';
import Onboarding from './components/Onboarding';
import { auth } from './services/firebase';
import { useTrackerStore } from './store/useTrackerStore';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, setUser, checkAndReset, syncWithFirestore } = useTrackerStore();
  const [isProfileOpen, setProfileOpen] = useState(false);

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
    if (user.isLoggedIn && user.uid && user.uid !== 'demo-uid') {
      const unsubscribeSync = syncWithFirestore();
      return () => {
        if (typeof unsubscribeSync === 'function') {
          unsubscribeSync();
        }
      };
    }
  }, [user.isLoggedIn, user.uid, syncWithFirestore]);

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
          return <Dashboard onAddMeal={() => setActiveTab('calorie')} onOpenProfile={() => setProfileOpen(true)} />;
        case 'calorie':
          return <MacroTracker />;
        case 'weight':
          return <WeightTracker />;
        case 'steps':
          return <ActivityTracker />;
        case 'goals':
          return <Goals />;
        default:
          return <Dashboard onAddMeal={() => setActiveTab('calorie')} onOpenProfile={() => setProfileOpen(true)} />;
      }
    };

    return (
      <div className="app-container" style={{ background: 'white', minHeight: '100vh', position: 'relative' }}>
        <main className="main-content" style={{ width: '100%', margin: 0, padding: 0, position: 'relative' }}>
          {renderSecondaryContent()}
        </main>

        <Profile isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
        <Onboarding />

        {/* Bottom Navigation for Mobile */}
        <nav className="bottom-nav">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span>Home</span>
          </button>
          <button 
            className={`nav-button ${activeTab === 'calorie' ? 'active' : ''}`}
            onClick={() => setActiveTab('calorie')}
          >
            <Utensils size={24} strokeWidth={activeTab === 'calorie' ? 2.5 : 2} />
            <span>Fasting</span>
          </button>
          <button 
            className={`nav-button ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            <Scale size={24} strokeWidth={activeTab === 'weight' ? 2.5 : 2} />
            <span>Weight</span>
          </button>
          <button 
            className={`nav-button ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            <Heart size={24} strokeWidth={activeTab === 'steps' ? 2.5 : 2} />
            <span>Wellness</span>
          </button>
        </nav>
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
