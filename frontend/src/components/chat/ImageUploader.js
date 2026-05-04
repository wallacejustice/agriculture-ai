import React, { useState, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip,
  Modal,
  Paper,
  Button,
  Typography
} from '@mui/material';
import { 
  PhotoCamera, 
  AttachFile, 
  Close,
  Videocam,
  CheckCircle
} from '@mui/icons-material';

const ImageUploader = ({ onImageUpload, disabled = false, isMobile = false }) => {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ SETUP CAMERA STREAM WHEN MODAL OPENS
  React.useEffect(() => {
    if (isCameraOpen && !cameraStream) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Front camera on MacBook
      })
      .then(stream => {
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera access denied:', err);
        alert('Camera access required. Please enable in System Settings → Privacy & Security → Camera');
        setIsCameraOpen(false);
      });
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, cameraStream]);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG)');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ✅ MACBOOK-SPECIFIC: OPEN CAMERA MODAL (NOT FILE PICKER)
  const handleCameraClick = () => {
    if (disabled) return;
    
    // ✅ CRITICAL: Check HTTPS or localhost
    if (window.location.protocol !== 'https:' && 
        !window.location.host.includes('localhost') && 
        !window.location.host.includes('127.0.0.1')) {
      alert('Camera requires HTTPS or localhost. Using file upload instead.');
      fileInputRef.current.click();
      return;
    }
    
    // ✅ OPEN CAMERA MODAL (MACBOOK FRONT CAMERA)
    setIsCameraOpen(true);
  };

  // ✅ CAPTURE PHOTO FROM CAMERA STREAM
  const handleCapture = () => {
    if (!videoRef.current || !cameraStream) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `crop_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
        setIsCameraOpen(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFilePickerClick = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };

  const handleRemovePreview = () => {
    setPreview(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {preview ? (
          <Box sx={{ 
            position: 'relative',
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            borderRadius: 2,
            overflow: 'hidden',
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: 2
          }}>
            <img 
              src={preview} 
              alt="Crop preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'error.main',
                color: 'white',
                width: 24,
                height: 24,
                p: 0.5,
                '&:hover': { bgcolor: 'error.dark' }
              }}
              onClick={handleRemovePreview}
            >
              <Close fontSize="small" />
            </IconButton>
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              py: 0.5,
              textAlign: 'center',
              fontSize: '0.7rem'
            }}>
              Ready to send
            </Box>
          </Box>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                e.target.value = null;
              }}
              disabled={disabled}
            />
            
            {/* ✅ MACBOOK CAMERA BUTTON - OPENS MODAL NOT FILE PICKER */}
            <Tooltip title="Take photo with camera">
              <IconButton
                onClick={handleCameraClick}
                disabled={disabled}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': { 
                    bgcolor: 'primary.lighter',
                    transform: 'scale(1.05)'
                  },
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  p: isMobile ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <PhotoCamera fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            
            {/* ✅ FILE PICKER BUTTON (SEPARATE) */}
            <Tooltip title="Upload from gallery/files">
              <Box
                onClick={handleFilePickerClick}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                sx={{
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  borderRadius: '50%',
                  border: `2px dashed ${isDragging ? 'primary.main' : 'divider'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  bgcolor: isDragging ? 'primary.light' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <AttachFile 
                  fontSize={isMobile ? "small" : "medium"} 
                  color={isDragging ? "primary" : "action"} 
                />
              </Box>
            </Tooltip>
          </>
        )}
      </Box>

      {/* ✅ CAMERA MODAL FOR MACBOOK (FRONT CAMERA) */}
      <Modal
        open={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
          }
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper sx={{ 
          p: 3, 
          maxWidth: 500, 
          width: '90%',
          borderRadius: 3,
          bgcolor: 'background.paper'
        }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Videocam color="primary" /> Take Photo
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            height: 360, 
            bgcolor: 'grey.900', 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative',
            mb: 2
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Mirror effect for selfie
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: 16,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              fontWeight: 'bold'
            }}>
              Position your crop in frame
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PhotoCamera />}
              onClick={handleCapture}
              sx={{ px: 4, py: 1.5 }}
            >
              Capture Photo
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setIsCameraOpen(false);
                if (cameraStream) {
                  cameraStream.getTracks().forEach(track => track.stop());
                  setCameraStream(null);
                }
              }}
              sx={{ px: 4, py: 1.5 }}
            >
              Cancel
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            ✅ Using your MacBook's FaceTime HD camera
          </Typography>
        </Paper>
      </Modal>
    </>
  );
};

export default ImageUploader;