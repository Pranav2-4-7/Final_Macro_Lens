import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to remove any hidden spaces, invisible characters, or accidental quotes from env variables
const sanitize = (val: any) => {
    if (typeof val !== 'string') return val;
    return val
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible characters
        .replace(/['"]/g, '')                  // Remove accidental quotes
        .trim();                               // Remove leading/trailing whitespace
};

const firebaseConfig = {
    apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID)
};

// Mask sensitive values for logging
const mask = (str: string | undefined) => str ? `${str.slice(0, 4)}...${str.slice(-4)} (Length: ${str.length})` : "UNDEFINED";

console.log("🔥 Firebase Config Verification:", {
    apiKey: mask(firebaseConfig.apiKey),
    projectId: firebaseConfig.projectId || "MISSING",
    authDomain: firebaseConfig.authDomain || "MISSING",
    appId: mask(firebaseConfig.appId)
});

// Check if the key looks like a Firebase key (usually 39 chars starting with AIza)
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIza")) {
    console.error("❌ CRITICAL: Your API Key does not look like a valid Firebase key. It should start with 'AIza'.");
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key") {
    console.error("❌ CRITICAL: Firebase API Key is missing or invalid. Check your .env file.");
}

// Initialize Firebase with safety check
let app;
try {
    if (!firebaseConfig.apiKey) throw new Error("Missing Firebase API Key");
    app = initializeApp(firebaseConfig);
} catch (e) {
    console.error("🔥 CRITICAL: Failed to initialize Firebase. App will not function properly without environment variables.", e);
    // Initialize a dummy app to prevent crash (this handles white screen but app will be broken)
    app = { delete: () => Promise.resolve() } as any; 
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
