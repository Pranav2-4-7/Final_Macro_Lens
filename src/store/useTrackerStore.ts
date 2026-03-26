import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth, db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface TrackerState {
    dailyStats: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        steps: number;
        waterIntake: number;
        exerciseCalories: number;
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
        hasCompletedOnboarding: boolean;
    };
    settings: {
        macrosView: boolean;
        isMetric: boolean;
    };
    profile: {
        weightGoal: number;
        currentWeight: number;
        height: number;
        workoutFrequency: number; // days per week
        weeklyGoal: number; // kg change per week
        calorieGoal: number;
        stepGoal: number;
        dietType: string;
        gender: 'male' | 'female' | 'other';
        age: number;
    };

    // Actions
    addMeal: (meal: { name: string; calories: number; protein: number; carbs: number; fats: number; image?: string }) => void;
    addExercise: (exercise: { name: string; calories: number; duration: string }) => void;
    updateSteps: (steps: number) => void;
    addWater: (amount: number) => void;
    addActivity: (calories: number) => void;
    addWeight: (weight: number) => void;
    clearWeightHistory: () => void;
    setUser: (user: { uid: string; email: string | null }) => void;
    bypassLogin: () => void;
    logout: () => void;
    checkAndReset: () => void;
    syncWithFirestore: () => void | (() => void);
    saveToFirestore: (data: Partial<TrackerState> | any) => Promise<void>;
    updateSettings: (settings: Partial<TrackerState['settings']>) => void;
    updateProfile: (profile: Partial<TrackerState['profile']>) => void;
    completeOnboarding: (data: TrackerState['profile']) => void;
}

const DEFAULT_STATS = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    steps: 0,
    waterIntake: 0,
    exerciseCalories: 0,
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
                hasCompletedOnboarding: false,
            },
            settings: {
                macrosView: true,
                isMetric: true,
            },
            profile: {
                weightGoal: 80,
                currentWeight: 80,
                height: 175,
                workoutFrequency: 3,
                weeklyGoal: 0,
                calorieGoal: 2168,
                stepGoal: 8000,
                dietType: 'Non-Veg',
                gender: 'male',
                age: 25,
            },

            setUser: (userData) => {
                set({
                    user: { ...get().user, isLoggedIn: true, uid: userData.uid, email: userData.email, isPro: true }
                });
                get().syncWithFirestore();
            },

            bypassLogin: () => {
                set({
                    user: { 
                        isLoggedIn: true, 
                        uid: 'demo-uid', 
                        email: 'demo@macrolens.ai', 
                        isPro: true,
                        hasCompletedOnboarding: true 
                    }
                });
            },

            logout: () => {
                auth.signOut();
                set({
                    user: { isLoggedIn: false, uid: null, email: null, isPro: false, hasCompletedOnboarding: false },
                    dailyStats: { ...DEFAULT_STATS },
                    weightHistory: []
                });
            },

            completeOnboarding: (data) => {
                // Mifflin-St Jeor Calculation
                const bmr = (10 * data.currentWeight) + (6.25 * data.height) - (5 * data.age) + (data.gender === 'male' ? 5 : -161);
                
                // Refined Activity Multiplier based on standard TDEE tables
                let activityMultiplier = 1.2; // Sedentary
                if (data.workoutFrequency >= 1 && data.workoutFrequency <= 2) activityMultiplier = 1.375;
                else if (data.workoutFrequency >= 3 && data.workoutFrequency <= 4) activityMultiplier = 1.55;
                else if (data.workoutFrequency >= 5 && data.workoutFrequency <= 6) activityMultiplier = 1.725;
                else if (data.workoutFrequency >= 7) activityMultiplier = 1.9;
                
                const maintenanceCalories = bmr * activityMultiplier;
                
                // Weekly Goal Adjustment (1kg = 7700 kcal per week = 1100 per day)
                const dailyAdjustment = (data.weeklyGoal * 7700) / 7;
                const calorieGoal = Math.round(maintenanceCalories + dailyAdjustment);
                
                // Step Goal: Base 5000 + 1000 per workout day
                const stepGoal = 5000 + (data.workoutFrequency * 1000);

                set({
                    profile: { ...data, calorieGoal, stepGoal },
                    user: { ...get().user, hasCompletedOnboarding: true }
                });
                get().saveToFirestore({ profile: { ...data, calorieGoal, stepGoal }, user: { hasCompletedOnboarding: true } });
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

            addWater: (amount) => {
                get().checkAndReset();
                const newState = {
                    dailyStats: { ...get().dailyStats, waterIntake: get().dailyStats.waterIntake + amount }
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            addActivity: (calories) => {
                get().checkAndReset();
                const newState = {
                    dailyStats: { ...get().dailyStats, exerciseCalories: (get().dailyStats.exerciseCalories || 0) + calories }
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

            clearWeightHistory: () => {
                const newState = { weightHistory: [] };
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
                } catch (error: unknown) {
                    const err = error as { message: string; code: string };
                    console.error("❌ Error saving to Firestore:", err.message, err.code);
                    if (err.code === 'permission-denied') {
                        console.error("👉 Check your Firestore Security Rules!");
                    }
                }
            },

            syncWithFirestore: () => {
                const { uid } = get().user;
                if (!uid || uid === 'demo-uid') return;

                const userDocRef = doc(db, 'users', uid);
                
                // Real-time listener
                const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        
                        // Merge logic: only update if cloud data is different and we aren't mid-save
                        // For simplicity in a calorie tracker, we trust the cloud as the source of truth
                        set({
                            dailyStats: cloudData.dailyStats || get().dailyStats,
                            mealHistory: cloudData.mealHistory || get().mealHistory,
                            weightHistory: cloudData.weightHistory || get().weightHistory,
                            settings: cloudData.settings || get().settings,
                            profile: cloudData.profile || get().profile,
                            user: { ...get().user, hasCompletedOnboarding: cloudData.user?.hasCompletedOnboarding ?? get().user.hasCompletedOnboarding }
                        });
                        console.log("🔄 Real-time sync updated from Firestore");
                    }
                });

                return unsubscribe;
            },

            updateSettings: (newSettings) => {
                const newState = {
                    settings: { ...get().settings, ...newSettings }
                };
                set(newState);
                get().saveToFirestore(newState);
            },

            updateProfile: (newProfile) => {
                const newState = {
                    profile: { ...get().profile, ...newProfile }
                };
                set(newState);
                get().saveToFirestore(newState);
            }
        }),
        {
            name: 'macrolens-firebase-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
