import { Navigate, Route, Routes } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { MyBookingsPage } from './pages/MyBookingsPage'
import { RegisterPage } from './pages/RegisterPage'
import { SpecialistDetailPage } from './pages/SpecialistDetailPage'
import { SpecialistSchedulePage } from './pages/SpecialistSchedulePage'
import { SpecialistsPage } from './pages/SpecialistsPage'

function App() {
  return (
    <>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/especialistas" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/especialistas" element={<SpecialistsPage />} />
          <Route path="/especialistas/:id" element={<SpecialistDetailPage />} />
          <Route
            path="/mis-turnos"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-horarios"
            element={
              <ProtectedRoute>
                <SpecialistSchedulePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App
