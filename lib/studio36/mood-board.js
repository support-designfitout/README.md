/**
 * Studio36 OS - Mood Board Module
 * Interactive visual boards for architects/designers with vendor profile linking
 * and AI-curated material suggestions via LayrOps intelligence
 */

class MoodBoardManager {
  constructor() {
    this.boards = new Map();
    this.templates = new Map();
    this.layrOpsIntelligence = new LayrOpsIntelligence();
    this.initializeTemplates();
    console.log('MoodBoardManager initialized');
  }

  initializeTemplates() {
    // Pre-built mood board templates
    this.templates.set('residential_modern', {
      name: 'Modern Residential',
      description: 'Clean lines, minimalist aesthetics, neutral palette',
      categories: ['furniture', 'lighting', 'flooring', 'wall_finishes'],
      defaultMaterials: ['oak_wood', 'marble', 'matte_black_metal', 'white_paint']
    });

    this.templates.set('commercial_office', {
      name: 'Commercial Office',
      description: 'Professional, functional, collaborative spaces',
      categories: ['workstations', 'seating', 'acoustics', 'lighting'],
      defaultMaterials: ['laminate', 'glass', 'fabric', 'steel']
    });

    this.templates.set('hospitality_luxury', {
      name: 'Luxury Hospitality',
      description: 'Premium finishes, rich textures, elegant lighting',
      categories: ['furniture', 'textiles', 'lighting', 'decorative'],
      defaultMaterials: ['velvet', 'brass', 'walnut', 'stone']
    });

    this.templates.set('retail_contemporary', {
      name: 'Contemporary Retail',
      description: 'Eye-catching displays, brand integration, customer flow',
      categories: ['displays', 'lighting', 'flooring', 'signage'],
      defaultMaterials: ['acrylic', 'led_panels', 'polished_concrete', 'metal']
    });
  }

  /**
   * Create a new mood board
   * @param {Object} config - Board configuration
   * @returns {Object} Created board details
   */
  async createBoard(config) {
    const {
      name,
      projectId,
      templateId,
      creatorId,
      description = '',
      visibility = 'private'
    } = config;

    const boardId = this.generateBoardId();
    const template = templateId ? this.templates.get(templateId) : null;

    const board = {
      id: boardId,
      name,
      projectId,
      creatorId,
      description,
      visibility,
      template: template ? template.name : 'Custom',
      sections: this.initializeSections(template),
      materials: [],
      vendorLinks: [],
      aiSuggestions: [],
      collaborators: [creatorId],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    // Get AI-curated material suggestions
    board.aiSuggestions = await this.layrOpsIntelligence.suggestMaterials({
      template: templateId,
      description: description,
      projectId: projectId
    });

    this.boards.set(boardId, board);

    return {
      success: true,
      boardId: boardId,
      board: board,
      aiSuggestionsCount: board.aiSuggestions.length
    };
  }

  /**
   * Initialize board sections based on template
   * @param {Object|null} template - Template configuration
   * @returns {Array} Section structure
   */
  initializeSections(template) {
    if (template) {
      return template.categories.map(category => ({
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: this.formatCategoryName(category),
        category: category,
        items: [],
        notes: ''
      }));
    }

    // Default sections for custom boards
    return [
      { id: 'section_primary', name: 'Primary Materials', category: 'primary', items: [], notes: '' },
      { id: 'section_accent', name: 'Accent Elements', category: 'accent', items: [], notes: '' },
      { id: 'section_lighting', name: 'Lighting', category: 'lighting', items: [], notes: '' },
      { id: 'section_decorative', name: 'Decorative', category: 'decorative', items: [], notes: '' }
    ];
  }

  formatCategoryName(category) {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Add material to mood board with vendor linking
   * @param {string} boardId - Board identifier
   * @param {Object} material - Material details
   * @returns {Object} Updated board
   */
  async addMaterial(boardId, material) {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board ${boardId} not found`);
    }

    const {
      name,
      vendorId,
      vendorName,
      sectionId,
      imageUrl,
      price,
      specifications,
      catalogReference
    } = material;

    const materialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      vendorId,
      vendorName,
      imageUrl,
      price,
      specifications: specifications || {},
      catalogReference,
      addedAt: new Date().toISOString(),
      notes: ''
    };

    // Add to section or general materials
    if (sectionId) {
      const section = board.sections.find(s => s.id === sectionId);
      if (section) {
        section.items.push(materialItem);
      }
    } else {
      board.materials.push(materialItem);
    }

    // Link vendor to board
    if (vendorId && !board.vendorLinks.includes(vendorId)) {
      board.vendorLinks.push(vendorId);
    }

    board.updatedAt = new Date().toISOString();
    board.version++;

    return {
      success: true,
      materialId: materialItem.id,
      board: board
    };
  }

  /**
   * Get AI-curated material suggestions from LayrOps
   * @param {string} boardId - Board identifier
   * @param {Object} criteria - Suggestion criteria
   * @returns {Array} Suggested materials
   */
  async getSuggestions(boardId, criteria = {}) {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board ${boardId} not found`);
    }

    const suggestions = await this.layrOpsIntelligence.suggestMaterials({
      ...criteria,
      existingMaterials: board.materials,
      projectId: board.projectId,
      template: board.template
    });

    board.aiSuggestions = suggestions;
    board.updatedAt = new Date().toISOString();

    return {
      success: true,
      suggestions: suggestions,
      confidence: suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length
    };
  }

