/**
 * AI-Enhanced MrketOz CRM - Advanced Customer Intelligence System
 * Integrates AI-powered features for superior customer experience
 * 
 * Features:
 * - Customer sentiment analysis
 * - Smart lead scoring
 * - Predictive customer needs
 * - Automated intelligent responses
 * - Conversation routing optimization
 */

const ADMIN_EMAIL = 'support@designfitout.com';
const CRM_NAME = 'MrketOz AI-Enhanced CRM';

/**
 * AI-powered customer sentiment analysis
 */
class CustomerSentimentAnalyzer {
    constructor() {
        this.sentimentModels = {
            keywords: {
                positive: ['excellent', 'amazing', 'perfect', 'love', 'fantastic', 'satisfied', 'happy', 'pleased', 'wonderful', 'outstanding'],
                negative: ['disappointed', 'frustrated', 'angry', 'terrible', 'awful', 'hate', 'worst', 'unacceptable', 'poor', 'bad'],
                urgent: ['urgent', 'asap', 'immediately', 'emergency', 'rush', 'critical', 'deadline', 'time-sensitive'],
                budget_conscious: ['cheap', 'affordable', 'budget', 'cost', 'price', 'expensive', 'discount', 'deal']
            },
            emoticons: {
                positive: ['😊', '😄', '👍', '❤️', '😍', '🎉', '✨', '🌟'],
                negative: ['😠', '😡', '👎', '😤', '😢', '😞', '💔', '😔'],
                neutral: ['🤔', '😐', '😑', '🙂', '😊']
            }
        };
        
        this.responseTemplates = new Map();
        this.initializeResponseTemplates();
    }

    initializeResponseTemplates() {
        this.responseTemplates.set('positive', [
            "Thank you for your positive feedback! We're delighted to help you further. 😊",
            "It's wonderful to hear you're satisfied! Let's continue with your project. ✨",
            "Your enthusiasm is contagious! We're excited to work with you. 🎉"
        ]);
        
        this.responseTemplates.set('negative', [
            "I sincerely apologize for any inconvenience. Let me escalate this to our senior team immediately. 🙏",
            "I understand your frustration, and we're committed to making this right. A manager will contact you within the hour. 💪",
            "Your concerns are valid, and we take them seriously. Let me connect you with our customer success team right away. 🤝"
        ]);
        
        this.responseTemplates.set('urgent', [
            "I understand this is time-sensitive. Let me prioritize your request and get you immediate assistance. ⚡",
            "Noted as urgent! I'm connecting you with our rapid response team right now. 🚀",
            "Time is of the essence - I'm fast-tracking your request to our priority queue. ⏰"
        ]);
    }

    async analyzeSentiment(message) {
        const analysis = {
            text: message.toLowerCase(),
            sentiment: 'neutral',
            confidence: 0.5,
            urgency: 'normal',
            budget_sensitivity: 'normal',
            emotional_indicators: [],
            recommended_action: 'standard_response'
        };

        // Analyze keywords
        const sentimentScores = { positive: 0, negative: 0, urgent: 0, budget: 0 };
        
        Object.entries(this.sentimentModels.keywords).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (analysis.text.includes(keyword)) {
                    sentimentScores[category.split('_')[0]] += 1;
                    analysis.emotional_indicators.push({ keyword, category, weight: 1 });
                }
            });
        });

        // Analyze emoticons
        Object.entries(this.sentimentModels.emoticons).forEach(([sentiment, emoticons]) => {
            emoticons.forEach(emoticon => {
                if (message.includes(emoticon)) {
                    sentimentScores[sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'neutral'] += 2;
                    analysis.emotional_indicators.push({ emoticon, sentiment, weight: 2 });
                }
            });
        });

        // Determine primary sentiment
        if (sentimentScores.positive > sentimentScores.negative) {
            analysis.sentiment = 'positive';
            analysis.confidence = Math.min(0.9, 0.6 + (sentimentScores.positive * 0.1));
        } else if (sentimentScores.negative > sentimentScores.positive) {
            analysis.sentiment = 'negative';
            analysis.confidence = Math.min(0.9, 0.6 + (sentimentScores.negative * 0.1));
            analysis.recommended_action = 'escalate';
        }

        // Determine urgency
        if (sentimentScores.urgent > 2) {
            analysis.urgency = 'high';
            analysis.recommended_action = 'priority_response';
        } else if (sentimentScores.urgent > 0) {
            analysis.urgency = 'medium';
        }

        // Determine budget sensitivity
        if (sentimentScores.budget > 1) {
            analysis.budget_sensitivity = 'high';
        }

        return analysis;
    }

    generateIntelligentResponse(analysis, context = {}) {
        const { sentiment, urgency, recommended_action } = analysis;
        
        let responseCategory = sentiment;
        if (urgency === 'high') responseCategory = 'urgent';
        if (recommended_action === 'escalate') responseCategory = 'negative';

        const templates = this.responseTemplates.get(responseCategory) || this.responseTemplates.get('positive');
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

        return {
            message: randomTemplate,
            action: recommended_action,
            confidence: analysis.confidence,
            metadata: {
                sentiment_analysis: analysis,
                response_reasoning: `Selected ${responseCategory} template based on sentiment: ${sentiment}, urgency: ${urgency}`
            }
        };
    }
}

