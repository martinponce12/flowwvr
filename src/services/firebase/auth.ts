import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, modoDemo } from './config'

// Un usuario de Firebase Auth solo cuenta como "administrador" de FLOWWVR
// si además existe como documento activo en la colección `administradores`.
// Esto es lo que permite tener más de un dueño/administrador sin hardcodear un UID.
export async function esAdministrador(uid: string): Promise<boolean> {
  if (modoDemo || !db) return true // en demo, cualquier login "admin" simulado entra
  const ref = doc(db, 'administradores', uid)
  const snap = await getDoc(ref)
  return snap.exists() && snap.data().activo === true
}

export function loginAdmin(email: string, password: string) {
  if (modoDemo || !auth) {
    // Login simulado en modo demo: no valida contraseña real.
    return Promise.resolve({ user: { uid: 'demo-admin', email } } as unknown as { user: User })
  }
  return signInWithEmailAndPassword(auth, email, password)
}

export function logoutAdmin() {
  if (modoDemo || !auth) return Promise.resolve()
  return signOut(auth)
}

export function suscribirseAAuth(callback: (user: User | null) => void) {
  if (modoDemo || !auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
