import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import { obtenerConfiguracion, guardarConfiguracion } from '@/services/datos/configuracion'
import type { Configuracion } from '@/types'
import '@/styles/admin-comun.css'

export default function AdminConfiguracion() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    obtenerConfiguracion().then(setConfig)
  }, [])

  if (!config) return <LayoutAdmin><p>Cargando...</p></LayoutAdmin>

  async function guardar() {
    if (!config) return
    await guardarConfiguracion(config)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  return (
    <LayoutAdmin>
      <h1 className="admin-titulo">Configuración</h1>

      <div className="admin-form">
        <h2 style={{ fontSize: '0.95rem', color: 'var(--fg-muted)' }}>Negocio</h2>
        <div><label>Nombre</label><input value={config.tienda.nombre} onChange={(e) => setConfig({ ...config, tienda: { ...config.tienda, nombre: e.target.value } })} /></div>
        <div><label>Tagline</label><input value={config.tienda.tagline ?? ''} onChange={(e) => setConfig({ ...config, tienda: { ...config.tienda, tagline: e.target.value } })} /></div>
        <div><label>WhatsApp (con código de país, sin +, ej: 5491100000000)</label><input value={config.tienda.whatsapp} onChange={(e) => setConfig({ ...config, tienda: { ...config.tienda, whatsapp: e.target.value } })} /></div>
        <div><label>Instagram (usuario, sin @)</label><input value={config.tienda.instagram} onChange={(e) => setConfig({ ...config, tienda: { ...config.tienda, instagram: e.target.value } })} /></div>
        <div><label>Email de contacto</label><input value={config.tienda.email} onChange={(e) => setConfig({ ...config, tienda: { ...config.tienda, email: e.target.value } })} /></div>
      </div>

      <div className="admin-form">
        <h2 style={{ fontSize: '0.95rem', color: 'var(--fg-muted)' }}>Transferencia</h2>
        <div><label>Alias</label><input value={config.transferencia.alias} onChange={(e) => setConfig({ ...config, transferencia: { ...config.transferencia, alias: e.target.value } })} /></div>
        <div><label>Titular</label><input value={config.transferencia.titular} onChange={(e) => setConfig({ ...config, transferencia: { ...config.transferencia, titular: e.target.value } })} /></div>
        <div><label>Banco / billetera</label><input value={config.transferencia.bancoOBilletera} onChange={(e) => setConfig({ ...config, transferencia: { ...config.transferencia, bancoOBilletera: e.target.value } })} /></div>
      </div>

      <div className="admin-form">
        <h2 style={{ fontSize: '0.95rem', color: 'var(--fg-muted)' }}>Legales</h2>
        <div><label>Días para arrepentimiento</label><input type="number" value={config.legales.diasArrepentimiento} onChange={(e) => setConfig({ ...config, legales: { ...config.legales, diasArrepentimiento: Number(e.target.value) } })} /></div>
        <div><label>Términos y Condiciones</label><textarea rows={4} value={config.legales.textoTerminos} onChange={(e) => setConfig({ ...config, legales: { ...config.legales, textoTerminos: e.target.value } })} /></div>
        <div><label>Política de Privacidad</label><textarea rows={4} value={config.legales.textoPrivacidad} onChange={(e) => setConfig({ ...config, legales: { ...config.legales, textoPrivacidad: e.target.value } })} /></div>
        <div><label>Cambios y devoluciones</label><textarea rows={4} value={config.legales.textoCambiosDevoluciones} onChange={(e) => setConfig({ ...config, legales: { ...config.legales, textoCambiosDevoluciones: e.target.value } })} /></div>
      </div>

      <div className="admin-form">
        <h2 style={{ fontSize: '0.95rem', color: 'var(--fg-muted)' }}>Stock</h2>
        <div><label>Umbral de stock bajo</label><input type="number" value={config.stock.umbralStockBajo} onChange={(e) => setConfig({ ...config, stock: { ...config.stock, umbralStockBajo: Number(e.target.value) } })} /></div>
      </div>

      <Boton onClick={guardar}>{guardado ? 'Guardado ✓' : 'Guardar cambios'}</Boton>
    </LayoutAdmin>
  )
}
