import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, BarChart2, ChevronRight, RotateCcw, Layout, Settings, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

interface ProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

const Profile = ({ isOpen, onClose }: ProfileProps) => {
    const { 
        user, 
        setUser, 
        logout, 
        mealHistory, 
        profile, 
        settings, 
        updateSettings
    } = useTrackerStore();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) {
                setUser({
                    uid: result.user.uid,
                    email: result.user.email
                });
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    // Calculate stats
    const uniqueDates = Array.from(new Set(mealHistory.map(m => new Date(m.timestamp).toDateString())));
    const daysOfTracking = uniqueDates.length;

    const daysWithGoalAchieved = uniqueDates.filter(dateStr => {
        const dayMeals = mealHistory.filter(m => new Date(m.timestamp).toDateString() === dateStr);
        const dayCalories = dayMeals.reduce((sum, m) => sum + (m.type === 'food' ? m.calories : -(m.calories || 0)), 0);
        return dayCalories > 0 && dayCalories <= profile.calorieGoal;
    }).length;

    const SettingToggle = ({ label, subtext, icon: Icon, value, onToggle }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                    <Icon size={20} />
                </div>
                <div>
                    <p style={{ fontWeight: '600', color: '#18181b', fontSize: '16px' }}>{label}</p>
                    {subtext && <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>{subtext}</p>}
                </div>
            </div>
            <button 
                onClick={onToggle}
                style={{ 
                    width: '44px', 
                    height: '24px', 
                    borderRadius: '12px', 
                    background: value ? '#22c55e' : '#e4e4e7',
                    position: 'relative',
                    padding: 0,
                    transition: 'background 0.3s ease'
                }}
            >
                <motion.div 
                    animate={{ x: value ? 22 : 2 }}
                    style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        background: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }} 
                />
            </button>
        </div>
    );

    const DataRow = ({ label, value, icon: Icon, color = '#fbbf24' }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                    <Icon size={20} />
                </div>
                <p style={{ fontWeight: '600', color: '#18181b', fontSize: '16px' }}>{label}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ fontWeight: '600', color: color, fontSize: '16px' }}>{value}</span>
                <ChevronRight size={20} color="#d4d4d8" />
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'white',
                        zIndex: 2000,
                        overflowY: 'auto',
                        padding: '24px'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#18181b' }}>Profile</h1>
                        <button 
                            onClick={onClose}
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: '#f4f4f5', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: 0,
                                color: '#18181b'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ background: '#18181b', borderRadius: '24px', padding: '20px', color: 'white' }}>
                            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>
                                Days of tracking<br/>calories
                            </p>
                            <span style={{ fontSize: '48px', fontWeight: '800' }}>{daysOfTracking}</span>
                        </div>
                        <div style={{ background: '#18181b', borderRadius: '24px', padding: '20px', color: 'white' }}>
                            <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, marginBottom: '8px' }}>
                                Days with goal<br/>achieved
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '48px', fontWeight: '800' }}>{daysWithGoalAchieved}</span>
                                <Trophy size={32} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))' }} />
                            </div>
                        </div>
                    </div>

                    {/* View Statistics Button */}
                    <button style={{ 
                        width: '100%', 
                        background: '#f4f4f5', 
                        color: '#18181b', 
                        borderRadius: '20px', 
                        padding: '16px', 
                        fontSize: '18px',
                        fontWeight: '700',
                        marginBottom: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        <BarChart2 size={24} />
                        View Statistics
                    </button>

                    {/* Health Data Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#d4d4d8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Health Data</h3>
                        <div onClick={() => {
                            const val = prompt('Enter weight goal (kg):', profile.weightGoal.toString());
                            if (val) useTrackerStore.getState().updateProfile({ weightGoal: parseFloat(val) });
                        }}>
                            <DataRow label="Weight Goal" value={`${profile.weightGoal} kg`} icon={Layout} />
                        </div>
                        <div onClick={() => {
                            const val = prompt('Enter calorie goal (kcal):', profile.calorieGoal.toString());
                            if (val) useTrackerStore.getState().updateProfile({ calorieGoal: parseInt(val) });
                        }}>
                            <DataRow label="Calorie Goal" value={`${profile.calorieGoal} kcal`} icon={Bell} />
                        </div>
                        <div onClick={() => {
                            const val = prompt('Enter Diet Type (Veg, Non-Veg, Keto, Lactose Intolerant, etc.):', profile.dietType);
                            if (val) useTrackerStore.getState().updateProfile({ dietType: val });
                        }}>
                            <DataRow label="Diet Type" value={profile.dietType} icon={RotateCcw} />
                        </div>
                    </div>

                    {/* App Settings Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#d4d4d8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>App Settings</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f4f4f5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>
                                    <RotateCcw size={20} />
                                </div>
                                <p style={{ fontWeight: '600', color: '#18181b', fontSize: '16px' }}>Begin Again</p>
                            </div>
                            <ChevronRight size={20} color="#d4d4d8" />
                        </div>
                        <SettingToggle 
                            label="Macros view" 
                            subtext="Tap the mascot to see the macros breakdown" 
                            icon={Layout} 
                            value={settings.macrosView}
                            onToggle={() => updateSettings({ macrosView: !settings.macrosView })}
                        />
                        <SettingToggle 
                            label="Metric system" 
                            subtext="Turn off to use imperial units" 
                            icon={Settings} 
                            value={settings.isMetric}
                            onToggle={() => updateSettings({ isMetric: !settings.isMetric })}
                        />
                    </div>

                    {/* Account Section */}
                    <div style={{ marginBottom: '40px', padding: '20px', background: '#f8fafc', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Account</h3>
                        {user.isLoggedIn ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserIcon size={24} color="#64748b" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '700', color: '#1e293b' }}>{user.email?.split('@')[0] || 'User'}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={logout}
                                    style={{ background: 'transparent', color: '#ef4444', padding: '8px', width: 'auto' }}
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleGoogleLogin}
                                style={{ width: '100%', background: '#18181b', height: '56px', borderRadius: '16px' }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '12px' }} />
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Profile;