/**
 * Smart lead scoring system with AI
 */
class SmartLeadScorer {
    constructor() {
        this.scoringFactors = {
            budget_range: { weight: 0.3, thresholds: { high: 50000, medium: 25000, low: 10000 } },
            project_urgency: { weight: 0.25, mapping: { immediate: 1.0, month: 0.8, quarter: 0.6, flexible: 0.3 } },
            communication_quality: { weight: 0.2, factors: ['detail_level', 'responsiveness', 'clarity'] },
            referral_source: { weight: 0.15, values: { existing_client: 1.0, partner: 0.8, online: 0.6, cold: 0.3 } },
            project_complexity: { weight: 0.1, mapping: { commercial: 1.0, residential_luxury: 0.8, residential_standard: 0.6 } }
        };
        
        this.conversionPredictors = {
            budget_mention_early: 15,
            specific_timeline: 12,
            multiple_questions: 10,
            technical_knowledge: 8,
            comparison_shopping: -5,
            price_focused_only: -10
        };
    }

    async calculateLeadScore(customerData, interactionHistory = []) {
        let totalScore = 0;
        const scoreBreakdown = {};
        
        // Analyze budget range
        const budgetScore = this.analyzeBudget(customerData.budget);
        totalScore += budgetScore * this.scoringFactors.budget_range.weight;
        scoreBreakdown.budget = { score: budgetScore, weight: this.scoringFactors.budget_range.weight };

        // Analyze project urgency
        const urgencyScore = this.analyzeUrgency(customerData.timeline);
        totalScore += urgencyScore * this.scoringFactors.project_urgency.weight;
        scoreBreakdown.urgency = { score: urgencyScore, weight: this.scoringFactors.project_urgency.weight };

        // Analyze communication quality
        const communicationScore = this.analyzeCommunication(interactionHistory);
        totalScore += communicationScore * this.scoringFactors.communication_quality.weight;
        scoreBreakdown.communication = { score: communicationScore, weight: this.scoringFactors.communication_quality.weight };

        // Analyze referral source
        const referralScore = this.analyzeReferralSource(customerData.source);
        totalScore += referralScore * this.scoringFactors.referral_source.weight;
        scoreBreakdown.referral = { score: referralScore, weight: this.scoringFactors.referral_source.weight };

        // Analyze project complexity
        const complexityScore = this.analyzeComplexity(customerData.projectType);
        totalScore += complexityScore * this.scoringFactors.project_complexity.weight;
        scoreBreakdown.complexity = { score: complexityScore, weight: this.scoringFactors.project_complexity.weight };

        // Apply conversation predictors
        const predictorBonus = this.applyConversionPredictors(interactionHistory);
        totalScore += predictorBonus;
        scoreBreakdown.predictors = { score: predictorBonus, factors: this.getActivePredictors(interactionHistory) };

        const finalScore = Math.max(0, Math.min(100, Math.round(totalScore * 100)));
        
        return {
            score: finalScore,
            classification: this.classifyLead(finalScore),
            breakdown: scoreBreakdown,
            nextActions: this.suggestNextActions(finalScore, customerData, interactionHistory),
            conversionProbability: this.calculateConversionProbability(finalScore, scoreBreakdown),
            timeline_prediction: this.predictConversionTimeline(finalScore, customerData)
        };
    }

