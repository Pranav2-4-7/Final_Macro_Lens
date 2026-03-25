import { LayoutDashboard, Camera, LineChart, Target, Settings, LogOut, Footprints, User as UserIcon, X, Download } from 'lucide-react';
import { useTrackerStore } from '../store/useTrackerStore';
import { usePWA } from '../hooks/usePWA';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) => {
    const { user, logout } = useTrackerStore();
    const { isInstallable, isInstalled, installApp } = usePWA();

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Today' },
        { id: 'calorie', icon: Camera, label: 'Analyze' },
        { id: 'weight', icon: LineChart, label: 'Weight' },
        { id: 'steps', icon: Footprints, label: 'Activity' },
        { id: 'goals', icon: Target, label: 'Goals' },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            <div 
                className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
                onClick={onClose}
            />

            <motion.aside 
                className={`sidebar ${isOpen ? 'open' : ''}`}
                initial={false}
                animate={typeof window !== 'undefined' && window.innerWidth <= 640 ? { x: isOpen ? 0 : '-100%' } : { x: 0 }}
                drag={window.innerWidth <= 640 ? "x" : false}
                dragConstraints={{ left: -280, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -50) onClose();
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div className="logo-container" style={{ padding: '0 12px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Macro<span style={{ color: 'var(--accent-protein)' }}>Lens</span></h2>
                    </div>
                    {/* Mobile close button */}
                    <button 
                        className="menu-trigger mobile-only" 
                        onClick={onClose}
                        style={{ background: 'transparent', display: window.innerWidth <= 640 ? 'flex' : 'none' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    background: isActive ? '#f1f5f9' : 'transparent',
                                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                    border: 'none',
                                    boxShadow: 'none',
                                    justifyContent: 'flex-start',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            width: '4px',
                                            height: '60%',
                                            background: 'var(--accent-calories)',
                                            borderRadius: '0 4px 4px 0'
                                        }}
                                    />
                                )}
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="nav-label" style={{ fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '12px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--card-border)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-calories)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={18} color="white" />
                        </div>
                        <div className="nav-label" style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.email?.split('@')[0] || 'User'}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.isPro ? 'Pro Member' : 'Standard'}</p>
                        </div>
                    </div>

                    <button style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', justifyContent: 'flex-start' }}>
                        <Settings size={20} />
                        <span className="nav-label">Settings</span>
                    </button>
                    <button
                        onClick={logout}
                        style={{ background: '#fef2f2', color: '#ef4444', border: 'none', boxShadow: 'none', justifyContent: 'flex-start' }}
                    >
                        <LogOut size={20} />
                        <span className="nav-label">Logout</span>
                    </button>

                    {isInstallable && !isInstalled && (
                        <button
                            onClick={installApp}
                            style={{ 
                                marginTop: '12px',
                                background: 'var(--accent-calories)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '16px',
                                padding: '12px 16px',
                                justifyContent: 'flex-start',
                                fontWeight: '600'
                            }}
                        >
                            <Download size={20} />
                            <span className="nav-label">Install App</span>
                        </button>
                    )}
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
