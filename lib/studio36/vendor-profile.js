/**
 * Studio36 OS - Vendor Profile Module
 * Vendor registration, profiles, portfolios, and rating systems
 * Supports premium profiles with priority listing features
 */

class VendorProfileManager {
  constructor() {
    this.vendors = new Map();
    this.portfolios = new Map();
    this.reviews = new Map();
    this.categories = new Map();
    this.initializeCategories();
    console.log('VendorProfileManager initialized');
  }

  initializeCategories() {
    // Vendor category definitions
    this.categories.set('materials', {
      name: 'Materials Supplier',
      subcategories: ['flooring', 'wall_finishes', 'ceiling', 'countertops', 'tiles', 'stone', 'wood', 'metal']
    });

    this.categories.set('furniture', {
      name: 'Furniture Manufacturer',
      subcategories: ['office', 'residential', 'hospitality', 'outdoor', 'custom', 'modular']
    });

    this.categories.set('lighting', {
      name: 'Lighting Solutions',
      subcategories: ['architectural', 'decorative', 'commercial', 'led', 'smart_lighting']
    });

    this.categories.set('textiles', {
      name: 'Textiles & Fabrics',
      subcategories: ['upholstery', 'drapery', 'carpet', 'rugs', 'wall_coverings']
    });

    this.categories.set('fixtures', {
      name: 'Fixtures & Fittings',
      subcategories: ['bathroom', 'kitchen', 'hardware', 'door_systems', 'glass']
    });

    this.categories.set('contractors', {
      name: 'Contractors',
      subcategories: ['general', 'specialized', 'installation', 'maintenance', 'renovation']
    });

    this.categories.set('aesthetic_suppliers', {
      name: 'Aesthetic Suppliers',
      subcategories: ['art', 'accessories', 'plants', 'signage', 'custom_elements']
    });

    this.categories.set('bulk_suppliers', {
      name: 'Bulk Suppliers',
      subcategories: ['construction_materials', 'wholesale', 'industrial', 'raw_materials']
    });
  }

  /**
   * Register a new vendor
   * @param {Object} vendorData - Vendor registration data
   * @returns {Object} Registration result
   */
  async registerVendor(vendorData) {
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      category,
      subcategories = [],
      manufacturingCapabilities = [],
      certifications = [],
      regions = [],
      description = '',
      website = '',
      socialMedia = {}
    } = vendorData;

    // Validate required fields
    if (!companyName || !email || !category) {
      throw new Error('Missing required fields: companyName, email, and category are required');
    }

