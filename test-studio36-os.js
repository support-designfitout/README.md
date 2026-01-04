#!/usr/bin/env node

/**
 * Studio36 OS Test Suite
 * Tests for mood boards, samples, delivery, vendor profiles, contractors, and visibility modules
 */

const path = require('path');

// Import all Studio36 OS modules
let Studio36OS, MoodBoardManager, SampleRequestManager, MaterialDeliveryManager;
let VendorProfileManager, ContractorManager, VisibilityManager;

try {
  ({ MoodBoardManager, LayrOpsIntelligence } = require('./lib/studio36/mood-board'));
  ({ SampleRequestManager } = require('./lib/studio36/sample-request'));
  ({ MaterialDeliveryManager } = require('./lib/studio36/material-delivery'));
  ({ VendorProfileManager } = require('./lib/studio36/vendor-profile'));
  ({ ContractorManager, LayrOpsScheduler } = require('./lib/studio36/contractor-management'));
  ({ VisibilityManager, MrketOSIntegration } = require('./lib/studio36/visibility-marketing'));
  ({ Studio36OS } = require('./lib/studio36'));
} catch (error) {
  console.error('Failed to load Studio36 OS modules:', error.message);
  process.exit(1);
}

// Test Mood Board Module
async function testMoodBoardModule() {
  console.log('Testing Mood Board Module...');
  
  try {
    const manager = new MoodBoardManager();
    
    // Test board creation
    const board = await manager.createBoard({
      name: 'Test Board',
      projectId: 'project_123',
      creatorId: 'user_456',
      templateId: 'residential_modern',
      description: 'Modern residential design board'
    });
    
    if (!board.success || !board.boardId) {
      throw new Error('Board creation failed');
    }
    
    // Test adding material
    const material = await manager.addMaterial(board.boardId, {
      name: 'Oak Flooring',
      vendorId: 'vendor_001',
      vendorName: 'Premium Floors Co',
      sectionId: board.board.sections[0].id,
      price: 150,
      specifications: { thickness: '15mm', finish: 'natural' }
    });
    
    if (!material.success || !material.materialId) {
      throw new Error('Material addition failed');
    }
    
    // Test AI suggestions
    const suggestions = await manager.getSuggestions(board.boardId, { sustainabilityFocus: true });
    
    if (!suggestions.success || !Array.isArray(suggestions.suggestions)) {
      throw new Error('AI suggestions failed');
    }
    
    // Test MaterialHUB export
    const exportData = manager.exportToMaterialHUB(board.boardId);
    
    if (!exportData.boardId || !Array.isArray(exportData.materials)) {
      throw new Error('MaterialHUB export failed');
    }
    
    console.log('✅ Mood Board Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Mood Board Module test failed:', error.message);
    return false;
  }
}

// Test Sample Request Module
async function testSampleRequestModule() {
  console.log('Testing Sample Request Module...');
  
  try {
    const manager = new SampleRequestManager();
    
    // Test sample request creation
    const request = await manager.createSampleRequest({
      vendorId: 'vendor_001',
      vendorName: 'Premium Floors Co',
      productId: 'prod_001',
      productName: 'Oak Flooring Sample',
      projectId: 'project_123',
      requesterId: 'user_456',
      requesterName: 'John Doe',
      deliveryAddress: {
        street: '123 Design Street',
        city: 'Dubai',
        country: 'UAE'
      },
      sampleType: 'standard',
      urgency: 'normal'
    });
    
    if (!request.success || !request.requestId) {
      throw new Error('Sample request creation failed');
    }
    
    // Test status update
    const statusUpdate = await manager.updateStatus(request.requestId, 'confirmed', 'Vendor confirmed availability');
    
    if (!statusUpdate.success || statusUpdate.status !== 'confirmed') {
      throw new Error('Status update failed');
    }
    
    // Test getting request
    const fetchedRequest = manager.getRequest(request.requestId);
    
    if (!fetchedRequest || fetchedRequest.status !== 'confirmed') {
      throw new Error('Request retrieval failed');
    }
    
    console.log('✅ Sample Request Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Sample Request Module test failed:', error.message);
    return false;
  }
}

