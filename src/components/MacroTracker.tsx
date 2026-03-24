import React, { useState } from 'react';
import { Camera, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { analyzeMacro, analyzeText } from '../services/gemini';
import { useTrackerStore } from '../store/useTrackerStore';
import { motion, AnimatePresence } from 'framer-motion';

const MacroTracker = () => {
    const { addMeal } = useTrackerStore();
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<null | any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [aiService, setAiService] = useState<'gemini_image' | 'gemini_text'>('gemini_text');
    const [textQuery, setTextQuery] = useState('');
    const [imageDescription, setImageDescription] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
        } catch (err) {
            setError("Error reading file.");
        }
    };

    const handleImageSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!imagePreview) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeMacro(imagePreview, imageDescription);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze image. Please check your API settings.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleTextSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!textQuery.trim()) return;

        setIsUploading(true);
        setError(null);
        setResult(null);
        setImagePreview(null);

        try {
            const data = await analyzeText(textQuery);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze text. Please check your API settings.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveMeal = () => {
        if (!result) return;
        addMeal({
            name: result.name,
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fats: result.fats,
            image: imagePreview || undefined
        });
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setResult(null);
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="feature-root"
            style={{ maxWidth: '600px', margin: '0 auto' }}
        >
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Macro<span style={{ color: 'var(--accent-protein)' }}>Lens</span> AI</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Analyze your meal with Gemini AI.</p>
                </div>
                {!result && !isUploading && (
                    <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                        <button
                            onClick={() => setAiService('gemini_image')}
                            style={{ padding: '8px 16px', background: aiService === 'gemini_image' ? 'white' : 'transparent', color: aiService === 'gemini_image' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', boxShadow: aiService === 'gemini_image' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}
                        >
                            AI (Image)
                        </button>
                        <button
                            onClick={() => setAiService('gemini_text')}
                            style={{ padding: '8px 16px', background: aiService === 'gemini_text' ? 'white' : 'transparent', color: aiService === 'gemini_text' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', boxShadow: aiService === 'gemini_text' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}
                        >
                            AI (Text)
                        </button>
                    </div>
                )}
            </header>

            <div style={{ position: 'relative', minHeight: '400px' }}>
                <AnimatePresence mode="wait">
                    {!result && !isUploading && !error ? (
                        aiService === 'gemini_image' ? (
                            !imagePreview ? (
                                <motion.div
                                    key="upload-ui"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-card"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '400px',
                                        background: '#f8fafc',
                                        gap: '24px',
                                        padding: '40px'
                                    }}
                                >
                                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Log Your Meal</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choose how you'd like to add your photo</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
                                        {/* Camera Option */}
                                        <label
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '24px',
                                                background: 'white',
                                                borderRadius: '20px',
                                                border: '1px solid var(--card-border)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                            }}
                                            className="hover-scale"
                                        >
                                            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                                            <div style={{ padding: '16px', borderRadius: '14px', background: '#fff1f2', color: 'var(--accent-protein)' }}>
                                                <Camera size={32} />
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '15px' }}>Take Photo</span>
                                        </label>

                                        {/* Gallery Option */}
                                        <label
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '24px',
                                                background: 'white',
                                                borderRadius: '20px',
                                                border: '1px solid var(--card-border)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                            }}
                                            className="hover-scale"
                                        >
                                            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                            <div style={{ padding: '16px', borderRadius: '14px', background: '#eff6ff', color: 'var(--accent-fat)' }}>
                                                <Search size={32} />
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '15px' }}>From Gallery</span>
                                        </label>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', textAlign: 'center' }}>AI will analyze calories and nutrients automatically</p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="image-desc-ui"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleImageSubmit}
                                    className="glass-card"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '400px',
                                        background: '#f8fafc',
                                        gap: '16px',
                                        padding: '24px'
                                    }}
                                >
                                    <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            type="text"
                                            value={imageDescription}
                                            onChange={(e) => setImageDescription(e.target.value)}
                                            placeholder="Add a description (optional)..."
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                                        />
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setImageDescription(''); }}
                                                style={{ flex: 1, padding: '12px', background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Change Photo
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isUploading}
                                                style={{ flex: 2, padding: '12px', background: 'var(--accent-calories)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                                            >
                                                Analyze Meal
                                            </button>
                                        </div>
                                    </div>
                                </motion.form>
                            )
                        ) : (
                            <motion.form
                                key="text-ui"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleTextSubmit}
                                className="glass-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '400px',
                                    background: '#f8fafc',
                                    gap: '24px',
                                    padding: '32px'
                                }}
                            >
                                <div style={{ padding: '24px', borderRadius: '50%', background: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    <Search size={48} color="var(--accent-protein)" />
                                </div>
                                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                                    <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>Describe your meal</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>e.g., "3 eggs, 2 slices of bacon, and 1 slice of toast"</p>
                                    <input
                                        type="text"
                                        value={textQuery}
                                        onChange={(e) => setTextQuery(e.target.value)}
                                        placeholder="Enter meal description..."
                                        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', marginBottom: '16px' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!textQuery.trim() || isUploading}
                                        style={{ width: '100%', padding: '16px', background: 'var(--accent-calories)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: textQuery.trim() ? 'pointer' : 'not-allowed', opacity: textQuery.trim() ? 1 : 0.7 }}
                                    >
                                        Analyze Meal
                                    </button>
                                </div>
                            </motion.form>
                        )
                    ) : isUploading ? (
                        <motion.div
                            key="uploading-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card"
                            style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}
                        >
                            <div className="loading-spinner" style={{ width: '48px', height: '48px', border: '4px solid #f1f5f9', borderTopColor: 'var(--accent-calories)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Analyzing your meal...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '40px', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderColor: '#fee2e2', background: '#fef2f2' }}
                        >
                            <AlertCircle size={48} color="#ef4444" />
                            <p style={{ marginTop: '24px', color: '#ef4444', textAlign: 'center', fontWeight: '500', fontSize: '15px' }}>{error}</p>
                            <button onClick={() => setError(null)} style={{ marginTop: '32px', background: 'white', color: 'var(--text-main)', border: '1px solid #fee2e2', boxShadow: 'none' }}>Try Again</button>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="result-ui"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card"
                            style={{ padding: '32px' }}
                        >
                            {imagePreview && (
                                <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
                                    <img src={imagePreview} alt="Meal Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <h3 style={{ fontSize: '28px', marginBottom: '24px', textAlign: 'center' }}>{result.name}</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ padding: '16px', borderRadius: '20px', background: '#f8fafc', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Calories</p>
                                    <p style={{ fontSize: '24px', fontWeight: '800' }}>{result.calories}</p>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '20px', background: '#f8fafc', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Protein</p>
                                    <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-protein)' }}>{result.protein}g</p>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '20px', background: '#f8fafc', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Carbs</p>
                                    <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-carbs)' }}>{result.carbs}g</p>
                                </div>
                                <div style={{ padding: '16px', borderRadius: '20px', background: '#f8fafc', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Fats</p>
                                    <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-fat)' }}>{result.fats}g</p>
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginBottom: '32px' }}>
                                "{result.description}"
                            </p>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button onClick={() => setResult(null)} style={{ flex: 1, background: 'white', color: 'var(--text-main)', border: '1px solid var(--card-border)', boxShadow: 'none' }}>Reject</button>
                                <button onClick={handleSaveMeal} style={{ flex: 2, background: 'var(--accent-calories)' }}>
                                    {isSuccess ? <CheckCircle2 size={24} /> : "Log Entry"}
                                </button>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </motion.div >
    );
};

export default MacroTracker;
