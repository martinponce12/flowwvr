import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ItemCarrito, Producto } from '@/types'

interface EstadoCarrito {
  items: ItemCarrito[]
  codigoPromocional: string | null
  agregarProducto: (producto: Producto, cantidad?: number) => void
  modificarCantidad: (productoId: string, cantidad: number) => void
  eliminarProducto: (productoId: string) => void
  aplicarCodigo: (codigo: string) => void
  quitarCodigo: () => void
  vaciar: () => void
  subtotal: () => number
}

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set, get) => ({
      items: [],
      codigoPromocional: null,

      agregarProducto: (producto, cantidad = 1) => {
        if (producto.stockActual <= 0) return
        set((estado) => {
          const existente = estado.items.find((i) => i.productoId === producto.id)
          if (existente) {
            const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.stockActual)
            return {
              items: estado.items.map((i) =>
                i.productoId === producto.id ? { ...i, cantidad: nuevaCantidad } : i
              )
            }
          }
          return {
            items: [
              ...estado.items,
              {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precioPromocional ?? producto.precio,
                cantidad: Math.min(cantidad, producto.stockActual),
                imagenUrl: producto.imagenes?.[0],
                colorPlaceholder: producto.colorPlaceholder
              }
            ]
          }
        })
      },

      modificarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().eliminarProducto(productoId)
          return
        }
        set((estado) => ({
          items: estado.items.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i))
        }))
      },

      eliminarProducto: (productoId) => {
        set((estado) => ({ items: estado.items.filter((i) => i.productoId !== productoId) }))
      },

      aplicarCodigo: (codigo) => set({ codigoPromocional: codigo }),
      quitarCodigo: () => set({ codigoPromocional: null }),
      vaciar: () => set({ items: [], codigoPromocional: null }),

      subtotal: () => get().items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
    }),
    { name: 'flowwvr-carrito' }
  )
)