    // Validate category
    if (!this.categories.has(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    const vendorId = this.generateVendorId();

    const vendor = {
      id: vendorId,
      companyName,
      contactName,
      email,
      phone,
      address,
      category,
      subcategories,
      manufacturingCapabilities,
      certifications,
      regions,
      description,
      website,
      socialMedia: {
        linkedin: socialMedia.linkedin || '',
        instagram: socialMedia.instagram || '',
        facebook: socialMedia.facebook || '',
        twitter: socialMedia.twitter || ''
      },
      profileType: 'standard', // standard, verified, premium
      status: 'pending_verification',
      rating: {
        average: 0,
        count: 0,
        breakdown: {
          quality: 0,
          delivery: 0,
          communication: 0,
          value: 0
        }
      },
      priorityListing: false,
      verified: false,
      portfolio: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.vendors.set(vendorId, vendor);

    return {
      success: true,
      vendorId,
      vendor,
      message: 'Vendor registered successfully. Pending verification.',
      nextSteps: [
        'Upload portfolio with products/services',
        'Complete verification process',
        'Consider premium upgrade for priority listing'
      ]
    };
  }

  /**
   * Upload vendor portfolio
   * @param {string} vendorId - Vendor identifier
   * @param {Object} portfolioData - Portfolio content
   * @returns {Object} Upload result
   */
  async uploadPortfolio(vendorId, portfolioData) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const {
      products = [],
      projects = [],
      catalogUrl = '',
      brochures = [],
      videos = []
    } = portfolioData;

    const portfolioId = `portfolio_${vendorId}`;

    const portfolio = {
      id: portfolioId,
      vendorId,
      products: products.map(product => ({
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: product.name,
        description: product.description || '',
        category: product.category,
        images: product.images || [],
        specifications: product.specifications || {},
        priceRange: product.priceRange || null,
        availability: product.availability || 'available',
        leadTime: product.leadTime || null,
        moq: product.moq || 1, // Minimum order quantity
        sampleAvailable: product.sampleAvailable !== false
      })),
      projects: projects.map(project => ({
        id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: project.name,
        description: project.description || '',
        type: project.type,
        images: project.images || [],
        location: project.location || '',
        completedDate: project.completedDate || null,
        client: project.client || '',
        testimonial: project.testimonial || null
      })),
      catalogUrl,
      brochures,
      videos,
      stats: {
        totalProducts: products.length,
        totalProjects: projects.length,
        lastUpdated: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.portfolios.set(portfolioId, portfolio);
    vendor.portfolio = portfolioId;
    vendor.updatedAt = new Date().toISOString();

    return {
      success: true,
      portfolioId,
      portfolio,
      stats: portfolio.stats
    };
  }

  /**
   * Upgrade to premium profile
   * @param {string} vendorId - Vendor identifier
   * @param {Object} premiumOptions - Premium features selection
   * @returns {Object} Upgrade result
   */
  async upgradeToPremium(vendorId, premiumOptions = {}) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const {
      tier = 'premium', // premium, elite
      features = []
    } = premiumOptions;

    const premiumFeatures = {
      premium: [
        'priority_listing',
        'featured_badge',
        'enhanced_analytics',
        'sample_request_priority',
        'monthly_spotlight'
      ],
      elite: [
        'priority_listing',
        'featured_badge',
        'enhanced_analytics',
        'sample_request_priority',
        'weekly_spotlight',
        'dedicated_support',
        'custom_landing_page',
        'api_integration',
        'bulk_order_discounts'
      ]
    };

    vendor.profileType = tier;
    vendor.priorityListing = true;
    vendor.premiumFeatures = premiumFeatures[tier] || premiumFeatures.premium;
    vendor.premiumActivatedAt = new Date().toISOString();
    vendor.updatedAt = new Date().toISOString();

    return {
      success: true,
      vendorId,
      profileType: tier,
      features: vendor.premiumFeatures,
      benefits: {
        priorityListing: 'Appear at the top of search results',
        featuredBadge: 'Display verified premium badge',
        enhancedAnalytics: 'Access detailed profile analytics',
        sampleRequestPriority: 'Priority handling for sample requests'
      }
    };
  }

  /**
   * Verify vendor profile
   * @param {string} vendorId - Vendor identifier
   * @param {Object} verificationData - Verification documents
   * @returns {Object} Verification result
   */
  async verifyVendor(vendorId, verificationData = {}) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    // Simulated verification process
    vendor.verified = true;
    vendor.status = 'active';
    vendor.verificationDate = new Date().toISOString();
    vendor.updatedAt = new Date().toISOString();

    return {
      success: true,
      vendorId,
      verified: true,
      status: 'active',
      message: 'Vendor profile verified successfully'
    };
  }

  /**
   * Add review for vendor
   * @param {string} vendorId - Vendor identifier
   * @param {Object} reviewData - Review content
   * @returns {Object} Review result
   */
  async addReview(vendorId, reviewData) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const {
      reviewerId,
      reviewerName,
      projectId,
      ratings, // { quality, delivery, communication, value }
      comment = '',
      recommendation = true
    } = reviewData;

    if (!reviewerId || !ratings) {
      throw new Error('Missing required fields: reviewerId and ratings are required');
    }

    // Validate ratings (1-5 scale)
    const ratingFields = ['quality', 'delivery', 'communication', 'value'];
    for (const field of ratingFields) {
      if (ratings[field] < 1 || ratings[field] > 5) {
        throw new Error(`Rating for ${field} must be between 1 and 5`);
      }
    }

    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const overallRating = (ratings.quality + ratings.delivery + ratings.communication + ratings.value) / 4;

    const review = {
      id: reviewId,
      vendorId,
      reviewerId,
      reviewerName,
      projectId,
      ratings,
      overallRating,
      comment,
      recommendation,
      verified: false, // Set to true after verification
      helpful: 0,
      createdAt: new Date().toISOString()
    };

    // Store review
    if (!this.reviews.has(vendorId)) {
      this.reviews.set(vendorId, []);
    }
    this.reviews.get(vendorId).push(review);

    // Update vendor rating
    this.updateVendorRating(vendorId);

    return {
      success: true,
      reviewId,
      review,
      vendorRating: vendor.rating
    };
  }

