import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ContentCopy,
  VolumeUp,
  Check,
  Stop
} from '@mui/icons-material';
import VoiceOutput from '../voice/VoiceOutput';

/**
 * Message Component - Displays individual chat messages with voice playback
 */
const Message = ({ message, isUser = false, onCopy }) => {
  const theme = useTheme();
  const voice = VoiceOutput();
  const [copied, setCopied] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handlePlayAudio = () => {
    if (isPlaying) {
      voice.stop();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    
    // Enable voice on first interaction (browser requirement)
    voice.handleClickToEnableVoice();
    
    // Speak the message
    const success = voice.speak(message.content, message.language || 'en');
    
    if (!success) {
      setIsPlaying(false);
      alert('Voice playback not supported in your browser. Try Chrome or Safari.');
    }
  };

  React.useEffect(() => {
    if (voice.isSpeaking) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [voice.isSpeaking]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: { xs: 1, sm: 2 }
      }}
    >
      <Box
        sx={{
          maxWidth: '80%',
          bgcolor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
          color: isUser ? 'white' : 'text.primary',
          borderRadius: 2,
          p: 2,
          position: 'relative',
          boxShadow: isUser ? 2 : 1
        }}
      >
        {/* Language Badge */}
        {message.language && message.language !== 'en' && (
          <Chip
            label={getLanguageLabel(message.language)}
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              right: isUser ? 0 : 'auto',
              left: isUser ? 'auto' : 0,
              bgcolor: isUser ? 'rgba(255,255,255,0.3)' : theme.palette.primary.light,
              color: isUser ? 'white' : theme.palette.primary.main,
              fontSize: '0.7rem',
              height: 20,
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Message Content */}
        <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>

        {/* Message Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'space-between',
            alignItems: 'center',
            mt: 1,
            gap: 1
          }}
        >
          {/* Timestamp */}
          {message.timestamp && (
            <Typography
              variant="caption"
              sx={{
                color: isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                fontSize: '0.7rem'
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
          )}

          {/* Action Buttons (AI messages only) */}
          {!isUser && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    color: isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isUser ? 'rgba(255,255,255,0.2)' : 'action.hover'
                    }
                  }}
                >
                  {copied ? (
                    <Check fontSize="small" />
                  ) : (
                    <ContentCopy fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={isPlaying ? 'Stop speaking' : 'Listen to answer'}>
                <IconButton
                  size="small"
                  onClick={handlePlayAudio}
                  disabled={!voice.voicesLoaded}
                  sx={{
                    color: isUser ? 'rgba(255,255,255,0.7)' : (isPlaying ? 'error.main' : 'text.secondary'),
                    '&:hover': {
                      bgcolor: isUser ? 'rgba(255,255,255,0.2)' : (isPlaying ? 'error.light' : 'action.hover')
                    }
                  }}
                >
                  {isPlaying ? (
                    <Stop fontSize="small" />
                  ) : voice.voicesLoaded ? (
                    <VolumeUp fontSize="small" />
                  ) : (
                    <CircularProgress size={16} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Helper function for language labels
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

export default Message;