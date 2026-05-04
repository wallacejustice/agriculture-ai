// frontend/src/pages/ForgotPassword.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Fade,
  Grid,
  IconButton
} from '@mui/material';
import { Email, CheckCircle, Warning, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ✅ FIX #1: Use environment variable for API URL (works on localhost AND production)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const glassEffect = useMemo(() => ({
    bgcolor: darkMode ? 'rgba(20, 25, 35, 0.92)' : 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(12px)',
    border: darkMode 
      ? '1px solid rgba(40, 50, 70, 0.35)'
      : '1px solid rgba(220, 225, 235, 0.7)',
    boxShadow: darkMode
      ? '0 10px 32px rgba(0, 0, 0, 0.45)'
      : '0 10px 32px rgba(0, 0, 0, 0.06)',
    borderRadius: 2.5,
    color: darkMode ? '#e6e6e6' : '#121212'
  }), [darkMode]);

  const backgroundStyle = useMemo(() => ({
    bgcolor: darkMode ? '#0f131a' : '#f8fafc',
    backgroundImage: darkMode
      ? 'radial-gradient(circle at 10% 20%, rgba(30, 40, 60, 0.2) 0%, transparent 25%), radial-gradient(circle at 90% 80%, rgba(40, 50, 70, 0.15) 0%, transparent 25%)'
      : 'radial-gradient(circle at 10% 20%, rgba(230, 240, 255, 0.15) 0%, transparent 25%), radial-gradient(circle at 90% 80%, rgba(220, 230, 255, 0.1) 0%, transparent 25%)',
    backgroundSize: '100% 100%'
  }), [darkMode]);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f131a' : '#f8fafc';
    document.body.style.color = darkMode ? '#e6e6e6' : '#121212';
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.body.style.backgroundColor = newMode ? '#0f131a' : '#f8fafc';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  // ✅ CONNECTED TO BACKEND API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    // Validate email
    if (!formData.email) {
      setErrorMessage('Please enter your email address');
      setIsSubmitting(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ FIX #1: Use API_BASE instead of hardcoded localhost
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      // ✅ Show success message from backend
      setSuccessMessage(data.message || 'If an account exists with this email, you will receive a password reset link shortly.');
      console.log(`🔐 Password reset requested for: ${formData.email}`);
      
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      setErrorMessage(err.message || 'Failed to send reset link. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={backgroundStyle}>
      {/* Dark Mode Toggle */}
      <Box sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1200,
        ...glassEffect,
        borderRadius: '18px',
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconButton 
          onClick={toggleDarkMode}
          sx={{
            color: darkMode ? '#8194b8' : '#4a5568',
            width: 42,
            height: 42,
            '&:hover': { bgcolor: darkMode ? 'rgba(60, 80, 110, 0.3)' : 'rgba(200, 210, 230, 0.25)' },
            transition: 'all 0.25s ease'
          }}
        >
          {darkMode ? <span style={{ fontSize: 24 }}>☀️</span> : <span style={{ fontSize: 24 }}>🌙</span>}
        </IconButton>
      </Box>

      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Fade in timeout={400}>
          <Paper sx={{
            ...glassEffect,
            p: { xs: 3.5, sm: 4.5 },
            width: '100%',
            maxWidth: 480,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: darkMode 
                ? 'linear-gradient(90deg, #e53935, #d32f2f)'
                : 'linear-gradient(90deg, #c62828, #ef5350)',
              opacity: 0.9
            }
          }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: '22px',
                bgcolor: darkMode ? 'rgba(198, 40, 40, 0.2)' : 'rgba(239, 83, 80, 0.1)',
                mb: 2.5,
                mx: 'auto',
                border: darkMode 
                  ? '1px solid rgba(198, 40, 40, 0.4)'
                  : '1px solid rgba(239, 83, 80, 0.3)',
                boxShadow: darkMode
                  ? '0 6px 20px rgba(198, 40, 40, 0.3)'
                  : '0 6px 20px rgba(239, 83, 80, 0.15)'
              }}>
                <Email sx={{ 
                  fontSize: 42, 
                  color: darkMode ? '#ef5350' : '#d32f2f',
                  filter: darkMode 
                    ? 'drop-shadow(0 4px 16px rgba(239, 83, 80, 0.35))'
                    : 'drop-shadow(0 4px 16px rgba(211, 47, 47, 0.2))'
                }} />
              </Box>
              
              <Typography 
                variant="h3" 
                fontWeight="700"
                gutterBottom
                sx={{ 
                  background: darkMode
                    ? 'linear-gradient(135deg, #f87171 0%, #fca5a5 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}
              >
                Reset Password
              </Typography>
              
              <Typography 
                variant="body1" 
                color={darkMode ? '#94a3b8' : '#64748b'}
                sx={{ mt: 1, maxWidth: 420, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}
              >
                Enter your email address and we'll send you instructions to reset your password
              </Typography>
            </Box>

            {/* Success Message */}
            {successMessage && (
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.15)'}`,
                  bgcolor: darkMode ? 'rgba(6, 78, 59, 0.6)' : 'rgba(240, 253, 244, 0.7)',
                  color: darkMode ? '#6ee7b7' : '#059669'
                }}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert 
                severity="error" 
                icon={<Warning />}
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${darkMode ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.15)'}`,
                  bgcolor: darkMode ? 'rgba(127, 29, 29, 0.6)' : 'rgba(254, 242, 242, 0.7)',
                  color: darkMode ? '#f87171' : '#dc2626'
                }}
              >
                {errorMessage}
              </Alert>
            )}

            {/* Form Section */}
            {!successMessage && (
              <form onSubmit={handleSubmit} noValidate autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      label="Enter your registered email address"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <span style={{ marginRight: 12 }}>
                            <Email sx={{ color: darkMode ? '#64748b' : '#64748b', opacity: 0.85 }} />
                          </span>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.75,
                          bgcolor: darkMode ? 'rgba(25, 32, 45, 0.65)' : 'rgba(250, 252, 255, 0.85)',
                          '& fieldset': { borderColor: darkMode ? 'rgba(80, 100, 130, 0.45)' : 'rgba(140, 160, 190, 0.35)' },
                          '&:hover fieldset': { borderColor: darkMode ? 'rgba(239, 83, 80, 0.7)' : 'rgba(220, 38, 38, 0.65)' },
                          '&.Mui-focused fieldset': { borderColor: darkMode ? '#ef5350' : '#dc2626' }
                        },
                        '& .MuiInputLabel-root': { color: darkMode ? '#94a3b8' : '#64748b' },
                        '& .MuiInputBase-input': { color: darkMode ? '#f1f5f9' : '#0f172a' }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isSubmitting || !!successMessage}
                      sx={{
                        py: 1.85,
                        borderRadius: 2,
                        background: darkMode
                          ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
                          : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                        '&:hover': {
                          background: darkMode
                            ? 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)'
                            : 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: darkMode
                            ? '0 8px 24px rgba(185, 28, 28, 0.45)'
                            : '0 8px 24px rgba(185, 28, 28, 0.35)'
                        },
                        '&:disabled': {
                          background: darkMode ? 'rgba(120, 53, 53, 0.6)' : 'rgba(229, 231, 235, 0.7)',
                          color: darkMode ? '#fca5a5' : '#9ca3af'
                        },
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        letterSpacing: '0.4px',
                        color: '#ffffff'
                      }}
                    >
                      {isSubmitting ? <CircularProgress size={26} sx={{ color: 'white' }} /> : 'Send Reset Instructions'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}

            {/* Back to Login Link */}
            <Box sx={{ 
              mt: 4, 
              textAlign: 'center',
              pt: successMessage ? 0 : 2.5,
              borderTop: darkMode ? '1px solid rgba(80,100,130,0.25)' : '1px solid rgba(180,190,210,0.35)'
            }}>
              <MuiLink 
                href="/login" 
                variant="body2"
                sx={{ 
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline', color: darkMode ? '#3b82f6' : '#1e40af' }
                }}
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              >
                <ArrowBack sx={{ fontSize: 16 }} />
                Back to Login
              </MuiLink>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color={darkMode ? '#64748b' : '#94a3b8'} sx={{ fontWeight: 500 }}>
                © 2026 AgriPal Platform • Crafted by Wallace Justice in Accra, Ghana 🇬🇭
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ForgotPassword;