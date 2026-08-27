import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import { limpiarUndefined } from '@/utils/firestoreHelpers'
import { zonasEnvioMock } from '@/data/mock'
import type { ZonaEnvio } from '@/types'

const COL = 'zonasEnvio'
let demoData: ZonaEnvio[] = [...zonasEnvioMock]

export async function listarZonasEnvio(): Promise<ZonaEnvio[]> {
  if (modoDemo || !db) return demoData
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ZonaEnvio)
}

export async function crearZonaEnvio(zona: Omit<ZonaEnvio, 'id'>): Promise<string> {
  if (modoDemo || !db) {
    const id = `demo-${Date.now()}`
    demoData = [...demoData, { ...zona, id }]
    return id
  }
  const ref = await addDoc(collection(db, COL), limpiarUndefined(zona))
  return ref.id
}

export async function actualizarZonaEnvio(id: string, cambios: Partial<ZonaEnvio>): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.map((z) => (z.id === id ? { ...z, ...cambios } : z))
    return
  }
  await updateDoc(doc(db, COL, id), limpiarUndefined(cambios))
}

export async function eliminarZonaEnvio(id: string): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.filter((z) => z.id !== id)
    return
  }
  await deleteDoc(doc(db, COL, id))
}

// Busca la zona que corresponde a una provincia dada (matching simple por nombre).
export function encontrarZonaPorProvincia(zonas: ZonaEnvio[], provincia: string): ZonaEnvio | null {
  return zonas.find((z) => z.activa && z.provincias.includes(provincia)) ?? null
}
