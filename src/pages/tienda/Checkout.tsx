import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import Boton from '@/components/ui/Boton'
import { useCarrito } from '@/store/carrito'
import { listarZonasEnvio, encontrarZonaPorProvincia } from '@/services/datos/zonasEnvio'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { crearPedido } from '@/services/datos/pedidos'
import { formatearPrecio } from '@/utils/formato'
import { linkWhatsapp, normalizarWhatsappAR } from '@/utils/whatsapp'
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
  const [errorEnvio, setErrorEnvio] = useState('')
  const [pedidoCreado, setPedidoCreado] = useState<{ id: string; dni: string; total: number } | null>(null)

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

  // IMPORTANTE: este chequeo va PRIMERO, antes que cualquier otro que dependa
  // del carrito, y depende SOLO de pedidoCreado (no de config). Al confirmar
  // la compra vaciamos el carrito (items.length pasa a 0); si este bloque
  // exigiera también que `config` ya haya cargado, una carrera de timing
  // podría hacer que cayera en el chequeo de "carrito vacío" de más abajo y
  // te mandara de vuelta sin mostrar nada. Por eso acá adentro contemplamos
  // el caso de config todavía cargando por separado.
  if (pedidoCreado) {
    return (
      <LayoutTienda>
        <div className="contenedor checkout-exito">
          <h1>¡Gracias por tu compra! 🔥</h1>
          <p>Guardá este código para consultar el estado de tu pedido más adelante:</p>
          <p className="checkout-exito__codigo">{pedidoCreado.id}</p>

          {!config && <p style={{ color: 'var(--fg-muted)' }}>Cargando los datos de pago...</p>}

          {config && metodoPago === 'transferencia' && (
            <div className="checkout-exito__transferencia">
              <p className="checkout-exito__paso"><strong>1.</strong> Transferí <strong>{formatearPrecio(pedidoCreado.total)}</strong> a:</p>
              <p className="checkout-exito__datos">
                Alias: <strong>{config.transferencia.alias}</strong><br />
                Titular: {config.transferencia.titular}<br />
                Banco/billetera: {config.transferencia.bancoOBilletera}
              </p>
              <p className="checkout-exito__paso"><strong>2.</strong> Enviá el comprobante por WhatsApp:</p>
              <a
                className="checkout-exito__whatsapp"
                href={linkWhatsapp(config.tienda.whatsapp, `Hola! Te paso el comprobante del pedido #${pedidoCreado.id}`)}
                target="_blank" rel="noreferrer"
              >
                Enviar comprobante por WhatsApp
              </a>
              <p className="checkout-exito__paso" style={{ marginTop: 14 }}><strong>3.</strong> Te vamos a confirmar el pago por mail y ahí ya podés hacer seguimiento del envío.</p>
            </div>
          )}

          <Link to="/seguimiento" className="checkout-exito__seguimiento">Ir a Seguí tu pedido →</Link>
        </div>
      </LayoutTienda>
    )
  }

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

  // El WhatsApp del cliente se guarda SOLO con los dígitos locales (código de
  // área + número, sin 54/9): el prefijo "+54 9" queda fijo en pantalla para
  // que el cliente no pueda olvidarlo ni escribirlo mal — el mismo problema
  // que causaba que los links de WhatsApp no encontraran el número.
  const dniValido = /^\d{7,8}$/.test(form.dni)
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const whatsappValido = /^\d{8,10}$/.test(form.whatsapp)

  const mostrarErrorDni = form.dni.length > 0 && !dniValido
  const mostrarErrorEmail = form.email.length > 0 && !emailValido
  const mostrarErrorWhatsapp = form.whatsapp.length > 0 && !whatsappValido

  const formularioValido =
    form.cliente && dniValido && whatsappValido && emailValido &&
    form.localidad && form.codigoPostal && form.calle && form.numero &&
    form.aceptaLegales

  async function confirmarPedido() {
    if (!formularioValido || !zona) return
    setEnviando(true)
    setErrorEnvio('')

    try {
      const direccion: DireccionEnvio = {
        provincia, localidad: form.localidad, codigoPostal: form.codigoPostal,
        calle: form.calle, numero: form.numero, piso: form.piso, referencia: form.referencia
      }

      const ahora = new Date().toISOString()
      const id = await crearPedido({
        cliente: form.cliente, dni: form.dni, whatsapp: normalizarWhatsappAR(form.whatsapp), email: form.email,
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
        const resp = await fetch('/.netlify/functions/crear-preferencia-pago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedidoId: id })
        })
        const data = await resp.json()
        if (data.linkPago) {
          fetch('/.netlify/functions/notificar-pedido-creado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedidoId: id })
          }).catch(() => {})
          vaciar()
          window.location.href = data.linkPago
          return
        }
        throw new Error('No pudimos generar el link de pago')
      }

      vaciar()
      setPedidoCreado({ id, dni: form.dni, total })

      // Fire-and-forget: si el mail falla, no debe afectar la compra ya confirmada.
      fetch('/.netlify/functions/notificar-pedido-creado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: id })
      }).catch(() => {})
    } catch {
      setErrorEnvio('No pudimos registrar tu pedido. Revisá tu conexión e intentá de nuevo. Si el problema sigue, escribinos por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutTienda>
      <div className="contenedor checkout">
        <h1 className="checkout__titulo">Datos de envío y pago</h1>

        <section className="checkout__seccion">
          <h2>Tus datos</h2>
          <div className="checkout__grid">
            <input placeholder="Nombre y apellido" value={form.cliente} onChange={(e) => actualizarCampo('cliente', e.target.value)} />
            <div>
              <input
                placeholder="DNI (sin puntos)"
                inputMode="numeric"
                maxLength={8}
                value={form.dni}
                onChange={(e) => actualizarCampo('dni', e.target.value.replace(/\D/g, ''))}
                className={mostrarErrorDni ? 'checkout__input--error' : ''}
              />
              {mostrarErrorDni && <p className="checkout__campo-error">El DNI debe tener 7 u 8 números, sin puntos.</p>}
            </div>
            <div>
              <div className="checkout__whatsapp-wrap">
                <span className="checkout__whatsapp-prefijo">+54 9</span>
                <input
                  placeholder="1140848518"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.whatsapp}
                  onChange={(e) => actualizarCampo('whatsapp', e.target.value.replace(/\D/g, ''))}
                  className={mostrarErrorWhatsapp ? 'checkout__input--error' : ''}
                />
              </div>
              {mostrarErrorWhatsapp && <p className="checkout__campo-error">Ingresá tu número sin el 0 ni el 15 (ej: código de área + número).</p>}
            </div>
            <div>
              <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => actualizarCampo('email', e.target.value)}
                className={mostrarErrorEmail ? 'checkout__input--error' : ''}
              />
              {mostrarErrorEmail && <p className="checkout__campo-error">Revisá el formato del email (ej: nombre@mail.com).</p>}
            </div>
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

        {errorEnvio && <p className="checkout__error">{errorEnvio}</p>}

        <Boton disabled={!formularioValido || enviando} onClick={confirmarPedido}>
          {enviando ? 'Procesando...' : metodoPago === 'mercadopago' ? 'Ir a pagar' : 'Confirmar pedido'}
        </Boton>
      </div>
    </LayoutTienda>
  )
}
