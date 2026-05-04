// frontend/src/pages/Conversations.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Skeleton,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Delete,
  Add,
  Grain,
  ChatBubbleOutline,
  ArrowBack,
  Home,
  Search,
  Tune
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import conversationService from '../services/conversationService';

const Conversations = () => {
  const theme = useTheme(); // ✅ Theme object for direct palette access
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, initialized } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!initialized) return;

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const response = await conversationService.getConversations();
        setConversations(response.data.conversations || []);
        setError(null);
      } catch (err) {
        setError('Failed to load conversations.');
        console.error('Load conversations error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [initialized]);

  const handleDelete = async (conversationId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!window.confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
    } catch (err) {
      setError('Failed to delete conversation.');
      console.error('Delete conversation error:', err);
    }
  };

  const getLanguageLabel = (code) => {
    const labels = {
      pcm: 'Pidgin',
      tw: 'Twi',
      sw: 'Swahili',
      yo: 'Yoruba',
      ha: 'Hausa',
      ig: 'Igbo',
      en: 'English'
    };
    return labels[code] || code.toUpperCase();
  };

  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '');
  };

  // ✅ SMART SEARCH FILTERING
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter(conv => 
      conv.title?.toLowerCase().includes(query) ||
      conv.agricultureContext?.cropType?.toLowerCase().includes(query) ||
      conv.messages?.some(msg => msg.content?.toLowerCase().includes(query)) ||
      getLanguageLabel(conv.detectedLanguage)?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: theme.palette.text.primary }}
            onClick={() => navigate('/dashboard')}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatBubbleOutline sx={{ mr: 0.5 }} fontSize="inherit" />
            Conversations
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: theme.palette.action.hover, // ✅ FIXED: theme.palette
                '&:hover': { bgcolor: theme.palette.primary.light },
                width: 40,
                height: 40
              }}
              aria-label="Back to dashboard"
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
              My Conversations
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                width: { xs: '100%', sm: 240 },
                bgcolor: theme.palette.background.paper, // ✅ FIXED
                borderRadius: 2,
                '& .MuiInputBase-input': { color: theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <IconButton
              onClick={() => navigate('/chat')}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                width: 44,
                height: 44,
                boxShadow: 2,
                flexShrink: 0
              }}
              aria-label="Start new chat"
            >
              <Add />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
              >
                Retry
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          // ✅ SKELETON LOADERS (mobile-optimized)
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton 
                  variant="rounded" 
                  height={isMobile ? 160 : 200} 
                  sx={{ 
                    borderRadius: 2.5,
                    bgcolor: theme.palette.action.hover // ✅ FIXED
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : filteredConversations.length === 0 ? (
          <Paper sx={{ 
            p: { xs: 3, sm: 6 }, 
            textAlign: 'center', 
            bgcolor: theme.palette.action.hover, // ✅ FIXED
            borderRadius: 3, 
            border: '1px dashed', 
            borderColor: theme.palette.divider
          }}>
            {searchQuery ? (
              <>
                <Tune sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom color={theme.palette.text.primary}>
                  No conversations match "{searchQuery}"
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try different keywords like crop names or farming topics
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSearchQuery('')}
                  sx={{ mt: 2, color: theme.palette.text.primary, borderColor: theme.palette.divider }}
                >
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <ChatBubbleOutline sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom color={theme.palette.text.primary}>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start your first conversation to get farming advice
                </Typography>
                <IconButton
                  onClick={() => navigate('/chat')}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    width: 56,
                    height: 56,
                    boxShadow: 3
                  }}
                  aria-label="Start chat"
                >
                  <Add sx={{ fontSize: 32 }} />
                </IconButton>
              </>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredConversations.map((conv) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={conv._id}>
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: 2.5,
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'visible',
                    border: '1px solid',
                    borderColor: theme.palette.divider, // ✅ FIXED
                    minHeight: isMobile ? 160 : 200,
                    bgcolor: theme.palette.background.paper, // ✅ ADDED: Ensure card has paper bg
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 12px 28px rgba(0,0,0,0.4)' 
                        : '0 12px 28px rgba(0,0,0,0.12)',
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(conv._id, e)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      bgcolor: theme.palette.background.paper, // ✅ FIXED
                      '&:hover': { 
                        bgcolor: theme.palette.error.main,
                        color: theme.palette.error.contrastText
                      },
                      color: theme.palette.error.main,
                      boxShadow: 1
                    }}
                    aria-label="Delete conversation"
                  >
                    <Delete fontSize="small" />
                  </IconButton>

                  <CardActionArea
                    onClick={() => navigate(`/chat/${conv._id}`)}
                    sx={{ 
                      height: '100%',
                      p: { xs: 1.5, sm: 2.5 },
                      pt: { xs: 3, sm: 4 },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <Box sx={{ width: '100%', mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography 
                          variant={isMobile ? "subtitle2" : "subtitle1"} 
                          fontWeight="bold" 
                          noWrap
                          sx={{ 
                            flex: 1, 
                            pr: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            color: theme.palette.text.primary // ✅ ADDED
                          }}
                        >
                          {conv.title || `Conversation #${filteredConversations.indexOf(conv) + 1}`}
                        </Typography>
                        {conv.detectedLanguage && (
                          <Chip
                            label={getLanguageLabel(conv.detectedLanguage)}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.primary.light, // ✅ FIXED
                              color: theme.palette.primary.contrastText, // ✅ ADDED
                              fontWeight: 'bold',
                              height: 20,
                              fontSize: '0.65rem'
                            }}
                          />
                        )}
                      </Box>
                      
                      {conv.agricultureContext?.cropType && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Grain sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                          <Typography variant="caption" color="text.secondary">
                            {conv.agricultureContext.cropType}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1, 
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    >
                      {getPreviewText(conv.messages)}
                    </Typography>

                    <Box sx={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 'auto',
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: theme.palette.divider // ✅ FIXED
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        💬 {conv.messages?.length || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(conv.updatedAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {searchQuery && filteredConversations.length > 0 && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 2, display: 'block', textAlign: 'center' }}
          >
            Showing {filteredConversations.length} of {conversations.length} conversations
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Conversations;