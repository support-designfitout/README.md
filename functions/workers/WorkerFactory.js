const TabbyWorker = require('./TabbyWorker');

/**
 * WorkerFactory - Factory class for creating and managing different worker types
 * This enables easy expansion to add new worker types in the future
 */
class WorkerFactory {
  constructor(db) {
    this.db = db;
    this.workerTypes = new Map();
    this.initializeWorkers();
  }

  /**
   * Initialize all available worker types
   */
  initializeWorkers() {
    // Register Tabby worker
    this.workerTypes.set('tabby', () => new TabbyWorker(this.db));

    // Future workers can be added here:
    // this.workerTypes.set('alex', () => new AlexWorker(this.db));
    // this.workerTypes.set('support', () => new SupportWorker(this.db));
  }

  /**
   * Get all available worker instances
   * @returns {Array} - Array of worker instances
   */
  getAllWorkers() {
    const workers = [];
    for (const [, factory] of this.workerTypes) {
      workers.push(factory());
    }
    return workers;
  }

  /**
   * Get a specific worker by name
   * @param {string} workerName - Name of the worker
   * @returns {Object|null} - Worker instance or null if not found
   */
  getWorker(workerName) {
    const factory = this.workerTypes.get(workerName.toLowerCase());
    return factory ? factory() : null;
  }

  /**
   * Find the best worker for a given ticket
   * @param {Object} ticketData - The ticket data
   * @returns {Object|null} - Best matching worker or null
   */
  async findBestWorker(ticketData) {
    const workers = this.getAllWorkers();

    for (const worker of workers) {
      if (await worker.shouldHandle(ticketData)) {
        return worker;
      }
    }

    return null; // No worker found
  }

  /**
   * Register a new worker type
   * @param {string} name - Worker name
   * @param {Function} factory - Factory function that returns worker instance
   */
  registerWorker(name, factory) {
    this.workerTypes.set(name.toLowerCase(), factory);
  }

  /**
   * Get list of all registered worker names
   * @returns {Array} - Array of worker names
   */
  getWorkerNames() {
    return Array.from(this.workerTypes.keys());
  }

  /**
   * Get worker statistics across all workers
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Object} - Aggregated statistics
   */
  async getWorkerStatistics(days = 7) {
    const workers = this.getAllWorkers();
    const statistics = {
      totalWorkers: workers.length,
      workerNames: workers.map((w) => w.workerName),
      analytics: {},
    };

    for (const worker of workers) {
      try {
        const analytics = await worker.getPerformanceAnalytics(days);
        statistics.analytics[worker.workerName] = analytics;
      } catch (error) {
        console.error(`Error getting analytics for ${worker.workerName}:`, error);
        statistics.analytics[worker.workerName] = [];
      }
    }

    return statistics;
  }
}

module.exports = WorkerFactory;
