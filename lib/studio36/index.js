/**
 * Studio36 OS - Main Integration Module
 * Core module that integrates all Studio36 OS components
 * with MaterialHUB, FitOut Lab App, and ZmntOS logic layers
 */

// Import sub-modules (for Node.js environments)
let MoodBoardManager, LayrOpsIntelligence;
let SampleRequestManager;
let MaterialDeliveryManager;
let VendorProfileManager;
let ContractorManager, LayrOpsScheduler;
let VisibilityManager, MrketOSIntegration;

if (typeof require !== 'undefined') {
  ({ MoodBoardManager, LayrOpsIntelligence } = require('./mood-board'));
  ({ SampleRequestManager } = require('./sample-request'));
  ({ MaterialDeliveryManager } = require('./material-delivery'));
  ({ VendorProfileManager } = require('./vendor-profile'));
  ({ ContractorManager, LayrOpsScheduler } = require('./contractor-management'));
  ({ VisibilityManager, MrketOSIntegration } = require('./visibility-marketing'));
}

/**
 * Studio36OS - Main Platform Class
 * Coordinates all modules and provides unified API
 */
class Studio36OS {
  constructor(config = {}) {
    this.config = {
      enableMaterialHUB: true,
      enableFitOutLabApp: true,
      enableZmntOS: true,
      enableMrketOS: true,
      ...config
    };

    // Initialize all managers
    this.moodBoards = new MoodBoardManager();
    this.samples = new SampleRequestManager();
    this.deliveries = new MaterialDeliveryManager();
    this.vendors = new VendorProfileManager();
    this.contractors = new ContractorManager();
    this.visibility = new VisibilityManager();

    // Integration bridges
    this.materialHUB = new MaterialHUBBridge(this);
    this.fitOutLabApp = new FitOutLabAppBridge(this);
    this.zmntOS = new ZmntOSBridge(this);

    // Event system for cross-module communication
    this.eventHandlers = new Map();

    this.initialized = true;
    console.log('Studio36 OS initialized with all modules');
  }

