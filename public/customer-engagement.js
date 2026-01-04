/**
 * Customer Engagement Enhancement Module
 * Smart suggestions and personalization for luxury services
 * Integrates with MrketOz AI and SeveNue quotation systems
 */

class CustomerEngagementModule {
    constructor() {
        this.initialized = false;
        this.engagementEngine = null;
        this.personalizationSystem = null;
        this.recommendationEngine = null;
        this.customerJourney = new Map();
        this.activeEngagements = new Map();
        
        this.init();
    }

    /**
     * Initialize customer engagement system
     */
    init() {
        console.log('🎯 Customer Engagement - Initializing smart suggestion system...');
        
        this.initializeEngagementEngine();
        this.initializePersonalization();
        this.initializeRecommendationEngine();
        this.initializeCustomerJourney();
        this.setupEventListeners();
        this.startEngagementMonitoring();
        
        this.initialized = true;
        console.log('✅ Customer Engagement - System fully initialized');
    }

    /**
     * Initialize core engagement engine
     */
    initializeEngagementEngine() {
        this.engagementEngine = {
            serviceTypes: {
                luxury_villa_joinery: {
                    name: 'Luxury Villa Joinery',
                    description: 'Premium custom joinery solutions for luxury residential spaces',
                    keywords: ['luxury', 'villa', 'custom', 'premium', 'joinery', 'residential'],
                    averageProject: { min: 15000, max: 75000, duration: '8-16 weeks' },
                    engagementTriggers: [
                        'viewed luxury portfolio',
                        'requested premium materials',
                        'mentioned villa project',
                        'high budget indicated'
                    ]
                },
                turnkey_service: {
                    name: 'Complete Turnkey Solutions',
                    description: 'End-to-end design and construction management services',
                    keywords: ['turnkey', 'complete', 'full service', 'project management', 'construction'],
                    averageProject: { min: 25000, max: 150000, duration: '12-24 weeks' },
                    engagementTriggers: [
                        'requested full service',
                        'mentioned timeline constraints',
                        'needs project coordination',
                        'comprehensive solution required'
                    ]
                },
                fitout_service: {
                    name: 'Professional Fitout Services',
                    description: 'Specialized space transformation and interior fitout solutions',
                    keywords: ['fitout', 'interior', 'commercial', 'office', 'retail', 'transformation'],
                    averageProject: { min: 8000, max: 40000, duration: '6-12 weeks' },
                    engagementTriggers: [
                        'commercial space mentioned',
                        'office fitout inquiry',
                        'retail space project',
                        'interior transformation needed'
                    ]
                }
            },
            
            analyzeInteraction: (interactionData) => {
                const analysis = {
                    timestamp: Date.now(),
                    interactionType: interactionData.type || 'unknown',
                    serviceInterest: this.detectServiceInterest(interactionData),
                    engagementLevel: this.calculateEngagementLevel(interactionData),
                    urgency: this.assessUrgency(interactionData),
                    budget_indication: this.estimateBudget(interactionData)
                };
                
                console.log('🔍 Engagement Analysis:', analysis);
                return analysis;
            },
            
            generateSuggestions: (customerId, analysis) => {
                const suggestions = [];
                const customer = this.customerJourney.get(customerId);
                
                // Service-specific suggestions based on analysis
                Object.entries(analysis.serviceInterest).forEach(([service, score]) => {
                    if (score > 0.6) {
                        const serviceInfo = this.engagementEngine.serviceTypes[service];
                        if (serviceInfo) {
                            suggestions.push({
                                type: 'service_recommendation',
                                service: service,
                                title: serviceInfo.name,
                                description: serviceInfo.description,
                                confidence: score,
                                priority: score > 0.8 ? 'high' : 'medium',
                                estimatedBudget: serviceInfo.averageProject,
                                timeline: serviceInfo.averageProject.duration,
                                nextSteps: this.generateNextSteps(service, analysis)
                            });
                        }
                    }
                });
                
                // Portfolio suggestions
                if (analysis.engagementLevel > 0.7) {
                    suggestions.push({
                        type: 'portfolio_showcase',
                        title: 'Explore Our Premium Portfolio',
                        description: 'View our latest luxury projects and design innovations',
                        confidence: 0.9,
                        priority: 'high',
                        action: 'view_portfolio',
                        category: this.getTopServiceInterest(analysis.serviceInterest)
                    });
                }
                
                // Consultation suggestions
                if (analysis.urgency > 0.6) {
                    suggestions.push({
                        type: 'consultation_offer',
                        title: 'Free Design Consultation',
                        description: 'Schedule a complimentary consultation with our design experts',
                        confidence: 0.85,
                        priority: 'high',
                        action: 'schedule_consultation',
                        availability: 'within 48 hours'
                    });
                }
                
                // Budget-aware suggestions
                if (analysis.budget_indication.range) {
                    suggestions.push({
                        type: 'budget_optimization',
                        title: 'Optimized Solutions for Your Budget',
                        description: `Tailored recommendations within your ${analysis.budget_indication.range} budget range`,
                        confidence: 0.75,
                        priority: 'medium',
                        budgetRange: analysis.budget_indication.range,
                        optimization: 'value_focused'
                    });
                }
                
                return suggestions.sort((a, b) => b.confidence - a.confidence);
            }
        };
    }

