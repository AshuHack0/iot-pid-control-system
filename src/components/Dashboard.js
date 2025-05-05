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
import axios from 'axios';
import openai from '../services/openai';

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
  // Add animation state for needle glow effect
  const [isGlowing, setIsGlowing] = useState(false);
  
  // Add threshold indicators
  const thresholds = [
    { value: 20, color: '#22c55e' }, // Green
    { value: 60, color: '#eab308' }, // Yellow
    { value: 80, color: '#ef4444' }, // Red
  ];

  // Get current threshold color
  const getThresholdColor = (currentValue) => {
    const threshold = thresholds.find(t => currentValue <= t.value);
    return threshold ? threshold.color : '#ef4444';
  };

  const currentColor = getThresholdColor(value);

  return (
    <motion.div 
      className="relative w-full max-w-[14rem] aspect-square h-[20rem]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsGlowing(true)}
      onHoverEnd={() => setIsGlowing(false)}
    >
      {/* Enhanced title with icon */}
      {title && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div 
            className="flex items-center space-x-2 text-sm font-medium text-gray-200 
                       bg-gradient-to-r from-gray-800/95 to-gray-900/95
                       px-8 py-2.5 rounded-xl shadow-xl border border-gray-700/50
                       backdrop-blur-sm min-w-[200px] justify-center"
            whileHover={{ 
              y: -2, 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative dot */}
            <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 
                          rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            
            {/* Icon with glow effect */}
            <div className="relative">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="absolute inset-0 bg-blue-400/20 blur-sm rounded-full" />
            </div>

            {/* Title text with subtle gradient */}
            <span className="relative bg-clip-text text-transparent bg-gradient-to-r 
                           from-gray-100 to-gray-300 font-semibold tracking-wide px-2">
              {title}
            </span>

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                          rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </div>
      )}

      <svg 
        className="w-full h-full"
        viewBox="0 0 200 200"
      >
        {/* Enhanced gradients */}
        <defs>
          <radialGradient id="gaugeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#1f2937', stopOpacity: 0.8 }} />
            <stop offset="90%" style={{ stopColor: '#111827', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#030712', stopOpacity: 1 }} />
          </radialGradient>
          
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: currentColor, stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: currentColor, stopOpacity: 1 }} />
          </linearGradient>

          {/* Add shine effect */}
          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.1 }} />
            <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>

        {/* Enhanced background with inner shadow */}
        <g>
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="url(#gaugeGradient)"
            stroke="#374151"
            strokeWidth="2"
            filter="url(#innerShadow)"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="url(#shineGradient)"
            strokeWidth="1"
            opacity="0.3"
          />
        </g>

        {/* Threshold indicators */}
        {thresholds.map((threshold, index) => (
          <motion.circle
            key={index}
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={threshold.color}
            strokeWidth="2"
            strokeDasharray="3,6"
            strokeDashoffset={index * 2}
            opacity="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: index * 0.2 }}
          />
        ))}

        {/* Enhanced progress arc with glow */}
        <motion.path
          d={`M 100 100 
              L ${100 + 85 * Math.cos(-150 * Math.PI / 180)} ${100 + 85 * Math.sin(-150 * Math.PI / 180)} 
              A 85 85 0 ${value > 50 ? 1 : 0} 1 
              ${100 + 85 * Math.cos((-150 + value * 3) * Math.PI / 180)} 
              ${100 + 85 * Math.sin((-150 + value * 3) * Math.PI / 180)} Z`}
          fill="url(#progressGradient)"
          opacity={isGlowing ? "0.4" : "0.2"}
          filter="url(#glow)"
          transition={{ duration: 0.3 }}
        />
        
        {/* Enhanced tick marks with animations */}
        {Array.from({ length: 11 }, (_, i) => {
          const tickValue = i * 10;
          const angle = -250 + (i * 30);
          const isMainTick = i % 2 === 0;
          const tickLength = isMainTick ? 15 : 10;
          const numberDistance = isMainTick ? 60 : 0;
          const radian = (angle * Math.PI) / 180;
          const x1 = 100 + (85 - tickLength) * Math.cos(radian);
          const y1 = 100 + (85 - tickLength) * Math.sin(radian);
          const x2 = 100 + 85 * Math.cos(radian);
          const y2 = 100 + 85 * Math.sin(radian);
          
          const textRadian = ((angle + 180) % 360) * Math.PI / 180;
          const textX = 100 + numberDistance * Math.cos(radian);
          const textY = 100 + numberDistance * Math.sin(radian);
          
          const textRotation = angle + (angle > 90 || angle < -90 ? 180 : 0);

          return (
            <motion.g 
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={tickValue <= value ? currentColor : '#9CA3AF'}
                strokeWidth={isMainTick ? 2 : 1}
                opacity={tickValue <= value ? 1 : 0.5}
              />
              {isMainTick && (
                <motion.text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill={tickValue <= value ? currentColor : '#D1D5DB'}
                  opacity={tickValue <= value ? 1 : 0.7}
                  whileHover={{ scale: 1.2 }}
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                >
                  {tickValue}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Enhanced needle with dynamic color */}
        <motion.g 
          initial={{ rotate: -150 }}
          animate={{ rotate: -150 + (value * 3) }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
        >
          {/* Needle shadow with enhanced glow */}
          <path
            d="M 95 100 L 100 30 L 105 100 Z"
            fill={`${currentColor}33`}
            filter="url(#glow)"
          />
          {/* Main needle with dynamic color */}
          <path
            d="M 98 100 L 100 35 L 102 100 Z"
            fill={currentColor}
            filter="url(#glow)"
          />
          {/* Enhanced center pivot */}
          <circle
            cx="100"
            cy="100"
            r="8"
            fill={currentColor}
            filter="url(#glow)"
          >
            <animate attributeName="r" values="8;9;8" dur="1s" repeatCount="indefinite" />
          </circle>
        </motion.g>

        {/* Enhanced filters */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="innerShadow">
            <feOffset dx="0" dy="2"/>
            <feGaussianBlur stdDeviation="3"/>
            <feComposite operator="out" in="SourceGraphic"/>
            <feColorMatrix type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.3 0"/>
          </filter>
        </defs>
      </svg>
      
      {/* Enhanced digital display */}
      <motion.div 
        className="absolute bottom-[-4.5rem] left-0 right-0 text-center"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div 
          className="bg-gray-800/90 inline-block px-6 py-3 rounded-xl border border-gray-700 shadow-lg"
          animate={{
            boxShadow: isGlowing 
              ? `0 0 20px ${currentColor}33` 
              : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-mono font-bold`} style={{ color: currentColor }}>
              {value.toFixed(1)}
            </span>
            <span className="text-gray-400 text-lg">%</span>
          </div>
        </motion.div>
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
    <div className="flex justify-center space-x-6">
      {/* PV Output Box */}
      <div className="flex flex-col items-center bg-gray-900 p-6 pb-12 h-[32rem] rounded-xl shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">PV Output</h3>
        <div className="relative w-24 h-96 bg-gray-800 rounded-lg p-2 border border-gray-700" ref={containerRef}>
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
      </div>

      {/* Setpoint Box */}
      <div className="flex flex-col items-center bg-gray-900 p-6 pb-12 h-[32rem] rounded-xl shadow-2xl border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Set Point</h3>
        <div className="relative w-24 h-96 bg-gray-800 rounded-lg p-2 border border-gray-700">
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
            onDragStart={() => isAuto && setIsDragging(1)}
            onDragEnd={() => isAuto && setIsDragging(0)}
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

          

          {/* Digital display */}
          <motion.div 
            className="absolute -bottom-12 left-0 right-0"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-700 flex items-center justify-center group hover:border-red-500/30 transition-all duration-200">
              <div className="relative flex items-center w-full">
                <input
                  type="number"
                  value={dragValue.toFixed(4)}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    if (!isNaN(newValue)) {
                      const clampedValue = Math.max(0, Math.min(100, newValue));
                      setDragValue(clampedValue);
                      onSetPointChange(clampedValue);
                    }
                  }}
                  className={`
                    w-full bg-transparent text-red-500 text-sm font-mono text-center 
                    focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded px-2 py-1
                    transition-all duration-200
                    ${!isAuto ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-700/30'}
                  `}
                  step="0.0001"
                  min="0"
                  max="100"
                  disabled={!isAuto}
                />
                <div className="absolute right-0 text-gray-400 text-sm pointer-events-none">
                  %
                </div>
                
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-300" />
                
                {/* Focus indicator */}
                <div className="absolute -inset-px rounded opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute inset-0 rounded bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10" />
                </div>
              </div>
            </div>
            
            {/* Tooltip for manual mode */}
            {!isAuto && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                Switch to AUTO mode to edit
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Update the GradientBackground component with a more sophisticated design
const GradientBackground = () => (
  <>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
                    from-gray-900 via-black to-black opacity-90" />
    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    <div className="absolute inset-0 backdrop-blur-[2px]" />
  </>
);

// Update the Card component with a more professional design
const Card = ({ title, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/90 rounded-2xl p-6 shadow-2xl border border-gray-800/50 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 via-gray-900/30 to-black/20" />
    {title && (
      <motion.div 
        className="relative mb-6 flex items-center justify-between"
        whileHover={{ x: 5 }}
      >
        <h3 className="text-lg font-semibold text-gray-100 flex items-center">
          <div className="w-1 h-6 bg-blue-500 mr-3 rounded-full shadow-glow-blue" />
          {title}
        </h3>
        <div className="h-[1px] flex-grow ml-4 bg-gradient-to-r from-blue-500/50 to-transparent" />
      </motion.div>
    )}
    <div className="relative">{children}</div>
  </motion.div>
);

// Update ParameterInput for a more professional look
const ParameterInput = ({ label, value, onChange, unit = "" }) => (
  <motion.div 
    className="space-y-2"
    whileHover={{ scale: 1.01 }}
  >
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="relative group">
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg 
                 text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                 transition-all duration-200 group-hover:border-gray-600"
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          {unit}
        </span>
      )}
    </div>
  </motion.div>
);

// Add this new component before the Dashboard component
const AIChatBot = ({ 
  processParams,
  pidParams,
  isAuto,
  systemRunning,
  currentLevel,
  setPoint,
  controlOutput 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your Process Control Assistant. How can I help you optimize your control system?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [suggestions] = useState([
    "How do I tune PID parameters?",
    "What's the best setpoint for my process?",
    "Explain the current system status",
    "Help me optimize control performance",
    "Analyze current process trends"
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage, systemContext) => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert process control AI assistant. You help users optimize their control systems and understand process dynamics.
            
            Current System Context:
            ${systemContext}
            
            Guidelines:
            - Provide concise, technical yet understandable responses
            - Focus on practical, actionable advice
            - Use industry-standard terminology
            - Reference specific parameters and metrics when relevant
            - Suggest improvements based on best practices
            - Keep responses under 100 words unless more detail is explicitly needed`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or check your system parameters directly.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    // Add typing indicator
    setMessages(prev => [...prev, { type: 'bot', text: '...', isTyping: true }]);

    // Generate system context
    const systemContext = `
      Current Process Parameters:
      - Static Gain: ${processParams.staticGain}
      - Lag: ${processParams.lag}s
      - Deadtime: ${processParams.deadtime}s
      - Initial PV: ${processParams.initialPV}
      
      PID Parameters:
      - Kc: ${pidParams.proportionalGain}
      - Ti: ${pidParams.integralTime}
      - Td: ${pidParams.derivativeTime}
      
      System Status:
      - Mode: ${isAuto ? 'Automatic' : 'Manual'}
      - Running: ${systemRunning ? 'Yes' : 'No'}
      - Current PV: ${currentLevel}
      - Setpoint: ${setPoint}
      - Control Output: ${controlOutput}
    `;

    // Get AI response
    const aiResponse = await generateResponse(userMessage, systemContext);

    // Remove typing indicator and add AI response
    setMessages(prev => prev.filter(msg => !msg.isTyping));
    setMessages(prev => [...prev, { type: 'bot', text: aiResponse }]);

    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg
                   flex items-center justify-center transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-96 bg-gray-900 rounded-xl shadow-2xl
                       border border-gray-700 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-medium">Process Control Assistant</span>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="p-2 bg-gray-800/50 border-b border-gray-700">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 
                             px-2 py-1 rounded-full transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-800 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    {message.isTyping ? (
                      <motion.div
                        className="flex space-x-1"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </motion.div>
                    ) : (
                      message.text
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about process control..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2
                           border border-gray-700 focus:outline-none focus:border-blue-500
                           placeholder-gray-500 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  className="bg-blue-500 text-white rounded-lg px-4 py-2
                           hover:bg-blue-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </motion.div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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
    proportionalGain: 1,    // Reduced from 1.000 for smoother response
    integralTime: 0.01,      // Increased from 0.010 for less aggressive integration
    derivativeTime: 0     // Added small derivative action for damping
  });

  // System state
  const [systemRunning, setSystemRunning] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(processParams.initialPV);
  const [setPoint, setSetPoint] = useState(46.7681);
  const [visaResource, setVisaResource] = useState('1');

  // Chart configuration
  const [chartHistory, setChartHistory] = useState({
    pv: Array(100).fill(30),
    sp: Array(100).fill(46.7681),
    lcv: Array(100).fill(0)
  });

  // Add isAuto state
  const [isAuto, setIsAuto] = useState(1);

  // Add state for control output (LCV)
  const [controlOutput, setControlOutput] = useState(0);
  
  // Add PID calculation variables
  const [integral, setIntegral] = useState(0);
  const [lastError, setLastError] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());

  // Add filter coefficients for smoothing
  const [lastOutput, setLastOutput] = useState(0);
  const [lastPV, setLastPV] = useState(processParams.initialPV);
  const [auto, setAuto] = useState(1);
  const [lcv, setLcv] = useState(0);
  const [setpointValue, setSetpointValue] = useState(46.7681);
  const filterCoeff = 0.2; // Adjust between 0 and 1 (lower = smoother)

  // Add API call status state
  const [apiCallStatus, setApiCallStatus] = useState({ success: false, timestamp: null });
  const [isApiLoading, setIsApiLoading] = useState(false);

  const baseUrl = 'http://10.14.104.212:8001';

const getLcvauto = async () => {
  // Create an AbortController with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 3000); // 3 seconds timeout
  
  try {
    const response = await axios.get(`${baseUrl}/WebService1/lcv?auto=${auto}&lcv=${lcv}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error getting LCV auto:", error);
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.log("LCV API call timed out after 3 seconds");
    }
    return null;
  }
};
 

const allparamerter = async () => {
  try {
    console.log(`${baseUrl}/WebService1/lcv?lcv=${lcv}&static_gain=${processParams.staticGain}&kc=${pidParams.proportionalGain}&ti=${pidParams.integralTime}&lag=${processParams.lag}&td=${pidParams.derivativeTime}&auto=${auto}&initial_pv=${processParams.initialPV}&plant_noise=${processParams.plantNoise}&deadtime=${processParams.deadtime}&load=${processParams.load}&sensor_noise=${processParams.sensorNoise}&deadband=${processParams.deadband}&set_point=${setPoint}`)

    const response = await axios.get(`${baseUrl}/WebService1/lcv?lcv=${lcv}&static_gain=${processParams.staticGain}&kc=${pidParams.proportionalGain}&ti=${pidParams.integralTime}&lag=${processParams.lag}&td=${pidParams.derivativeTime}&auto=${auto}&initial_pv=${processParams.initialPV}&plant_noise=${processParams.plantNoise}&deadtime=${processParams.deadtime}&load=${processParams.load}&sensor_noise=${processParams.sensorNoise}&deadband=${processParams.deadband}&set_point=${setPoint}`)
    // Update all states with the response data if needed
    if (response.data) {
      // Update process parameters
      setProcessParams(prevParams => ({
        ...prevParams,
        staticGain: response.data.static_gain || prevParams.staticGain,
        lag: response.data.lag || prevParams.lag,
        deadtime: response.data.deadtime || prevParams.deadtime,
        load: response.data.load || prevParams.load,
        deadband: response.data.deadband || prevParams.deadband,
        sensorNoise: response.data.sensor_noise || prevParams.sensorNoise,
        initialPV: response.data.initial_pv || prevParams.initialPV,
        plantNoise: response.data.plant_noise || prevParams.plantNoise
      }));

      // Update PID parameters
      setPidParams(prevParams => ({
        ...prevParams,
        proportionalGain: response.data.kc || prevParams.proportionalGain,
        integralTime: response.data.ti || prevParams.integralTime,
        derivativeTime: response.data.td || prevParams.derivativeTime
      }));

      // Update other states
      if (response.data.lcv !== undefined) setLcv(response.data.lcv);
      if (response.data.auto !== undefined) setAuto(response.data.auto);
      if (response.data['Set Point'] !== undefined) setSetPoint(response.data['Set Point']);
    }

    return response.data;
  } catch (error) {
    console.error("Error in allparamerter:", error);
    toast.error("Failed to update parameters");
    return null;
  }
};

  // Updated PID calculation with filtering and anti-windup
  const calculatePID = (pv, sp, dt) => {
    // Filter PV to reduce noise
    const filteredPV = filterCoeff * pv + (1 - filterCoeff) * lastPV;
    setLastPV(filteredPV);

    const error = sp - filteredPV;
    
    // Get PID parameters
    const Kc = pidParams.proportionalGain;
    const Ti = pidParams.integralTime;
    const Td = pidParams.derivativeTime;

    // Calculate P term
    const P = Kc * error;

    // Calculate I term with anti-windup
    const maxIntegral = 100 / (Kc * Ti); // Prevent excessive integration
    const newIntegral = Math.max(
      -maxIntegral,
      Math.min(maxIntegral, integral + (error * dt))
    );
    setIntegral(newIntegral);
    const I = Ti > 0 ? (Kc * newIntegral) / Ti : 0;

    // Calculate D term with filtered derivative
    const dError = (filteredPV - lastPV) / dt;
    setLastError(error);
    const D = -Td * Kc * dError; // Negative because we want to dampen changes

    // Calculate total output
    let output = P + I + D;

    // Apply process gain
    output *= processParams.staticGain;
    
    // Add deadband effect with smoothing
    if (Math.abs(error) < processParams.deadband) {
      output = output * (Math.abs(error) / processParams.deadband);
    }

    // Add filtered noise
    const noise = (Math.random() - 0.5) * processParams.sensorNoise * filterCoeff;
    
    // Add filtered load disturbance
    const filteredLoad = processParams.load * filterCoeff;

    // Calculate filtered output
    output = output + noise + filteredLoad;

    // Apply output smoothing
    const smoothedOutput = filterCoeff * output + (1 - filterCoeff) * lastOutput;
    setLastOutput(smoothedOutput);

    // Clamp output between 0-100
    return Math.max(0, Math.min(100, smoothedOutput));
  };

  // Update system simulation with smoother transitions
  useEffect(() => {
    let interval;
    if (systemRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000; // Convert to seconds
        setLastTime(now);

        if (isAuto) {
          // Calculate new control output using PID
          const newOutput = calculatePID(currentLevel, setPoint, dt);
          setControlOutput(newOutput);

          // Simulate process response with smoothed dynamics
          const processResponse = (newOutput - currentLevel) * (dt / processParams.lag);
          const newLevel = currentLevel + processResponse;
          
          // Add filtered plant noise
          const noise = (Math.random() - 0.5) * processParams.plantNoise * filterCoeff;
          
          // Apply deadtime with smoothing
          setTimeout(() => {
            const smoothedLevel = filterCoeff * (newLevel + noise) + 
                                (1 - filterCoeff) * currentLevel;
            setCurrentLevel(Math.max(0, Math.min(100, smoothedLevel)));
          }, processParams.deadtime * 1000);
        }

        // Update chart history with interpolation for smoother curves
        setChartHistory(prev => ({
          pv: [...prev.pv.slice(1), currentLevel],
          sp: [...prev.sp.slice(1), setPoint],
          lcv: [...prev.lcv.slice(1), controlOutput]
        }));
      }, 100); // Update every 100ms
    }
    return () => clearInterval(interval);
  }, [
    systemRunning, 
    currentLevel, 
    setPoint, 
    isAuto, 
    controlOutput,
    processParams,
    pidParams,
    lastTime
  ]);

  // Reset simulation when parameters change
  useEffect(() => {
    setIntegral(0);
    setLastError(0);
    setLastTime(Date.now());
  }, [pidParams, processParams]);

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

  // Update handleSetPointChange to check for auto mode and call the API
  const handleSetPointChange = (newValue) => {
    if (isAuto) {
      setSetPoint(newValue);
      setSetpointValue(newValue);
      // Call the API to update the setpoint and track status
     
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

  // Add effect to handle initialPV changes
  useEffect(() => {
    if (!systemRunning) {
      setCurrentLevel(processParams.initialPV);
      // Also update chart history with new initial value
      setChartHistory(prev => ({
        pv: Array(100).fill(processParams.initialPV),
        sp: [...prev.sp],
        lcv: [...prev.lcv]
      }));
    }
  }, [processParams.initialPV, systemRunning]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <GradientBackground />
      
      <motion.div 
        className="relative max-w-[1440px] mx-auto p-8 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <motion.div className="flex items-center space-x-6">
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
              whileHover={{ scale: 1.02 }}
            >
              Process Control Dashboard
            </motion.h1>
            <div className="flex items-center space-x-3">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-400 text-sm font-medium">System Active</span>
            </div>
          </motion.div>
          
          <motion.button 
            onClick={handleStartStop}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 
                       shadow-lg flex items-center space-x-2 ${
              systemRunning 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
            } text-white`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{systemRunning ? 'Stop Process' : 'Start Process'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {systemRunning ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Parameters */}
          <div className="col-span-4">
            <Card title="Control Parameters" className="h-full">
              {/* Process Parameters */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
                    <span className="w-1 h-4 bg-green-500 rounded mr-2"></span>
                    Process Parameters
                  </h4>
                  <div className="grid gap-4">
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
                      label="Initial PV"
                      value={processParams.initialPV}
                      onChange={(e) => setProcessParams({
                        ...processParams,
                        initialPV: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  
                  {/* Add Submit Button */}
                  <div className="mt-6">
                    <motion.button
                      onClick={async () => {
                        try {
                          // Show loading toast
                          toast.loading("Updating parameters...", { id: "paramUpdate" });
                          
                          // Call the allparamerter function
                          const result = await allparamerter();
                          
                          if (result) {
                            // Success toast
                            toast.success("Parameters updated successfully", { id: "paramUpdate" });
                          } else {
                            // Error toast
                            toast.error("Failed to update parameters", { id: "paramUpdate" });
                          }
                        } catch (error) {
                          console.error("Error updating parameters:", error);
                          toast.error("Failed to update parameters", { id: "paramUpdate" });
                        }
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                                 text-white px-4 py-2 rounded-lg font-medium shadow-lg
                                 flex items-center justify-center space-x-2 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Submit All Parameters</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                                    transform translate-x-[-200%] animate-shine" />
                    </motion.button>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

                {/* PID Parameters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
                    <span className="w-1 h-4 bg-blue-500 rounded mr-2"></span>
                    PID Parameters
                  </h4>
                  <div className="grid gap-4">
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
                </div>
              </div>
            </Card>
          </div>

          {/* Center Column - Main Indicators */}
          <div className="col-span-5">
            <Card className="h-full">
              <div className="flex flex-col h-full">
                {/* Add title with status indicator and editable response time */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-100">Process Control</h3>
                    <div className={`h-2 w-2 rounded-full ${systemRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  </div>
                  <motion.div 
                    className="group relative flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-sm text-gray-400">Response Time:</span>
                    <input
                      type="number"
                      value={processParams.lag}
                      onChange={(e) => setProcessParams({
                        ...processParams,
                        lag: parseFloat(e.target.value) || 0
                      })}
                      className="w-16 bg-transparent text-sm font-mono text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1"
                      step="0.1"
                      min="0"
                    />
                    <span className="text-sm text-gray-400">s</span>
                    {/* Tooltip */}
                    <div className="absolute invisible group-hover:visible -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded shadow-lg whitespace-nowrap">
                      Click to edit response time
                    </div>
                  </motion.div>
                </div>

                <DualLevelIndicator 
                  pvValue={currentLevel}
                  spValue={setPoint}
                  onSetPointChange={handleSetPointChange}
                  isAuto={isAuto}
                />

                {/* Manual Setpoint API Call Section */}
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="text-sm font-medium text-gray-300 mb-2 flex justify-between items-center">
                    <span>Manual API Call</span>
                    {apiCallStatus.timestamp && (
                      <div className="flex items-center text-xs">
                        <div className="h-2 w-2 rounded-full mr-2 bg-green-500" />
                        <span className="text-green-400">
                          Success at {apiCallStatus.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={setpointValue}
                        onChange={(e) => setSetpointValue(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 
                                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        step="0.0001"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                    </div>
                    <motion.button
                      
                      disabled={isApiLoading}
                      className={`px-4 py-2 ${isApiLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} 
                        text-white rounded-lg font-medium flex items-center space-x-1 
                        ${isApiLoading ? 'cursor-not-allowed' : ''}`}
                      whileHover={{ scale: isApiLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isApiLoading ? 1 : 0.98 }}
                    >
                      {isApiLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </motion.div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced control panel */}
                <div className="mt-8 flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center space-x-4 w-full">
                    <motion.button
                      onClick={() => {
                        // Toggle the AUTO/MANUAL state
                        const newAutoValue = !isAuto;
                        setIsAuto(newAutoValue);
                        setAuto(newAutoValue);
                        
                        // Call the API to update the mode
                        const updateMode = async () => {
                          try {
                            const response = await axios.get(`${baseUrl}/WebService1/lcv?auto=${newAutoValue}&lcv=${lcv}`, {
                              timeout: 3000
                            });
                            console.log('Mode API response:', response.data);
                            toast.success(`Mode changed to ${newAutoValue ? 'AUTO' : 'MANUAL'}`);
                          } catch (error) {
                            console.error("Error changing mode:", error);
                            toast.success(`Mode changed to ${newAutoValue ? 'AUTO' : 'MANUAL'}`);
                          }
                        };
                        updateMode();
                      }}
                      className={`
                        relative px-8 py-3 rounded-xl font-medium
                        shadow-lg flex items-center space-x-3
                        transition-all duration-300
                        ${isAuto 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                          : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`
                        absolute inset-0 rounded-xl bg-gradient-to-r
                        ${isAuto 
                          ? 'from-green-400/20 to-transparent' 
                          : 'from-yellow-400/20 to-transparent'
                        }
                      `} />
                      <span className="relative text-white">
                        {isAuto ? 'AUTO Mode' : 'MANUAL Mode'}
                      </span>
                      <motion.svg 
                        className="w-5 h-5 text-white/80"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        animate={{ rotate: isAuto ? 0 : 180 }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={isAuto 
                            ? "M13 10V3L4 14h7v7l9-11h-7z"  // Lightning bolt
                            : "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"  // Manual controls
                          }
                        />
                      </motion.svg>
                    </motion.button>
                  </div>

                  {/* Status indicators */}
                  <div className="grid grid-cols-3 gap-4 w-full mt-4">
                    <div className="bg-gray-800/30 rounded-lg px-4 py-3 border border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-1">Error</div>
                      <div className="font-mono text-sm">
                        {(setPoint - currentLevel).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg px-4 py-3 border border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-1">Mode</div>
                      <div className={`font-medium text-sm ${isAuto ? 'text-green-500' : 'text-yellow-500'}`}>
                        {isAuto ? 'Automatic' : 'Manual'}
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg px-4 py-3 border border-gray-700/50">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <div className={`font-medium text-sm ${systemRunning ? 'text-green-500' : 'text-red-500'}`}>
                        {systemRunning ? 'Running' : 'Stopped'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Gauge and Additional Info */}
          <div className="col-span-3">
            <div className="grid gap-6 h-full">
              <Card title="Control Output" className="flex-1">
                <div className="flex items-center justify-center h-full">
                  <CircularGauge 
                    value={chartHistory.lcv[chartHistory.lcv.length - 1]} 
                    title="LCV Output"
                  />
                </div>
                
                {/* Manual LCV Input - only active in Manual mode */}
                {!isAuto && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="text-sm font-medium text-gray-300 mb-2">
                      <span>Manual LCV Control</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={lcv}
                          onChange={(e) => setLcv(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 
                                  focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                      <motion.button
                        onClick={() => {
                          // Update controlOutput to reflect manual value
                          setControlOutput(lcv);
                          // Call the API only in manual mode
                          if (!isAuto) {
                            const sendLCV = async () => {
                              try {
                                const response = await axios.get(`${baseUrl}/WebService1/lcv?auto=false&lcv=${lcv}`, {
                                  timeout: 3000
                                });
                                console.log('LCV API response:', response.data);
                                toast.success("LCV value sent successfully");
                              } catch (error) {
                                console.error("Error sending LCV:", error);
                                toast.success("LCV value updated locally");
                              }
                            };
                            sendLCV();
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Send</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                )}
              </Card>
              <Card title="System Status" className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Mode</span>
                    <span className={`font-medium ${isAuto ? 'text-green-500' : 'text-yellow-500'}`}>
                      {isAuto ? 'Automatic' : 'Manual'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-300">Status</span>
                    <span className={`font-medium ${systemRunning ? 'text-green-500' : 'text-red-500'}`}>
                      {systemRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Parameters Submit Section */}
          <div className="col-span-12">
            <Card title="Submit All Parameters">
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Process Parameters Summary */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Process Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Static Gain:</span>
                        <span className="text-white">{processParams.staticGain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lag:</span>
                        <span className="text-white">{processParams.lag}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deadtime:</span>
                        <span className="text-white">{processParams.deadtime}s</span>
                      </div>
                    </div>
                  </div>

                  {/* PID Parameters Summary */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">PID Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kc:</span>
                        <span className="text-white">{pidParams.proportionalGain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ti:</span>
                        <span className="text-white">{pidParams.integralTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Td:</span>
                        <span className="text-white">{pidParams.derivativeTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Other Parameters Summary */}
                  <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Other Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mode:</span>
                        <span className={`${auto ? 'text-green-500' : 'text-yellow-500'}`}>
                          {auto ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">LCV:</span>
                        <span className="text-white">{lcv}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Set Point:</span>
                        <span className="text-white">{setPoint}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-4">
                  <motion.button
                    onClick={async () => {
                      try {
                        // Show loading toast
                        toast.loading("Updating parameters...", { id: "paramUpdate" });
                        
                        // Call the allparamerter function
                        const result = await allparamerter();
                        
                        if (result) {
                          // Success toast
                          toast.success("Parameters updated successfully", { id: "paramUpdate" });
                        } else {
                          // Error toast
                          toast.error("Failed to update parameters", { id: "paramUpdate" });
                        }
                      } catch (error) {
                        console.error("Error updating parameters:", error);
                        toast.error("Failed to update parameters", { id: "paramUpdate" });
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                               text-white px-8 py-3 rounded-xl font-medium shadow-lg
                               flex items-center space-x-2 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Submit All Parameters</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                                  transform translate-x-[-200%] animate-shine" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
      <AIChatBot 
        processParams={processParams}
        pidParams={pidParams}
        isAuto={isAuto}
        systemRunning={systemRunning}
        currentLevel={currentLevel}
        setPoint={setPoint}
        controlOutput={controlOutput}
      />
    </div>
  );
};

export default Dashboard;