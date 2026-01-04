/**
 * Studio36 OS - Sample Request Module
 * Sample request functionality with courier partnership integration
 * Supports local courier partnerships for seamless sample delivery
 */

class SampleRequestManager {
  constructor() {
    this.requests = new Map();
    this.courierPartners = new Map();
    this.deliveryTracking = new Map();
    this.initializeCourierPartners();
    console.log('SampleRequestManager initialized');
  }

  initializeCourierPartners() {
    // Initialize courier partner configurations
    this.courierPartners.set('local_express', {
      name: 'Local Express',
      type: 'local',
      coverage: ['UAE', 'GCC'],
      estimatedDays: { compact: 1, standard: 2, bulk: 3 },
      trackingEnabled: true,
      sampleSpecialist: true
    });

    this.courierPartners.set('global_logistics', {
      name: 'Global Logistics',
      type: 'international',
      coverage: ['Worldwide'],
      estimatedDays: { compact: 3, standard: 5, bulk: 7 },
      trackingEnabled: true,
      sampleSpecialist: true
    });

    this.courierPartners.set('regional_courier', {
      name: 'Regional Courier',
      type: 'regional',
      coverage: ['Middle East', 'Africa', 'South Asia'],
      estimatedDays: { compact: 2, standard: 3, bulk: 5 },
      trackingEnabled: true,
      sampleSpecialist: false
    });

    this.courierPartners.set('priority_samples', {
      name: 'Priority Samples',
      type: 'premium',
      coverage: ['UAE', 'SA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
      estimatedDays: { compact: 0.5, standard: 1, bulk: 2 },
      trackingEnabled: true,
      sampleSpecialist: true
    });
  }

  /**
   * Create a sample request from a vendor profile
   * @param {Object} requestData - Request details
   * @returns {Object} Created request details
   */
  async createSampleRequest(requestData) {
    const {
      vendorId,
      vendorName,
      productId,
      productName,
      projectId,
      requesterId,
      requesterName,
      deliveryAddress,
      sampleType = 'standard', // compact, standard, bulk
      quantity = 1,
      notes = '',
      urgency = 'normal' // normal, urgent, rush
    } = requestData;

    // Validate required fields
    if (!vendorId || !productId || !requesterId || !deliveryAddress) {
      throw new Error('Missing required fields: vendorId, productId, requesterId, and deliveryAddress are required');
    }

    const requestId = this.generateRequestId();
    
    // Select appropriate courier based on delivery location and urgency
    const courierSelection = this.selectCourier(deliveryAddress, sampleType, urgency);

    const request = {
      id: requestId,
      vendorId,
      vendorName,
      productId,
      productName,
      projectId,
      requesterId,
      requesterName,
      deliveryAddress,
      sampleType,
      quantity,
      notes,
      urgency,
      courier: courierSelection.courier,
      estimatedDelivery: courierSelection.estimatedDelivery,
      estimatedDays: courierSelection.estimatedDays,
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Sample request created'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.requests.set(requestId, request);

    // Notify vendor (simulated)
    await this.notifyVendor(request);

    return {
      success: true,
      requestId: requestId,
      request: request,
      courier: courierSelection,
      message: `Sample request created. Estimated delivery: ${courierSelection.estimatedDays} days`
    };
  }

  /**
   * Select appropriate courier based on criteria
   * @param {Object} address - Delivery address
   * @param {string} sampleType - Type of sample shipment
   * @param {string} urgency - Urgency level
   * @returns {Object} Courier selection details
   */
  selectCourier(address, sampleType, urgency) {
    const region = this.determineRegion(address);
    let selectedCourier = null;
    let estimatedDays = 0;

    // Priority selection for urgent requests
    if (urgency === 'rush' && region === 'GCC') {
      const priority = this.courierPartners.get('priority_samples');
      selectedCourier = priority;
      estimatedDays = priority.estimatedDays[sampleType];
    } else if (region === 'GCC' || region === 'UAE') {
      const local = this.courierPartners.get('local_express');
      selectedCourier = local;
      estimatedDays = local.estimatedDays[sampleType];
    } else if (['Middle East', 'Africa', 'South Asia'].includes(region)) {
      const regional = this.courierPartners.get('regional_courier');
      selectedCourier = regional;
      estimatedDays = regional.estimatedDays[sampleType];
    } else {
      const global = this.courierPartners.get('global_logistics');
      selectedCourier = global;
      estimatedDays = global.estimatedDays[sampleType];
    }

    // Adjust for urgency
    if (urgency === 'urgent') {
      estimatedDays = Math.max(estimatedDays * 0.7, 1);
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.ceil(estimatedDays));

    return {
      courier: selectedCourier.name,
      courierType: selectedCourier.type,
      estimatedDays: Math.ceil(estimatedDays),
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingEnabled: selectedCourier.trackingEnabled,
      sampleSpecialist: selectedCourier.sampleSpecialist
    };
  }

  /**
   * Determine region from address
   * @param {Object} address - Delivery address
   * @returns {string} Region identifier
   */
  determineRegion(address) {
    const country = (address.country || '').toUpperCase();
    
    if (['UAE', 'AE', 'UNITED ARAB EMIRATES'].includes(country)) {
      return 'UAE';
    }
    if (['SA', 'SAUDI ARABIA', 'QA', 'QATAR', 'KW', 'KUWAIT', 'BH', 'BAHRAIN', 'OM', 'OMAN'].includes(country)) {
      return 'GCC';
    }
    if (['EG', 'EGYPT', 'JO', 'JORDAN', 'LB', 'LEBANON', 'IQ', 'IRAQ', 'SY', 'SYRIA'].includes(country)) {
      return 'Middle East';
    }
    if (['ZA', 'SOUTH AFRICA', 'NG', 'NIGERIA', 'KE', 'KENYA', 'ET', 'ETHIOPIA', 'EG', 'EGYPT'].includes(country)) {
      return 'Africa';
    }
    if (['IN', 'INDIA', 'PK', 'PAKISTAN', 'BD', 'BANGLADESH', 'LK', 'SRI LANKA'].includes(country)) {
      return 'South Asia';
    }
    
    return 'International';
  }

  /**
   * Update request status
   * @param {string} requestId - Request identifier
   * @param {string} status - New status
   * @param {string} note - Status note
   * @returns {Object} Updated request
   */
  async updateStatus(requestId, status, note = '') {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    request.status = status;
    request.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    });
    request.updatedAt = new Date().toISOString();

    // Generate tracking if shipped
    if (status === 'shipped' && !request.trackingNumber) {
      request.trackingNumber = this.generateTrackingNumber();
      this.createTrackingEntry(request);
    }

    return {
      success: true,
      requestId,
      status,
      request
    };
  }

