/**
 * Studio36 OS - Material Delivery Module
 * Delivery tracking and management for compact and bulk shipments
 * Integration with FitOut Lab App dashboards
 */

class MaterialDeliveryManager {
  constructor() {
    this.deliveries = new Map();
    this.courierPartners = new Map();
    this.scheduledDeliveries = new Map();
    this.webhookHandlers = new Map();
    this.initializeCourierServices();
    console.log('MaterialDeliveryManager initialized');
  }

  initializeCourierServices() {
    // Courier service configurations
    this.courierPartners.set('compact_express', {
      id: 'compact_express',
      name: 'Compact Express',
      type: 'compact',
      maxWeight: 5, // kg
      maxDimensions: { l: 30, w: 30, h: 30 }, // cm
      services: ['same_day', 'next_day', 'standard'],
      trackingUrl: '/api/tracking/compact/{trackingId}',
      apiEnabled: true
    });

    this.courierPartners.set('bulk_logistics', {
      id: 'bulk_logistics',
      name: 'Bulk Logistics',
      type: 'bulk',
      maxWeight: 500, // kg
      maxDimensions: { l: 200, w: 150, h: 150 }, // cm
      services: ['scheduled', 'express_freight', 'standard_freight'],
      trackingUrl: '/api/tracking/bulk/{trackingId}',
      apiEnabled: true
    });

    this.courierPartners.set('material_specialists', {
      id: 'material_specialists',
      name: 'Material Specialists',
      type: 'specialized',
      maxWeight: 1000, // kg
      specialHandling: ['fragile', 'oversized', 'climate_controlled'],
      services: ['white_glove', 'installation_included', 'warehouse_storage'],
      trackingUrl: '/api/tracking/specialized/{trackingId}',
      apiEnabled: true
    });
  }

  /**
   * Create a delivery order
   * @param {Object} deliveryData - Delivery details
   * @returns {Object} Created delivery
   */
  async createDelivery(deliveryData) {
    const {
      orderId,
      vendorId,
      vendorName,
      projectId,
      recipient,
      items,
      shipmentType = 'standard', // compact, standard, bulk
      specialHandling = [],
      scheduledDate = null,
      notes = ''
    } = deliveryData;

    // Validate required fields
    if (!orderId || !vendorId || !recipient || !items || items.length === 0) {
      throw new Error('Missing required fields: orderId, vendorId, recipient, and items are required');
    }

    const deliveryId = this.generateDeliveryId();
    const shipmentDetails = this.calculateShipment(items, shipmentType);
    const courierService = this.selectCourierService(shipmentDetails, specialHandling);

    const delivery = {
      id: deliveryId,
      orderId,
      vendorId,
      vendorName,
      projectId,
      recipient: {
        name: recipient.name,
        company: recipient.company || '',
        address: recipient.address,
        phone: recipient.phone,
        email: recipient.email
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        weight: item.weight || 0,
        dimensions: item.dimensions || null,
        fragile: item.fragile || false
      })),
      shipmentType,
      shipmentDetails,
      courierService,
      specialHandling,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      notes,
      tracking: {
        number: this.generateTrackingNumber(),
        url: courierService.trackingUrl.replace('{trackingId}', ''),
        status: 'created',
        currentLocation: 'Vendor Warehouse',
        estimatedDelivery: this.calculateEstimatedDelivery(courierService, shipmentType),
        history: [
          {
            timestamp: new Date().toISOString(),
            status: 'created',
            location: 'Vendor Warehouse',
            description: 'Delivery order created'
          }
        ]
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.deliveries.set(deliveryId, delivery);

    // If scheduled, add to scheduled deliveries
    if (scheduledDate) {
      this.scheduleDelivery(deliveryId, scheduledDate);
    }

    return {
      success: true,
      deliveryId,
      trackingNumber: delivery.tracking.number,
      delivery,
      courierService: courierService.name,
      estimatedDelivery: delivery.tracking.estimatedDelivery
    };
  }

