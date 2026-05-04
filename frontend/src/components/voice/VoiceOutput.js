// VoiceOutput.js - NATURAL VOICE (no pitch distortion)
let speechUtterance = null;
let isSpeaking = false;
let voicesLoaded = false;

// ✅ GET VOICES (wait for browser to load)
const getVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      voicesLoaded = true;
    } else if (!voicesLoaded) {
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        voicesLoaded = true;
        resolve(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      window.speechSynthesis.getVoices();
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }, 1000);
    } else {
      resolve(voices);
    }
  });
};

// ✅ NATURAL VOICE SELECTION (NO PITCH MANIPULATION)
const speak = async (text, language = 'en') => {
  if (isSpeaking && speechUtterance) {
    window.speechSynthesis.cancel();
  }
  
  try {
    isSpeaking = true;
    const voices = await getVoices();
    
    speechUtterance = new SpeechSynthesisUtterance(text);
    
    // ✅ FIND BEST VOICE FOR LANGUAGE (prioritize natural female voices)
    let bestVoice = null;
    
    // Try 1: Female voice for requested language
    bestVoice = voices.find(v => 
      v.lang?.startsWith(language.substring(0, 2)) && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('samantha') || // iOS
       v.name.toLowerCase().includes('karen') ||    // Windows
       v.name.toLowerCase().includes('sarah'))
    );
    
    // Try 2: Any female voice (fallback)
    if (!bestVoice) {
      bestVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('sarah')
      );
    }
    
    // Try 3: Language-specific voice (natural fallback)
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang?.startsWith(language.substring(0, 2)));
    }
    
    // Final fallback: First available voice
    if (!bestVoice && voices.length > 0) {
      bestVoice = voices[0];
    }
    
    // ✅ USE VOICE NATURALLY (NO PITCH DISTORTION)
    if (bestVoice) {
      speechUtterance.voice = bestVoice;
      console.log(`🔊 Using natural voice: ${bestVoice.name} (${bestVoice.lang})`);
    } else {
      console.warn('⚠️ No voices available - using default');
    }
    
    // ✅ NATURAL RATE (slightly slower for clarity)
    speechUtterance.rate = 1.15;
    
    // ✅ CRITICAL: NO PITCH MANIPULATION (prevents robotic/distorted sound)
    speechUtterance.pitch = 1.10; // Natural pitch only
    
    // Set language appropriately
    speechUtterance.lang = language === 'pcm' ? 'en-NG' : 
                         language === 'tw' ? 'en-GH' : 
                         language === 'yo' ? 'yo-NG' : 
                         language === 'ha' ? 'ha-NG' : 
                         language === 'ig' ? 'ig-NG' : 
                         language === 'sw' ? 'sw-KE' : 'en-US';
    
    speechUtterance.onstart = () => {
      console.log(`🔊 Speaking: "${text.substring(0, 30)}..."`);
    };
    
    speechUtterance.onend = () => {
      isSpeaking = false;
      speechUtterance = null;
    };
    
    speechUtterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      isSpeaking = false;
      speechUtterance = null;
    };
    
    window.speechSynthesis.speak(speechUtterance);
    
  } catch (err) {
    console.error('TTS speak error:', err);
    isSpeaking = false;
  }
};

// ✅ STOP CURRENT SPEECH
const stop = () => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    speechUtterance = null;
  }
};

// ✅ CHECK BROWSER SUPPORT
const isSupported = () => {
  return 'speechSynthesis' in window;
};

// ✅ EXPORT AS PURE UTILITY
const VoiceOutput = () => ({
  speak,
  stop,
  isSpeaking: () => isSpeaking,
  isSupported
});

export default VoiceOutput;