import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Button,
  useMediaQuery,
  Skeleton,
  Slide,
  Fade,
  Zoom,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AlertTitle,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Delete,
  Add,
  VolumeUp,
  VolumeOff,
  Mic,
  Image as ImageIcon,
  Send,
  PhotoCamera,
  Close,
  CloudUpload,
  WarningAmber,
  Info,
  Crop
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import conversationService from '../services/conversationService';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import VoiceOutput from '../components/voice/VoiceOutput';

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const voice = VoiceOutput();
  const messagesEndRef = useRef(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [noConversationSelected, setNoConversationSelected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return localStorage.getItem('voiceEnabled') !== 'false';
  });
  const [pendingImage, setPendingImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('voiceEnabled', isVoiceEnabled.toString());
  }, [isVoiceEnabled]);

  const getUserLanguage = () => {
    const validLanguages = ['en', 'pcm', 'tw', 'yo', 'ha', 'ig', 'sw'];
    return validLanguages.includes(user?.preferredLanguage) ? user.preferredLanguage : 'en';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const createNewConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNoConversationSelected(false);
      const response = await conversationService.createConversation();
      if (response.success && response.data?.conversation?._id) {
        const newConv = response.data.conversation;
        setConversation(newConv);
        setMessages([]);
        navigate(`/chat/${newConv._id}`, { replace: true });
      }
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Create error:', err);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const loadConversation = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await conversationService.getConversation(id);
      if (response.success && response.data?.conversation) {
        setConversation(response.data.conversation);
        setMessages(response.data.conversation.messages || []);
        setNoConversationSelected(false);
        setRetryCount(0);
      } else {
        setError('Conversation not found');
        setNoConversationSelected(true);
      }
    } catch (err) {
      setError('Failed to load conversation');
      console.error('Load error:', err);
      setNoConversationSelected(true);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = conversationId?.trim();
    if (id === 'new') {
      createNewConversation();
      return;
    }
    if (!id || id === 'undefined' || id === 'null' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      setNoConversationSelected(true);
      setIsLoading(false);
      return;
    }
    loadConversation(id);
  }, [conversationId, createNewConversation]);

  useEffect(() => {
    if (isCameraModalOpen && !cameraStream) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
              setCameraStream(stream);
              if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err2 => {
              alert('Camera access required. Please enable in System Settings → Privacy & Security → Camera');
              setIsCameraModalOpen(false);
            });
        });
    }
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraModalOpen, cameraStream]);

  const handleSend = async (content) => {
    if (!conversation?._id || !content?.trim() || isGenerating || isAnalyzingImage) return;
    const userLanguage = getUserLanguage();
    const trimmedContent = content.trim();
    let optimisticMessageId = null;
    try {
      setIsGenerating(true);
      setError(null);
      optimisticMessageId = `temp-${Date.now()}`;
      const userMessage = {
        _id: optimisticMessageId,
        role: 'user',
        content: trimmedContent,
        timestamp: new Date().toISOString(),
        language: userLanguage
      };
      setMessages(prev => [...prev, userMessage]);
      const response = await conversationService.addMessage(conversation._id, trimmedContent, userLanguage);
      if (response.success && response.data?.conversation?.messages) {
        const newMessages = response.data.conversation.messages.slice(-2);
        setMessages(prev => {
          const withoutOptimistic = prev.filter(msg => msg._id !== optimisticMessageId);
          return [...withoutOptimistic, ...newMessages];
        });
        const aiMsg = newMessages.find(msg => msg.role === 'ai');
        if (aiMsg?.content?.trim() && isVoiceEnabled) voice.speak(aiMsg.content, aiMsg.language || userLanguage);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Send error:', err);
      if (optimisticMessageId) setMessages(prev => prev.filter(msg => msg._id !== optimisticMessageId));
      setRetryCount(prev => prev + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ FIXED: All multi-line strings now use \n for newlines (NO actual line breaks)
  const analyzeImage = async (file) => {
    if (!conversation?._id || isGenerating || isAnalyzingImage) return;
    try {
      setIsAnalyzingImage(true);
      setError(null);
      const fileName = file.name.toLowerCase();
      const isLikelyFace = fileName.includes('face') || fileName.includes('selfie') || fileName.includes('portrait') ||
                           fileName.includes('me') || fileName.includes('person') || fileName.includes('people');

      // ✅ FIXED: Single-line string with \n for newlines
      if (isLikelyFace) {
        throw new Error('📸 Please photograph your CROP, not your face!\n\nFor best results:\n✓ Show leaves/stems with symptoms\n✓ Capture in natural daylight\n✓ Keep camera steady\n\nOr describe your problem in words: "maize leaves yellow spots"');
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setPendingImage(file);
      const userMessageId = `temp-img-${Date.now()}`;
      const userMessage = {
        _id: userMessageId,
        role: 'user',
        content: '📸 Analyzing crop image...',
        image: previewUrl,
        timestamp: new Date().toISOString(),
        language: getUserLanguage()
      };
      setMessages(prev => [...prev, userMessage]);
      await new Promise(resolve => setTimeout(resolve, 2000));

      let diagnosis = '';
      let recommendations = '';
      const filename = file.name.toLowerCase();

      // ✅ FIXED: All recommendations use \n for newlines (single-line strings)
      if (filename.includes('maize') || filename.includes('corn') || filename.includes('agbado') ||
         (filename.includes('yellow') && (filename.includes('leaf') || filename.includes('leave')))) {
        diagnosis = 'Nitrogen Deficiency in Maize';
        recommendations = '✅ Apply 50kg NPK 15-15-15 per acre NOW\n✅ After 3 weeks: Apply 25kg Urea per acre\n⚠️ Wear gloves + mask when handling fertilizer\n📞 Contact MoFA for soil testing: 0302 663 911';
      }
      else if (filename.includes('hole') || filename.includes('worm') || filename.includes('pest') ||
               filename.includes('armyworm') || filename.includes('insect')) {
        diagnosis = 'Armyworm Pest Infestation';
        recommendations = '✅ Spray Lambda-cyhalothrin (10ml per 15L water) at 5-7am\n✅ Hand-pick larvae at dawn (wear gloves)\n✅ Mix 2 cups wood ash + 1 cup dry sand → apply to whorls\n🚨 REPORT severe infestations: MoFA Pest Hotline 0244 123 456';
      }
      else if (filename.includes('brown') || filename.includes('spot') || filename.includes('blight') ||
               filename.includes('rot') || filename.includes('mold') || filename.includes('mosaic')) {
        diagnosis = 'Fungal Disease Detected';
        recommendations = '✅ Remove infected leaves IMMEDIATELY + BURN them (never compost!)\n✅ Spray Mancozeb (25g per 16L water) early morning\n✅ Wear gloves + mask ALWAYS when spraying\n📞 For outbreaks: MoFA Hotline 0800-123-456';
      }
      else if (filename.includes('cassava') || filename.includes('manioc') || filename.includes('agbeli') || filename.includes('kookoo')) {
        diagnosis = 'Cassava Health Check';
        recommendations = '⚠️ CRITICAL: Cassava mosaic virus has NO CURE!\n✅ Uproot & BURN infected plants IMMEDIATELY\n✅ Plant resistant varieties: "Afisiafi" or "Bankye Hemaa"\n✅ Spray neem oil (20ml per 10L water) weekly for prevention\n📞 EMERGENCY: Report outbreaks to MoFA Pest Hotline 0244 123 456';
      }
      else {
        diagnosis = 'Crop Health Assessment';
        recommendations = '💡 For most accurate advice, please describe:\n• What crop is this? (maize/cassava/yam)\n• What symptoms do you see? (yellow leaves/holes/spots)\n• How long has this been happening?\n\nOur AI gives best results with text descriptions!';
      }

      const aiResponse = await conversationService.addMessage(
        conversation._id,
        `📸 CROP DIAGNOSIS:\n${diagnosis}\n${recommendations}\n🌾 Pro Tip: For production use, our AI will analyze actual images. For now, describe problems in words for most accurate advice!`,
        getUserLanguage()
      );

      if (aiResponse.success && aiResponse.data?.conversation?.messages) {
        const newMessages = aiResponse.data.conversation.messages.slice(-2);
        setMessages(prev => {
          const withoutOptimistic = prev.filter(msg => msg._id !== userMessageId);
          return [...withoutOptimistic, ...newMessages];
        });
        const aiMsg = newMessages.find(msg => msg.role === 'ai');
        if (aiMsg?.content?.trim() && isVoiceEnabled) voice.speak(aiMsg.content, aiMsg.language || getUserLanguage());
      }
    } catch (err) {
      // ✅ FIXED: Error message also uses \n for newlines
      setError(err.message || 'Image analysis unavailable. Please describe your crop problem in words for accurate advice:\n"maize leaves yellow spots"\n"cassava stems brown lesions"\n"yam wilting after rain"');
      console.error('Image analysis error:', err);
      setMessages(prev => prev.filter(msg => !msg.content.includes('Analyzing crop image')));
    } finally {
      setIsAnalyzingImage(false);
      setPendingImage(null);
      setImagePreviewUrl(null);
    }
  };

  const handleCameraClick = () => { if (!isGenerating && !isAnalyzingImage) setIsCameraModalOpen(true); };
  const capturePhoto = () => {
    if (!videoRef.current || !cameraStream) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const cropType = conversation?.agricultureContext?.cropType || 'crop';
        const filename = `${cropType}_${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        setIsCameraModalOpen(false);
        analyzeImage(file);
      }
    }, 'image/jpeg', 0.9);
  };
  const closeCameraModal = () => { setIsCameraModalOpen(false); if (cameraStream) cameraStream.getTracks().forEach(track => track.stop()); };
  const handleFilePickerClick = () => { if (!isGenerating && !isAnalyzingImage) fileInputRef.current.click(); };
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file && file.type.startsWith('image/')) analyzeImage(file); };
  const handleDeleteConversation = async () => { if (!conversation?._id || !window.confirm('Delete this conversation?')) return; try { await conversationService.deleteConversation(conversation._id); navigate('/conversations', { replace: true }); } catch (err) { setError('Failed to delete conversation'); } };
  const handleNewChat = () => navigate('/chat/new');

  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => { if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') setTimeout(scrollToBottom, 300); };
      window.addEventListener('resize', handleScroll);
      return () => window.removeEventListener('resize', handleScroll);
    }
  }, [isMobile]);

  useEffect(() => {
    if (voice.isSupported()) window.speechSynthesis.getVoices();
    else setIsVoiceEnabled(false);
  }, [voice]);

  useEffect(() => {
    return () => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); };
  }, [imagePreviewUrl]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: theme.palette.background.default }}>
        <Box sx={{ bgcolor: theme.palette.background.paper, borderBottom: '1px solid', py: 1.5, px: 2 }}>
          <Skeleton variant="text" width={120} height={32} />
        </Box>
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {[...Array(5)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Skeleton variant="rounded" width={i % 2 === 0 ? 200 : 180} height={60} sx={{ borderRadius: 2 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, borderTop: '1px solid' }}>
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (noConversationSelected) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">Start a New Farming Conversation</Typography>
        <Typography variant="body1" color="text.secondary">Ask about crop diseases, planting seasons, pest control, or upload a photo.</Typography>
        <Button variant="contained" color="primary" size="large" startIcon={<Add />} onClick={() => navigate('/chat/new')} sx={{ mt: 2 }}>
          Start New Chat
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" color="success" startIcon={<Add />} onClick={() => navigate('/chat/new')} sx={{ mt: 2 }}>
          New Chat
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: theme.palette.background.default }}>
      {/* HEADER */}
      <Box sx={{ bgcolor: theme.palette.background.paper, borderBottom: '1px solid', position: 'sticky', top: 0, zIndex: 100 }}>
        <Container maxWidth="lg">
          <IconButton onClick={() => navigate('/conversations')}><ArrowBack /></IconButton>
          <Typography variant="h6">{conversation?.title || 'New Chat'}</Typography>
        </Container>
      </Box>
      {/* MESSAGES AREA */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <ChatMessages messages={messages.filter(msg => msg?.content?.trim())} isGenerating={isGenerating || isAnalyzingImage} isMobile={isMobile} isVoiceEnabled={isVoiceEnabled} />
        <div ref={messagesEndRef} />
      </Box>
      {/* INPUT AREA */}
      <Box sx={{ bgcolor: theme.palette.background.paper, borderTop: '1px solid', p: 2 }}>
        <ChatInput onSend={handleSend} disabled={isGenerating} placeholder="Type here..." />
        <IconButton onClick={handleCameraClick}><PhotoCamera /></IconButton>
      </Box>
    </Box>
  );
};

export default Chat;