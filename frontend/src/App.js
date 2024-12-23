import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // This would be the page after login
import BonusPage from './pages/BonusPage'; // Create page for bonus management
import './styles/App.css'; // Add this for CSS styles

const App = () => {
  const token = localStorage.getItem('token'); // Check for token in localStorage

  const ProtectedRoute = ({ element }) => {
    return token ? element : <Navigate to="/404" />;
  };

  const NotFoundPage = () => {
    return (
      <div className="not-found-container">
        <div>
          <div className="animated-text">404 - Page Not Found</div>
          <div className="subtitle">
            Sorry, the page you're looking for doesn't exist.
          </div>
          <Link to="/login" className="return-link">
            Return to Login
          </Link>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Redirect root path to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/register"
            element={<ProtectedRoute element={<RegisterPage />} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<DashboardPage />} />}
          />
          <Route
            path="/bonuses"
            element={<ProtectedRoute element={<BonusPage />} />}
          />
          <Route path="/404" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