  /**
   * Calculate shipment details
   * @param {Array} items - Items to ship
   * @param {string} shipmentType - Type of shipment
   * @returns {Object} Shipment details
   */
  calculateShipment(items, shipmentType) {
    let totalWeight = 0;
    let maxDimension = { l: 0, w: 0, h: 0 };
    let requiresSpecialHandling = false;

    items.forEach(item => {
      totalWeight += (item.weight || 1) * item.quantity;
      
      if (item.dimensions) {
        maxDimension.l = Math.max(maxDimension.l, item.dimensions.l || 0);
        maxDimension.w = Math.max(maxDimension.w, item.dimensions.w || 0);
        maxDimension.h = Math.max(maxDimension.h, item.dimensions.h || 0);
      }

      if (item.fragile || item.oversized || item.climateControlled) {
        requiresSpecialHandling = true;
      }
    });

    return {
      totalWeight,
      maxDimension,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      requiresSpecialHandling,
      packageType: totalWeight > 30 || shipmentType === 'bulk' ? 'pallet' : 'box'
    };
  }

  /**
   * Select appropriate courier service
   * @param {Object} shipmentDetails - Shipment details
   * @param {Array} specialHandling - Special handling requirements
   * @returns {Object} Selected courier service
   */
  selectCourierService(shipmentDetails, specialHandling) {
    if (specialHandling.length > 0 || shipmentDetails.requiresSpecialHandling) {
      return this.courierPartners.get('material_specialists');
    }
    
    if (shipmentDetails.totalWeight > 30 || shipmentDetails.packageType === 'pallet') {
      return this.courierPartners.get('bulk_logistics');
    }
    
    return this.courierPartners.get('compact_express');
  }

  /**
   * Calculate estimated delivery date
   * @param {Object} courierService - Selected courier service
   * @param {string} shipmentType - Type of shipment
   * @returns {string} Estimated delivery date
   */
  calculateEstimatedDelivery(courierService, shipmentType) {
    const deliveryDays = {
      compact: { compact_express: 1, bulk_logistics: 3, material_specialists: 5 },
      standard: { compact_express: 2, bulk_logistics: 5, material_specialists: 7 },
      bulk: { compact_express: 3, bulk_logistics: 7, material_specialists: 10 }
    };

    const days = deliveryDays[shipmentType]?.[courierService.id] || 5;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    
    return estimatedDate.toISOString();
  }

  /**
   * Update delivery tracking status
   * @param {string} deliveryId - Delivery identifier
   * @param {Object} trackingUpdate - Tracking update data
   * @returns {Object} Updated delivery
   */
  async updateTracking(deliveryId, trackingUpdate) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    const {
      status,
      location,
      description,
      estimatedDelivery = null
    } = trackingUpdate;

    // Add to tracking history
    delivery.tracking.history.push({
      timestamp: new Date().toISOString(),
      status,
      location,
      description
    });

    delivery.tracking.status = status;
    delivery.tracking.currentLocation = location;
    
    if (estimatedDelivery) {
      delivery.tracking.estimatedDelivery = estimatedDelivery;
    }

    // Update delivery status based on tracking
    if (['picked_up', 'in_transit'].includes(status)) {
      delivery.status = 'in_transit';
    } else if (status === 'out_for_delivery') {
      delivery.status = 'out_for_delivery';
    } else if (status === 'delivered') {
      delivery.status = 'delivered';
      delivery.deliveredAt = new Date().toISOString();
    }

    delivery.updatedAt = new Date().toISOString();

    // Trigger webhook handlers for real-time updates
    await this.triggerWebhooks(delivery, 'tracking_update');

