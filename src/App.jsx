import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Container, Paper, Typography } from '@mui/material'
import { AuthProvider, useAuth } from './auth/AuthContext'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SquadBuilderPage from './pages/SquadBuilderPage'

const RootRoute = () => {
  const { authChecked, isAuthenticated, isAdmin } = useAuth()


  if (!authChecked) {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5">Loading...</Typography>
          </Paper>
        </Container>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <HomePage />
}

const AuthenticatedRoute = ({ children }) => {
    const { authChecked, isAuthenticated } = useAuth()

    if (!authChecked) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5">Loading...</Typography>
                </Paper>
            </Container>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

const AppRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<RootRoute />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
        />
          <Route
              path="/squads/:squadId"
              element={
                  <AuthenticatedRoute>
                      <SquadBuilderPage />
                  </AuthenticatedRoute>
              }
          />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

const App = () => {
  return (
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
  )
}

export default App