    analyzeBudget(budget) {
        if (!budget) return 0.3;
        
        const budgetNum = typeof budget === 'string' ? this.extractBudgetNumber(budget) : budget;
        const { high, medium, low } = this.scoringFactors.budget_range.thresholds;
        
        if (budgetNum >= high) return 1.0;
        if (budgetNum >= medium) return 0.8;
        if (budgetNum >= low) return 0.6;
        return 0.4;
    }

    extractBudgetNumber(budgetString) {
        const match = budgetString.match(/\$?(\d+)k?/i);
        if (match) {
            const num = parseInt(match[1]);
            return budgetString.includes('k') || budgetString.includes('K') ? num * 1000 : num;
        }
        return 0;
    }

    analyzeUrgency(timeline) {
        if (!timeline) return 0.5;
        
        const timelineKey = timeline.toLowerCase();
        return this.scoringFactors.project_urgency.mapping[timelineKey] || 0.5;
    }

    analyzeCommunication(interactions) {
        if (!interactions || interactions.length === 0) return 0.5;
        
        let score = 0;
        let factors = 0;
        
        // Analyze detail level
        const avgMessageLength = interactions.reduce((sum, msg) => sum + (msg.message?.length || 0), 0) / interactions.length;
        if (avgMessageLength > 100) { score += 0.3; factors++; }
        else if (avgMessageLength > 50) { score += 0.2; factors++; }
        
        // Analyze responsiveness (time between messages)
        if (interactions.length > 1) {
            const responseTime = this.calculateAverageResponseTime(interactions);
            if (responseTime < 3600) { score += 0.3; factors++; } // Less than 1 hour
            else if (responseTime < 86400) { score += 0.2; factors++; } // Less than 1 day
        }
        
        // Analyze clarity (questions asked, specificity)
        const questionsAsked = interactions.filter(msg => msg.message && msg.message.includes('?')).length;
        if (questionsAsked > 2) { score += 0.4; factors++; }
        else if (questionsAsked > 0) { score += 0.2; factors++; }
        
        return factors > 0 ? score / factors : 0.5;
    }

    classifyLead(score) {
        if (score >= 80) return 'hot';
        if (score >= 60) return 'warm';
        if (score >= 40) return 'cool';
        return 'cold';
    }

    suggestNextActions(score, customerData, interactions) {
        const actions = [];
        
        if (score >= 80) {
            actions.push({
                action: 'schedule_consultation',
                priority: 'immediate',
                description: 'Schedule in-person consultation within 24 hours',
                expectedOutcome: 'Move to proposal stage'
            });
            actions.push({
                action: 'prepare_portfolio',
                priority: 'high',
                description: 'Prepare customized portfolio showcasing similar projects',
                expectedOutcome: 'Build confidence and trust'
            });
        } else if (score >= 60) {
            actions.push({
                action: 'send_case_studies',
                priority: 'high',
                description: 'Send relevant case studies and testimonials',
                expectedOutcome: 'Increase interest and credibility'
            });
            actions.push({
                action: 'follow_up_call',
                priority: 'medium',
                description: 'Schedule follow-up call within 3 days',
                expectedOutcome: 'Gather more information and build rapport'
            });
        } else if (score >= 40) {
            actions.push({
                action: 'nurture_content',
                priority: 'medium',
                description: 'Send educational content about design trends',
                expectedOutcome: 'Stay top-of-mind and build expertise'
            });
            actions.push({
                action: 'quarterly_check',
                priority: 'low',
                description: 'Schedule quarterly check-in',
                expectedOutcome: 'Maintain relationship for future opportunities'
            });
        } else {
            actions.push({
                action: 'add_to_newsletter',
                priority: 'low',
                description: 'Add to newsletter list for ongoing engagement',
                expectedOutcome: 'Long-term nurturing'
            });
        }
        
        return actions;
    }

    calculateConversionProbability(score, breakdown) {
        let probability = score / 100 * 0.7; // Base probability from score
        
        // Adjust based on specific factors
        if (breakdown.budget.score > 0.8) probability += 0.1;
        if (breakdown.urgency.score > 0.8) probability += 0.1;
        if (breakdown.communication.score > 0.7) probability += 0.05;
        if (breakdown.referral.score === 1.0) probability += 0.15;
        
        return Math.min(0.95, Math.max(0.05, probability));
    }

