import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  Skeleton,
  IconButton
} from '@mui/material';
import { 
  LocationOn, 
  Grain, 
  Star, 
  VisibilityOff,
  PeopleAlt
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const FarmerMap = () => {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationSharing, setLocationSharing] = useState(false);
  
  useEffect(() => {
    loadNearbyFarmers();
  }, []);
  
  const loadNearbyFarmers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/community/nearby-farmers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFarmers(res.data.data.farmers || []);
      setLocationSharing(true);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Enable location sharing in your profile to see nearby farmers');
      } else {
        setError('Failed to load nearby farmers. Please try again later.');
      }
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleLocationSharing = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/community/profile', {
        region: user.region || 'Ashanti',
        crops: user.crops || ['maize'],
        experience: user.experience || 5,
        locationSharing: !locationSharing
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLocationSharing(!locationSharing);
      if (!locationSharing) {
        loadNearbyFarmers();
      } else {
        setFarmers([]);
      }
    } catch (err) {
      console.error('Toggle location error:', err);
      alert('Failed to update location sharing settings');
    }
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleAlt color="primary" /> Nearby Farmers
        </Typography>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ))}
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleAlt color="primary" /> Nearby Farmers
        </Typography>
        <Chip
          icon={locationSharing ? <LocationOn /> : <VisibilityOff />}
          label={locationSharing ? 'Sharing Location' : 'Enable Location'}
          onClick={toggleLocationSharing}
          sx={{
            cursor: 'pointer',
            bgcolor: locationSharing ? 'primary.light' : 'action.hover',
            '&:hover': {
              bgcolor: locationSharing ? 'primary.main' : 'action.selected'
            }
          }}
        />
      </Box>
      
      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {farmers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {locationSharing 
              ? 'No farmers sharing location in your area yet' 
              : 'Enable location sharing to connect with farmers near you'}
          </Typography>
          {!locationSharing && (
            <Button 
              variant="contained" 
              onClick={toggleLocationSharing}
              sx={{ mt: 2 }}
            >
              Enable Location Sharing
            </Button>
          )}
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {farmers.map((farmer, i) => (
            <React.Fragment key={i}>
              <ListItem sx={{ 
                borderRadius: 2, 
                mb: 1, 
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'all 0.2s'
              }}>
                <ListItemIcon>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Grain sx={{ color: 'primary.main' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight="bold">{farmer.name}</Typography>
                      {farmer.badges.length > 0 && (
                        <Star 
                          sx={{ 
                            fontSize: 16, 
                            color: 'warning.main',
                            verticalAlign: 'middle'
                          }} 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        🌾 {farmer.crops.join(', ')} • {farmer.experience} yrs experience
                      </Typography>
                      {farmer.badges.length > 0 && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {farmer.badges.slice(0, 2).map((badge, j) => (
                            <Chip 
                              key={j} 
                              label={badge} 
                              size="small" 
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: 'warning.light',
                                color: 'warning.dark'
                              }} 
                            />
                          ))}
                          {farmer.badges.length > 2 && (
                            <Chip 
                              label={`+${farmer.badges.length - 2}`} 
                              size="small" 
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {i < farmers.length - 1 && <Divider sx={{ mx: 2 }} />}
            </React.Fragment>
          ))}
        </List>
      )}
      
      <Alert severity="info" sx={{ mt: 2, fontSize: '0.85rem' }}>
        🔒 Your location is only shared with farmers who also enabled sharing. 
        Disable anytime in your profile.
      </Alert>
    </Paper>
  );
};

export default FarmerMap;