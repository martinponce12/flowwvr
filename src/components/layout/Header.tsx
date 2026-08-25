import { Link } from 'react-router-dom'
import { useCarrito } from '@/store/carrito'
import './header.css'

export default function Header() {
  const cantidadItems = useCarrito((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))

  return (
    <header className="header">
      <div className="contenedor header__inner">
        <Link to="/" className="header__logo" aria-label="FlowwVR — inicio">
          <img src="/logo.png" alt="FlowwVR" className="header__logo-img" />
        </Link>

        <nav className="header__nav">
          <Link to="/catalogo">Catálogo</Link>
        </nav>

        <Link to="/carrito" className="header__carrito" aria-label="Ver carrito">
          🛒
          {cantidadItems > 0 && <span className="header__carrito-badge">{cantidadItems}</span>}
        </Link>
      </div>
    </header>
  )
}
