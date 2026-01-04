# BIM-Enhanced Fitoutlab Backend Documentation

## Overview

The Fitoutlab backend has been enhanced with comprehensive BIM-driven functionality that provides real-time digital twin management, clash detection, smart material integration, automated documentation, and sustainability analytics. All services follow cloud-agnostic architecture principles and integrate seamlessly with the existing MrketOz CRM system.

## Core BIM Services

### 1. Digital Twin Service (`bim-digital-twin.js`)

**Purpose**: Maintains live digital twin models for each project with real-time updates and WebSocket-like broadcasting.

**Key Features**:
- Real-time model synchronization
- Property change tracking with version history
- Event-driven broadcasting to subscribers
- Multi-view data consistency
- Comprehensive change logging

**API Endpoints**:
```
GET    /projects/:id/twin          - Get digital twin data
POST   /projects/:id/twin          - Create/update digital twin
PUT    /projects/:id/twin          - Update specific twin property
GET    /projects/:id/events        - Get recent events
```

**Example Usage**:
```javascript
// Create/update digital twin
const response = await fetch('/projects/proj_001/twin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Office Building Project',
        spaces: [
            { id: 'space1', name: 'Reception', area: 200 },
            { id: 'space2', name: 'Conference Room', area: 300 }
        ],
        materials: [
            { id: 'mat1', name: 'Oak Flooring', quantity: 500, unit: 'sq_ft' }
        ],
        finishes: {
            walls: 'Paint - Eggshell White',
            floors: 'Oak Hardwood',
            ceilings: 'Acoustic Tile'
        }
    })
});
```

### 2. Clash Detection Service (`bim-clash-detection.js`)

**Purpose**: Automated clash detection microservice that identifies collisions between MEP, structural, and furniture layers.

**Key Features**:
- Multi-layer clash detection (MEP vs Structural, MEP vs Furniture, etc.)
- Proactive collision analysis with configurable tolerances
- Intelligent resolution suggestions
- Fire safety clearance validation
- Real-time dashboard integration

**API Endpoints**:
```
POST   /projects/:id/clash-detection - Run clash detection analysis
GET    /projects/:id/clash-report    - Get clash report
PUT    /projects/:id/resolve-clash   - Resolve specific clash
```

**Clash Types Detected**:
- MEP vs Structural (Critical priority)
- MEP vs Furniture (High priority) 
- Structural vs Furniture (Medium priority)
- MEP internal conflicts (High priority)
- Fire safety clearance violations (Critical priority)

**Example Usage**:
```javascript
// Run clash detection
const clashResponse = await fetch('/projects/proj_001/clash-detection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        layers: {
            mep: {
                elements: [
                    {
                        id: 'duct_01',
                        type: 'hvac_duct',
                        location: { x: 50, y: 25, z: 10 },
                        dimensions: { width: 24, height: 12, depth: 100 }
                    }
                ]
            },
            structural: {
                elements: [
                    {
                        id: 'beam_01', 
                        type: 'steel_beam',
                        location: { x: 50, y: 25, z: 11 },
                        dimensions: { width: 12, height: 18, depth: 100 }
                    }
                ]
            }
        }
    })
});
```

### 3. Smart Material Library Service (`bim-smart-materials.js`)

**Purpose**: Integrates with external materials API to provide real-time cost, availability, lead time, and sustainability metrics.

**Key Features**:
- Real-time supplier data integration
- Cost and availability tracking with multiple suppliers
- Lead time calculations with shipping optimization
- Sustainability metrics and certifications
- Smart recommendation engine with cost optimization

**API Endpoints**:
```
GET    /materials/search           - Search materials with filters
GET    /materials/:id              - Get material data with supplier info
```

**Query Parameters**:
- `location`: Project location for shipping calculations
- `quantity`: Quantity needed for volume discounts
- `category`: Material category filter
- `max_price`, `min_price`: Price range filters
- `min_sustainability`: Minimum sustainability score
- `available_only`: Filter to in-stock items only

