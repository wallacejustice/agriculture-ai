import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  useTheme,
  IconButton // ✅ FIXED: Added missing import
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Grain,
  Language,
  Timeline,
  TrendingUp,
  HelpOutline,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Glass morphism effect
  const glassEffect = {
    bgcolor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    borderRadius: 3
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 30%)'
    }}>
      {/* Header */}
      <Box sx={{
        ...glassEffect,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
      }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', py: 2, px: { xs: 2, sm: 3 } }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack sx={{ fontSize: 28, color: '#667eea' }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AnalyticsIcon sx={{ fontSize: 32, color: '#667eea' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Farming Analytics
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Insights from your conversations with AI Assistant
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Left Column - Charts */}
          <Grid item xs={12} lg={8}>
            {/* Welcome Card */}
            <Paper sx={{
              ...glassEffect,
              p: { xs: 3, sm: 4 },
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -80,
                right: -80,
                width: 300,
                height: 300,
                borderRadius: '50%',
                bgcolor: 'rgba(102, 126, 234, 0.12)',
                zIndex: 0
              }
            }}>
              <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Avatar sx={{
                  width: { xs: 72, sm: 96 },
                  height: { xs: 72, sm: 96 },
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: { xs: 32, sm: 40 },
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.45)'
                }}>
                  📊
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Farming Insights
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, maxWidth: 650, mx: 'auto', lineHeight: 1.6 }}>
                  Track your farming knowledge growth and common questions. Based on your conversations with AI Assistant.
                </Typography>
              </Box>
            </Paper>

            {/* Charts Placeholder */}
            <Paper sx={{ ...glassEffect, p: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.6)' }}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AnalyticsIcon sx={{ fontSize: 28, color: '#667eea' }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
                    📊 Conversation Analytics
                  </Typography>
                </Box>
                <Chip 
                  label="Sample Data" 
                  size="small" 
                  icon={<HelpOutline sx={{ fontSize: 16 }} />}
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.15)',
                    color: '#667eea',
                    fontWeight: 'bold',
                    height: 28
                  }} 
                />
              </Box>
              
              <Grid container spacing={3}>
                {/* Language Distribution */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ ...glassEffect, p: 3, borderRadius: 2.5, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Language sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      Language Usage
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      52% Pidgin • 30% English<br />12% Twi • 6% Yoruba
                    </Typography>
                  </Paper>
                </Grid>

                {/* Top Crops */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ ...glassEffect, p: 3, borderRadius: 2.5, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Grain sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      Top Crops
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Maize 42% • Cassava 28%<br />Yam 18% • Rice 12%
                    </Typography>
                  </Paper>
                </Grid>

                {/* Activity Timeline */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ ...glassEffect, p: 3, borderRadius: 2.5, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Timeline sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      Weekly Activity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Peak: Friday (22 questions)<br />Lowest: Sunday (9 questions)
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Insights Card */}
            <Paper sx={{ ...glassEffect, p: 3, borderRadius: 3, mt: 3, border: '1px solid', borderColor: 'rgba(255, 255, 255, 0.6)' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ fontSize: 24, color: '#667eea' }} /> Key Insights
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.08)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#667eea', mb: 1 }}>
                      🌽 Most Asked About: Maize Diseases
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      42% of your questions relate to maize disease control.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.08)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#667eea', mb: 1 }}>
                      🗣️ Preferred Language: Pidgin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You communicate most naturally in Pidgin (52% of conversations).
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.08)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#667eea', mb: 1 }}>
                      ⏰ Peak Learning Time: Fridays
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You ask most questions on Fridays — preparing for weekend farm work?
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.08)', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#667eea', mb: 1 }}>
                      📈 Knowledge Growth: +37% This Month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your farming knowledge has grown significantly over time.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Premium CTA Card */}
            <Paper sx={{
              ...glassEffect,
              p: 4,
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.6)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -60,
                right: -60,
                width: 240,
                height: 240,
                borderRadius: '50%',
                bgcolor: 'rgba(118, 75, 162, 0.12)',
                zIndex: 0
              }
            }}>
              <Box sx={{ 
                width: 96, 
                height: 96, 
                borderRadius: '24px', 
                bgcolor: 'rgba(102, 126, 234, 0.2)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 3,
                position: 'relative',
                zIndex: 1,
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)'
              }}>
                <AnalyticsIcon sx={{ fontSize: 56, color: '#667eea' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ 
                mb: 2,
                position: 'relative',
                zIndex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}>
                Premium Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 3, 
                lineHeight: 1.7,
                position: 'relative',
                zIndex: 1,
                maxWidth: 320,
                fontSize: '0.95rem'
              }}>
                Real-time insights on your farming knowledge growth, crop trends, and learning patterns. Coming soon with full backend integration.
              </Typography>
              
              <Box sx={{ width: '100%', mb: 3, mt: 2 }}>
                <Typography variant="caption" fontWeight="500" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                  Feature Completion
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: '75%', 
                    height: '100%', 
                    bgcolor: 'linear-gradient(90deg, #667eea, #764ba2)',
                    borderRadius: 4
                  }} />
                </Box>
                <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, color: 'primary.main' }}>
                  75% Complete
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                position: 'relative',
                zIndex: 1,
                maxWidth: 280,
                fontStyle: 'italic',
                mt: 2
              }}>
                * Full analytics with real data coming in next update. Currently showing sample insights.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Analytics;