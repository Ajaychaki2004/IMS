import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaHome, FaUsers, FaUserTie, FaBoxes, FaSignOutAlt, FaBars, 
  FaUserPlus, FaSearch, FaEdit, FaTrash, FaCog 
} from 'react-icons/fa'
import AutoLogoutSettings from '../../components/AutoLogoutSettings'
import useAutoLogout from '../../hooks/useAutoLogout'

const AdminDashboard = () => {
  const navigate = useNavigate()
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

  // Initialize auto logout
  useAutoLogout()

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (!userData) {
      navigate('/login')
      return
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'managers') {
      fetchManagers()
    } else if (activeTab === 'employees') {
      fetchEmployees()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard-stats/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (response.ok) {
        setDashboardStats(data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/managers/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (response.ok) {
        setManagers(data)
      }
    } catch (err) {
      setError('Failed to fetch managers data')
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/employees/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (response.ok) {
        setEmployees(data)
      }
    } catch (err) {
      setError('Failed to fetch employees data')
    }
  }

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
          <button className="add-button">
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
      {/* Sidebar */}
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

      {/* Main Content */}
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
            </>
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal">
          {/* Add user edit form */}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard 