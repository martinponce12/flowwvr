import { type ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { suscribirseAAuth, esAdministrador } from '@/services/firebase/auth'
import { modoDemo } from '@/services/firebase/config'
import { useSesionAdmin } from '@/store/sesionAdmin'

export default function RutaProtegidaAdmin({ children }: { children: ReactNode }) {
  const { uid, cargando, setUid, setCargando } = useSesionAdmin()

  useEffect(() => {
    // En modo demo, el login ya setea el uid manualmente en el store
    // (no hay Firebase Auth real corriendo). No lo pisamos acá.
    if (modoDemo) {
      setCargando(false)
      return
    }
    const unsub = suscribirseAAuth(async (user) => {
      if (user) {
        const esAdmin = await esAdministrador(user.uid)
        setUid(esAdmin ? user.uid : null)
      } else {
        setUid(null)
      }
      setCargando(false)
    })
    return unsub
  }, [setUid, setCargando])

  if (cargando) return <div style={{ padding: 40 }}>Cargando...</div>
  if (!uid) return <Navigate to="/admin/login" replace />

  return <>{children}</>
}
