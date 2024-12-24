import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending the registration data to the backend
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/register');
        window.location.reload(); // Refresh the page after successful registration
      }, 1000); // Delay before redirect and page refresh
    } catch (err) {
      // Handling errors, such as user already existing
      setError('User already exists');
      setTimeout(() => {
        setError(''); // Clear the error message after 2 seconds
      }, 1300); // Hide error after 2 seconds
    }
  };

  // Navigate to the dashboard when the button is clicked
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="user">User</option>
          <option value="manager">Manager</option>
          <option value="finance">Finance</option>
        </select>
        <button type="submit">Register</button>
      </form>

      {/* Error message */}
      {error && <div className="popup error-popup">{error}</div>}

      {/* Success message */}
      {successMessage && <div className="popup success-popup">{successMessage}</div>}

      {/* Button to navigate to the dashboard */}
      <button onClick={handleGoToDashboard}>Go to Dashboard</button>

      {/* Styles for error and success messages as popups */}
      <style jsx>{`
        .popup {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          z-index: 999;
          width: 80%;
          max-width: 400px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          opacity: 0;
          animation: popupIn 0.5s forwards;
        }

        .error-popup {
          background-color: #ffcccb;
          color: #d8000c;
        }

        .success-popup {
          background-color: #d4edda;
          color: #155724;
        }

        @keyframes popupIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
