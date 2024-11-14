import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const location = useLocation();
  const showNavigation = location.pathname !== '/dashboard';

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div>
        {showNavigation && (
          <nav className="navbar">
            <div className="nav-brand flex items-center space-x-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/1/1d/National_Institute_of_Technology%2C_Nagaland_Logo.png"
                alt="NIT Nagaland Logo"
                className="h-12 w-auto"
              />
              <div className="text-lg font-semibold">
                IOT Enabled PID Level Control System
              </div>
            </div>
            <button className="nav-toggle" onClick={toggleMenu}>
              <span className="hamburger"></span>
            </button>
            <ul className={`nav-links ${isOpen ? "active" : ""}`}>
              <li><Link to="/" onClick={toggleMenu}>Login</Link></li>
              <li><Link to="/signup" onClick={toggleMenu}>Signup</Link></li>
              <li><Link to="/dashboard" onClick={toggleMenu}>Dashboard</Link></li>
            </ul>
          </nav>
        )}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
