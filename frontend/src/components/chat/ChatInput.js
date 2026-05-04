import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Tooltip, 
  Zoom,
  Typography,
  Slide
} from '@mui/material';
import { 
  Send, 
  Mic, 
  Stop 
} from '@mui/icons-material';

const ChatInput = ({ 
  onSend, 
  disabled, 
  placeholder = 'Type your message...', 
  autoFocus = false, 
  isMobile = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pcm-GH';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        
        // ✅ AUTO-SEND ON SPEECH END
        if (transcript.trim()) {
          onSend(transcript.trim());
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Voice recognition failed. Please try again.');
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        if (isRecording) {
          setIsRecording(false);
        }
      };
      
      setRecognition(recognitionInstance);
      
      navigator.permissions?.query({ name: 'microphone' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {});
    } else {
      setError('Voice input not supported in your browser.');
    }
    
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, isRecording, onSend]);

  const startRecording = () => {
    if (disabled) return;
    
    if (permissionState === 'denied') {
      setError('Microphone access denied. Please enable it in browser settings.');
      return;
    }
    
    if (!recognition) {
      setError('Voice input not available.');
      return;
    }
    
    try {
      recognition.lang = 'pcm-GH';
      recognition.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        display: 'flex', 
        gap: 1,
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Tooltip 
        title={
          permissionState === 'denied' ? 
            'Microphone access denied' : 
            isRecording ? 'Listening... (will send automatically)' : 'Speak your question'
        }
        placement="top"
        arrow
      >
        <span>
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || (!recognition && permissionState !== 'denied')}
            sx={{
              bgcolor: isRecording ? 'error.light' : 'action.hover',
              color: isRecording ? 'error.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: isRecording ? 'error.main' : 'primary.light',
              },
              width: { xs: 36, sm: 44 },
              height: { xs: 36, sm: 44 },
              p: 0.5,
              transition: 'all 0.2s ease',
              boxShadow: isRecording ? 2 : 0,
              animation: isRecording ? 'pulse 1.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                '50%': { boxShadow: '0 0 0 8px rgba(244, 67, 54, 0)' },
              }
            }}
            aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
          >
            {isRecording ? <Stop fontSize={isMobile ? "small" : "medium"} /> : <Mic fontSize={isMobile ? "small" : "medium"} />}
          </IconButton>
        </span>
      </Tooltip>
      
      <TextField
        inputRef={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isRecording}
        fullWidth
        multiline
        maxRows={isMobile ? 3 : 4}
        variant="outlined"
        size={isMobile ? "small" : "medium"}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          '& .MuiInputBase-root': {
            px: 2,
            py: isMobile ? 1 : 1.5,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        }}
        inputProps={{
          'aria-label': 'Chat message input',
          'autoComplete': 'off',
          'autoCorrect': 'on',
          'spellCheck': true,
        }}
      />
      
      <Zoom in={!isRecording}>
        <Tooltip title={disabled ? "AI is responding..." : "Send message"} placement="top" arrow>
          <span>
            <IconButton
              type="submit"
              disabled={disabled || !message.trim()}
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                bgcolor: disabled ? 'action.disabledBackground' : 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: disabled ? 'action.disabledBackground' : 'primary.dark',
                },
                transition: 'all 0.2s ease',
                boxShadow: disabled ? 0 : 2,
              }}
              aria-label="Send message"
            >
              <Send fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </span>
        </Tooltip>
      </Zoom>
      
      {error && (
        <Slide direction="up" in={!!error} mountOnEnter unmountOnExit>
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ 
              position: 'absolute', 
              bottom: isMobile ? 60 : 70, 
              left: 0, 
              right: 0, 
              textAlign: 'center',
              px: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
              zIndex: 10
            }}
          >
            {error}
          </Typography>
        </Slide>
      )}
    </Box>
  );
};

export default ChatInput;