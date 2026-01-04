/**
 * Studio36 OS - Visibility & Marketing Module
 * Adaptive feed smart targeting via MrketOS
 * Social media integration and referral campaigns
 */

class VisibilityManager {
  constructor() {
    this.mrketOS = new MrketOSIntegration();
    this.socialMediaLinks = new Map();
    this.referralCampaigns = new Map();
    this.targetingRules = new Map();
    this.vendorPromotions = new Map();
    this.initializeTargetingRules();
    console.log('VisibilityManager initialized');
  }

  initializeTargetingRules() {
    // Adaptive feed targeting rules
    this.targetingRules.set('search_based', {
      name: 'Search-Based Targeting',
      description: 'Promote vendors based on user search queries',
      priority: 1,
      apply: (vendor, userContext) => this.matchSearchQuery(vendor, userContext)
    });

    this.targetingRules.set('project_based', {
      name: 'Project-Based Targeting',
      description: 'Recommend vendors based on project requirements',
      priority: 2,
      apply: (vendor, userContext) => this.matchProjectNeeds(vendor, userContext)
    });

    this.targetingRules.set('location_based', {
      name: 'Location-Based Targeting',
      description: 'Prioritize vendors in user\'s region',
      priority: 3,
      apply: (vendor, userContext) => this.matchLocation(vendor, userContext)
    });

    this.targetingRules.set('behavior_based', {
      name: 'Behavior-Based Targeting',
      description: 'Target based on user browsing and interaction patterns',
      priority: 4,
      apply: (vendor, userContext) => this.matchBehavior(vendor, userContext)
    });

    this.targetingRules.set('budget_based', {
      name: 'Budget-Based Targeting',
      description: 'Match vendors to user\'s budget range',
      priority: 5,
      apply: (vendor, userContext) => this.matchBudget(vendor, userContext)
    });
  }

