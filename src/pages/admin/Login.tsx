import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Boton from '@/components/ui/Boton'
import { loginAdmin, esAdministrador } from '@/services/firebase/auth'
import { modoDemo } from '@/services/firebase/config'
import { useSesionAdmin } from '@/store/sesionAdmin'
import './login.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const setUid = useSesionAdmin((s) => s.setUid)
  const setCargando = useSesionAdmin((s) => s.setCargando)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargandoLocal, setCargandoLocal] = useState(false)

  async function iniciarSesion() {
    setError('')
    setCargandoLocal(true)
    try {
      const { user } = await loginAdmin(email, password)
      const esAdmin = await esAdministrador(user.uid)
      if (!esAdmin) {
        setError('Esta cuenta no tiene permisos de administrador.')
        setCargandoLocal(false)
        return
      }
      setUid(user.uid)
      setCargando(false)
      navigate('/admin')
    } catch {
      setError('Email o contraseña incorrectos.')
      setCargandoLocal(false)
    }
  }

  return (
    <div className="login-admin">
      <div className="login-admin__card">
        <h1 className="login-admin__marca">FlowwVR Admin</h1>
        {modoDemo && (
          <p className="login-admin__demo">
            Modo demo: todavía no cargaste credenciales de Firebase. Podés entrar con cualquier email/contraseña para probar el panel.
          </p>
        )}
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="login-admin__error">{error}</p>}
        <Boton disabled={cargandoLocal || !email || !password} onClick={iniciarSesion}>
          {cargandoLocal ? 'Ingresando...' : 'Ingresar'}
        </Boton>
      </div>
    </div>
  )
}