    predictConversionTimeline(score, customerData) {
        const urgencyMapping = {
            'immediate': '1-2 weeks',
            'month': '2-4 weeks',
            'quarter': '1-3 months',
            'flexible': '3-6 months'
        };
        
        const baseTimeline = urgencyMapping[customerData.timeline] || '2-4 months';
        
        if (score >= 80) return baseTimeline;
        if (score >= 60) return this.extendTimeline(baseTimeline, 1.2);
        if (score >= 40) return this.extendTimeline(baseTimeline, 1.5);
        return this.extendTimeline(baseTimeline, 2.0);
    }

    extendTimeline(timeline, multiplier) {
        // Simple timeline extension logic
        if (timeline.includes('weeks')) {
            const weeks = parseInt(timeline.match(/(\d+)/)[1]) * multiplier;
            return `${Math.round(weeks)}-${Math.round(weeks * 1.5)} weeks`;
        }
        if (timeline.includes('months')) {
            const months = parseInt(timeline.match(/(\d+)/)[1]) * multiplier;
            return `${Math.round(months)}-${Math.round(months * 1.5)} months`;
        }
        return timeline;
    }
}

/**
 * Predictive customer needs analyzer
 */
class PredictiveNeedsAnalyzer {
    constructor() {
        this.needsPatterns = {
            residential: {
                triggers: ['family', 'children', 'growing', 'space', 'home', 'house'],
                likely_needs: ['space optimization', 'child-safe materials', 'storage solutions', 'family-friendly layouts'],
                budget_indicators: ['renovation', 'upgrade', 'modernize', 'refresh']
            },
            commercial: {
                triggers: ['office', 'business', 'employees', 'clients', 'professional', 'workspace'],
                likely_needs: ['productivity enhancement', 'brand representation', 'employee wellness', 'client impression'],
                budget_indicators: ['expansion', 'relocation', 'rebrand', 'upgrade']
            },
            hospitality: {
                triggers: ['hotel', 'restaurant', 'guests', 'customers', 'experience', 'ambiance'],
                likely_needs: ['customer experience', 'operational efficiency', 'brand differentiation', 'atmosphere creation'],
                budget_indicators: ['renovation', 'new location', 'rebranding', 'expansion']
            }
        };
        
        this.serviceRecommendations = new Map();
        this.initializeServiceRecommendations();
    }

    initializeServiceRecommendations() {
        this.serviceRecommendations.set('space optimization', {
            services: ['3D space planning', 'Custom storage solutions', 'Multi-functional furniture'],
            priority: 'high',
            typical_budget: '$15k-40k'
        });
        
        this.serviceRecommendations.set('child-safe materials', {
            services: ['Non-toxic finishes', 'Rounded furniture', 'Safety glass', 'Soft flooring'],
            priority: 'high',
            typical_budget: '$10k-25k'
        });
        
        this.serviceRecommendations.set('productivity enhancement', {
            services: ['Ergonomic workspace design', 'Lighting optimization', 'Noise control', 'Technology integration'],
            priority: 'high',
            typical_budget: '$25k-60k'
        });
    }

    async analyzeCustomerNeeds(customerData, messageHistory = []) {
        const analysis = {
            predicted_project_type: 'residential',
            confidence: 0.5,
            likely_needs: [],
            recommended_services: [],
            budget_estimation: null,
            timeline_factors: [],
            risk_factors: [],
            opportunities: []
        };

        // Analyze message content for patterns
        const combinedText = messageHistory
            .map(msg => msg.message || '')
            .join(' ')
            .toLowerCase();

        // Determine project type
        let maxScore = 0;
        let bestMatch = 'residential';
        
        Object.entries(this.needsPatterns).forEach(([type, patterns]) => {
            let score = 0;
            patterns.triggers.forEach(trigger => {
                if (combinedText.includes(trigger)) {
                    score += 1;
                }
            });
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = type;
                analysis.confidence = Math.min(0.9, 0.5 + (score * 0.1));
            }
        });

        analysis.predicted_project_type = bestMatch;
        const projectPatterns = this.needsPatterns[bestMatch];
        
        // Identify likely needs
        projectPatterns.likely_needs.forEach(need => {
            if (this.isNeedIndicatedInText(need, combinedText)) {
                analysis.likely_needs.push(need);
                const recommendation = this.serviceRecommendations.get(need);
                if (recommendation) {
                    analysis.recommended_services.push({
                        need,
                        ...recommendation
                    });
                }
            }
        });

        // Estimate budget based on indicators
        analysis.budget_estimation = this.estimateBudget(combinedText, customerData, bestMatch);
        
        // Identify timeline factors
        analysis.timeline_factors = this.identifyTimelineFactors(combinedText);
        
