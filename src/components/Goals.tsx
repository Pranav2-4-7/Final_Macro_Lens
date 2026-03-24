import { Target, Flame, Zap, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const Goals = () => {
    // Current static goals
    const goals = [
        { label: 'Daily Calories', value: 2500, unit: 'kcal', color: 'var(--accent-calories)', icon: Flame },
        { label: 'Protein Goal', value: 180, unit: 'g', color: 'var(--accent-protein)', icon: Zap },
        { label: 'Carbs Goal', value: 300, unit: 'g', color: 'var(--accent-carbs)', icon: Utensils },
        { label: 'Fats Goal', value: 60, unit: 'g', color: 'var(--accent-fat)', icon: Utensils },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="feature-root"
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Your <span className="gradient-text">Goals</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Customize your targets for a healthier version of yourself.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {goals.map((goal, i) => (
                    <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: `${goal.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <goal.icon size={24} color={goal.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{goal.label}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{goal.value}</h3>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{goal.unit}</span>
                            </div>
                        </div>
                        <button style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none' }}>Edit</button>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ marginTop: '40px', padding: '32px', borderStyle: 'dashed' }}>
                <div style={{ textAlign: 'center' }}>
                    <Target size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Smart Goal Adjustments</h4>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                        MacroLens AI can automatically adjust your goals based on your progress and activity levels. (Coming Soon)
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Goals;