// Test Material Delivery Module
async function testMaterialDeliveryModule() {
  console.log('Testing Material Delivery Module...');
  
  try {
    const manager = new MaterialDeliveryManager();
    
    // Test delivery creation
    const delivery = await manager.createDelivery({
      orderId: 'order_001',
      vendorId: 'vendor_001',
      vendorName: 'Premium Floors Co',
      projectId: 'project_123',
      recipient: {
        name: 'John Doe',
        company: 'Design Studio',
        address: { street: '123 Design Street', city: 'Dubai', country: 'UAE' },
        phone: '+971501234567',
        email: 'john@example.com'
      },
      items: [
        { id: 'item_001', name: 'Oak Flooring', quantity: 10, weight: 5 },
        { id: 'item_002', name: 'Underlay', quantity: 10, weight: 2 }
      ],
      shipmentType: 'standard'
    });
    
    if (!delivery.success || !delivery.deliveryId) {
      throw new Error('Delivery creation failed');
    }
    
    // Test tracking update
    const trackingUpdate = await manager.updateTracking(delivery.deliveryId, {
      status: 'picked_up',
      location: 'Vendor Warehouse',
      description: 'Package picked up by courier'
    });
    
    if (!trackingUpdate.success) {
      throw new Error('Tracking update failed');
    }
    
    // Test dashboard tracking
    const dashboardData = manager.getTrackingForDashboard(delivery.deliveryId);
    
    if (!dashboardData.trackingNumber || !dashboardData.progress) {
      throw new Error('Dashboard tracking failed');
    }
    
    // Test ZmntOS export
    const zmntOSData = manager.exportForZmntOS(delivery.deliveryId);
    
    if (!zmntOSData.routingData || !zmntOSData.routingData.origin) {
      throw new Error('ZmntOS export failed');
    }
    
    console.log('✅ Material Delivery Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Material Delivery Module test failed:', error.message);
    return false;
  }
}

// Test Vendor Profile Module
async function testVendorProfileModule() {
  console.log('Testing Vendor Profile Module...');
  
  try {
    const manager = new VendorProfileManager();
    
    // Test vendor registration
    const vendor = await manager.registerVendor({
      companyName: 'Premium Floors Co',
      contactName: 'Jane Smith',
      email: 'jane@premiumfloors.com',
      phone: '+971501234567',
      address: { city: 'Dubai', country: 'UAE' },
      category: 'materials',
      subcategories: ['flooring', 'wood'],
      manufacturingCapabilities: ['custom_cutting', 'finishing'],
      regions: ['UAE', 'GCC']
    });
    
    if (!vendor.success || !vendor.vendorId) {
      throw new Error('Vendor registration failed');
    }
    
    // Test portfolio upload
    const portfolio = await manager.uploadPortfolio(vendor.vendorId, {
      products: [
        { name: 'Oak Flooring', description: 'Premium oak', category: 'flooring', priceRange: '$100-150/sqm' },
        { name: 'Walnut Flooring', description: 'Luxury walnut', category: 'flooring', priceRange: '$150-200/sqm' }
      ],
      projects: [
        { name: 'Dubai Residences', type: 'residential', location: 'Dubai' }
      ]
    });
    
    if (!portfolio.success || !portfolio.portfolioId) {
      throw new Error('Portfolio upload failed');
    }
    
    // Test premium upgrade
    const premium = await manager.upgradeToPremium(vendor.vendorId, { tier: 'premium' });
    
    if (!premium.success || premium.profileType !== 'premium') {
      throw new Error('Premium upgrade failed');
    }
    
    // Test review addition
    const review = await manager.addReview(vendor.vendorId, {
      reviewerId: 'user_789',
      reviewerName: 'Mike Johnson',
      projectId: 'project_456',
      ratings: { quality: 5, delivery: 4, communication: 5, value: 4 },
      comment: 'Excellent quality flooring'
    });
    
    if (!review.success || !review.reviewId) {
      throw new Error('Review addition failed');
    }
    
    // Test vendor search
    const searchResults = manager.searchVendors({
      category: 'materials',
      minRating: 4.0,
      verified: false
    });
    
    if (!Array.isArray(searchResults)) {
      throw new Error('Vendor search failed');
    }
    
    // Test MaterialHUB export
    const hubExport = manager.exportToMaterialHUB(vendor.vendorId);
    
    if (!hubExport.vendorId || !Array.isArray(hubExport.products)) {
      throw new Error('MaterialHUB export failed');
    }
    
    console.log('✅ Vendor Profile Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Vendor Profile Module test failed:', error.message);
    return false;
  }
}