**Example Usage**:
```javascript
// Search for materials
const materialsResponse = await fetch('/materials/search?' + new URLSearchParams({
    category: 'flooring',
    location: 'New York, NY',
    quantity: '1000',
    max_price: '10.00',
    min_sustainability: '70',
    available_only: 'true'
}));

// Get specific material with supplier data
const materialResponse = await fetch('/materials/hardwood_oak?' + new URLSearchParams({
    location: 'New York, NY',
    quantity: '500'
}));
```

### 4. Automated Documentation Engine (`bim-documentation.js`)

**Purpose**: Auto-generates plans, elevations, schedules, and specification sheets from BIM model data.

**Key Features**:
- Multiple document types (plans, elevations, schedules, specifications)
- PDF/DWG/PNG export formats
- Template-based document assembly
- Automatic material schedules and door schedules
- 3D visualization rendering
- Cloud-agnostic file storage URLs

**API Endpoints**:
```
POST   /projects/:id/docs                  - Generate document bundle
GET    /projects/:id/docs/:bundleId        - Get document bundle
GET    /projects/:id/docs/templates        - List available templates
```

**Document Types**:
- **floor_plan**: Architectural floor plans with dimensions
- **elevation**: Building elevations with materials
- **section**: Building sections with structure
- **material_schedule**: Comprehensive material lists
- **door_schedule**: Door specifications and hardware
- **specification_sheet**: Technical specifications
- **3d_rendering**: Photo-realistic renderings

**Example Usage**:
```javascript
// Generate document bundle
const docResponse = await fetch('/projects/proj_001/docs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        bimModel: {
            project: {
                name: 'Office Building Project',
                client: 'Acme Corp',
                architect: 'Smith Architecture'
            },
            materials: [
                { name: 'Oak Flooring', quantity: 1000, unit: 'sq_ft', cost: 8.50 }
            ],
            doors: [
                { mark: 'D1', width: 36, height: 84, type: 'Single' }
            ]
        },
        documentTypes: ['floor_plan', 'material_schedule'],
        format: 'PDF'
    })
});
```

### 5. Sustainability Analytics Service (`bim-sustainability.js`)

**Purpose**: Comprehensive sustainability analysis including energy modeling, daylight analysis, and lifecycle impact assessment.

**Key Features**:
- Embodied carbon calculations for all materials
- Energy consumption modeling by building type
- Daylight analysis with illuminance calculations  
- Lifecycle impact assessment over project lifespan
- Sustainability scoring and benchmarking
- Smart recommendations for improvement

**API Endpoints**:
```
POST   /projects/:id/analytics     - Run sustainability analysis
GET    /projects/:id/analytics     - Get cached analysis results
```

**Analysis Components**:
- **Embodied Carbon**: Material-by-material carbon footprint
- **Energy Consumption**: Annual energy modeling with monthly patterns
- **Daylight Analysis**: Space-by-space daylight factor calculations
- **Lifecycle Impact**: Full lifecycle assessment with maintenance cycles
- **Sustainability Score**: Overall score with industry benchmarks

**Example Usage**:
```javascript
// Run sustainability analysis
const sustainabilityResponse = await fetch('/projects/proj_001/analytics', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        bimModel: {
            building_type: 'office',
            area: 10000,
            materials: [
                { type: 'concrete', quantity: 100, unit: 'm3' },
                { type: 'steel', quantity: 5, unit: 'ton' },
                { type: 'wood', quantity: 50, unit: 'm3' }
            ],
            spaces: [
                {
                    id: 'office1',
                    name: 'Main Office', 
                    area: 5000,
                    orientation: 'south',
                    windows: [{ area: 200 }]
                }
            ]
        },
        analysisOptions: {
            analysis_period: 50,
            electricity_rate: 0.12
        }
    })
});
```

