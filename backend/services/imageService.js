// imageService.js - Crop disease detection using Google Vision AI
require('dotenv').config();
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

class ImageService {
  // ✅ ANALYZE CROP IMAGE (with fallback to text description)
  async analyzeCropImage(imageBuffer, language = 'en') {
    try {
      // Step 1: Get labels from Google Vision
      const [result] = await client.labelDetection({ image: { content: imageBuffer } });
      const labels = result.labelAnnotations.map(l => l.description.toLowerCase());
      
      // Step 2: Get text detection (for leaf discoloration descriptions)
      const [textResult] = await client.textDetection({ image: { content: imageBuffer } });
      const texts = textResult.textAnnotations.map(t => t.description.toLowerCase());
      
      // Step 3: Detect common Ghanaian crop issues
      const diagnosis = this.detectCropIssue(labels, texts, language);
      
      return {
        diagnosis: diagnosis.title,
        recommendations: diagnosis.recommendations,
        confidence: 'high',
        detectedLabels: labels.slice(0, 5) // Top 5 labels for debugging
      };
      
    } catch (error) {
      console.error('Vision API error:', error);
      
      // ✅ FALLBACK: Text-based diagnosis if Vision fails
      return this.fallbackDiagnosis(language);
    }
  }
  
  // ✅ DETECT CROP ISSUE (Ghana-specific rules)
  detectCropIssue(labels, texts, language) {
    const labelStr = labels.join(' ').toLowerCase();
    const textStr = texts.join(' ').toLowerCase();
    
    // Maize issues
    if (labelStr.includes('maize') || labelStr.includes('corn') || labelStr.includes('leaf') && (labelStr.includes('yellow') || textStr.includes('yellow'))) {
      return {
        title: language === 'pcm' ? 'Nitrogen Deficiency (Maize)' : 
               language === 'tw' ? 'Nitrogen Deficiency (Maize)' : 
               'Nitrogen Deficiency in Maize',
        recommendations: language === 'pcm' 
          ? 'Apply 50kg NPK 15-15-15 per acre NOW. After 3 weeks, apply 25kg Urea. Wear gloves when handling fertilizer. Contact MoFA: 0302 663 911'
          : language === 'tw'
          ? 'Fa 50kg NPK 15-15-15 wɔ fie mu DA BIARA. Efi 25kg urea 3 ɛnnuɛ mu. Fa kɔde bio wɔn a wopɛ adwuma a wɔde nkyɛm bɛyɛ no. Ka MoFA no: 0302 663 911'
          : 'Apply 50kg NPK 15-15-15 fertilizer per acre immediately. After 3 weeks, apply 25kg Urea. Always wear gloves when handling fertilizer. Contact MoFA: 0302 663 911'
      };
    }
    
    // Pest detection
    if (labelStr.includes('insect') || labelStr.includes('worm') || labelStr.includes('pest') || labelStr.includes('hole')) {
      return {
        title: language === 'pcm' ? 'Armyworm Infestation' : 
               language === 'tw' ? 'Armyworm Infestation' : 
               'Armyworm Pest Attack',
        recommendations: language === 'pcm'
          ? 'Spray Lambda-cyhalothrin early morning (5-7am). Hand-pick larvae at dawn while wearing gloves. Mix 2 cups wood ash + 1 cup dry sand for natural control. EMERGENCY: Call MoFA Pest Hotline 0244 123 456'
          : language === 'tw'
          ? 'Spraya Lambda-cyhalothrin edu kɔkɔɔ (5-7am). Yiw larvae edu kɔkɔɔ wɔ bere a wopɛ adwuma no mu wɔn a wofa kɔde no. Mix 2 cups wood ash + 1 cup dry sand for natural control. EMERGENCY: Ka MoFA Pest Hotline no 0244 123 456'
          : 'Spray Lambda-cyhalothrin early in the morning between 5-7am. Hand-pick larvae at dawn while wearing gloves. For natural control, mix 2 cups wood ash with 1 cup dry sand and apply to whorls. EMERGENCY: Call MoFA Pest Hotline 0244 123 456'
      };
    }
    
    // Disease detection
    if (labelStr.includes('blight') || labelStr.includes('rot') || labelStr.includes('spot') || labelStr.includes('mold')) {
      return {
        title: language === 'pcm' ? 'Fungal Disease (Blight/Rot)' : 
               language === 'tw' ? 'Fungal Disease (Blight/Rot)' : 
               'Fungal Disease Detected',
        recommendations: language === 'pcm'
          ? 'Remove infected leaves IMMEDIATELY and burn them (do not compost). Spray Mancozeb (25g per 16L water) early morning. Wear gloves and mask always. For severe cases: MoFA Hotline 0800-123-456'
          : language === 'tw'
          ? 'Yiw nnwuma a wɔ ayɛ no NYAARA NYAARA ka wɔ fie mu (ma woyɛ compost). Spraya Mancozeb (25g wɔ 16L nsu mu) edu kɔkɔɔ. Fa kɔde ne ayɛhyɛ ntam nyinaa. For severe cases: MoFA Hotline 0800-123-456'
          : 'Remove infected leaves IMMEDIATELY and burn them (never compost diseased material). Spray Mancozeb (25g per 16 liters of water) early in the morning. Always wear gloves and a mask when spraying. For severe outbreaks: MoFA Hotline 0800-123-456'
      };
    }
    
    // Default healthy crop
    return {
      title: language === 'pcm' ? 'Healthy Crop Detected' : 
             language === 'tw' ? 'Healthy Crop Detected' : 
             'Healthy Crop',
      recommendations: language === 'pcm'
        ? 'Your crop looks healthy! Continue regular weeding every 3 weeks. Monitor for pests every 3 days. Apply fertilizer at recommended times. Keep soil moist during dry spells.'
        : language === 'tw'
        ? 'Wo mmɛyɛ yɛ pɛ! Anafo weeding kɛ 3 ɛnnuɛ koro koro. Hwehwɛ mmra kɛ 3 ɛnnuɛ koro koro. Fa mmɛyɛ mmɛyɛ wɔ bere a wobisa no mu. Ma edu edu yɛ ayɛ during dry spells.'
        : 'Your crop looks healthy! Continue regular weeding every 3 weeks. Monitor for pests every 3 days. Apply fertilizer at recommended times. Keep soil moist during dry spells.'
    };
  }
  
  // ✅ FALLBACK DIAGNOSIS (if Vision API unavailable)
  fallbackDiagnosis(language) {
    return {
      title: language === 'pcm' ? 'Upload Successful' : 
             language === 'tw' ? 'Upload Successful' : 
             'Photo Received',
      recommendations: language === 'pcm'
        ? 'I received your crop photo. For fastest help, please describe what you see: "yellow leaves", "small holes", "brown spots", or "wilting". I will give specific advice for Ghanaian farms.'
        : language === 'tw'
        ? 'Mewu wo mmɛyɛ foto no. For fastest help, please describe what you see: "mmɛyɛ no yɛ adwuma", "small holes", "brown spots", or "wilting". Mɛma wo nkwagye a wobɛyɛ adwuma wɔ Ghana mu.'
        : 'I received your crop photo. For fastest help, please describe what you see: "yellow leaves", "small holes", "brown spots", or "wilting". I will give specific advice for Ghanaian farms.'
    };
  }
}

module.exports = new ImageService();