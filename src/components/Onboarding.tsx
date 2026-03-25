import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTrackerStore } from '../store/useTrackerStore';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const Onboarding = () => {
    const { completeOnboarding, user } = useTrackerStore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        gender: 'male' as 'male' | 'female' | 'other',
        age: 25,
        currentWeight: 70,
        height: 170,
        workoutFrequency: 3,
        weeklyGoal: 0,
        weightGoal: 70,
        dietType: 'Non-Veg',
        calorieGoal: 2000,
        stepGoal: 8000,
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleComplete = () => {
        completeOnboarding(formData);
    };

    const steps = [
        {
            title: "Let's get started",
            subtitle: "Tell us a bit about yourself",
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Gender</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['male', 'female', 'other'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => setFormData({ ...formData, gender: g as any })}
                                    style={{
                                        flex: 1,
                                        background: formData.gender === g ? '#18181b' : '#f4f4f5',
                                        color: formData.gender === g ? 'white' : '#18181b',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Age</p>
                        <input 
                            type="number" 
                            value={formData.age} 
                            onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '16px' }}
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Body Metrics",
            subtitle: "Enter your current weight and height",
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Current Weight (kg)</p>
                        <input 
                            type="number" 
                            value={formData.currentWeight} 
                            onChange={e => setFormData({ ...formData, currentWeight: parseFloat(e.target.value), weightGoal: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '16px' }}
                        />
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Height (cm)</p>
                        <input 
                            type="number" 
                            value={formData.height} 
                            onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '16px' }}
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Lifestyle",
            subtitle: "How active are you?",
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Workout frequency (days/week)</p>
                        <input 
                            type="range" 
                            min="0" max="7" 
                            value={formData.workoutFrequency} 
                            onChange={e => setFormData({ ...formData, workoutFrequency: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                        />
                        <p style={{ textAlign: 'center', fontWeight: '700', marginTop: '10px' }}>{formData.workoutFrequency} days</p>
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Diet preference</p>
                        <select 
                            value={formData.dietType}
                            onChange={e => setFormData({ ...formData, dietType: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '16px' }}
                        >
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                            <option value="Keto">Keto</option>
                            <option value="Lactose Intolerant">Lactose Intolerant</option>
                            <option value="Vegan">Vegan</option>
                        </select>
                    </div>
                </div>
            )
        },
        {
            title: "Your Goals",
            subtitle: "What are you aiming for?",
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Weekly weight change (kg)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            {[-1, -0.5, -0.3, 0, 0.3, 0.5, 1].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setFormData({ ...formData, weeklyGoal: v })}
                                    style={{
                                        background: formData.weeklyGoal === v ? '#18181b' : '#f4f4f5',
                                        color: formData.weeklyGoal === v ? 'white' : '#18181b',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                >
                                    {v > 0 ? `+${v}` : v} kg
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontWeight: '600', marginBottom: '10px' }}>Target Weight (kg)</p>
                        <input 
                            type="number" 
                            value={formData.weightGoal} 
                            onChange={e => setFormData({ ...formData, weightGoal: parseFloat(e.target.value) })}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '16px' }}
                        />
                    </div>
                </div>
            )
        }
    ];

    if (user.hasCompletedOnboarding) return null;

    const currentStepData = steps[step - 1];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 24px'
        }}>
            <div style={{ marginBottom: '40px' }}>
                <div style={{ width: '100%', height: '4px', background: '#f4f4f5', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / steps.length) * 100}%` }}
                        style={{ height: '100%', background: '#18181b' }}
                    />
                </div>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ flex: 1 }}
            >
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{currentStepData.title}</h2>
                <p style={{ color: '#71717a', marginBottom: '32px' }}>{currentStepData.subtitle}</p>
                {currentStepData.content}
            </motion.div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                {step > 1 && (
                    <button 
                        onClick={prevStep}
                        style={{ flex: 1, background: '#f4f4f5', color: '#18181b', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                {step < steps.length ? (
                    <button 
                        onClick={nextStep}
                        style={{ flex: 3, background: '#18181b', color: 'white', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        Next <ChevronRight size={20} />
                    </button>
                ) : (
                    <button 
                        onClick={handleComplete}
                        style={{ flex: 3, background: '#18181b', color: 'white', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        Finish <Check size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
