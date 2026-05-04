// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';
import Voice from './pages/Voice';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { getTheme } from './theme'; // ✅ NEW: Import from centralized theme

// ✅ THEME HOOK (with localStorage persistence) - KEPT AS-IS
const useThemeMode = () => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Update document background for smooth transitions
    document.documentElement.style.backgroundColor = mode === 'dark' ? '#0f131a' : '#f8fafc';
    document.body.style.backgroundColor = mode === 'dark' ? '#0f131a' : '#f8fafc';
  }, [mode]);

  return [mode, setMode];
};

function AppContent() {
  const [mode, setMode] = useThemeMode();
  const theme = getTheme(mode); // ✅ Use imported getTheme function

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* PROTECTED ROUTES */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:conversationId" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/conversations" 
            element={
              <ProtectedRoute>
                <Conversations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/voice" 
            element={
              <ProtectedRoute>
                <Voice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* ✅ FIXED: DEFAULT ROUTE - Redirect to dashboard if authenticated, else login */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;