    return {
      success: true,
      deliveryId,
      tracking: delivery.tracking,
      status: delivery.status
    };
  }

  /**
   * Get delivery tracking for FitOut Lab App dashboard
   * @param {string} deliveryId - Delivery identifier
   * @returns {Object} Tracking data formatted for dashboard
   */
  getTrackingForDashboard(deliveryId) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    return {
      deliveryId: delivery.id,
      trackingNumber: delivery.tracking.number,
      status: delivery.status,
      currentLocation: delivery.tracking.currentLocation,
      estimatedDelivery: delivery.tracking.estimatedDelivery,
      progress: this.calculateProgress(delivery.tracking.history),
      timeline: delivery.tracking.history.map(entry => ({
        status: entry.status,
        location: entry.location,
        timestamp: entry.timestamp,
        description: entry.description
      })),
      recipient: {
        name: delivery.recipient.name,
        address: delivery.recipient.address
      },
      vendor: {
        id: delivery.vendorId,
        name: delivery.vendorName
      },
      items: delivery.items.length,
      courierService: delivery.courierService.name
    };
  }

  /**
   * Calculate delivery progress percentage
   * @param {Array} history - Tracking history
   * @returns {number} Progress percentage
   */
  calculateProgress(history) {
    const statusProgress = {
      created: 10,
      confirmed: 20,
      picked_up: 30,
      in_transit: 50,
      at_hub: 65,
      out_for_delivery: 85,
      delivered: 100
    };

    const lastStatus = history[history.length - 1]?.status || 'created';
    return statusProgress[lastStatus] || 0;
  }

  /**
   * Get all deliveries for a project
   * @param {string} projectId - Project identifier
   * @returns {Array} List of deliveries
   */
  getDeliveriesByProject(projectId) {
    const deliveries = [];
    this.deliveries.forEach(delivery => {
      if (delivery.projectId === projectId) {
        deliveries.push(this.getTrackingForDashboard(delivery.id));
      }
    });
    return deliveries;
  }

  /**
   * Schedule a delivery
   * @param {string} deliveryId - Delivery identifier
   * @param {string} scheduledDate - Scheduled date
   */
  scheduleDelivery(deliveryId, scheduledDate) {
    const dateKey = new Date(scheduledDate).toISOString().split('T')[0];
    
    if (!this.scheduledDeliveries.has(dateKey)) {
      this.scheduledDeliveries.set(dateKey, []);
    }
    
    this.scheduledDeliveries.get(dateKey).push(deliveryId);
  }

  /**
   * Get scheduled deliveries for a date
   * @param {string} date - Date string
   * @returns {Array} Scheduled deliveries
   */
  getScheduledDeliveries(date) {
    const dateKey = new Date(date).toISOString().split('T')[0];
    const deliveryIds = this.scheduledDeliveries.get(dateKey) || [];
    
    return deliveryIds.map(id => this.getTrackingForDashboard(id));
  }

  /**
   * Register webhook handler for delivery updates
   * @param {string} event - Event type
   * @param {Function} handler - Handler function
   */
  registerWebhook(event, handler) {
    if (!this.webhookHandlers.has(event)) {
      this.webhookHandlers.set(event, []);
    }
    this.webhookHandlers.get(event).push(handler);
  }

  /**
   * Trigger webhooks for an event
   * @param {Object} delivery - Delivery data
   * @param {string} event - Event type
   */
  async triggerWebhooks(delivery, event) {
    const handlers = this.webhookHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        await handler(delivery, event);
      } catch (error) {
        console.error(`Webhook handler error for ${event}:`, error);
      }
    }
  }

  /**
   * Export delivery data for ZmntOS routing
   * @param {string} deliveryId - Delivery identifier
   * @returns {Object} Data formatted for ZmntOS
   */
  exportForZmntOS(deliveryId) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found`);
    }

    return {
      deliveryId: delivery.id,
      routingData: {
        origin: {
          type: 'vendor',
          id: delivery.vendorId,
          name: delivery.vendorName
        },
        destination: {
          type: 'project',
          id: delivery.projectId,
          address: delivery.recipient.address
        },
        shipmentDetails: delivery.shipmentDetails,
        specialHandling: delivery.specialHandling,
        priority: this.calculateRoutingPriority(delivery),
        constraints: {
          timeWindow: delivery.scheduledDate ? {
            start: delivery.scheduledDate,
            end: new Date(new Date(delivery.scheduledDate).getTime() + 4 * 60 * 60 * 1000).toISOString()
          } : null,
          vehicleType: delivery.shipmentDetails.packageType === 'pallet' ? 'truck' : 'van'
        }
      },
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate routing priority
   * @param {Object} delivery - Delivery data
   * @returns {string} Priority level
   */
  calculateRoutingPriority(delivery) {
    if (delivery.specialHandling.includes('fragile')) return 'high';
    if (delivery.shipmentType === 'compact') return 'high';
    if (delivery.scheduledDate) {
      const daysUntil = Math.ceil((new Date(delivery.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 1) return 'urgent';
      if (daysUntil <= 3) return 'high';
    }
    return 'normal';
  }

  generateDeliveryId() {
    return `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  generateTrackingNumber() {
    return `MTL${Date.now().toString().slice(-10)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MaterialDeliveryManager };
}

if (typeof window !== 'undefined') {
  window.MaterialDeliveryManager = MaterialDeliveryManager;
}
