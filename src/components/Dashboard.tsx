import React, { useState } from 'react';
import { Flame, Utensils, Zap, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';
import ProgressCircle from './ProgressCircle';
import { motion } from 'framer-motion';

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const Dashboard = ({ onAddMeal }: { onAddMeal: () => void }) => {
    const { mealHistory } = useTrackerStore();

    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [baseDate, setBaseDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Goals (Static for now, could be in store)
    const goals = {
        calories: 2500,
        protein: 180,
        carbs: 300,
        fats: 60
    };

    // Filter meals for selectedDate
    const mealsForSelectedDate = mealHistory.filter(m => isSameDay(new Date(m.timestamp), selectedDate));

    // Calculate dynamic stats
    const dailyStats = {
        calories: mealsForSelectedDate.reduce((sum, m) => sum + (m.type === 'food' ? m.calories : -(m.calories || 0)), 0),
        protein: mealsForSelectedDate.reduce((sum, m) => sum + (m.protein || 0), 0),
        carbs: mealsForSelectedDate.reduce((sum, m) => sum + (m.carbs || 0), 0),
        fats: mealsForSelectedDate.reduce((sum, m) => sum + (m.fats || 0), 0),
    };

    const caloriesLeft = Math.max(0, goals.calories - dailyStats.calories);
    const calProgress = (dailyStats.calories / goals.calories) * 100;

    const macros = [
        {
            label: 'Protein',
            left: Math.max(0, goals.protein - dailyStats.protein),
            unit: 'g',
            icon: <Zap size={14} color="#f43f5e" />,
            color: "#f43f5e",
            progress: (dailyStats.protein / goals.protein) * 100
        },
        {
            label: 'Carbs',
            left: Math.max(0, goals.carbs - dailyStats.carbs),
            unit: 'g',
            icon: <Flame size={14} color="#f59e0b" />,
            color: "#f59e0b",
            progress: (dailyStats.carbs / goals.carbs) * 100
        },
        {
            label: 'Fat',
            left: Math.max(0, goals.fats - dailyStats.fats),
            unit: 'g',
            icon: <Utensils size={14} color="#3b82f6" />,
            color: "#3b82f6",
            progress: (dailyStats.fats / goals.fats) * 100
        },
    ];

    const shiftBaseDate = (days: number) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + days);
        setBaseDate(d);
    };

    // Dates for the header scroller
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - (3 - i));
        return {
            dateObj: d,
            day: d.getDate(),
            isToday: isSameDay(d, new Date()),
            isSelected: isSameDay(d, selectedDate)
        };
    });

    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            // value is YYYY-MM-DD
            const [year, month, day] = e.target.value.split('-').map(Number);
            const localDate = new Date(year, month - 1, day);
            setSelectedDate(localDate);
            setBaseDate(localDate);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-root"
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            {/* Date Scroller */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                <button 
                    onClick={() => shiftBaseDate(-7)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                    {dates.map((item, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedDate(item.dateObj)}
                            style={{
                                textAlign: 'center',
                                padding: '8px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: item.isSelected ? 'var(--text-main)' : 'transparent',
                                color: item.isSelected ? 'white' : (item.isToday ? 'var(--text-main)' : 'var(--text-light)'),
                                fontWeight: item.isToday || item.isSelected ? '700' : '400',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {item.day}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => shiftBaseDate(7)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <ChevronRight size={24} />
                </button>

                <div style={{ position: 'relative', marginLeft: '8px' }}>
                    <input 
                        type="date"
                        onChange={handleDateInput}
                        style={{
                            position: 'absolute',
                            opacity: 0,
                            top: 0, left: 0, right: 0, bottom: 0,
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%'
                        }}
                    />
                    <div style={{ padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <Calendar size={20} />
                    </div>
                </div>
            </div>

            {/* Main Calorie Card */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1' }}>{caloriesLeft.toLocaleString()}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px' }}>Calories left</p>
                </div>
                <ProgressCircle
                    progress={calProgress}
                    size={140}
                    strokeWidth={12}
                    color="var(--accent-calories)"
                    icon={<Flame size={28} color="var(--accent-calories)" />}
                />
            </div>

            {/* Macro Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
                {macros.map((macro, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{macro.left}{macro.unit}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{macro.label} left</p>
                        </div>
                        <div style={{ alignSelf: 'center' }}>
                            <ProgressCircle
                                progress={macro.progress}
                                size={70}
                                strokeWidth={6}
                                color={macro.color}
                                icon={macro.icon}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recently Logged Section */}
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Recently logged</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mealsForSelectedDate.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No logs for this date. Time to track!</p>
                    </div>
                ) : (
                    mealsForSelectedDate.map((item, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={item.id}
                            className="glass-card"
                            style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}
                        >
                            {/* Image Placeholder or Actual Image */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '16px',
                                background: item.type === 'food' ? '#f1f5f9' : '#0f172a',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    item.type === 'food' ? <Utensils color="#94a3b8" /> : <Zap color="white" />
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-main)', marginBottom: '4px' }}>{item.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Flame size={12} /> {item.calories} kcal
                                            </span>
                                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }}></span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-accent)', fontWeight: '600' }}>
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexDirection: 'column' }}>
                                        {item.type === 'food' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <div style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: '700' }}>P: {item.protein}g</div>
                                                <div style={{ padding: '4px 8px', borderRadius: '6px', background: '#fffbeb', color: '#f59e0b', fontSize: '11px', fontWeight: '700' }}>C: {item.carbs}g</div>
                                                <div style={{ padding: '4px 8px', borderRadius: '6px', background: '#eff6ff', color: '#3b82f6', fontSize: '11px', fontWeight: '700' }}>F: {item.fats}g</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={onAddMeal}
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: '32px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#0f172a',
                    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.4)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <Plus size={32} />
            </button>
        </motion.div>
    );
};

export default Dashboard;
