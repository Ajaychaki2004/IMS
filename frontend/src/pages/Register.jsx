import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

const Register = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'employee'
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    const response = await fetch('http://localhost:8000/api/verify-email-via-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
      }),
    });
    const result = await response.json()
    if(response.ok){
      setOtpSent(true)
    }
    console.log(result)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const response = await fetch('http://localhost:8000/api/verify-otp/', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        otp: otp
      }),
    });
    const result = await response.json()
    if(result.message === 'OTP verified successfully'){
      setOtpVerified(true)
      setOtpError('')
    } else {
      setOtpError('Invalid OTP')
    }
  }

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
    setData({ ...data, password: newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if(!otpVerified) {
      setOtpError('Please verify your email first')
      return
    }
    if(data.password !== data.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if(passwordStrength.score < 3) {
      setPasswordError('Please choose a stronger password')
      return
    }
    const response = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json()
    console.log(result)
    if(response.ok){
      navigate('/login')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Please fill in the details to register</p>
        </div>
        
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Full Name"
              required
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          
          <div className="input-group">
            <input 
              type="email"
              placeholder="Email Address" 
              required
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>

          

          <button 
            type="button"
            className="auth-button"
            onClick={handleVerifyEmail}
          >
            Send OTP
          </button>

          {otpSent && (
            <div className="input-group">
              <input 
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button 
                type="button"
                className="auth-button"
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </button>
              {otpVerified && (
                <div className="success-message">
                  Email Verified Successfully ✓
                </div>
              )}
              {otpError && (
                <p className="error-message">{otpError}</p>
              )}
            </div>
          )}

        <div className="role-select">
            <label>Select Role:</label>
            <select 
              value={data.role}
              onChange={(e) => setData({ ...data, role: e.target.value })}
              required
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

        <div className="password-requirements">
                    Password must contain:
                    <ul>
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                    </ul>
        </div>

          <div className="password-field">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              required
              minLength={8}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {data.password && (
            <div 
              className="password-strength"
              data-strength={passwordStrength.message}
            >
              Password Strength: {passwordStrength.message}
            </div>
          )}

          <div className="password-field">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              required
              minLength={8}
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {passwordError && (
            <p className="error-message">{passwordError}</p>
          )}

          <button type="submit" className="auth-button">
            Create Account
          </button>

          <div className="auth-footer">
            <p>
              Already have an account? {' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
