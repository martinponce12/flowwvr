import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import Boton from '@/components/ui/Boton'
import { useCarrito } from '@/store/carrito'
import { listarZonasEnvio, encontrarZonaPorProvincia } from '@/services/datos/zonasEnvio'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { crearPedido } from '@/services/datos/pedidos'
import { formatearPrecio } from '@/utils/formato'
import type { ZonaEnvio, Configuracion, Promocion, DireccionEnvio } from '@/types'
import './checkout.css'

// El Access Token de Mercado Pago solo existe del lado del servidor. Acá en
// el frontend detectamos si la integración está disponible consultando esta
// variable pública (se define en Fase 6 vía Netlify: VITE_MP_HABILITADO=true
// una vez que exista MERCADOPAGO_ACCESS_TOKEN configurado del lado server).
const mercadoPagoDisponible = import.meta.env.VITE_MP_HABILITADO === 'true'

export default function Checkout() {
  const location = useLocation() as { state?: { provincia?: string; promoAplicada?: Promocion; envioGratisPorPromo?: boolean } }
  const navigate = useNavigate()
  const { items, subtotal, vaciar } = useCarrito()
  const [zonas, setZonas] = useState<ZonaEnvio[]>([])
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [metodoPago, setMetodoPago] = useState<'mercadopago' | 'transferencia'>(
    mercadoPagoDisponible ? 'mercadopago' : 'transferencia'
  )
  const [enviando, setEnviando] = useState(false)
  const [pedidoCreado, setPedidoCreado] = useState<string | null>(null)

  const [form, setForm] = useState({
    cliente: '', dni: '', whatsapp: '', email: '', notasPersonalizacion: '',
    localidad: '', codigoPostal: '', calle: '', numero: '', piso: '', referencia: '',
    aceptaLegales: false
  })

  useEffect(() => {
    listarZonasEnvio().then(setZonas)
    obtenerConfiguracion().then(setConfig)
  }, [])

  const provincia = location.state?.provincia ?? ''
  const promoAplicada = location.state?.promoAplicada
  const envioGratisPorPromo = location.state?.envioGratisPorPromo ?? false
  const zona = encontrarZonaPorProvincia(zonas, provincia)

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }
  if (!provincia || !zona) {
    navigate('/carrito')
    return null
  }

  const sub = subtotal()
  let descuento = 0
  if (promoAplicada) {
    if (promoAplicada.tipo === 'porcentaje') descuento = Math.round(sub * (promoAplicada.valor / 100))
    if (promoAplicada.tipo === 'monto_fijo') descuento = Math.min(promoAplicada.valor, sub)
  }
  const costoEnvio = envioGratisPorPromo ? 0 : zona.tarifa
  const total = sub - descuento + costoEnvio

  function actualizarCampo(campo: string, valor: string | boolean) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  const formularioValido =
    form.cliente && form.dni && form.whatsapp && form.email &&
    form.localidad && form.codigoPostal && form.calle && form.numero &&
    form.aceptaLegales

  async function confirmarPedido() {
    if (!formularioValido || !zona) return
    setEnviando(true)

    const direccion: DireccionEnvio = {
      provincia, localidad: form.localidad, codigoPostal: form.codigoPostal,
      calle: form.calle, numero: form.numero, piso: form.piso, referencia: form.referencia
    }

    const ahora = new Date().toISOString()
    const id = await crearPedido({
      cliente: form.cliente, dni: form.dni, whatsapp: form.whatsapp, email: form.email,
      notasPersonalizacion: form.notasPersonalizacion || undefined,
      direccion,
      productos: items,
      subtotal: sub,
      promocionId: promoAplicada?.id,
      descuento,
      zonaEnvioId: zona.id,
      costoEnvio,
      total,
      metodoPago,
      estadoPago: metodoPago === 'transferencia' ? 'esperando_comprobante' : 'pendiente',
      estadoPedido: metodoPago === 'transferencia' ? 'esperando_comprobante' : 'pendiente_pago',
      fechaCreacion: ahora,
      fechaActualizacion: ahora
    })

    if (metodoPago === 'mercadopago') {
      // Fase 6: llamar a /.netlify/functions/crear-preferencia-pago con { pedidoId: id }
      // y redirigir a la respuesta.linkPago. Placeholder mientras tanto:
      try {
        const resp = await fetch('/.netlify/functions/crear-preferencia-pago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: id })
        })
        const data = await resp.json()
        if (data.linkPago) {
          vaciar()
          window.location.href = data.linkPago
          return
        }
      } catch {
        // si falla, dejamos ver la pantalla de confirmación igual
      }
    }

    vaciar()
    setPedidoCreado(id)
    setEnviando(false)
  }

  if (pedidoCreado && config) {
    return (
      <LayoutTienda>
        <div className="contenedor checkout-exito">
          <h1>¡Gracias por tu compra! 🔥</h1>
          <p>Tu pedido <strong>#{pedidoCreado}</strong> quedó registrado.</p>
          {metodoPago === 'transferencia' && (
            <div className="checkout-exito__transferencia">
              <p>Transferí <strong>{formatearPrecio(total)}</strong> a:</p>
              <p>Alias: <strong>{config.transferencia.alias}</strong></p>
              <p>Titular: {config.transferencia.titular}</p>
              <p>Banco/billetera: {config.transferencia.bancoOBilletera}</p>
              <a
                className="checkout-exito__whatsapp"
                href={`https://wa.me/${config.tienda.whatsapp}?text=${encodeURIComponent(`Hola! Te paso el comprobante del pedido #${pedidoCreado}`)}`}
                target="_blank" rel="noreferrer"
              >
                Enviar comprobante por WhatsApp
              </a>
            </div>
          )}
        </div>
      </LayoutTienda>
    )
  }

  return (
    <LayoutTienda>
      <div className="contenedor checkout">
        <h1 className="checkout__titulo">Datos de envío y pago</h1>

        <section className="checkout__seccion">
          <h2>Tus datos</h2>
          <div className="checkout__grid">
            <input placeholder="Nombre y apellido" value={form.cliente} onChange={(e) => actualizarCampo('cliente', e.target.value)} />
            <input placeholder="DNI" value={form.dni} onChange={(e) => actualizarCampo('dni', e.target.value)} />
            <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => actualizarCampo('whatsapp', e.target.value)} />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => actualizarCampo('email', e.target.value)} />
          </div>
        </section>

        <section className="checkout__seccion">
          <h2>Dirección de entrega ({provincia})</h2>
          <div className="checkout__grid">
            <input placeholder="Localidad" value={form.localidad} onChange={(e) => actualizarCampo('localidad', e.target.value)} />
            <input placeholder="Código postal" value={form.codigoPostal} onChange={(e) => actualizarCampo('codigoPostal', e.target.value)} />
            <input placeholder="Calle" value={form.calle} onChange={(e) => actualizarCampo('calle', e.target.value)} />
            <input placeholder="Número" value={form.numero} onChange={(e) => actualizarCampo('numero', e.target.value)} />
            <input placeholder="Piso / depto (opcional)" value={form.piso} onChange={(e) => actualizarCampo('piso', e.target.value)} />
            <input placeholder="Referencia (opcional)" value={form.referencia} onChange={(e) => actualizarCampo('referencia', e.target.value)} />
          </div>
        </section>

        <section className="checkout__seccion">
          <h2>Notas de personalización (opcional)</h2>
          <textarea
            placeholder="¿Algo que quieras contarnos para tu pedido? Lo coordinamos por WhatsApp."
            value={form.notasPersonalizacion}
            onChange={(e) => actualizarCampo('notasPersonalizacion', e.target.value)}
          />
        </section>

        <section className="checkout__seccion">
          <h2>Método de pago</h2>
          <div className="checkout__pago-opciones">
            {mercadoPagoDisponible && (
              <label className={`checkout__pago-opcion ${metodoPago === 'mercadopago' ? 'checkout__pago-opcion--activa' : ''}`}>
                <input type="radio" checked={metodoPago === 'mercadopago'} onChange={() => setMetodoPago('mercadopago')} />
                Mercado Pago (tarjeta, cuotas, dinero en cuenta)
              </label>
            )}
            <label className={`checkout__pago-opcion ${metodoPago === 'transferencia' ? 'checkout__pago-opcion--activa' : ''}`}>
              <input type="radio" checked={metodoPago === 'transferencia'} onChange={() => setMetodoPago('transferencia')} />
              Transferencia bancaria / alias
            </label>
          </div>
        </section>

        <label className="checkout__legales">
          <input type="checkbox" checked={form.aceptaLegales} onChange={(e) => actualizarCampo('aceptaLegales', e.target.checked)} />
          Acepto los <a href="/legales/terminos" target="_blank" rel="noreferrer">Términos y Condiciones</a> y la{' '}
          <a href="/legales/cambios-devoluciones" target="_blank" rel="noreferrer">Política de Cambios y Devoluciones</a>.
        </label>

        <div className="checkout__totales">
          <div className="carrito__fila"><span>Subtotal</span><span>{formatearPrecio(sub)}</span></div>
          {descuento > 0 && <div className="carrito__fila"><span>Descuento</span><span>-{formatearPrecio(descuento)}</span></div>}
          <div className="carrito__fila"><span>Envío ({zona.nombre})</span><span>{formatearPrecio(costoEnvio)}</span></div>
          <div className="carrito__fila carrito__fila--total"><span>Total</span><span>{formatearPrecio(total)}</span></div>
        </div>

        <Boton disabled={!formularioValido || enviando} onClick={confirmarPedido}>
          {enviando ? 'Procesando...' : metodoPago === 'mercadopago' ? 'Ir a pagar' : 'Confirmar pedido'}
        </Boton>
      </div>
    </LayoutTienda>
  )
}
