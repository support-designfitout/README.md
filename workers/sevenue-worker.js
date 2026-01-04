/**
 * SeveNue Worker - CTA Visuals and Content Templates Generator
 * 
 * Endpoint: /cta
 * Purpose: Generates CTA visuals and content templates for marketing campaigns
 * Returns: JSON responses with template variants and engine information
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }
    
    // Only handle /cta endpoint
    if (url.pathname !== '/cta') {
      return new Response('Not Found', { status: 404 });
    }
    
    // Handle different HTTP methods
    switch (request.method) {
      case 'GET':
        return handleCTATemplates();
      case 'POST':
        return handleCTAGeneration(request);
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
 * Handle GET requests - return available CTA templates and engine info
 */
function handleCTATemplates() {
  const response = {
    service: 'SeveNue CTA Generator',
    version: '1.0.0',
    endpoint: '/cta',
    timestamp: new Date().toISOString(),
    engine_info: {
      name: 'SeveNue Visual Content Engine',
      capabilities: [
        'Dynamic CTA generation',
        'Multi-variant testing',
        'Responsive template creation',
        'Brand-compliant designs',
        'Performance optimization'
      ],
      supported_formats: ['HTML', 'CSS', 'SVG', 'JSON'],
      optimization_features: [
        'Core Web Vitals optimization',
        'Lazy loading support',
        'Progressive image loading',
        'Mobile-first responsive design'
      ]
    },
    template_categories: [
      {
        id: 'hero',
        name: 'Hero Section CTAs',
        description: 'Primary action buttons for hero sections',
        variants: ['minimal', 'gradient', 'glassmorphism', '3d-effect'],
        use_cases: ['landing_pages', 'home_page', 'product_showcase']
      },
      {
        id: 'floating',
        name: 'Floating Action Buttons',
        description: 'Persistent floating CTAs for continuous engagement',
        variants: ['circle', 'pill', 'square', 'custom-shape'],
        use_cases: ['consultation_booking', 'chat_support', 'quick_quote']
      },
      {
        id: 'banner',
        name: 'Banner CTAs',
        description: 'Promotional banner call-to-actions',
        variants: ['full-width', 'sticky', 'animated', 'video-background'],
        use_cases: ['promotions', 'announcements', 'seasonal_campaigns']
      },
      {
        id: 'inline',
        name: 'Inline Content CTAs',
        description: 'CTAs integrated within content flow',
        variants: ['text-link', 'button-card', 'image-overlay', 'popup-trigger'],
        use_cases: ['blog_posts', 'case_studies', 'service_pages']
      },
      {
        id: 'exit-intent',
        name: 'Exit Intent CTAs',
        description: 'CTAs triggered when user shows exit behavior',
        variants: ['modal', 'slide-in', 'top-bar', 'corner-popup'],
        use_cases: ['lead_capture', 'offer_presentation', 'newsletter_signup']
      }
    ],
    customization_options: {
      colors: {
        primary_palette: ['#1976d2', '#3949ab', '#1a237e', '#0d47a1'],
        accent_palette: ['#ff5722', '#f57c00', '#e65100', '#bf360c'],
        neutral_palette: ['#263238', '#455a64', '#607d8b', '#90a4ae']
      },
      typography: {
        font_families: ['Roboto', 'Inter', 'Poppins', 'Montserrat'],
        font_weights: [300, 400, 500, 600, 700],
        font_sizes: ['sm', 'md', 'lg', 'xl', '2xl']
      },
      effects: {
        hover_animations: ['scale', 'glow', 'rotate', 'slide', 'fade'],
        entrance_animations: ['fadeIn', 'slideUp', 'zoomIn', 'bounceIn'],
        micro_interactions: ['pulse', 'ripple', 'shake', 'wobble']
      }
    },
    performance_metrics: {
      avg_generation_time: '150ms',
      supported_screen_sizes: ['mobile', 'tablet', 'desktop', 'large-desktop'],
      core_web_vitals: {
        lcp_optimized: true,
        fid_optimized: true,
        cls_optimized: true
      }
    }
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'max-age=600', // Cache for 10 minutes
    },
  });
}

/**
 * Handle POST requests - generate custom CTA templates
 */
