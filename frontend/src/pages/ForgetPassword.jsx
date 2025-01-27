import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const ForgetPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    let color = '';

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Set message and color based on score
    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        color = '#ff4444';
        break;
      case 2:
        message = 'Weak';
        color = '#ffbb33';
        break;
      case 3:
        message = 'Moderate';
        color = '#ffbb33';
        break;
      case 4:
        message = 'Strong';
        color = '#00C851';
        break;
      case 5:
        message = 'Very Strong';
        color = '#007E33';
        break;
      default:
        message = 'Very Weak';
        color = '#ff4444';
    }

    return { score, message, color };
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      
      if (response.ok) {
        setOtpSent(true)
        setMessage('OTP has been sent to your email')
        setError('')
      } else {
        setError(result.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if(passwordStrength.score < 3) {
      setError('Please choose a stronger password')
      return
    }
    try {
      const response = await fetch('http://localhost:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword
        }),
      })
      const result = await response.json()
      
      if (response.ok) {
        setMessage('Password reset successful')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }

  const formStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }

  const titleStyle = {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  }

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '15px'
  }

  const passwordRequirementsStyle = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  }

  const strengthIndicatorStyle = {
    fontSize: '14px',
    marginBottom: '15px',
    textAlign: 'center',
    color: passwordStrength.color
  }

  return (
    <div className="form-container">
      <h1 style={titleStyle}>Reset Password</h1>
      
      <form style={formStyle} onSubmit={otpSent ? handleResetPassword : handleSendOTP}>
        <input
          type="email"
          placeholder="Enter your email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={otpSent}
        />

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              style={inputStyle}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {newPassword && (
              <div style={strengthIndicatorStyle}>
                Password Strength: {passwordStrength.message}
              </div>
            )}

            <div style={passwordRequirementsStyle}>
              Password must contain:
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>
          </>
        )}

        {error && (
          <p style={{color: 'red', marginBottom: '15px', textAlign: 'center'}}>
            {error}
          </p>
        )}

        {message && (
          <p style={{color: 'green', marginBottom: '15px', textAlign: 'center'}}>
            {message}
          </p>
        )}

        <button type="submit" style={buttonStyle}>
          {otpSent ? 'Reset Password' : 'Send OTP'}
        </button>

        <p style={{textAlign: 'center', color: '#666'}}>
          Remember your password? {' '}
          <Link 
            to="/login" 
            style={{color: '#007bff', textDecoration: 'none'}}
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default ForgetPassword