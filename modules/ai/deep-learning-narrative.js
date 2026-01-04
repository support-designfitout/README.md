/**
 * Designfitout.com - Deep Learning Narrative Module
 * AI-powered narrative generation and adaptive storytelling system
 */

class DeepLearningNarrative {
    constructor() {
        this.narratives = new Map();
        this.userInteractions = [];
        this.sentimentScores = [];
        this.currentNarrativeId = null;
        this.adaptiveModel = null;
        this.isActive = false;
        
        // Neural network simulation weights
        this.weights = {
            emotional: 0.3,
            contextual: 0.4,
            historical: 0.2,
            predictive: 0.1
        };
        
        this.contextVectors = new Map();
        this.learningRate = 0.01;
        
        this.init();
    }

    async init() {
        console.log('🧠 DeepLearningNarrative module initializing...');
        
        this.setupNarrativeDatabase();
        this.initializeNeuralNetwork();
        this.setupUserInteractionTracking();
        this.startAdaptiveLearning();
        
        this.isActive = true;
        console.log('✅ DeepLearningNarrative module initialized');
    }

    /**
     * Setup narrative database with context vectors
     */
    setupNarrativeDatabase() {
        const baseNarratives = [
            {
                id: 'welcome',
                text: "Welcome to Designfitout.com - Experience premium design solutions",
                context: ['greeting', 'introduction', 'premium'],
                emotion: 'positive',
                duration: 4000,
                triggers: ['pageload', 'return_visitor']
            },
            {
                id: 'demo',
                text: "Watch our demo showcasing cutting-edge visualization techniques",
                context: ['demonstration', 'technology', 'visual'],
                emotion: 'exciting',
                duration: 5000,
                triggers: ['video_interaction', 'engagement_high']
            },
            {
                id: 'glassmorphism',
                text: "Glassmorphism effects create stunning visual depth",
                context: ['design', 'modern', 'aesthetic'],
                emotion: 'appreciation',
                duration: 4000,
                triggers: ['design_focus', 'aesthetic_preference']
            },
            {
                id: 'analysis',
                text: "Real-time competitor analysis ensures Nobel-tier performance",
                context: ['analytics', 'performance', 'competition'],
                emotion: 'confident',
                duration: 5000,
                triggers: ['analytics_view', 'performance_interest']
            },
            {
                id: 'interaction',
                text: "Interactive animations respond to your every interaction",
                context: ['interactivity', 'response', 'engagement'],
                emotion: 'engaging',
                duration: 4000,
                triggers: ['high_interaction', 'animation_focus']
            }
        ];

        baseNarratives.forEach(narrative => {
            this.narratives.set(narrative.id, {
                ...narrative,
                vector: this.generateContextVector(narrative.context),
                effectiveness: 0.5, // Initial effectiveness score
                usageCount: 0,
                lastUsed: null,
                adaptedVersions: new Map()
            });
        });

        console.log(`📚 Narrative database initialized with ${this.narratives.size} base narratives`);
    }

    /**
     * Generate context vector for narrative
     */
    generateContextVector(contextTerms) {
        const vector = new Array(50).fill(0); // 50-dimensional vector space
        
        const contextMap = {
            'greeting': [1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            'introduction': [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
            'premium': [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            'demonstration': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
            'technology': [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            'visual': [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            'design': [0.8, 0, 0.6, 0, 0, 0, 0.4, 0, 0, 0.7],
            'modern': [0, 0.7, 0, 0.8, 0, 0, 0, 0.6, 0.9, 0],
            'aesthetic': [0.6, 0, 0.9, 0, 0, 0.7, 0, 0, 0, 0.8],
            'analytics': [0, 0, 0, 0.9, 0.8, 0, 0, 0.7, 0.6, 0],
            'performance': [0, 0.6, 0, 0.8, 0.9, 0, 0, 0, 0.7, 0],
            'interactivity': [0.7, 0.8, 0, 0, 0, 0.9, 0, 0.6, 0, 0.8],
            'engagement': [0.9, 0.7, 0, 0, 0.6, 0.8, 0, 0, 0, 0.7]
        };

        contextTerms.forEach((term, index) => {
            if (contextMap[term]) {
                contextMap[term].forEach((value, i) => {
                    if (i + index * 10 < vector.length) {
                        vector[i + index * 10] = value;
                    }
                });
            }
        });

        return this.normalizeVector(vector);
    }

    /**
     * Initialize neural network simulation
     */
    initializeNeuralNetwork() {
        this.adaptiveModel = {
            inputLayer: 50, // Context vector size
            hiddenLayers: [30, 20], // Hidden layers
            outputLayer: 5, // Emotion categories
            
            // Simplified weight matrices (would be much more complex in real implementation)
            weights: {
                inputToHidden: this.generateRandomWeights(50, 30),
                hiddenToHidden: this.generateRandomWeights(30, 20),
                hiddenToOutput: this.generateRandomWeights(20, 5)
            }
        };

        console.log('🤖 Neural network model initialized');
    }

    /**
     * Generate random weights for neural network
     */
    generateRandomWeights(rows, cols) {
        const weights = [];
        for (let i = 0; i < rows; i++) {
            weights[i] = [];
            for (let j = 0; j < cols; j++) {
                weights[i][j] = (Math.random() - 0.5) * 2; // [-1, 1]
            }
        }
        return weights;
    }

    /**
     * Setup user interaction tracking
     */
    setupUserInteractionTracking() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.recordInteraction({
                type: 'click',
                target: e.target.tagName,
                timestamp: Date.now(),
                position: { x: e.clientX, y: e.clientY }
            });
        });

        // Track scroll behavior
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.recordInteraction({
                    type: 'scroll',
                    scrollY: window.pageYOffset,
                    timestamp: Date.now(),
                    percentage: (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                });
            }, 150);
        });