  /**
   * Get adaptive feed for user via MrketOS
   * @param {string} userId - User identifier
   * @param {Object} userContext - User context data
   * @returns {Object} Personalized vendor feed
   */
  async getAdaptiveFeed(userId, userContext = {}) {
    const {
      searchQuery = '',
      projectType = '',
      region = '',
      budget = null,
      recentViews = [],
      preferences = {},
      limit = 20
    } = userContext;

    // Get vendor recommendations from MrketOS
    const recommendations = await this.mrketOS.getRecommendations({
      userId,
      searchQuery,
      projectType,
      region,
      budget,
      recentViews,
      preferences
    });

    // Apply targeting rules to score vendors
    const scoredVendors = recommendations.map(vendor => ({
      ...vendor,
      relevanceScore: this.calculateRelevanceScore(vendor, userContext),
      promotionStatus: this.getPromotionStatus(vendor.id)
    }));

    // Sort by relevance and promotion status
    scoredVendors.sort((a, b) => {
      // Promoted vendors get priority boost
      if (a.promotionStatus.active && !b.promotionStatus.active) return -1;
      if (!a.promotionStatus.active && b.promotionStatus.active) return 1;
      return b.relevanceScore - a.relevanceScore;
    });

    return {
      userId,
      feed: scoredVendors.slice(0, limit),
      totalResults: scoredVendors.length,
      context: {
        searchQuery,
        projectType,
        region
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate vendor relevance score
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Relevance score (0-100)
   */
  calculateRelevanceScore(vendor, userContext) {
    let score = 50; // Base score

    // Apply each targeting rule
    this.targetingRules.forEach((rule, key) => {
      const ruleScore = rule.apply(vendor, userContext);
      score += ruleScore * (1 / rule.priority); // Higher priority = more weight
    });

    // Cap score between 0 and 100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Match vendor to search query
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Score contribution
   */
  matchSearchQuery(vendor, userContext) {
    if (!userContext.searchQuery) return 0;

    const query = userContext.searchQuery.toLowerCase();
    const vendorText = `${vendor.name} ${vendor.category} ${vendor.description || ''}`.toLowerCase();

    if (vendorText.includes(query)) return 20;
    
    const queryWords = query.split(' ');
    const matches = queryWords.filter(word => vendorText.includes(word)).length;
    return Math.min(15, matches * 5);
  }

  /**
   * Match vendor to project needs
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Score contribution
   */
  matchProjectNeeds(vendor, userContext) {
    if (!userContext.projectType) return 0;

    const projectTypes = {
      'residential': ['furniture', 'flooring', 'lighting', 'textiles'],
      'commercial': ['office_furniture', 'lighting', 'fixtures', 'flooring'],
      'hospitality': ['furniture', 'textiles', 'lighting', 'decorative'],
      'retail': ['displays', 'lighting', 'signage', 'flooring']
    };

    const relevantCategories = projectTypes[userContext.projectType] || [];
    if (relevantCategories.includes(vendor.category)) return 15;
    return 0;
  }

  /**
   * Match vendor to user location
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Score contribution
   */
  matchLocation(vendor, userContext) {
    if (!userContext.region || !vendor.regions) return 0;

    if (vendor.regions.includes(userContext.region)) return 10;
    
    // Check for nearby regions
    const regionGroups = {
      'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah'],
      'GCC': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
      'MENA': ['UAE', 'Saudi Arabia', 'Egypt', 'Jordan', 'Lebanon']
    };

    for (const [group, regions] of Object.entries(regionGroups)) {
      if (regions.includes(userContext.region) && 
          vendor.regions.some(r => regions.includes(r))) {
        return 5;
      }
    }

    return 0;
  }

  /**
   * Match vendor based on user behavior
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Score contribution
   */
  matchBehavior(vendor, userContext) {
    if (!userContext.recentViews || userContext.recentViews.length === 0) return 0;

    // Check if vendor category matches recent views
    const viewedCategories = userContext.recentViews.map(v => v.category);
    if (viewedCategories.includes(vendor.category)) return 10;

    return 0;
  }

  /**
   * Match vendor to budget
   * @param {Object} vendor - Vendor data
   * @param {Object} userContext - User context
   * @returns {number} Score contribution
   */
  matchBudget(vendor, userContext) {
    if (!userContext.budget || !vendor.priceRange) return 0;

    const budgetRanges = {
      'low': [0, 10000],
      'medium': [10000, 50000],
      'high': [50000, 200000],
      'luxury': [200000, Infinity]
    };

    const userRange = budgetRanges[userContext.budget];
    const vendorRange = budgetRanges[vendor.priceRange];

    if (userRange && vendorRange) {
      // Check for overlap
      if (userRange[0] <= vendorRange[1] && vendorRange[0] <= userRange[1]) {
        return 10;
      }
    }

    return 0;
  }

  /**
   * Get promotion status for vendor
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} Promotion status
   */
  getPromotionStatus(vendorId) {
    const promotion = this.vendorPromotions.get(vendorId);
    if (!promotion) {
      return { active: false };
    }

    const now = new Date();
    const isActive = new Date(promotion.startDate) <= now && 
                     new Date(promotion.endDate) >= now;

    return {
      active: isActive,
      type: promotion.type,
      boostLevel: promotion.boostLevel,
      expiresAt: promotion.endDate
    };
  }

  /**
   * Link social media accounts to vendor profile
   * @param {string} vendorId - Vendor identifier
   * @param {Object} socialAccounts - Social media accounts
   * @returns {Object} Linking result
   */
  async linkSocialMedia(vendorId, socialAccounts) {
    const {
      linkedin = '',
      instagram = '',
      facebook = '',
      twitter = '',
      pinterest = '',
      youtube = ''
    } = socialAccounts;

    const links = {
      vendorId,
      accounts: {
        linkedin: this.validateSocialUrl(linkedin, 'linkedin'),
        instagram: this.validateSocialUrl(instagram, 'instagram'),
        facebook: this.validateSocialUrl(facebook, 'facebook'),
        twitter: this.validateSocialUrl(twitter, 'twitter'),
        pinterest: this.validateSocialUrl(pinterest, 'pinterest'),
        youtube: this.validateSocialUrl(youtube, 'youtube')
      },
      verified: {},
      linkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate and store links
    this.socialMediaLinks.set(vendorId, links);

    // Get follower counts (simulated)
    const stats = await this.getSocialMediaStats(links.accounts);

    return {
      success: true,
      vendorId,
      linkedAccounts: Object.keys(links.accounts).filter(k => links.accounts[k]),
      stats,
      message: 'Social media accounts linked successfully'
    };
  }

  /**
   * Validate social media URL
   * @param {string} url - URL to validate
   * @param {string} platform - Platform name
   * @returns {string|null} Validated URL or null
   */
  validateSocialUrl(url, platform) {
    if (!url) return null;

    const patterns = {
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in)\/[\w-]+\/?$/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.-]+\/?$/,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]+\/?$/,
      twitter: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[\w]+\/?$/,
      pinterest: /^(https?:\/\/)?(www\.)?pinterest\.com\/[\w]+\/?$/,
      youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|@)?[\w-]+\/?$/
    };

    const pattern = patterns[platform];
    if (pattern && pattern.test(url)) {
      return url;
    }

    // Try to fix common issues
    if (!url.startsWith('http')) {
      url = 'https://' + url;
      if (pattern && pattern.test(url)) {
        return url;
      }
    }

    return null;
  }