  /**
   * Create a new project with all integrated features
   * @param {Object} projectData - Project configuration
   * @returns {Object} Created project
   */
  async createProject(projectData) {
    const {
      name,
      type,
      clientId,
      clientName,
      budget,
      timeline,
      requirements = []
    } = projectData;

    const projectId = this.generateProjectId();

    const project = {
      id: projectId,
      name,
      type,
      clientId,
      clientName,
      budget,
      timeline,
      requirements,
      status: 'planning',
      moodBoards: [],
      vendors: [],
      contractors: [],
      deliveries: [],
      sampleRequests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create default mood board for project
    const moodBoard = await this.moodBoards.createBoard({
      name: `${name} - Main Mood Board`,
      projectId,
      creatorId: clientId,
      description: `Mood board for ${type} project: ${name}`,
      visibility: 'private'
    });

    project.moodBoards.push(moodBoard.boardId);

    // Register with MaterialHUB if enabled
    if (this.config.enableMaterialHUB) {
      await this.materialHUB.registerProject(project);
    }

    // Register with FitOut Lab App if enabled
    if (this.config.enableFitOutLabApp) {
      await this.fitOutLabApp.registerProject(project);
    }

    return {
      success: true,
      projectId,
      project,
      moodBoardId: moodBoard.boardId
    };
  }

  /**
   * Get project dashboard data
   * @param {string} projectId - Project identifier
   * @returns {Object} Dashboard data
   */
  async getProjectDashboard(projectId) {
    const moodBoards = this.moodBoards.getBoardsByProject(projectId);
    const deliveries = this.deliveries.getDeliveriesByProject(projectId);
    const bookings = this.contractors.getBookingsByProject(projectId);

    // Aggregate sample requests for project
    const sampleRequests = [];
    const vendors = [];

    // Get linked vendors from mood boards
    moodBoards.forEach(board => {
      board.vendorLinks.forEach(vendorId => {
        const vendor = this.vendors.getVendor(vendorId);
        if (vendor && !vendors.find(v => v.id === vendorId)) {
          vendors.push(vendor);
        }
      });
    });

    return {
      projectId,
      moodBoards: moodBoards.length,
      vendors: vendors.length,
      activeDeliveries: deliveries.filter(d => d.status !== 'delivered').length,
      completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      timeline: this.generateProjectTimeline(projectId, deliveries, bookings),
      summary: {
        moodBoardsList: moodBoards.map(b => ({ id: b.id, name: b.name })),
        vendorsList: vendors.map(v => ({ id: v.id, name: v.companyName, rating: v.rating })),
        deliveryTrackings: deliveries.map(d => this.deliveries.getTrackingForDashboard(d.id))
      }
    };
  }

  /**
   * Generate project timeline
   * @param {string} projectId - Project identifier
   * @param {Array} deliveries - Project deliveries
   * @param {Array} bookings - Project bookings
   * @returns {Array} Timeline events
   */
  generateProjectTimeline(projectId, deliveries, bookings) {
    const events = [];

    deliveries.forEach(delivery => {
      events.push({
        type: 'delivery',
        title: `Material Delivery: ${delivery.items.length} items`,
        date: delivery.tracking.estimatedDelivery,
        status: delivery.status,
        id: delivery.id
      });
    });

    bookings.forEach(booking => {
      events.push({
        type: 'booking',
        title: `${booking.serviceType}: ${booking.contractorName}`,
        date: booking.confirmedDate || booking.requestedDates[0],
        status: booking.status,
        id: booking.id
      });
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
  }

  /**
   * Request sample from vendor profile
   * @param {Object} sampleData - Sample request data
   * @returns {Object} Sample request result
   */
  async requestSample(sampleData) {
    const { vendorId, productId, ...rest } = sampleData;

    // Get vendor info
    const vendor = this.vendors.getVendor(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    // Get product info from portfolio
    const portfolio = vendor.portfolio ? 
      await this.getVendorPortfolio(vendorId) : null;
    
    let product = null;
    if (portfolio) {
      product = portfolio.products.find(p => p.id === productId);
    }

    const request = await this.samples.createSampleRequest({
      vendorId,
      vendorName: vendor.companyName,
      productId,
      productName: product ? product.name : 'Sample Item',
      ...rest
    });

    // Emit event for integrations
    this.emitEvent('sampleRequested', {
      requestId: request.requestId,
      vendorId,
      productId
    });

    return request;
  }

  /**
   * Get vendor portfolio
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} Vendor portfolio
   */
  async getVendorPortfolio(vendorId) {
    const vendor = this.vendors.getVendor(vendorId);
    if (!vendor || !vendor.portfolio) {
      return null;
    }
    return this.vendors.portfolios.get(vendor.portfolio);
  }

  /**
   * Book contractor/vendor for project
   * @param {Object} bookingData - Booking data
   * @returns {Object} Booking result
   */
  async bookContractor(bookingData) {
    const booking = await this.contractors.createBooking(bookingData);

    // Emit event for integrations
    this.emitEvent('contractorBooked', {
      bookingId: booking.bookingId,
      contractorId: bookingData.contractorId,
      projectId: bookingData.projectId
    });

    return booking;
  }

  /**
   * Create material delivery
   * @param {Object} deliveryData - Delivery data
   * @returns {Object} Delivery result
   */
  async createDelivery(deliveryData) {
    const delivery = await this.deliveries.createDelivery(deliveryData);

    // Register with FitOut Lab App dashboard
    if (this.config.enableFitOutLabApp) {
      await this.fitOutLabApp.addDeliveryTracking(delivery);
    }

    // Export to ZmntOS for routing
    if (this.config.enableZmntOS) {
      await this.zmntOS.optimizeDeliveryRoute(delivery.deliveryId);
    }

    return delivery;
  }

  /**
   * Search vendors across all categories
   * @param {Object} searchParams - Search parameters
   * @returns {Object} Search results
   */
  async searchVendors(searchParams) {
    const results = this.vendors.searchVendors(searchParams);

    // Get adaptive feed recommendations if MrketOS enabled
    if (this.config.enableMrketOS && searchParams.userId) {
      const feed = await this.visibility.getAdaptiveFeed(
        searchParams.userId,
        searchParams
      );

      return {
        vendors: results,
        recommended: feed.feed,
        totalResults: results.length
      };
    }

    return {
      vendors: results,
      totalResults: results.length
    };
  }

  /**
   * Search contractors via category-specific portal
   * @param {string} portalType - Portal type
   * @param {Object} searchParams - Search parameters
   * @returns {Array} Search results
   */
  searchContractors(portalType, searchParams = {}) {
    return this.contractors.searchContractors(portalType, searchParams);
  }

  /**
   * Get available search portals
   * @returns {Array} Available portals
   */
  getSearchPortals() {
    return this.contractors.listSearchPortals();
  }

  /**
   * Register event handler
   * @param {string} eventType - Event type
   * @param {Function} handler - Handler function
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * Emit event to handlers
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  emitEvent(eventType, data) {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Event handler error for ${eventType}:`, error);
      }
    });
  }

  generateProjectId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * MaterialHUB Bridge - Integration with MaterialHUB
 */
class MaterialHUBBridge {
  constructor(studio36) {
    this.studio36 = studio36;
    this.registeredProjects = new Map();
    this.materialLinks = new Map();
    console.log('MaterialHUB Bridge initialized');
  }

  /**
   * Register project with MaterialHUB
   * @param {Object} project - Project data
   * @returns {Object} Registration result
   */
  async registerProject(project) {
    const registration = {
      projectId: project.id,
      projectName: project.name,
      projectType: project.type,
      registeredAt: new Date().toISOString(),
      syncStatus: 'active'
    };

    this.registeredProjects.set(project.id, registration);

    return {
      success: true,
      hubProjectId: `hub_${project.id}`,
      syncStatus: 'active'
    };
  }

  /**
   * Export mood board to MaterialHUB
   * @param {string} boardId - Mood board identifier
   * @returns {Object} Export result
   */
  async exportMoodBoard(boardId) {
    const exportData = this.studio36.moodBoards.exportToMaterialHUB(boardId);

    return {
      success: true,
      exportId: `export_${Date.now()}`,
      data: exportData,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Link vendor to MaterialHUB catalog
   * @param {string} vendorId - Vendor identifier
   * @returns {Object} Link result
   */
  async linkVendor(vendorId) {
    const exportData = this.studio36.vendors.exportToMaterialHUB(vendorId);

    this.materialLinks.set(vendorId, {
      hubCatalogId: `catalog_${vendorId}`,
      linkedAt: new Date().toISOString(),
      products: exportData.products.length
    });

    return {
      success: true,
      hubCatalogId: `catalog_${vendorId}`,
      productsLinked: exportData.products.length
    };
  }

  /**
   * Sync materials from MaterialHUB
   * @param {string} projectId - Project identifier
   * @returns {Object} Sync result
   */
  async syncMaterials(projectId) {
    // Simulated sync from MaterialHUB
    return {
      success: true,
      projectId,
      syncedItems: Math.floor(Math.random() * 50) + 10,
      syncedAt: new Date().toISOString()
    };
  }
}

/**
 * FitOut Lab App Bridge - Integration with FitOut Lab App dashboards
 */
class FitOutLabAppBridge {
  constructor(studio36) {
    this.studio36 = studio36;
    this.dashboardData = new Map();
    this.deliveryTrackers = new Map();
    console.log('FitOut Lab App Bridge initialized');
  }

  /**
   * Register project with FitOut Lab App
   * @param {Object} project - Project data
   * @returns {Object} Registration result
   */
  async registerProject(project) {
    const dashboard = {
      projectId: project.id,
      projectName: project.name,
      widgets: [
        { type: 'deliveryTracking', enabled: true },
        { type: 'moodBoardPreview', enabled: true },
        { type: 'contractorSchedule', enabled: true },
        { type: 'vendorDirectory', enabled: true }
      ],
      createdAt: new Date().toISOString()
    };

    this.dashboardData.set(project.id, dashboard);

    return {
      success: true,
      dashboardId: `dash_${project.id}`,
      widgets: dashboard.widgets.length
    };
  }

  /**
   * Add delivery tracking to dashboard
   * @param {Object} delivery - Delivery data
   * @returns {Object} Tracking result
   */
  async addDeliveryTracking(delivery) {
    const tracking = this.studio36.deliveries.getTrackingForDashboard(delivery.deliveryId);

    this.deliveryTrackers.set(delivery.deliveryId, {
      dashboardWidget: `widget_delivery_${delivery.deliveryId}`,
      tracking,
      addedAt: new Date().toISOString()
    });

    // Set up webhook for real-time updates
    this.studio36.deliveries.registerWebhook('tracking_update', async (updatedDelivery) => {
      if (updatedDelivery.id === delivery.deliveryId) {
        await this.updateDashboardWidget(delivery.deliveryId, updatedDelivery);
      }
    });

    return {
      success: true,
      widgetId: `widget_delivery_${delivery.deliveryId}`,
      tracking
    };
  }

  /**
   * Update dashboard widget with delivery status
   * @param {string} deliveryId - Delivery identifier
   * @param {Object} delivery - Updated delivery data
   */
  async updateDashboardWidget(deliveryId, delivery) {
    const tracker = this.deliveryTrackers.get(deliveryId);
    if (tracker) {
      tracker.tracking = this.studio36.deliveries.getTrackingForDashboard(deliveryId);
      tracker.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Get dashboard data for project
   * @param {string} projectId - Project identifier
   * @returns {Object} Dashboard data
   */
  getDashboardData(projectId) {
    return this.dashboardData.get(projectId) || null;
  }

  /**
   * Get all delivery trackers for project
   * @param {string} projectId - Project identifier
   * @returns {Array} Delivery trackers
   */
  getProjectDeliveryTrackers(projectId) {
    const trackers = [];
    this.deliveryTrackers.forEach((tracker, deliveryId) => {
      if (tracker.tracking.projectId === projectId) {
        trackers.push(tracker);
      }
    });
    return trackers;
  }
}

/**
 * ZmntOS Bridge - Integration with ZmntOS logic layers for routing
 */
class ZmntOSBridge {
  constructor(studio36) {
    this.studio36 = studio36;
    this.routingQueue = [];
    this.optimizedRoutes = new Map();
    console.log('ZmntOS Bridge initialized');
  }

  /**
   * Optimize delivery route using ZmntOS logic
   * @param {string} deliveryId - Delivery identifier
   * @returns {Object} Optimized route
   */
  async optimizeDeliveryRoute(deliveryId) {
    const routingData = this.studio36.deliveries.exportForZmntOS(deliveryId);

    // Simulate route optimization
    const optimizedRoute = {
      deliveryId,
      route: {
        segments: [
          { from: 'origin', to: 'hub', distance: 15, estimatedTime: 25 },
          { from: 'hub', to: 'destination', distance: 10, estimatedTime: 20 }
        ],
        totalDistance: 25,
        totalTime: 45,
        optimizations: ['traffic_avoidance', 'shortest_path']
      },
      vehicleAssignment: routingData.routingData.constraints.vehicleType,
      priority: routingData.routingData.priority,
      optimizedAt: new Date().toISOString()
    };

    this.optimizedRoutes.set(deliveryId, optimizedRoute);

    return {
      success: true,
      deliveryId,
      route: optimizedRoute.route,
      savings: {
        time: '15 minutes',
        distance: '5 km'
      }
    };
  }

  /**
   * Get optimized route for delivery
   * @param {string} deliveryId - Delivery identifier
   * @returns {Object|null} Optimized route
   */
  getOptimizedRoute(deliveryId) {
    return this.optimizedRoutes.get(deliveryId) || null;
  }

  /**
   * Queue multiple deliveries for batch optimization
   * @param {Array} deliveryIds - Delivery identifiers
   * @returns {Object} Queue result
   */
  async queueBatchOptimization(deliveryIds) {
    this.routingQueue.push(...deliveryIds.map(id => ({
      deliveryId: id,
      queuedAt: new Date().toISOString()
    })));

    // Process queue (simulated)
    const results = await Promise.all(
      deliveryIds.map(id => this.optimizeDeliveryRoute(id))
    );

    // Clear processed items from queue
    this.routingQueue = this.routingQueue.filter(
      item => !deliveryIds.includes(item.deliveryId)
    );

    return {
      success: true,
      optimized: results.length,
      queueRemaining: this.routingQueue.length
    };
  }

  /**
   * Automate material-routing workflow
   * @param {Object} workflowConfig - Workflow configuration
   * @returns {Object} Workflow result
   */
  async automateRoutingWorkflow(workflowConfig) {
    const {
      projectId,
      deliveries,
      priorityOrder = 'time_optimized',
      constraints = {}
    } = workflowConfig;

    // Optimize all deliveries in priority order
    const optimizedDeliveries = [];

    for (const deliveryId of deliveries) {
      const route = await this.optimizeDeliveryRoute(deliveryId);
      optimizedDeliveries.push({
        deliveryId,
        route: route.route,
        priority: route.priority
      });
    }

    // Sort by priority
    if (priorityOrder === 'time_optimized') {
      optimizedDeliveries.sort((a, b) => a.route.totalTime - b.route.totalTime);
    } else if (priorityOrder === 'distance_optimized') {
      optimizedDeliveries.sort((a, b) => a.route.totalDistance - b.route.totalDistance);
    }

    return {
      success: true,
      projectId,
      workflow: {
        deliverySequence: optimizedDeliveries.map(d => d.deliveryId),
        totalDeliveries: optimizedDeliveries.length,
        estimatedTotalTime: optimizedDeliveries.reduce((sum, d) => sum + d.route.totalTime, 0),
        estimatedTotalDistance: optimizedDeliveries.reduce((sum, d) => sum + d.route.totalDistance, 0)
      },
      optimizedAt: new Date().toISOString()
    };
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Studio36OS,
    MaterialHUBBridge,
    FitOutLabAppBridge,
    ZmntOSBridge
  };
}

if (typeof window !== 'undefined') {
  window.Studio36OS = Studio36OS;
  window.MaterialHUBBridge = MaterialHUBBridge;
  window.FitOutLabAppBridge = FitOutLabAppBridge;
  window.ZmntOSBridge = ZmntOSBridge;
}
