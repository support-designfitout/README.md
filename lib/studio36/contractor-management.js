/**
 * Studio36 OS - Contractor Management Module
 * Vendor booking system, scheduling automation, and category-specific search
 * Integration with LayrOps vendor systems
 */

class ContractorManager {
  constructor() {
    this.contractors = new Map();
    this.bookings = new Map();
    this.schedules = new Map();
    this.availability = new Map();
    this.searchPortals = new Map();
    this.layrOpsScheduler = new LayrOpsScheduler();
    this.initializeSearchPortals();
    console.log('ContractorManager initialized');
  }

  initializeSearchPortals() {
    // Category-specific search portal configurations
    this.searchPortals.set('aesthetic_suppliers', {
      name: 'Aesthetic Suppliers Portal',
      categories: ['art', 'accessories', 'plants', 'signage', 'custom_elements', 'decorative'],
      filters: ['style', 'price_range', 'availability', 'region', 'specialization'],
      sortOptions: ['rating', 'relevance', 'price', 'popularity']
    });

    this.searchPortals.set('bulk_suppliers', {
      name: 'Bulk Suppliers Portal',
      categories: ['construction_materials', 'wholesale', 'industrial', 'raw_materials'],
      filters: ['min_order_quantity', 'price_per_unit', 'delivery_time', 'certification'],
      sortOptions: ['price', 'volume_discount', 'delivery_speed', 'rating']
    });

    this.searchPortals.set('regional_contractors', {
      name: 'Regional Contractors Portal',
      categories: ['general_contractor', 'specialized', 'installation', 'maintenance'],
      filters: ['region', 'service_type', 'availability', 'certification', 'project_size'],
      sortOptions: ['rating', 'distance', 'availability', 'completed_projects']
    });

    this.searchPortals.set('installation_specialists', {
      name: 'Installation Specialists Portal',
      categories: ['flooring', 'lighting', 'furniture', 'fixtures', 'technical'],
      filters: ['specialty', 'certification', 'equipment', 'team_size'],
      sortOptions: ['rating', 'experience', 'availability', 'price']
    });
  }