## Integration with Existing Systems

### MrketOz CRM Integration

The BIM services integrate seamlessly with the existing MrketOz CRM system through the main `functions/index.js` router. All BIM endpoints maintain the same cloud-agnostic architecture and CORS configuration as the CRM endpoints.

### Cloud-Agnostic Architecture

All BIM services follow the established cloud-agnostic principles:
- No hard-coded cloud provider references
- Configuration-driven deployment
- Support for Cloudflare Workers, Google Cloud Functions, AWS Lambda, and Azure Functions
- Standard HTTP request/response patterns

### Error Handling and Security

- Comprehensive error handling with graceful degradation
- CORS headers configured for cross-origin requests
- Input validation and sanitization
- Rate limiting ready (when deployed with appropriate middleware)
- Audit logging for all operations

## Testing and Validation

### Test Coverage

A comprehensive test suite validates all BIM functionality:
- **File Structure Tests**: Verify all required files exist
- **Syntax Validation**: Check for valid class structures and exports
- **Integration Tests**: Confirm proper routing in main index
- **Cloud-Agnostic Compliance**: Ensure no vendor lock-in
- **Functionality Tests**: Validate required features and keywords

### Running Tests

```bash
# Run simplified BIM functionality tests
node test-bim-simplified.js

# Run all existing tests (brand neutrality, CRM, etc.)
npm run test:all
```

### Performance Considerations

- **Caching**: Analysis results cached for 1 hour
- **Async Processing**: Long-running calculations handled asynchronously  
- **Memory Management**: Large datasets processed in chunks
- **Rate Limiting**: Built-in throttling for external API calls

## Deployment

### Environment Variables

```bash
# Optional configuration
ADMIN_EMAIL=support@designfitout.com
ALLOWED_ORIGINS=https://fitoutlab.app,https://designfitout.com
ELECTRICITY_RATE=0.12  # $/kWh for energy calculations
ANALYSIS_CACHE_DURATION=3600  # seconds
```

### Cloud Provider Deployment

The BIM services deploy alongside the existing MrketOz CRM system:

#### Google Cloud Functions
```bash
gcloud functions deploy bim-services \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point chat \
  --source functions/
```

#### AWS Lambda  
```bash
# Package and deploy
zip -r bim-services.zip functions/
aws lambda update-function-code \
  --function-name bim-services \
  --zip-file fileb://bim-services.zip
```

#### Cloudflare Workers
```bash
# Deploy using Wrangler
wrangler publish functions/index.js --name bim-services
```

## API Reference Summary

| Service | Endpoint Pattern | Methods | Purpose |
|---------|------------------|---------|---------|
| Digital Twin | `/projects/:id/twin` | GET, POST, PUT | Real-time model management |
| Clash Detection | `/projects/:id/clash-*` | POST, GET, PUT | Automated collision detection |
| Smart Materials | `/materials/*` | GET | Live supplier data integration |
| Documentation | `/projects/:id/docs` | POST, GET | Automated document generation |
| Sustainability | `/projects/:id/analytics` | POST, GET | Comprehensive impact analysis |

## Support and Maintenance

### Logging and Monitoring

All services include comprehensive logging:
- Request/response logging
- Error tracking with stack traces  
- Performance metrics (response times)
- Usage analytics (endpoint access patterns)

### Troubleshooting

Common issues and solutions:
- **CORS Errors**: Ensure CORS headers are properly configured
- **Timeout Issues**: Check function timeout limits for long-running analyses
- **Memory Limits**: Monitor memory usage for large BIM models
- **Cache Invalidation**: Clear analysis cache when model data changes

### Updates and Versioning

The BIM services follow semantic versioning and maintain backward compatibility:
- Patch updates: Bug fixes and minor improvements
- Minor updates: New features and enhanced functionality  
- Major updates: Breaking changes or architectural improvements

For technical support, contact: `support@designfitout.com`