import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  FaHome, FaUsers, FaUserTie, FaBoxes, FaSignOutAlt, FaBars, FaCog 
} from 'react-icons/fa'
import AutoLogoutSettings from '../../components/AutoLogoutSettings'
import useAutoLogout from '../../hooks/useAutoLogout'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Initialize auto logout
  useAutoLogout()

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (!userData) {
      navigate('/login')
      return
    }

    const user = JSON.parse(userData)
    if (user._id !== userId) {
      navigate('/login')
      return
    }

    if (!localStorage.getItem('autoLogoutTime')) {
      localStorage.setItem('autoLogoutTime', '30')
    }
  }, [navigate, userId])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <FaHome /> <span>Dashboard</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'managers' ? 'active' : ''}`}
            onClick={() => setActiveTab('managers')}
            title="Managers"
          >
            <FaUserTie /> <span>Managers</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
            title="Employees"
          >
            <FaUsers /> <span>Employees</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
            title="Inventory"
          >
            <FaBoxes /> <span>Inventory</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <FaCog /> <span>Settings</span>
          </button>
        </nav>

        <button 
          className="logout-button sidebar-logout" 
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>

      <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="welcome-section">
              <h2>Welcome to Admin Dashboard</h2>
              <p className="welcome-message">
                Manage your organization's managers, employees, and inventory from one central location.
              </p>
            </div>
          )}
          {activeTab === 'managers' && <h2>Managers Management</h2>}
          {activeTab === 'employees' && <h2>Employees Management</h2>}
          {activeTab === 'inventory' && <h2>Inventory Management</h2>}
          {activeTab === 'settings' && <AutoLogoutSettings />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 