  /**
   * Register a contractor
   * @param {Object} contractorData - Contractor registration data
   * @returns {Object} Registration result
   */
  async registerContractor(contractorData) {
    const {
      companyName,
      contactName,
      email,
      phone,
      address,
      serviceTypes,
      specializations = [],
      regions = [],
      teamSize = 1,
      certifications = [],
      equipment = [],
      projectTypes = [],
      hourlyRate = null,
      projectRate = null,
      availability = {},
      portfolio = []
    } = contractorData;

    if (!companyName || !email || !serviceTypes || serviceTypes.length === 0) {
      throw new Error('Missing required fields: companyName, email, and serviceTypes are required');
    }

    const contractorId = this.generateContractorId();

    const contractor = {
      id: contractorId,
      companyName,
      contactName,
      email,
      phone,
      address,
      serviceTypes,
      specializations,
      regions,
      teamSize,
      certifications,
      equipment,
      projectTypes,
      pricing: {
        hourlyRate,
        projectRate,
        currency: 'USD'
      },
      availability: this.initializeAvailability(availability),
      portfolio,
      rating: {
        average: 0,
        count: 0,
        breakdown: {
          quality: 0,
          timeliness: 0,
          communication: 0,
          professionalism: 0
        }
      },
      completedProjects: 0,
      verified: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contractors.set(contractorId, contractor);

    return {
      success: true,
      contractorId,
      contractor,
      message: 'Contractor registered successfully'
    };
  }

  /**
   * Initialize availability schedule
   * @param {Object} availability - Initial availability data
   * @returns {Object} Formatted availability
   */
  initializeAvailability(availability) {
    const defaultAvailability = {
      monday: { available: true, hours: { start: '09:00', end: '18:00' } },
      tuesday: { available: true, hours: { start: '09:00', end: '18:00' } },
      wednesday: { available: true, hours: { start: '09:00', end: '18:00' } },
      thursday: { available: true, hours: { start: '09:00', end: '18:00' } },
      friday: { available: true, hours: { start: '09:00', end: '18:00' } },
      saturday: { available: false, hours: null },
      sunday: { available: false, hours: null }
    };

    return { ...defaultAvailability, ...availability };
  }

  /**
   * Create a booking for contractor/vendor
   * @param {Object} bookingData - Booking details
   * @returns {Object} Booking result
   */
  async createBooking(bookingData) {
    const {
      contractorId,
      projectId,
      clientId,
      clientName,
      serviceType,
      projectType,
      description,
      preferredDates = [],
      duration, // in hours or days
      durationType = 'hours', // hours, days
      location,
      requirements = [],
      budget = null,
      urgency = 'normal'
    } = bookingData;

    const contractor = this.contractors.get(contractorId);
    if (!contractor) {
      throw new Error(`Contractor ${contractorId} not found`);
    }

    if (!projectId || !clientId || !serviceType) {
      throw new Error('Missing required fields: projectId, clientId, and serviceType are required');
    }

    const bookingId = this.generateBookingId();

    // Check availability via LayrOps
    const availabilityCheck = await this.layrOpsScheduler.checkAvailability(
      contractorId,
      preferredDates,
      duration,
      durationType
    );

    const booking = {
      id: bookingId,
      contractorId,
      contractorName: contractor.companyName,
      projectId,
      clientId,
      clientName,
      serviceType,
      projectType,
      description,
      requestedDates: preferredDates,
      confirmedDate: null,
      duration,
      durationType,
      location,
      requirements,
      budget,
      urgency,
      availability: availabilityCheck,
      status: 'pending', // pending, confirmed, in_progress, completed, cancelled
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Booking request created'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings.set(bookingId, booking);

    // Notify contractor
    await this.notifyContractor(booking);

    return {
      success: true,
      bookingId,
      booking,
      availabilityCheck,
      message: availabilityCheck.available 
        ? 'Booking request created. Contractor will confirm shortly.'
        : 'Booking request created. Alternative dates may be suggested.'
    };
  }

  /**
   * Confirm a booking
   * @param {string} bookingId - Booking identifier
   * @param {Object} confirmationData - Confirmation details
   * @returns {Object} Confirmation result
   */
  async confirmBooking(bookingId, confirmationData) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const {
      confirmedDate,
      confirmedTime,
      adjustedPrice = null,
      notes = ''
    } = confirmationData;

    booking.confirmedDate = confirmedDate;
    booking.confirmedTime = confirmedTime;
    if (adjustedPrice) {
      booking.confirmedPrice = adjustedPrice;
    }
    booking.confirmationNotes = notes;
    booking.status = 'confirmed';
    booking.timeline.push({
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      note: `Booking confirmed for ${confirmedDate} at ${confirmedTime}`
    });
    booking.updatedAt = new Date().toISOString();

    // Schedule via LayrOps
    await this.layrOpsScheduler.scheduleWork(booking);

    // Block contractor availability
    this.blockAvailability(booking.contractorId, confirmedDate, booking.duration, booking.durationType);

    return {
      success: true,
      bookingId,
      status: 'confirmed',
      confirmedDate,
      confirmedTime,
      booking
    };
  }

  /**
   * Block contractor availability for booked period
   * @param {string} contractorId - Contractor identifier
   * @param {string} date - Date to block
   * @param {number} duration - Duration
   * @param {string} durationType - Duration type
   */
  blockAvailability(contractorId, date, duration, durationType) {
    if (!this.availability.has(contractorId)) {
      this.availability.set(contractorId, new Map());
    }

    const contractorAvailability = this.availability.get(contractorId);
    const dateKey = new Date(date).toISOString().split('T')[0];

    if (!contractorAvailability.has(dateKey)) {
      contractorAvailability.set(dateKey, []);
    }

    contractorAvailability.get(dateKey).push({
      blocked: true,
      duration,
      durationType
    });
  }

  /**
   * Search contractors via category-specific portal
   * @param {string} portalType - Portal type identifier
   * @param {Object} searchParams - Search parameters
   * @returns {Array} Matching contractors
   */
  searchContractors(portalType, searchParams = {}) {
    const portal = this.searchPortals.get(portalType);
    if (!portal) {
      throw new Error(`Portal ${portalType} not found`);
    }

    const {
      category,
      region,
      minRating,
      availability,
      certification,
      projectSize,
      specialization,
      keyword,
      sortBy = 'rating',
      limit = 20
    } = searchParams;

    let results = [];

    this.contractors.forEach(contractor => {
      // Check if contractor matches portal categories
      const matchesPortal = contractor.serviceTypes.some(type => 
        portal.categories.includes(type)
      );
      
      if (!matchesPortal) return;

      // Apply filters
      if (category && !contractor.serviceTypes.includes(category)) return;
      if (region && !contractor.regions.includes(region)) return;
      if (minRating && contractor.rating.average < minRating) return;
      if (certification && !contractor.certifications.some(c => c.includes(certification))) return;
      if (specialization && !contractor.specializations.includes(specialization)) return;
      if (keyword && !this.matchesKeyword(contractor, keyword)) return;

      results.push(contractor);
    });

    // Sort results based on portal-specific options
    results = this.sortContractors(results, sortBy, portal);

    return results.slice(0, limit);
  }

  /**
   * Sort contractors based on criteria
   * @param {Array} contractors - Contractors to sort
   * @param {string} sortBy - Sort criteria
   * @param {Object} portal - Portal configuration
   * @returns {Array} Sorted contractors
   */
  sortContractors(contractors, sortBy, portal) {
    if (!portal.sortOptions.includes(sortBy)) {
      sortBy = 'rating';
    }

    return contractors.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating.average - a.rating.average;
        case 'price':
          return (a.pricing.hourlyRate || 0) - (b.pricing.hourlyRate || 0);
        case 'completed_projects':
          return b.completedProjects - a.completedProjects;
        case 'availability':
          return this.getAvailabilityScore(b.id) - this.getAvailabilityScore(a.id);
        default:
          return b.rating.average - a.rating.average;
      }
    });
  }

  /**
   * Get availability score for sorting
   * @param {string} contractorId - Contractor identifier
   * @returns {number} Availability score
   */
  getAvailabilityScore(contractorId) {
    const contractor = this.contractors.get(contractorId);
    if (!contractor) return 0;

    let score = 0;
    Object.values(contractor.availability).forEach(day => {
      if (day.available) score += 1;
    });
    return score;
  }

  /**
   * Check if contractor matches keyword
   * @param {Object} contractor - Contractor data
   * @param {string} keyword - Search keyword
   * @returns {boolean} Match result
   */
  matchesKeyword(contractor, keyword) {
    const searchText = `${contractor.companyName} ${contractor.specializations.join(' ')} ${contractor.serviceTypes.join(' ')}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  }

  /**
   * Get contractor schedule
   * @param {string} contractorId - Contractor identifier
   * @param {Object} dateRange - Date range for schedule
   * @returns {Object} Schedule data
   */
  getContractorSchedule(contractorId, dateRange = {}) {
    const contractor = this.contractors.get(contractorId);
    if (!contractor) {
      throw new Error(`Contractor ${contractorId} not found`);
    }

    const { startDate, endDate } = dateRange;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const schedule = {
      contractorId,
      contractorName: contractor.companyName,
      baseAvailability: contractor.availability,
      bookings: [],
      blockedDates: []
    };

    // Get bookings for contractor in date range
    this.bookings.forEach(booking => {
      if (booking.contractorId === contractorId && booking.status !== 'cancelled') {
        const bookingDate = new Date(booking.confirmedDate || booking.requestedDates[0]);
        if (bookingDate >= start && bookingDate <= end) {
          schedule.bookings.push({
            bookingId: booking.id,
            projectId: booking.projectId,
            clientName: booking.clientName,
            date: booking.confirmedDate || booking.requestedDates[0],
            status: booking.status,
            serviceType: booking.serviceType
          });
        }
      }
    });

    // Get blocked dates
    const contractorAvailability = this.availability.get(contractorId);
    if (contractorAvailability) {
      contractorAvailability.forEach((blocks, dateKey) => {
        const blockDate = new Date(dateKey);
        if (blockDate >= start && blockDate <= end) {
          schedule.blockedDates.push({
            date: dateKey,
            blocks
          });
        }
      });
    }

    return schedule;
  }

  /**
   * Notify contractor about booking
   * @param {Object} booking - Booking data
   */
  async notifyContractor(booking) {
    console.log(`Contractor notification: Booking ${booking.id} for ${booking.serviceType}`);
    // In production, would send email/SMS/push notification
    return {
      notified: true,
      contractorId: booking.contractorId,
      method: 'email',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get bookings for a project
   * @param {string} projectId - Project identifier
   * @returns {Array} Project bookings
   */
  getBookingsByProject(projectId) {
    const bookings = [];
    this.bookings.forEach(booking => {
      if (booking.projectId === projectId) {
        bookings.push(booking);
      }
    });
    return bookings;
  }

  /**
   * Get contractor profile
   * @param {string} contractorId - Contractor identifier
   * @returns {Object|null} Contractor profile
   */
  getContractor(contractorId) {
    return this.contractors.get(contractorId) || null;
  }

  /**
   * Get search portal configuration
   * @param {string} portalType - Portal type
   * @returns {Object|null} Portal configuration
   */
  getSearchPortal(portalType) {
    return this.searchPortals.get(portalType) || null;
  }

  /**
   * List all search portals
   * @returns {Array} Available portals
   */
  listSearchPortals() {
    const portals = [];
    this.searchPortals.forEach((config, type) => {
      portals.push({
        type,
        name: config.name,
        categories: config.categories,
        filters: config.filters
      });
    });
    return portals;
  }

  generateContractorId() {
    return `contractor_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  generateBookingId() {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * LayrOps Scheduler - Automated scheduling via LayrOps vendor systems
 */
class LayrOpsScheduler {
  constructor() {
    this.scheduledWork = new Map();
    this.optimizationRules = new Map();
    this.initializeOptimizationRules();
    console.log('LayrOps Scheduler initialized');
  }

  initializeOptimizationRules() {
    // Scheduling optimization rules
    this.optimizationRules.set('minimize_travel', {
      priority: 1,
      description: 'Group nearby jobs to minimize travel time',
      apply: (bookings) => this.optimizeByLocation(bookings)
    });

    this.optimizationRules.set('skill_matching', {
      priority: 2,
      description: 'Match contractors to jobs based on specialized skills',
      apply: (booking, contractors) => this.matchBySkills(booking, contractors)
    });

    this.optimizationRules.set('load_balancing', {
      priority: 3,
      description: 'Balance workload across available contractors',
      apply: (bookings, contractors) => this.balanceLoad(bookings, contractors)
    });
  }

  /**
   * Check contractor availability
   * @param {string} contractorId - Contractor identifier
   * @param {Array} preferredDates - Preferred dates
   * @param {number} duration - Duration
   * @param {string} durationType - Duration type
   * @returns {Object} Availability check result
   */
  async checkAvailability(contractorId, preferredDates, duration, durationType) {
    // Simulated availability check
    const available = preferredDates.length > 0 && Math.random() > 0.3;
    
    return {
      available,
      checkedDates: preferredDates,
      suggestedDates: available ? preferredDates : this.generateAlternativeDates(preferredDates),
      duration,
      durationType,
      confidence: available ? 0.95 : 0.7
    };
  }

  /**
   * Generate alternative dates when preferred dates unavailable
   * @param {Array} preferredDates - Original preferred dates
   * @returns {Array} Alternative dates
   */
  generateAlternativeDates(preferredDates) {
    const alternatives = [];
    const baseDate = preferredDates[0] ? new Date(preferredDates[0]) : new Date();
    
    for (let i = 1; i <= 5; i++) {
      const altDate = new Date(baseDate);
      altDate.setDate(altDate.getDate() + i);
      alternatives.push(altDate.toISOString().split('T')[0]);
    }
    
    return alternatives;
  }

  /**
   * Schedule work via LayrOps automation
   * @param {Object} booking - Confirmed booking
   * @returns {Object} Scheduling result
   */
  async scheduleWork(booking) {
    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const schedule = {
      id: scheduleId,
      bookingId: booking.id,
      contractorId: booking.contractorId,
      projectId: booking.projectId,
      scheduledDate: booking.confirmedDate,
      scheduledTime: booking.confirmedTime,
      duration: booking.duration,
      durationType: booking.durationType,
      serviceType: booking.serviceType,
      location: booking.location,
      optimizations: this.applyOptimizations(booking),
      reminders: this.generateReminders(booking),
      createdAt: new Date().toISOString()
    };

    this.scheduledWork.set(scheduleId, schedule);

    return {
      success: true,
      scheduleId,
      schedule,
      optimizations: schedule.optimizations
    };
  }

  /**
   * Apply scheduling optimizations
   * @param {Object} booking - Booking data
   * @returns {Array} Applied optimizations
   */
  applyOptimizations(booking) {
    const optimizations = [];

    // Travel optimization
    optimizations.push({
      type: 'travel_route',
      suggestion: 'Optimized route calculated',
      estimatedSavings: '15 minutes'
    });

    // Time slot optimization
    optimizations.push({
      type: 'time_slot',
      suggestion: 'Optimal time slot selected based on traffic patterns',
      confidence: 0.85
    });

    return optimizations;
  }

  /**
   * Generate booking reminders
   * @param {Object} booking - Booking data
   * @returns {Array} Reminder schedule
   */
  generateReminders(booking) {
    const bookingDate = new Date(booking.confirmedDate);
    
    return [
      {
        type: 'contractor',
        timing: '24_hours_before',
        sendAt: new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        message: `Reminder: You have a ${booking.serviceType} appointment tomorrow`
      },
      {
        type: 'client',
        timing: '24_hours_before',
        sendAt: new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        message: `Reminder: ${booking.contractorName} is scheduled for ${booking.serviceType} tomorrow`
      },
      {
        type: 'contractor',
        timing: '1_hour_before',
        sendAt: new Date(bookingDate.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        message: `Your ${booking.serviceType} appointment starts in 1 hour`
      }
    ];
  }

  /**
   * Optimize bookings by location
   * @param {Array} bookings - Bookings to optimize
   * @returns {Array} Optimized booking order
   */
  optimizeByLocation(bookings) {
    // Simplified location-based optimization
    return bookings.sort((a, b) => {
      if (a.location && b.location) {
        return a.location.localeCompare(b.location);
      }
      return 0;
    });
  }

  /**
   * Match contractors by skills
   * @param {Object} booking - Booking with requirements
   * @param {Array} contractors - Available contractors
   * @returns {Array} Matched contractors
   */
  matchBySkills(booking, contractors) {
    return contractors.filter(contractor => 
      contractor.serviceTypes.includes(booking.serviceType) ||
      contractor.specializations.some(s => booking.requirements.includes(s))
    );
  }

  /**
   * Balance workload across contractors
   * @param {Array} bookings - Pending bookings
   * @param {Array} contractors - Available contractors
   * @returns {Object} Load-balanced assignments
   */
  balanceLoad(bookings, contractors) {
    const assignments = new Map();
    
    contractors.forEach(c => assignments.set(c.id, []));
    
    bookings.forEach((booking, index) => {
      const contractorIndex = index % contractors.length;
      const contractor = contractors[contractorIndex];
      if (contractor) {
        assignments.get(contractor.id).push(booking);
      }
    });
    
    return Object.fromEntries(assignments);
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContractorManager, LayrOpsScheduler };
}

if (typeof window !== 'undefined') {
  window.ContractorManager = ContractorManager;
  window.LayrOpsScheduler = LayrOpsScheduler;
}
