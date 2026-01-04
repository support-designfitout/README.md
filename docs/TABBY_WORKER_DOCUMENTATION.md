# MrketOz Customer Service Worker Flow Documentation

## Overview

The MrketOz Customer Service Worker Flow is a modular, automated customer service system designed for the public to communicate front office system. It provides intelligent ticket assignment, guided response generation, and comprehensive interaction tracking.

## Architecture

### Core Components

1. **BaseWorker** - Abstract base class providing common functionality
2. **MrketOzWorker** - Specialized worker for billing and account-related queries
3. **WorkerFactory** - Factory pattern for managing multiple worker types
4. **Firebase Functions** - Cloud functions for processing tickets and API endpoints

### Data Flow

```
Ticket Created → Firebase Trigger → Worker Assignment → Response Generation → Interaction Logging
```

## Features

### 1. Automatic Ticket Assignment

MrketOz worker automatically handles tickets containing these keywords:
- billing, payment, invoice, account
- cancel, cancellation, subscription
- refund, charge, credit, debit, balance
- pricing, cost, fee, amount, bill, receipt

### 2. Response Guide System

Three main response categories:
- **Billing Issues**: General billing inquiries
- **Account Cancellation**: Retention-focused responses
- **Payment Issues**: Payment-specific troubleshooting

### 3. Interaction Tracking

All interactions are logged with:
- Ticket ID and worker assignment
- Interaction type and timestamp
- Detailed action logs
- Session tracking

### 4. Analytics Dashboard

Provides insights on:
- Worker performance metrics
- Ticket assignment patterns
- Response effectiveness
- Daily/weekly statistics

## Installation

### Prerequisites

- Node.js 18+
- Firebase CLI
- Firebase project with Firestore enabled

### Setup

1. **Install Dependencies**
```bash
cd functions
npm install
```

2. **Deploy Functions**
```bash
firebase deploy --only functions
```

3. **Configure Firestore Rules**
```javascript
// Allow read/write access to authenticated users
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Usage

### Creating a Ticket

Create a document in the `tickets` collection:

```javascript
// Example ticket that will be assigned to MrketOz
const ticket = {
  subject: "Billing inquiry about recent charges",
  description: "I see unexpected charges on my account",
  category: "billing",
  priority: "medium",
  customerEmail: "customer@example.com",
  createdAt: new Date(),
  status: "open"
};

await db.collection('tickets').add(ticket);
```

### API Endpoints

#### Get MrketOz Response Guide
```
GET /customerServiceApi/workers/mrketoz/responses[Backup codes.pdf](https://github.com/user-attachments/files/22502245/Backup.codes.pdf)
[TLS-syndication.json](https://github.com/user-attachments/files/22502213/TLS-syndication.json)
[TLS-log.txt](https://github.com/user-attachments/files/22502212/TLS-log.txt)
[capsule-summary.txt](https://github.com/user-attachments/files/22502211/capsule-summary.txt)
[Calendar-syndication.json](https://github.com/user-attachments/files/22502210/Calendar-syndication.json)
[Calendar-log.txt](https://github.com/user-attachments/files/22502209/Calendar-log.txt)

```

#### Get Worker Statistics
```
GET /customerServiceApi/workers/statistics
```

#### Get All Workers
```
GET /customerServiceApi/workers
```

#### Get Analytics
```
GET /customerServiceApi/analytics
```

## Extending the System

### Adding New Workers

1. **Create Worker Class**
```javascript
const BaseWorker = require('./BaseWorker');

class NewWorker extends BaseWorker {
  constructor(db) {
    super(db, 'NewWorker', 'customer_service');
    this.triggerKeywords = ['keyword1', 'keyword2'];
    // Define response guide...
  }
<img width="897" height="1278" alt="fitoutlab app_web-report" src="https://github.com/user-attachments/assets/59c18c6e-f497-48b4-8504-c48cf58a0556" />

  async shouldHandle(ticketData) {
    // Implement logic to determine if this worker should handle the ticket
  }
}

module.exports = NewWorker;
```

2. **Register in WorkerFactory**
```javascript
// In WorkerFactory.js initializeWorkers method
this.workerTypes.set('newworker', () => new NewWorker(this.db));
```

---

*Last updated: September 2025*
*Version: 1.0.0*
