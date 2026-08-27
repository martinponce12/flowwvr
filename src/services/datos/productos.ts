import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where
} from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import { limpiarUndefined } from '@/utils/firestoreHelpers'
import { productosMock } from '@/data/mock'
import type { Producto } from '@/types'

const COL = 'productos'

// Estado en memoria para modo demo (permite crear/editar/borrar sin backend
// mientras no hay credenciales de Firebase cargadas).
let demoData: Producto[] = [...productosMock]

export async function listarProductosPublicados(): Promise<Producto[]> {
  if (modoDemo || !db) return demoData.filter((p) => p.publicado)
  const q = query(collection(db, COL), where('publicado', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Producto)
}

export async function listarTodosLosProductos(): Promise<Producto[]> {
  if (modoDemo || !db) return demoData
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Producto)
}

export async function obtenerProducto(id: string): Promise<Producto | null> {
  if (modoDemo || !db) return demoData.find((p) => p.id === id) ?? null
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Producto) : null
}

export async function crearProducto(producto: Omit<Producto, 'id'>): Promise<string> {
  if (modoDemo || !db) {
    const id = `demo-${Date.now()}`
    demoData = [...demoData, { ...producto, id }]
    return id
  }
  const ref = await addDoc(collection(db, COL), limpiarUndefined(producto))
  return ref.id
}

export async function actualizarProducto(id: string, cambios: Partial<Producto>): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.map((p) => (p.id === id ? { ...p, ...cambios } : p))
    return
  }
  await updateDoc(doc(db, COL, id), limpiarUndefined(cambios))
}

export async function eliminarProducto(id: string): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.filter((p) => p.id !== id)
    return
  }
  await deleteDoc(doc(db, COL, id))
}
