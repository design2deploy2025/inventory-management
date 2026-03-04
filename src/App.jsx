import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import TermsAndConditions from './pages/TermsAndConditions';
import AboutUs from './pages/AboutUs';
import Dashboard from './pages/Dashboard';
import RandomPage from './pages/RandomPage';
import { useAuth } from './context/AuthContext'

// Protected Route Component - for dashboard (requires authentication)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component - for public pages (redirects logged-in users to dashboard)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  return (
    <div>
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/terms" element={<PublicRoute><TermsAndConditions /></PublicRoute>} />
      <Route path="/aboutus" element={<PublicRoute><AboutUs /></PublicRoute>} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/xQmLpRzTaVnKeWsYdFuHjGcBiOlPkNmQrStUvWxYaZb" element={<RandomPage />} />
    </Routes>
    </div>
  )
}

export default App

