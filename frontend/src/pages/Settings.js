import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Divider,
  Button,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  DarkMode,
  LightMode,
  Language,
  LocationOn,
  ArrowBack,
  Verified,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('darkMode');
  return saved ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [region, setRegion] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = darkMode ? '#0a0f0a' : '#f8fafc';
      document.body.style.color = darkMode ? '#e6e6e6' : '#121212';
      localStorage.setItem('darkMode', darkMode);
    }
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      setPreferredLanguage(user.preferredLanguage || 'en');
      
      const validRegions = [
        'Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 
        'Northern', 'Upper East', 'Upper West', 'Volta', 'Western', 
        'North East', 'Savannah', 'Bono East', 'Ahafo', 'Oti', 'Western North'
      ];
      
      const rawRegion = user.region || '';
      const sanitizedRegion = validRegions.includes(rawRegion) ? rawRegion : '';
      
      setRegion(sanitizedRegion);
    }
  }, [user]);

  const cardStyle = {
    bgcolor: darkMode ? 'rgba(25, 35, 30, 0.94)' : 'rgba(255, 255, 255, 0.98)',
    border: darkMode 
      ? '1px solid rgba(46, 125, 50, 0.25)'
      : '1px solid rgba(46, 125, 50, 0.15)',
    boxShadow: darkMode
      ? '0 10px 32px rgba(0, 20, 10, 0.45)'
      : '0 10px 32px rgba(0, 50, 20, 0.08)',
    borderRadius: 4,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const backgroundStyle = {
    bgcolor: darkMode ? '#0a0f0a' : '#f8fafc',
    backgroundImage: darkMode
      ? 'radial-gradient(circle at 10% 20%, rgba(30, 60, 40, 0.25) 0%, transparent 25%), radial-gradient(circle at 90% 80%, rgba(40, 80, 50, 0.2) 0%, transparent 25%)'
      : 'radial-gradient(circle at 10% 20%, rgba(200, 230, 210, 0.15) 0%, transparent 25%), radial-gradient(circle at 90% 80%, rgba(180, 220, 200, 0.1) 0%, transparent 25%)',
    backgroundSize: '100% 100%'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: darkMode ? '#0a0f0a' : '#f8fafc'
      }}>
        <Typography variant="h6" color={darkMode ? '#a5d6a7' : '#1b5e20'}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={backgroundStyle}>
      {/* Header */}
      <Box sx={{
        ...cardStyle,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: darkMode ? '1px solid rgba(46, 125, 50, 0.3)' : '1px solid rgba(46, 125, 50, 0.2)',
        py: 2,
        px: { xs: 2, sm: 3 }
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: darkMode ? '#a5d6a7' : '#1b5e20',
              '&:hover': { 
                bgcolor: darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.08)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease',
              width: 48,
              height: 48
            }}
          >
            <ArrowBack sx={{ fontSize: 26 }} />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ 
            background: darkMode
              ? 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)'
              : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Account Settings
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={3.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Profile Card */}
            <Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4, md: 5 }, mb: 3.5 }}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                <Avatar sx={{
                  width: { xs: 80, sm: 96 },
                  height: { xs: 80, sm: 96 },
                  bgcolor: darkMode ? 'rgba(46,125,50,0.35)' : 'rgba(46,125,50,0.2)',
                  border: darkMode ? '2px solid rgba(81,197,132,0.6)' : '2px solid rgba(46,125,50,0.4)',
                  fontSize: { xs: '2rem', sm: '2.5rem' }
                }}>
                  <AccountCircle sx={{ fontSize: 'inherit', color: darkMode ? '#81c784' : '#2e7d32' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    background: darkMode
                      ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                      : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                    fontSize: { xs: '1.8rem', sm: '2rem' }
                  }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body1" color={darkMode ? '#a5d6a7' : '#4caf50'} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mt: 0.5,
                    fontWeight: 600
                  }}>
                    <Verified sx={{ fontSize: 20, color: 'success.main' }} /> 
                    Verified Farmer • {user.email}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3, borderColor: darkMode ? 'rgba(46,125,50,0.3)' : 'rgba(46,125,50,0.25)', opacity: 0.7 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5, color: darkMode ? '#a5d6a7' : '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle sx={{ fontSize: 20 }} /> Personal Information
                  </Typography>
                  <Typography variant="body1" color={darkMode ? '#e6e6e6' : '#121212'}>{user.name}</Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5, color: darkMode ? '#a5d6a7' : '#2e7d32', display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, md: 0 } }}>
                    <Language sx={{ fontSize: 20 }} /> Account Type
                  </Typography>
                  <Chip 
                    label="Farmer" 
                    size="medium" 
                    sx={{ 
                      bgcolor: darkMode ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.1)',
                      color: darkMode ? '#a5d6a7' : '#1b5e20',
                      fontWeight: 700,
                      height: 36,
                      fontSize: '1.05rem',
                      px: 2,
                      borderRadius: 2
                    }} 
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Preferences Card */}
            <Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4, md: 5 }, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: darkMode ? '#a5d6a7' : '#1b5e20' }}>
                <Language sx={{ fontSize: 28, color: darkMode ? '#81c784' : '#66bb6a' }} />
                Language & Region Preferences
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="language-label">Preferred Language</InputLabel>
                    <Select
                      labelId="language-label"
                      value={preferredLanguage}
                      label="Preferred Language"
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: darkMode ? 'rgba(30, 50, 40, 0.6)' : 'rgba(240, 250, 245, 0.8)',
                          '& fieldset': { borderColor: darkMode ? 'rgba(81,197,132,0.3)' : 'rgba(46,125,50,0.2)' },
                          '&:hover fieldset': { borderColor: darkMode ? 'rgba(81,197,132,0.6)' : 'rgba(46,125,50,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: darkMode ? '#81c784' : '#66bb6a', borderWidth: '2px' }
                        },
                        '& .MuiSelect-select': {
                          color: darkMode ? '#e8f5e9' : '#1b5e20',
                          py: 2,
                          fontWeight: 600
                        }
                      }}
                    >
                      <MenuItem value="en"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><span style={{ fontSize: '1.5rem' }}>🇬🇧</span>English</Box></MenuItem>
                      <MenuItem value="pcm"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><span style={{ fontSize: '1.5rem' }}>🇳🇬</span>Nigerian Pidgin</Box></MenuItem>
                      <MenuItem value="tw"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><span style={{ fontSize: '1.5rem' }}>🇬🇭</span>Twi</Box></MenuItem>
                      <MenuItem value="yo"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><span style={{ fontSize: '1.5rem' }}>🇳🇬</span>Yoruba</Box></MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="region-label">Region</InputLabel>
                    <Select
                      labelId="region-label"
                      value={region}
                      label="Region"
                      onChange={(e) => setRegion(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: darkMode ? 'rgba(30, 50, 40, 0.6)' : 'rgba(240, 250, 245, 0.8)',
                          '& fieldset': { borderColor: darkMode ? 'rgba(81,197,132,0.3)' : 'rgba(46,125,50,0.2)' },
                          '&:hover fieldset': { borderColor: darkMode ? 'rgba(81,197,132,0.6)' : 'rgba(46,125,50,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: darkMode ? '#81c784' : '#66bb6a', borderWidth: '2px' }
                        },
                        '& .MuiSelect-select': {
                          color: darkMode ? '#e8f5e9' : '#1b5e20',
                          py: 2,
                          fontWeight: 600
                        }
                      }}
                    >
                      {['Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Western'].map((reg) => (
                        <MenuItem key={reg} value={reg}>{reg}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Appearance Card */}
            <Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4, md: 5 }, mb: 3.5 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, color: darkMode ? '#a5d6a7' : '#1b5e20' }}>
                <DarkMode sx={{ fontSize: 28, color: darkMode ? '#81c784' : '#66bb6a' }} />
                Appearance Settings
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2.5, sm: 3 }, borderRadius: 4, bgcolor: darkMode ? 'rgba(30, 60, 45, 0.4)' : 'rgba(220, 245, 230, 0.7)', border: darkMode ? '1px solid rgba(81,197,132,0.3)' : '1px solid rgba(46,125,50,0.28)' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: darkMode ? '#e8f5e9' : '#1b5e20', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? '#a5d6a7' : '#558b2f', mt: 1, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {darkMode ? 'Reduces eye strain during evening farm planning' : 'Optimized for daytime sunlight conditions'}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  sx={{
                    width: 76, height: 76, borderRadius: 4,
                    bgcolor: darkMode ? 'rgba(81,197,132,0.3)' : 'rgba(46,125,50,0.22)',
                    color: darkMode ? '#81c784' : '#66bb6a',
                    '&:hover': { bgcolor: darkMode ? 'rgba(81,197,132,0.5)' : 'rgba(46,125,50,0.35)', transform: 'scale(1.08)' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {darkMode ? <LightMode sx={{ fontSize: 40 }} /> : <DarkMode sx={{ fontSize: 40 }} />}
                </IconButton>
              </Box>
            </Paper>

            {/* Logout Card */}
            <Paper sx={{ ...cardStyle, p: { xs: 3, sm: 4 }, textAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                startIcon={<Logout />}
                fullWidth
                sx={{
                  py: { xs: 1.6, sm: 1.8 },
                  borderRadius: 3,
                  borderColor: darkMode ? 'rgba(244,67,54,0.65)' : 'rgba(244,67,54,0.5)',
                  color: darkMode ? '#ffb3b3' : '#d32f2f',
                  '&:hover': { bgcolor: darkMode ? 'rgba(244,67,54,0.18)' : 'rgba(244,67,54,0.1)', transform: 'translateY(-1px)' }
                }}
              >
                Log Out of Account
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Developer Credit Footer */}
        <Box sx={{ mt: { xs: 4, md: 6 }, pt: { xs: 3, md: 4.5 }, borderTop: darkMode ? '1px solid rgba(46,125,50,0.4)' : '1px solid rgba(46,125,50,0.35)', textAlign: 'center' }}>
          <Typography variant="caption" color={darkMode ? 'rgba(165,214,167,0.95)' : 'rgba(85,139,47,0.95)'} sx={{ fontWeight: 700, letterSpacing: '0.6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.8, fontSize: '0.95rem' }}>
            © 2026 AI for Agriculture • Crafted by Wallace Justice in Accra 🇬🇭
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;