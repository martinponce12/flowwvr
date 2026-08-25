import type { ButtonHTMLAttributes } from 'react'
import './boton.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'fantasma'
}

export default function Boton({ variante = 'primario', className = '', ...rest }: Props) {
  return <button className={`boton boton--${variante} ${className}`} {...rest} />
}