    /**
     * Initialize personalization system
     */
    initializePersonalization() {
        this.personalizationSystem = {
            preferences: new Map(),
            behaviors: new Map(),
            
            createPersonalizationProfile: (customerId, initialData = {}) => {
                const profile = {
                    customerId: customerId,
                    preferences: {
                        designStyle: initialData.designStyle || 'modern',
                        budgetRange: initialData.budgetRange || 'medium',
                        timeline: initialData.timeline || 'flexible',
                        servicePreference: initialData.servicePreference || 'quality_focused',
                        communicationStyle: initialData.communicationStyle || 'detailed'
                    },
                    behaviors: {
                        pageViews: [],
                        interactions: [],
                        inquiries: [],
                        projectHistory: []
                    },
                    aiInsights: {
                        predictedNeeds: [],
                        riskFactors: [],
                        opportunities: []
                    },
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                
                this.personalizationSystem.preferences.set(customerId, profile);
                console.log(`👤 Personalization Profile Created: ${customerId}`);
                
                return profile;
            },
            
            updateBehavior: (customerId, behaviorData) => {
                const profile = this.personalizationSystem.preferences.get(customerId);
                if (!profile) {
                    return this.personalizationSystem.createPersonalizationProfile(customerId, behaviorData);
                }
                
                // Update behaviors
                profile.behaviors.interactions.push({
                    ...behaviorData,
                    timestamp: Date.now()
                });
                
                // Update AI insights using MrketOz if available
                if (window.MrketOz) {
                    try {
                        const aiInsights = window.MrketOz.generateSuggestions(customerId, behaviorData);
                        profile.aiInsights.predictedNeeds = aiInsights || [];
                    } catch (error) {
                        console.warn('AI insights update failed:', error);
                    }
                }
                
                profile.lastUpdated = new Date().toISOString();
                
                console.log(`🔄 Behavior Updated: ${customerId}`);
                return profile;
            },
            
            getPersonalizedContent: (customerId) => {
                const profile = this.personalizationSystem.preferences.get(customerId);
                if (!profile) return null;
                
                const content = {
                    heroMessage: this.generatePersonalizedHeroMessage(profile),
                    featuredProjects: this.selectFeaturedProjects(profile),
                    serviceHighlights: this.prioritizeServices(profile),
                    callToAction: this.generatePersonalizedCTA(profile)
                };
                
                return content;
            }
        };
    }

    /**
     * Initialize recommendation engine
     */
    initializeRecommendationEngine() {
        this.recommendationEngine = {
            algorithms: {
                // Content-based filtering
                contentBased: (profile, availableServices) => {
                    const recommendations = [];
                    const preferences = profile.preferences;
                    
                    availableServices.forEach(service => {
                        let score = 0;
                        
                        // Style matching
                        if (service.designStyles && service.designStyles.includes(preferences.designStyle)) {
                            score += 0.3;
                        }
                        
                        // Budget compatibility
                        if (this.isBudgetCompatible(service.priceRange, preferences.budgetRange)) {
                            score += 0.25;
                        }
                        
                        // Timeline compatibility  
                        if (this.isTimelineCompatible(service.duration, preferences.timeline)) {
                            score += 0.2;
                        }
                        
                        // Service preference alignment
                        if (service.focusArea === preferences.servicePreference) {
                            score += 0.25;
                        }
                        
                        if (score > 0.5) {
                            recommendations.push({
                                service: service,
                                score: score,
                                reason: this.generateRecommendationReason(service, preferences, score)
                            });
                        }
                    });
                    
                    return recommendations.sort((a, b) => b.score - a.score);
                },
                
                // Collaborative filtering simulation
                collaborative: (profile, similarCustomers) => {
                    const recommendations = [];
                    
                    similarCustomers.forEach(similar => {
                        similar.positiveExperiences.forEach(service => {
                            recommendations.push({
                                service: service,
                                score: 0.7 + (similar.similarity * 0.3),
                                reason: `Customers with similar preferences were satisfied with this service`
                            });
                        });
                    });
                    
                    return recommendations;
                },
                
                // Hybrid approach
                hybrid: (profile) => {
                    const availableServices = this.getAvailableServices();
                    const contentRecommendations = this.recommendationEngine.algorithms.contentBased(profile, availableServices);
                    const collaborativeRecommendations = this.recommendationEngine.algorithms.collaborative(profile, this.findSimilarCustomers(profile));
                    
                    // Combine and weight recommendations
                    const combined = new Map();
                    
                    contentRecommendations.forEach(rec => {
                        const key = rec.service.id;
                        combined.set(key, {
                            ...rec,
                            contentScore: rec.score,
                            collaborativeScore: 0,
                            finalScore: rec.score * 0.7
                        });
                    });
                    
                    collaborativeRecommendations.forEach(rec => {
                        const key = rec.service.id;
                        if (combined.has(key)) {
                            const existing = combined.get(key);
                            existing.collaborativeScore = rec.score;
                            existing.finalScore = (existing.contentScore * 0.7) + (rec.score * 0.3);
                        } else {
                            combined.set(key, {
                                ...rec,
                                contentScore: 0,
                                collaborativeScore: rec.score,
                                finalScore: rec.score * 0.3
                            });
                        }
                    });
                    
                    return Array.from(combined.values()).sort((a, b) => b.finalScore - a.finalScore);
                }
            },
            
            generateRecommendations: (customerId) => {
                const profile = this.personalizationSystem.preferences.get(customerId);
                if (!profile) {
                    console.warn('No profile found for recommendations:', customerId);
                    return [];
                }
                
                const recommendations = this.recommendationEngine.algorithms.hybrid(profile);
                
                // Enhance with real-time data
                recommendations.forEach(rec => {
                    rec.marketTrend = this.getMarketTrend(rec.service.category);
                    rec.availability = this.checkServiceAvailability(rec.service);
                    rec.estimatedQuotation = this.generateQuickEstimate(rec.service, profile);
                });
                
                console.log(`💡 Generated ${recommendations.length} recommendations for ${customerId}`);
                return recommendations;
            }
        };
    }

    /**
     * Initialize customer journey tracking
     */
    initializeCustomerJourney() {
        this.journeyTracker = {
            stages: ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase'],
            
            trackJourneyStage: (customerId, interactionData) => {
                if (!this.customerJourney.has(customerId)) {
                    this.customerJourney.set(customerId, {
                        customerId: customerId,
                        currentStage: 'awareness',
                        stageHistory: [],
                        touchpoints: [],
                        engagementScore: 0,
                        journeyStarted: Date.now()
                    });
                }
                
                const journey = this.customerJourney.get(customerId);
                const newStage = this.determineJourneyStage(interactionData, journey);
                
                if (newStage !== journey.currentStage) {
                    journey.stageHistory.push({
                        stage: journey.currentStage,
                        exitedAt: Date.now(),
                        duration: Date.now() - (journey.lastStageEntry || journey.journeyStarted)
                    });
                    
                    journey.currentStage = newStage;
                    journey.lastStageEntry = Date.now();
                    
                    console.log(`🚶 Customer Journey: ${customerId} moved to ${newStage} stage`);
                    
                    // Trigger stage-specific actions
                    this.triggerStageActions(customerId, newStage);
                }
                
                // Add touchpoint
                journey.touchpoints.push({
                    ...interactionData,
                    timestamp: Date.now(),
                    stage: journey.currentStage
                });
                
                // Update engagement score
                journey.engagementScore = this.calculateEngagementScore(journey);
                
                return journey;
            },
            
            determineJourneyStage: (interactionData, journey) => {
                const { type, duration, depth } = interactionData;
                
                // Simple stage progression logic
                if (type === 'quotation_request' || type === 'contact_form') return 'intent';
                if (type === 'portfolio_view' && duration > 300) return 'consideration';
                if (type === 'service_inquiry') return 'interest';
                if (depth > 3 || duration > 600) return 'evaluation';
                
                return journey.currentStage; // No stage change
            },
            
            getJourneyInsights: (customerId) => {
                const journey = this.customerJourney.get(customerId);
                if (!journey) return null;
                
                const totalDuration = Date.now() - journey.journeyStarted;
                const avgStageTime = totalDuration / (journey.stageHistory.length + 1);
                
                return {
                    customerId,
                    currentStage: journey.currentStage,
                    totalDuration,
                    avgStageTime,
                    engagementScore: journey.engagementScore,
                    touchpointsCount: journey.touchpoints.length,
                    stageProgression: journey.stageHistory.length,
                    recommendations: this.getStageRecommendations(journey.currentStage),
                    nextActions: this.suggestNextActions(journey)
                };
            }
        };
    }

    /**
     * Set up event listeners for integration with other modules
     */
    setupEventListeners() {
        // Listen for customer interactions
        window.addEventListener('customerInteraction', (event) => {
            this.handleCustomerInteraction(event.detail);
        });
        
        // Listen for MrketOz AI updates
        window.addEventListener('mrketoz-smartSuggestionsGenerated', (event) => {
            this.integrateAISuggestions(event.detail);
        });
        
        // Listen for SeveNue quotation events
        window.addEventListener('sevenue-quotationGenerated', (event) => {
            this.handleQuotationGenerated(event.detail);
        });
        
        // Listen for strategic analysis updates
        window.addEventListener('strategicAnalysisUpdate', (event) => {
            this.updateMarketContext(event.detail);
        });
    }

    /**
     * Start engagement monitoring
     */
    startEngagementMonitoring() {
        // Monitor page interactions
        this.monitorPageEngagement();
        
        // Start periodic analysis
        setInterval(() => {
            this.performPeriodicAnalysis();
        }, 60000); // Every minute
        
        console.log('📊 Engagement monitoring started');
    }

    /**
     * Handle customer interaction events
     */
    handleCustomerInteraction(interactionData) {
        const customerId = interactionData.customerId || this.generateCustomerId();
        
        // Analyze interaction
        const analysis = this.engagementEngine.analyzeInteraction(interactionData);
        
        // Update personalization profile
        this.personalizationSystem.updateBehavior(customerId, {
            ...interactionData,
            analysis: analysis
        });
        
        // Track journey stage
        this.journeyTracker.trackJourneyStage(customerId, interactionData);
        
        // Generate suggestions
        const suggestions = this.engagementEngine.generateSuggestions(customerId, analysis);
        
        // Store active engagement
        this.activeEngagements.set(customerId, {
            lastInteraction: Date.now(),
            analysis: analysis,
            suggestions: suggestions,
            engagementLevel: analysis.engagementLevel
        });
        
        // Dispatch suggestions event
        this.dispatchEvent('suggestionsGenerated', {
            customerId,
            suggestions,
            analysis
        });
        
        console.log(`🎯 Customer Engagement Processed: ${customerId}`);
        
        return { customerId, suggestions, analysis };
    }

    /**
     * Generate smart customer suggestions (alias for generateNewCustomerSuggestions)
     */
    generateSmartSuggestions(customerId, context = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Customer Engagement - Module not initialized');
            return [];
        }
        
        // If customerId is actually a context object, treat as new customer
        if (typeof customerId === 'object' && !context.hasOwnProperty('length')) {
            return this.generateNewCustomerSuggestions(customerId);
        }
        
        const profile = this.customerJourney.get(customerId);
        if (!profile) {
            // Create temporary suggestions based on context
            return this.generateNewCustomerSuggestions(context);
        }
        
        // Generate suggestions based on customer journey and profile
        const journeyInsights = this.journeyTracker.getJourneyInsights(customerId);
        if (journeyInsights && journeyInsights.recommendations) {
            return journeyInsights.recommendations.slice(0, 5); // Return top 5 suggestions
        }
        
        return this.generateNewCustomerSuggestions(context);
    },

