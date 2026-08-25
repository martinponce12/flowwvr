import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// Estas variables NO son secretas (la config web de Firebase es pública
// por diseño; la seguridad real la dan las Security Rules), pero de
// todas formas las mantenemos en variables de entorno para no hardcodear.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Modo demo: si todavía no cargaste las credenciales de Firebase (.env),
// la tienda funciona igual con los datos de ejemplo de src/data/mock.ts,
// para que puedas ver/probar la app desde el día 1. Apenas completes el
// .env con credenciales reales, esto pasa a false solo y la app usa
// Firestore de verdad sin tocar código.
export const modoDemo = !firebaseConfig.apiKey || !firebaseConfig.projectId

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (!modoDemo) {
  firebaseApp = initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
  db = getFirestore(firebaseApp)
  storage = getStorage(firebaseApp)
}

export { firebaseApp, auth, db, storage }
