import { collection, doc, getDocs, getDoc, addDoc, updateDoc, orderBy, query } from 'firebase/firestore'
import { db, modoDemo } from '../firebase/config'
import type { Pedido } from '@/types'

const COL = 'pedidos'
let demoData: Pedido[] = []

// La creación real de pedidos "en serio" (con validación de stock y precios
// server-side) pasa por una Netlify Function en Fase 6. Esta función de acá
// es la que usa el checkout para dejar el pedido en estado "pendiente_pago"
// antes de generar el link de pago / mostrar los datos de transferencia.
export async function crearPedido(pedido: Omit<Pedido, 'id'>): Promise<string> {
  if (modoDemo || !db) {
    const id = `demo-pedido-${Date.now()}`
    demoData = [...demoData, { ...pedido, id }]
    return id
  }
  const ref = await addDoc(collection(db, COL), pedido)
  return ref.id
}

export async function listarPedidos(): Promise<Pedido[]> {
  if (modoDemo || !db) return [...demoData].reverse()
  const q = query(collection(db, COL), orderBy('fechaCreacion', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pedido)
}

export async function obtenerPedido(id: string): Promise<Pedido | null> {
  if (modoDemo || !db) return demoData.find((p) => p.id === id) ?? null
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Pedido) : null
}

export async function actualizarPedido(id: string, cambios: Partial<Pedido>): Promise<void> {
  if (modoDemo || !db) {
    demoData = demoData.map((p) => (p.id === id ? { ...p, ...cambios } : p))
    return
  }
  await updateDoc(doc(db, COL, id), cambios)
}
