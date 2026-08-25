import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Credenciales de Firebase Admin (cuenta de servicio), SOLO variables de
// entorno de Netlify. Se generan en Firebase Console → Configuración del
// proyecto → Cuentas de servicio → "Generar nueva clave privada".
// Esa clave da acceso TOTAL a Firestore, nunca va en el frontend.

let app: App

export function obtenerAppAdmin(): App {
  if (getApps().length > 0) return getApps()[0]

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Netlify guarda saltos de línea como \n literal en la env var.
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  })
  return app
}

export function obtenerDb() {
  obtenerAppAdmin()
  return getFirestore()
}
