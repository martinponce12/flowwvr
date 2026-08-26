import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { linkWhatsapp } from '@/utils/whatsapp'
import type { Configuracion } from '@/types'
import './footer.css'

export default function Footer() {
  const [config, setConfig] = useState<Configuracion | null>(null)

  useEffect(() => {
    obtenerConfiguracion().then(setConfig)
  }, [])

  if (!config) return null

  const linkWa = linkWhatsapp(config.tienda.whatsapp)
  const linkInstagram = `https://instagram.com/${config.tienda.instagram}`

  return (
    <footer className="footer">
      <div className="contenedor footer__inner">
        <div>
          <img src="/logo.png" alt={config.tienda.nombre} className="footer__logo" />
          <p>{config.tienda.tagline}</p>
        </div>

        <div className="footer__contacto">
          <a href={linkWa} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={linkInstagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={`mailto:${config.tienda.email}`}>{config.tienda.email}</a>
        </div>

        <div className="footer__legales">
          <Link to="/seguimiento">Seguí tu pedido</Link>
          <Link to="/legales/terminos">Términos y Condiciones</Link>
          <Link to="/legales/privacidad">Política de Privacidad</Link>
          <Link to="/legales/cambios-devoluciones">Cambios y devoluciones</Link>
        </div>

        <p className="footer__copy">Envíos a todo el país 🇦🇷 · {config.tienda.nombre} © {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
