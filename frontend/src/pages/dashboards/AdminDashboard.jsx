import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  FaHome, FaUsers, FaUserTie, FaBoxes, FaSignOutAlt, FaBars, FaCog, FaUserPlus 
} from 'react-icons/fa'
import AutoLogoutSettings from '../../components/AutoLogoutSettings'
import useAutoLogout from '../../hooks/useAutoLogout'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [managers, setManagers] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formType, setFormType] = useState('') // New state for form type

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

  const handleSearch = (data) => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/users/${userId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          if (activeTab === 'managers') fetchManagers()
          if (activeTab === 'employees') fetchEmployees()
        }
      } catch (err) {
        setError('Failed to delete user')
      }
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        alert('User registered successfully')
        setFormType('') // Reset form type
      } else {
        const errorData = await response.json()
        alert(`Registration failed: ${errorData.message}`)
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert('Registration error')
    }
  }

  const renderRegistrationForm = () => (
    <div className="registration-form">
      <h2>{formType === 'manager' ? 'Register Manager' : 'Register Staff'}</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <input type="hidden" name="role" value={formType} />
        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  )

  const renderDashboard = () => (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="date-filter">
          <select defaultValue="today">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon manager-icon">
            <FaUserTie />
          </div>
          <div className="card-content">
            <h3>Total Managers</h3>
            <p className="card-number">{dashboardStats?.managers_count || 0}</p>
            <p className="card-status">Active Managers</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon employee-icon">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Total Employees</h3>
            <p className="card-number">{dashboardStats?.employees_count || 0}</p>
            <p className="card-status">Active Employees</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon inventory-icon">
            <FaBoxes />
          </div>
          <div className="card-content">
            <h3>Inventory Items</h3>
            <p className="card-number">{dashboardStats?.inventory_count || 0}</p>
            <p className="card-status">Items in Stock</p>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activity-list">
          {dashboardStats?.recent_activities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                <FaUserPlus />
              </div>
              <div className="activity-details">
                <p className="activity-user">{activity.user}</p>
                <p className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUserTable = (users, userType) => (
    <div className="section-content">
      <div className="section-header">
        <h2>{userType} Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder={`Search ${userType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => setFormType(userType.toLowerCase())}>
            <FaUserPlus /> Add {userType.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {handleSearch(users).map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.joined_date).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button onClick={() => handleEdit(user)} className="edit-button">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="delete-button">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

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

          <div className="sidebar-registration">
            <button 
              className={`sidebar-link ${formType === 'manager' ? 'active' : ''}`}
              onClick={() => setFormType('manager')}
              title="Register Manager"
            >
              <FaUserPlus /> <span>Register Manager</span>
            </button>
            <button 
              className={`sidebar-link ${formType === 'staff' ? 'active' : ''}`}
              onClick={() => setFormType('staff')}
              title="Register Staff"
            >
              <FaUserPlus /> <span>Register Staff</span>
            </button>
          </div>
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
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchDashboardData}>Retry</button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'managers' && renderUserTable(managers, 'Managers')}
              {activeTab === 'employees' && renderUserTable(employees, 'Employees')}
              {activeTab === 'inventory' && (
                <div className="section-content">
                  <h2>Inventory Management</h2>
                  {/* Add inventory management component */}
                </div>
              )}
              {activeTab === 'settings' && <AutoLogoutSettings />}
              {formType && renderRegistrationForm()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard