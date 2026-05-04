import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ NUCLEAR FIX: Check localStorage DIRECTLY on mount AND after delay
  useEffect(() => {
    // Initial check
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      setIsAuthenticated(!!storedToken);
    };
    
    checkAuth();
    
    // Give React 100ms to hydrate context state before final auth check
    const timer = setTimeout(() => {
      checkAuth(); // ✅ Re-check token AFTER delay (fixes race condition)
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Show loading spinner ONLY during initial auth check
  if (!authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={48} sx={{ color: '#2e7d32' }} />
      </Box>
    );
  }

  // ✅ ONLY redirect if TRULY unauthenticated (no token in localStorage)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;