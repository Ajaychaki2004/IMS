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
  const [showWarehouseForm, setShowWarehouseForm] = useState(false)
  const [warehouseName, setWarehouseName] = useState('')
  const [location, setLocation] = useState('')
  const [managers, setManagers] = useState([])
  const [staff, setStaff] = useState([])
  const [managerTags, setManagerTags] = useState([])
  const [staffTags, setStaffTags] = useState([])
  const [managerInput, setManagerInput] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const [managerError, setManagerError] = useState('')
  const [staffError, setStaffError] = useState('')

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

  const handleManagerInputChange = (e) => {
    setManagerInput(e.target.value)
    setManagerError('')
  }

  const handleStaffInputChange = (e) => {
    setStaffInput(e.target.value)
    setStaffError('')
  }

  const addManagerTag = (email) => {
    if (!email) return
    if (!isValidEmail(email)) {
      setManagerError('Please enter a valid email address')
      return
    }
    if (managerTags.includes(email)) {
      setManagerError('This manager email already exists')
      return
    }
    setManagerTags([...managerTags, email])
    setManagerInput('')
    setManagerError('')
  }

  const addStaffTag = (email) => {
    if (!email) return
    if (!isValidEmail(email)) {
      setStaffError('Please enter a valid email address')
      return
    }
    if (staffTags.includes(email)) {
      setStaffError('This staff email already exists')
      return
    }
    setStaffTags([...staffTags, email])
    setStaffInput('')
    setStaffError('')
  }

  const removeManagerTag = (tagToRemove) => {
    setManagerTags(managerTags.filter(tag => tag !== tagToRemove))
  }

  const removeStaffTag = (tagToRemove) => {
    setStaffTags(staffTags.filter(tag => tag !== tagToRemove))
  }

  const handleManagerKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addManagerTag(managerInput.trim())
    }
  }

  const handleStaffKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addStaffTag(staffInput.trim())
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = localStorage.getItem('userData')
      if (!userData) {
        navigate('/login')
        return
      }

      const warehouseData = {
        name: warehouseName,
        location: location,
        managers: managerTags,
        staff: staffTags
      }
      console.log(warehouseData)
      console.log(JSON.stringify(warehouseData))

      const response = await fetch('http://localhost:8000/api/warehouses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(warehouseData)
      })

      const result = await response.json()
      console.log(result)
    } catch (error) {
      console.error('Error creating warehouse:', error)
      alert('Failed to create warehouse. Please try again.')
    }
  }

  const resetWarehouseForm = () => {
    setWarehouseName('')
    setLocation('')
    setManagerTags([])
    setStaffTags([])
    setManagerInput('')
    setStaffInput('')
    setManagerError('')
    setStaffError('')
    setShowWarehouseForm(false)
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
          {activeTab === 'inventory' && (
            <div>
              <h2>Inventory Management</h2>
              <button 
                className="form-buttons add-warehouse-btn"
                onClick={() => setShowWarehouseForm(true)}
              >
                Add Warehouse
              </button>
              {showWarehouseForm && (
                <div className="form-overlay">
                  <div className="form-container">
                    <h3>Add New Warehouse</h3>
                    <form onSubmit={handleWarehouseSubmit}>
                      <div className="form-group">
                        <label>Warehouse Name:</label>
                        <input
                          type="text"
                          value={warehouseName}
                          onChange={(e) => setWarehouseName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location:</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                        />
                      </div>

                      {/* Managers Input */}
                      <div className="form-group">
                        <label>Managers:</label>
                        <div className="tag-input-container">
                          <div className="tags-list">
                            {managerTags.map((tag, index) => (
                              <div key={index} className="tag">
                                <span className="tag-text">{tag}</span>
                                <span 
                                  className="tag-remove"
                                  onClick={() => removeManagerTag(tag)}
                                >
                                  ×
                                </span>
                              </div>
                            ))}
                          </div>
                          <input
                            type="email"
                            value={managerInput}
                            onChange={handleManagerInputChange}
                            onKeyDown={handleManagerKeyDown}
                            placeholder="Enter manager email and press Enter"
                            className="tag-input"
                          />
                        </div>
                        {managerError && <div className="error-message">{managerError}</div>}
                      </div>

                      {/* Staff Input */}
                      <div className="form-group">
                        <label>Staff:</label>
                        <div className="tag-input-container">
                          <div className="tags-list">
                            {staffTags.map((tag, index) => (
                              <div key={index} className="tag">
                                <span className="tag-text">{tag}</span>
                                <span 
                                  className="tag-remove"
                                  onClick={() => removeStaffTag(tag)}
                                >
                                  ×
                                </span>
                              </div>
                            ))}
                          </div>
                          <input
                            type="email"
                            value={staffInput}
                            onChange={handleStaffInputChange}
                            onKeyDown={handleStaffKeyDown}
                            placeholder="Enter staff email and press Enter"
                            className="tag-input"
                          />
                        </div>
                        {staffError && <div className="error-message">{staffError}</div>}
                      </div>

                      <div className='form-buttons'>
                        <button 
                          type="button" 
                          onClick={resetWarehouseForm}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                        <button type="submit">Add</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && <AutoLogoutSettings />}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 