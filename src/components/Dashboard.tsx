import { useState } from 'react';
import { Plus, User as UserIcon } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';
import { motion } from 'framer-motion';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const Dashboard = ({ onAddMeal, onOpenProfile }: { onAddMeal: () => void; onOpenProfile: () => void }) => {
    const { mealHistory, profile, settings } = useTrackerStore();

    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [baseDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const goals = { 
        calories: profile.calorieGoal, 
        protein: Math.round(profile.calorieGoal * 0.3 / 4), // Example macro split
        carbs: Math.round(profile.calorieGoal * 0.4 / 4), 
        fats: Math.round(profile.calorieGoal * 0.3 / 9) 
    };

    const mealsForSelectedDate = mealHistory.filter(m => isSameDay(new Date(m.timestamp), selectedDate));

    const dailyStats = {
        calories: mealsForSelectedDate.reduce((sum, m) => sum + (m.type === 'food' ? m.calories : -(m.calories || 0)), 0),
        protein: mealsForSelectedDate.reduce((sum, m) => sum + (m.protein || 0), 0),
        carbs: mealsForSelectedDate.reduce((sum, m) => sum + (m.carbs || 0), 0),
        fats: mealsForSelectedDate.reduce((sum, m) => sum + (m.fats || 0), 0),
    };

    const macros = [
        { label: 'Carbs', left: Math.max(0, goals.carbs - dailyStats.carbs) },
        { label: 'Protein', left: Math.max(0, goals.protein - dailyStats.protein) },
        { label: 'Fat', left: Math.max(0, goals.fats - dailyStats.fats) },
    ];

    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - (0 - i)); // Adjusted for current week
        return {
            dateObj: d,
            day: d.getDate(),
            isToday: isSameDay(d, new Date()),
            isSelected: isSameDay(d, selectedDate)
        };
    });

    const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
    const currentYear = selectedDate.getFullYear().toString().slice(-2);
    const currentDayName = selectedDate.toLocaleString('default', { weekday: 'long' });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dashboard-root"
            style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}
        >
            {/* New Header */}
            <div style={{ padding: '30px 0 10px', textAlign: 'center', position: 'relative', marginBottom: '10px' }}>
                <div style={{ position: 'absolute', left: '0', top: '55%', transform: 'translateY(-50%)' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px' }}>🐾</span>
                   </div>
                </div>
                
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px', color: '#18181b', letterSpacing: '-0.02em' }}>
                    {currentMonth} '{currentYear}
                </h2>
                <h3 style={{ fontSize: '36px', color: '#e4e4e7', margin: 0, fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                    {currentDayName}
                </h3>                <div 
                    onClick={onOpenProfile}
                    style={{ 
                        position: 'absolute', 
                        right: '0', 
                        top: '55%', 
                        transform: 'translateY(-50%)',
                        cursor: 'pointer' 
                    }}
                >
                   <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                      <UserIcon size={24} />
                   </div>
                </div>
            </div>

            {/* New Date Scroller */}
            {/* ... (dates content) */}
            <div style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: '8px', 
                padding: '10px 0 20px', 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
            }}>
                {dates.map((item, i) => {
                    const dayName = item.dateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();
                    return (
                        <div 
                            key={i} 
                            onClick={() => setSelectedDate(item.dateObj)}
                            style={{
                                textAlign: 'center',
                                padding: '12px 10px',
                                minWidth: '60px',
                                borderRadius: '24px',
                                border: item.isSelected ? '1px solid #e4e4e7' : '1px solid transparent',
                                background: item.isSelected ? 'white' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '600' }}>{dayName}</span>
                            <span style={{ 
                                fontSize: '20px', 
                                fontWeight: '700', 
                                color: item.isSelected ? '#18181b' : '#a1a1aa' 
                            }}>
                                {item.day}
                            </span>
                            {item.isSelected ? (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }} />
                            ) : (
                                <div style={{ width: '12px', height: '2px', background: '#d4d4d8', borderRadius: '2px' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', padding: '10px 0 40px' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <img 
                        src="/beaver-hero.png" 
                        alt="MacroLens Hero" 
                        style={{ width: '220px', height: 'auto', marginBottom: '10px' }} 
                    />
                </motion.div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '84px', fontWeight: '800', color: '#18181b', lineHeight: '0.9' }}>
                        {dailyStats.calories}
                    </span>
                    <span style={{ fontSize: '56px', fontWeight: '800', color: '#f4f4f5', position: 'relative', top: '-2px' }}>
                        / {goals.calories}
                    </span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#18181b', letterSpacing: '0.1em', marginTop: '12px' }}>
                    CALORIES EATEN
                </p>
            </div>

            {/* Conditionally Render Macros Section */}
            {settings.macrosView && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
                    {macros.map((macro, i) => {
                        const goal = macro.label === 'Protein' ? goals.protein : (macro.label === 'Carbs' ? goals.carbs : goals.fats);
                        const consumed = Math.round(goal - macro.left);
                        return (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#a1a1aa', marginBottom: '12px', letterSpacing: '0.05em' }}>
                                    {macro.label.toUpperCase()}
                                </p>
                                <div style={{ width: '100%', height: '4px', background: '#f4f4f5', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (consumed / goal) * 100)}%` }}
                                        style={{ height: '100%', background: '#d4d4d8' }} 
                                    />
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#18181b' }}>
                                    {consumed} <span style={{ color: '#d4d4d8', fontWeight: '500' }}>/ {goal} g</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Logged Status Capsule */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '40px' }}>
                <div style={{ 
                    background: '#f4f4f5', 
                    padding: '12px 24px', 
                    borderRadius: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}>
                    <span style={{ fontSize: '18px' }}>🍎</span>
                    <span style={{ fontWeight: '700', fontSize: '16px', color: '#18181b' }}>
                        Logged: {mealsForSelectedDate.length}
                    </span>
                </div>
            </div>

            {/* Floating Action Button & Decorative Icons */}
            <div style={{ position: 'fixed', bottom: '110px', right: '30px', zIndex: 1000 }}>
                {/* Floating Food Icons */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '-110px', right: '40px', fontSize: '32px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}
                >
                    🥗
                </motion.div>
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    style={{ position: 'absolute', top: '-60px', left: '-50px', fontSize: '32px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}
                >
                    🌭
                </motion.div>
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{ position: 'absolute', top: '10px', left: '-50px', fontSize: '32px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}
                >
                    🍟
                </motion.div>

                {/* Main FAB */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onAddMeal}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#18181b',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                        <Plus size={32} strokeWidth={2.5} />
                        {/* Scanner-like overlay lines */}
                        <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', borderTop: '2.5px solid white', borderLeft: '2.5px solid white' }} />
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderTop: '2.5px solid white', borderRight: '2.5px solid white' }} />
                        <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', borderBottom: '2.5px solid white', borderLeft: '2.5px solid white' }} />
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', borderBottom: '2.5px solid white', borderRight: '2.5px solid white' }} />
                    </div>
                </motion.button>
            </div>

            {/* Recently Logged Title - Hidden in the new minimalist mockup but kept for functionality if needed */}
            {/* <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Recently logged</h3> */}
        </motion.div>
    );
};

export default Dashboard;
