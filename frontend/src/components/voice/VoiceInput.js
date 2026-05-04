import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  Mic,
  MicOff,
  ErrorOutline
} from '@mui/icons-material';

/**
 * VoiceInput - FIXED version (prevents double-start errors)
 */
const VoiceInput = ({ onResult, children }) => {
  const theme = useTheme();
  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [volumeLevel, setVolumeLevel] = React.useState(0);
  const recognitionRef = React.useRef(null);
  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const microphoneRef = React.useRef(null);
  const animationFrameRef = React.useRef(null);
  const isProcessingRef = React.useRef(false);
  const hasStartedRef = React.useRef(false);

  // Initialize SpeechRecognition ONCE on mount
  React.useEffect(() => {
    // Get browser-specific SpeechRecognition
    const SpeechRecognition = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // ✅ Use en-US (universally supported)
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎙️ Speech recognition STARTED');
        setIsListening(true);
        setError(null);
        hasStartedRef.current = true;
        isProcessingRef.current = false;
        startAudioVisualizer();
      };

      recognition.onresult = (event) => {
        if (isProcessingRef.current) return;
        
        const transcript = event.results[0][0].transcript.trim();
        console.log('🎤 Transcribed:', transcript);
        
        if (transcript) {
          isProcessingRef.current = true;
          handleResult(transcript);
          // Stop automatically after result
          setTimeout(() => {
            recognition.stop();
          }, 300);
        }
      };

      recognition.onend = () => {
        console.log('⏹️ Speech recognition ENDED');
        setIsListening(false);
        hasStartedRef.current = false;
        stopAudioVisualizer();
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        let message = 'Voice recognition failed. Please try again.';
        
        if (event.error === 'no-speech') {
          message = 'No speech detected. Please speak clearly and try again.';
        } else if (event.error === 'audio-capture') {
          message = 'Microphone not working. Check your device settings.';
        } else if (event.error === 'not-allowed') {
          message = 'Microphone access denied. Allow permission and refresh.';
        } else if (event.error === 'network') {
          message = 'Network error. Check your internet connection.';
        }
        
        setError(message);
        setIsListening(false);
        hasStartedRef.current = false;
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
      console.log('✅ SpeechRecognition API initialized with en-US');
    } else {
      console.warn('⚠️ SpeechRecognition not supported in this browser');
      setError('Voice input not supported. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      stopAudioVisualizer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Audio visualizer for real-time feedback
  const startAudioVisualizer = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          microphoneRef.current.connect(analyserRef.current);
          
          const visualize = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            
            setVolumeLevel(Math.min(100, average * 1.5));
            
            animationFrameRef.current = requestAnimationFrame(visualize);
          };
          
          visualize();
        })
        .catch(err => {
          console.error('❌ Microphone stream error:', err);
          setError('Cannot access microphone. Check browser permissions.');
          setIsListening(false);
          hasStartedRef.current = false;
        });
    } catch (err) {
      console.error('❌ AudioContext error:', err);
      setError('Audio not supported in this browser.');
      setIsListening(false);
      hasStartedRef.current = false;
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (microphoneRef.current && audioContextRef.current) {
      try {
        const tracks = microphoneRef.current.mediaStream.getTracks();
        tracks.forEach(track => track.stop());
        audioContextRef.current.close();
      } catch (e) {
        console.warn('Audio context close error:', e);
      }
    }
    
    audioContextRef.current = null;
    microphoneRef.current = null;
    analyserRef.current = null;
    setVolumeLevel(0);
    isProcessingRef.current = false;
  };

  const handleResult = (transcript) => {
    if (transcript.trim().length > 0 && onResult) {
      console.log('✅ Sending result to parent:', transcript);
      onResult(transcript.trim());
    }
  };

  const handleClick = () => {
    if (error) {
      setError(null);
    }

    if (!recognitionRef.current) {
      alert('Voice input not supported. Please use Chrome, Edge, or Safari browser.');
      return;
    }

    // ✅ CRITICAL FIX: Check if already listening
    if (isListening || hasStartedRef.current) {
      console.log('⏹️ Stopping recognition (already running)');
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Stop error (already stopped):', e.message);
      }
      return;
    }

    // Request microphone permission FIRST
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('✅ Microphone permission granted');
        // ✅ CRITICAL FIX: Ensure stopped before starting
        try {
          recognitionRef.current.stop(); // Ensure clean state
        } catch (e) {
          // Ignore if already stopped
        }
        
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            console.log('▶️ Starting recognition...');
          } catch (err) {
            console.error('❌ Recognition start error:', err);
            setError('Failed to start. Please try again or refresh the page.');
          }
        }, 100); // Small delay to ensure clean state
      })
      .catch((err) => {
        console.error('❌ Microphone permission error:', err);
        let message = 'Microphone access denied.';
        
        if (err.name === 'NotFoundError') {
          message = 'No microphone found. Connect a mic and try again.';
        } else if (err.name === 'NotAllowedError') {
          message = 'Please allow microphone access in browser settings.';
        }
        
        setError(message);
        alert(`${message}\n\nHow to fix:\n1. Click 🔒 lock icon in address bar\n2. Set "Microphone" to "Allow"\n3. Refresh page and try again`);
      });
  };

  // Render children with voice control props
  if (children) {
    return children({
      onClick: handleClick,
      isListening,
      error,
      volumeLevel
    });
  }

  // Default UI
  return (
    <Tooltip title={isListening ? 'Listening... Speak clearly in English' : 'Speak in English'}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
          onClick={handleClick}
          disabled={!!error}
          sx={{
            bgcolor: isListening ? 'error.light' : 'primary.light',
            '&:hover': {
              bgcolor: isListening ? 'error.main' : 'primary.main'
            },
            color: 'white',
            width: 44,
            height: 44,
            position: 'relative',
            boxShadow: isListening ? 4 : 2,
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? <MicOff /> : <Mic />}
          
          {/* Volume visualizer when listening */}
          {isListening && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 4
              }}
            >
              <LinearProgress
                variant="determinate"
                value={volumeLevel}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    transition: 'width 0.1s ease'
                  }
                }}
              />
            </Box>
          )}
        </IconButton>
        
        {/* Error message */}
        {error && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: -28, 
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'error.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 4,
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
            zIndex: 100,
            maxWidth: 280,
            textAlign: 'center'
          }}>
            <ErrorOutline sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            <Typography component="span" variant="caption">
              {error}
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default VoiceInput;