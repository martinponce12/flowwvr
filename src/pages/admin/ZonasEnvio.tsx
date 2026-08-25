import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import { listarZonasEnvio, crearZonaEnvio, actualizarZonaEnvio, eliminarZonaEnvio } from '@/services/datos/zonasEnvio'
import { formatearPrecio } from '@/utils/formato'
import type { ZonaEnvio } from '@/types'
import '@/styles/admin-comun.css'

const VACIO: Omit<ZonaEnvio, 'id'> = { nombre: '', provincias: [], tarifa: 0, plazoEstimado: '', activa: true }

export default function AdminZonasEnvio() {
  const [zonas, setZonas] = useState<ZonaEnvio[]>([])
  const [form, setForm] = useState(VACIO)
  const [provinciasTexto, setProvinciasTexto] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  function cargar() { listarZonasEnvio().then(setZonas) }
  useEffect(cargar, [])

  async function guardar() {
    if (!form.nombre) return
    const datos = { ...form, provincias: provinciasTexto.split(',').map((p) => p.trim()).filter(Boolean) }
    if (editando) await actualizarZonaEnvio(editando, datos)
    else await crearZonaEnvio(datos)
    setMostrarForm(false)
    setForm(VACIO)
    setProvinciasTexto('')
    setEditando(null)
    cargar()
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta zona de envío?')) return
    await eliminarZonaEnvio(id)
    cargar()
  }

  return (
    <LayoutAdmin>
      <div className="admin-toolbar">
        <h1 className="admin-titulo" style={{ marginBottom: 0 }}>Zonas de envío</h1>
        <Boton onClick={() => { setForm(VACIO); setProvinciasTexto(''); setEditando(null); setMostrarForm(true) }}>+ Nueva zona</Boton>
      </div>

      {mostrarForm && (
        <div className="admin-form">
          <div><label>Nombre de la zona</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: CABA" /></div>
          <div>
            <label>Provincias incluidas (separadas por coma)</label>
            <textarea value={provinciasTexto} onChange={(e) => setProvinciasTexto(e.target.value)} placeholder="Ciudad Autónoma de Buenos Aires, Buenos Aires" />
          </div>
          <div><label>Tarifa ($)</label><input type="number" value={form.tarifa} onChange={(e) => setForm({ ...form, tarifa: Number(e.target.value) })} /></div>
          <div><label>Plazo estimado</label><input value={form.plazoEstimado} onChange={(e) => setForm({ ...form, plazoEstimado: e.target.value })} placeholder="Ej: 3 a 5 días hábiles" /></div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa</div>
          <div className="admin-form-acciones">
            <Boton onClick={guardar}>Guardar</Boton>
            <Boton variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </div>
        </div>
      )}

      <table className="admin-tabla">
        <thead><tr><th>Zona</th><th>Provincias</th><th>Tarifa</th><th>Plazo</th><th></th></tr></thead>
        <tbody>
          {zonas.map((z) => (
            <tr key={z.id}>
              <td>{z.nombre}</td>
              <td>{z.provincias.join(', ')}</td>
              <td>{formatearPrecio(z.tarifa)}</td>
              <td>{z.plazoEstimado}</td>
              <td style={{ display: 'flex', gap: 10 }}>
                <button className="admin-accion-link" onClick={() => { setForm({ nombre: z.nombre, provincias: z.provincias, tarifa: z.tarifa, plazoEstimado: z.plazoEstimado, activa: z.activa }); setProvinciasTexto(z.provincias.join(', ')); setEditando(z.id); setMostrarForm(true) }}>Editar</button>
                <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrar(z.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LayoutAdmin>
  )
}