        // Identify risk factors
        analysis.risk_factors = this.identifyRiskFactors(combinedText, customerData);
        
        // Identify opportunities
        analysis.opportunities = this.identifyOpportunities(analysis);

        return analysis;
    }

    isNeedIndicatedInText(need, text) {
        const needKeywords = {
            'space optimization': ['small', 'cramped', 'storage', 'organize', 'maximize', 'efficient'],
            'child-safe materials': ['child', 'baby', 'kids', 'safe', 'non-toxic', 'family'],
            'productivity enhancement': ['productivity', 'efficiency', 'work', 'focus', 'performance'],
            'customer experience': ['experience', 'impression', 'atmosphere', 'ambiance', 'guests'],
            'brand representation': ['brand', 'image', 'professional', 'identity', 'corporate']
        };

        const keywords = needKeywords[need] || [];
        return keywords.some(keyword => text.includes(keyword));
    }

    estimateBudget(text, customerData, projectType) {
        const budgetRanges = {
            residential: { low: 15000, medium: 35000, high: 75000 },
            commercial: { low: 30000, medium: 75000, high: 150000 },
            hospitality: { low: 50000, medium: 125000, high: 300000 }
        };

        const ranges = budgetRanges[projectType];
        let estimatedRange = 'medium';

        // Check for budget indicators in text
        if (text.includes('budget') || text.includes('affordable') || text.includes('cost-effective')) {
            estimatedRange = 'low';
        } else if (text.includes('luxury') || text.includes('high-end') || text.includes('premium')) {
            estimatedRange = 'high';
        }

        // Override with actual budget if provided
        if (customerData.budget) {
            const budgetNum = this.extractBudgetNumber(customerData.budget);
            if (budgetNum >= ranges.high) estimatedRange = 'high';
            else if (budgetNum >= ranges.medium) estimatedRange = 'medium';
            else estimatedRange = 'low';
        }

        return {
            range: estimatedRange,
            estimated_min: ranges[estimatedRange],
            estimated_max: ranges[estimatedRange] * 1.5,
            confidence: customerData.budget ? 0.9 : 0.6
        };
    }

    extractBudgetNumber(budgetString) {
        const match = budgetString.match(/\$?(\d+)k?/i);
        if (match) {
            const num = parseInt(match[1]);
            return budgetString.includes('k') || budgetString.includes('K') ? num * 1000 : num;
        }
        return 0;
    }

    identifyTimelineFactors(text) {
        const factors = [];
        
        if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
            factors.push({ factor: 'urgency', impact: 'accelerate', description: 'Customer expressing urgency' });
        }
        
        if (text.includes('flexible') || text.includes('no rush')) {
            factors.push({ factor: 'flexibility', impact: 'extend', description: 'Customer has flexible timeline' });
        }
        
        if (text.includes('deadline') || text.includes('event') || text.includes('opening')) {
            factors.push({ factor: 'hard_deadline', impact: 'accelerate', description: 'Fixed deadline mentioned' });
        }

        return factors;
    }

    identifyRiskFactors(text, customerData) {
        const risks = [];
        
        if (text.includes('cheapest') || text.includes('lowest price')) {
            risks.push({
                risk: 'price_focused',
                severity: 'medium',
                description: 'Customer primarily focused on price',
                mitigation: 'Emphasize value and ROI'
            });
        }
        
        if (text.includes('multiple quotes') || text.includes('comparing')) {
            risks.push({
                risk: 'comparison_shopping',
                severity: 'low',
                description: 'Customer comparing multiple providers',
                mitigation: 'Highlight unique value propositions'
            });
        }
        
        if (!customerData.contactInfo || !customerData.budget) {
            risks.push({
                risk: 'incomplete_information',
                severity: 'medium',
                description: 'Missing key customer information',
                mitigation: 'Request additional information before proceeding'
            });
        }

        return risks;
    }

    identifyOpportunities(analysis) {
        const opportunities = [];
        
        if (analysis.budget_estimation.range === 'high') {
            opportunities.push({
                opportunity: 'premium_upsell',
                potential: 'high',
                description: 'Customer has budget for premium services',
                action: 'Present luxury options and add-on services'
            });
        }
        
        if (analysis.likely_needs.length > 2) {
            opportunities.push({
                opportunity: 'comprehensive_package',
                potential: 'medium',
                description: 'Multiple needs identified',
                action: 'Propose integrated solution package'
            });
        }
        
        if (analysis.predicted_project_type === 'commercial') {
            opportunities.push({
                opportunity: 'ongoing_relationship',
                potential: 'high',
                description: 'Commercial clients often have recurring needs',
                action: 'Discuss maintenance and future expansion plans'
            });
        }

        return opportunities;
    }
}

