const TabbyWorker = require('../workers/TabbyWorker');
const WorkerFactory = require('../workers/WorkerFactory');

// Mock Firestore
const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      update: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({}),
    })),
    add: jest.fn().mockResolvedValue({}),
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            forEach: jest.fn(),
          }),
        })),
      })),
    })),
  })),
};

describe('TabbyWorker', () => {
  let tabbyWorker;

  beforeEach(() => {
    tabbyWorker = new TabbyWorker(mockDb);
    jest.clearAllMocks();
  });

  describe('shouldHandle', () => {
    test('should handle tickets with billing keywords', async () => {
      const ticketData = {
        subject: 'Billing inquiry',
        description: 'I have questions about my invoice',
        category: 'support',
      };

      const result = await tabbyWorker.shouldHandle(ticketData);
      expect(result).toBe(true);
    });

    test('should handle tickets with payment keywords', async () => {
      const ticketData = {
        subject: 'Payment issue',
        description: 'My payment was declined',
        category: 'technical',
      };

      const result = await tabbyWorker.shouldHandle(ticketData);
      expect(result).toBe(true);
    });

    test('should handle tickets with account cancellation keywords', async () => {
      const ticketData = {
        subject: 'Cancel my subscription',
        description: 'I want to cancel my account',
        category: 'support',
      };

      const result = await tabbyWorker.shouldHandle(ticketData);
      expect(result).toBe(true);
    });

    test('should handle tickets with billing category', async () => {
      const ticketData = {
        subject: 'General inquiry',
        description: 'I have a question',
        category: 'billing',
      };

      const result = await tabbyWorker.shouldHandle(ticketData);
      expect(result).toBe(true);
    });

    test('should not handle tickets without matching criteria', async () => {
      const ticketData = {
        subject: 'Technical support',
        description: 'My website is down',
        category: 'technical',
      };

      const result = await tabbyWorker.shouldHandle(ticketData);
      expect(result).toBe(false);
    });
  });

  describe('categorizeTicket', () => {
    test('should categorize cancellation tickets correctly', () => {
      const ticketData = {
        subject: 'Cancel my account',
        description: 'I want to close my account',
      };

      const category = tabbyWorker.categorizeTicket(ticketData);
      expect(category).toBe('account_cancellation');
    });

    test('should categorize payment tickets correctly', () => {
      const ticketData = {
        subject: 'Payment problem',
        description: 'I was charged twice',
      };

      const category = tabbyWorker.categorizeTicket(ticketData);
      expect(category).toBe('payment_issues');
    });

    test('should default to billing issues', () => {
      const ticketData = {
        subject: 'Billing question',
        description: 'I have a question about my bill',
      };

      const category = tabbyWorker.categorizeTicket(ticketData);
      expect(category).toBe('billing_issues');
    });
  });

  describe('assignTicket', () => {
    test('should assign ticket and create response', async () => {
      const ticketId = 'test-ticket-123';
      const ticketData = {
        subject: 'Billing inquiry',
        description: 'Question about charges',
        category: 'billing',
        priority: 'medium',
      };

      await tabbyWorker.assignTicket(ticketId, ticketData);

      // Verify ticket was updated
      expect(mockDb.collection).toHaveBeenCalledWith('tickets');

      // Verify response was created
      expect(mockDb.collection).toHaveBeenCalledWith('worker_responses');

      // Verify interaction was logged
      expect(mockDb.collection).toHaveBeenCalledWith('worker_interactions');
    });
  });

  describe('getResponseGuide', () => {
    test('should return response guide with correct structure', async () => {
      const guide = await tabbyWorker.getResponseGuide();

      expect(guide).toHaveProperty('worker', 'Tabby');
      expect(guide).toHaveProperty('workerType', 'customer_service');
      expect(guide).toHaveProperty('triggerKeywords');
      expect(guide).toHaveProperty('responseGuide');

      expect(Array.isArray(guide.triggerKeywords)).toBe(true);
      expect(guide.responseGuide).toHaveProperty('billing_issues');
      expect(guide.responseGuide).toHaveProperty('account_cancellation');
      expect(guide.responseGuide).toHaveProperty('payment_issues');
    });
  });
});

describe('WorkerFactory', () => {
  let workerFactory;

  beforeEach(() => {
    workerFactory = new WorkerFactory(mockDb);
  });

  describe('getAllWorkers', () => {
    test('should return array of workers', () => {
      const workers = workerFactory.getAllWorkers();

      expect(Array.isArray(workers)).toBe(true);
      expect(workers.length).toBeGreaterThan(0);
      expect(workers[0]).toBeInstanceOf(TabbyWorker);
    });
  });

  describe('getWorker', () => {
    test('should return specific worker by name', () => {
      const worker = workerFactory.getWorker('tabby');

      expect(worker).toBeInstanceOf(TabbyWorker);
      expect(worker.workerName).toBe('Tabby');
    });

    test('should return null for unknown worker', () => {
      const worker = workerFactory.getWorker('unknown');

      expect(worker).toBeNull();
    });
  });

  describe('findBestWorker', () => {
    test('should find Tabby worker for billing tickets', async () => {
      const ticketData = {
        subject: 'Billing question',
        description: 'About my invoice',
        category: 'billing',
      };

      const worker = await workerFactory.findBestWorker(ticketData);

      expect(worker).toBeInstanceOf(TabbyWorker);
      expect(worker.workerName).toBe('Tabby');
    });

    test('should return null for unmatched tickets', async () => {
      const ticketData = {
        subject: 'Technical issue',
        description: 'Server is down',
        category: 'technical',
      };

      const worker = await workerFactory.findBestWorker(ticketData);

      expect(worker).toBeNull();
    });
  });

  describe('getWorkerNames', () => {
    test('should return list of worker names', () => {
      const names = workerFactory.getWorkerNames();

      expect(Array.isArray(names)).toBe(true);
      expect(names).toContain('tabby');
    });
  });
});

describe('Integration Tests', () => {
  test('should handle complete ticket assignment flow', async () => {
    const workerFactory = new WorkerFactory(mockDb);
    const ticketData = {
      subject: 'Payment declined',
      description: 'My credit card was declined for the monthly subscription',
      category: 'billing',
      priority: 'high',
      customerEmail: 'test@example.com',
    };

    // Find worker
    const worker = await workerFactory.findBestWorker(ticketData);
    expect(worker).not.toBeNull();
    expect(worker.workerName).toBe('Tabby');

    // Assign ticket
    await worker.assignTicket('test-ticket-456', ticketData);

    // Verify interactions were logged
    expect(mockDb.collection).toHaveBeenCalledWith('tickets');
    expect(mockDb.collection).toHaveBeenCalledWith('worker_interactions');
    expect(mockDb.collection).toHaveBeenCalledWith('worker_responses');
    expect(mockDb.collection).toHaveBeenCalledWith('worker_analytics');
  });
});
