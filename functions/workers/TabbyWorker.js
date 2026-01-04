const {FieldValue} = require('firebase-admin/firestore');

/**
 * TabbyWorker - Customer service worker for handling billing and account-related queries
 * This worker automatically assigns tickets based on keywords and provides guided responses
 */
class TabbyWorker {
  constructor(db) {
    this.db = db;
    this.workerName = 'Tabby';
    this.workerType = 'customer_service';

    // Keywords that trigger Tabby worker assignment
    this.triggerKeywords = [
      'billing', 'payment', 'invoice', 'account', 'cancel', 'cancellation',
      'subscription', 'refund', 'charge', 'credit', 'debit', 'balance',
      'pricing', 'cost', 'fee', 'amount', 'bill', 'receipt',
    ];

    // Response guide templates
    this.responseGuide = {
      billing_issues: {
        greeting: 'Hello! I\'m Tabby, and I\'ll help you with your billing inquiry.',
        steps: [
          'Please verify your account details',
          'Let me check your recent billing history',
          'I\'ll review any outstanding charges',
          'Would you like me to explain the charges?',
        ],
        escalation: 'If you need further assistance, I can transfer you to our billing specialist.',
      },
      account_cancellation: {
        greeting: 'I understand you\'re considering canceling your account. Let me help you with that.',
        steps: [
          'Before we proceed, may I ask about your experience?',
          'Are there any specific issues I can help resolve?',
          'Let me review your account benefits',
          'If you still wish to proceed, I\'ll guide you through the process',
        ],
        escalation: 'I can transfer you to our retention specialist for additional options.',
      },
      payment_issues: {
        greeting: 'I\'m here to help resolve your payment concerns quickly.',
        steps: [
          'Let me check the status of your payment',
          'I\'ll verify the payment method on file',
          'If needed, I can help update your payment information',
          'Let me confirm the transaction details',
        ],
        escalation: 'For complex payment issues, I can connect you with our payment specialist.',
      },
    };
  }

  /**
   * Determines if this worker should handle the ticket based on content analysis
   * @param {Object} ticketData - The ticket data to analyze
   * @returns {boolean} - Whether Tabby should handle this ticket
   */
  async shouldHandle(ticketData) {
    const content = `${ticketData.subject || ''} ${ticketData.description || ''}`.toLowerCase();

    // Check for trigger keywords
    const hasKeywords = this.triggerKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase()),
    );

    // Additional criteria (category, priority, etc.)
    const isBillingCategory = ticketData.category === 'billing' ||
                             ticketData.category === 'account';

    return hasKeywords || isBillingCategory;
  }

  /**
   * Assigns the ticket to Tabby worker and logs the interaction
   * @param {string} ticketId - The ticket ID
   * @param {Object} ticketData - The ticket data
   */
  async assignTicket(ticketId, ticketData) {
    const assignmentTime = new Date();

    try {
      // Update ticket with worker assignment
      await this.db.collection('tickets').doc(ticketId).update({
        assignedWorker: this.workerName,
        workerType: this.workerType,
        assignedAt: assignmentTime,
        status: 'assigned',
        updatedAt: assignmentTime,
      });

      // Log the interaction
      await this.logInteraction(ticketId, 'assignment', {
        action: 'ticket_assigned',
        worker: this.workerName,
        ticketData: {
          subject: ticketData.subject,
          category: ticketData.category,
          priority: ticketData.priority,
        },
      });

      // Create initial response based on ticket content
      const responseCategory = this.categorizeTicket(ticketData);
      await this.createInitialResponse(ticketId, responseCategory);

      console.log(`Tabby worker successfully assigned to ticket ${ticketId}`);
    } catch (error) {
      console.error(`Error assigning Tabby worker to ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Categorizes the ticket to determine appropriate response template
   * @param {Object} ticketData - The ticket data
   * @returns {string} - The response category
   */
  categorizeTicket(ticketData) {
    const content = `${ticketData.subject || ''} ${ticketData.description || ''}`.toLowerCase();

    if (content.includes('cancel') || content.includes('close account')) {
      return 'account_cancellation';
    } else if (content.includes('payment') || content.includes('charge') || content.includes('refund')) {
      return 'payment_issues';
    } else {
      return 'billing_issues';
    }
  }

  /**
   * Creates an initial response for the assigned ticket
   * @param {string} ticketId - The ticket ID
   * @param {string} category - The response category
   */
  async createInitialResponse(ticketId, category) {
    const responseTemplate = this.responseGuide[category] || this.responseGuide.billing_issues;

    const response = {
      ticketId,
      worker: this.workerName,
      category,
      greeting: responseTemplate.greeting,
      suggestedSteps: responseTemplate.steps,
      escalationOption: responseTemplate.escalation,
      createdAt: new Date(),
      status: 'pending_review',
    };

    await this.db.collection('worker_responses').add(response);

    // Log this interaction
    await this.logInteraction(ticketId, 'response_created', {
      action: 'initial_response_generated',
      category,
      worker: this.workerName,
    });
  }

  /**
   * Logs worker interactions for analytics and tracking
   * @param {string} ticketId - The ticket ID
   * @param {string} interactionType - Type of interaction
   * @param {Object} details - Additional details
   */
  async logInteraction(ticketId, interactionType, details) {
    const logEntry = {
      ticketId,
      worker: this.workerName,
      workerType: this.workerType,
      interactionType,
      details,
      timestamp: FieldValue.serverTimestamp(),
      sessionId: `${this.workerName}_${Date.now()}`,
    };

    await this.db.collection('worker_interactions').add(logEntry);

    // Update analytics counters
    await this.updateAnalytics(interactionType);
  }

  /**
   * Updates analytics counters for reporting
   * @param {string} interactionType - Type of interaction
   */
  async updateAnalytics(interactionType) {
    const today = new Date().toISOString().split('T')[0];
    const analyticsRef = this.db.collection('worker_analytics').doc(`${this.workerName}_${today}`);

    const updateData = {
      worker: this.workerName,
      date: today,
      [`${interactionType}_count`]: FieldValue.increment(1),
      total_interactions: FieldValue.increment(1),
      last_updated: FieldValue.serverTimestamp(),
    };

    await analyticsRef.set(updateData, {merge: true});
  }

  /**
   * Returns the response guide for this worker
   * @returns {Object} - The response guide templates
   */
  async getResponseGuide() {
    return {
      worker: this.workerName,
      workerType: this.workerType,
      triggerKeywords: this.triggerKeywords,
      responseGuide: this.responseGuide,
    };
  }

  /**
   * Gets worker performance analytics
   * @param {number} days - Number of days to look back (default: 30)
   * @returns {Object} - Performance analytics
   */
  async getPerformanceAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analyticsRef = this.db.collection('worker_analytics')
        .where('worker', '==', this.workerName)
        .where('last_updated', '>=', startDate)
        .orderBy('last_updated', 'desc');

    const snapshot = await analyticsRef.get();
    const analytics = [];

    snapshot.forEach((doc) => {
      analytics.push({id: doc.id, ...doc.data()});
    });

    return analytics;
  }
}

module.exports = TabbyWorker;