// Enhanced CRM main export with AI integration
export default {
    async fetch(request) {
        const url = new URL(request.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Initialize AI components
        const sentimentAnalyzer = new CustomerSentimentAnalyzer();
        const leadScorer = new SmartLeadScorer();
        const needsAnalyzer = new PredictiveNeedsAnalyzer();

        const headers = { ...corsHeaders, "Content-Type": "application/json" };

        try {
            if (url.pathname.startsWith('/chat')) {
                return await handleAIEnhancedChatRequest(request, url, {
                    sentimentAnalyzer,
                    leadScorer,
                    needsAnalyzer,
                    headers
                });
            }

            if (url.pathname === '/health') {
                return new Response(JSON.stringify({
                    status: 'healthy',
                    service: CRM_NAME,
                    ai_features: ['sentiment_analysis', 'lead_scoring', 'needs_prediction'],
                    timestamp: new Date().toISOString()
                }), { headers });
            }

            return new Response(JSON.stringify({
                error: 'Not Found',
                available_endpoints: ['/chat', '/chat/quotation', '/chat/delivery', '/chat/support', '/chat/ai-insights']
            }), { status: 404, headers });

        } catch (error) {
            console.error('CRM Error:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: 'AI-enhanced CRM temporarily unavailable'
            }), { status: 500, headers });
        }
    }
};

/**
 * Handle AI-enhanced chat requests
 */
async function handleAIEnhancedChatRequest(request, url, aiComponents) {
    const { sentimentAnalyzer, leadScorer, needsAnalyzer, headers } = aiComponents;
    const isAdminRequest = request.headers.get('authorization')?.includes(ADMIN_EMAIL);

    // New AI-specific endpoints
    if (url.pathname === '/chat/ai-insights') {
        return await handleAIInsightsRequest(request, aiComponents, headers);
    }

    if (url.pathname === '/chat/sentiment-analysis') {
        return await handleSentimentAnalysisRequest(request, sentimentAnalyzer, headers);
    }

    if (url.pathname === '/chat/lead-scoring') {
        return await handleLeadScoringRequest(request, leadScorer, headers);
    }

    // Enhanced existing endpoints
    if (url.pathname === '/chat/quotation') {
        return await handleAIEnhancedQuotationRequest(request, aiComponents, headers);
    }

    if (url.pathname === '/chat/delivery') {
        return await handleAIEnhancedDeliveryRequest(request, sentimentAnalyzer, headers);
    }

    if (url.pathname === '/chat/support') {
        return await handleAIEnhancedSupportRequest(request, sentimentAnalyzer, headers);
    }

    // Main chat interface with AI enhancement
    if (url.pathname === '/chat') {
        return await handleAIEnhancedMainChat(request, isAdminRequest, aiComponents, headers);
    }

    return new Response(JSON.stringify({
        error: 'Chat endpoint not found'
    }), { status: 404, headers });
}

/**
 * AI Insights endpoint - provides comprehensive customer intelligence
 */
async function handleAIInsightsRequest(request, aiComponents, headers) {
    if (request.method === 'POST') {
        const data = await request.json().catch(() => ({}));
        const { customerData, interactionHistory } = data;

        if (!customerData) {
            return new Response(JSON.stringify({
                error: 'Customer data required for AI insights'
            }), { status: 400, headers });
        }

        const { sentimentAnalyzer, leadScorer, needsAnalyzer } = aiComponents;

        // Generate comprehensive AI insights
        const insights = {
            sentiment_analysis: null,
            lead_score: null,
            predicted_needs: null,
            recommendations: [],
            next_actions: [],
            generated_at: new Date().toISOString()
        };

        // Analyze sentiment if interaction history available
        if (interactionHistory && interactionHistory.length > 0) {
            const lastMessage = interactionHistory[interactionHistory.length - 1];
            insights.sentiment_analysis = await sentimentAnalyzer.analyzeSentiment(lastMessage.message || '');
        }

        // Calculate lead score
        insights.lead_score = await leadScorer.calculateLeadScore(customerData, interactionHistory);

        // Predict customer needs
        insights.predicted_needs = await needsAnalyzer.analyzeCustomerNeeds(customerData, interactionHistory);

        // Generate unified recommendations
        insights.recommendations = generateUnifiedRecommendations(insights);

        return new Response(JSON.stringify({
            reply: "AI Insights Generated Successfully 🤖",
            insights,
            summary: generateInsightsSummary(insights)
        }), { headers });
    }

    return new Response(JSON.stringify({
        reply: "AI Insights Service 🤖",
        description: "Get comprehensive AI-powered customer intelligence",
        required_data: {
            customerData: {
                budget: "Customer budget range",
                timeline: "Project timeline",
                projectType: "Type of project",
                source: "How they found us"
            },
            interactionHistory: "Array of previous interactions (optional)"
        },
        features: [
            "Sentiment analysis of customer communications",
            "Lead scoring with conversion probability",
            "Predictive needs analysis",
            "Intelligent action recommendations"
        ]
    }), { headers });
}