  /**
   * Update vendor rating based on reviews
   * @param {string} vendorId - Vendor identifier
   */
  updateVendorRating(vendorId) {
    const vendor = this.vendors.get(vendorId);
    const vendorReviews = this.reviews.get(vendorId) || [];

    if (vendorReviews.length === 0) {
      return;
    }

    const totals = { quality: 0, delivery: 0, communication: 0, value: 0, overall: 0 };
    
    vendorReviews.forEach(review => {
      totals.quality += review.ratings.quality;
      totals.delivery += review.ratings.delivery;
      totals.communication += review.ratings.communication;
      totals.value += review.ratings.value;
      totals.overall += review.overallRating;
    });

    const count = vendorReviews.length;

    vendor.rating = {
      average: Math.round((totals.overall / count) * 10) / 10,
      count,
      breakdown: {
        quality: Math.round((totals.quality / count) * 10) / 10,
        delivery: Math.round((totals.delivery / count) * 10) / 10,
        communication: Math.round((totals.communication / count) * 10) / 10,
        value: Math.round((totals.value / count) * 10) / 10
      }
    };

    vendor.updatedAt = new Date().toISOString();
  }

  /**
   * Get vendor profile
   * @param {string} vendorId - Vendor identifier
   * @returns {Object|null} Vendor profile
   */
  getVendor(vendorId) {
    return this.vendors.get(vendorId) || null;
  }

  /**
   * Get vendor with portfolio and reviews
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} Complete vendor profile
   */
  getVendorProfile(vendorId) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const portfolio = vendor.portfolio ? this.portfolios.get(vendor.portfolio) : null;
    const reviews = this.reviews.get(vendorId) || [];

    return {
      vendor,
      portfolio,
      reviews: reviews.slice(0, 10), // Latest 10 reviews
      totalReviews: reviews.length
    };
  }

  /**
   * Search vendors by category and filters
   * @param {Object} searchParams - Search parameters
   * @returns {Array} Matching vendors
   */
  searchVendors(searchParams = {}) {
    const {
      category,
      subcategory,
      region,
      minRating,
      verified,
      premium,
      keyword,
      sortBy = 'rating', // rating, name, recent
      limit = 20
    } = searchParams;

    let results = [];

    this.vendors.forEach(vendor => {
      // Apply filters
      if (category && vendor.category !== category) return;
      if (subcategory && !vendor.subcategories.includes(subcategory)) return;
      if (region && !vendor.regions.includes(region)) return;
      if (minRating && vendor.rating.average < minRating) return;
      if (verified && !vendor.verified) return;
      if (premium && vendor.profileType === 'standard') return;
      if (keyword && !this.matchesKeyword(vendor, keyword)) return;

      results.push(vendor);
    });

    // Sort results
    if (sortBy === 'rating') {
      // Premium vendors first, then by rating
      results.sort((a, b) => {
        if (a.priorityListing !== b.priorityListing) {
          return b.priorityListing ? 1 : -1;
        }
        return b.rating.average - a.rating.average;
      });
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sortBy === 'recent') {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return results.slice(0, limit);
  }

  /**
   * Check if vendor matches keyword
   * @param {Object} vendor - Vendor data
   * @param {string} keyword - Search keyword
   * @returns {boolean} Match result
   */
  matchesKeyword(vendor, keyword) {
    const searchText = `${vendor.companyName} ${vendor.description} ${vendor.manufacturingCapabilities.join(' ')}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  }

  /**
   * Get vendor reviews
   * @param {string} vendorId - Vendor identifier
   * @param {Object} options - Pagination options
   * @returns {Object} Reviews with pagination
   */
  getVendorReviews(vendorId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'recent' } = options;
    
    let reviews = this.reviews.get(vendorId) || [];

    // Sort reviews
    if (sortBy === 'recent') {
      reviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'helpful') {
      reviews = [...reviews].sort((a, b) => b.helpful - a.helpful);
    } else if (sortBy === 'highest') {
      reviews = [...reviews].sort((a, b) => b.overallRating - a.overallRating);
    }

    const start = (page - 1) * limit;
    const paginatedReviews = reviews.slice(start, start + limit);

    return {
      reviews: paginatedReviews,
      total: reviews.length,
      page,
      limit,
      totalPages: Math.ceil(reviews.length / limit)
    };
  }

  /**
   * Export vendor data for MaterialHUB integration
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} Export data
   */
  exportToMaterialHUB(vendorId) {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    const portfolio = vendor.portfolio ? this.portfolios.get(vendor.portfolio) : null;

    return {
      vendorId: vendor.id,
      companyName: vendor.companyName,
      category: vendor.category,
      subcategories: vendor.subcategories,
      rating: vendor.rating,
      verified: vendor.verified,
      profileType: vendor.profileType,
      products: portfolio ? portfolio.products : [],
      contact: {
        email: vendor.email,
        phone: vendor.phone,
        website: vendor.website
      },
      exportedAt: new Date().toISOString()
    };
  }

  generateVendorId() {
    return `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VendorProfileManager };
}

if (typeof window !== 'undefined') {
  window.VendorProfileManager = VendorProfileManager;
}
