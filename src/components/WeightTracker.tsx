import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Plus } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';

const WeightTracker = () => {
    const { weightHistory, addWeight } = useTrackerStore();
    const [newWeight, setNewWeight] = useState('');
    const [showLogModal, setShowLogModal] = useState(false);

    const goalWeight = 70.0;
    const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 0;
    const startingWeight = 75.0;
    const progressPercent = Math.min(100, Math.max(0, ((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100));

    const handleAddWeight = () => {
        if (!newWeight || isNaN(parseFloat(newWeight))) return;
        addWeight(parseFloat(newWeight));
        setNewWeight('');
        setShowLogModal(false);
    };

    return (
        <div className="feature-root">
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Weight <span className="gradient-text">Journey</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Tracking your transformation, one day at a time.</p>
                </div>
                <button onClick={() => setShowLogModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Log Weight
                </button>
            </header>

            {showLogModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ padding: '32px', width: '400px' }}>
                        <h3 style={{ marginBottom: '24px' }}>Log Today's Weight</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Weight (kg)</label>
                            <input
                                type="number"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                autoFocus
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '18px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => setShowLogModal(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-glass)', boxShadow: 'none' }}>Cancel</button>
                            <button onClick={handleAddWeight} style={{ flex: 1 }}>Save Entry</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
                <div className="glass-card" style={{ padding: '32px', height: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontWeight: '600' }}>Weight Statistics</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                                <span style={{ color: 'var(--text-muted)' }}>Actual</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <div style={{ width: '8px', height: '8px', border: '1px solid var(--accent-secondary)', borderRadius: '50%' }}></div>
                                <span style={{ color: 'var(--text-muted)' }}>Target</span>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={weightHistory}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--accent-primary)' }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Target color="var(--accent-primary)" size={24} />
                            <p style={{ fontWeight: '600' }}>Target Progress</p>
                        </div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Goal: {goalWeight}kg</span>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Only <span style={{ color: 'white', fontWeight: 'bold' }}>{(currentWeight - goalWeight).toFixed(1)}kg</span> left to reach your goal!
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <TrendingUp color="#34d399" size={24} />
                            <p style={{ fontWeight: '600' }}>Quick Stats</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Starting</span>
                                <span style={{ fontWeight: '600' }}>{startingWeight}kg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Last 7 Days</span>
                                <span style={{ fontWeight: '600', color: '#34d399' }}>-1.7kg</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Avg. Weight</span>
                                <span style={{ fontWeight: '600' }}>73.4kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeightTracker;