  /**
   * Create tracking entry for delivery monitoring
   * @param {Object} request - Sample request
   */
  createTrackingEntry(request) {
    const trackingData = {
      trackingNumber: request.trackingNumber,
      requestId: request.id,
      courier: request.courier,
      origin: 'Vendor Warehouse',
      destination: request.deliveryAddress,
      currentStatus: 'shipped',
      estimatedDelivery: request.estimatedDelivery,
      updates: [
        {
          timestamp: new Date().toISOString(),
          location: 'Vendor Warehouse',
          status: 'Package picked up',
          details: 'Sample package collected for delivery'
        }
      ]
    };

    this.deliveryTracking.set(request.trackingNumber, trackingData);
  }

  /**
   * Get tracking information
   * @param {string} trackingNumber - Tracking number
   * @returns {Object} Tracking data
   */
  getTracking(trackingNumber) {
    const tracking = this.deliveryTracking.get(trackingNumber);
    if (!tracking) {
      throw new Error(`Tracking ${trackingNumber} not found`);
    }
    return tracking;
  }

  /**
   * Get request by ID
   * @param {string} requestId - Request identifier
   * @returns {Object|null} Request data
   */
  getRequest(requestId) {
    return this.requests.get(requestId) || null;
  }

  /**
   * Get all requests for a vendor
   * @param {string} vendorId - Vendor identifier
   * @returns {Array} List of requests
   */
  getRequestsByVendor(vendorId) {
    const requests = [];
    this.requests.forEach(request => {
      if (request.vendorId === vendorId) {
        requests.push(request);
      }
    });
    return requests;
  }

  /**
   * Get all requests for a requester
   * @param {string} requesterId - Requester identifier
   * @returns {Array} List of requests
   */
  getRequestsByRequester(requesterId) {
    const requests = [];
    this.requests.forEach(request => {
      if (request.requesterId === requesterId) {
        requests.push(request);
      }
    });
    return requests;
  }

  /**
   * Notify vendor about sample request (simulated)
   * @param {Object} request - Sample request
   */
  async notifyVendor(request) {
    console.log(`Vendor notification: Sample request ${request.id} for ${request.productName}`);
    // In production, this would send email/SMS/push notification
    return {
      notified: true,
      vendorId: request.vendorId,
      method: 'email',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Cancel a sample request
   * @param {string} requestId - Request identifier
   * @param {string} reason - Cancellation reason
   * @returns {Object} Cancellation result
   */
  async cancelRequest(requestId, reason = '') {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    if (['shipped', 'in_transit', 'delivered'].includes(request.status)) {
      throw new Error('Cannot cancel request that has already been shipped');
    }

    return await this.updateStatus(requestId, 'cancelled', reason || 'Request cancelled by user');
  }

  generateRequestId() {
    return `SR_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  generateTrackingNumber() {
    return `TRK${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SampleRequestManager };
}

if (typeof window !== 'undefined') {
  window.SampleRequestManager = SampleRequestManager;
}
