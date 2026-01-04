# DesignFitout Status Dashboard

A real-time monitoring dashboard for DesignFitout system and operations status with auto-refresh, offline caching, and telemetry features.

## Features

### 1. Auto-Refresh Loop
- Automatically refreshes data every 60 seconds
- Fetches from `/health` and `/api/mrketoz.json` endpoints
- Displays last refresh timestamp in footer

### 2. Graceful Caching
- Stores last known good data in browser localStorage
- Falls back to cached data when offline
- Shows "Offline Mode" badge when using cached data
- Offline indicators on status cards

### 3. Brand Identity
- DesignFitout logo and favicon
- Sigel & Crow color palette (purple gradients)
- Glassmorphism effects with backdrop blur
- Modern, premium design aesthetic

### 4. Mobile Responsive
- Optimized layout for viewports < 500px
- Stacked card design on mobile devices
- Touch-friendly interface

### 5. Telemetry Bar
Displays three key metrics:
- **Uptime**: Hours and minutes since dashboard initialization
- **API Latency**: Response time in milliseconds
- **Last Audit**: Relative time of last system audit

### 6. Bundle Milestone Tracker
- Links to `docs/subscription_cleanup_tracker.csv`
- Real-time progress calculation
- Highlights incomplete milestones in red
- Shows completion percentage

## API Endpoints

The dashboard expects these endpoints to be available:

### Health Endpoint: `/health`
```json
{
  "status": "healthy",
  "service": "Designfitout Cloud Functions",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "endpoints": {
    "authRegister": "/api/auth/register",
    "authLogin": "/api/auth/login",
    ...
  }
}
```

### MrketOz Pipeline: `/api/mrketoz.json`
```json
{
  "stage": "production",
  "branch": "main",
  "short_sha": "a1b2c3d",
  "last_pr": 42,
  "last_pr_title": "Feature description",
  "flags": ["public-site", "crm-enabled"],
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

## Usage

### Local Development

1. Start a local server:
```bash
cd status
npx http-server -p 8080 -c-1
```

2. Open browser to `http://localhost:8080`

### Production Deployment

The dashboard is designed to work with any cloud provider. Simply:

1. Deploy the `status/` directory to your static hosting
2. Ensure the API endpoints (`/health`, `/api/mrketoz.json`) are accessible
3. Update the CSV file at `docs/subscription_cleanup_tracker.csv` as needed

## Files

- `index.html` - Main dashboard HTML with JavaScript
- `styles.css` - Glassmorphism styles and responsive layout
- `logo.svg` - DesignFitout logo
- `README.md` - This documentation

## Customization

### Refresh Interval
Change the auto-refresh interval in `index.html`:
```javascript
const REFRESH_INTERVAL = 60000; // 60 seconds (default)
```

### Color Palette
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #1a237e;
    --secondary-color: #3949ab;
    --accent-color: #1976d2;
    ...
}
```

### Telemetry Metrics
Add or modify telemetry items in the HTML telemetry bar section.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Offline Mode

When the dashboard cannot reach the API endpoints, it:
1. Displays the "Offline Mode" badge
2. Shows warning indicators on status cards
3. Uses cached data from previous successful fetches
4. Continues to attempt refreshes every 60 seconds

## Performance

- Initial load: < 500ms
- API fetch time: ~100-200ms (typical)
- localStorage cache: Instant fallback
- Auto-refresh overhead: Minimal (async operations)

## Security

- CSP-compliant (Content Security Policy)
- No sensitive data stored in localStorage
- CORS headers required on API endpoints
- HTTPS recommended for production

## License

Part of the Designfitout-Github repository. See main repository LICENSE for details.