        // Track time on page
        this.pageStartTime = Date.now();
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordInteraction({
                    type: 'visibility_hidden',
                    timeOnPage: Date.now() - this.pageStartTime,
                    timestamp: Date.now()
                });
            } else {
                this.pageStartTime = Date.now();
                this.recordInteraction({
                    type: 'visibility_visible',
                    timestamp: Date.now()
                });
            }
        });

        console.log('👁️ User interaction tracking initialized');
    }

    /**
     * Record user interaction
     */
    recordInteraction(interaction) {
        this.userInteractions.push(interaction);
        
        // Keep only recent interactions (last 1000)
        if (this.userInteractions.length > 1000) {
            this.userInteractions = this.userInteractions.slice(-1000);
        }

        // Trigger sentiment analysis
        this.updateSentimentAnalysis(interaction);
        
        // Adaptive learning trigger
        this.triggerAdaptiveLearning();
    }

    /**
     * Sentiment analysis simulation
     */
    updateSentimentAnalysis(interaction) {
        let sentiment = 0; // Neutral by default
        
        // Analyze interaction patterns
        if (interaction.type === 'click') {
            sentiment += 0.1; // Positive engagement
        }
        
        if (interaction.type === 'scroll') {
            if (interaction.percentage > 50) {
                sentiment += 0.2; // Good engagement
            }
        }
        
        if (interaction.type === 'visibility_hidden' && interaction.timeOnPage > 30000) {
            sentiment += 0.3; // Long engagement time
        }

        // Add some noise to simulate real sentiment analysis
        sentiment += (Math.random() - 0.5) * 0.1;
        
        this.sentimentScores.push({
            timestamp: Date.now(),
            score: Math.max(-1, Math.min(1, sentiment)),
            interaction: interaction.type
        });

        // Keep only recent sentiment scores
        if (this.sentimentScores.length > 100) {
            this.sentimentScores = this.sentimentScores.slice(-100);
        }
    }

    /**
     * Start adaptive learning process
     */
    startAdaptiveLearning() {
        // Run adaptive learning every 30 seconds
        this.learningInterval = setInterval(() => {
            this.performAdaptiveLearning();
        }, 30000);

        console.log('🎓 Adaptive learning started');
    }

    /**
     * Trigger adaptive learning based on interactions
     */
    triggerAdaptiveLearning() {
        if (this.userInteractions.length % 10 === 0) { // Every 10 interactions
            this.performAdaptiveLearning();
        }
    }

    /**
     * Perform adaptive learning to improve narratives
     */
    performAdaptiveLearning() {
        if (this.userInteractions.length < 5) return;

        const recentInteractions = this.userInteractions.slice(-20);
        const recentSentiment = this.calculateAverageSentiment();
        
        // Update narrative effectiveness based on user behavior
        for (const [id, narrative] of this.narratives) {
            if (narrative.lastUsed) {
                const timeSinceLastUse = Date.now() - narrative.lastUsed;
                const interactionsAfterNarrative = this.getInteractionsAfter(narrative.lastUsed);
                
                // Simple effectiveness calculation
                const effectiveness = this.calculateNarrativeEffectiveness(
                    interactionsAfterNarrative, 
                    recentSentiment,
                    timeSinceLastUse
                );
                
                narrative.effectiveness = Math.max(0, Math.min(1, effectiveness));
            }
        }

        // Generate new narrative variants if needed
        this.generateAdaptiveNarratives();
        
        console.log(`🧠 Adaptive learning completed. Average sentiment: ${recentSentiment.toFixed(3)}`);
    }

    /**
     * Calculate average sentiment score
     */
    calculateAverageSentiment() {
        if (this.sentimentScores.length === 0) return 0;
        
        const recentScores = this.sentimentScores.slice(-10);
        const sum = recentScores.reduce((acc, score) => acc + score.score, 0);
        return sum / recentScores.length;
    }

    /**
     * Get interactions after specific timestamp
     */
    getInteractionsAfter(timestamp) {
        return this.userInteractions.filter(interaction => interaction.timestamp > timestamp);
    }

    /**
     * Calculate narrative effectiveness
     */
    calculateNarrativeEffectiveness(interactions, sentiment, timeSinceUse) {
        let effectiveness = 0.5; // Base effectiveness
        
        // Positive sentiment increases effectiveness
        effectiveness += sentiment * 0.3;
        
        // More interactions after narrative = higher effectiveness
        effectiveness += Math.min(interactions.length * 0.05, 0.2);
        
        // Recency factor (more recent = more relevant)
        const recencyFactor = Math.exp(-timeSinceUse / (1000 * 60 * 60)); // Decay over hours
        effectiveness *= recencyFactor;
        
        return effectiveness;
    }

    /**
     * Generate adaptive narrative variations
     */
    generateAdaptiveNarratives() {
        const sentiment = this.calculateAverageSentiment();
        const interactionProfile = this.analyzeInteractionProfile();
        
        for (const [id, narrative] of this.narratives) {
            if (narrative.effectiveness < 0.3) {
                // Generate improved version
                const adaptedNarrative = this.adaptNarrative(narrative, sentiment, interactionProfile);
                
                if (adaptedNarrative) {
                    narrative.adaptedVersions.set('current', adaptedNarrative);
                    console.log(`🔄 Generated adaptive version for narrative: ${id}`);
                }
            }
        }
    }

    /**
     * Analyze user interaction profile
     */
    analyzeInteractionProfile() {
        const recentInteractions = this.userInteractions.slice(-50);
        
        const profile = {
            clickRate: recentInteractions.filter(i => i.type === 'click').length / recentInteractions.length,
            scrollEngagement: recentInteractions.filter(i => i.type === 'scroll' && i.percentage > 25).length / recentInteractions.length,
            timeEngagement: recentInteractions.filter(i => i.type === 'visibility_hidden' && i.timeOnPage > 15000).length,
            preferredElements: this.getPreferredElements(recentInteractions)
        };
        
        return profile;
    }

    /**
     * Get user's preferred interaction elements
     */
    getPreferredElements(interactions) {
        const elementCounts = {};
        
        interactions
            .filter(i => i.type === 'click' && i.target)
            .forEach(i => {
                elementCounts[i.target] = (elementCounts[i.target] || 0) + 1;
            });
        
        return Object.entries(elementCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([element]) => element);
    }

    /**
     * Adapt narrative based on user behavior
     */
    adaptNarrative(narrative, sentiment, profile) {
        let adaptedText = narrative.text;
        let adaptedDuration = narrative.duration;
        
        // Adjust for sentiment
        if (sentiment > 0.5) {
            // User is highly engaged - make it more exciting
            adaptedText = this.enhanceNarrative(adaptedText, 'exciting');
            adaptedDuration *= 1.2; // Slightly longer
        } else if (sentiment < -0.2) {
            // User seems less engaged - make it more direct
            adaptedText = this.simplifyNarrative(adaptedText);
            adaptedDuration *= 0.8; // Shorter
        }
        
        // Adjust for interaction profile
        if (profile.clickRate > 0.7) {
            // High interaction user - add call-to-action elements
            adaptedText = this.addInteractiveElements(adaptedText);
        }
        
        if (profile.scrollEngagement > 0.8) {
            // High scroll engagement - mention visual elements
            adaptedText = this.enhanceVisualReferences(adaptedText);
        }
        
        return {
            ...narrative,
            text: adaptedText,
            duration: Math.max(2000, Math.min(8000, adaptedDuration)),
            adaptedAt: Date.now(),
            basedOnSentiment: sentiment,
            basedOnProfile: profile
        };
    }

    /**
     * Enhance narrative for excitement
     */
    enhanceNarrative(text, emotion) {
        const enhancers = {
            'exciting': ['amazing', 'incredible', 'stunning', 'breakthrough', 'revolutionary'],
            'engaging': ['interactive', 'dynamic', 'responsive', 'immersive', 'captivating']
        };
        
        if (enhancers[emotion]) {
            const enhancer = enhancers[emotion][Math.floor(Math.random() * enhancers[emotion].length)];
            return text.replace(/\b(design|visualization|analysis|animation)\b/i, `${enhancer} $1`);
        }
        
        return text;
    }

    /**
     * Simplify narrative for better engagement
     */
    simplifyNarrative(text) {
        return text
            .replace(/cutting-edge/g, 'modern')
            .replace(/Nobel-tier/g, 'top-quality')
            .replace(/visualization techniques/g, 'visuals')
            .replace(/competitor analysis/g, 'analysis');
    }

    /**
     * Add interactive elements to narrative
     */
    addInteractiveElements(text) {
        const interactivePrompts = [
            'Click to explore',
            'Try it yourself',
            'Discover more',
            'See it in action'
        ];
        
        const prompt = interactivePrompts[Math.floor(Math.random() * interactivePrompts.length)];
        return `${text} - ${prompt}`;
    }

    /**
     * Enhance visual references in narrative
     */
    enhanceVisualReferences(text) {
        return text
            .replace(/effects/g, 'visual effects')
            .replace(/design/g, 'visual design')
            .replace(/animations/g, 'smooth animations');
    }

    /**
     * Get next narrative based on context and learning
     */
    getNextNarrative(context = {}) {
        const contextVector = this.generateContextVector(Object.keys(context));
        const candidates = Array.from(this.narratives.values());
        
        // Score each narrative
        const scoredNarratives = candidates.map(narrative => {
            let score = narrative.effectiveness;
            
            // Context similarity
            const similarity = this.calculateCosineSimilarity(contextVector, narrative.vector);
            score += similarity * this.weights.contextual;
            
            // Recency penalty (avoid repetition)
            if (narrative.lastUsed) {
                const timeSinceUse = Date.now() - narrative.lastUsed;
                const recencyPenalty = Math.exp(-timeSinceUse / (1000 * 60)); // Decay over minutes
                score *= (1 - recencyPenalty * 0.5);
            }
            
            // Usage frequency penalty
            score *= Math.exp(-narrative.usageCount * 0.1);
            
            return { narrative, score };
        });
        
        // Select best narrative
        scoredNarratives.sort((a, b) => b.score - a.score);
        const selectedNarrative = scoredNarratives[0].narrative;
        
        // Update usage statistics
        selectedNarrative.usageCount++;
        selectedNarrative.lastUsed = Date.now();
        this.currentNarrativeId = selectedNarrative.id;
        
        // Return adapted version if available and better
        if (selectedNarrative.adaptedVersions.has('current')) {
            const adaptedVersion = selectedNarrative.adaptedVersions.get('current');
            console.log(`🎯 Serving adapted narrative: ${selectedNarrative.id}`);
            return adaptedVersion;
        }
        
        console.log(`📖 Serving narrative: ${selectedNarrative.id} (score: ${scoredNarratives[0].score.toFixed(3)})`);
        return selectedNarrative;
    }

    /**
     * Calculate cosine similarity between vectors
     */
    calculateCosineSimilarity(vectorA, vectorB) {
        const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
        const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
        
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Normalize vector
     */
    normalizeVector(vector) {
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        if (magnitude === 0) return vector;
        return vector.map(v => v / magnitude);
    }

    /**
     * Get learning analytics
     */
    getAnalytics() {
        return {
            totalInteractions: this.userInteractions.length,
            averageSentiment: this.calculateAverageSentiment(),
            narrativeStats: Array.from(this.narratives.entries()).map(([id, narrative]) => ({
                id,
                effectiveness: narrative.effectiveness,
                usageCount: narrative.usageCount,
                hasAdaptedVersion: narrative.adaptedVersions.has('current')
            })),
            currentContext: this.currentNarrativeId,
            isLearning: !!this.learningInterval
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.learningInterval) {
            clearInterval(this.learningInterval);
        }
        
        this.isActive = false;
        console.log('🧹 DeepLearningNarrative cleanup completed');
    }
}

// Register module with the module system
if (window.ModuleSystem) {
    window.ModuleSystem.register('deepLearningNarrative', () => {
        return new Promise((resolve) => {
            const instance = new DeepLearningNarrative();
            resolve(instance);
        });
    }, []);
}

// Export for direct use
window.DeepLearningNarrative = DeepLearningNarrative;