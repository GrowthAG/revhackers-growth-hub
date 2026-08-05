import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`${name} não configurada.`);
  return value.trim();
}

let app: FirebaseApp | null = null;
console.log('[Firebase] Environment check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ set' : '✗ missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ set' : '✗ missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ set' : '✗ missing',
});

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp({
      apiKey: required('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
      authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: required('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
    });
  }
  return getAuth(app);
}
// Armazena token Firebase para uso em requisições GCP
export const FIREBASE_TOKEN_KEY = 'rh_firebase_id_token';

export async function requireGoogleIdToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  
  // Tenta obter token do usuário atual do Firebase
  if (user) {
    const token = await user.getIdToken();
    sessionStorage.setItem(FIREBASE_TOKEN_KEY, token);
    return token;
  }
  
  // Fallback: recupera token armazenado (para master login bypass)
  const storedToken = sessionStorage.getItem(FIREBASE_TOKEN_KEY);
  if (storedToken) {
    console.log('[Firebase] Usando token armazenado (fallback)');
    return storedToken;
  }
  
  throw new Error('Sessão Google ausente. Faça login novamente.');
}

export async function signInWithGooglePopup(): Promise<User> {
  console.log('[Firebase Auth] Starting Google sign-in...');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  console.log('[Firebase Auth] Provider configured, opening popup...');
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  console.log('[Firebase Auth] Sign-in successful, user:', result.user.email);
  return result.user;
}

export function observeGoogleAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function sendPasswordResetEmailFromFirebase(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function signOutGoogle(): Promise<void> {
  await signOut(getFirebaseAuth());
}
