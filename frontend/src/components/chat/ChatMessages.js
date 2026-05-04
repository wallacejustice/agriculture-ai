import React, { useRef, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  CircularProgress,
  Typography,
  Paper,
  useTheme,
  Fade
} from '@mui/material';
import { SmartToy } from '@mui/icons-material';

/**
 * ChatMessages Component - WCAG AA compliant contrast + AgriPal branding
 */
const ChatMessages = ({ messages = [], isLoading = false, isGenerating = false, isMobile = false }) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Start a conversation by typing or speaking your question
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      overflow: 'auto', 
      p: { xs: 1.5, sm: 2 }, 
      bgcolor: 'background.default',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.divider,
        borderRadius: 3,
      },
    }}>
      <List sx={{ p: 0 }}>
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <Fade key={message._id || index} in timeout={300}>
              <ListItem sx={{ p: 0, mb: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}>
                  {!isUser && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mr: 1.5,
                      color: theme.palette.text.secondary,
                      fontSize: '0.85rem'
                    }}>
                      <SmartToy sx={{ fontSize: 18, mr: 0.5, color: theme.palette.primary.main }} />
                      AgriPal {/* ✅ PERSONALIZED BRAND - YOUR NAME */}
                    </Box>
                  )}
                  <Paper
                    elevation={isUser ? 2 : 1}
                    sx={{
                      // ✅ CRITICAL FIX: MAX CONTRAST FOR DARK MODE
                      bgcolor: isUser 
                        ? theme.palette.primary.main 
                        : theme.palette.mode === 'dark' 
                          ? 'rgba(30, 30, 30, 0.95)'  // Soft charcoal (not pure black)
                          : 'rgba(245, 245, 245, 0.95)', // Light gray in light mode
                      
                      // ✅ PURE WHITE TEXT IN DARK MODE (WCAG AA COMPLIANT)
                      color: isUser 
                        ? 'white' 
                        : theme.palette.mode === 'dark' 
                          ? '#ffffff'  // Pure white for max readability
                          : '#212121', // Dark gray in light mode
                      
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      p: { xs: 1.5, sm: 2 },
                      maxWidth: isMobile ? '85%' : '75%',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      boxShadow: isUser 
                        ? `0 2px 10px ${theme.palette.primary.main}40`
                        : theme.shadows[1],
                      
                      // ✅ ENHANCED VISIBILITY: Subtle border in dark mode
                      border: theme.palette.mode === 'dark' 
                        ? `1px solid ${theme.palette.divider}`
                        : 'none',
                      
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: isUser ? 8 : 'auto',
                        top: isUser ? 'auto' : 8,
                        right: isUser ? -6 : 'auto',
                        left: isUser ? 'auto' : -6,
                        width: 0,
                        height: 0,
                        border: '8px solid transparent',
                        borderTopColor: isUser ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.95)' : '#f5f5f5'),
                        borderRightColor: isUser ? theme.palette.primary.main : 'transparent',
                        borderBottomColor: isUser ? theme.palette.primary.main : 'transparent',
                        borderLeftColor: isUser ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.95)' : '#f5f5f5'),
                      }
                    }}
                  >
                    <Typography variant={isMobile ? "body2" : "body1"} sx={{ 
                      // ✅ ENHANCED READABILITY: Slightly larger font in dark mode
                      fontSize: theme.palette.mode === 'dark' ? '1.05rem' : '1rem',
                      fontWeight: 400
                    }}>
                      {message.content}
                    </Typography>
                    
                    {/* Signature with your brand */}
                    {!isUser && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 1,
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(102, 126, 234, 0.9)' 
                            : 'rgba(46, 125, 50, 0.85)',
                          fontStyle: 'italic',
                          fontSize: '0.8rem',
                          textAlign: 'right'
                        }}
                      >
                        — AgriPal 🌾 {/* ✅ YOUR PERSONAL BRAND */}
                      </Typography>
                    )}
                    
                    {/* Message timestamp */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.5, 
                        color: isUser 
                          ? 'rgba(255,255,255,0.85)' 
                          : theme.palette.text.secondary,
                        fontSize: '0.7rem',
                        textAlign: 'right'
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            </Fade>
          );
        })}

        {/* Typing indicator - MAX VISIBILITY */}
        {isGenerating && (
          <ListItem sx={{ p: 0, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <Paper
                elevation={1}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(40, 40, 40, 0.95)' 
                    : 'rgba(245, 245, 245, 0.95)',
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#212121',
                  borderRadius: '18px 18px 18px 4px',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  maxWidth: '75%',
                  border: theme.palette.mode === 'dark' 
                    ? `1px solid ${theme.palette.divider}`
                    : 'none'
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? '#ffffff'  // Pure white dots in dark mode
                        : '#757575', // Gray dots in light mode
                      animation: 'pulse 1.5s infinite ease-in-out',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(0.8)' },
                        '50%': { transform: 'scale(1.2)' },
                      }
                    }} 
                  />
                ))}
              </Paper>
            </Box>
          </ListItem>
        )}

        <div ref={messagesEndRef} />
      </List>
    </Box>
  );
};

export default ChatMessages;