// Test Contractor Management Module
async function testContractorManagementModule() {
  console.log('Testing Contractor Management Module...');
  
  try {
    const manager = new ContractorManager();
    
    // Test contractor registration
    const contractor = await manager.registerContractor({
      companyName: 'Elite Installations',
      contactName: 'Bob Builder',
      email: 'bob@elite.com',
      phone: '+971509876543',
      address: { city: 'Dubai', country: 'UAE' },
      serviceTypes: ['installation', 'flooring'],
      specializations: ['premium_flooring', 'hardwood'],
      regions: ['UAE', 'GCC'],
      teamSize: 5,
      hourlyRate: 50,
      projectRate: 5000
    });
    
    if (!contractor.success || !contractor.contractorId) {
      throw new Error('Contractor registration failed');
    }
    
    // Test booking creation
    const booking = await manager.createBooking({
      contractorId: contractor.contractorId,
      projectId: 'project_123',
      clientId: 'user_456',
      clientName: 'John Doe',
      serviceType: 'installation',
      description: 'Flooring installation for residential project',
      preferredDates: ['2024-02-15', '2024-02-16'],
      duration: 8,
      durationType: 'hours',
      location: { city: 'Dubai', country: 'UAE' }
    });
    
    if (!booking.success || !booking.bookingId) {
      throw new Error('Booking creation failed');
    }
    
    // Test booking confirmation
    const confirmation = await manager.confirmBooking(booking.bookingId, {
      confirmedDate: '2024-02-15',
      confirmedTime: '09:00',
      notes: 'Confirmed by contractor'
    });
    
    if (!confirmation.success || confirmation.status !== 'confirmed') {
      throw new Error('Booking confirmation failed');
    }
    
    // Test search portals
    const portals = manager.listSearchPortals();
    
    if (!Array.isArray(portals) || portals.length === 0) {
      throw new Error('Search portals listing failed');
    }
    
    // Test portal search
    const searchResults = manager.searchContractors('installation_specialists', {
      region: 'UAE',
      sortBy: 'rating'
    });
    
    if (!Array.isArray(searchResults)) {
      throw new Error('Portal search failed');
    }
    
    console.log('✅ Contractor Management Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Contractor Management Module test failed:', error.message);
    return false;
  }
}

// Test Visibility & Marketing Module
async function testVisibilityMarketingModule() {
  console.log('Testing Visibility & Marketing Module...');
  
  try {
    const manager = new VisibilityManager();
    
    // Test adaptive feed
    const feed = await manager.getAdaptiveFeed('user_123', {
      searchQuery: 'flooring',
      projectType: 'residential',
      region: 'UAE',
      budget: 'medium',
      limit: 10
    });
    
    if (!feed.userId || !Array.isArray(feed.feed)) {
      throw new Error('Adaptive feed generation failed');
    }
    
    // Test social media linking
    const socialLinks = await manager.linkSocialMedia('vendor_001', {
      linkedin: 'https://linkedin.com/company/premiumfloors',
      instagram: 'https://instagram.com/premiumfloors',
      facebook: 'https://facebook.com/premiumfloors'
    });
    
    if (!socialLinks.success || !socialLinks.linkedAccounts) {
      throw new Error('Social media linking failed');
    }
    
    // Test referral campaign creation
    const campaign = await manager.createReferralCampaign({
      vendorId: 'vendor_001',
      campaignName: 'New Year Promo',
      campaignType: 'boost',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      targetAudience: ['architects', 'designers'],
      goals: { impressions: 5000, clicks: 500, conversions: 50 }
    });
    
    if (!campaign.success || !campaign.campaignId) {
      throw new Error('Campaign creation failed');
    }
    
    // Test campaign event tracking
    const trackResult = manager.trackCampaignEvent(campaign.campaignId, 'impression', {});
    
    if (!trackResult.success) {
      throw new Error('Campaign event tracking failed');
    }
    
    // Test campaign metrics
    const metrics = manager.getCampaignMetrics(campaign.campaignId);
    
    if (!metrics.campaignId || !metrics.metrics) {
      throw new Error('Campaign metrics retrieval failed');
    }
    
    console.log('✅ Visibility & Marketing Module tests passed');
    return true;
  } catch (error) {
    console.error('❌ Visibility & Marketing Module test failed:', error.message);
    return false;
  }
}

