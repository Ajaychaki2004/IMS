import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const useAutoLogout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    let timeoutId = null
    let warningTimeoutId = null

    const logout = () => {
      localStorage.clear()
      navigate('/login')
    }

    const showWarning = () => {
      // Create and show warning notification
      const warningDiv = document.createElement('div')
      warningDiv.className = 'auto-logout-warning'
      warningDiv.innerHTML = `
        <div class="warning-content">
          <p>Your session will expire in 1 minute due to inactivity.</p>
          <button onclick="window.dispatchEvent(new Event('userActivity'))">
            Stay Logged In
          </button>
        </div>
      `
      document.body.appendChild(warningDiv)

      // Remove warning after 1 minute
      setTimeout(() => warningDiv.remove(), 58000)
    }

    const resetTimer = () => {
      // Clear existing timeouts
      if (timeoutId) clearTimeout(timeoutId)
      if (warningTimeoutId) clearTimeout(warningTimeoutId)

      // Remove any existing warning
      const existingWarning = document.querySelector('.auto-logout-warning')
      if (existingWarning) existingWarning.remove()

      // Get timeout from localStorage or use default (30 minutes)
      const timeoutMinutes = parseInt(localStorage.getItem('autoLogoutTime') || '30')
      const timeoutMs = timeoutMinutes * 60 * 1000

      // Set warning to show 1 minute before logout
      warningTimeoutId = setTimeout(showWarning, timeoutMs - 60000)
      timeoutId = setTimeout(logout, timeoutMs)
    }

    // Events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'userActivity'
    ]

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    // Listen for reset event from settings
    window.addEventListener('resetAutoLogout', resetTimer)

    // Add styles for warning
    const style = document.createElement('style')
    style.textContent = `
      .auto-logout-warning {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff3cd;
        border: 1px solid #ffeeba;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      .warning-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .warning-content button {
        background: #007bff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
      }
      .warning-content button:hover {
        background: #0056b3;
      }
    `
    document.head.appendChild(style)

    // Initial timer setup
    resetTimer()

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningTimeoutId) clearTimeout(warningTimeoutId)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
      window.removeEventListener('resetAutoLogout', resetTimer)
      style.remove()
    }
  }, [navigate])
}

export default useAutoLogout 