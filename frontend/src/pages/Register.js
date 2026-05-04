import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page
 * Farmer registration with multilingual support
 */

// Language options for dropdown
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'pcm', label: 'Nigerian Pidgin' },
  { value: 'gpe', label: 'Ghanaian Pidgin' },
  { value: 'wes', label: 'Cameroonian Pidgin' },
  { value: 'tw', label: 'Twi' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'ha', label: 'Hausa' },
  { value: 'ig', label: 'Igbo' },
  { value: 'sw', label: 'Swahili' }
];

const PidginVariants = {
  pcm: 'Nigerian Pidgin',
  gpe: 'Ghanaian Pidgin',
  wes: 'Cameroonian Pidgin'
};

const Register = () => {
  const navigate = useNavigate();
  const { register, error, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en',
    region: ''
  });
  const [formError, setFormError] = useState(null);
  const [showPidginVariant, setShowPidginVariant] = useState(false);

  // Show/hide pidgin variant based on language selection
  useEffect(() => {
    setShowPidginVariant(['pcm', 'gpe', 'wes'].includes(formData.preferredLanguage));
  }, [formData.preferredLanguage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        preferredLanguage: formData.preferredLanguage,
        region: formData.region
      });
      
      navigate('/dashboard');
    } catch (err) {
      // Error already set by auth context
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h4" color="primary" gutterBottom>
            🌾 AI for AGGRICULTURE
          </Typography>
          <Typography variant="h6" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join thousands of farmers getting expert advice in your language
          </Typography>
        </Box>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="language-label">Preferred Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  label="Preferred Language"
                  onChange={handleChange}
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {showPidginVariant && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You selected {PidginVariants[formData.preferredLanguage]}. 
                  The AI will respond in this Pidgin variant.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="region"
                label="Region/Location (Optional)"
                name="region"
                placeholder="e.g., Ashanti Region, Ghana"
                value={formData.region}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 2,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2e7d32', textDecoration: 'none' }}>
                Login here
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              ✅ Your data is secure and private<br />
              ✅ Ask questions in your language (Pidgin, Twi, Swahili, etc.)<br />
              ✅ Get instant expert farming advice
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;