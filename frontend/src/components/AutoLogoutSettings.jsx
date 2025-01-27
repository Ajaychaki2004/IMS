import React, { useState, useEffect } from 'react'
import { FaSave } from 'react-icons/fa'

const AutoLogoutSettings = () => {
  const [logoutTime, setLogoutTime] = useState('30') // Default 30 minutes
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Load saved timeout value
    const savedTimeout = localStorage.getItem('autoLogoutTime')
    if (savedTimeout) {
      setLogoutTime(savedTimeout)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const time = parseInt(logoutTime)
    if (!time || time < 1) {
      setError('Please enter a valid time in minutes')
      return
    }

    try {
      localStorage.setItem('autoLogoutTime', time.toString())
      setSuccess('Auto logout time updated successfully')
      
      // Trigger reset of the auto-logout timer
      window.dispatchEvent(new Event('resetAutoLogout'))
    } catch (err) {
      setError('Failed to save settings')
    }
  }

  return (
    <div className="settings-section">
      <h2>Auto Logout Settings</h2>
      <p className="settings-description">
        Set the time (in minutes) after which you will be automatically logged out due to inactivity.
        Default is 30 minutes.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="logoutTime">Auto Logout Time (minutes)</label>
          <input
            type="number"
            id="logoutTime"
            value={logoutTime}
            onChange={(e) => setLogoutTime(e.target.value)}
            min="1"
            required
            placeholder="Enter time in minutes"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="save-button">
          <FaSave /> Save Settings
        </button>
      </form>
    </div>
  )
}

export default AutoLogoutSettings 