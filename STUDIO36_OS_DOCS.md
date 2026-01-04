# Studio36 OS - Design & Fitout Platform

Studio36 OS is a comprehensive platform for managing design and fitout projects, integrating mood boards, material samples, vendor profiles, contractor management, and delivery tracking.

## Overview

Studio36 OS provides the following core modules:

- **Mood Boards** - Interactive visual boards with AI-curated material suggestions
- **Sample Requests** - Sample request management with courier integration
- **Material Delivery** - Delivery tracking and logistics management
- **Vendor Profiles** - Vendor registration, portfolios, and rating systems
- **Contractor Management** - Booking system and scheduling automation
- **Visibility & Marketing** - Adaptive feed targeting and referral campaigns

## Integration with Existing Modules

Studio36 OS integrates seamlessly with:

- **MaterialHUB** - Material catalog and specification management
- **FitOut Lab App** - Dashboard integration for delivery tracking
- **ZmntOS** - Routing and logistics optimization
- **MrketOS** - Adaptive feed and smart targeting

## API Endpoints

### Mood Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/mood-boards` | Create a new mood board |
| GET | `/api/studio36/mood-boards/:id` | Get mood board details |
| POST | `/api/studio36/mood-boards/:id/materials` | Add material to board |
| GET | `/api/studio36/mood-boards/:id/suggestions` | Get AI suggestions |
| GET | `/api/studio36/mood-boards/:id/export` | Export to MaterialHUB |

### Sample Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/samples` | Create sample request |
| GET | `/api/studio36/samples/:id` | Get request details |
| PUT | `/api/studio36/samples/:id/status` | Update request status |
| POST | `/api/studio36/samples/:id/cancel` | Cancel request |

### Material Delivery

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/deliveries` | Create delivery |
| GET | `/api/studio36/deliveries/:id` | Get tracking info |
| PUT | `/api/studio36/deliveries/:id/tracking` | Update tracking |
| GET | `/api/studio36/deliveries/scheduled` | Get scheduled deliveries |
| POST | `/api/studio36/deliveries/:id/optimize-route` | Optimize via ZmntOS |

### Vendor Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/vendors` | Register vendor |
| GET | `/api/studio36/vendors` | Search vendors |
| GET | `/api/studio36/vendors/:id` | Get vendor profile |
| POST | `/api/studio36/vendors/:id/portfolio` | Upload portfolio |
| POST | `/api/studio36/vendors/:id/premium` | Upgrade to premium |
| POST | `/api/studio36/vendors/:id/verify` | Verify vendor |
| POST | `/api/studio36/vendors/:id/reviews` | Add review |
| GET | `/api/studio36/vendors/:id/reviews` | Get reviews |
| POST | `/api/studio36/vendors/:id/social-media` | Link social media |

### Contractor Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/contractors` | Register contractor |
| GET | `/api/studio36/contractors/:id` | Get contractor |
| GET | `/api/studio36/contractors/:id/schedule` | Get schedule |
| GET | `/api/studio36/contractors/search-portals` | List portals |
| GET | `/api/studio36/contractors/search/:portal` | Portal search |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/bookings` | Create booking |
| POST | `/api/studio36/bookings/:id/confirm` | Confirm booking |

### Visibility & Marketing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/studio36/feed` | Get adaptive feed |
| POST | `/api/studio36/campaigns` | Create campaign |
| GET | `/api/studio36/campaigns/:id/metrics` | Get metrics |
| POST | `/api/studio36/campaigns/:id/track` | Track event |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/projects` | Create project |
| GET | `/api/studio36/projects/:id/dashboard` | Get dashboard |

### Routing (ZmntOS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/studio36/routing/batch` | Batch optimization |
| POST | `/api/studio36/routing/workflow` | Workflow automation |

## Usage Examples

### Creating a Mood Board

```javascript
const response = await fetch('/api/studio36/mood-boards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Modern Villa Design',
    projectId: 'project_123',
    creatorId: 'user_456',
    templateId: 'residential_modern',
    description: 'Modern luxury residential design'
  })
});
```

### Requesting a Sample

```javascript
const response = await fetch('/api/studio36/samples', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vendorId: 'vendor_001',
    productId: 'prod_001',
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
  })
});
```

### Registering a Vendor

```javascript
const response = await fetch('/api/studio36/vendors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'Premium Floors Co',
    contactName: 'Jane Smith',
    email: 'jane@premiumfloors.com',
    phone: '+971501234567',
    category: 'materials',
    subcategories: ['flooring', 'wood'],
    regions: ['UAE', 'GCC']
  })
});
```

### Booking a Contractor

```javascript
const response = await fetch('/api/studio36/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractorId: 'contractor_001',
    projectId: 'project_123',
    clientId: 'user_456',
    clientName: 'John Doe',
    serviceType: 'installation',
    preferredDates: ['2024-02-15', '2024-02-16'],
    duration: 8,
    durationType: 'hours',
    location: { city: 'Dubai', country: 'UAE' }
  })
});
```

## Search Portals

Studio36 OS provides category-specific search portals:

- **aesthetic_suppliers** - Art, accessories, plants, signage
- **bulk_suppliers** - Construction materials, wholesale, industrial
- **regional_contractors** - General contractors, specialized services
- **installation_specialists** - Flooring, lighting, furniture installation

## AI Features

### LayrOps Intelligence

The mood board module uses LayrOps Intelligence for AI-curated material suggestions:

- Style matching based on project requirements
- Sustainability scoring
- Budget-based recommendations
- Template-aware suggestions

### LayrOps Scheduler

The contractor management module uses LayrOps for automated scheduling:

- Availability checking
- Route optimization
- Load balancing
- Reminder generation

### MrketOS Integration

Adaptive feed targeting provides personalized vendor recommendations:

- Search-based targeting
- Project-based targeting
- Location-based targeting
- Behavior-based targeting
- Budget-based targeting

## Testing

Run the Studio36 OS test suite:

```bash
npm run test:studio36-os
```

Run all tests including Studio36 OS:

```bash
npm run test:all
```

## File Structure

```
lib/studio36/
├── index.js              # Main integration module
├── mood-board.js         # Mood board management
├── sample-request.js     # Sample request handling
├── material-delivery.js  # Delivery tracking
├── vendor-profile.js     # Vendor management
├── contractor-management.js  # Contractor & booking
└── visibility-marketing.js   # MrketOS integration

functions/api/
└── studio36.js           # API endpoints
```

## Cloud-Agnostic Design

Studio36 OS follows cloud-agnostic principles:

- No hard-coded cloud provider references
- Configuration-driven deployment
- Works with any serverless platform (AWS Lambda, Google Cloud Functions, Cloudflare Workers)
- Follows the repository's brand neutrality guidelines
