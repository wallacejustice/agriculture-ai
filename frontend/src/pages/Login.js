import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Fade
} from '@mui/material';
import {
  AccountCircle,
  Lock,
  DarkMode,
  LightMode,
  Visibility,
  VisibilityOff,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate(); // ✅ IMPORTANT: Use navigate hook
  const { login, user, token, error: authError, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
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

  useEffect(() => {
    if (redirecting && user && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [redirecting, user, token, navigate]);

  if (redirecting && (!user || !token)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: darkMode ? '#0f131a' : '#f8fafc'
      }}>
        <CircularProgress size={48} sx={{ color: darkMode ? '#3498db' : '#2c3e50', mb: 2 }} />
        <Typography variant="body1" color={darkMode ? '#b0b7c3' : '#64748b'}>
          Establishing secure session...
        </Typography>
      </Box>
    );
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.body.style.backgroundColor = newMode ? '#0f131a' : '#f8fafc';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setFormError('Please enter your email and password');
      setIsSubmitting(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(formData);
      setRedirecting(true);
      
      // ✅ FIX: Direct redirect as fallback (ensures redirect even if useEffect doesn't trigger)
      if (localStorage.getItem('token') && localStorage.getItem('user')) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setFormData(prev => ({ ...prev, password: '' }));
      setFormError('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={backgroundStyle}>
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
            '&:hover': {
              bgcolor: darkMode ? 'rgba(60, 80, 110, 0.3)' : 'rgba(200, 210, 230, 0.25)'
            },
            transition: 'all 0.25s ease'
          }}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <LightMode sx={{ fontSize: 24 }} /> : <DarkMode sx={{ fontSize: 24 }} />}
        </IconButton>
      </Box>

      <Container 
        maxWidth="sm" 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
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
                ? 'linear-gradient(90deg, #2c3e50, #3498db)'
                : 'linear-gradient(90deg, #1a2530, #2980b9)',
              opacity: 0.9
            }
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 72,
                height: 72,
                borderRadius: '22px',
                bgcolor: darkMode ? 'rgba(40, 55, 80, 0.6)' : 'rgba(230, 240, 255, 0.7)',
                mb: 2.5,
                mx: 'auto',
                border: darkMode 
                  ? '1px solid rgba(60, 80, 110, 0.4)'
                  : '1px solid rgba(200, 215, 240, 0.6)',
                boxShadow: darkMode
                  ? '0 6px 20px rgba(0, 10, 25, 0.4)'
                  : '0 6px 20px rgba(0, 30, 80, 0.06)'
              }}>
                <Security sx={{ 
                  fontSize: 42, 
                  color: darkMode ? '#3498db' : '#2c3e50',
                  filter: darkMode 
                    ? 'drop-shadow(0 4px 16px rgba(52, 152, 219, 0.35))'
                    : 'drop-shadow(0 4px 16px rgba(44, 62, 80, 0.2))'
                }} />
              </Box>
              
              <Typography 
                variant="h3" 
                fontWeight="700"
                gutterBottom
                sx={{ 
                  background: darkMode
                    ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}
              >
                AgriPal Platform
              </Typography>
              
              <Typography 
                variant="body1" 
                color={darkMode ? '#94a3b8' : '#64748b'}
                sx={{ 
                  mt: 1,
                  maxWidth: 420,
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Enterprise-grade agricultural intelligence platform for farmers and agronomists
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3.5,
              gap: 1,
              bgcolor: darkMode ? 'rgba(40, 55, 80, 0.4)' : 'rgba(230, 245, 255, 0.6)',
              p: 1.2,
              borderRadius: 2,
              border: darkMode ? '1px solid rgba(60, 80, 110, 0.3)' : '1px solid rgba(180, 210, 255, 0.4)'
            }}>
              <Security sx={{ 
                fontSize: 18, 
                color: darkMode ? '#3498db' : '#2980b9',
                flexShrink: 0 
              }} />
              <Typography 
                variant="caption" 
                fontWeight="500"
                color={darkMode ? '#94a3b8' : '#4a5568'}
                sx={{ lineHeight: 1.4 }}
              >
                End-to-end encrypted • SOC 2 compliant • GDPR ready
              </Typography>
            </Box>

            {(formError || authError) && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${darkMode ? 'rgba(220, 60, 60, 0.3)' : 'rgba(255, 80, 80, 0.15)'}`,
                  bgcolor: darkMode ? 'rgba(40, 25, 30, 0.6)' : 'rgba(255, 240, 240, 0.7)',
                  color: darkMode ? '#f87171' : '#dc2626'
                }}
              >
                {formError || authError}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ 
                            color: darkMode ? '#64748b' : '#64748b', 
                            fontSize: 21,
                            opacity: 0.85
                          }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.75,
                        bgcolor: darkMode ? 'rgba(25, 32, 45, 0.65)' : 'rgba(250, 252, 255, 0.85)',
                        '& fieldset': { 
                          borderColor: darkMode ? 'rgba(80, 100, 130, 0.45)' : 'rgba(140, 160, 190, 0.35)',
                          borderWidth: 1.25
                        },
                        '&:hover fieldset': { 
                          borderColor: darkMode ? 'rgba(52, 152, 219, 0.7)' : 'rgba(44, 62, 80, 0.65)'
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: darkMode ? '#3498db' : '#2c3e50',
                          borderWidth: 1.5
                        }
                      },
                      '& .MuiInputLabel-root': { 
                        color: darkMode ? '#94a3b8' : '#64748b',
                        fontWeight: 500
                      },
                      '& .MuiInputLabel-root.Mui-focused': { 
                        color: darkMode ? '#60a5fa' : '#3b82f6'
                      },
                      '& .MuiInputBase-input': { 
                        color: darkMode ? '#f1f5f9' : '#0f172a',
                        py: 1.6,
                        px: 1.5,
                        fontWeight: 500,
                        fontSize: '0.975rem'
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: darkMode 
                          ? '0 0 0 1000px rgba(25, 32, 45, 0.85) inset !important'
                          : '0 0 0 1000px rgba(250, 252, 255, 0.9) inset !important',
                        WebkitTextFillColor: `${darkMode ? '#e2e8f0' : '#0f172a'} !important`,
                        transition: 'background-color 5000s ease-in-out 0s !important'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ 
                            color: darkMode ? '#64748b' : '#64748b', 
                            fontSize: 20,
                            opacity: 0.85
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ 
                              color: darkMode ? '#94a3b8' : '#64748b'
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.75,
                        bgcolor: darkMode ? 'rgba(25, 32, 45, 0.65)' : 'rgba(250, 252, 255, 0.85)',
                        '& fieldset': { 
                          borderColor: darkMode ? 'rgba(80, 100, 130, 0.45)' : 'rgba(140, 160, 190, 0.35)',
                          borderWidth: 1.25
                        },
                        '&:hover fieldset': { 
                          borderColor: darkMode ? 'rgba(52, 152, 219, 0.7)' : 'rgba(44, 62, 80, 0.65)'
                        },
                        '&.Mui-focused fieldset': { 
                          borderColor: darkMode ? '#3498db' : '#2c3e50',
                          borderWidth: 1.5
                        }
                      },
                      '& .MuiInputBase-input': { 
                        color: darkMode ? '#f1f5f9' : '#0f172a',
                        py: 1.6,
                        px: 1.5,
                        fontWeight: 500,
                        fontSize: '0.975rem'
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: darkMode 
                          ? '0 0 0 1000px rgba(25, 32, 45, 0.85) inset !important'
                          : '0 0 0 1000px rgba(250, 252, 255, 0.9) inset !important',
                        WebkitTextFillColor: `${darkMode ? '#e2e8f0' : '#0f172a'} !important`,
                        transition: 'background-color 5000s ease-in-out 0s !important'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          size="medium"
                          sx={{ 
                            color: darkMode ? '#64748b' : '#64748b',
                            '&.Mui-checked': { 
                              color: darkMode ? '#3498db' : '#2c3e50'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography 
                          variant="body2" 
                          color={darkMode ? '#cbd5e1' : '#475569'} 
                          sx={{ fontWeight: 500, letterSpacing: '0.3px' }}
                        >
                          Keep me signed in
                        </Typography>
                      }
                    />
                    
                    {/* ✅ CRITICAL FIX: CHANGE HREF="#" TO NAVIGATION */}
                    <MuiLink 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        navigate('/forgot-password'); 
                      }}
                      variant="body2"
                      sx={{ 
                        color: darkMode ? '#60a5fa' : '#3b82f6',
                        fontWeight: 600,
                        textDecoration: 'none',
                        letterSpacing: '0.2px',
                        cursor: 'pointer',
                        '&:hover': { 
                          textDecoration: 'underline',
                          color: darkMode ? '#3b82f6' : '#2563eb'
                        }
                      }}
                    >
                      Forgot password?
                    </MuiLink>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={authLoading || isSubmitting || redirecting}
                    sx={{
                      py: 1.85,
                      borderRadius: 2,
                      background: darkMode
                        ? 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)'
                        : 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                      '&:hover': {
                        background: darkMode
                          ? 'linear-gradient(135deg, #172554 0%, #1e40af 100%)'
                          : 'linear-gradient(135deg, #172554 0%, #1e40af 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: darkMode
                          ? '0 8px 24px rgba(30, 60, 138, 0.45)'
                          : '0 8px 24px rgba(30, 60, 138, 0.35)'
                      },
                      '&:disabled': {
                        background: darkMode 
                          ? 'linear-gradient(135deg, #253550 0%, #2a3d66 100%)' 
                          : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                        color: darkMode ? '#64748b' : '#94a3b8'
                      },
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      letterSpacing: '0.4px',
                      color: '#ffffff',
                      boxShadow: darkMode
                        ? '0 4px 14px rgba(0, 15, 45, 0.35)'
                        : '0 4px 14px rgba(20, 40, 90, 0.22)'
                    }}
                  >
                    {(authLoading || isSubmitting || redirecting) ? (
                      <CircularProgress size={26} sx={{ color: 'white' }} />
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ 
              my: 4, 
              borderColor: darkMode ? 'rgba(80, 100, 130, 0.3)' : 'rgba(180, 190, 210, 0.4)'
            }}>
              <Typography 
                variant="caption" 
                color={darkMode ? '#64748b' : '#94a3b8'}
                sx={{ 
                  px: 1.5,
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body1" 
                color={darkMode ? '#94a3b8' : '#64748b'}
                sx={{ 
                  fontWeight: 400,
                  letterSpacing: '0.2px',
                  lineHeight: 1.6
                }}
              >
                New to AgriPal?{' '}
                <MuiLink 
                  href="/register" 
                  variant="body1"
                  sx={{ 
                    color: darkMode ? '#60a5fa' : '#2563eb',
                    fontWeight: 600,
                    textDecoration: 'none',
                    letterSpacing: '0.3px',
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: darkMode ? '#3b82f6' : '#1e40af'
                    }
                  }}
                  onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                >
                  Create your account
                </MuiLink>
              </Typography>
            </Box>

            {/* ✅ DEVELOPER CREDIT FOOTER */}
            <Box sx={{ 
              mt: 4, 
              pt: 2.5, 
              borderTop: darkMode ? '1px solid rgba(80,100,130,0.25)' : '1px solid rgba(180,190,210,0.35)',
              textAlign: 'center'
            }}>
              <Typography 
                variant="caption" 
                color={darkMode ? '#64748b' : '#94a3b8'}
                sx={{ 
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75
                }}
              >
                © 2026 AgriPal Platform • Crafted by Wallace Justice in Accra, Ghana 🇬🇭
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;