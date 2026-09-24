import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import ImagenProducto from '@/components/ui/ImagenProducto'
import Boton from '@/components/ui/Boton'
import { useCarrito } from '@/store/carrito'
import { listarZonasEnvioActivas, encontrarZonaPorProvincia } from '@/services/datos/zonasEnvio'
import { buscarPromocionPorCodigo } from '@/services/datos/promociones'
import { formatearPrecio } from '@/utils/formato'
import type { ZonaEnvio, Promocion } from '@/types'
import './carrito.css'

const PROVINCIAS = [
  'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]

export default function Carrito() {
  const navigate = useNavigate()
  const { items, modificarCantidad, eliminarProducto, subtotal } = useCarrito()
  const [zonas, setZonas] = useState<ZonaEnvio[]>([])
  const [provincia, setProvincia] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [promoAplicada, setPromoAplicada] = useState<Promocion | null>(null)
  const [errorPromo, setErrorPromo] = useState('')

  useEffect(() => {
    listarZonasEnvioActivas().then(setZonas)
  }, [])

  const zonaSeleccionada = provincia ? encontrarZonaPorProvincia(zonas, provincia) : null
  const sub = subtotal()

  let descuento = 0
  let envioGratisPorPromo = false
  if (promoAplicada) {
    if (promoAplicada.tipo === 'porcentaje') descuento = Math.round(sub * (promoAplicada.valor / 100))
    if (promoAplicada.tipo === 'monto_fijo') descuento = Math.min(promoAplicada.valor, sub)
    if (promoAplicada.tipo === 'envio_gratis') envioGratisPorPromo = true
  }

  const costoEnvio = envioGratisPorPromo ? 0 : (zonaSeleccionada?.tarifa ?? 0)
  const total = sub - descuento + costoEnvio

  async function aplicarCodigo() {
    setErrorPromo('')
    const promo = await buscarPromocionPorCodigo(codigoInput)
    if (!promo) {
      setErrorPromo('Código inválido o vencido.')
      setPromoAplicada(null)
      return
    }
    setPromoAplicada(promo)
  }

  if (items.length === 0) {
    return (
      <LayoutTienda>
        <div className="contenedor carrito-vacio">
          <p>Tu carrito está vacío.</p>
          <Link to="/catalogo"><Boton>Ver catálogo</Boton></Link>
        </div>
      </LayoutTienda>
    )
  }

  return (
    <LayoutTienda>
      <div className="contenedor carrito">
        <h1 className="carrito__titulo">Carrito</h1>

        <div className="carrito__items">
          {items.map((item) => (
            <div key={item.productoId} className="carrito__item">
              <div className="carrito__item-imagen">
                <ImagenProducto
                  imagenes={item.imagenUrl ? [item.imagenUrl] : undefined}
                  colorPlaceholder={item.colorPlaceholder}
                  nombre={item.nombre}
                />
              </div>
              <div className="carrito__item-info">
                <p className="carrito__item-nombre">{item.nombre}</p>
                <p className="carrito__item-precio">{formatearPrecio(item.precioUnitario)}</p>
                <div className="carrito__item-cantidad">
                  <button onClick={() => modificarCantidad(item.productoId, item.cantidad - 1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => modificarCantidad(item.productoId, item.cantidad + 1)}>+</button>
                  <button className="carrito__item-quitar" onClick={() => eliminarProducto(item.productoId)}>Quitar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="carrito__promo">
          <input
            placeholder="Código promocional"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
          />
          <button onClick={aplicarCodigo}>Aplicar</button>
        </div>
        {errorPromo && <p className="carrito__error">{errorPromo}</p>}
        {promoAplicada && <p className="carrito__promo-ok">Código {promoAplicada.codigo} aplicado ✓</p>}

        <div className="carrito__envio">
          <label htmlFor="provincia">Provincia de envío</label>
          <select id="provincia" value={provincia} onChange={(e) => setProvincia(e.target.value)}>
            <option value="">Seleccioná tu provincia</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {provincia && !zonaSeleccionada && (
            <p className="carrito__error">
              No tenemos una zona configurada para tu provincia todavía. Escribinos por WhatsApp para coordinar el envío.
            </p>
          )}
          {zonaSeleccionada && (
            <p className="carrito__zona-info">{zonaSeleccionada.nombre} · {zonaSeleccionada.plazoEstimado}</p>
          )}
        </div>

        <div className="carrito__totales">
          <div className="carrito__fila"><span>Subtotal</span><span>{formatearPrecio(sub)}</span></div>
          {descuento > 0 && <div className="carrito__fila carrito__fila--descuento"><span>Descuento</span><span>-{formatearPrecio(descuento)}</span></div>}
          <div className="carrito__fila"><span>Envío</span><span>{provincia ? formatearPrecio(costoEnvio) : '—'}</span></div>
          <div className="carrito__fila carrito__fila--total"><span>Total</span><span>{formatearPrecio(total)}</span></div>
        </div>

        <Boton
          disabled={!provincia || (!!provincia && !zonaSeleccionada)}
          onClick={() => navigate('/checkout', { state: { provincia, promoAplicada, envioGratisPorPromo } })}
        >
          Continuar a datos de envío
        </Boton>
      </div>
    </LayoutTienda>
  )
}
