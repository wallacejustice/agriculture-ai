const FarmerProfile = require('../models/FarmerProfile');
const SuccessStory = require('../models/SuccessStory');
const Conversation = require('../models/Conversation');

// ✅ CREATE/UPDATE FARMER PROFILE
const createOrUpdateProfile = async (req, res) => {
  try {
    const { region, district, crops, experience, locationSharing = false } = req.body;
    
    if (!region || !crops || crops.length === 0 || experience === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Region, crops, and experience are required' 
      });
    }

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        region, 
        district, 
        crops, 
        experience, 
        locationSharing,
        $setOnInsert: { badges: [] }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate('successStories');

    res.status(200).json({ 
      success: true, 
      data: { profile } 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save profile' 
    });
  }
};

// ✅ VERIFY AI ADVICE ("This Helped Me")
const verifyAdvice = async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    
    if (!conversationId || !messageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Conversation and message IDs required' 
      });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }

    // Update farmer profile
    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { 
        $addToSet: { 
          verifiedAdvice: { 
            conversationId, 
            messageId,
            timestamp: new Date() 
          } 
        }
      },
      { new: true, upsert: true }
    );

    // Award badge if first verification
    if (profile.verifiedAdvice.length === 1 && !profile.badges.includes('Community Helper')) {
      profile.badges.push('Community Helper');
      await profile.save();
    }

    res.status(200).json({ 
      success: true,
      data: { 
        message: 'Advice verified! Thank you for helping other farmers.',
        verificationCount: profile.verifiedAdvice.length,
        newBadge: profile.badges.includes('Community Helper') ? 'Community Helper' : null
      }
    });
  } catch (error) {
    console.error('Verify advice error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify advice' 
    });
  }
};

// ✅ GET NEARBY FARMERS (opt-in only)
const getNearbyFarmers = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    
    if (!profile || !profile.locationSharing) {
      return res.status(403).json({ 
        success: false, 
        message: 'Enable location sharing in your profile to see nearby farmers' 
      });
    }

    const nearby = await FarmerProfile.find({
      region: profile.region,
      locationSharing: true,
      userId: { $ne: req.user._id } // Exclude self
    })
    .select('userId crops experience badges')
    .limit(10)
    .populate('userId', 'name');

    res.status(200).json({ 
      success: true,
      data: { 
        farmers: nearby.map(f => ({
          name: f.userId.name,
          crops: f.crops,
          experience: f.experience,
          badges: f.badges,
          region: profile.region
        })),
        count: nearby.length
      }
    });
  } catch (error) {
    console.error('Nearby farmers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load nearby farmers' 
    });
  }
};

// ✅ CREATE SUCCESS STORY
const createSuccessStory = async (req, res) => {
  try {
    const { title, story, crop } = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : null;
    
    if (!title || !story || !crop) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, story, and crop are required' 
      });
    }

    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complete your farmer profile first' 
      });
    }

    const newStory = await SuccessStory.create({
      farmerProfile: profile._id,
      title,
      story,
      crop,
      image: image ? `data:image/jpeg;base64,${image}` : null
    });

    // Add to profile
    profile.successStories.push(newStory._id);
    await profile.save();

    res.status(201).json({ 
      success: true,
      data: { story: newStory }
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create success story' 
    });
  }
};

// ✅ GET SUCCESS STORIES (with verification counts)
const getSuccessStories = async (req, res) => {
  try {
    const { crop, limit = 10, page = 1 } = req.query;
    
    const query = crop ? { crop } : {};
    const stories = await SuccessStory.find(query)
      .sort({ likes: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('farmerProfile', 'region crops experience badges')
      .lean();

    const total = await SuccessStory.countDocuments(query);

    // Add verification counts
    const storiesWithVerification = stories.map(story => ({
      ...story,
      verificationCount: story.verifiedByFarmers.length,
      farmerRegion: story.farmerProfile.region
    }));

    res.status(200).json({ 
      success: true,
      data: { 
        stories: storiesWithVerification,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load success stories' 
    });
  }
};

// ✅ LIKE/VERIFY SUCCESS STORY
const verifySuccessStory = async (req, res) => {
  try {
    const { storyId } = req.body;
    
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Farmer profile not found' 
      });
    }

    const story = await SuccessStory.findById(storyId);
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    // Check if already verified
    const alreadyVerified = story.verifiedByFarmers.some(v => 
      v.farmerProfile.toString() === profile._id.toString()
    );
    
    if (alreadyVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already verified this story' 
      });
    }

    // Add verification
    story.verifiedByFarmers.push({ farmerProfile: profile._id });
    story.likes += 1;
    await story.save();

    res.status(200).json({ 
      success: true,
      data: { 
        message: 'Story verified! Your support helps other farmers trust this advice.',
        newLikeCount: story.likes,
        verificationCount: story.verifiedByFarmers.length
      }
    });
  } catch (error) {
    console.error('Verify story error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify story' 
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  verifyAdvice,
  getNearbyFarmers,
  createSuccessStory,
  getSuccessStories,
  verifySuccessStory
};