  /**
   * Share mood board with collaborators
   * @param {string} boardId - Board identifier
   * @param {Array} userIds - User IDs to share with
   * @returns {Object} Share result
   */
  async shareBoard(boardId, userIds) {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board ${boardId} not found`);
    }

    const newCollaborators = userIds.filter(id => !board.collaborators.includes(id));
    board.collaborators.push(...newCollaborators);
    board.updatedAt = new Date().toISOString();

    return {
      success: true,
      boardId: boardId,
      collaborators: board.collaborators,
      newlyAdded: newCollaborators
    };
  }

  /**
   * Get board by ID
   * @param {string} boardId - Board identifier
   * @returns {Object|null} Board data
   */
  getBoard(boardId) {
    return this.boards.get(boardId) || null;
  }

  /**
   * Get all boards for a project
   * @param {string} projectId - Project identifier
   * @returns {Array} List of boards
   */
  getBoardsByProject(projectId) {
    const boards = [];
    this.boards.forEach(board => {
      if (board.projectId === projectId) {
        boards.push(board);
      }
    });
    return boards;
  }

  /**
   * Export mood board for MaterialHUB integration
   * @param {string} boardId - Board identifier
   * @returns {Object} Export data for MaterialHUB
   */
  exportToMaterialHUB(boardId) {
    const board = this.boards.get(boardId);
    if (!board) {
      throw new Error(`Board ${boardId} not found`);
    }

    const allMaterials = [
      ...board.materials,
      ...board.sections.flatMap(section => section.items)
    ];

    return {
      boardId: boardId,
      boardName: board.name,
      projectId: board.projectId,
      exportedAt: new Date().toISOString(),
      materials: allMaterials.map(m => ({
        id: m.id,
        name: m.name,
        vendorId: m.vendorId,
        vendorName: m.vendorName,
        price: m.price,
        specifications: m.specifications,
        catalogReference: m.catalogReference
      })),
      vendorLinks: board.vendorLinks,
      totalItems: allMaterials.length,
      sections: board.sections.length
    };
  }

  generateBoardId() {
    return `board_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

/**
 * LayrOps Intelligence - AI-powered material suggestions
 */
class LayrOpsIntelligence {
  constructor() {
    this.materialDatabase = this.initializeMaterialDB();
    this.suggestionHistory = [];
    console.log('LayrOps Intelligence initialized');
  }

  initializeMaterialDB() {
    // Simulated material database with AI-relevant metadata
    return new Map([
      ['oak_wood', { name: 'Natural Oak Wood', category: 'flooring', sustainability: 0.85, price_tier: 'medium', styles: ['modern', 'scandinavian', 'traditional'] }],
      ['marble', { name: 'Carrara Marble', category: 'surfaces', sustainability: 0.6, price_tier: 'high', styles: ['luxury', 'classic', 'modern'] }],
      ['concrete', { name: 'Polished Concrete', category: 'flooring', sustainability: 0.9, price_tier: 'medium', styles: ['industrial', 'modern', 'minimalist'] }],
      ['velvet', { name: 'Premium Velvet', category: 'textiles', sustainability: 0.7, price_tier: 'high', styles: ['luxury', 'traditional', 'art_deco'] }],
      ['bamboo', { name: 'Bamboo Flooring', category: 'flooring', sustainability: 0.95, price_tier: 'medium', styles: ['eco', 'modern', 'asian'] }],
      ['brass', { name: 'Brushed Brass', category: 'metalwork', sustainability: 0.75, price_tier: 'high', styles: ['luxury', 'modern', 'art_deco'] }],
      ['terrazzo', { name: 'Terrazzo', category: 'flooring', sustainability: 0.8, price_tier: 'medium-high', styles: ['retro', 'modern', 'mediterranean'] }],
      ['ceramic_tile', { name: 'Ceramic Tile', category: 'surfaces', sustainability: 0.85, price_tier: 'low-medium', styles: ['modern', 'traditional', 'mediterranean'] }]
    ]);
  }

  /**
   * Generate AI-curated material suggestions
   * @param {Object} criteria - Suggestion criteria
   * @returns {Array} Suggested materials with confidence scores
   */
  async suggestMaterials(criteria) {
    const {
      template,
      description = '',
      existingMaterials = [],
      projectId,
      budget = 'medium',
      sustainabilityFocus = false
    } = criteria;

    // AI matching algorithm (simplified simulation)
    const suggestions = [];
    const existingIds = existingMaterials.map(m => m.id);

    this.materialDatabase.forEach((material, id) => {
      // Skip already added materials
      if (existingIds.includes(id)) return;

      let confidence = 0.5; // Base confidence

      // Style matching
      if (description) {
        const descLower = description.toLowerCase();
        material.styles.forEach(style => {
          if (descLower.includes(style)) {
            confidence += 0.15;
          }
        });
      }

      // Template matching
      if (template === 'residential_modern' && material.styles.includes('modern')) {
        confidence += 0.2;
      } else if (template === 'hospitality_luxury' && material.styles.includes('luxury')) {
        confidence += 0.2;
      } else if (template === 'commercial_office' && material.price_tier !== 'high') {
        confidence += 0.1;
      }

      // Sustainability preference
      if (sustainabilityFocus && material.sustainability > 0.8) {
        confidence += 0.15;
      }

      // Budget matching
      if (budget === 'high' && material.price_tier === 'high') {
        confidence += 0.1;
      } else if (budget === 'low' && (material.price_tier === 'low' || material.price_tier === 'low-medium')) {
        confidence += 0.1;
      }

      if (confidence > 0.5) {
        suggestions.push({
          materialId: id,
          name: material.name,
          category: material.category,
          confidence: Math.min(confidence, 1.0),
          sustainability: material.sustainability,
          priceTier: material.price_tier,
          matchedStyles: material.styles,
          reasoning: this.generateReasoning(material, criteria)
        });
      }
    });

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Store suggestion history
    this.suggestionHistory.push({
      timestamp: new Date().toISOString(),
      criteria: criteria,
      suggestionsCount: suggestions.length
    });

    return suggestions.slice(0, 10); // Return top 10 suggestions
  }

  generateReasoning(material, criteria) {
    const reasons = [];
    
    if (material.sustainability > 0.8) {
      reasons.push('High sustainability score');
    }
    
    if (criteria.sustainabilityFocus && material.sustainability > 0.85) {
      reasons.push('Matches eco-friendly preference');
    }
    
    if (criteria.description && criteria.description.toLowerCase().includes('modern') && 
        material.styles.includes('modern')) {
      reasons.push('Complements modern aesthetic');
    }
    
    if (criteria.template === 'hospitality_luxury' && material.styles.includes('luxury')) {
      reasons.push('Perfect for luxury hospitality');
    }

    return reasons.length > 0 ? reasons.join('; ') : 'General style compatibility';
  }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MoodBoardManager, LayrOpsIntelligence };
}

if (typeof window !== 'undefined') {
  window.MoodBoardManager = MoodBoardManager;
  window.LayrOpsIntelligence = LayrOpsIntelligence;
}
