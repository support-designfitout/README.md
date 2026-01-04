/**
 * MrketOz CRM - Chat Endpoint Implementation
 * Cloud-agnostic serverless function for customer interactions
 * 
 * Features:
 * - Automated customer response system
 * - Security restrictions for admin access
 * - JSON-based customer interaction workflows
 */

const ADMIN_EMAIL = 'support@designfitout.com';
const CRM_NAME = 'MrketOz CRM';

// Cloudflare Worker format (can be adapted for other cloud providers)
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Route to chat endpoint
    if (url.pathname.startsWith('/chat')) {
      return handleChatRequest(request, url);
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: CRM_NAME,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Default response for unmatched routes
    return new Response('Not Found', { status: 404 });
  }
};

/**
 * Handle chat requests with customer interaction logic
 */
async function handleChatRequest(request, url) {
  const headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  };

  try {
    // Basic security check for admin operations
    const authHeader = request.headers.get('authorization');
    const isAdminRequest = authHeader && authHeader.includes(ADMIN_EMAIL);

    // Handle different chat endpoints
    if (url.pathname === '/chat') {
      return handleMainChat(request, isAdminRequest, headers);
    } else if (url.pathname === '/chat/quotation') {
      return handleQuotationRequest(request, headers);
    } else if (url.pathname === '/chat/delivery') {
      return handleDeliveryTracking(request, headers);
    } else if (url.pathname === '/chat/support') {
      return handleSupportRequest(request, headers);
    }

    return new Response(JSON.stringify({
      error: 'Invalid chat endpoint',
      availableEndpoints: ['/chat', '/chat/quotation', '/chat/delivery', '/chat/support']
    }), {
      status: 404,
      headers
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Please try again later'
    }), {
      status: 500,
      headers
    });
  }
}

/**
 * Main chat interface with welcome message and options
 */
async function handleMainChat(request, isAdminRequest, headers) {
  const method = request.method;

  if (method === 'GET') {
    // Welcome message with customer interaction options
    const response = {
      reply: `Hello 👋, welcome to ${CRM_NAME} in motion mode! How can we assist you today?`,
      options: [
        "Request Quotation",
        "Track Delivery", 
        "Connect Support"
      ],
      endpoints: {
        quotation: "/chat/quotation",
        delivery: "/chat/delivery",
        support: "/chat/support"
      },
      timestamp: new Date().toISOString(),
      status: "active"
    };

    // Add admin-specific options if authorized
    if (isAdminRequest) {
      response.adminOptions = [
        "View Analytics",
        "Manage Customer Queue",
        "Export Reports"
      ];
      response.adminEndpoints = {
        analytics: "/chat/admin/analytics",
        queue: "/chat/admin/queue",
        reports: "/chat/admin/reports"
      };
    }

    return new Response(JSON.stringify(response), { headers });
  }

  if (method === 'POST') {
    const data = await request.json().catch(() => ({}));
    const { message, action } = data;

    // Process customer message/action
    if (action === 'start_conversation') {
      return new Response(JSON.stringify({
        reply: `Thank you for contacting ${CRM_NAME}! I'm here to help you with your design and fitout needs. What would you like to do?`,
        conversationId: generateConversationId(),
        options: [
          "Request Quotation",
          "Track Delivery",
          "Connect Support"
        ],
        timestamp: new Date().toISOString()
      }), { headers });
    }

    // Generic message processing
    return new Response(JSON.stringify({
      reply: `I understand you said: "${message || 'No message provided'}". How can I help you today?`,
      options: [
        "Request Quotation",
        "Track Delivery",
        "Connect Support"
      ],
      timestamp: new Date().toISOString()
    }), { headers });
  }

  return new Response(JSON.stringify({
    error: 'Method not allowed',
    allowedMethods: ['GET', 'POST']
  }), {
    status: 405,
    headers
  });
}

/**
 * Handle quotation requests
 */
async function handleQuotationRequest(request, headers) {
  if (request.method === 'POST') {
    const data = await request.json().catch(() => ({}));
    const { projectType, budget, timeline, contactInfo } = data;

    return new Response(JSON.stringify({
      reply: "Thank you for your quotation request! 📋",
      message: "We've received your information and will prepare a detailed quotation for you.",
      nextSteps: [
        "Our design team will review your requirements",
        "You'll receive a preliminary quote within 24-48 hours",
        "A design consultant will contact you to discuss details"
      ],
      quotationId: generateQuotationId(),
      estimatedResponse: "24-48 hours",
      timestamp: new Date().toISOString(),
      options: [
        "Track this request",
        "Speak with consultant",
        "Return to main menu"
      ]
    }), { headers });
  }

  return new Response(JSON.stringify({
    reply: "Quotation Request Service 📋",
    message: "Please provide your project details to receive a customized quotation.",
    requiredInfo: [
      "Project type (residential/commercial/hospitality)",
      "Approximate budget range",
      "Timeline requirements",
      "Contact information"
    ],
    examples: {
      projectType: ["Residential Interior", "Office Fitout", "Restaurant Design", "Retail Space"],
      budget: ["$10k-25k", "$25k-50k", "$50k-100k", "$100k+"],
      timeline: ["1-2 months", "2-3 months", "3-6 months", "6+ months"]
    },
    timestamp: new Date().toISOString()
  }), { headers });
}

