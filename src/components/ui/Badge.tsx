import './badge.css'

interface Props {
  tipo: 'destacado' | 'nuevo' | 'sin-stock' | 'ultimas-unidades'
}

const CONFIG: Record<Props['tipo'], { texto: string; clase: string }> = {
  destacado: { texto: 'Destacado', clase: 'badge--holo' },
  nuevo: { texto: 'Nuevo', clase: 'badge--ok' },
  'sin-stock': { texto: 'Sin stock', clase: 'badge--error' },
  'ultimas-unidades': { texto: 'Últimas unidades', clase: 'badge--warn' }
}

export default function Badge({ tipo }: Props) {
  const { texto, clase } = CONFIG[tipo]
  return <span className={`badge ${clase}`}>{texto}</span>
}
