import { create } from 'zustand'

interface EstadoSesionAdmin {
  uid: string | null
  cargando: boolean
  setUid: (uid: string | null) => void
  setCargando: (v: boolean) => void
}

export const useSesionAdmin = create<EstadoSesionAdmin>((set) => ({
  uid: null,
  cargando: true,
  setUid: (uid) => set({ uid }),
  setCargando: (cargando) => set({ cargando })
}))