    /**
     * Generate smart suggestions for new customers interested in luxury services
     */
    generateNewCustomerSuggestions(customerContext = {}) {
        const suggestions = [];
        
        // Luxury villa joinery suggestions
        if (customerContext.interest === 'luxury' || customerContext.projectType === 'villa') {
            suggestions.push({
                type: 'luxury_villa_showcase',
                title: 'Exclusive Villa Joinery Portfolio',
                description: 'Discover our premium custom joinery solutions designed for luxury residential spaces',
                priority: 'high',
                confidence: 0.9,
                features: [
                    'Custom millwork and cabinetry',
                    'Premium material selection',
                    'Architectural joinery solutions',
                    'Luxury hardware and finishes'
                ],
                estimatedBudget: '€15,000 - €75,000',
                timeline: '8-16 weeks',
                nextStep: 'schedule_luxury_consultation'
            });
        }
        
        // Turnkey service suggestions
        suggestions.push({
            type: 'turnkey_solution',
            title: 'Complete Turnkey Design & Build',
            description: 'End-to-end project management from initial design to final completion',
            priority: 'high',
            confidence: 0.85,
            benefits: [
                'Single point of contact',
                'Integrated design and construction',
                'Timeline and budget certainty',
                'Quality assurance throughout'
            ],
            estimatedBudget: '€25,000 - €150,000',
            timeline: '12-24 weeks',
            nextStep: 'request_project_consultation'
        });
        
        // Professional fitout suggestions
        suggestions.push({
            type: 'fitout_specialization',
            title: 'Professional Space Transformation',
            description: 'Specialized fitout services for commercial and residential interior spaces',
            priority: 'medium',
            confidence: 0.8,
            applications: [
                'Office and workspace fitouts',
                'Retail and hospitality spaces',
                'Residential interior renovations',
                'Healthcare and education facilities'
            ],
            estimatedBudget: '€8,000 - €40,000',
            timeline: '6-12 weeks',
            nextStep: 'discuss_fitout_requirements'
        });
        
        // Technology integration suggestion
        if (customerContext.techInterested !== false) {
            suggestions.push({
                type: 'smart_integration',
                title: 'Smart Technology Integration',
                description: 'Incorporate cutting-edge technology into your design project',
                priority: 'medium',
                confidence: 0.7,
                technologies: [
                    'Smart home automation',
                    'Advanced lighting systems',
                    'Climate control integration',
                    'Security system coordination'
                ],
                addOnService: true,
                nextStep: 'explore_smart_options'
            });
        }
        
        return suggestions;
    }

