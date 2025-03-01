import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Update the CircularGauge component with better styling
const CircularGauge = ({ value, title }) => {
  return (
    <motion.div 
      className="relative w-full max-w-[12rem] aspect-square"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <motion.span 
            className="text-sm font-medium text-gray-300 bg-gray-800 px-3 py-1 rounded-t-lg shadow-sm border border-gray-700"
            whileHover={{ y: -2 }}
          >
            {title}
          </motion.span>
        </div>
      )}
      <svg 
        className="w-full h-full"
        viewBox="0 0 200 200"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#1f2937', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#111827', stopOpacity: 0.8 }} />
          </linearGradient>
          {/* Add gradient for the progress arc */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Main circle background */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#gaugeGradient)"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Progress arc */}
        <motion.path
          d={`M 100 100 
              L ${100 + 85 * Math.cos(-150 * Math.PI / 180)} ${100 + 85 * Math.sin(-150 * Math.PI / 180)} 
              A 85 85 0 ${value > 50 ? 1 : 0} 1 
              ${100 + 85 * Math.cos((-150 + value * 3) * Math.PI / 180)} 
              ${100 + 85 * Math.sin((-150 + value * 3) * Math.PI / 180)} Z`}
          fill="url(#progressGradient)"
          opacity="0.2"
        />
        
        {/* Tick marks and numbers - Updated for 0-100 range */}
        {Array.from({ length: 11 }, (_, i) => {
          const value = i * 10;
          const angle = -150 + (i * 30); // Spread across 300 degrees
          const isMainTick = i % 2 === 0;
          const tickLength = isMainTick ? 15 : 10;
          const numberDistance = 70;
          const radian = (angle * Math.PI) / 180;
          const x1 = 100 + (85 - tickLength) * Math.cos(radian);
          const y1 = 100 + (85 - tickLength) * Math.sin(radian);
          const x2 = 100 + 85 * Math.cos(radian);
          const y2 = 100 + 85 * Math.sin(radian);
          const textX = 100 + numberDistance * Math.cos(radian);
          const textY = 100 + numberDistance * Math.sin(radian);

          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9CA3AF"
                strokeWidth={isMainTick ? 2 : 1}
              />
              {isMainTick && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#D1D5DB"
                >
                  {value}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle with improved design */}
        <motion.g 
          initial={{ rotate: -150 }}
          animate={{ rotate: -150 + (value * 3) }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
        >
          {/* Needle shadow */}
          <path
            d="M 95 100 L 100 30 L 105 100 Z"
            fill="rgba(239, 68, 68, 0.3)"
            filter="url(#glow)"
          />
          {/* Main needle */}
          <path
            d="M 98 100 L 100 35 L 102 100 Z"
            fill="#EF4444"
            filter="url(#glow)"
          />
          {/* Center pivot */}
          <circle
            cx="100"
            cy="100"
            r="6"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth="2"
          />
        </motion.g>

        {/* Filters for glow effects */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Digital display */}
      <motion.div 
        className="absolute bottom-4 left-0 right-0 text-center"
        whileHover={{ scale: 1.05 }}
      >
        <div className="bg-gray-800 inline-block px-4 py-2 rounded-lg border border-gray-700 shadow-lg">
          <span className="text-xl font-mono text-red-500">{value.toFixed(1)}%</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Add these components after your existing imports
const DualLevelIndicator = ({ pvValue, spValue, onSetPointChange, isAuto }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(spValue);
  const y = useMotionValue(0);
  
  const handleDrag = (event, info) => {
    if (!containerRef.current || !isAuto) return;
    
    const container = containerRef.current;
    const boundingRect = container.getBoundingClientRect();
    const containerHeight = boundingRect.height;
    
    // Calculate relative position from the bottom of the container
    const relativeY = boundingRect.bottom - info.point.y;
    
    // Convert to percentage (0-100)
    const percentage = (relativeY / containerHeight) * 100;
    
    // Clamp the value between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    setDragValue(clampedPercentage);
    onSetPointChange(clampedPercentage);
  };

  // Update dragValue when spValue changes
  useEffect(() => {
    setDragValue(spValue);
  }, [spValue]);

  return (
    <div className="flex space-x-6 p-6 bg-gray-900 rounded-xl shadow-2xl">
      {/* Labels at top */}
      <div className="flex justify-between w-full absolute -top-8 left-0">
        <motion.div 
          className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-t-lg shadow-sm"
          whileHover={{ y: -2 }}
        >
          PV Output
        </motion.div>
        <motion.div 
          className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-t-lg shadow-sm"
          whileHover={{ y: -2 }}
        >
          Set Point
        </motion.div>
      </div>

      {/* PV Output Indicator */}
      <div className="relative w-24 h-64 bg-gray-800 rounded-lg p-2 border border-gray-700" ref={containerRef}>
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
          {Array.from({ length: 11 }, (_, i) => (
            <motion.div 
              key={i} 
              className="flex items-center w-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="h-[1px] w-3 bg-gray-500" />
              <span className="text-[10px] text-gray-400 ml-1">
                {100 - i * 10}
              </span>
            </motion.div>
          ))}
        </div>
        
        {/* PV Value indicator - Update animation */}
        <motion.div 
          className="absolute left-0 right-0"
          style={{ bottom: `${pvValue}%` }}
          animate={{ bottom: `${pvValue}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="h-1.5 bg-green-500 shadow-lg relative">
            <div className="absolute w-full h-full bg-green-400 animate-pulse opacity-50" />
          </div>
          <motion.div 
            className="absolute -right-20 top-0 bg-green-500 px-2 py-1 rounded text-xs text-white shadow-lg"
            initial={false}
            animate={{ opacity: 1 }}
          >
            {pvValue.toFixed(2)}%
          </motion.div>
        </motion.div>

        {/* Digital display */}
        <motion.div 
          className="absolute -bottom-12 left-0 right-0"
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-gray-800 text-green-500 px-3 py-2 rounded-lg shadow-lg border border-gray-700">
            <span className="text-sm font-mono">{pvValue.toFixed(4)}</span>
          </div>
        </motion.div>
      </div>

      {/* Setpoint Indicator */}
      <div className="relative w-24 h-64 bg-gray-800 rounded-lg p-2 border border-gray-700">
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
          {Array.from({ length: 11 }, (_, i) => (
            <motion.div 
              key={i} 
              className="flex items-center w-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="h-[1px] w-3 bg-gray-500" />
              <span className="text-[10px] text-gray-400 ml-1">
                {100 - i * 10}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Draggable SP indicator - Update drag handling */}
        <motion.div 
          drag={isAuto ? "y" : false}
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => isAuto && setIsDragging(true)}
          onDragEnd={() => isAuto && setIsDragging(false)}
          onDrag={handleDrag}
          className={`absolute left-0 right-0 ${
            isAuto ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
          }`}
          style={{ bottom: `${dragValue}%` }}
          animate={{ bottom: `${dragValue}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          whileHover={isAuto ? { scale: 1.1 } : {}}
          whileDrag={isAuto ? { scale: 1.1 } : {}}
        >
          {/* Triangle pointer with glow effect */}
          <div className="absolute right-0 transform -translate-y-1/2 flex items-center">
            <div className="w-3 h-3 bg-red-500 rotate-45 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
          </div>
          {/* Line with glow effect */}
          <div className="h-1.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
          
          {/* Dragging tooltip */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute -right-24 top-0 bg-red-500 px-2 py-1 rounded text-xs text-white shadow-lg"
              >
                {dragValue.toFixed(2)}%
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add mode indicator */}
        <div className="absolute -top-8 right-0">
          <span className={`text-xs px-2 py-1 rounded ${
            isAuto ? 'bg-green-500' : 'bg-yellow-500'
          } text-white`}>
            {isAuto ? 'AUTO' : 'MANUAL'}
          </span>
        </div>

        {/* Digital display */}
        <motion.div 
          className="absolute -bottom-12 left-0 right-0"
          whileHover={{ scale: 1.05 }}
        >
          <div className="bg-gray-800 text-red-500 px-3 py-2 rounded-lg shadow-lg border border-gray-700">
            <span className="text-sm font-mono">{dragValue.toFixed(4)}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Update the GradientBackground component with a more sophisticated design
const GradientBackground = () => (
  <>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-black opacity-80" />
    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
    <div className="absolute inset-0 backdrop-blur-[1px]" />
  </>
);

// Update the Card component with glass-morphism effect
const Card = ({ title, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden backdrop-blur-md bg-gray-800/70 rounded-xl p-6 shadow-lg border border-gray-700/50 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-700/10 to-gray-900/30" />
    {title && (
      <motion.h3 
        className="relative text-lg font-semibold text-gray-100 mb-4 flex items-center"
        whileHover={{ x: 5 }}
      >
        <div className="w-1 h-6 bg-blue-500 mr-3 rounded-full shadow-glow-blue" />
        {title}
      </motion.h3>
    )}
    <div className="relative">{children}</div>
  </motion.div>
);

// Add this component for parameter inputs
const ParameterInput = ({ label, value, onChange, unit = "" }) => (
  <motion.div 
    className="space-y-2"
    whileHover={{ scale: 1.02 }}
  >
    <label className="block text-sm text-gray-300">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          {unit}
        </span>
      )}
    </div>
  </motion.div>
);

const Dashboard = () => {
  // State for process parameters
  const [processParams, setProcessParams] = useState({
    staticGain: 2.50,
    lag: 2.50,
    deadtime: 0.00,
    load: 0.00,
    deadband: 0.00,
    sensorNoise: 0.00,
    initialPV: 30.00,
    plantNoise: 0.00
  });

  // State for PID parameters
  const [pidParams, setPidParams] = useState({
    proportionalGain: 1.000,
    integralTime: 0.010,
    derivativeTime: 0.000
  });

  // System state
  const [systemRunning, setSystemRunning] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(30);
  const [setPoint, setSetPoint] = useState(46.7681);
  const [visaResource, setVisaResource] = useState('1');

  // Chart configuration
  const [chartHistory, setChartHistory] = useState({
    pv: Array(100).fill(30),
    sp: Array(100).fill(46.7681),
    lcv: Array(100).fill(0)
  });

  // Add isAuto state
  const [isAuto, setIsAuto] = useState(true);

  // Update chart data
  useEffect(() => {
    let interval;
    if (systemRunning) {
      interval = setInterval(() => {
        // Simulate PID control
        const error = setPoint - currentLevel;
        const newLevel = currentLevel + (error * pidParams.proportionalGain * 0.1);
        const clampedLevel = Math.max(0, Math.min(100, newLevel));
        
        // Calculate LCV value (this is a simplified calculation)
        const lcvValue = Math.max(0, Math.min(100, error * pidParams.proportionalGain));
        
        setCurrentLevel(clampedLevel);
        
        // Update chart history with LCV
        setChartHistory(prev => ({
          pv: [...prev.pv.slice(1), clampedLevel],
          sp: [...prev.sp.slice(1), setPoint],
          lcv: [...prev.lcv.slice(1), lcvValue]
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [systemRunning, currentLevel, setPoint, pidParams.proportionalGain]);

  // Update chart data configuration to include LCV
  const chartData = {
    labels: Array.from({ length: 100 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'PV (Output)',
        data: chartHistory.pv,
        borderColor: 'rgb(0, 200, 0)',
        tension: 0.4,
      },
      {
        label: 'SP',
        data: chartHistory.sp,
        borderColor: 'rgb(255, 0, 0)',
        tension: 0.1,
        borderDash: [5, 5],
      },
      {
        label: 'LCV',
        data: chartHistory.lcv,
        borderColor: 'rgb(255, 255, 255)',  // White line for LCV
        tension: 0.4,
      }
    ]
  };

  // Handle start/stop
  const handleStartStop = () => {
    setSystemRunning(!systemRunning);
    toast.info(systemRunning ? 'System Stopped' : 'System Started');
  };

  // Update handleSetPointChange to check for auto mode
  const handleSetPointChange = (newValue) => {
    if (isAuto) {
      setSetPoint(newValue);
    }
  };

  // Add manual LCV control handler
  const handleManualLCVChange = (e) => {
    if (!isAuto) {
      const value = parseFloat(e.target.value);
      const clampedValue = Math.max(0, Math.min(100, value));
      setCurrentLevel(clampedValue);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      <GradientBackground />
      
      {/* Add animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particles-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--particle-size': `${Math.random() * 3 + 1}px`,
                '--particle-speed': `${Math.random() * 50 + 20}s`,
                '--particle-start': `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div 
        className="relative max-w-7xl mx-auto p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section with updated styling */}
        <div className="flex justify-between items-center mb-8">
          <motion.div className="flex items-center space-x-4">
            <motion.h1 
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"
              whileHover={{ scale: 1.05 }}
            >
              Process Control Dashboard
            </motion.h1>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </motion.div>
          
          <motion.button 
            onClick={handleStartStop}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg ${
              systemRunning 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            } text-white`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {systemRunning ? 'STOP PROCESS' : 'START PROCESS'}
          </motion.button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Parameters Section */}
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Process Parameters */}
              <Card title="Process Parameters">
                <div className="grid grid-cols-2 gap-4">
                  <ParameterInput 
                    label="Static Gain"
                    value={processParams.staticGain}
                    onChange={(e) => setProcessParams({
                      ...processParams,
                      staticGain: parseFloat(e.target.value)
                    })}
                  />
                  <ParameterInput 
                    label="Lag (s)"
                    value={processParams.lag}
                    onChange={(e) => setProcessParams({
                      ...processParams,
                      lag: parseFloat(e.target.value)
                    })}
                  />
                  <ParameterInput 
                    label="Deadtime (s)"
                    value={processParams.deadtime}
                    onChange={(e) => setProcessParams({
                      ...processParams,
                      deadtime: parseFloat(e.target.value)
                    })}
                  />
                  <ParameterInput 
                    label="Load"
                    value={processParams.load}
                    onChange={(e) => setProcessParams({
                      ...processParams,
                      load: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </Card>

              {/* PID Parameters */}
              <Card title="PID Parameters">
                <div className="space-y-4">
                  <ParameterInput 
                    label="Proportional Gain (Kc)"
                    value={pidParams.proportionalGain}
                    onChange={(e) => setPidParams({
                      ...pidParams,
                      proportionalGain: parseFloat(e.target.value)
                    })}
                  />
                  <ParameterInput 
                    label="Integral Time (Ti, min)"
                    value={pidParams.integralTime}
                    onChange={(e) => setPidParams({
                      ...pidParams,
                      integralTime: parseFloat(e.target.value)
                    })}
                  />
                  <ParameterInput 
                    label="Derivative Time (Td, min)"
                    value={pidParams.derivativeTime}
                    onChange={(e) => setPidParams({
                      ...pidParams,
                      derivativeTime: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Indicators Section - Updated Layout */}
          <div className="col-span-4 flex flex-col gap-6">
            <Card className="flex-1">
              <DualLevelIndicator 
                pvValue={currentLevel}
                spValue={setPoint}
                onSetPointChange={handleSetPointChange}
                isAuto={isAuto}
              />
            </Card>
            
            {/* Updated LCV Gauge Card */}
            <Card title="LCV Output" className="flex-1">
              <div className="flex items-center justify-center h-full">
                <CircularGauge 
                  value={chartHistory.lcv[chartHistory.lcv.length - 1]} 
                  title="Control Output"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Chart Section */}
        <Card className="col-span-12">
          <div className="h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'white',
                      callback: value => `${value}%`
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'white',
                      maxRotation: 0,
                      callback: (_, index) => index % 10 === 0 ? index : ''
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Add these styles to your CSS file
const styles = `
  .shadow-glow-blue {
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }

  .bg-grid-pattern {
    background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .particles-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .particle {
    position: absolute;
    width: var(--particle-size);
    height: var(--particle-size);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    left: var(--particle-start);
    animation: float var(--particle-speed) infinite linear;
  }

  @keyframes float {
    0% {
      transform: translateY(-10%);
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(110%);
      opacity: 0;
    }
  }
`;

export default Dashboard;