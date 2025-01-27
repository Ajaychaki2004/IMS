import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'  // Important for cookies
      })

      const result = await response.json()

      if (response.ok) {
        const userData = {
          ...result.data,
          token: response.headers.get('Authorization')
        }
        localStorage.setItem('userData', JSON.stringify(userData))
        
        const role = result.data.role?.toLowerCase()
        const userId = result.data._id

        // Navigate with user ID
        switch(role) {
          case 'admin':
            navigate(`/admin-dashboard/${userId}`)
            break
          case 'manager':
            navigate(`/manager-dashboard/${userId}`)
            break
          case 'employee':
            navigate(`/employee-dashboard/${userId}`)
            break
          default:
            setError('Invalid user role')
            localStorage.clear()
        }
      } else {
        // Display the specific error message from backend
        setError(result.message || 'Login failed')
        
        // Clear password field on error
        setData(prev => ({
          ...prev,
          password: ''
        }))
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Welcome back!</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="error-message" style={{
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.2)',
              marginBottom: '15px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-footer">
            <Link to="/forget-password" className="auth-link">
              Forgot Password?
            </Link>
            <p style={{ margin: '10px 0' }}>
              Don't have an account? {' '}
              <Link to="/register" className="auth-link">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login