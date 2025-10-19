import React, { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FloatingTimer from './FloatingTimer';

const GlobalFloatingTimer = () => {
  const { isRunning, timeLeft, timerMode } = useTimer();
  const [showFloatingTimer, setShowFloatingTimer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnTimerPage, setIsOnTimerPage] = useState(false);

  // Track if user is on timer page
  useEffect(() => {
    setIsOnTimerPage(location.pathname === '/timer');
  }, [location]);

  // Page Visibility API - Show floating timer when tab is hidden OR user is not on timer page
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      
      // Show floating timer when:
      // 1. Timer is running AND
      // 2. (Tab is hidden OR user is on a different page than timer)
      if (isRunning && (!isVisible || !isOnTimerPage)) {
        setShowFloatingTimer(true);
      } else if (isVisible && isOnTimerPage) {
        // Hide floating timer when on timer page and tab is visible
        setShowFloatingTimer(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check when page changes or timer starts/stops
    if (isRunning && !isOnTimerPage) {
      setShowFloatingTimer(true);
    } else if (isOnTimerPage || !isRunning) {
      setShowFloatingTimer(false);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isOnTimerPage]);

  const handleMaximize = () => {
    setShowFloatingTimer(false);
    navigate('/timer');
  };

  return (
    <FloatingTimer
      isVisible={showFloatingTimer}
      onClose={() => setShowFloatingTimer(false)}
      timeLeft={timeLeft}
      timerMode={timerMode}
      isRunning={isRunning}
      onMaximize={handleMaximize}
    />
  );
};

export default GlobalFloatingTimer;
