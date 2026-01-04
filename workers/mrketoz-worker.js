/**
 * MrketOz Worker - Customer Operations Bot
 * 
 * Endpoint: /chat
 * Purpose: Acts as a customer operations bot providing support options
 * Returns: JSON responses with customer service options
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Only handle /chat endpoint
    if (url.pathname !== '/chat') {
      return new Response('Not Found', { status: 404 });
    }
    
    // Handle different HTTP methods
    switch (request.method) {
      case 'GET':
        return handleChatOptions();
      case 'POST':
        return handleChatInteraction(request);
      default:
        return new Response('Method Not Allowed', { status: 405 });
    }
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Handle GET requests - return available chat options
 */
function handleChatOptions() {
  const response = {
    service: 'MrketOz Customer Operations Bot',
    version: '1.0.0',
    endpoint: '/chat',
    timestamp: new Date().toISOString(),
    options: [
      {
        id: 'quote',
        title: 'Request Quotation',
        description: 'Get a detailed quote for your design and fitout project',
        action: 'POST /chat with action: "quote"',
        fields: ['project_type', 'space_size', 'location', 'budget_range', 'timeline']
      },
      {
        id: 'track',
        title: 'Track Delivery',
        description: 'Check the status of your ongoing project or delivery',
        action: 'POST /chat with action: "track"',
        fields: ['project_id', 'order_number', 'email']
      },
      {
        id: 'support',
        title: 'Connect Support',
        description: 'Connect with our customer support team for assistance',
        action: 'POST /chat with action: "support"',
        fields: ['inquiry_type', 'priority', 'contact_method', 'message']
      },
      {
        id: 'consultation',
        title: 'Schedule Consultation',
        description: 'Book a free consultation with our design experts',
        action: 'POST /chat with action: "consultation"',
        fields: ['preferred_date', 'preferred_time', 'consultation_type', 'contact_info']
      }
    ],
    features: {
      real_time_chat: true,
      file_upload: true,
      multilingual: ['en', 'ar'],
      business_hours: '9:00 AM - 6:00 PM GST (Sunday - Thursday)'
    }
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=300', // Cache for 5 minutes
    },
  });
}

/**
 * Handle POST requests - process chat interactions
 */
