import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Dashboard() {
  const navigate = useNavigate();
  const [setpoint, setSetpoint] = useState(50);
  const [pValue, setPValue] = useState(2);
  const [iValue, setIValue] = useState(0.5);
  const [dValue, setDValue] = useState(0.1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      toast.error('Please login to access the dashboard');
      navigate('/login');
    }
  }, [navigate]);

  // Dummy data for the graph - replace with real-time data
  const data = [
    { time: '0s', level: 45 },
    { time: '5s', level: 48 },
    { time: '10s', level: 52 },
    { time: '15s', level: 50 },
    { time: '20s', level: 51 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-2 px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col space-y-4 md:space-y-0">
            {/* Logo and Title Section */}
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
              <img
                className="h-10 w-auto sm:h-16 sm:mr-4"
                src="https://upload.wikimedia.org/wikipedia/en/1/1d/National_Institute_of_Technology%2C_Nagaland_Logo.png"
                alt="NIT Logo"
              />
              <div className="mt-2 sm:mt-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  IOT Enabled PID Level Control System
                </h1>
                <h2 className="text-sm sm:text-base text-gray-600 mt-1">
                  LabVIEW Integration with Arduino and Remote Web Interface
                </h2>
              </div>
            </div>

            {/* Status and Controls Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center justify-items-center sm:justify-items-end">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">System Status</p>
                <p className="text-xs sm:text-sm font-medium text-green-600">● Online</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Last Updated</p>
                <p className="text-xs sm:text-sm font-medium">{new Date().toLocaleTimeString()}</p>
              </div>
              <button className="col-span-2 sm:col-span-1 w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Mobile menu button */}
          <div className="flex items-center justify-between py-2 sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <span className="sr-only">Open menu</span>
              {/* Hamburger icon */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="text-gray-300 text-sm">Welcome, {localStorage.getItem('user') || 'Admin'}</span>
              <button onClick={handleLogout} className="ml-4 text-gray-300 hover:text-white text-sm font-medium">
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden py-2`}>
            <div className="flex flex-col space-y-2">
              <a href="#overview" className="text-white block px-3 py-2 rounded-md text-base font-medium">Overview</a>
              <a href="#controls" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Controls</a>
              <a href="#analytics" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Analytics</a>
              <a href="#settings" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Settings</a>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:h-12">
            <div className="flex space-x-4">
              <a href="#overview" className="text-white px-3 py-2 rounded-md text-sm font-medium">Overview</a>
              <a href="#controls" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Controls</a>
              <a href="#analytics" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Analytics</a>
              <a href="#settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
            </div>
            <div className="hidden sm:flex items-center">
              <span className="text-gray-300 text-sm">Welcome, {localStorage.getItem('user') || 'Admin'}</span>
              <button onClick={handleLogout} className="ml-4 text-gray-300 hover:text-white text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Grid layout for dashboard components */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Real-time Graph */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Real-time Level Monitoring</h2>
            <div className="w-full h-[300px] relative">
              <LineChart width={window.innerWidth < 500 ? 300 : 500} height={300} data={data} 
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        style={{ width: '100%', height: '100%' }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
            <div className="space-y-6">
              {/* Setpoint Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Setpoint Level (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={setpoint}
                  onChange={(e) => setSetpoint(e.target.value)}
                  className="mt-1 w-full"
                />
                <span className="text-sm text-gray-500">{setpoint}%</span>
              </div>

              {/* PID Controls */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Proportional Value
                  </label>
                  <input
                    type="number"
                    value={pValue}
                    onChange={(e) => setPValue(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Integral Value
                  </label>
                  <input
                    type="number"
                    value={iValue}
                    onChange={(e) => setIValue(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                      Derivative Value 
                  </label>
                  <input
                    type="number"
                    value={dValue}
                    onChange={(e) => setDValue(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* System Status */}
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">System Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Current Level</p>
                    <p className="text-lg font-semibold">51%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Control Output</p>
                    <p className="text-lg font-semibold">75%</p>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Start System
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                  Emergency Stop
                </button>
              </div>
            </div>
          </div>

          {/* System Parameters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">System Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Tank Capacity</p>
                <p className="text-lg font-semibold">1000 L</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Flow Rate</p>
                <p className="text-lg font-semibold">10 L/min</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Temperature</p>
                <p className="text-lg font-semibold">25°C</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pressure</p>
                <p className="text-lg font-semibold">1.2 bar</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 