import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  Stop,
  PlayArrow,
  StopCircle,
  ArrowBack,
  RecordVoiceOver
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import conversationService from '../services/conversationService';

/**
 * Voice Assistant Page - Full speech recognition + synthesis
 */
const Voice = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice input not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = user?.preferredLanguage || 'en-GH';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      // Auto-send when user stops speaking (final result)
      if (event.results[current].isFinal) {
        handleSend(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Voice error: ${event.error}. Try again.`);
      setIsListening(false);
    };

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (utteranceRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [user]);

  // Create new conversation on mount
  useEffect(() => {
    const createVoiceConversation = async () => {
      try {
        const response = await conversationService.createConversation();
        setConversationId(response.data.conversation._id);
      } catch (err) {
        console.error('Create conversation error:', err);
        setError('Could not start voice session. Please try again.');
      }
    };
    
    createVoiceConversation();
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Voice not available. Use Chrome/Edge browser.');
      return;
    }
    
    if (isSpeaking) {
      stopSpeaking();
    }
    
    setTranscript('');
    setAiResponse('');
    setError(null);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (utteranceRef.current) {
      synthRef.current.cancel();
      utteranceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakResponse = (text, language = 'en') => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language/voice based on user preference
    if (language === 'pcm' || language === 'en') {
      utterance.lang = 'en-GH'; // Ghanaian English accent
    } else if (language === 'tw') {
      utterance.lang = 'ak-GH'; // Akan/Twi
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleSend = async (text) => {
    if (!text?.trim() || !conversationId || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    setAiResponse('');
    
    try {
      // Send to backend AI
      const response = await conversationService.addMessage(
        conversationId,
        text,
        user?.preferredLanguage || 'en'
      );
      
      // Get AI response
      const messages = response.data.conversation.messages;
      const aiMessage = messages[messages.length - 1];
      
      if (aiMessage?.content) {
        setAiResponse(aiMessage.content);
        speakResponse(aiMessage.content, aiMessage.language || user?.preferredLanguage || 'en');
      }
    } catch (err) {
      console.error('Voice message error:', err);
      setError('Could not get response. Please try again or type your question.');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      handleSend(transcript);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ 
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            gap: 1.5
          }}>
            <Tooltip title="Back to dashboard">
              <IconButton onClick={() => navigate('/dashboard')}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <RecordVoiceOver sx={{ fontSize: 28, color: '#667eea' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Voice Assistant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Speak naturally in {user?.preferredLanguage === 'pcm' ? 'Pidgin' : user?.preferredLanguage === 'tw' ? 'Twi' : 'English'}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ 
        py: { xs: 3, sm: 4 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <Paper sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          {/* Microphone Area */}
          <Box sx={{ mb: 3, position: 'relative' }}>
            <Box sx={{
              width: { xs: 120, sm: 160 },
              height: { xs: 120, sm: 160 },
              mx: 'auto',
              borderRadius: '50%',
              bgcolor: isListening ? 'error.light' : 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              transition: 'all 0.3s ease',
              animation: isListening ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                '70%': { boxShadow: '0 0 0 15px rgba(244, 67, 54, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
              }
            }}>
              {isProcessing ? (
                <CircularProgress size={50} sx={{ color: '#667eea' }} />
              ) : isListening ? (
                <Mic sx={{ fontSize: { xs: 48, sm: 64 }, color: 'error.main' }} />
              ) : (
                <Mic sx={{ fontSize: { xs: 48, sm: 64 }, color: '#667eea' }} />
              )}
            </Box>
            
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isListening 
                ? 'Speak naturally. I will respond when you stop.'
                : `Ask about crops, pests, diseases, or farming advice in ${user?.preferredLanguage === 'pcm' ? 'Pidgin' : user?.preferredLanguage === 'tw' ? 'Twi' : 'English'}`}
            </Typography>
          </Box>

          {/* Transcript Display */}
          {(transcript || aiResponse) && (
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              {transcript && (
                <Paper sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: 'primary.light', 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main'
                }}>
                  <Typography variant="body1" fontWeight="500" color="primary.dark">
                    You said:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {transcript}
                  </Typography>
                </Paper>
              )}
              
              {aiResponse && (
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'success.light', 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'success.main'
                }}>
                  <Typography variant="body1" fontWeight="500" color="success.dark">
                    AI Assistant:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                    {aiResponse}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mt: 2
          }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={isListening ? <Stop /> : <Mic />}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              sx={{
                bgcolor: isListening ? 'error.main' : 'primary.main',
                height: 56,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: isListening ? 'error.dark' : 'primary.dark'
                },
                boxShadow: isListening ? '0 0 15px rgba(244, 67, 54, 0.4)' : '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              {isListening ? 'STOP LISTENING' : 'TAP TO SPEAK'}
            </Button>
            
            {isSpeaking && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<StopCircle />}
                onClick={stopSpeaking}
                sx={{
                  height: 56,
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    borderColor: 'error.dark'
                  }
                }}
              >
                STOP SPEAKING
              </Button>
            )}
          </Box>

          {/* Instructions */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>
              Tips for Best Results:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Speak clearly in a quiet place<br />
              • Ask specific questions: "How to control maize diseases?"<br />
              • Works best in Chrome, Edge, or Safari browsers<br />
              • No internet needed for speech — works offline!
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        py: 2, 
        textAlign: 'center', 
        bgcolor: 'white', 
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto'
      }}>
        <Typography variant="caption" color="text.secondary">
          Voice Assistant • Powered by Ghana Agriculture AI • MoFA Approved Advice
        </Typography>
      </Box>
    </Box>
  );
};

export default Voice;