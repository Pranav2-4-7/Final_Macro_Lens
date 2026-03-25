import { useState } from 'react';
import { Footprints, Droplets, Flame, Plus, Candy, Zap, Heart, Apple, Info, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackerStore } from '../store/useTrackerStore';

const Wellness = () => {
    const { dailyStats, addWater, addActivity, profile, updateSteps } = useTrackerStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [customAmount, setCustomAmount] = useState('');

    const steps = dailyStats.steps;
    const stepGoal = profile.stepGoal || 10000;
    const waterIntake = dailyStats.waterIntake || 0;
    const waterGoal = 2500;
    const exerciseCalories = dailyStats.exerciseCalories || 0;

    const handleSyncGoogleFit = () => {
        setIsSyncing(true);
        // Simulate Google Fit Bidirectional Sync
        setTimeout(() => {
            // PULL: Update local steps
            const syncedSteps = steps + Math.floor(Math.random() * 2000) + 1000;
            updateSteps(syncedSteps);
            
            // PUSH: (Simulated) Sending water and calories to Fit
            console.log("☁️ Data Pushed to Google Fit:", { 
                caloriesBurned: exerciseCalories, 
                waterIntake: waterIntake 
            });
            
            setIsSyncing(false);
        }, 1500);
    };

    const handleLogWater = (amount: number) => {
        if (!isNaN(amount)) {
            addWater(amount);
            setShowWaterModal(false);
            setCustomAmount('');
        }
    };

    const handleLogActivity = () => {
        const cal = parseFloat(customAmount);
        if(!isNaN(cal)) {
            addActivity(cal);
            setShowActivityModal(false);
            setCustomAmount('');
        }
    };

    const articles = [
        { id: 1, title: "Is Sugar Really That Bad for You?", icon: <Candy size={32} color="#fbc02d" />, color: "#fff9c4" },
        { id: 2, title: "Fasting: Facts vs. Fiction", icon: <Zap size={32} color="#4caf50" />, color: "#e8f5e9" },
        { id: 3, title: "Why It's Important to Eat with Others", icon: <Heart size={32} color="#9c27b0" />, color: "#f3e5f5" },
        { id: 4, title: "Hungry for Smart Snack Choices?", icon: <Apple size={32} color="#2196f3" />, color: "#e3f2fd" },
    ];

    return (
        <div className="feature-root" style={{ padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#111' }}>Wellness</h2>
            </header>

            {/* Articles Carousel */}
            <div style={{ 
                display: 'flex', 
                gap: '16px', 
                overflowX: 'auto', 
                paddingBottom: '24px',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
            }}>
                {articles.map((article) => (
                    <motion.div 
                        key={article.id}
                        whileHover={{ y: -5 }}
                        style={{ 
                            minWidth: '140px', 
                            height: '180px', 
                            background: article.color, 
                            borderRadius: '24px', 
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        <div style={{ background: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            {article.icon}
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#111', lineHeight: '1.3' }}>{article.title}</p>
                    </motion.div>
                ))}
            </div>

            <section style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '20px' }}>Today's Health</h3>

                {/* Water Intake Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        background: '#f8f8f8', 
                        borderRadius: '24px', 
                        padding: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Droplets size={28} color="#2196f3" />
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>WATER INTAKE</p>
                            <h4 style={{ fontSize: '24px', fontWeight: '700', color: '#111' }}>
                                {waterIntake} <span style={{ color: '#bbb', fontWeight: '500' }}>/ {waterGoal} ml</span>
                            </h4>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowWaterModal(true)}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    >
                        <Plus size={24} color="#666" />
                    </button>
                </motion.div>

                {/* Steps and Activity Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ background: '#f8f8f8', borderRadius: '24px', padding: '24px', position: 'relative' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Footprints size={24} color="#4caf50" />
                            </div>
                            <button 
                                onClick={handleSyncGoogleFit}
                                disabled={isSyncing}
                                style={{ background: 'none', border: 'none', padding: '4px', opacity: isSyncing ? 0.5 : 1 }}
                            >
                                <RefreshCcw size={16} color="#bbb" className={isSyncing ? 'spin-animation' : ''} />
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '16px' }}>STEPS</p>
                        <h4 style={{ fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
                            {steps.toLocaleString()}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>Goal: {stepGoal.toLocaleString()} steps</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ background: '#f8f8f8', borderRadius: '24px', padding: '24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Flame size={24} color="#ff5252" />
                            </div>
                            <button style={{ background: 'none', border: 'none', padding: '4px' }}>
                                <Info size={16} color="#bbb" />
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '16px' }}>ACTIVITY</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h4 style={{ fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
                                    {exerciseCalories.toFixed(0)}
                                </h4>
                                <p style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>Calories burned</p>
                            </div>
                            <button 
                                onClick={() => setShowActivityModal(true)}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Plus size={16} color="#666" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Modals */}
            <AnimatePresence>
                {showWaterModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', borderRadius: '32px', padding: '32px', width: '100%', maxWidth: '400px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700' }}>Log Water</h3>
                                <button onClick={() => setShowWaterModal(false)}><X size={24} color="#666" /></button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                                {[250, 500, 750].map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => handleLogWater(val)}
                                        style={{ background: '#f8f8f8', padding: '16px', borderRadius: '16px', fontWeight: '600', color: '#111' }}
                                    >
                                        +{val}ml
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    placeholder="Custom ml"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    type="number"
                                    style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #eee', color: '#111' }}
                                />
                                <button 
                                    onClick={() => handleLogWater(parseFloat(customAmount))}
                                    style={{ width: '56px', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Check color="white" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showActivityModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', borderRadius: '32px', padding: '32px', width: '100%', maxWidth: '400px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700' }}>Log Activity</h3>
                                <button onClick={() => setShowActivityModal(false)}><X size={24} color="#666" /></button>
                            </div>

                            <p style={{ color: '#888', marginBottom: '16px', fontSize: '14px' }}>Enter estimated calories burned during exercise.</p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    placeholder="Calories burned"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    type="number"
                                    style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #eee', color: '#111' }}
                                />
                                <button 
                                    onClick={handleLogActivity}
                                    style={{ width: '56px', background: '#111', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Check color="white" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
                .feature-root::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

const RefreshCcw = ({ size, color, className }: { size: number, color: string, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);

export default Wellness;
