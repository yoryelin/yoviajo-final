import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import Login from './pages/Login'
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

  // Si no hay usuario, mostrar Login (Landing)
  if (!user) {
    return <Login />
  }

  // Si hay usuario, mostrar Dashboard dentro del Layout
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
