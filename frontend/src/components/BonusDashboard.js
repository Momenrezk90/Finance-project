import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { jwtDecode } from 'jwt-decode';
import { createBonus, updateBonus, deleteBonus, approveBonus ,rejectBonus} from '../services/api';
import '../styles/index.css';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';
import * as XLSX from 'xlsx'; // Import XLSX for Excel file export

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

const BonusDashboard = () => {
  const [bonusData, setBonusData] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [reason, setReason] = useState('');
  const [editingBonusId, setEditingBonusId] = useState(null);
  const [users, setUsers] = useState([]); 
  const [userRole, setUserRole] = useState(''); // New state to store user role
  const [userId, setUserId] = useState(''); // Store user ID to filter their bonuses
  const [userName, setUserName] = useState(''); // Store user's name
  const API_URL = 'http://localhost:5000/api';
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBonusReason, setSelectedBonusReason] = useState('');

  // Calculate monthly bonus totals
  const calculateMonthlyBonuses = (bonuses) => {
    const monthlyData = {};
    
    // Exclude rejected bonuses
    bonuses
      .filter(bonus => bonus.status !== 'rejected') // Filter out rejected bonuses
      .forEach(bonus => {
        const month = new Date(bonus.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += bonus.amount;
      });
    
    return Object.entries(monthlyData).map(([month, total]) => ({ month, total }));
  };
  

  // Create chart data based on monthly totals
  const createChartData = (monthlyTotals) => {
    return {
      labels: monthlyTotals.map(item => item.month),
      datasets: [
        {
          label: 'Monthly Bonus Total',
          data: monthlyTotals.map(item => item.total),
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light green background for bars
          borderColor: 'rgb(75, 192, 192)', // Border color for the bars
          borderWidth: 1,
        },
      ],
    };
  };

  useEffect(() => {
    // Fetch bonuses and users simultaneously
    const fetchBonusesAndUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token); 
        const id = decodedToken.id;  // Get user ID from the decoded token
        setUserId(id); // Store user ID

        // Fetch all users to find the current user's role
        const userResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const currentUser = userResponse.data.find(user => user._id === id);
        if (currentUser) {
          setUserRole(currentUser.role);  // Store the role in state
          setUserName(currentUser.name);  // Store the user's name
        }
        
        // Fetch bonuses based on user role
        const bonusResponse = userRole === 'user' 
          ? await axios.get(`${API_URL}/bonuses/my-bonuses`, { headers: { Authorization: `Bearer ${token}` } })
          : await axios.get(`${API_URL}/bonuses`, { headers: { Authorization: `Bearer ${token}` } });

        setBonusData(bonusResponse.data);

        // Fetch all users for the dropdown (if role is admin or manager)
        if (userRole !== 'user') {
          setUsers(userResponse.data);
        }

      } catch (error) {
        console.error('Error fetching bonuses or users:', error.message);
        if (error.message.includes('Forbidden')) {
          alert('You are not authorized to view this data.');
        }
      }
    };    
    fetchBonusesAndUsers();
  }, [userRole]); // Dependency array includes userRole to re-fetch when the role changes

  useEffect(() => {
    if (userRole !== 'user') {
      // Only initialize chart and fetch bonus data when the user is not a regular 'user'
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
  
      if (bonusData.length === 0) return;
  
      const monthlyTotals = calculateMonthlyBonuses(bonusData);

      const ctx = chartContainerRef.current.getContext('2d');
      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'bar', // Change to bar chart
        data: createChartData(monthlyTotals),
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              enabled: true,
            },
          },
        },
      });
  
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }
  }, [bonusData, userRole]); // Add userRole as a dependency to re-trigger if role changes
  
  const handleBonusSubmit = async (e) => {
    e.preventDefault();

    const bonusDataToSubmit = {
      title,
      amount,
      assignedTo,
      reason,
    };

    try {
      if (editingBonusId) {
        const updatedBonus = await updateBonus(editingBonusId, bonusDataToSubmit);
        setBonusData(bonusData.map(bonus => bonus._id === editingBonusId ? updatedBonus : bonus));
      } else {
        const newBonus = await createBonus(bonusDataToSubmit);
        setBonusData([...bonusData, newBonus]);
      }
      setEditingBonusId(null);
      setTitle('');
      setAmount('');
      setAssignedTo('');
      setReason('');
    } catch (error) {
      console.error('Error creating/updating bonus:', error);
    }
  };

  const handleApproveBonus = async (bonusId) => {
    try {
      const updatedBonus = await approveBonus(bonusId);
      setBonusData(bonusData.map(bonus => bonus._id === bonusId ? updatedBonus : bonus));
    } catch (error) {
      console.error('Error approving bonus:', error);
    }
  };

  const handleEditBonus = (bonusId) => {
    const bonusToEdit = bonusData.find(bonus => bonus._id === bonusId);
    if (bonusToEdit) {
      setTitle(bonusToEdit.title);
      setAmount(bonusToEdit.amount);
      setAssignedTo(bonusToEdit.assignedTo);
      setReason(bonusToEdit.reason);
      setEditingBonusId(bonusId);
    }
  };

  const handleDeleteBonus = async (bonusId) => {
    try {
      await deleteBonus(bonusId);
      setBonusData(bonusData.filter(bonus => bonus._id !== bonusId));
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
  };

  const handleRejectBonus = async (bonusId) => {
    try {
      const updatedBonus = await rejectBonus(bonusId);
      setBonusData((prevData) =>
        prevData.map((bonus) =>
          bonus._id === bonusId ? updatedBonus : bonus
        )
      );
    } catch (error) {
      console.error('Error rejecting bonus:', error);
    }
  };
  
  


  const handleLogout = () => {
    localStorage.removeItem('token');  // Clear the token from localStorage
    navigate('/login');  // Redirect to login page
  };

  const handleExportExcel = () => {
    const filteredData = bonusData.filter(bonus => 
      userRole === 'user' ? bonus.assignedTo === userId : true
    );
    
    const exportData = filteredData.map(bonus => ({
      'Bonus Title': bonus.title,
      'Amount': bonus.amount,
      'Reason': bonus.reason,
      'Assigned To': users.find(user => user._id === bonus.assignedTo)?.name || 'N/A',  // Find user name
      'Status': bonus.status,
      'Month': new Date(bonus.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })  // Add month
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);  // Convert to Excel sheet
    const wb = XLSX.utils.book_new();  // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Bonuses');  // Append the sheet to the workbook
    XLSX.writeFile(wb, 'bonus_data.xlsx');  // Write and download the file
  };

  const handleRegisterRedirect = () => {
    navigate('/register'); // Navigate to the register page
  };

  const BonusReasonModal = ({ reason, onClose }) => {
    if (!reason) return null;
  
    return (
      <div className="custom-modal-overlay">
        <div className="custom-modal-content">
          <h2>Bonus Reason</h2>
          <p>{reason}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };
  

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <button className='logoutbutton' onClick={handleLogout}>Logout</button> {/* Logout button on the left */}
        <span className='boldname'>Hi🫡,{userName} ✨ {userRole}</span> {/* User's name on the top right */}
      </div>
      <div className="dashboard-container">
        <div className="dashboard-left">
          {userRole !== 'user' && (
            <>
              <h2>Bonus Dashboard</h2>
              <p>{bonusData.length === 0 ? 'No bonuses available.' : ''}</p>

              <form onSubmit={handleBonusSubmit}>
                <input
                  type="text"
                  placeholder="Bonus Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={35}  // Limit the input to 40 characters
                />
                <input
    type="text"
    placeholder="Amount"
    value={amount}
    onChange={(e) => {
      // Allow only numbers and limit input to 6 digits
      const newValue = e.target.value.replace(/[^0-9]/g, '');  // Remove non-numeric characters
      if (newValue.length <= 6) {
        setAmount(newValue);  // Update the state only if length is <= 6
      }
    }}
    required
  />
                <textarea
                  placeholder="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />

                {/* Dropdown for user selection, only visible to admins or managers */}
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>

                <button type="submit">{editingBonusId ? 'Update Bonus' : 'Create Bonus'}</button>
              </form>
            </>
          )}
        </div>
        <div className="dashboard-right">
          {userRole !== 'user' && (
            <button className='excal' onClick={handleExportExcel}>Export as Excel</button> // Add Export Excel button
          )}

          {/* New button for non-"user" roles */}
          {userRole !== 'user' && (
            <button onClick={handleRegisterRedirect}>Go to Register</button>
          )}

          {userRole !== 'user' && (
            <canvas ref={chartContainerRef}></canvas>
          )}

          <h3>Bonus List</h3>
          <ul>
  {bonusData
    .filter(bonus => userRole === 'user' ? bonus.assignedTo === userId : true)
    .map((bonus) => (
      <li key={bonus._id}>
        <div className="bonus-info">
          <span className="bonus-title">{bonus.title}</span>
          <span className="bonus-amount">${bonus.amount}</span>
          <span 
            className={`bonus-status ${
              bonus.status === 'approved'
                ? 'approved'
                : bonus.status === 'pending'
                ? 'pending'
                : 'rejected'
            }`}
          >
            {bonus.status === 'rejected' ? 'Rejected' : bonus.status.charAt(0).toUpperCase() + bonus.status.slice(1)}
          </span>
        </div>
        <div style={{ position: 'relative', height: '0px', border: '1px solid #ccc' }}>
  <button
    className="exclamation-button"
    onClick={() => {
      setSelectedBonusReason(bonus.reason);
      setIsModalOpen(true);
    }}
  >
    !
  </button>
</div>



        {userRole !== 'user' && (
          <div className="bonus-actions">
          {bonus.status === 'pending' && (
            <>
              <button onClick={() => handleApproveBonus(bonus._id)}>Approve</button>
              <button onClick={() => handleEditBonus(bonus._id)}>Edit</button>
              <button onClick={() => handleRejectBonus(bonus._id)}>Reject</button>
            </>
          )}
          {bonus.status === 'rejected' && (
            <button onClick={() => handleDeleteBonus(bonus._id)}>Delete</button>
          )}
          {bonus.status !== 'pending' && bonus.status !== 'rejected' && (
            <button onClick={() => handleDeleteBonus(bonus._id)}>Delete</button>
          )}
        </div>
        
        )}
      </li>
    ))}
</ul>
{isModalOpen && (
        <BonusReasonModal
          reason={selectedBonusReason}
          onClose={() => setIsModalOpen(false)}  // Close the modal when the button is clicked
        />
      )}
    
        </div>
      </div>
    </div>
  );
};

export default BonusDashboard;
