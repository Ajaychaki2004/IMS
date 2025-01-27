import React, { useState, useEffect } from 'react'
import { FaSave } from 'react-icons/fa'

const AutoLogoutSettings = () => {
  const [logoutTime, setLogoutTime] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Get saved logout time from localStorage
    const savedTime = localStorage.getItem('autoLogoutTime')
    if (savedTime) {
      setLogoutTime(savedTime)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate input
    const time = parseInt(logoutTime)
    if (!time || time < 1) {
      setError('Please enter a valid time in minutes')
      return
    }

    try {
      // Save to localStorage
      localStorage.setItem('autoLogoutTime', time.toString())
      setSuccess('Auto logout time updated successfully')

      // Reset any existing timer and start new one
      window.dispatchEvent(new CustomEvent('resetAutoLogout'))
    } catch (err) {
      setError('Failed to save settings')
    }
  }

  return (
    <div className="settings-section">
      <h2>Auto Logout Settings</h2>
      <p className="settings-description">
        Set the time (in minutes) after which you will be automatically logged out due to inactivity.
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

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">{success}</div>}

        <button type="submit" className="save-button">
          <FaSave /> Save Settings
        </button>
      </form>
    </div>
  )
}

export default AutoLogoutSettings 