// Test Studio36 OS Main Integration
async function testStudio36OSIntegration() {
  console.log('Testing Studio36 OS Integration...');
  
  try {
    const studio36 = new Studio36OS({
      enableMaterialHUB: true,
      enableFitOutLabApp: true,
      enableZmntOS: true,
      enableMrketOS: true
    });
    
    if (!studio36.initialized) {
      throw new Error('Studio36 OS initialization failed');
    }
    
    // Test project creation
    const project = await studio36.createProject({
      name: 'Test Villa Project',
      type: 'residential',
      clientId: 'client_001',
      clientName: 'Test Client',
      budget: 100000,
      timeline: '3 months',
      requirements: ['flooring', 'lighting', 'furniture']
    });
    
    if (!project.success || !project.projectId) {
      throw new Error('Project creation failed');
    }
    
    // Test project dashboard
    const dashboard = await studio36.getProjectDashboard(project.projectId);
    
    if (!dashboard.projectId || dashboard.moodBoards === undefined) {
      throw new Error('Project dashboard retrieval failed');
    }
    
    // Test vendor search with MrketOS
    const searchResults = await studio36.searchVendors({
      category: 'materials',
      region: 'UAE'
    });
    
    if (!searchResults.vendors) {
      throw new Error('Vendor search failed');
    }
    
    // Test search portals
    const portals = studio36.getSearchPortals();
    
    if (!Array.isArray(portals)) {
      throw new Error('Search portals retrieval failed');
    }
    
    console.log('✅ Studio36 OS Integration tests passed');
    return true;
  } catch (error) {
    console.error('❌ Studio36 OS Integration test failed:', error.message);
    return false;
  }
}

// Test brand neutrality of Studio36 OS modules
function testBrandNeutrality() {
  console.log('Testing Studio36 OS brand neutrality...');
  
  const fs = require('fs');
  const studio36Path = path.join(__dirname, 'lib', 'studio36');
  const bannedTerms = ['firebase', 'cloudflare', 'ga4', 'gsc'];
  let foundViolations = false;
  
  try {
    const files = fs.readdirSync(studio36Path);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(studio36Path, file);
        const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
        
        for (const term of bannedTerms) {
          if (content.includes(term)) {
            console.error(`❌ Found "${term}" in ${file}`);
            foundViolations = true;
          }
        }
      }
    }
    
    if (!foundViolations) {
      console.log('✅ Studio36 OS modules are brand-neutral');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Brand neutrality test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running Studio36 OS Test Suite...\n');
  
  const tests = [
    testMoodBoardModule,
    testSampleRequestModule,
    testMaterialDeliveryModule,
    testVendorProfileModule,
    testContractorManagementModule,
    testVisibilityMarketingModule,
    testStudio36OSIntegration,
    testBrandNeutrality
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
    console.log();
  }
  
  console.log(`Tests completed: ${passedTests}/${tests.length} passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All Studio36 OS tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testMoodBoardModule,
  testSampleRequestModule,
  testMaterialDeliveryModule,
  testVendorProfileModule,
  testContractorManagementModule,
  testVisibilityMarketingModule,
  testStudio36OSIntegration,
  testBrandNeutrality,
  runTests
};
