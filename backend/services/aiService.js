// backend/services/aiService.js
class AIService {
  constructor() {
    // ✅ PREMIUM: User memory for personalization & progress tracking
    this.userName = null;
    this.lastTopic = null;
    this.conversationCount = 0;
    this.userHistory = []; // Track past questions for progress tracking
    this.userRegion = null; // Remember user's region for localized advice
    this.lastInteractionTime = null; // For follow-up reminders

    // ✅ NEW: Tone detection patterns
    this.tonePatterns = {
      frustrated: [/angry/i, /frustrated/i, /annoyed/i, /not working/i, /why won't/i, /hate this/i],
      urgent: [/emergency/i, /urgent/i, /help now/i, /quick/i, /asap/i, /immediately/i],
      happy: [/thank/i, /grateful/i, /wonderful/i, /amazing/i, /love this/i, /perfect/i],
      confused: [/don't understand/i, /confused/i, /what do you mean/i, /explain/i]
    };

    // ✅ NEW: Quick mode triggers (user seems in hurry)
    this.quickModeTriggers = [
      /quick/i, /short/i, /brief/i, /summary/i, /tl;dr/i, /just tell me/i,
      /in a hurry/i, /busy/i, /fast/i, /simple/i
    ];

    // ✅ NEW: Weather-aware keywords
    this.weatherKeywords = {
      rain: ['rain', 'rainy', 'downpour', 'storm', 'wet', 'flood'],
      drought: ['dry', 'drought', 'no rain', 'sun', 'heat', 'hot'],
      harmattan: ['harmattan', 'dusty', 'dry wind', 'haze'],
      cool: ['cool', 'cold', 'chilly', 'morning dew']
    };

    // OFF-TOPIC KEYWORDS (non-agriculture topics)
    this.offTopicKeywords = [
      'cook', 'recipe', 'bake', 'food', 'restaurant', 'chef', 'kitchen',
      'movie', 'film', 'tv', 'show', 'entertainment', 'netflix',
      'sports', 'football', 'soccer', 'game', 'match', 'score',
      'joke', 'funny', 'laugh', 'meme', 'comedy',
      'stock', 'market', 'finance', 'money', 'bitcoin', 'crypto',
      'news', 'politics', 'election', 'president', 'government'
    ];

    // ✅ CRITICAL FIX: TEMPORARY GOODBYE PATTERNS
    this.temporaryGoodbyePatterns = [
      /travelling/i, /traveling/i, /journey/i, /trip/i, /going away/i,
      /come back/i, /when i come/i, /see you later/i, /talk later/i,
      /be back/i, /return/i, /2 days/i, /next week/i, /when i return/i,
      /im travelling/i, /i'm travelling/i, /i am travelling/i, /going on a trip/i,
      /will be back/i, /catch you later/i, /ttyl/i, /brb/i, /afk/i,
      /heading out/i, /leaving now/i, /back soon/i, /take care/i,
      /i go come back/i, /i go return/i, /i go come/i,
      /mɛbɛsan/i, /mɛbɛba bio/i, /mɛbɛsan bere a ɛbɛba/i,
      /im travelling for/i, /i will tell you when/i, /when i come we will talk/i
    ];

    // ✅ CRITICAL FIX: WELCOME BACK PATTERNS
    this.welcomeBackPatterns = [
      /i['"]?m\s+back/i, /i\s+am\s+back/i, /hi\s+i['"]?m\s+back/i,
      /hello\s+i['"]?m\s+back/i, /hey\s+i['"]?m\s+back/i, /welcome\s+back/i,
      /good\s+to\s+see\s+you/i, /came\s+back/i, /returned/i, /back\s+again/i,
      /i have returned/i, /i returned/i, /im back/i, /am back/i
    ];

    // ✅ PREMIUM FEATURE: NAME EXTRACTION PATTERNS
    this.namePatterns = [
      /i\s+am\s+([a-zA-Z]+)/i,
      /i['"]?m\s+([a-zA-Z]+)/i,
      /my\s+name\s+is\s+([a-zA-Z]+)/i,
      /call\s+me\s+([a-zA-Z]+)/i,
      /you\s+can\s+call\s+me\s+([a-zA-Z]+)/i,
      /i\s+go\s+by\s+([a-zA-Z]+)/i,
      // Pidgin variations
      /my\s+name\s+na\s+([a-zA-Z]+)/i,
      /dem\s+call\s+me\s+([a-zA-Z]+)/i,
      /i\s+be\s+([a-zA-Z]+)/i,
      // Twi variations
      /me\s+din\s+de\s+([a-zA-Z]+)/i,
      /wo\s+ntumi\s+frɛ\s+me\s+([a-zA-Z]+)/i
    ];

    // ✅ PREMIUM FEATURE: REGION EXTRACTION PATTERNS
    this.regionPatterns = [
      /i\s+live\s+in\s+([a-zA-Z\s]+)/i,
      /i\s+am\s+from\s+([a-zA-Z\s]+)/i,
      /my\s+farm\s+is\s+in\s+([a-zA-Z\s]+)/i,
      /i\s+farm\s+in\s+([a-zA-Z\s]+)/i,
      // Ghanaian region names
      /(ashanti|kumasi|volta|ho|northern|tamale|bolga|upper\s+east|upper\s+west|greater\s+accra|central|western|eastern|brong\s+ahafo)/i
    ];

    // ✅ PREMIUM FEATURE: HUMAN CONVERSATION PATTERNS
    this.conversationPatterns = {
      greetings: {
        patterns: [/how are you/i, /how you doing/i, /how is it going/i, /how far/i, /you good/i],
        responses: {
          en: ["I'm well, thank you for asking! 🌾 How can I help your farm today?"],
          pcm: ["I dey well, thank you for asking! 🌾 How I fit help your farm today?"],
          tw: ["Mɛte sɛ me ho yɛ, meda wo ase! 🌾 Mɛbɛyɛ dɛn mma wo mfarm tɛɛ?"]
        }
      },
      wellbeing: {
        patterns: [/i am good/i, /i'm good/i, /all good/i, /everything good/i],
        responses: {
          en: ["That's wonderful to hear! 😊 Now, how can I help your crops today?"],
          pcm: ["Na wonderful to hear! 😊 Now, how I fit help your crops today?"],
          tw: ["Ɛyɛ fɛ to hear saa yi! 😊 Enti, mɛbɛyɛ dɛn mma wo mmɛyɛ tɛɛ?"]
        }
      },
      empathy: {
        patterns: [/i am tired/i, /my crop fail/i, /no yield/i, /struggling/i],
        responses: {
          en: ["Farming is hard work... What happened to your crops?"],
          pcm: ["Farming na hard work... Wetin happen to your crops?"],
          tw: ["Mmɛyɛ yɛ adwuma a ɛyɛ den... Dɛn na ayɛ wo mmɛyɛ no?"]
        }
      }
    };

    // ✅ PREMIUM FEATURE: DAILY FARMING TIPS (Expanded)
    this.dailyTips = [
      "💧 Water your vegetables early morning (5-7am) to reduce evaporation by 40%.",
      "🌱 Plant cassava cuttings at 45° angle with buds facing up for best sprouting.",
      "⚠️ Never compost diseased plants - always burn mosaic-infected cassava to stop spread.",
      "🌽 Maize needs nitrogen most at knee-high stage - apply urea 3 weeks after planting.",
      "🐜 Mix wood ash + dry sand (2:1 ratio) in maize whorls to stop armyworm naturally.",
      "🌾 Rotate crops yearly: maize → cassava → fallow land breaks pest cycles.",
      "☀️ Spray pesticides ONLY early morning (5-7am) - chemicals vaporize dangerously at midday heat.",
      "💧 Mulch with dry grass 5cm thick to retain soil moisture during dry spells.",
      "🌱 Use disease-free cassava cuttings 25-30cm long for highest yields.",
      "⚠️ Wear gloves + mask ALWAYS when handling chemicals - your health comes first.",
      "🌾 Plant legumes after maize to restore nitrogen naturally - no fertilizer needed!",
      "🐔 Integrate poultry: chicken manure is gold for soil fertility.",
      "🌧️ During heavy rains, create drainage channels to prevent root rot in 48 hours.",
      "🌞 During harmattan, increase watering frequency - dust reduces soil moisture.",
      "🌱 Start seedlings in nursery beds before transplanting for higher survival rates."
    ];

    // ✅ PREMIUM FEATURE: GHANAIAN FARMING PROVERBS (Expanded)
    this.farmingProverbs = [
      "Ɛyɛ dɔ̆ wɔ mmɛyɛ mu sɛ woyɛ dɔ̆ wɔ nkyerɛkyerɛ mu.",
      "Mmɛyɛfoɔ a ɔte aseɛ no, ɔbɛyɛ dɔ̆ ma ne mfam.",
      "Mmirika biara nnyɛ dɔ̆ ma mmɛyɛ.",
      "Wo nsa nkyɛrɛ wo sɛ woyɛ dɛn ma wo mfarm.",
      "Ɛyɛ dɔ̆ sɛ woyɛ mmɛyɛ wɔ bere a ɛfata.",
      "Nkɔsoɔ biara nkyɛ mmɛyɛfoɔ ho ban.",
      "Mmɛyɛfoɔ a ɔhwee no, ɔbɛyɛ dɔ̆ bio.",
      "Ɛyɛ dɔ̆ sɛ woyɛ mmɛyɛ wɔ asaase a ɛyɛ pɛ.",
      "Wo mfarm yɛ wo ho ban.",
      "Mmɛyɛ yɛ asaase mu mmerɛ.",
      "Asaase yɛ ɔden, nanso ɔyɛ adwuma a ɛyɛ den.",
      "Ɛyɛ dɔ̆ sɛ woyɛ mmɛyɛ wɔ bere a ɛfata.",
      "Mmɛyɛfoɔ a ɔhwee no, ɔbɛyɛ dɔ̆ bio.",
      "Wo nsa nkyɛrɛ wo sɛ woyɛ dɛn ma wo mfarm.",
      "Nkɔsoɔ biara nkyɛ mmɛyɛfoɔ ho ban."
    ];

    // ✅ PREMIUM FEATURE: COMMUNITY WISDOM (What other farmers say)
    this.communityWisdom = {
      maize: [
        "Many farmers in Ashanti say: 'Apply fertilizer when maize is knee-high for best results.'",
        "Farmers in Northern region recommend: 'Plant maize when mangoes flower for perfect timing.'",
        "Veteran farmers advise: 'Hand-pick armyworm larvae at dawn - it works better than chemicals.'"
      ],
      cassava: [
        "Cassava growers in Volta say: 'Burn infected plants immediately - don't wait.'",
        "Experienced farmers share: 'Plant resistant varieties like Afisiafi to avoid mosaic virus.'",
        "Community tip: 'Rotate cassava with maize next season to break pest cycles.'"
      ],
      yam: [
        "Yam farmers in Ashanti advise: 'Stake immediately after sprouting for strong vines.'",
        "Northern farmers say: 'Plant yams when harmattan ends for best tuber development.'",
        "Elder farmers recommend: 'Use seed yams with healthy sprouts weighing at least 250g.'"
      ],
      general: [
        "Many Ghanaian farmers agree: 'Early morning is the best time for all farm work.'",
        "Community wisdom: 'A rested farmer makes better decisions than a tired one.'",
        "Veteran advice: 'Keep records of what works - your farm is your business.'"
      ]
    };

    // ✅ PREMIUM FEATURE: FOLLOW-UP REMINDERS
    this.followUpReminders = {
      maize: [
        { afterDays: 7, message: "Check your maize for early signs of armyworm - small holes in leaves mean act now!" },
        { afterDays: 21, message: "Time to apply second fertilizer dose to your maize for maximum yield!" },
        { afterDays: 60, message: "Your maize should be tasseling now - watch for pollination success!" }
      ],
      cassava: [
        { afterDays: 30, message: "Check your cassava cuttings - they should be sprouting new leaves by now!" },
        { afterDays: 90, message: "Your cassava should have strong stems - time to hill up soil around plants!" },
        { afterDays: 270, message: "Your cassava may be ready for harvest - check if leaves are turning yellow!" }
      ],
      yam: [
        { afterDays: 14, message: "Your yam vines should be climbing stakes - ensure stakes are secure!" },
        { afterDays: 120, message: "Your yams should be forming tubers - avoid disturbing soil around plants!" },
        { afterDays: 240, message: "Your yams may be ready for harvest - check if vines are drying!" }
      ]
    };

    // ✅ ALL EXISTING FEATURES PRESERVED EXACTLY
    this.cropRotationPatterns = {
      maize: ['cassava', 'groundnut', 'cowpea', 'soybean'],
      cassava: ['maize', 'rice', 'vegetables'],
      yam: ['maize', 'cassava', 'vegetables'],
      rice: ['maize', 'vegetables', 'legumes']
    };
    
    this.intercroppingPatterns = {
      maize: [
        { partner: "beans", benefit: "Beans fix nitrogen for maize" },
        { partner: "cassava", benefit: "Maize provides early cover for young cassava" },
        { partner: "groundnuts", benefit: "Groundnuts suppress weeds between maize rows" }
      ],
      cassava: [
        { partner: "maize", benefit: "Maize provides early income while cassava matures" },
        { partner: "vegetables", benefit: "Short-cycle crops use space before cassava canopy closes" }
      ],
      yam: [
        { partner: "maize", benefit: "Maize stakes support yam vines" },
        { partner: "beans", benefit: "Beans climb yam stakes for vertical growth" }
      ]
    };
    
    this.harvestTiming = {
      maize: { early: "8-10 weeks", main: "12-14 weeks", bestMarket: "Sep-Oct" },
      cassava: { early: "9 months", main: "12-15 months", bestMarket: "Dec-Feb" },
      yam: { early: "7-8 months", main: "9-10 months", bestMarket: "Dec-Jan" },
      rice: { early: "110-120 days", main: "150-180 days", bestMarket: "Nov-Jan" }
    };
    
    this.regionalCalendar = {
      ashanti: { major: "Mar-Apr", minor: "Aug-Sep", crops: "Maize, cassava, yam" },
      volta: { major: "Mar-Apr", minor: "Aug-Sep", crops: "Maize, cassava, yam" },
      northern: { major: "May-Jun", minor: "None", crops: "Maize, rice, groundnuts" },
      coastal: { major: "Apr-May", minor: "Oct-Nov", crops: "Vegetables, peppers" }
    };
    
    this.emergencyContacts = {
      mofaHeadquarters: { name: "MoFA HQ", number: "0302 663 911", hours: "Weekdays 8am-4pm" },
      pestHotline: { name: "Pest Hotline", number: "0244 123 456", hours: "24/7" },
      diseaseHotline: { name: "Disease Hotline", number: "0800-123-456", hours: "24/7" }
    };
    
    // ✅ FULL KNOWLEDGE BASE PRESERVED EXACTLY
    this.knowledgeBase = {
      agriculture: { 
        keywords: ['agriculture', 'what is agriculture', 'farming', 'what is farming', 'mmɛyɛ', 'what mean agriculture', 'define agriculture', 'agriculture mean', 'agriculture definition', 'what agriculture'],
        advice: `Agriculture (mmɛyɛ) is the practice of cultivating soil, growing crops, and raising livestock to produce food and other products for human use. In Ghana, agriculture is the backbone of our economy — over 50% of Ghanaians depend on farming for their livelihood. It includes growing staples like maize, cassava, yam and rice; raising animals like goats, sheep and poultry; and managing soil fertility through manure and crop rotation. Agriculture feeds our nation and connects us to our ancestors who worked the land for generations. As the Ghanaian proverb says: "Mmɛyɛ yɛ asaase mu mmerɛ" (Farming is the sweat of the earth).`
      },
      maize: { 
        keywords: ['maize', 'corn', 'agbado', 'obitini', 'agbɛti'], 
        advice: `For maize farming in Ghana, here is practical advice. If your maize leaves are turning yellow, this means nitrogen deficiency. Apply 50 kilograms of NPK 15-15-15 fertilizer per acre right now. Then after three weeks, apply 25 kilograms of urea per acre. Always wear gloves and a mask when handling fertilizer for your safety. For soil testing, contact MoFA at 0302 663 911. If you see small holes in leaves from fall armyworm, spray Lambda-cyhalothrin early in the morning between 5 and 7am. You can also hand-pick larvae at dawn while wearing gloves. Another natural method is mixing two cups of wood ash with one cup of dry sand and applying it to the whorls. If the infestation is severe, report immediately to MoFA Pest Hotline at 0244 123 456. Remember planting seasons: in Ashanti region, major season is April to May and minor season is September to October. In Northern region, plant once between May and June. In Volta region, plant when mangoes start flowering around March to April.`
      },
      cassava: { 
        keywords: ['cassava', 'manioc', 'agbeli', 'kookoo'], 
        advice: `Cassava farming requires special care because cassava mosaic virus has no cure. If you see infected plants, uproot and burn them immediately—never compost diseased material. Plant resistant varieties like Afisiafi or Bankye Hemaa. For prevention, spray neem oil weekly—mix 20 milliliters of neem oil in 10 liters of water. Also rotate cassava with maize next season to break the virus cycle. For emergencies, report outbreaks to MoFA Pest Hotline at 0244 123 456. When planting, use disease-free cuttings 25 to 30 centimeters long. Plant at a 45 degree angle with one meter spacing between plants. Apply NPK 15-15-15 fertilizer only at planting time—150 kilograms per acre. Harvest after 9 to 12 months when leaves turn yellow.`
      },
      yam: { 
        keywords: ['yam', 'ji', 'anyinam'], 
        advice: `For successful yam farming, timing is everything. Plant when mangoes start flowering around March to April. Use seed yams with healthy sprouts weighing at least 250 grams each. Build mounds at least 30 centimeters high for good tuber development, with one meter spacing between mounds. Stake your yams immediately after sprouting using two meter tall stakes. For pest control, dust mounds weekly with wood ash to prevent yam beetles. If you have nematode problems, rotate with legumes before planting yams next season. In Northern region, plant once during May to June rainy season. In Ashanti and Volta regions, you can plant twice—major season March to April and minor season August to September.`
      },
      disease: { 
        keywords: ['disease', 'blight', 'mosaic', 'yellow leaf', 'brown spot', 'rot', 'sick plant', 'sick'], 
        advice: `When you see crop diseases, act quickly and safely. First, remove infected plants immediately and burn them—never compost diseased material. Always wash your hands and tools with soap after handling sick plants. For chemical treatment, wear gloves and a mask always. For leaf blight, mix 25 grams of Mancozeb in 16 liters of water. For anthracnose, use 30 grams of Copper Oxychloride in 16 liters of water. Spray early in the morning between 5 and 7am when leaves are dry. To prevent diseases, use only certified disease-free seeds from MoFA offices. Rotate crops yearly—for example, maize to cassava to fallow land. Keep your field clean of weeds and debris. For disease outbreaks, call MoFA Hotline at 0800-123-456.`
      },
      pest: { 
        keywords: ['pest', 'worm', 'armyworm', 'mite', 'insect', 'bug', 'caterpillar', 'beetle'], 
        advice: `Pest control requires protecting yourself first. Always wear gloves and long sleeves when spraying chemicals. Never spray during hot sun between 8am and 4pm because chemicals vaporize and become dangerous. Wash thoroughly after spraying. Keep children and animals away from sprayed fields for 24 hours. For severe infestations, spray Lambda-cyhalothrin—mix 10 milliliters in 15 liters of water and spray at 5 to 7am when pests are active. For natural prevention, mix wood ash and dry sand in a two-to-one ratio and apply to maize whorls. You can also make neem leaf extract by soaking 500 grams of neem leaves in 5 liters of water overnight, then spray the solution. MoFA extension officers provide free pest identification service at district offices—visit them for help.`
      },
      soil: { 
        keywords: ['soil', 'fertility', 'manure', 'compost', 'dirt', 'ground'], 
        advice: `For healthy soil in Ghanaian farms, follow these best practices. Before planting, add five tons of poultry or cow manure per acre two weeks before planting. Or use three tons of compost plus 100 kilograms of NPK 15-15-15 per acre. During growth, side-dress with 50 kilograms of urea per acre at four weeks for maize. Mulch with dry grass five centimeters thick to retain moisture. After harvest, plant cover crops like mucuna or centrosema to restore nitrogen in the soil. Remember soil types vary across Ghana. In Ashanti and Eastern forest zones, soils are acidic—add lime to correct pH. In Greater Accra coastal savanna, soils are sandy—add more manure to improve water retention. In Northern Guinea savanna, soils have low fertility—apply double the normal amount of manure. For free soil testing, visit MoFA offices every Tuesday morning.`
      },
      weather: {
        keywords: ['rain', 'rainy', 'dry', 'drought', 'flood', 'storm', 'weather', 'sun', 'heat', 'mmirika'],
        advice: `Weather affects your farm daily. During dry spells: irrigate vegetables early morning or late evening to reduce evaporation. During heavy rains: create drainage channels to prevent waterlogging—standing water causes root rot in 48 hours. Before storms: harvest ripe crops immediately—strong winds destroy maize stalks. After rain: wait 24 hours before applying fertilizer—wet leaves cause chemical burns. For accurate forecasts, call Ghana Meteorological Agency at 0302 663 371. Remember this proverb: "Mmirika biara nnyɛ dɔ̆ ma mmɛyɛ" (Not every rain is good for farming).`
      }
    };
    
    this.seasonalTips = {
      january: "January is dry season. Focus on irrigating your vegetables. Start preparing land for early maize planting in Ashanti region.",
      february: "February is land preparation time. Clear your fields now for March planting. Apply manure two weeks before planting for best results.",
      march: "March marks the start of major planting season. Plant maize, cassava and yam in Ashanti and Volta regions. Northern region farmers should wait until May for planting.",
      april: "April is peak planting month. Watch for early rains to begin. Apply your first fertilizer three weeks after planting.",
      may: "May brings planting time for Northern region. Southern regions should do first weeding for crops planted in March.",
      june: "June is rainy season peak. Watch carefully for armyworms on maize and spray early morning if needed.",
      july: "July offers a second planting window in Ashanti for minor season crops. Cassava can still be planted successfully now.",
      august: "August is minor season planting time in forest zones. Northern region farmers begin harvesting early maize.",
      september: "September brings harvest time for early maize. Start preparing land for minor season crops.",
      october: "October is minor season harvest time. This is your last chance to plant cassava before dry season begins.",
      november: "November starts dry season. Focus on irrigating vegetables. Begin planning next season's crops.",
      december: "December is for land preparation. Apply manure to fallow fields. Rest well and plan for the new year."
    };
    
    this.empathyPhrases = [
      "Farming is hard work, and your dedication feeds our nation.",
      "Every farmer faces challenges. What matters is getting back up tomorrow.",
      "The soil rewards patience. Your hard work will yield abundance.",
      "Even the mighty tree started as a small seed. Keep nurturing your farm.",
      "Rain or shine, you show up for your farm. That is true strength.",
      "Your hands feed families. Never forget your important work.",
      "When crops fail, it is not your fault. Farming depends on many things beyond our control like rain and pests.",
      "Take rest when tired. A rested farmer makes better decisions."
    ];

    // ✅ PREMIUM: Confidence levels for advice
    this.confidenceLevels = {
      high: { prefix: "✅ ", suffix: " This is proven advice from Ghanaian farming experts." },
      medium: { prefix: "🤔 ", suffix: " This is general guidance - results may vary based on your specific conditions." },
      low: { prefix: "⚠️ ", suffix: " I'm not 100% certain about this - please consult your local MoFA officer for confirmation." }
    };
  }

  // ✅ PREMIUM: Extract and remember user's name
  extractUserName(question) {
    const q = question.toLowerCase().trim();
    for (const pattern of this.namePatterns) {
      const match = q.match(pattern);
      if (match && match[1]) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        this.userName = name;
        this.conversationCount++;
        return name;
      }
    }
    return null;
  }

  // ✅ PREMIUM: Extract and remember user's region
  extractUserRegion(question) {
    const q = question.toLowerCase().trim();
    for (const pattern of this.regionPatterns) {
      const match = q.match(pattern);
      if (match && match[1]) {
        const region = match[1].trim().toLowerCase();
        // Map to standardized region names
        if (region.includes('ashanti') || region.includes('kumasi')) this.userRegion = 'ashanti';
        else if (region.includes('volta') || region.includes('ho')) this.userRegion = 'volta';
        else if (region.includes('north') || region.includes('tamale') || region.includes('bolga')) this.userRegion = 'northern';
        else if (region.includes('coast') || region.includes('accra') || region.includes('cape')) this.userRegion = 'coastal';
        else this.userRegion = region;
        return this.userRegion;
      }
    }
    return null;
  }

  // ✅ PREMIUM: Detect user's emotional tone
  detectTone(question) {
    const q = question.toLowerCase().trim();
    for (const [tone, patterns] of Object.entries(this.tonePatterns)) {
      if (patterns.some(pattern => pattern.test(q))) {
        return tone;
      }
    }
    return 'neutral';
  }

  // ✅ PREMIUM: Check if user wants quick/short response
  isQuickMode(question) {
    const q = question.toLowerCase().trim();
    return this.quickModeTriggers.some(pattern => pattern.test(q));
  }

  // ✅ PREMIUM: Detect weather context in question
  detectWeatherContext(question) {
    const q = question.toLowerCase().trim();
    for (const [weatherType, keywords] of Object.entries(this.weatherKeywords)) {
      if (keywords.some(kw => q.includes(kw))) {
        return weatherType;
      }
    }
    return null;
  }

  // ✅ PREMIUM: Get community wisdom for crop
  getCommunityWisdom(crop) {
    const cropKey = crop.toLowerCase();
    const wisdom = this.communityWisdom[cropKey] || this.communityWisdom.general;
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  }

  // ✅ PREMIUM: Get follow-up reminder for crop
  getFollowUpReminder(crop, daysSinceLastInteraction) {
    const cropKey = crop.toLowerCase();
    const reminders = this.followUpReminders[cropKey] || [];
    // Find the closest reminder based on days
    const closest = reminders.reduce((prev, curr) => 
      Math.abs(curr.afterDays - daysSinceLastInteraction) < Math.abs(prev.afterDays - daysSinceLastInteraction) ? curr : prev
    , reminders[0]);
    
    if (closest && Math.abs(closest.afterDays - daysSinceLastInteraction) <= 3) {
      return closest.message;
    }
    return null;
  }

  // ✅ PREMIUM: Personalized greeting with name
  getPersonalizedGreeting(language = 'en', hour = new Date().getHours()) {
    const namePart = this.userName ? `, ${this.userName}` : '';
    
    const greetings = {
      en: {
        morning: `Good morning${namePart}! 🌾`,
        afternoon: `Good afternoon${namePart}! ☀️`,
        evening: `Good evening${namePart}! 🌙`,
        generic: `Hello${namePart}! 🌾`
      },
      pcm: {
        morning: `Good morning${namePart}! 🌾`,
        afternoon: `Good afternoon${namePart}! ☀️`,
        evening: `Good evening${namePart}! 🌙`,
        generic: `Hello${namePart}! 🌾`
      },
      tw: {
        morning: `Maakye${namePart}! 🌾`,
        afternoon: `Edaa${namePart}! ☀️`,
        evening: `Sannaa${namePart}! 🌙`,
        generic: `Ete sen${namePart}! 🌾`
      }
    };
    
    const timeGreeting = hour >= 5 && hour < 12 ? 'morning' :
                        hour >= 12 && hour < 17 ? 'afternoon' :
                        hour >= 17 && hour < 21 ? 'evening' : 'generic';
    
    return greetings[language]?.[timeGreeting] || greetings.en[timeGreeting];
  }

  removeEmojis(text) { return text.replace(/[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Presentation}\p{Emoji_Component}]/gu, ''); }
  isGreeting(q) { const greetings = ['hi','hello','hey','howdy','good morning','good afternoon','good evening','maakye','ete sen','akwaaba']; return greetings.some(phrase => q.includes(phrase)); }
  isFarewell(q) { const farewells = ['bye','goodbye','see you','thank you','thanks','appreciate','exit','close','later','good night','meda wo ase','te kwa']; return farewells.some(phrase => q.includes(phrase)); }
  
  isOffTopic(q) {
    if (q.includes('agriculture') || q.includes('farming') || q.includes('mmɛyɛ') || q.includes('what is') || q.includes('define') || q.includes('meaning of')) {
      return false;
    }
    const hasOffTopic = this.offTopicKeywords.some(kw => q.includes(kw));
    const hasAgriculture = Object.values(this.knowledgeBase).some(topic => 
      topic.keywords.some(kw => q.includes(kw))
    );
    return hasOffTopic && !hasAgriculture;
  }

  getTemporaryGoodbyeResponse(question, language = 'en') {
    const q = question.toLowerCase().trim();
    const isTemporaryGoodbye = this.temporaryGoodbyePatterns.some(pattern => pattern.test(q));
    if (!isTemporaryGoodbye) return null;
    
    const namePart = this.userName ? `, ${this.userName}` : '';
    
    const responses = {
      en: [
        `Safe travels${namePart}! 👋 Come back when you're ready — your farm will still be here. God bless your journey. 🌾`,
        `Have a safe trip${namePart}! 🌾 I'll be here when you return. Take care of yourself and your farm.`,
        `Travel safely${namePart}! Your farm is in good hands until you return. See you soon! 👋`,
        `Wishing you a safe journey${namePart}! 🌾 Rest well and come back when you're ready. I'll be here to help with your farm.`
      ],
      pcm: [
        `Safe travels${namePart}! 👋 Come back when you don ready — your farm go still dey. God bless your journey. 🌾`,
        `Have safe trip${namePart}! 🌾 I go still dey when you return. Take care of yourself and your farm.`,
        `Travel safely${namePart}! Your farm na good hands until you return. See you soon! 👋`,
        `Wishing you safe journey${namePart}! 🌾 Rest well and come back when you ready. I go still dey to help with your farm.`
      ],
      tw: [
        `Te mu yɛ fɛ${namePart}, me do wo ban! 👋 Bɛsan bere a wo ate aseɛ — wo mfarm bɛtwa hɔ hɔ. Nyame nhyira wo mu. 🌾`,
        `Te mu yɛ fɛ${namePart}! 🌾 Mɛbɛtwa hɔ bere a wo bɛsan. Te wo ho ban na wo mfarm.`,
        `Te mu yɛ fɛ${namePart}! Wo mfarm yɛ wɔ nneɛma a wɔyɛ fɛ bere a wo bɛsan. Te kwa! 👋`,
        `Mema wo te mu yɛ fɛ${namePart}! 🌾 Te dwetie yɛɛ na bɛsan bere a wo ate aseɛ. Mɛbɛtwa hɔ ma wo mmɛyɛ.`
      ]
    };
    
    const langResponses = responses[language] || responses.en;
    return this.removeEmojis(langResponses[Math.floor(Math.random() * langResponses.length)]);
  }

  getWelcomeBackResponse(question, language = 'en', lastMessages = []) {
    const q = question.toLowerCase().trim();
    const isWelcomeBack = this.welcomeBackPatterns.some(pattern => pattern.test(q));
    if (!isWelcomeBack || lastMessages.length === 0) return null;
    
    const namePart = this.userName ? `, ${this.userName}` : '';
    const lastUserMessage = lastMessages[lastMessages.length - 1]?.content?.toLowerCase() || '';
    
    let lastTopic = 'your farming questions';
    if (lastUserMessage.includes('maize') || lastUserMessage.includes('corn') || lastUserMessage.includes('agbado')) lastTopic = 'maize farming';
    else if (lastUserMessage.includes('cassava') || lastUserMessage.includes('manioc') || lastUserMessage.includes('agbeli') || lastUserMessage.includes('kookoo')) lastTopic = 'cassava farming';
    else if (lastUserMessage.includes('yam') || lastUserMessage.includes('ji')) lastTopic = 'yam farming';
    else if (lastUserMessage.includes('rice')) lastTopic = 'rice farming';
    else if (lastUserMessage.includes('pest') || lastUserMessage.includes('insect') || lastUserMessage.includes('worm') || lastUserMessage.includes('armyworm')) lastTopic = 'pest control';
    else if (lastUserMessage.includes('disease') || lastUserMessage.includes('sick') || lastUserMessage.includes('blight') || lastUserMessage.includes('mosaic')) lastTopic = 'disease management';
    else if (lastUserMessage.includes('fertilizer') || lastUserMessage.includes('soil') || lastUserMessage.includes('manure')) lastTopic = 'soil fertility';
    
    // ✅ PREMIUM: Add progress reference
    const progressNote = this.conversationCount > 1 ? ` You've asked ${this.conversationCount} questions so far - you're building great farming knowledge!` : '';
    
    if (language === 'pcm') return this.removeEmojis(`Welcome back${namePart}! 👋 We were discussing ${lastTopic}. Would you like to continue, or talk about something new today?${progressNote} ${this.getRandomProverb()}`);
    if (language === 'tw') return this.removeEmojis(`Akwaaba bio${namePart}! 👋 Yereye kyerɛkyerɛ wo ${lastTopic} mu. Wo pɛ sɛ yɛkɔ so bio, anaa wo pɛ sɛ yɛkasa biribi foforo tɛɛ?${progressNote} ${this.getRandomProverb()}`);
    return this.removeEmojis(`Welcome back${namePart}! 👋 We were discussing ${lastTopic}. Would you like to continue our conversation, or talk about something new today?${progressNote} ${this.getRandomProverb()}`);
  }

  generateConversationResponse(question, language = 'en') {
    const q = question.toLowerCase().trim();
    for (const [type, patternSet] of Object.entries(this.conversationPatterns)) {
      for (const pattern of patternSet.patterns) {
        if (pattern.test(q)) {
          const responses = patternSet.responses[language] || patternSet.responses.en;
          const randomIndex = Math.floor(Math.random() * responses.length);
          if (type === 'greetings' || type === 'wellbeing') {
            return this.removeEmojis(`${responses[randomIndex]} ${this.getRandomProverb()}`);
          } else if (type === 'empathy') {
            return this.removeEmojis(`${responses[randomIndex]} ${this.getEmergencyContacts(language)}`);
          }
        }
      }
    }
    return null;
  }

  getCropRotationAdvice(crop, language = 'en') {
    const cropKey = crop.toLowerCase();
    const rotations = this.cropRotationPatterns[cropKey] || ['maize', 'cassava', 'legumes'];
    if (language === 'pcm') {
      return `After ${crop}, plant ${rotations.join(' or ')} next season. This breaks pest cycles and restores soil. Example: After cassava, plant maize for better yield next year.`;
    }
    if (language === 'tw') {
      return `${crop} ɛyɛ mu bere a edi aseɛ no, bɛtwa ${rotations.join(' anaa ')} bio. Ɛyɛ adwuma a wobɛyɛ ma mmra ne edu edu mu mfarm no yɛ pɛ bio.`;
    }
    return `After ${crop}, plant ${rotations.join(' or ')} next season. This breaks pest cycles and restores soil fertility. Example: After cassava, plant maize for better yield next year.`;
  }

  getIntercroppingAdvice(crop, language = 'en') {
    const cropKey = crop.toLowerCase();
    const patterns = this.intercroppingPatterns[cropKey] || [];
    if (patterns.length === 0) {
      return language === 'pcm' ? "No special intercropping advice for this crop." : 
             language === 'tw' ? "Nninsɛnhwɛ bio ma mmɛyɛ no yi." : 
             "No special intercropping advice for this crop.";
    }
    const advice = patterns.map(p => 
      language === 'pcm' ? `${p.partner}: ${p.benefit}` :
      language === 'tw' ? `${p.partner}: ${p.benefit}` :
      `${p.partner}: ${p.benefit}`
    ).join('\n');
    return language === 'pcm' ? `Good partners for ${crop}:\n${advice}` :
           language === 'tw' ? `${crop} ho mmɛyɛ a wobɛtwa no ho:\n${advice}` :
           `Good partners for ${crop}:\n${advice}`;
  }

  getHarvestTimingAdvice(crop, language = 'en') {
    const cropKey = crop.toLowerCase();
    const timing = this.harvestTiming[cropKey];
    if (!timing) {
      return language === 'pcm' ? "No harvest timing data for this crop." : 
             language === 'tw' ? "Nninsɛnhwɛ bio ma mmɛyɛ no yi bere." : 
             "No harvest timing data for this crop.";
    }
    return language === 'pcm' ? 
      `Harvest ${crop}:\n• Early: ${timing.early}\n• Main: ${timing.main}\n• Best market time: ${timing.bestMarket}` :
      language === 'tw' ?
      `Bere a wobɛyɛ harvest ma ${crop}:\n• Early: ${timing.early}\n• Main: ${timing.main}\n• Bere a ɛyɛ pɛ ma market: ${timing.bestMarket}` :
      `Harvest ${crop}:\n• Early: ${timing.early}\n• Main: ${timing.main}\n• Best market time: ${timing.bestMarket}`;
  }

  getRegionalAdvice(region, language = 'en') {
    const regionKey = region.toLowerCase().replace(/\s+/g, '');
    let regionData = null;
    if (regionKey.includes('ashanti') || regionKey.includes('kumasi')) regionData = this.regionalCalendar.ashanti;
    else if (regionKey.includes('volta') || regionKey.includes('ho')) regionData = this.regionalCalendar.volta;
    else if (regionKey.includes('north') || regionKey.includes('tamale') || regionKey.includes('bolga')) regionData = this.regionalCalendar.northern;
    else if (regionKey.includes('coast') || regionKey.includes('accra') || regionKey.includes('cape')) regionData = this.regionalCalendar.coastal;
    if (!regionData) {
      return language === 'pcm' ? "Tell me your region (Ashanti, Northern, Volta, or Coastal) for planting advice." :
             language === 'tw' ? "Ka me ho wo ntam (Ashanti, Northern, Volta, anaa Coastal) ma mmɛyɛ nkyerɛkyerɛ." :
             "Tell me your region (Ashanti, Northern, Volta, or Coastal) for planting advice.";
    }
    return language === 'pcm' ? 
      `For ${region} region:\n• Major season: ${regionData.major}\n• Minor season: ${regionData.minor || 'None'}\n• Best crops: ${regionData.crops}` :
      language === 'tw' ?
      `Ma ${region} ntam:\n• Major season: ${regionData.major}\n• Minor season: ${regionData.minor || 'None'}\n• Mmɛyɛ a ɛyɛ pɛ: ${regionData.crops}` :
      `For ${region} region:\n• Major season: ${regionData.major}\n• Minor season: ${regionData.minor || 'None'}\n• Best crops: ${regionData.crops}`;
  }

  getEmergencyContacts(language = 'en') {
    if (language === 'pcm') {
      return `EMERGENCY NUMBERS:\n• MoFA HQ: 0302 663 911 (8am-4pm weekdays)\n• Pest Hotline: 0244 123 456 (24/7)\n• Disease Hotline: 0800-123-456 (24/7)\nSAVE THESE NUMBERS IN YOUR PHONE NOW!`;
    }
    if (language === 'tw') {
      return `NOMBA A WO BƐ BEDI MU:\n• MoFA HQ: 0302 663 911 (8am-4pm weekdays)\n• Pest Hotline: 0244 123 456 (24/7)\n• Disease Hotline: 0800-123-456 (24/7)\nDII SA WO HU NOMBA NO MA WO MA WO PHONE!`;
    }
    return `EMERGENCY CONTACTS:\n• MoFA HQ: 0302 663 911 (8am-4pm weekdays)\n• Pest Hotline: 0244 123 456 (24/7)\n• Disease Hotline: 0800-123-456 (24/7)\nSAVE THESE NUMBERS IN YOUR PHONE NOW!`;
  }

  getRandomProverb() { const idx = Math.floor(Math.random()*this.farmingProverbs.length); return this.farmingProverbs[idx]; }
  getDailyTip() { const idx = new Date().getDate() % this.dailyTips.length; return this.dailyTips[idx]; }
  getSeasonalTip() { const month = new Date().getMonth(); const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december']; return this.seasonalTips[monthNames[month]] || "Focus on soil preparation and planning for your next planting season."; }
  getRandomEmpathy() { const idx = Math.floor(Math.random()*this.empathyPhrases.length); return this.empathyPhrases[idx]; }

  // ✅ PREMIUM: Add vivid sensory descriptions to advice
  addSensoryDescription(advice, crop) {
    const sensoryAdditions = {
      maize: " Imagine the golden tassels swaying in the morning breeze as your maize reaches maturity.",
      cassava: " Picture the rich, earthy smell of freshly harvested cassava roots.",
      yam: " Feel the satisfaction of lifting heavy, healthy yam tubers from the soil.",
      rice: " See the lush green rice paddies reflecting the morning sun.",
      general: " Envision your farm thriving with healthy, productive crops."
    };
    const cropKey = crop.toLowerCase();
    const addition = sensoryAdditions[cropKey] || sensoryAdditions.general;
    return `${advice} ${addition}`;
  }

  // ✅ PREMIUM: Add contextual cultural blessing
  addCulturalBlessing(language = 'en', context = {}) {
    const blessings = {
      en: [
        "May your harvest be abundant and your family well-fed. 🙏",
        "God bless your hands that work the soil. 🌾",
        "May the earth reward your hard work with plenty. ✨"
      ],
      pcm: [
        "May your harvest be plenty and your family well-fed. 🙏",
        "God bless your hands wey dey work the soil. 🌾",
        "May the earth reward your hard work with plenty. ✨"
      ],
      tw: [
        "Wo fameli nyinaa nnyɛ dɔ̆ na wo mfarm nnyɛ pɛ. 🙏",
        "Nyame nhyira wo nsa a woyɛ adwuma wɔ asaase mu. 🌾",
        "Asaase nnyɛ dɔ̆ ma wo adwuma a woyɛ. ✨"
      ]
    };
    
    // Choose blessing based on context
    if (context.success) return blessings[language]?.[0] || blessings.en[0];
    if (context.struggle) return blessings[language]?.[2] || blessings.en[2];
    return blessings[language]?.[1] || blessings.en[1];
  }

  // ✅ PREMIUM POLISHED RESPONSE GENERATION (WITH ALL 10 NEW FEATURES)
  generateAgricultureResponse(question, language = 'en', context = {}) {
    const q = question.toLowerCase().trim();
    const cropType = context.cropType || 'maize';
    const lastMessages = context.lastMessages || [];

    // ✅ STEP 0: Extract and remember user's name & region
    this.extractUserName(question);
    this.extractUserRegion(question);
    
    // ✅ Track conversation for progress tracking
    this.userHistory.push({ question, timestamp: new Date() });
    this.lastInteractionTime = new Date();

    // ✅ STEP 1: HANDLE TEMPORARY GOODBYE FIRST
    const temporaryGoodbyeResponse = this.getTemporaryGoodbyeResponse(question, language);
    if (temporaryGoodbyeResponse) return temporaryGoodbyeResponse;

    // ✅ STEP 2: HANDLE "I'M BACK" (WELCOME RETURNING USER)
    const welcomeBackResponse = this.getWelcomeBackResponse(question, language, lastMessages);
    if (welcomeBackResponse) return welcomeBackResponse;

    // ✅ STEP 3: HANDLE SOCIAL CONVERSATION
    const conversationResponse = this.generateConversationResponse(question, language);
    if (conversationResponse) return conversationResponse;

    // ✅ STEP 4: HANDLE NIGHT/TIRED
    if (q.includes('night') || q.includes('tired') || q.includes('sleep') || q.includes('rest') || q.includes('bed')) {
      const namePart = this.userName ? `, ${this.userName}` : '';
      if (language === 'pcm') return this.removeEmojis(`Good night${namePart}. Rest well tonight. Your farm will still be there tomorrow. God bless your harvest. ${this.getRandomEmpathy()}`);
      if (language === 'tw') return this.removeEmojis(`Da yie${namePart}. Te kom nyee nyee. Wo mfarm betwa ho bio obesan. Yeda Mo ne wo ase. ${this.getRandomEmpathy()}`);
      return this.removeEmojis(`Good night${namePart}. Rest well tonight. Your farm will still be there tomorrow. God bless your harvest. ${this.getRandomEmpathy()}`);
    }

    // ✅ STEP 5: HANDLE TIME-AWARE GREETINGS (PREMIUM PERSONALIZED)
    if (this.isGreeting(q)) {
      const hour = new Date().getHours();
      const isFirstInteraction = !lastMessages || lastMessages.length === 0;
      const isAskingIdentity = q.includes('who are you') || q.includes('what are you') || q.includes('introduce yourself');
      
      const greeting = this.getPersonalizedGreeting(language, hour);
      const identityPart = (isFirstInteraction || isAskingIdentity) 
        ? (language === 'pcm' ? `I am AgriPal, your farming assistant for Ghana. ` : 
           language === 'tw' ? `Meye AgriPal, wo mfarm adwuma ma Ghana. ` : 
           `I am AgriPal, your farming assistant for Ghana. `)
        : '';
      
      const followUp = {
        en: "How can I help your farm today?",
        pcm: "How I fit help your farm today?",
        tw: "Ebye den na mebo wo ho wo mfarm tee?"
      };
      
      const tip = hour >= 5 && hour < 12 ? this.getDailyTip() : this.getSeasonalTip();
      
      return this.removeEmojis(`${greeting} ${identityPart}${followUp[language] || followUp.en} ${tip}`);
    }

    // ✅ STEP 6: HANDLE FAREWELLS (PERSONALIZED + CULTURAL BLESSING)
    if (this.isFarewell(q)) {
      const namePart = this.userName ? `, ${this.userName}` : '';
      const blessing = this.addCulturalBlessing(language, { success: true });
      
      if (q.includes('thank')) {
        if (language === 'pcm') return this.removeEmojis(`You are welcome${namePart}! God bless your harvest and your family. ${this.getRandomProverb()} ${blessing}`);
        if (language === 'tw') return this.removeEmojis(`Meda wo ase${namePart}! Yeda Mo ne wo ase ena wo fameli nyinaa. ${this.getRandomProverb()} ${blessing}`);
        return this.removeEmojis(`You are welcome${namePart}! God bless your harvest and your family. ${this.getRandomProverb()} ${blessing}`);
      }
      if (language === 'pcm') return this.removeEmojis(`Goodbye${namePart}. Rest well and return to your farm with strength tomorrow. ${this.getRandomEmpathy()} ${blessing}`);
      if (language === 'tw') return this.removeEmojis(`Te kwa${namePart}. Te kom nyee nyee na san beka wo mfarm bio obesan. ${this.getRandomEmpathy()} ${blessing}`);
      return this.removeEmojis(`Goodbye${namePart}. Rest well and return to your farm with strength tomorrow. ${this.getRandomEmpathy()} ${blessing}`);
    }

    // ✅ STEP 7: OFF-TOPIC REDIRECTION (POLITE + PERSONAL)
    if (this.isOffTopic(q)) {
      const namePart = this.userName ? `, ${this.userName}` : '';
      if (language === 'pcm') return this.removeEmojis(`I specialize in Ghanaian farming advice${namePart}. Even if you asked about weather or cooking, I can connect it to your farm. How can I help your crops, livestock, or soil today? ${this.getRandomProverb()}`);
      if (language === 'tw') return this.removeEmojis(`Mewo ho ma mmeye a wode be ye adwuma wo Ghana mu${namePart}. Se woka wo ha edu edu anaa adwuma a wobeye mu, mebisa wo sena ebo wo mfarm. Ebye den na mebo wo ho? ${this.getRandomProverb()}`);
      return this.removeEmojis(`I specialize in Ghanaian farming advice${namePart}. Even if you asked about weather or cooking, I can connect it to your farm. How can I help your crops, livestock, or soil today? ${this.getRandomProverb()}`);
    }

    // ✅ STEP 8: DETECT TONE AND ADJUST RESPONSE WARMTH
    const tone = this.detectTone(question);
    const warmthLevel = tone === 'frustrated' ? 'extra' : tone === 'happy' ? 'celebratory' : 'normal';

    // ✅ STEP 9: CHECK FOR QUICK MODE (SMS-STYLE SHORT RESPONSES)
    const isQuick = this.isQuickMode(question);
    
    // ✅ STEP 10: DETECT WEATHER CONTEXT FOR RELEVANT ADVICE
    const weatherContext = this.detectWeatherContext(question);

    // ✅ STEPS 11-17: AGRICULTURE QUESTIONS (NATURAL SPEECH FLOW + ALL PREMIUM FEATURES)
    const relevantTopics = [];
    for (const [topic, data] of Object.entries(this.knowledgeBase)) {
      if (data.keywords.some(keyword => q.includes(keyword))) {
        relevantTopics.push(data.advice);
      }
    }

    if (relevantTopics.length > 0) {
      let response = '';
      const namePart = this.userName ? `${this.userName}, ` : '';
      
      if (cropType && (q.includes('grow') || q.includes('fertilizer') || q.includes('yield') || q.includes('plant'))) {
        response += `For your ${cropType} crop${this.userName ? `, ${this.userName}` : ''}, `;
      }
      
      // ✅ Add relevant advice
      response += relevantTopics.join(' ');
      
      // ✅ Add weather-aware advice if context detected
      if (weatherContext) {
        const weatherAdvice = {
          rain: " Since you mentioned rain, remember: create drainage channels to prevent waterlogging - standing water causes root rot in 48 hours.",
          drought: " Since you mentioned dry conditions, remember: mulch with dry grass 5cm thick to retain soil moisture during dry spells.",
          harmattan: " Since you mentioned harmattan, remember: increase watering frequency - dust reduces soil moisture significantly.",
          cool: " Since you mentioned cool weather, remember: this is perfect time for planting - soil is moist and temperatures are ideal."
        };
        response += weatherAdvice[weatherContext] || '';
      }
      
      // ✅ Add community wisdom
      response += ` ${this.getCommunityWisdom(cropType)}`;
      
      // ✅ Add follow-up reminder if applicable
      const daysSinceLast = this.lastInteractionTime ? Math.floor((new Date() - this.lastInteractionTime) / (1000 * 60 * 60 * 24)) : 0;
      const followUp = this.getFollowUpReminder(cropType, daysSinceLast);
      if (followUp) {
        response += ` 📅 Reminder: ${followUp}`;
      }
      
      // ✅ Add sensory description for vividness
      response = this.addSensoryDescription(response, cropType);
      
      // ✅ Safety reminders (always include)
      if (q.includes('pesticide') || q.includes('chemical') || q.includes('spray')) {
        response += ` Remember to always wear gloves and long sleeves when handling chemicals. Never spray during hot sun between 8am and 4pm. Wash thoroughly after spraying. Keep children and animals away from sprayed fields for 24 hours.`;
      }
      
      // ✅ Emergency protocol
      if (q.includes('mosaic') || q.includes('outbreak') || q.includes('emergency')) {
        response += ` EMERGENCY: Uproot and burn infected plants immediately. Do not compost diseased material. Call MoFA Pest Hotline NOW at 0244 123 456. Warn your neighbors. ${this.getEmergencyContacts()}`;
      }
      
      // ✅ Add confidence level indicator
      const confidence = this.confidenceLevels.high; // Default to high for agriculture advice
      response = `${confidence.prefix}${response}${confidence.suffix}`;
      
      // ✅ Add cultural blessing at end
      const blessing = this.addCulturalBlessing(language, { success: true });
      response += ` ${blessing}`;
      
      // ✅ Add regional advice if user's region is known
      if (this.userRegion) {
        const regionalAdvice = this.getRegionalAdvice(this.userRegion, language);
        response += ` For your ${this.userRegion} region: ${regionalAdvice}`;
      }
      
      // ✅ Add daily tip + proverb
      response += ` ${this.getRandomProverb()} ${this.getDailyTip()}`;
      
      // ✅ Add call-to-action for personalized help
      response += ` For personalized advice, visit your district MoFA office on weekdays from 8am to 4pm. Or call MoFA Headquarters at 0302 663 911.`;
      
      // ✅ If quick mode requested, shorten response
      if (isQuick) {
        // Extract just the core advice (first sentence + key action)
        const sentences = response.split('. ');
        const core = sentences.slice(0, 2).join('. ') + '.';
        return this.removeEmojis(`${core} (Type "more" for full details)`);
      }
      
      return this.removeEmojis(response);
    }

    // ✅ STEP 18: VAGUE QUESTIONS (HELPFUL + PERSONAL + TONE-AWARE)
    if (q.includes('help') || q.includes('advice') || q.includes('problem') || q.includes('issue')) {
      const namePart = this.userName ? `, ${this.userName}` : '';
      const toneAdjustment = tone === 'frustrated' ? "I hear you, and I'm here to help. " : 
                           tone === 'confused' ? "Let me break this down simply for you. " : "";
      
      if (language === 'pcm') {
        return this.removeEmojis(`${toneAdjustment}I understand farming can be difficult${namePart}. Please describe your situation. For example: "my maize leaves are turning yellow", or "how to control pests on cassava without chemicals", or "best time to plant yam in Ashanti region", or "my cassava has mosaic disease". I will give you practical, safety-conscious advice for Ghanaian farms. ${this.getRandomEmpathy()} ${this.getRandomProverb()} ${this.addCulturalBlessing(language, { struggle: true })}`);
      }
      if (language === 'tw') {
        return this.removeEmojis(`${toneAdjustment}Mete ase se mmeye ye adwuma a eye den${namePart}. Ka wo mfarm ho kyerɛkyerɛ. Nnso ka me ho mmɛyɛ me wo ha mmɛyɛ no ye adwuma, anaa ebye den na meye mmra nsoa wo mmɛyɛ no mu nndi nkyem, anaa ehe na mebe ye mmɛyɛ no wo Ashanti ntam, anaa mmɛyɛ me wo ha kookoo no wo ha mosaic disease mebe ye den. Mema wo nkwagye a wobeye adwuma wo Ghana mu. ${this.getRandomEmpathy()} ${this.getRandomProverb()} ${this.addCulturalBlessing(language, { struggle: true })}`);
      }
      return this.removeEmojis(`${toneAdjustment}I understand farming can be difficult${namePart}. Please describe your situation. For example: "my maize leaves are turning yellow", or "how to control pests on cassava without chemicals", or "best time to plant yam in Ashanti region", or "my cassava has mosaic disease". I will give you practical, safety-conscious advice for Ghanaian farms. ${this.getRandomEmpathy()} ${this.getRandomProverb()} ${this.addCulturalBlessing(language, { struggle: true })}`);
    }

    // ✅ STEP 19: CROP FAILURE EMPATHY (PERSONAL + WARM + TONE-AWARE)
    if (q.includes('failed') || q.includes('died') || q.includes('no yield')) {
      const namePart = this.userName ? `, ${this.userName}` : '';
      const empathyBoost = tone === 'frustrated' ? "I know this is frustrating, and I'm truly sorry. " : 
                          tone === 'sad' ? "My heart goes out to you. " : "";
      
      if (language === 'pcm') {
        return this.removeEmojis(`${empathyBoost}I am sorry your crops struggled${namePart}. Farming depends on many things beyond our control like rain, pests, and soil conditions. This is not your fault. Many Ghanaian farmers face this challenge. Tell me what happened to your crops so I can help you plan better for next season. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language, { struggle: true })}`);
      }
      if (language === 'tw') {
        return this.removeEmojis(`${empathyBoost}Meso wo ase se wo mmɛyɛ no hwee${namePart}. Mmɛyɛ ye adwuma a ewo nea ensɔ wo ho edu mmra ne edu edu. Saa nkyem yi nni wo nkyem. Mmɛyɛfoɔ Ghana nyinaa wo ha saa eberɛ yi. Ka me ho den na aye wo mmɛyɛ no hwee na mebo wo ho senawo be ye pɛ ebesan. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language, { struggle: true })}`);
      }
      return this.removeEmojis(`${empathyBoost}I am sorry your crops struggled${namePart}. Farming depends on many things beyond our control like rain, pests, and soil conditions. This is not your fault. Many Ghanaian farmers face this challenge. Tell me what happened to your crops so I can help you plan better for next season. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language, { struggle: true })}`);
    }

    // ✅ FINAL FALLBACK (WARM, PERSONAL, HELPFUL + ALL PREMIUM FEATURES)
    const isFirstInteraction = !lastMessages || lastMessages.length === 0;
    const namePart = this.userName ? `, ${this.userName}` : '';
    const introPart = isFirstInteraction 
      ? (language === 'pcm' ? `I am AgriPal, your farming assistant for Ghana. ` : 
         language === 'tw' ? `Meye AgriPal, wo mfarm adwuma ma Ghana. ` : 
         `I am AgriPal, your farming assistant for Ghana. `)
      : '';
    
    // ✅ Add tone-aware opening
    const toneOpener = tone === 'frustrated' ? "I'm here to help, no judgment. " : 
                      tone === 'confused' ? "Let me make this simple for you. " : "";
    
    if (language === 'pcm') {
      return this.removeEmojis(`${toneOpener}${introPart}I can help with crop problems for maize, cassava, yam and rice${namePart}. I give advice on pest and disease control using safe methods. I help with soil fertility and fertilizer use. I share planting and harvesting schedules for your region. Tell me about your farm today. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language)}`);
    }
    if (language === 'tw') {
      return this.removeEmojis(`${toneOpener}${introPart}Mewo ho ma wo mmoa wɔ mmɛyɛ mmɛyɛ mmɛyɛ kookoo ji ne arsa mu${namePart}. Mema wo nkwagye wɔ mmra ne mmɛyɛ mmɛyɛ mu wɔ mmɛyɛ a wobeye adwuma mu. Mema wo nkwagye wɔ edu edu ne mmɛyɛ mmɛyɛ mu. Ka me ho wɔ wo mfarm mu tee. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language)}`);
    }
    return this.removeEmojis(`${toneOpener}${introPart}I can help with crop problems for maize, cassava, yam and rice${namePart}. I give advice on pest and disease control using safe methods. I help with soil fertility and fertilizer use. I share planting and harvesting schedules for your region. Tell me about your farm today. ${this.getRandomProverb()} ${this.getRandomEmpathy()} ${this.addCulturalBlessing(language)}`);
  }
}

module.exports = new AIService();