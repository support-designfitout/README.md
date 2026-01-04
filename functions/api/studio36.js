/**
 * Studio36 OS API Endpoints
 * Cloud-agnostic serverless functions for Studio36 OS platform
 */

// Import Studio36 OS modules
const { Studio36OS } = require('../../lib/studio36');

// Singleton instance
let studio36Instance = null;

function getStudio36() {
  if (!studio36Instance) {
    studio36Instance = new Studio36OS({
      enableMaterialHUB: true,
      enableFitOutLabApp: true,
      enableZmntOS: true,
      enableMrketOS: true
    });
  }
  return studio36Instance;
}

/**
 * Main request handler for Studio36 OS API
 */
async function handleStudio36Request(request, url) {
  const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  };

  try {
    const studio36 = getStudio36();
    const path = url.pathname;
    const method = request.method;

    // Mood Board Endpoints
    if (path === '/api/studio36/mood-boards' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.moodBoards.createBoard(data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/mood-boards\/[\w-]+$/) && method === 'GET') {
      const boardId = path.split('/').pop();
      const result = studio36.moodBoards.getBoard(boardId);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Board not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/mood-boards\/[\w-]+\/materials$/) && method === 'POST') {
      const boardId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.moodBoards.addMaterial(boardId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/mood-boards\/[\w-]+\/suggestions$/) && method === 'GET') {
      const boardId = path.split('/')[4];
      const result = await studio36.moodBoards.getSuggestions(boardId);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/mood-boards\/[\w-]+\/export$/) && method === 'GET') {
      const boardId = path.split('/')[4];
      const result = studio36.moodBoards.exportToMaterialHUB(boardId);
      return new Response(JSON.stringify(result), { headers });
    }

    // Sample Request Endpoints
    if (path === '/api/studio36/samples' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.requestSample(data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/samples\/[\w-]+$/) && method === 'GET') {
      const requestId = path.split('/').pop();
      const result = studio36.samples.getRequest(requestId);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Sample request not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/samples\/[\w-]+\/status$/) && method === 'PUT') {
      const requestId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.samples.updateStatus(requestId, data.status, data.note);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/samples\/[\w-]+\/cancel$/) && method === 'POST') {
      const requestId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.samples.cancelRequest(requestId, data.reason);
      return new Response(JSON.stringify(result), { headers });
    }

    // Delivery Endpoints
    if (path === '/api/studio36/deliveries' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.createDelivery(data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/deliveries\/[\w-]+$/) && method === 'GET') {
      const deliveryId = path.split('/').pop();
      const result = studio36.deliveries.getTrackingForDashboard(deliveryId);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/deliveries\/[\w-]+\/tracking$/) && method === 'PUT') {
      const deliveryId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.deliveries.updateTracking(deliveryId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path === '/api/studio36/deliveries/scheduled' && method === 'GET') {
      const urlParams = new URL(request.url);
      const date = urlParams.searchParams.get('date') || new Date().toISOString();
      const result = studio36.deliveries.getScheduledDeliveries(date);
      return new Response(JSON.stringify(result), { headers });
    }

    // Vendor Profile Endpoints
    if (path === '/api/studio36/vendors' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.vendors.registerVendor(data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path === '/api/studio36/vendors' && method === 'GET') {
      const urlParams = new URL(request.url);
      const searchParams = {
        category: urlParams.searchParams.get('category'),
        region: urlParams.searchParams.get('region'),
        minRating: urlParams.searchParams.get('minRating') ? parseFloat(urlParams.searchParams.get('minRating')) : null,
        verified: urlParams.searchParams.get('verified') === 'true',
        premium: urlParams.searchParams.get('premium') === 'true',
        keyword: urlParams.searchParams.get('keyword'),
        sortBy: urlParams.searchParams.get('sortBy') || 'rating',
        limit: parseInt(urlParams.searchParams.get('limit')) || 20
      };
      const result = await studio36.searchVendors(searchParams);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+$/) && method === 'GET') {
      const vendorId = path.split('/').pop();
      const result = studio36.vendors.getVendorProfile(vendorId);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/portfolio$/) && method === 'POST') {
      const vendorId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.vendors.uploadPortfolio(vendorId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/premium$/) && method === 'POST') {
      const vendorId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.vendors.upgradeToPremium(vendorId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/verify$/) && method === 'POST') {
      const vendorId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.vendors.verifyVendor(vendorId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/reviews$/) && method === 'POST') {
      const vendorId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.vendors.addReview(vendorId, data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/reviews$/) && method === 'GET') {
      const vendorId = path.split('/')[4];
      const urlParams = new URL(request.url);
      const options = {
        page: parseInt(urlParams.searchParams.get('page')) || 1,
        limit: parseInt(urlParams.searchParams.get('limit')) || 10,
        sortBy: urlParams.searchParams.get('sortBy') || 'recent'
      };
      const result = studio36.vendors.getVendorReviews(vendorId, options);
      return new Response(JSON.stringify(result), { headers });
    }

    // Contractor Management Endpoints
    if (path === '/api/studio36/contractors' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.contractors.registerContractor(data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path.match(/^\/api\/studio36\/contractors\/[\w-]+$/) && method === 'GET') {
      const contractorId = path.split('/').pop();
      const result = studio36.contractors.getContractor(contractorId);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Contractor not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/contractors\/[\w-]+\/schedule$/) && method === 'GET') {
      const contractorId = path.split('/')[4];
      const urlParams = new URL(request.url);
      const dateRange = {
        startDate: urlParams.searchParams.get('startDate'),
        endDate: urlParams.searchParams.get('endDate')
      };
      const result = studio36.contractors.getContractorSchedule(contractorId, dateRange);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path === '/api/studio36/contractors/search-portals' && method === 'GET') {
      const result = studio36.getSearchPortals();
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/contractors\/search\/[\w-]+$/) && method === 'GET') {
      const portalType = path.split('/').pop();
      const urlParams = new URL(request.url);
      const searchParams = {
        category: urlParams.searchParams.get('category'),
        region: urlParams.searchParams.get('region'),
        minRating: urlParams.searchParams.get('minRating') ? parseFloat(urlParams.searchParams.get('minRating')) : null,
        certification: urlParams.searchParams.get('certification'),
        specialization: urlParams.searchParams.get('specialization'),
        keyword: urlParams.searchParams.get('keyword'),
        sortBy: urlParams.searchParams.get('sortBy') || 'rating',
        limit: parseInt(urlParams.searchParams.get('limit')) || 20
      };
      const result = studio36.searchContractors(portalType, searchParams);
      return new Response(JSON.stringify(result), { headers });
    }

    // Booking Endpoints
    if (path === '/api/studio36/bookings' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.bookContractor(data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path.match(/^\/api\/studio36\/bookings\/[\w-]+\/confirm$/) && method === 'POST') {
      const bookingId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.contractors.confirmBooking(bookingId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    // Visibility & Marketing Endpoints
    if (path === '/api/studio36/feed' && method === 'GET') {
      const urlParams = new URL(request.url);
      const userContext = {
        userId: urlParams.searchParams.get('userId'),
        searchQuery: urlParams.searchParams.get('query'),
        projectType: urlParams.searchParams.get('projectType'),
        region: urlParams.searchParams.get('region'),
        budget: urlParams.searchParams.get('budget'),
        limit: parseInt(urlParams.searchParams.get('limit')) || 20
      };
      const result = await studio36.visibility.getAdaptiveFeed(userContext.userId, userContext);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/social-media$/) && method === 'POST') {
      const vendorId = path.split('/')[4];
      const data = await request.json();
      const result = await studio36.visibility.linkSocialMedia(vendorId, data);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/vendors\/[\w-]+\/social-media$/) && method === 'GET') {
      const vendorId = path.split('/')[4];
      const result = studio36.visibility.getSocialMediaLinks(vendorId);
      if (!result) {
        return new Response(JSON.stringify({ error: 'Social media links not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify(result), { headers });
    }

    if (path === '/api/studio36/campaigns' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.visibility.createReferralCampaign(data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path.match(/^\/api\/studio36\/campaigns\/[\w-]+\/metrics$/) && method === 'GET') {
      const campaignId = path.split('/')[4];
      const result = studio36.visibility.getCampaignMetrics(campaignId);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path.match(/^\/api\/studio36\/campaigns\/[\w-]+\/track$/) && method === 'POST') {
      const campaignId = path.split('/')[4];
      const data = await request.json();
      const result = studio36.visibility.trackCampaignEvent(campaignId, data.eventType, data);
      return new Response(JSON.stringify(result), { headers });
    }

    // Project Management Endpoints
    if (path === '/api/studio36/projects' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.createProject(data);
      return new Response(JSON.stringify(result), { headers, status: 201 });
    }

    if (path.match(/^\/api\/studio36\/projects\/[\w-]+\/dashboard$/) && method === 'GET') {
      const projectId = path.split('/')[4];
      const result = await studio36.getProjectDashboard(projectId);
      return new Response(JSON.stringify(result), { headers });
    }

    // ZmntOS Integration Endpoints
    if (path.match(/^\/api\/studio36\/deliveries\/[\w-]+\/optimize-route$/) && method === 'POST') {
      const deliveryId = path.split('/')[4];
      const result = await studio36.zmntOS.optimizeDeliveryRoute(deliveryId);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path === '/api/studio36/routing/batch' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.zmntOS.queueBatchOptimization(data.deliveryIds);
      return new Response(JSON.stringify(result), { headers });
    }

    if (path === '/api/studio36/routing/workflow' && method === 'POST') {
      const data = await request.json();
      const result = await studio36.zmntOS.automateRoutingWorkflow(data);
      return new Response(JSON.stringify(result), { headers });
    }

    // Health Check
    if (path === '/api/studio36/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Studio36 OS API',
        modules: {
          moodBoards: 'active',
          samples: 'active',
          deliveries: 'active',
          vendors: 'active',
          contractors: 'active',
          visibility: 'active'
        },
        integrations: {
          materialHUB: 'connected',
          fitOutLabApp: 'connected',
          zmntOS: 'connected',
          mrketOS: 'connected'
        },
        timestamp: new Date().toISOString()
      }), { headers });
    }

    // 404 for unmatched routes
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: `Endpoint ${path} not found`,
      availableEndpoints: [
        '/api/studio36/mood-boards',
        '/api/studio36/samples',
        '/api/studio36/deliveries',
        '/api/studio36/vendors',
        '/api/studio36/contractors',
        '/api/studio36/bookings',
        '/api/studio36/campaigns',
        '/api/studio36/projects',
        '/api/studio36/feed',
        '/api/studio36/health'
      ]
    }), { status: 404, headers });

  } catch (error) {
    console.error('Studio36 API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }), { status: 500, headers });
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleStudio36Request, getStudio36 };
}
