const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {onRequest} = require('firebase-functions/v2/https');
const {onDocumentCreated} = require('firebase-functions/v2/firestore');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Import worker factory
const WorkerFactory = require('./workers/WorkerFactory');

// Customer Service Ticket Assignment Function
exports.assignTicket = onDocumentCreated('tickets/{ticketId}', async (event) => {
  const ticketData = event.data.data();
  const ticketId = event.params.ticketId;

  console.log(`Processing ticket assignment for ticket ${ticketId}`);

  try {
    // Use factory to find the best worker for this ticket
    const workerFactory = new WorkerFactory(db);
    const assignedWorker = await workerFactory.findBestWorker(ticketData);

    if (assignedWorker) {
      await assignedWorker.assignTicket(ticketId, ticketData);
      console.log(`Ticket ${ticketId} assigned to ${assignedWorker.workerName} worker`);
    } else {
      console.log(`Ticket ${ticketId} not assigned to any worker - no matching criteria`);

      // Log unassigned ticket for analysis
      await db.collection('unassigned_tickets').add({
        ticketId,
        ticketData,
        reason: 'no_matching_worker',
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error processing ticket ${ticketId}:`, error);
    throw error;
  }
});

// Customer Service API Endpoints
exports.customerServiceApi = onRequest(async (req, res) => {
  const {method, url} = req;

  try {
    const workerFactory = new WorkerFactory(db);

    if (method === 'GET' && url.includes('/workers/tabby/responses')) {
      const tabbyWorker = workerFactory.getWorker('tabby');
      if (tabbyWorker) {
        const responses = await tabbyWorker.getResponseGuide();
        res.json({success: true, data: responses});
      } else {
        res.status(404).json({success: false, error: 'Tabby worker not found'});
      }
    } else if (method === 'GET' && url.includes('/workers/statistics')) {
      const statistics = await workerFactory.getWorkerStatistics();
      res.json({success: true, data: statistics});
    } else if (method === 'GET' && url.includes('/workers')) {
      const workerNames = workerFactory.getWorkerNames();
      res.json({success: true, data: {workers: workerNames}});
    } else if (method === 'GET' && url.includes('/analytics')) {
      const analytics = await getWorkerAnalytics();
      res.json({success: true, data: analytics});
    } else {
      res.status(404).json({success: false, error: 'Endpoint not found'});
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({success: false, error: error.message});
  }
});

// Analytics function
async function getWorkerAnalytics() {
  const analyticsRef = db.collection('worker_analytics');
  const snapshot = await analyticsRef.orderBy('timestamp', 'desc').limit(100).get();

  const analytics = [];
  snapshot.forEach((doc) => {
    analytics.push({id: doc.id, ...doc.data()});
  });

  return analytics;
}