  /**
   * Get social media statistics
   * @param {Object} accounts - Social media accounts
   * @returns {Object} Statistics
   */
  async getSocialMediaStats(accounts) {
    // Simulated social media stats
    const stats = {};

    Object.entries(accounts).forEach(([platform, url]) => {
      if (url) {
        stats[platform] = {
          followers: Math.floor(Math.random() * 10000) + 100,
          engagement: (Math.random() * 5 + 1).toFixed(2) + '%',
          verified: Math.random() > 0.7
        };
      }
    });

    return stats;
  }

  /**
   * Create referral campaign
   * @param {Object} campaignData - Campaign configuration
   * @returns {Object} Created campaign
   */
  async createReferralCampaign(campaignData) {
    const {
      vendorId,
      campaignName,
      campaignType = 'standard', // standard, boost, featured
      targetAudience = [],
      startDate,
      endDate,
      budget = null,
      goals = {},
      connectedSystems = [] // e.g., ['FoodieGadi']
    } = campaignData;

    if (!vendorId || !campaignName || !startDate || !endDate) {
      throw new Error('Missing required fields: vendorId, campaignName, startDate, and endDate are required');
    }

    const campaignId = this.generateCampaignId();

    const campaign = {
      id: campaignId,
      vendorId,
      campaignName,
      campaignType,
      targetAudience,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      budget,
      goals: {
        impressions: goals.impressions || 1000,
        clicks: goals.clicks || 100,
        conversions: goals.conversions || 10
      },
      connectedSystems,
      status: 'scheduled',
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        referrals: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.referralCampaigns.set(campaignId, campaign);

    // Set up promotion for adaptive feed
    this.vendorPromotions.set(vendorId, {
      campaignId,
      type: campaignType,
      boostLevel: this.getBoostLevel(campaignType),
      startDate: campaign.startDate,
      endDate: campaign.endDate
    });

    return {
      success: true,
      campaignId,
      campaign,
      message: 'Referral campaign created successfully'
    };
  }

  /**
   * Get boost level for campaign type
   * @param {string} campaignType - Campaign type
   * @returns {number} Boost level (1-10)
   */
  getBoostLevel(campaignType) {
    const levels = {
      'standard': 3,
      'boost': 6,
      'featured': 9
    };
    return levels[campaignType] || 3;
  }

  /**
   * Get campaign metrics
   * @param {string} campaignId - Campaign identifier
   * @returns {Object} Campaign metrics
   */
  getCampaignMetrics(campaignId) {
    const campaign = this.referralCampaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Calculate performance
    const goalProgress = {
      impressions: (campaign.metrics.impressions / campaign.goals.impressions * 100).toFixed(1) + '%',
      clicks: (campaign.metrics.clicks / campaign.goals.clicks * 100).toFixed(1) + '%',
      conversions: (campaign.metrics.conversions / campaign.goals.conversions * 100).toFixed(1) + '%'
    };

    const ctr = campaign.metrics.impressions > 0 
      ? (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2) + '%'
      : '0%';

    const conversionRate = campaign.metrics.clicks > 0
      ? (campaign.metrics.conversions / campaign.metrics.clicks * 100).toFixed(2) + '%'
      : '0%';

    return {
      campaignId,
      campaignName: campaign.campaignName,
      status: campaign.status,
      metrics: campaign.metrics,
      goalProgress,
      performance: {
        ctr,
        conversionRate,
        referralRate: campaign.metrics.referrals + ' referrals generated'
      },
      timeRemaining: this.calculateTimeRemaining(campaign.endDate)
    };
  }

  /**
   * Calculate time remaining for campaign
   * @param {string} endDate - Campaign end date
   * @returns {string} Time remaining
   */
  calculateTimeRemaining(endDate) {
    const remaining = new Date(endDate) - new Date();
    
    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days ${hours} hours`;
    return `${hours} hours`;
  }

  /**
   * Track campaign event
   * @param {string} campaignId - Campaign identifier
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @returns {Object} Tracking result
   */
  trackCampaignEvent(campaignId, eventType, eventData = {}) {
    const campaign = this.referralCampaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const validEvents = ['impression', 'click', 'conversion', 'referral'];
    if (!validEvents.includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    campaign.metrics[eventType + 's'] = (campaign.metrics[eventType + 's'] || 0) + 1;
    campaign.updatedAt = new Date().toISOString();

    return {
      success: true,
      campaignId,
      eventType,
      currentMetrics: campaign.metrics
    };
  }

  /**
   * Get vendor social media links
   * @param {string} vendorId - Vendor identifier
   * @returns {Object|null} Social media links
   */
  getSocialMediaLinks(vendorId) {
    return this.socialMediaLinks.get(vendorId) || null;
  }

  /**
   * Get active campaigns for vendor
   * @param {string} vendorId - Vendor identifier
   * @returns {Array} Active campaigns
   */
  getVendorCampaigns(vendorId) {
    const campaigns = [];
    this.referralCampaigns.forEach(campaign => {
      if (campaign.vendorId === vendorId) {
        campaigns.push(campaign);
      }
    });
    return campaigns;
  }

  generateCampaignId() {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * MrketOS Integration - Adaptive feed smart targeting
 */
class MrketOSIntegration {
  constructor() {
    this.userProfiles = new Map();
    this.vendorCache = new Map();
    this.recommendationHistory = new Map();
    console.log('MrketOS Integration initialized');
  }

  /**
   * Get personalized vendor recommendations
   * @param {Object} params - Recommendation parameters
   * @returns {Array} Recommended vendors
   */
  async getRecommendations(params) {
    const {
      userId,
      searchQuery,
      projectType,
      region,
      budget,
      recentViews,
      preferences
    } = params;

    // Build user profile
    const userProfile = this.getUserProfile(userId);
    this.updateUserProfile(userId, {
      searchQuery,
      projectType,
      region,
      budget,
      recentViews
    });

    // Generate recommendations based on profile
    const recommendations = await this.generateRecommendations(userProfile, preferences);

    // Store recommendation history
    this.storeRecommendationHistory(userId, recommendations);

    return recommendations;
  }

  /**
   * Get or create user profile
   * @param {string} userId - User identifier
   * @returns {Object} User profile
   */
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        searches: [],
        views: [],
        interactions: [],
        preferences: {},
        segments: [],
        createdAt: new Date().toISOString()
      });
    }
    return this.userProfiles.get(userId);
  }

  /**
   * Update user profile with new data
   * @param {string} userId - User identifier
   * @param {Object} data - Profile update data
   */
  updateUserProfile(userId, data) {
    const profile = this.getUserProfile(userId);

    if (data.searchQuery) {
      profile.searches.push({
        query: data.searchQuery,
        timestamp: new Date().toISOString()
      });
      // Keep last 50 searches
      if (profile.searches.length > 50) {
        profile.searches = profile.searches.slice(-50);
      }
    }

    if (data.recentViews) {
      profile.views = [...profile.views, ...data.recentViews].slice(-100);
    }

    if (data.projectType) {
      profile.preferences.projectType = data.projectType;
    }

    if (data.region) {
      profile.preferences.region = data.region;
    }

    if (data.budget) {
      profile.preferences.budget = data.budget;
    }

    profile.updatedAt = new Date().toISOString();
  }

  /**
   * Generate vendor recommendations
   * @param {Object} userProfile - User profile
   * @param {Object} preferences - Additional preferences
   * @returns {Array} Recommendations
   */
  async generateRecommendations(userProfile, preferences = {}) {
    // Simulated vendor database for recommendations
    const vendorDatabase = [
      { id: 'v1', name: 'Premium Floors Co', category: 'flooring', regions: ['UAE', 'GCC'], priceRange: 'high', rating: 4.8 },
      { id: 'v2', name: 'Modern Lights Inc', category: 'lighting', regions: ['UAE', 'Saudi Arabia'], priceRange: 'medium', rating: 4.5 },
      { id: 'v3', name: 'Elegant Textiles', category: 'textiles', regions: ['UAE', 'Qatar'], priceRange: 'high', rating: 4.7 },
      { id: 'v4', name: 'Office Solutions', category: 'office_furniture', regions: ['UAE', 'Bahrain'], priceRange: 'medium', rating: 4.3 },
      { id: 'v5', name: 'Artisan Decor', category: 'decorative', regions: ['UAE', 'Kuwait'], priceRange: 'high', rating: 4.9 },
      { id: 'v6', name: 'Budget Builders', category: 'fixtures', regions: ['UAE'], priceRange: 'low', rating: 4.0 },
      { id: 'v7', name: 'Luxury Living', category: 'furniture', regions: ['UAE', 'Saudi Arabia', 'Qatar'], priceRange: 'luxury', rating: 4.8 },
      { id: 'v8', name: 'Green Materials', category: 'flooring', regions: ['UAE', 'GCC'], priceRange: 'medium', rating: 4.4 }
    ];

    return vendorDatabase;
  }

  /**
   * Store recommendation history
   * @param {string} userId - User identifier
   * @param {Array} recommendations - Recommendations
   */
  storeRecommendationHistory(userId, recommendations) {
    if (!this.recommendationHistory.has(userId)) {
      this.recommendationHistory.set(userId, []);
    }

    this.recommendationHistory.get(userId).push({
      timestamp: new Date().toISOString(),
      vendorIds: recommendations.map(v => v.id),
      count: recommendations.length
    });

    // Keep last 100 recommendation sessions
    const history = this.recommendationHistory.get(userId);
    if (history.length > 100) {
      this.recommendationHistory.set(userId, history.slice(-100));
    }
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VisibilityManager, MrketOSIntegration };
}

if (typeof window !== 'undefined') {
  window.VisibilityManager = VisibilityManager;
  window.MrketOSIntegration = MrketOSIntegration;
}
