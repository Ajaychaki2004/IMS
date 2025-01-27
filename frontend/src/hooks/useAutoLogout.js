import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const useAutoLogout = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    let logoutTimer

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer)
      
      const logoutTime = localStorage.getItem('autoLogoutTime')
      if (logoutTime) {
        const timeInMs = parseInt(logoutTime) * 60 * 1000
        logoutTimer = setTimeout(() => {
          // Clear all data and redirect to login
          localStorage.clear()
          navigate('/login')
        }, timeInMs)
      }
    }

    // Events to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    // Reset timer on user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer)
    })

    // Reset timer on custom event
    window.addEventListener('resetAutoLogout', resetTimer)

    // Initial timer setup
    resetTimer()

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer)
      })
      window.removeEventListener('resetAutoLogout', resetTimer)
    }
  }, [navigate])
}

export default useAutoLogout 