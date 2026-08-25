import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import type { Configuracion } from '@/types'

const TITULOS: Record<string, string> = {
  terminos: 'Términos y Condiciones',
  privacidad: 'Política de Privacidad',
  'cambios-devoluciones': 'Cambios, devoluciones y derecho de arrepentimiento'
}

export default function Legales() {
  const { pagina } = useParams()
  const [config, setConfig] = useState<Configuracion | null>(null)

  useEffect(() => {
    obtenerConfiguracion().then(setConfig)
  }, [])

  const titulo = TITULOS[pagina ?? ''] ?? 'Legales'
  let texto = ''
  if (config) {
    if (pagina === 'terminos') texto = config.legales.textoTerminos
    if (pagina === 'privacidad') texto = config.legales.textoPrivacidad
    if (pagina === 'cambios-devoluciones') {
      texto = `Tenés ${config.legales.diasArrepentimiento} días desde que recibís tu pedido para arrepentirte de la compra, conforme a la Ley de Defensa del Consumidor.\n\n${config.legales.textoCambiosDevoluciones}`
    }
  }

  return (
    <LayoutTienda>
      <div className="contenedor" style={{ padding: '32px 0 64px', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: 20 }}>{titulo}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{texto}</p>
      </div>
    </LayoutTienda>
  )
}
