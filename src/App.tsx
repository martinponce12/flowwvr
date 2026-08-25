import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Páginas de la tienda pública
import Inicio from './pages/tienda/Inicio'
import Catalogo from './pages/tienda/Catalogo'
import DetalleProducto from './pages/tienda/DetalleProducto'
import Carrito from './pages/tienda/Carrito'
import Checkout from './pages/tienda/Checkout'
import Legales from './pages/tienda/Legales'
import ResultadoPago from './pages/tienda/ResultadoPago'

// Páginas del panel admin (protegidas)
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProductos from './pages/admin/Productos'
import AdminCategorias from './pages/admin/Categorias'
import AdminZonasEnvio from './pages/admin/ZonasEnvio'
import AdminPromociones from './pages/admin/Promociones'
import AdminPedidos from './pages/admin/Pedidos'
import AdminConfiguracion from './pages/admin/Configuracion'
import RutaProtegidaAdmin from './components/admin/RutaProtegidaAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tienda pública */}
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/legales/:pagina" element={<Legales />} />
        <Route path="/checkout/:estado" element={<ResultadoPago />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RutaProtegidaAdmin><AdminDashboard /></RutaProtegidaAdmin>} />
        <Route path="/admin/productos" element={<RutaProtegidaAdmin><AdminProductos /></RutaProtegidaAdmin>} />
        <Route path="/admin/categorias" element={<RutaProtegidaAdmin><AdminCategorias /></RutaProtegidaAdmin>} />
        <Route path="/admin/zonas-envio" element={<RutaProtegidaAdmin><AdminZonasEnvio /></RutaProtegidaAdmin>} />
        <Route path="/admin/promociones" element={<RutaProtegidaAdmin><AdminPromociones /></RutaProtegidaAdmin>} />
        <Route path="/admin/pedidos" element={<RutaProtegidaAdmin><AdminPedidos /></RutaProtegidaAdmin>} />
        <Route path="/admin/configuracion" element={<RutaProtegidaAdmin><AdminConfiguracion /></RutaProtegidaAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}
