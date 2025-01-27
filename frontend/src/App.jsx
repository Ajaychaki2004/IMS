import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgetPassword from './pages/ForgetPassword'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import ManagerDashboard from './pages/dashboards/ManagerDashboard'
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard'
import './App.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Inventory Management System</h1>
          <p className="auth-subtitle">Welcome to our system</p>
        </div>

        <div className="auth-form">
          <button 
            className="auth-button"
            onClick={() => navigate('/login')}
            style={{ marginBottom: '12px' }}
          >
            Sign In
          </button>
          
          <button 
            className="auth-button"
            onClick={() => navigate('/register')}
            style={{ 
              backgroundColor: '#4caf50',
              marginBottom: '24px'
            }}
          >
            Create Account
          </button>

          <div className="auth-footer">
            <p>
              Manage your inventory efficiently and securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/admin-dashboard/:userId" element={<AdminDashboard />} />
        <Route path="/manager-dashboard/:userId" element={<ManagerDashboard />} />
        <Route path="/employee-dashboard/:userId" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