    /**
     * Utility methods for engagement analysis
     */
    detectServiceInterest(interactionData) {
        const interests = {
            luxury_villa_joinery: 0,
            turnkey_service: 0,
            fitout_service: 0
        };
        
        const keywords = interactionData.keywords || [];
        const content = (interactionData.content || '').toLowerCase();
        
        // Keyword analysis
        Object.entries(this.engagementEngine.serviceTypes).forEach(([service, serviceInfo]) => {
            serviceInfo.keywords.forEach(keyword => {
                if (content.includes(keyword.toLowerCase()) || keywords.includes(keyword)) {
                    interests[service] += 0.2;
                }
            });
        });
        
        // Page analysis
        if (interactionData.page) {
            if (interactionData.page.includes('luxury') || interactionData.page.includes('villa')) {
                interests.luxury_villa_joinery += 0.3;
            }
            if (interactionData.page.includes('turnkey') || interactionData.page.includes('complete')) {
                interests.turnkey_service += 0.3;
            }
            if (interactionData.page.includes('fitout') || interactionData.page.includes('commercial')) {
                interests.fitout_service += 0.3;
            }
        }
        
        // Budget indication
        if (interactionData.budgetRange) {
            if (interactionData.budgetRange.includes('high') || interactionData.budgetRange.includes('premium')) {
                interests.luxury_villa_joinery += 0.2;
                interests.turnkey_service += 0.1;
            }
        }
        
        return interests;
    }

