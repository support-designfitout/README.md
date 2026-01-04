const {FieldValue} = require('firebase-admin/firestore');

/**
 * BaseWorker - Abstract base class for all customer service workers
 * Provides common functionality that can be extended by specific worker types
 */
class BaseWorker {
  constructor(db, workerName, workerType) {
    this.db = db;
    this.workerName = workerName;
    this.workerType = workerType;
    this.triggerKeywords = [];
    this.responseGuide = {};
  }

  /**
   * Abstract method - must be implemented by child classes
   * @param {Object} ticketData - The ticket data to analyze
   * @returns {boolean} - Whether this worker should handle the ticket
   */
  async shouldHandle(ticketData) {
    throw new Error('shouldHandle method must be implemented by child class');
  }

  /**
   * Common ticket assignment logic
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

      console.log(`${this.workerName} worker successfully assigned to ticket ${ticketId}`);
    } catch (error) {
      console.error(`Error assigning ${this.workerName} worker to ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Common interaction logging
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
   * Common analytics updating
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
   * Common method to get response guide
   * @returns {Object} - The response guide for this worker
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
   * Common performance analytics retrieval
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

  /**
   * Helper method to check for keywords in content
   * @param {string} content - Content to search
   * @param {Array} keywords - Keywords to search for
   * @returns {boolean} - Whether any keywords were found
   */
  hasKeywords(content, keywords = this.triggerKeywords) {
    const lowerContent = content.toLowerCase();
    return keywords.some((keyword) => lowerContent.includes(keyword.toLowerCase()));
  }

  /**
   * Helper method to extract relevant text from ticket
   * @param {Object} ticketData - The ticket data
   * @returns {string} - Combined searchable text
   */
  extractSearchableText(ticketData) {
    return `${ticketData.subject || ''} ${ticketData.description || ''} ${ticketData.category || ''}`;
  }
}

module.exports = BaseWorker;
