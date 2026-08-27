import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import { limpiarUndefined } from '@/utils/firestoreHelpers'
import { promocionesMock } from '@/data/mock'
import type { Promocion } from '@/types'

const COL = 'promociones'
let demoData: Promocion[] = [...promocionesMock]

export async function listarPromociones(): Promise<Promocion[]> {
  if (modoDemo || !db) return demoData
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Promocion)
}

export async function buscarPromocionPorCodigo(codigo: string): Promise<Promocion | null> {
  const normalizado = codigo.trim().toUpperCase()
  if (modoDemo || !db) {
    return demoData.find((p) => p.codigo.toUpperCase() === normalizado && p.activa) ?? null
  }
  const q = query(collection(db, COL), where('codigo', '==', normalizado), where('activa', '==', true))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Promocion
}

export async function crearPromocion(promo: Omit<Promocion, 'id'>): Promise<string> {
  if (modoDemo || !db) {
    const id = `demo-${Date.now()}`
    demoData = [...demoData, { ...promo, id }]
    return id
  }
  const ref = await addDoc(collection(db, COL), limpiarUndefined(promo))
  return ref.id
}

export async function actualizarPromocion(id: string, cambios: Partial<Promocion>): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.map((p) => (p.id === id ? { ...p, ...cambios } : p))
    return
  }
  await updateDoc(doc(db, COL, id), limpiarUndefined(cambios))
}

export async function eliminarPromocion(id: string): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.filter((p) => p.id !== id)
    return
  }
  await deleteDoc(doc(db, COL, id))
}