async function handleChatInteraction(request) {
  try {
    const data = await request.json();
    const { action, payload = {} } = data;

    let response;
    
    switch (action) {
      case 'quote':
        response = handleQuoteRequest(payload);
        break;
      case 'track':
        response = handleTrackingRequest(payload);
        break;
      case 'support':
        response = handleSupportRequest(payload);
        break;
      case 'consultation':
        response = handleConsultationRequest(payload);
        break;
      default:
        response = {
          status: 'error',
          message: 'Invalid action. Available actions: quote, track, support, consultation',
          available_actions: ['quote', 'track', 'support', 'consultation']
        };
    }

    return new Response(JSON.stringify(response, null, 2), {
      status: response.status === 'error' ? 400 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Invalid JSON payload',
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Handle quotation requests
 */
function handleQuoteRequest(payload) {
  const { project_type, space_size, location, budget_range, timeline, contact_info } = payload;
  
  // Validate required fields
  const requiredFields = ['project_type', 'space_size', 'location'];
  const missingFields = requiredFields.filter(field => !payload[field]);
  
  if (missingFields.length > 0) {
    return {
      status: 'error',
      message: 'Missing required fields',
      missing_fields: missingFields,
      required_fields: requiredFields
    };
  }

  // Generate quote ID
  const quoteId = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return {
    status: 'success',
    action: 'quote',
    message: 'Quote request received successfully',
    quote_id: quoteId,
    estimated_response_time: '2-4 business hours',
    next_steps: [
      'Our design team will review your requirements',
      'Site visit will be scheduled if needed',
      'Detailed quote will be prepared',
      'Quote will be sent to your registered email'
    ],
    contact_info: {
      email: 'quotes@designfitout.com',
      phone: '+971-4-XXX-XXXX',
      business_hours: '9:00 AM - 6:00 PM GST'
    },
    submitted_details: {
      project_type,
      space_size,
      location,
      budget_range: budget_range || 'Not specified',
      timeline: timeline || 'Flexible'
    }
  };
}

/**
 * Handle tracking requests
 */
function handleTrackingRequest(payload) {
  const { project_id, order_number, email } = payload;
  
  if (!project_id && !order_number) {
    return {
      status: 'error',
      message: 'Either project_id or order_number is required',
      required_fields: ['project_id OR order_number', 'email']
    };
  }

  // Mock tracking response
  const trackingId = project_id || order_number;
  
  return {
    status: 'success',
    action: 'track',
    message: 'Project tracking information retrieved',
    tracking_id: trackingId,
    project_status: 'In Progress',
    current_phase: 'Design Development',
    completion_percentage: 65,
    timeline: {
      started: '2024-11-15',
      estimated_completion: '2024-12-30',
      last_updated: new Date().toISOString().split('T')[0]
    },
    recent_updates: [
      {
        date: '2024-12-18',
        update: 'Materials procurement in progress',
        phase: 'Procurement'
      },
      {
        date: '2024-12-15',
        update: 'Design approval received from client',
        phase: 'Design Approval'
      },
      {
        date: '2024-12-10',
        update: 'Initial design concepts presented',
        phase: 'Concept Design'
      }
    ],
    next_milestone: 'Installation Phase - Expected Dec 22, 2024',
    contact_manager: {
      name: 'Project Manager',
      email: 'projects@designfitout.com',
      phone: '+971-4-XXX-XXXX'
    }
  };
}

/**
 * Handle support requests
 */
function handleSupportRequest(payload) {
  const { inquiry_type, priority = 'medium', contact_method = 'email', message } = payload;
  
  if (!inquiry_type || !message) {
    return {
      status: 'error',
      message: 'inquiry_type and message are required',
      required_fields: ['inquiry_type', 'message']
    };
  }

  const ticketId = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return {
    status: 'success',
    action: 'support',
    message: 'Support ticket created successfully',
    ticket_id: ticketId,
    priority: priority,
    inquiry_type: inquiry_type,
    estimated_response_time: priority === 'high' ? '1-2 hours' : '4-8 hours',
    support_channels: {
      email: 'support@designfitout.com',
      phone: '+971-4-XXX-XXXX',
      whatsapp: '+971-50-XXX-XXXX',
      live_chat: 'Available on website during business hours'
    },
    business_hours: '9:00 AM - 6:00 PM GST (Sunday - Thursday)',
    next_steps: [
      'Ticket assigned to appropriate team member',
      'Initial response within estimated timeframe',
      'Resolution or escalation as needed'
    ]
  };
}

/**
 * Handle consultation requests
 */
function handleConsultationRequest(payload) {
  const { preferred_date, preferred_time, consultation_type = 'general', contact_info } = payload;
  
  if (!contact_info || !contact_info.email) {
    return {
      status: 'error',
      message: 'Contact email is required',
      required_fields: ['contact_info.email']
    };
  }

  const consultationId = `CON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return {
    status: 'success',
    action: 'consultation',
    message: 'Consultation request scheduled successfully',
    consultation_id: consultationId,
    consultation_type: consultation_type,
    requested_schedule: {
      date: preferred_date || 'To be confirmed',
      time: preferred_time || 'To be confirmed'
    },
    available_times: [
      '9:00 AM - 10:00 AM',
      '11:00 AM - 12:00 PM',
      '2:00 PM - 3:00 PM',
      '4:00 PM - 5:00 PM'
    ],
    consultation_options: [
      'Office visit (Dubai location)',
      'Site visit (within UAE)',
      'Virtual meeting (Zoom/Teams)',
      'Phone consultation'
    ],
    what_to_expect: [
      'Free initial consultation (30-60 minutes)',
      'Discussion of project requirements',
      'Budget and timeline assessment',
      'Preliminary design concepts',
      'Next steps and proposal timeline'
    ],
    contact_info: {
      email: 'consultations@designfitout.com',
      phone: '+971-4-XXX-XXXX',
      office_address: 'Dubai, UAE (Exact address provided upon confirmation)'
    }
  };
}