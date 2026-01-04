/**
 * Designfitout-Github - Cloud Functions Entry Point
 * Cloud-agnostic serverless functions for the platform
 */

// Import MrketOz CRM chat functionality
const chatHandler = require('./mrketoz-crm-chat');

// Import BIM services
const digitalTwinHandler = require('./bim-digital-twin');
const clashDetectionHandler = require('./bim-clash-detection');
const smartMaterialsHandler = require('./bim-smart-materials');
const documentationHandler = require('./bim-documentation');
const sustainabilityHandler = require('./bim-sustainability');

// Cloudflare Worker format
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

    // Route to MrketOz CRM chat endpoints
    if (url.pathname.startsWith('/chat')) {
      return chatHandler.handleChatRequest(request, url);
    }

    // Route to BIM Digital Twin endpoints
    if (url.pathname.includes('/projects/') && url.pathname.includes('/twin')) {
      return digitalTwinHandler.handleDigitalTwinRequest(request, url);
    }

    // Route to BIM Clash Detection endpoints
    if (url.pathname.includes('/projects/') && (url.pathname.includes('/clash-detection') || url.pathname.includes('/clash-report'))) {
      return clashDetectionHandler.handleClashDetectionRequest(request, url);
    }

    // Route to Smart Materials endpoints
    if (url.pathname.includes('/materials')) {
      return smartMaterialsHandler.handleSmartMaterialRequest(request, url);
    }

    // Route to Documentation endpoints
    if (url.pathname.includes('/projects/') && url.pathname.includes('/docs')) {
      return documentationHandler.handleDocumentationRequest(request, url);
    }

    // Route to Sustainability Analytics endpoints
    if (url.pathname.includes('/projects/') && url.pathname.includes('/analytics')) {
      return sustainabilityHandler.handleSustainabilityRequest(request, url);
    }

    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/api/status') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Designfitout Cloud Functions',
        timestamp: new Date().toISOString(),
        endpoints: {
          chat: '/chat',
          quotation: '/chat/quotation', 
          delivery: '/chat/delivery',
          support: '/chat/support',
          // BIM endpoints
          digital_twin: '/projects/:id/twin',
          clash_detection: '/projects/:id/clash-detection',
          materials: '/materials/:id',
          documentation: '/projects/:id/docs',
          analytics: '/projects/:id/analytics'
        }
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Default response
    return new Response(JSON.stringify({
      message: 'Designfitout Cloud Functions',
      availableEndpoints: ['/chat', '/health', '/api/status'],
      timestamp: new Date().toISOString()
    }), {
      headers: { 'content-type': 'application/json' }
    });
  }
};

// Google Cloud Functions format
exports.chat = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const mockRequest = {
      method: req.method,
      url: `https://example.com${req.path}`,
      headers: {
        get: (name) => req.get(name)
      },
      json: () => Promise.resolve(req.body)
    };

    const mockUrl = {
      pathname: req.path
    };

    // Route requests based on path
    if (req.path.startsWith('/chat')) {
      const response = await chatHandler.handleChatRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else if (req.path.includes('/twin')) {
      const response = await digitalTwinHandler.handleDigitalTwinRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else if (req.path.includes('/clash-detection') || req.path.includes('/clash-report')) {
      const response = await clashDetectionHandler.handleClashDetectionRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else if (req.path.includes('/materials')) {
      const response = await smartMaterialsHandler.handleSmartMaterialRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else if (req.path.includes('/docs')) {
      const response = await documentationHandler.handleDocumentationRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else if (req.path.includes('/analytics')) {
      const response = await sustainabilityHandler.handleSustainabilityRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    } else {
      // Default to chat handler for backward compatibility
      const response = await chatHandler.handleChatRequest(mockRequest, mockUrl);
      const data = await response.json();
      res.status(response.status || 200).json(data);
    }
  } catch (error) {
    console.error('Cloud function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// AWS Lambda format
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    const mockRequest = {
      method: event.httpMethod,
      url: `https://example.com${event.path}`,
      headers: {
        get: (name) => event.headers[name.toLowerCase()]
      },
      json: () => Promise.resolve(JSON.parse(event.body || '{}'))
    };

    const mockUrl = {
      pathname: event.path
    };

    // Route requests based on path
    if (event.path.startsWith('/chat')) {
      const response = await chatHandler.handleChatRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.path.includes('/twin')) {
      const response = await digitalTwinHandler.handleDigitalTwinRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.path.includes('/clash-detection') || event.path.includes('/clash-report')) {
      const response = await clashDetectionHandler.handleClashDetectionRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.path.includes('/materials')) {
      const response = await smartMaterialsHandler.handleSmartMaterialRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.path.includes('/docs')) {
      const response = await documentationHandler.handleDocumentationRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else if (event.path.includes('/analytics')) {
      const response = await sustainabilityHandler.handleSustainabilityRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    } else {
      // Default to chat handler for backward compatibility
      const response = await chatHandler.handleChatRequest(mockRequest, mockUrl);
      const data = await response.json();
      return {
        statusCode: response.status || 200,
        headers,
        body: JSON.stringify(data)
      };
    }
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};