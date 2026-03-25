import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isInstallable || isInstalled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '16px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid var(--card-border)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--accent-calories)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Download size={24} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Install MacroLens</h4>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Add to your home screen for quick tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: '#f1f5f9',
                color: 'var(--text-main)',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <button
              onClick={installApp}
              style={{
                background: 'var(--accent-calories)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