    calculateEngagementLevel(interactionData) {
        let score = 0.5; // Base engagement
        
        if (interactionData.duration > 120) score += 0.2; // 2+ minutes
        if (interactionData.depth > 2) score += 0.15; // Multiple pages
        if (interactionData.interactions > 5) score += 0.1; // Active interaction
        if (interactionData.type === 'form_submission') score += 0.3;
        if (interactionData.type === 'contact_request') score += 0.4;
        
        return Math.min(1.0, score);
    }

    assessUrgency(interactionData) {
        let urgency = 0.3; // Base urgency
        
        const urgentKeywords = ['urgent', 'asap', 'quickly', 'deadline', 'timeline'];
        const content = (interactionData.content || '').toLowerCase();
        
        urgentKeywords.forEach(keyword => {
            if (content.includes(keyword)) urgency += 0.2;
        });
        
        if (interactionData.timeframe && interactionData.timeframe.includes('immediate')) {
            urgency += 0.4;
        }
        
        if (interactionData.type === 'phone_call') urgency += 0.2;
        if (interactionData.source === 'referral') urgency += 0.1;
        
        return Math.min(1.0, urgency);
    }

    estimateBudget(interactionData) {
        let budgetIndicators = {
            range: null,
            confidence: 0.5
        };
        
        if (interactionData.budgetMentioned) {
            budgetIndicators.range = interactionData.budgetMentioned;
            budgetIndicators.confidence = 0.9;
        } else {
            // Infer from service interest and context
            const interests = this.detectServiceInterest(interactionData);
            const topInterest = Object.entries(interests).sort((a, b) => b[1] - a[1])[0];
            
            if (topInterest[1] > 0.6) {
                const serviceInfo = this.engagementEngine.serviceTypes[topInterest[0]];
                budgetIndicators.range = `€${serviceInfo.averageProject.min} - €${serviceInfo.averageProject.max}`;
                budgetIndicators.confidence = 0.6;
            }
        }
        
        return budgetIndicators;
    }

