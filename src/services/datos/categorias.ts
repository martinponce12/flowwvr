import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import { categoriasMock } from '@/data/mock'
import type { Categoria } from '@/types'

const COL = 'categorias'
let demoData: Categoria[] = [...categoriasMock]

export async function listarCategorias(): Promise<Categoria[]> {
  if (modoDemo || !db) return demoData
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Categoria)
}

export async function crearCategoria(categoria: Omit<Categoria, 'id'>): Promise<string> {
  if (modoDemo || !db) {
    const id = `demo-${Date.now()}`
    demoData = [...demoData, { ...categoria, id }]
    return id
  }
  const ref = await addDoc(collection(db, COL), categoria)
  return ref.id
}

export async function actualizarCategoria(id: string, cambios: Partial<Categoria>): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.map((c) => (c.id === id ? { ...c, ...cambios } : c))
    return
  }
  await updateDoc(doc(db, COL, id), cambios)
}

export async function eliminarCategoria(id: string): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.filter((c) => c.id !== id)
    return
  }
  await deleteDoc(doc(db, COL, id))
}
