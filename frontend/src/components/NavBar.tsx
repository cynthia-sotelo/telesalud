import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function NavBar() {
  const { isAuthenticated, fullName, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar" data-testid="navbar">
      <Link to="/" className="navbar-brand">
        TeleSalud
      </Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            {role === 'SPECIALIST' ? (
              <Link to="/mis-horarios" data-testid="nav-mis-horarios">
                Mis horarios
              </Link>
            ) : (
              <Link to="/mis-turnos" data-testid="nav-mis-turnos">
                Mis turnos
              </Link>
            )}
            <span data-testid="nav-user-name">{fullName}</span>
            <button type="button" onClick={handleLogout} data-testid="nav-logout">
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" data-testid="nav-login">
              Ingresar
            </Link>
            <Link to="/registro" data-testid="nav-register">
              Registrarme
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
