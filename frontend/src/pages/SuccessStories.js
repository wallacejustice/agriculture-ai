import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Chip,
  Box,
  IconButton,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Add, 
  CheckCircle, 
  PhotoCamera, 
  Grain,
  ArrowBack,
  Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SuccessStories = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newStory, setNewStory] = useState({ title: '', story: '', crop: 'maize' });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadStories();
  }, []);
  
  const loadStories = async () => {
    try {
      const res = await axios.get('/api/community/success-stories', {
        params: { limit: 20 }
      });
      setStories(res.data.data.stories || []);
    } catch (error) {
      console.error('Load stories error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitStory = async () => {
    if (!newStory.title.trim() || !newStory.story.trim()) {
      alert('Title and story are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // For simplicity, we'll skip image upload in this version
      // In production: use FormData with image file
      
      const token = localStorage.getItem('token');
      await axios.post('/api/community/success-stories', newStory, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setOpenDialog(false);
      setNewStory({ title: '', story: '', crop: 'maize' });
      setImagePreview(null);
      loadStories();
      
      alert('Success story shared! Thank you for helping other farmers.');
    } catch (error) {
      console.error('Submit story error:', error);
      alert('Failed to share story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const crops = ['maize', 'cassava', 'yam', 'rice', 'tomato', 'pepper', 'okra', 'plantain'];
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: { xs: 8, sm: 0 }
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/dashboard')} size="small">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Farmer Success Stories
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Real farmers, real results • Verified by the community
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Hero section */}
        <Paper sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 3, 
          mb: 4,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          textAlign: 'center'
        }}>
          <Grain sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Your Story Inspires Others
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Share how AgriPal helped your farm. Your experience could save another farmer's harvest.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ 
              bgcolor: 'primary.contrastText',
              color: 'primary.main',
              fontWeight: 'bold',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            Share Your Story
          </Button>
        </Paper>
        
        {/* Stories Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="40%" height={20} />
                      <Skeleton width="30%" height={16} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="100%" height={60} sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton width={60} height={24} />
                    <Skeleton width={80} height={24} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : stories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Grain sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              No Success Stories Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to share how AgriPal helped your farm!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              size="large"
            >
              Share Your Story
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {stories.map((story, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper sx={{ 
                  p: 2.5, 
                  borderRadius: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
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
                    <Box>
                      <Typography fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                        Farmer in {story.farmerRegion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verified Advice • {new Date(story.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1.1rem' }}>
                    {story.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {story.story}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Chip
                      icon={<Grain />}
                      label={story.crop.charAt(0).toUpperCase() + story.crop.slice(1)}
                      size="small"
                      sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.main',
                        height: 24
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                      <Typography variant="caption" fontWeight="bold">
                        {story.verificationCount} Verified
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      
      {/* Share Story Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          pb: 1
        }}>
          <Grain color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Share Your Success Story
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inspire other farmers with your experience
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
            ✨ Stories with photos get 3x more verification from other farmers
          </Alert>
          
          <TextField
            fullWidth
            label="Story Title"
            placeholder="e.g., Saved my maize from armyworm"
            value={newStory.title}
            onChange={(e) => setNewStory({...newStory, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Your Story"
            placeholder="Describe how AgriPal helped your farm. What was the problem? What advice did you follow? What was the result?"
            multiline
            rows={4}
            value={newStory.story}
            onChange={(e) => setNewStory({...newStory, story: e.target.value})}
            sx={{ mb: 2 }}
            helperText={`${newStory.story.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Crop Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {crops.map((crop) => (
                <Chip
                  key={crop}
                  label={crop.charAt(0).toUpperCase() + crop.slice(1)}
                  onClick={() => setNewStory({...newStory, crop})}
                  sx={{
                    bgcolor: newStory.crop === crop ? 'primary.light' : 'action.hover',
                    color: newStory.crop === crop ? 'primary.contrastText' : 'text.primary',
                    '&:hover': { bgcolor: newStory.crop === crop ? 'primary.main' : 'action.selected' }
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="story-image-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="story-image-upload">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<PhotoCamera />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  borderColor: imagePreview ? 'primary.main' : 'divider'
                }}
              >
                {imagePreview ? 'Change Photo' : 'Add Photo (Optional)'}
              </Button>
            </label>
            {imagePreview && (
              <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', height: 150, objectFit: 'cover' }} 
                />
              </Box>
            )}
          </Box>
          
          <Alert severity="warning" sx={{ fontSize: '0.85rem', mb: 2 }}>
            🔒 Your name and region will be shown. Crop details and story are public to help other farmers.
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(false)}
              sx={{ px: 4, py: 1.2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitStory}
              disabled={submitting || !newStory.title.trim() || !newStory.story.trim()}
              sx={{ px: 4, py: 1.2 }}
            >
              {submitting ? 'Sharing...' : 'Share Story'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SuccessStories;