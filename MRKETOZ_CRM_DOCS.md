# MrketOz CRM - Chat Endpoint Documentation

## Overview

The MrketOz CRM `/chat` endpoint provides dynamic customer operations and engagement capabilities through automated workflows. The implementation is cloud-agnostic and supports multiple deployment platforms.

## Features

- **Automated Response System**: Instant responses to customer queries
- **Dynamic Interaction Options**: Three main customer service paths
- **Security Restrictions**: Admin-only access controls
- **JSON-based Responses**: Structured data for easy integration
- **Multi-cloud Compatibility**: Works with Cloudflare Workers, Google Cloud Functions, AWS Lambda, and more

## Endpoints

### Primary Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | GET | Main chat interface with welcome message |
| `/chat` | POST | Process customer messages and actions |
| `/chat/quotation` | GET/POST | Handle quotation requests |
| `/chat/delivery` | GET/POST | Track delivery status |
| `/chat/support` | GET/POST | Connect with support team |
| `/health` | GET | Health check endpoint |

### Admin Endpoints (Restricted)

Admin endpoints require proper authorization header with `support@designfitout.com`:

| Endpoint | Description |
|----------|-------------|
| `/chat/admin/analytics` | View customer interaction analytics |
| `/chat/admin/queue` | Manage customer service queue |
| `/chat/admin/reports` | Export customer interaction reports |

## API Usage

### Basic Chat Interaction

```bash
# GET welcome message
curl https://your-domain.com/chat

# Response:
{
  "reply": "Hello 👋, welcome to MrketOz CRM in motion mode! How can we assist you today?",
  "options": ["Request Quotation", "Track Delivery", "Connect Support"],
  "endpoints": {
    "quotation": "/chat/quotation",
    "delivery": "/chat/delivery", 
    "support": "/chat/support"
  },
  "timestamp": "2024-01-20T10:30:00.000Z",
  "status": "active"
}
```

### Start Conversation

```bash
curl -X POST https://your-domain.com/chat \
  -H "Content-Type: application/json" \
  -d '{"action": "start_conversation"}'

# Response:
{
  "reply": "Thank you for contacting MrketOz CRM! I'm here to help you with your design and fitout needs.",
  "conversationId": "CONV-1642680600000-abc123def",
  "options": ["Request Quotation", "Track Delivery", "Connect Support"],
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Request Quotation

```bash
curl -X POST https://your-domain.com/chat/quotation \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "Residential Interior",
    "budget": "$25k-50k",
    "timeline": "2-3 months",
    "contactInfo": "john@example.com"
  }'

