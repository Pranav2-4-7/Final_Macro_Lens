import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useTrackerStore } from '../store/useTrackerStore';
import { motion } from 'framer-motion';

const Login = () => {
    const setUser = useTrackerStore((state) => state.setUser);
    const bypassLogin = useTrackerStore((state) => state.bypassLogin);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleGoogleLogin = async () => {
        setIsAuthenticating(true);
        setLoginError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser({
                uid: result.user.uid,
                email: result.user.email
            });
        } catch (error: any) {
            console.error("Firebase Login Error:", error);
            setLoginError(error.message || "An unexpected error occurred during login.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'white',
            color: 'var(--text-main)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', background: 'white' }}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--accent-calories)',
                    borderRadius: '20px',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'
                }}>
                    <h2 style={{ color: 'white', fontSize: '28px' }}>M</h2>
                </div>

                <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '800' }}>MacroLens</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '16px', lineHeight: '1.6' }}>
                    Your personal nutritional sidekick. Scan, track, and reach your goals with ease.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isAuthenticating}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            width: '100%',
                            gap: '12px',
                            padding: '16px 24px',
                            fontSize: '16px',
                            borderRadius: '18px',
                            opacity: isAuthenticating ? 0.7 : 1
                        }}
                    >
                        {isAuthenticating ? (
                            <div className="loading-spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 18 18">
                                <path fill="currentColor" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                                <path fill="currentColor" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                                <path fill="currentColor" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                                <path fill="currentColor" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
                            </svg>
                        )}
                        {isAuthenticating ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    {loginError && (
                        <div style={{ padding: '14px', borderRadius: '14px', background: '#fef2f2', border: '1px solid #fee2e2', width: '100%', color: '#ef4444', fontSize: '14px' }}>
                            {loginError}
                        </div>
                    )}

                    <div style={{ margin: '8px 0', color: 'var(--text-light)', fontSize: '14px' }}>of</div>

                    <button
                        onClick={bypassLogin}
                        style={{
                            background: '#f1f5f9',
                            color: 'var(--text-main)',
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: '18px',
                            boxShadow: 'none'
                        }}
                    >
                        Try Demo Mode
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
