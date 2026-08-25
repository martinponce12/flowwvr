import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '@/services/firebase/auth'
import { useSesionAdmin } from '@/store/sesionAdmin'
import './layout-admin.css'

const ITEMS = [
  { to: '/admin', texto: 'Dashboard', fin: true },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/zonas-envio', texto: 'Zonas de envío' },
  { to: '/admin/promociones', texto: 'Promociones' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/configuracion', texto: 'Configuración' }
]

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const setUid = useSesionAdmin((s) => s.setUid)

  async function salir() {
    await logoutAdmin()
    setUid(null)
    navigate('/admin/login')
  }

  return (
    <div className="layout-admin">
      <aside className="layout-admin__sidebar">
        <p className="layout-admin__marca">FlowwVR</p>
        <nav>
          {ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.fin} className={({ isActive }) => isActive ? 'activo' : ''}>
              {item.texto}
            </NavLink>
          ))}
        </nav>
        <button className="layout-admin__salir" onClick={salir}>Cerrar sesión</button>
      </aside>
      <main className="layout-admin__contenido">{children}</main>
    </div>
  )
}