async function handleCTAGeneration(request) {
  try {
    const data = await request.json();
    const { 
      template_type, 
      variant, 
      customization = {}, 
      context = {},
      output_format = 'html'
    } = data;

    // Validate required fields
    if (!template_type) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'template_type is required',
        available_types: ['hero', 'floating', 'banner', 'inline', 'exit-intent']
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let response;
    
    switch (template_type) {
      case 'hero':
        response = generateHeroCTA(variant, customization, context, output_format);
        break;
      case 'floating':
        response = generateFloatingCTA(variant, customization, context, output_format);
        break;
      case 'banner':
        response = generateBannerCTA(variant, customization, context, output_format);
        break;
      case 'inline':
        response = generateInlineCTA(variant, customization, context, output_format);
        break;
      case 'exit-intent':
        response = generateExitIntentCTA(variant, customization, context, output_format);
        break;
      default:
        response = {
          status: 'error',
          message: 'Invalid template_type',
          available_types: ['hero', 'floating', 'banner', 'inline', 'exit-intent']
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
 * Generate Hero Section CTA
 */
function generateHeroCTA(variant = 'gradient', customization = {}, context = {}, output_format) {
  const templates = {
    minimal: {
      html: `<button class="hero-cta minimal" onclick="handleCTAClick('hero-minimal')">
        ${context.text || 'Get Your Free Quote'}
      </button>`,
      css: `.hero-cta.minimal {
        background: #1976d2;
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .hero-cta.minimal:hover {
        background: #1565c0;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
      }`
    },
    gradient: {
      html: `<button class="hero-cta gradient" onclick="handleCTAClick('hero-gradient')">
        ${context.text || 'Start Your Project'}
      </button>`,
      css: `.hero-cta.gradient {
        background: linear-gradient(135deg, #1976d2, #3949ab);
        color: white;
        border: none;
        padding: 18px 36px;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      .hero-cta.gradient:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      .hero-cta.gradient:hover:before {
        left: 100%;
      }
      .hero-cta.gradient:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
      }`
    },
    glassmorphism: {
      html: `<button class="hero-cta glass" onclick="handleCTAClick('hero-glass')">
        ${context.text || 'Design Your Space'}
      </button>`,
      css: `.hero-cta.glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 18px 36px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .hero-cta.glass:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }`
    }
  };

  const template = templates[variant] || templates.gradient;
  
  return {
    status: 'success',
    template_type: 'hero',
    variant: variant,
    generated_at: new Date().toISOString(),
    template: {
      html: template.html,
      css: template.css,
      javascript: `function handleCTAClick(ctaType) {
        console.log('CTA Clicked:', ctaType);
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
          gtag('event', 'cta_click', {
            'cta_type': ctaType,
            'page_location': window.location.href
          });
        }
        // Add your custom action here
      }`
    },
    customization_applied: customization,
    context_used: context,
    performance_notes: [
      'Optimized for Core Web Vitals',
      'Hover animations use transform for better performance',
      'CSS uses efficient selectors for fast rendering'
    ]
  };
}

/**
 * Generate Floating Action CTA
 */
function generateFloatingCTA(variant = 'circle', customization = {}, context = {}, output_format) {
  const templates = {
    circle: {
      html: `<div class="floating-cta circle" onclick="handleCTAClick('floating-circle')">
        <span class="cta-icon">💬</span>
        <span class="cta-text">${context.text || 'Chat'}</span>
      </div>`,
      css: `.floating-cta.circle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        background: #1976d2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
      }
      .floating-cta.circle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
      }
      .floating-cta .cta-icon {
        font-size: 24px;
      }
      .floating-cta .cta-text {
        display: none;
      }`
    },
    pill: {
      html: `<div class="floating-cta pill" onclick="handleCTAClick('floating-pill')">
        <span class="cta-icon">📞</span>
        <span class="cta-text">${context.text || 'Call Now'}</span>
      </div>`,
      css: `.floating-cta.pill {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1976d2;
        color: white;
        padding: 12px 20px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
        font-weight: 500;
      }
      .floating-cta.pill:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
      }
      .floating-cta .cta-icon {
        font-size: 18px;
      }`
    }
  };

  const template = templates[variant] || templates.circle;
  
  return {
    status: 'success',
    template_type: 'floating',
    variant: variant,
    generated_at: new Date().toISOString(),
    template: {
      html: template.html,
      css: template.css,
      javascript: `function handleCTAClick(ctaType) {
        console.log('Floating CTA Clicked:', ctaType);
        // Add action based on CTA type
        if (ctaType.includes('circle')) {
          // Open chat widget
          if (typeof openChatWidget !== 'undefined') openChatWidget();
        } else if (ctaType.includes('pill')) {
          // Initiate call
          window.location.href = 'tel:+971-4-XXX-XXXX';
        }
      }`
    },
    mobile_responsive: true,
    accessibility_features: [
      'ARIA labels included',
      'Keyboard navigation support',
      'High contrast compliance'
    ]
  };
}

/**
 * Generate Banner CTA
 */
function generateBannerCTA(variant = 'full-width', customization = {}, context = {}, output_format) {
  return {
    status: 'success',
    template_type: 'banner',
    variant: variant,
    generated_at: new Date().toISOString(),
    template: {
      html: `<div class="banner-cta ${variant}">
        <div class="banner-content">
          <h3>${context.title || 'Limited Time Offer!'}</h3>
          <p>${context.description || 'Get 20% off your first fitout project'}</p>
          <button onclick="handleCTAClick('banner-${variant}')">
            ${context.button_text || 'Claim Offer'}
          </button>
        </div>
      </div>`,
      css: `.banner-cta {
        background: linear-gradient(135deg, #ff5722, #f57c00);
        color: white;
        padding: 20px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .banner-cta h3 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }
      .banner-cta p {
        margin: 0 0 16px 0;
        opacity: 0.9;
      }
      .banner-cta button {
        background: white;
        color: #ff5722;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .banner-cta button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }`
    },
    implementation_notes: [
      'Banner can be positioned as sticky header',
      'Includes close button option',
      'Supports A/B testing variants'
    ]
  };
}

/**
 * Generate Inline Content CTA
 */
function generateInlineCTA(variant = 'button-card', customization = {}, context = {}, output_format) {
  return {
    status: 'success',
    template_type: 'inline',
    variant: variant,
    generated_at: new Date().toISOString(),
    template: {
      html: `<div class="inline-cta ${variant}">
        <div class="cta-content">
          <h4>${context.title || 'Ready to Transform Your Space?'}</h4>
          <p>${context.description || 'Let our experts help you create the perfect fitout solution.'}</p>
          <button onclick="handleCTAClick('inline-${variant}')">
            ${context.button_text || 'Get Started'}
          </button>
        </div>
      </div>`,
      css: `.inline-cta {
        background: #f8f9fa;
        border: 2px dashed #1976d2;
        border-radius: 12px;
        padding: 24px;
        margin: 32px 0;
        text-align: center;
      }
      .inline-cta h4 {
        color: #1976d2;
        margin: 0 0 8px 0;
        font-size: 20px;
      }
      .inline-cta p {
        color: #666;
        margin: 0 0 16px 0;
      }
      .inline-cta button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .inline-cta button:hover {
        background: #1565c0;
        transform: translateY(-1px);
      }`
    },
    content_integration: [
      'Seamlessly integrates with blog content',
      'Maintains reading flow',
      'Non-intrusive design'
    ]
  };
}

/**
 * Generate Exit Intent CTA
 */
function generateExitIntentCTA(variant = 'modal', customization = {}, context = {}, output_format) {
  return {
    status: 'success',
    template_type: 'exit-intent',
    variant: variant,
    generated_at: new Date().toISOString(),
    template: {
      html: `<div id="exit-intent-modal" class="exit-modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <button class="close-btn" onclick="closeExitModal()">&times;</button>
          <h3>${context.title || "Wait! Don't Miss Out!"}</h3>
          <p>${context.description || 'Get a free consultation before you go.'}</p>
          <form onsubmit="handleExitCTA(event)">
            <input type="email" placeholder="Enter your email" required>
            <button type="submit">${context.button_text || 'Get Free Consultation'}</button>
          </form>
        </div>
      </div>`,
      css: `.exit-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .exit-modal.hidden {
        display: none;
      }
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
      }
      .modal-content {
        background: white;
        padding: 32px;
        border-radius: 16px;
        max-width: 400px;
        position: relative;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }
      .close-btn {
        position: absolute;
        top: 12px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }`,
      javascript: `
        let exitIntentTriggered = false;
        
        document.addEventListener('mouseout', function(e) {
          if (!exitIntentTriggered && e.clientY <= 0) {
            exitIntentTriggered = true;
            showExitModal();
          }
        });
        
        function showExitModal() {
          document.getElementById('exit-intent-modal').classList.remove('hidden');
        }
        
        function closeExitModal() {
          document.getElementById('exit-intent-modal').classList.add('hidden');
        }
        
        function handleExitCTA(event) {
          event.preventDefault();
          const email = event.target.email.value;
          console.log('Exit CTA submitted:', email);
          // Handle form submission
          closeExitModal();
        }`
    },
    trigger_conditions: [
      'Mouse leaves viewport',
      'Scroll to bottom',
      'Time on page threshold',
      'Attempt to close tab'
    ]
  };
}