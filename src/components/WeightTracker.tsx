import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { MoreHorizontal, Plus, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackerStore } from '../store/useTrackerStore';

const WeightTracker = () => {
    const { weightHistory, addWeight, profile, clearWeightHistory } = useTrackerStore();
    const [newWeight, setNewWeight] = useState('');
    const [showLogModal, setShowLogModal] = useState(false);
    const [timeRange, setTimeRange] = useState<'days' | 'months'>('days');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : profile.currentWeight;
    const initialWeight = weightHistory.length > 0 ? weightHistory[0].weight : profile.currentWeight;
    const weightChange = currentWeight - initialWeight;
    const isGain = weightChange >= 0;

    const goalWeight = profile.weightGoal;
    const progressPercent = Math.min(100, Math.max(0, 
        isGain 
        ? ((currentWeight - initialWeight) / (goalWeight - initialWeight)) * 100 
        : ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100
    ));

    const handleAddWeight = () => {
        if (!newWeight || isNaN(parseFloat(newWeight))) return;
        addWeight(parseFloat(newWeight));
        setNewWeight('');
        setShowLogModal(false);
    };

    return (
        <div className="feature-root" style={{ padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#111' }}>Weight</h2>
                <div style={{ position: 'relative' }}>
                    <button 
                        className="icon-button" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ background: '#f5f5f5', borderRadius: '50%', padding: '8px' }}
                    >
                        <MoreHorizontal size={20} color="#666" />
                    </button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ 
                                    position: 'absolute', 
                                    top: '100%', 
                                    right: 0, 
                                    marginTop: '8px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    padding: '8px',
                                    zIndex: 1000,
                                    width: '180px',
                                    border: '1px solid #f0f0f0'
                                }}
                            >
                                <button 
                                    onClick={() => {
                                        if(window.confirm("Are you sure you want to clear your entire weight history? This cannot be undone.")) {
                                            clearWeightHistory();
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px 16px', 
                                        color: '#ff6b6b', 
                                        fontSize: '14px', 
                                        fontWeight: '700',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        boxShadow: 'none',
                                        borderRadius: '10px'
                                    }}
                                >
                                    Clear History
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Main Stats Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    background: '#1a1a1a', 
                    borderRadius: '24px', 
                    padding: '24px', 
                    color: 'white',
                    marginBottom: '32px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <p style={{ color: '#888', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
                            {isGain ? "YOU'VE GAINED" : "YOU'VE LOST"}
                        </p>
                        <h3 style={{ fontSize: '32px', fontWeight: '700', color: isGain ? '#5d9cec' : '#ff6b6b' }}>
                            {Math.abs(weightChange).toFixed(1)} <span style={{ fontSize: '18px' }}>kg</span>
                        </h3>
                    </div>
                    <div>
                        <p style={{ color: '#888', fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', textAlign: 'right' }}>
                            CURRENT WEIGHT
                        </p>
                        <h3 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'right' }}>
                            {currentWeight} <span style={{ fontSize: '18px', color: '#888' }}>kg</span>
                        </h3>
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#888', fontSize: '11px', fontWeight: '600', marginBottom: '12px' }}>
                        {progressPercent.toFixed(0)}% GOAL REACHED
                    </p>
                    <div style={{ 
                        height: '32px', 
                        background: '#333', 
                        borderRadius: '16px', 
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
                    }}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ 
                                height: '100%', 
                                background: 'white', 
                                borderRadius: '16px'
                            }} 
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                    <span>{initialWeight} kg</span>
                    <ChevronRight size={16} />
                    <span>{goalWeight} kg</span>
                </div>
            </motion.div>

            {/* Chart Section */}
            <section style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111' }}>
                        Weight Progress <span style={{ color: '#ccc', fontWeight: '400' }}>(kg)</span>
                    </h4>
                </div>

                <div style={{ background: '#f8f8f8', borderRadius: '16px', padding: '4px', display: 'flex', marginBottom: '24px' }}>
                    <button 
                        onClick={() => setTimeRange('days')}
                        style={{ 
                            flex: 1, 
                            padding: '8px', 
                            borderRadius: '12px', 
                            background: timeRange === 'days' ? 'white' : 'transparent',
                            boxShadow: timeRange === 'days' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            color: timeRange === 'days' ? '#111' : '#888',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Days
                    </button>
                    <button 
                        onClick={() => setTimeRange('months')}
                        style={{ 
                            flex: 1, 
                            padding: '8px', 
                            borderRadius: '12px', 
                            background: timeRange === 'months' ? 'white' : 'transparent',
                            boxShadow: timeRange === 'months' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                            color: timeRange === 'months' ? '#111' : '#888',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Months
                    </button>
                </div>

                <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#888', fontSize: 12 }} 
                                hide={weightHistory.length === 0}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#888', fontSize: 12 }} 
                                domain={['dataMin - 2', 'dataMax + 2']}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                            />
                            <ReferenceLine y={goalWeight} stroke="#e74c3c" strokeDasharray="3 3" />
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#5d9cec" 
                                strokeWidth={3} 
                                dot={{ fill: '#5d9cec', r: 4, strokeWidth: 0 }} 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5d9cec' }}></div>
                        <span style={{ fontSize: '12px', color: '#888' }}>Your Weight</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '2px', background: '#e74c3c', borderTop: '1px dashed #e74c3c' }}></div>
                        <span style={{ fontSize: '12px', color: '#888' }}>Weight Goal</span>
                    </div>
                </div>
            </section>

            {/* History Section */}
            <section>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>History</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0 8px 12px 8px', color: '#ccc', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #f5f5f5' }}>
                    <span>Weight</span>
                    <span style={{ textAlign: 'center' }}>Change</span>
                    <span style={{ textAlign: 'right' }}>Date</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {weightHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No history yet.</div>
                    ) : (
                        [...weightHistory].reverse().map((entry, index) => {
                            const prevEntry = weightHistory[weightHistory.length - 2 - index];
                            const diff = prevEntry ? entry.weight - prevEntry.weight : 0;
                            return (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', padding: '16px 8px', borderBottom: '1px solid #f5f5f5' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={20} color="#ddd" />
                                        </div>
                                        <span style={{ fontWeight: '700', color: '#111' }}>{entry.weight} kg</span>
                                    </div>
                                    <span style={{ textAlign: 'center', color: diff > 0 ? '#ff6b6b' : diff < 0 ? '#5d9cec' : '#888', fontWeight: '600' }}>
                                        {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}` : '-'}
                                    </span>
                                    <span style={{ textAlign: 'right', color: '#bbb', fontSize: '14px' }}>{entry.date}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Floating Action Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogModal(true)}
                style={{ 
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#111',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    zIndex: 100
                }}
            >
                <Plus size={20} /> Log Weight
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card" 
                            style={{ padding: '32px', width: '100%', maxWidth: '400px', background: 'white', color: '#111' }}
                        >
                            <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Log Today's Weight</h3>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    autoFocus
                                    placeholder="00.0"
                                    style={{ width: '100%', background: '#f5f5f5', border: 'none', borderRadius: '16px', padding: '16px', color: '#111', fontSize: '24px', fontWeight: '700' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button onClick={() => setShowLogModal(false)} style={{ flex: 1, background: '#f5f5f5', color: '#666', boxShadow: 'none' }}>Cancel</button>
                                <button onClick={handleAddWeight} style={{ flex: 1, background: '#111' }}>Save Entry</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeightTracker;
