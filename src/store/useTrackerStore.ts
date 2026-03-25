import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface TrackerState {
    dailyStats: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        steps: number;
        lastReset: string;
    };
    mealHistory: {
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        timestamp: string;
        type: 'food' | 'exercise';
        image?: string;
    }[];
    weightHistory: { date: string; weight: number }[];
    user: {
        isLoggedIn: boolean;
        uid: string | null;
        email: string | null;
        isPro: boolean;
    };

    // Actions
    addMeal: (meal: { name: string; calories: number; protein: number; carbs: number; fats: number; image?: string }) => void;
    addExercise: (exercise: { name: string; calories: number; duration: string }) => void;
    updateSteps: (steps: number) => void;
    addWeight: (weight: number) => void;
    setUser: (user: { uid: string; email: string | null }) => void;
    bypassLogin: () => void;
    logout: () => void;
    checkAndReset: () => void;
    syncWithFirestore: () => void;
    saveToFirestore: (data: any) => Promise<void>;
}

const DEFAULT_STATS = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    steps: 0,
    lastReset: new Date().toISOString(),
};

export const useTrackerStore = create<TrackerState>()(
    persist(
        (set, get) => ({
            dailyStats: { ...DEFAULT_STATS },
            mealHistory: [],
            weightHistory: [],
            user: {
                isLoggedIn: false,
                uid: null,
                email: null,
                isPro: false,
            },

            setUser: (userData) => {
                set({
                    user: { isLoggedIn: true, uid: userData.uid, email: userData.email, isPro: true }
                });
                get().syncWithFirestore();
            },

            bypassLogin: () => {
                set({
                    user: { isLoggedIn: true, uid: 'demo-uid', email: 'demo@macrolens.ai', isPro: true }
                });
            },

            logout: () => {
                auth.signOut();
                set({
                    user: { isLoggedIn: false, uid: null, email: null, isPro: false },
                    dailyStats: { ...DEFAULT_STATS },
                    weightHistory: []
                });
            },

            addMeal: (meal) => {
                get().checkAndReset();
                const { dailyStats, mealHistory } = get();
                const newMeal = {
                    ...meal,
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString(),
                    type: 'food' as const
                };
                const newState = {
                    dailyStats: {
                        ...dailyStats,
                        calories: dailyStats.calories + (meal.calories || 0),
                        protein: dailyStats.protein + (meal.protein || 0),
                        carbs: dailyStats.carbs + (meal.carbs || 0),
                        fats: dailyStats.fats + (meal.fats || 0),
                    },
                    mealHistory: [newMeal, ...mealHistory]
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            addExercise: (exercise) => {
                get().checkAndReset();
                const { dailyStats, mealHistory } = get();
                const newExercise = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: exercise.name,
                    calories: exercise.calories,
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                    timestamp: new Date().toISOString(),
                    type: 'exercise' as const,
                    duration: exercise.duration // We'll handle this in the UI
                };
                const newState = {
                    dailyStats: {
                        ...dailyStats,
                        calories: dailyStats.calories - (exercise.calories || 0), // Burned calories subtract from total or we handle differently in UI
                    },
                    mealHistory: [newExercise, ...mealHistory]
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            updateSteps: (steps) => {
                get().checkAndReset();
                const newState = {
                    dailyStats: { ...get().dailyStats, steps }
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            addWeight: (weight) => {
                const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const newState = {
                    weightHistory: [...get().weightHistory, { date: today, weight }]
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            checkAndReset: () => {
                const lastReset = new Date(get().dailyStats.lastReset);
                const now = new Date();

                if (
                    now.getDate() !== lastReset.getDate() ||
                    now.getMonth() !== lastReset.getMonth() ||
                    now.getFullYear() !== lastReset.getFullYear()
                ) {
                    const resetState = {
                        dailyStats: { ...DEFAULT_STATS, lastReset: now.toISOString() },
                        mealHistory: get().mealHistory // Retain history for viewing past dates
                    };
                    set(resetState);
                    get().saveToFirestore(resetState);
                }
            },

            saveToFirestore: async (data: any) => {
                const { uid } = get().user;
                if (!uid || uid === 'demo-uid') return;
                try {
                    await setDoc(doc(db, 'users', uid), data, { merge: true });
                    console.log("☁️ Successfully synced to Firestore for user:", uid);
                } catch (error: any) {
                    console.error("❌ Error saving to Firestore:", error.message, error.code);
                    if (error.code === 'permission-denied') {
                        console.error("👉 Check your Firestore Security Rules!");
                    }
                }
            },

            syncWithFirestore: () => {
                const { uid } = get().user;
                if (!uid || uid === 'demo-uid') return;

                getDoc(doc(db, 'users', uid)).then((docSnap) => {
                    if (docSnap.exists()) {
                        set(docSnap.data());
                    } else {
                        get().saveToFirestore({
                            dailyStats: get().dailyStats,
                            weightHistory: get().weightHistory
                        });
                    }
                });
            }
        }),
        {
            name: 'macrolens-firebase-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
