# Tabby Customer Service Worker Configuration

## Worker Configuration
```javascript
const workerConfig = {
  tabby: {
    triggerKeywords: [
      'billing', 'payment', 'invoice', 'account',
      'cancel', 'cancellation', 'subscription',
      'refund', 'charge', 'credit', 'debit', 'balance',
      'pricing', 'cost', 'fee', 'amount', 'bill', 'receipt'
    ],
    categories: ['billing', 'account'],
    responseTemplates: {
      billing_issues: 'Standard billing inquiry template',
      account_cancellation: 'Retention-focused template',
      payment_issues: 'Payment troubleshooting template'
    }
  }
}
```

## Firestore Collections

### Required Collections:
- `tickets` - Customer service tickets
- `worker_interactions` - Interaction logs
- `worker_responses` - Generated responses
- `worker_analytics` - Performance metrics
- `unassigned_tickets` - Tickets not assigned to any worker

### Sample Ticket Document:
```javascript
{
  subject: "Billing inquiry about recent charges",
  description: "I see unexpected charges on my account",
  category: "billing",
  priority: "medium",
  customerEmail: "customer@example.com",
  createdAt: "2025-09-23T19:30:00Z",
  status: "open"
}
```

## Environment Variables

Set these in Firebase Functions configuration:
```bash
firebase functions:config:set app.debug="true"
firebase functions:config:set app.worker_timeout="30000"
```

## API Endpoints

Base URL: `https://[project-id].cloudfunctions.net/customerServiceApi`

- `GET /workers/tabby/responses` - Get Tabby response guide
- `GET /workers/statistics` - Get all worker statistics  
- `GET /workers` - List available workers
- `GET /analytics` - Get analytics data