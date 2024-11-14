import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for admin login
    if (formData.email === 'admin@admin.com' && formData.password === 'admin') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', 'admin');
      toast.success('Welcome Admin! Login successful');
      navigate('/dashboard');
      return;
    }

    // Check for registered users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', user.name);
      toast.success(`Welcome ${user.name}! Login successful`);
      navigate('/dashboard');
    } else {
      toast.error('Invalid email or password');
      setError('Invalid email or password');
    }
  };

  // Add error message display below the form title
  {error && (
    <div className="mt-2 text-center text-sm text-red-600">
      {error}
    </div>
  )}

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-40 w-auto"
            src="https://upload.wikimedia.org/wikipedia/en/1/1d/National_Institute_of_Technology%2C_Nagaland_Logo.png"
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            IOT Enabled PID Level Control System
          </h2>
          <h3 className="mt-2 text-center text-xl font-bold text-gray-700">
            LabVIEW Integration with Arduino and Remote Web Interface
          </h3>
          <p className="mt-4 text-center text-sm text-gray-600">
            Sign in to access the control system
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                name="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 