/**
 * Enhanced quotation request with AI analysis
 */
async function handleAIEnhancedQuotationRequest(request, aiComponents, headers) {
    const { sentimentAnalyzer, leadScorer, needsAnalyzer } = aiComponents;

    if (request.method === 'POST') {
        const data = await request.json().catch(() => ({}));
        const { projectType, budget, timeline, contactInfo, message } = data;

        // Perform AI analysis
        let aiAnalysis = null;
        if (message) {
            const sentimentResult = await sentimentAnalyzer.analyzeSentiment(message);
            const needsResult = await needsAnalyzer.analyzeCustomerNeeds(data, [{ message }]);
            const leadResult = await leadScorer.calculateLeadScore(data, [{ message }]);

            aiAnalysis = {
                sentiment: sentimentResult,
                predicted_needs: needsResult,
                lead_score: leadResult
            };
        }

        // Generate intelligent response based on AI analysis
        let responseMessage = "Thank you for your quotation request! 📋";
        let priority = "standard";
        let estimatedResponse = "24-48 hours";

        if (aiAnalysis) {
            if (aiAnalysis.sentiment.sentiment === 'negative' || aiAnalysis.sentiment.urgency === 'high') {
                responseMessage = "I understand this is important to you. Let me prioritize your quotation request! 🚀";
                priority = "high";
                estimatedResponse = "4-8 hours";
            } else if (aiAnalysis.lead_score.score >= 80) {
                responseMessage = "Excellent! Your project sounds exciting. Our senior design team will prepare a detailed proposal for you! ✨";
                priority = "high";
                estimatedResponse = "12-24 hours";
            }
        }

        const response = {
            reply: responseMessage,
            message: "We've received your information and will prepare a customized quotation for you.",
            quotationId: generateQuotationId(),
            estimatedResponse,
            priority,
            timestamp: new Date().toISOString()
        };

        // Add AI insights if available
        if (aiAnalysis) {
            response.ai_insights = {
                lead_score: aiAnalysis.lead_score.score,
                conversion_probability: aiAnalysis.lead_score.conversionProbability,
                predicted_services: aiAnalysis.predicted_needs.recommended_services.slice(0, 3),
                sentiment_detected: aiAnalysis.sentiment.sentiment
            };

            response.personalized_next_steps = aiAnalysis.lead_score.nextActions.slice(0, 3).map(action => action.description);
        }

        response.next_steps = [
            "Our design team will review your requirements",
            `You'll receive a preliminary quote within ${estimatedResponse}`,
            "A design consultant will contact you to discuss details"
        ];

        return new Response(JSON.stringify(response), { headers });
    }

    return new Response(JSON.stringify({
        reply: "AI-Enhanced Quotation Service 📋",
        message: "Get intelligent quotations with AI-powered analysis",
        enhanced_features: [
            "Sentiment analysis of your requirements",
            "Predictive needs assessment",
            "Intelligent priority routing",
            "Personalized response timing"
        ],
        required_info: [
            "Project type (residential/commercial/hospitality)",
            "Approximate budget range",
            "Timeline requirements",
            "Contact information",
            "Project description (optional - enables AI analysis)"
        ]
    }), { headers });
}

/**
 * Generate unified recommendations from all AI analyses
 */
