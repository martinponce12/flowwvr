import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import { configuracionMock } from '@/data/mock'
import type { Configuracion } from '@/types'

const DOC = 'configuracion/general'
let demoData: Configuracion = { ...configuracionMock }

export async function obtenerConfiguracion(): Promise<Configuracion> {
  if (modoDemo || !db) return demoData
  const snap = await getDoc(doc(db, DOC))
  return snap.exists() ? (snap.data() as Configuracion) : configuracionMock
}

export async function guardarConfiguracion(config: Configuracion): Promise<void> {
  if (modoDemo || !db) {
    demoData = config
    return
  }
  await setDoc(doc(db, DOC), config, { merge: true })
}
