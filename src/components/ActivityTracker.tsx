import { useState } from 'react';
import { Footprints, RefreshCcw, Smartphone } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';

const ActivityTracker = () => {
    const { dailyStats, updateSteps } = useTrackerStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const steps = dailyStats.steps;
    const stepGoal = 10000;

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            updateSteps(steps + Math.floor(Math.random() * 500) + 200);
            setIsSyncing(false);
        }, 2000);
    };

    return (
        <div className="feature-root">
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Activity <span className="gradient-text">Sync</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Connect with Google Fit to track your daily movement.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(56, 189, 248, 0.2)' }}>
                        <Footprints size={50} color="var(--accent-primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '4px' }}>{steps.toLocaleString()}</h3>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>STEPS TODAY</p>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (steps / stepGoal) * 100)}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px' }}></div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Goal: {stepGoal.toLocaleString()} steps</p>
                </div>

                <div className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <Smartphone color="var(--accent-primary)" size={24} />
                        <h3 style={{ fontWeight: '600' }}>Google Fit Connection</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Connected Account</p>
                            <p style={{ fontWeight: '500' }}>user@gmail.com</p>
                        </div>

                        <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Last Synchronized</p>
                            <p style={{ fontWeight: '500' }}>Today, 08:30 AM</p>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: isSyncing ? 0.7 : 1 }}
                        >
                            <RefreshCcw size={20} className={isSyncing ? 'spin-animation' : ''} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-animation { animation: spin 2s linear infinite; }
      `}</style>
        </div>
    );
};

export default ActivityTracker;