    /**
     * Generate customer ID for tracking
     */
    generateCustomerId() {
        return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Monitor page engagement
     */
    monitorPageEngagement() {
        let startTime = Date.now();
        let interactions = 0;
        let scrollDepth = 0;
        
        // Track scroll depth
        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.pageYOffset;
            scrollDepth = Math.max(scrollDepth, currentScroll / totalHeight);
        }, { passive: true });
        
        // Track interactions
        ['click', 'focus', 'input'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactions++;
            }, { passive: true });
        });
        
        // Send engagement data on page unload
        window.addEventListener('beforeunload', () => {
            const engagement = {
                type: 'page_engagement',
                duration: Date.now() - startTime,
                interactions: interactions,
                scrollDepth: scrollDepth,
                page: window.location.pathname
            };
            
            this.handleCustomerInteraction(engagement);
        });
    }

    /**
     * Perform periodic analysis
     */
    performPeriodicAnalysis() {
        // Analyze active engagements for follow-up opportunities
        this.activeEngagements.forEach((engagement, customerId) => {
            const timeSinceInteraction = Date.now() - engagement.lastInteraction;
            
            // Re-engagement trigger after 10 minutes of inactivity
            if (timeSinceInteraction > 600000 && engagement.engagementLevel > 0.7) {
                this.triggerReEngagement(customerId, engagement);
            }
            
            // Clean up old engagements
            if (timeSinceInteraction > 3600000) { // 1 hour
                this.activeEngagements.delete(customerId);
            }
        });
    }

    /**
     * Trigger re-engagement for high-potential customers
     */
    triggerReEngagement(customerId, engagement) {
        const reEngagementSuggestion = {
            type: 'follow_up',
            title: 'Continue Where You Left Off',
            description: 'We noticed your interest in our services. Would you like to continue exploring?',
            priority: 'medium',
            confidence: 0.8,
            previousSuggestions: engagement.suggestions.slice(0, 2),
            callToAction: 'Continue Exploring'
        };
        
        this.dispatchEvent('reEngagementTriggered', {
            customerId,
            suggestion: reEngagementSuggestion,
            originalEngagement: engagement
        });
        
        console.log(`🔄 Re-engagement triggered for ${customerId}`);
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            activeEngagements: this.activeEngagements.size,
            customerJourneys: this.customerJourney.size,
            personalizationProfiles: this.personalizationSystem.preferences.size,
            serviceTypes: Object.keys(this.engagementEngine.serviceTypes).length,
            engagementMetrics: {
                avgEngagementLevel: this.calculateAverageEngagementLevel(),
                topServiceInterest: this.getTopServiceInterest(),
                journeyStageDistribution: this.getJourneyStageDistribution()
            }
        };
    }

    /**
     * Calculate average engagement level
     */
    calculateAverageEngagementLevel() {
        if (this.activeEngagements.size === 0) return 0;
        
        let total = 0;
        this.activeEngagements.forEach(engagement => {
            total += engagement.engagementLevel;
        });
        
        return total / this.activeEngagements.size;
    }

    /**
     * Get top service interest across all customers
     */
    getTopServiceInterest() {
        const serviceInterests = {
            luxury_villa_joinery: 0,
            turnkey_service: 0,
            fitout_service: 0
        };
        
        this.activeEngagements.forEach(engagement => {
            Object.entries(engagement.analysis.serviceInterest || {}).forEach(([service, score]) => {
                serviceInterests[service] = (serviceInterests[service] || 0) + score;
            });
        });
        
        return Object.entries(serviceInterests).sort((a, b) => b[1] - a[1])[0]?.[0] || 'fitout_service';
    }

    /**
     * Get journey stage distribution
     */
    getJourneyStageDistribution() {
        const distribution = {};
        
        this.customerJourney.forEach(journey => {
            distribution[journey.currentStage] = (distribution[journey.currentStage] || 0) + 1;
        });
        
        return distribution;
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventType, data) {
        const event = new CustomEvent(`customerEngagement${eventType}`, {
            detail: data,
            bubbles: true
        });
        window.dispatchEvent(event);
    }
}

// Export for use in other modules
window.CustomerEngagementModule = CustomerEngagementModule;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
    window.customerEngagementInstance = new CustomerEngagementModule();
    
    // Expose public API
    window.CustomerEngagement = {
        handleInteraction: (data) => window.customerEngagementInstance.handleCustomerInteraction(data),
        generateSuggestions: (context) => window.customerEngagementInstance.generateNewCustomerSuggestions(context),
        getPersonalizedContent: (customerId) => 
            window.customerEngagementInstance.personalizationSystem.getPersonalizedContent(customerId),
        trackJourney: (customerId, interactionData) => 
            window.customerEngagementInstance.journeyTracker.trackJourneyStage(customerId, interactionData),
        getStatus: () => window.customerEngagementInstance.getSystemStatus(),
        getRecommendations: (customerId) => 
            window.customerEngagementInstance.recommendationEngine.generateRecommendations(customerId)
    };
    
    console.log('🎯 Customer Engagement - Global API exposed');
}