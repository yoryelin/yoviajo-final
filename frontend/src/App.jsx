import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import Login from './pages/Login'
import Landing from './pages/Landing'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Login /> : <Navigate to="/dashboard" />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : <Navigate to="/login" />
        }
      />

      <Route
        path="/my-trips"
        element={
          user ? (
            <Layout>
              <MyTrips />
            </Layout>
          ) : <Navigate to="/login" />
        }
      />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
  )
}
