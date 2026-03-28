import { initializeApp, type FirebaseApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app: FirebaseApp | null = null
let auth: Auth | null = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
}

export { auth }

const googleProvider = isConfigured ? new GoogleAuthProvider() : null

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    console.warn("[Lumio] Firebase not configured — using dev mode")
    return null
  }
  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  if (!auth) return
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    // Dev mode: no Firebase, report no user immediately
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function getIdToken(): Promise<string | null> {
  if (!auth) return null
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