# Response:
{
  "reply": "Thank you for your quotation request! 📋",
  "message": "We've received your information and will prepare a detailed quotation for you.",
  "nextSteps": [
    "Our design team will review your requirements",
    "You'll receive a preliminary quote within 24-48 hours",
    "A design consultant will contact you to discuss details"
  ],
  "quotationId": "QUOTE-1642680600000-ABC123",
  "estimatedResponse": "24-48 hours",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Track Delivery

```bash
curl -X POST https://your-domain.com/chat/delivery \
  -H "Content-Type: application/json" \
  -d '{"trackingId": "TR-ABC12-XYZ9"}'

# Response:
{
  "reply": "Delivery Tracking Information 🚚",
  "trackingId": "TR-ABC12-XYZ9",
  "status": "In Progress",
  "currentStage": "Materials Preparation",
  "estimatedDelivery": "3-5 business days",
  "updates": [
    {"stage": "Order Confirmed", "date": "2024-01-15", "status": "completed"},
    {"stage": "Materials Sourced", "date": "2024-01-17", "status": "completed"},
    {"stage": "Quality Check", "date": "2024-01-18", "status": "in_progress"}
  ]
}
```

### Get Support

```bash
curl -X POST https://your-domain.com/chat/support \
  -H "Content-Type: application/json" \
  -d '{
    "supportType": "Technical Support",
    "urgency": "High",
    "description": "Installation issue with kitchen fixtures"
  }'

# Response:
{
  "reply": "Support Request Received 🛠️",
  "message": "We've created a support ticket for you and our team will respond shortly.",
  "ticketId": "TICKET-1642680600000-SUP456",
  "supportType": "Technical Support",
  "urgency": "High",
  "responseTime": "2-4 hours",
  "assignedTeam": "Engineering Team"
}
```

## Deployment

### Cloud Provider Configuration

The endpoint supports multiple cloud providers through different export formats:

#### Cloudflare Workers

Deploy directly to Cloudflare Workers:

```bash
# Deploy to Cloudflare Workers
wrangler publish functions/mrketoz-crm-chat.js --name mrketoz-crm --route "/chat/*"
```

#### Google Cloud Functions

Deploy to Google Cloud Functions:

```bash
# Deploy to Google Cloud Functions
gcloud functions deploy chat \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point chat \
  --source functions/
```

#### AWS Lambda

Deploy to AWS Lambda:

```bash
# Package and deploy to AWS Lambda
zip -r mrketoz-crm.zip functions/
aws lambda create-function \
  --function-name mrketoz-crm-chat \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://mrketoz-crm.zip
```

#### Other Platforms

The implementation follows standard serverless patterns and can be adapted for:
- Azure Functions
- Vercel Functions
- Netlify Functions
- Self-hosted Node.js servers

### Security Configuration

#### Admin Access Restriction

Admin endpoints are protected by checking the `authorization` header:

```bash
# Admin request example
curl -X GET https://your-domain.com/chat \
  -H "Authorization: Bearer support@designfitout.com"
```

#### CORS Configuration

All endpoints include CORS headers for cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Environment Variables

Configure the following environment variables for enhanced security:

```bash
ADMIN_EMAIL=support@designfitout.com
CRM_NAME=MrketOz CRM
ALLOWED_ORIGINS=https://fitoutlab.app,https://designfitout.com
```

## Testing

### Run Tests

```bash
# Test MrketOz CRM functionality
node test-mrketoz-crm.js

# Test overall system compatibility
node test-brand-neutrality.js
```

### Manual Testing

```bash
# Test health endpoint
curl https://your-domain.com/health

# Test main chat endpoint
curl https://your-domain.com/chat

# Test invalid endpoint
curl https://your-domain.com/chat/invalid
```

## Monitoring

### Performance Metrics

The implementation includes built-in performance monitoring:

- Response times for all endpoints
- Error rate tracking
- Customer interaction analytics
- Admin usage statistics

### Health Checks

Health check endpoint provides system status:

```bash
curl https://your-domain.com/health

# Response:
{
  "status": "healthy",
  "service": "MrketOz CRM",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Logging

All interactions are logged with:
- Timestamp
- Endpoint accessed
- Response time
- User agent (if available)
- Admin access attempts

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: Browser blocks requests due to CORS policy
**Solution**: Ensure your deployment includes CORS headers

```javascript
// Add to your deployment configuration
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}
```

#### 2. Function Not Found

**Problem**: 404 errors when accessing `/chat`
**Solution**: Verify routing configuration

```bash
# Check if function is deployed
curl https://your-domain.com/health

# Verify routing rules in your cloud provider console
```

#### 3. Admin Access Denied

**Problem**: Admin endpoints return unauthorized
**Solution**: Check authorization header format

```bash
# Correct format
curl -H "Authorization: Bearer support@designfitout.com" /chat
```

#### 4. Timeout Issues

**Problem**: Requests timeout or take too long
**Solution**: Optimize function cold starts

```javascript
// Keep functions warm with periodic health checks
setInterval(() => {
  fetch('/health');
}, 5 * 60 * 1000); // Every 5 minutes
```

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=true
```

### Support Contacts

For deployment and configuration issues:

- **Technical Support**: `support@designfitout.com`
- **Documentation**: See `README.md` and `DEVELOPMENT.md`
- **Issues**: Create GitHub issues in the repository

## Integration Examples

### Frontend Integration

```javascript
// React component example
const ChatWidget = () => {
  const [chatData, setChatData] = useState(null);
  
  useEffect(() => {
    fetch('/chat')
      .then(res => res.json())
      .then(data => setChatData(data));
  }, []);
  
  return (
    <div>
      <h3>{chatData?.reply}</h3>
      {chatData?.options?.map(option => (
        <button key={option}>{option}</button>
      ))}
    </div>
  );
};
```

### Mobile App Integration

```swift
// iOS Swift example
func loadChatOptions() {
    guard let url = URL(string: "https://your-domain.com/chat") else { return }
    
    URLSession.shared.dataTask(with: url) { data, response, error in
        if let data = data {
            let chatResponse = try? JSONDecoder().decode(ChatResponse.self, from: data)
            DispatchQueue.main.async {
                self.updateUI(with: chatResponse)
            }
        }
    }.resume()
}
```

### Backend Integration

```python
# Python backend integration
import requests

def get_chat_options():
    response = requests.get('https://your-domain.com/chat')
    return response.json()

def submit_quotation_request(project_data):
    response = requests.post(
        'https://your-domain.com/chat/quotation',
        json=project_data
    )
    return response.json()
```

## Version History

- **v1.0.0** - Initial MrketOz CRM implementation
  - Basic chat endpoint
  - Quotation, delivery, and support workflows
  - Cloud-agnostic deployment
  - Admin security restrictions
  - Comprehensive testing suite