/**
 * Handle delivery tracking requests
 */
async function handleDeliveryTracking(request, headers) {
  if (request.method === 'POST') {
    const data = await request.json().catch(() => ({}));
    const { trackingId, orderId } = data;

    return new Response(JSON.stringify({
      reply: "Delivery Tracking Information 🚚",
      trackingId: trackingId || generateTrackingId(),
      status: "In Progress",
      currentStage: "Materials Preparation",
      estimatedDelivery: "3-5 business days",
      updates: [
        { stage: "Order Confirmed", date: "2024-01-15", status: "completed" },
        { stage: "Materials Sourced", date: "2024-01-17", status: "completed" },
        { stage: "Quality Check", date: "2024-01-18", status: "in_progress" },
        { stage: "Dispatch", date: "TBD", status: "pending" },
        { stage: "Delivery", date: "TBD", status: "pending" }
      ],
      contactInfo: {
        email: "logistics@designfitout.com",
        phone: "+1-555-FITOUT"
      },
      timestamp: new Date().toISOString(),
      options: [
        "Get updates via SMS",
        "Speak with logistics team",
        "Return to main menu"
      ]
    }), { headers });
  }

  return new Response(JSON.stringify({
    reply: "Track Your Delivery 🚚",
    message: "Enter your tracking ID or order number to get real-time delivery updates.",
    inputRequired: [
      "Tracking ID (format: TR-XXXXX-XXXX)",
      "Order ID (format: ORD-XXXXXX)"
    ],
    helpText: "You can find your tracking information in your order confirmation email.",
    timestamp: new Date().toISOString()
  }), { headers });
}

/**
 * Handle support requests
 */
async function handleSupportRequest(request, headers) {
  if (request.method === 'POST') {
    const data = await request.json().catch(() => ({}));
    const { supportType, urgency, description } = data;

    return new Response(JSON.stringify({
      reply: "Support Request Received 🛠️",
      message: "We've created a support ticket for you and our team will respond shortly.",
      ticketId: generateTicketId(),
      supportType: supportType || "General Inquiry",
      urgency: urgency || "Normal",
      responseTime: urgency === 'urgent' ? "2-4 hours" : "24 hours",
      assignedTeam: getSupportTeam(supportType),
      timestamp: new Date().toISOString(),
      options: [
        "Check ticket status",
        "Add more details",
        "Request callback",
        "Return to main menu"
      ]
    }), { headers });
  }

  return new Response(JSON.stringify({
    reply: "Connect with Support 🛠️",
    message: "Our support team is here to help! Please select the type of support you need.",
    supportTypes: [
      { type: "Technical Support", description: "Issues with installations, products, or services" },
      { type: "Design Consultation", description: "Questions about design options and recommendations" },
      { type: "Billing & Payments", description: "Invoice questions, payment issues, or billing inquiries" },
      { type: "Project Management", description: "Timeline, scheduling, or project coordination" },
      { type: "General Inquiry", description: "Other questions or information requests" }
    ],
    urgencyLevels: ["Low", "Normal", "High", "Urgent"],
    businessHours: "Monday-Friday, 9 AM - 6 PM EST",
    emergencyContact: "For urgent technical issues: +1-555-URGENT",
    timestamp: new Date().toISOString()
  }), { headers });
}

/**
 * Utility functions for generating IDs and managing support
 */
function generateConversationId() {
  return `CONV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateQuotationId() {
  return `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function generateTrackingId() {
  return `TR-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function generateTicketId() {
  return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function getSupportTeam(supportType) {
  const teams = {
    'Technical Support': 'Engineering Team',
    'Design Consultation': 'Design Team',
    'Billing & Payments': 'Finance Team',
    'Project Management': 'Operations Team',
    'General Inquiry': 'Customer Service Team'
  };
  return teams[supportType] || 'Customer Service Team';
}

// Alternative export for Node.js environments (Google Cloud Functions, AWS Lambda, etc.)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    handleChatRequest,
    handleMainChat,
    handleQuotationRequest,
    handleDeliveryTracking,
    handleSupportRequest
  };
}