function generateUnifiedRecommendations(insights) {
    const recommendations = [];

    // Lead score based recommendations
    if (insights.lead_score) {
        insights.lead_score.nextActions.forEach(action => {
            recommendations.push({
                source: 'lead_scoring',
                type: action.action,
                priority: action.priority,
                description: action.description,
                confidence: insights.lead_score.score / 100
            });
        });
    }

    // Sentiment based recommendations
    if (insights.sentiment_analysis) {
        const sentimentRec = insights.sentiment_analysis;
        if (sentimentRec.recommended_action === 'escalate') {
            recommendations.push({
                source: 'sentiment_analysis',
                type: 'escalate',
                priority: 'high',
                description: 'Customer showing frustration - escalate immediately',
                confidence: sentimentRec.confidence
            });
        }
    }

    // Needs analysis recommendations
    if (insights.predicted_needs) {
        insights.predicted_needs.opportunities.forEach(opp => {
            recommendations.push({
                source: 'needs_analysis',
                type: opp.opportunity,
                priority: opp.potential,
                description: opp.action,
                confidence: 0.7
            });
        });
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
}

/**
 * Generate insights summary
 */
function generateInsightsSummary(insights) {
    const summary = {
        overall_assessment: 'neutral',
        key_findings: [],
        immediate_actions: [],
        conversion_likelihood: 'medium'
    };

    // Assess overall situation
    if (insights.lead_score && insights.lead_score.score >= 80) {
        summary.overall_assessment = 'very_positive';
        summary.conversion_likelihood = 'high';
    } else if (insights.lead_score && insights.lead_score.score >= 60) {
        summary.overall_assessment = 'positive';
        summary.conversion_likelihood = 'medium-high';
    } else if (insights.sentiment_analysis && insights.sentiment_analysis.sentiment === 'negative') {
        summary.overall_assessment = 'concerning';
        summary.conversion_likelihood = 'low';
    }

    // Key findings
    if (insights.lead_score) {
        summary.key_findings.push(`Lead Score: ${insights.lead_score.score}/100 (${insights.lead_score.classification})`);
    }
    
    if (insights.sentiment_analysis) {
        summary.key_findings.push(`Customer Sentiment: ${insights.sentiment_analysis.sentiment} (${Math.round(insights.sentiment_analysis.confidence * 100)}% confidence)`);
    }
    
    if (insights.predicted_needs) {
        summary.key_findings.push(`Project Type: ${insights.predicted_needs.predicted_project_type} (${Math.round(insights.predicted_needs.confidence * 100)}% confidence)`);
    }

    // Immediate actions
    const highPriorityRecs = insights.recommendations.filter(rec => rec.priority === 'high').slice(0, 3);
    summary.immediate_actions = highPriorityRecs.map(rec => rec.description);

    return summary;
}

/**
 * Enhanced main chat with AI capabilities
 */
async function handleAIEnhancedMainChat(request, isAdminRequest, aiComponents, headers) {
    const welcomeMessage = isAdminRequest 
        ? `Welcome to ${CRM_NAME} Admin Panel 👨‍💼`
        : `Hello 👋, welcome to ${CRM_NAME}! How can our AI-enhanced system assist you today?`;

    const options = isAdminRequest 
        ? [
            "View AI Analytics Dashboard",
            "Customer Intelligence Reports", 
            "Lead Scoring Analytics",
            "Sentiment Analysis Trends"
        ]
        : [
            "Request Quotation (AI-Enhanced)",
            "Track Delivery",
            "Connect Support",
            "Get AI Insights"
        ];

    const endpoints = isAdminRequest
        ? {
            analytics: "/chat/admin/ai-analytics",
            intelligence: "/chat/admin/intelligence",
            leadScoring: "/chat/admin/lead-scoring",
            sentiment: "/chat/admin/sentiment-trends"
        }
        : {
            quotation: "/chat/quotation",
            delivery: "/chat/delivery",
            support: "/chat/support",
            aiInsights: "/chat/ai-insights"
        };

    return new Response(JSON.stringify({
        reply: welcomeMessage,
        options,
        endpoints,
        ai_features: {
            enabled: true,
            capabilities: [
                "Customer sentiment analysis",
                "Intelligent lead scoring", 
                "Predictive needs assessment",
                "Automated response optimization"
            ]
        },
        service: CRM_NAME,
        timestamp: new Date().toISOString()
    }), { headers });
}

/**
 * Generate quotation ID
 */
function generateQuotationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QUOTE-${timestamp}-${random}`;
}

// Additional AI-enhanced endpoints would continue here...