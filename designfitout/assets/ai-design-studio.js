/**
 * AI Design Studio - Interior/Outdoor Design with AI Enhancement
 * Intelligent mood board generation, color palette creation, and style matching
 * 
 * Features:
 * - AI-powered mood board generation
 * - Intelligent color palette suggestions
 * - Style matching algorithms
 * - Material compatibility checker
 * - Lighting optimization
 * - Climate-appropriate recommendations
 */

class AIDesignStudio {
    constructor() {
        this.styleDatabase = new StyleDatabase();
        this.colorHarmonyEngine = new ColorHarmonyEngine();
        this.materialCompatibilityChecker = new MaterialCompatibilityChecker();
        this.moodBoardGenerator = new MoodBoardGenerator();
        this.trendAnalyzer = new TrendAnalyzer();
        this.climateAnalyzer = new ClimateAnalyzer();
        
        this.initializeDesignStudio();
        console.log('AI Design Studio initialized');
    }

    initializeDesignStudio() {
        this.designStyles = new Map();
        this.colorTheories = new Map();
        this.materialDatabase = new Map();
        this.lightingDatabase = new Map();

        this.loadDesignStyles();
        this.loadColorTheories();
        this.loadMaterialDatabase();
        this.loadLightingDatabase();
    }

    loadDesignStyles() {
        this.designStyles.set('modern', {
            characteristics: ['clean lines', 'minimal ornamentation', 'open spaces', 'neutral colors'],
            typical_colors: ['white', 'gray', 'black', 'beige'],
            materials: ['glass', 'steel', 'concrete', 'leather'],
            furniture_style: 'geometric, low-profile',
            lighting_preference: 'recessed, track lighting',
            popularity_score: 9.2,
            suitable_spaces: ['living room', 'kitchen', 'office', 'bedroom']
        });

        this.designStyles.set('scandinavian', {
            characteristics: ['light colors', 'natural materials', 'hygge comfort', 'functional design'],
            typical_colors: ['white', 'light gray', 'soft blues', 'natural wood tones'],
            materials: ['light wood', 'linen', 'wool', 'natural fibers'],
            furniture_style: 'simple, functional, cozy',
            lighting_preference: 'pendant lights, natural light maximization',
            popularity_score: 8.8,
            suitable_spaces: ['living room', 'bedroom', 'kitchen', 'nursery']
        });

        this.designStyles.set('industrial', {
            characteristics: ['exposed brick', 'metal fixtures', 'raw materials', 'open layouts'],
            typical_colors: ['gray', 'brown', 'black', 'rust orange'],
            materials: ['exposed brick', 'steel', 'reclaimed wood', 'concrete'],
            furniture_style: 'metal and wood combinations, vintage',
            lighting_preference: 'exposed bulbs, metal fixtures',
            popularity_score: 7.6,
            suitable_spaces: ['loft', 'kitchen', 'home office', 'dining room']
        });

        this.designStyles.set('bohemian', {
            characteristics: ['eclectic mix', 'rich textures', 'vibrant colors', 'layered patterns'],
            typical_colors: ['jewel tones', 'earth tones', 'gold accents', 'deep purples'],
            materials: ['textiles', 'natural fibers', 'rattan', 'brass'],
            furniture_style: 'mixed vintage, low seating, floor cushions',
            lighting_preference: 'warm ambient, string lights, lanterns',
            popularity_score: 7.1,
            suitable_spaces: ['bedroom', 'living room', 'reading nook', 'creative spaces']
        });

        this.designStyles.set('mediterranean', {
            characteristics: ['warm colors', 'natural textures', 'arched doorways', 'outdoor integration'],
            typical_colors: ['terracotta', 'deep blues', 'warm whites', 'olive greens'],
            materials: ['natural stone', 'wrought iron', 'ceramic tiles', 'wood'],
            furniture_style: 'rustic, comfortable, weathered finishes',
            lighting_preference: 'warm lighting, lanterns, chandeliers',
            popularity_score: 6.9,
            suitable_spaces: ['outdoor areas', 'kitchen', 'dining room', 'entryway']
        });
    }

    loadColorTheories() {
        this.colorTheories.set('complementary', {
            description: 'Colors opposite each other on the color wheel',
            harmony_level: 9,
            energy_level: 8,
            best_use: 'Accent colors, focal points',
            examples: [['blue', 'orange'], ['red', 'green'], ['yellow', 'purple']]
        });

        this.colorTheories.set('analogous', {
            description: 'Colors next to each other on the color wheel',
            harmony_level: 8,
            energy_level: 5,
            best_use: 'Peaceful, cohesive color schemes',
            examples: [['blue', 'blue-green', 'green'], ['red', 'red-orange', 'orange']]
        });

        this.colorTheories.set('triadic', {
            description: 'Three colors evenly spaced on the color wheel',
            harmony_level: 7,
            energy_level: 9,
            best_use: 'Vibrant, balanced color schemes',
            examples: [['red', 'yellow', 'blue'], ['orange', 'green', 'purple']]
        });

        this.colorTheories.set('monochromatic', {
            description: 'Different shades and tints of a single color',
            harmony_level: 10,
            energy_level: 3,
            best_use: 'Sophisticated, calming environments',
            examples: [['light blue', 'medium blue', 'dark blue'], ['cream', 'beige', 'brown']]
        });
    }

    loadMaterialDatabase() {
        this.materialDatabase.set('flooring', new Map([
            ['hardwood', {
                style_compatibility: ['modern', 'scandinavian', 'traditional'],
                durability: 8,
                maintenance: 6,
                cost_range: 'medium-high',
                climate_suitability: ['temperate', 'dry'],
                aesthetic_properties: ['warm', 'natural', 'timeless'],
                sustainability_score: 7
            }],
            ['natural_stone', {
                style_compatibility: ['mediterranean', 'modern', 'rustic'],
                durability: 10,
                maintenance: 7,
                cost_range: 'high',
                climate_suitability: ['warm', 'dry', 'humid'],
                aesthetic_properties: ['luxurious', 'cool', 'textural'],
                sustainability_score: 8
            }],
            ['ceramic_tile', {
                style_compatibility: ['modern', 'mediterranean', 'industrial'],
                durability: 9,
                maintenance: 9,
                cost_range: 'medium',
                climate_suitability: ['all'],
                aesthetic_properties: ['versatile', 'clean', 'practical'],
                sustainability_score: 6
            }]
        ]));

        this.materialDatabase.set('textiles', new Map([
            ['linen', {
                style_compatibility: ['scandinavian', 'coastal', 'modern'],
                texture: 'natural, relaxed',
                durability: 6,
                maintenance: 5,
                color_absorption: 'excellent',
                climate_suitability: ['warm', 'humid'],
                aesthetic_properties: ['casual', 'breathable', 'natural']
            }],
            ['velvet', {
                style_compatibility: ['bohemian', 'traditional', 'art_deco'],
                texture: 'luxurious, soft',
                durability: 7,
                maintenance: 4,
                color_absorption: 'excellent',
                climate_suitability: ['temperate', 'cool'],
                aesthetic_properties: ['luxurious', 'rich', 'dramatic']
            }],
            ['leather', {
                style_compatibility: ['modern', 'industrial', 'traditional'],
                texture: 'smooth to textured',
                durability: 9,
                maintenance: 7,
                color_options: 'limited but rich',
                climate_suitability: ['dry', 'temperate'],
                aesthetic_properties: ['sophisticated', 'durable', 'aging beautifully']
            }]
        ]));

        this.materialDatabase.set('metals', new Map([
            ['brass', {
                style_compatibility: ['bohemian', 'art_deco', 'traditional'],
                finish_options: ['polished', 'aged', 'brushed'],
                durability: 8,
                maintenance: 6,
                patina_development: true,
                climate_suitability: ['dry', 'temperate'],
                aesthetic_properties: ['warm', 'luxurious', 'vintage']
            }],
            ['stainless_steel', {
                style_compatibility: ['modern', 'industrial', 'contemporary'],
                finish_options: ['brushed', 'polished', 'matte'],
                durability: 10,
                maintenance: 8,
                patina_development: false,
                climate_suitability: ['all'],
                aesthetic_properties: ['cool', 'sleek', 'professional']
            }]
        ]));
    }

    loadLightingDatabase() {
        this.lightingDatabase.set('ambient', new Map([
            ['recessed_lighting', {
                style_compatibility: ['modern', 'contemporary', 'minimalist'],
                light_distribution: 'even, downward',
                dimming_capability: true,
                energy_efficiency: 9,
                installation_complexity: 'medium',
                cost_range: 'medium',
                best_rooms: ['living room', 'kitchen', 'bedroom'],
                mood_impact: 'clean, unobtrusive'
            }],
            ['pendant_lights', {
                style_compatibility: ['scandinavian', 'industrial', 'bohemian'],
                light_distribution: 'focused, decorative',
                dimming_capability: true,
                energy_efficiency: 8,
                installation_complexity: 'low',
                cost_range: 'low-medium',
                best_rooms: ['kitchen island', 'dining room', 'entryway'],
                mood_impact: 'warm, intimate'
            }]
        ]));

        this.lightingDatabase.set('task', new Map([
            ['under_cabinet', {
                style_compatibility: ['modern', 'contemporary'],
                light_distribution: 'directional, work-focused',
                dimming_capability: true,
                energy_efficiency: 10,
                installation_complexity: 'low',
                cost_range: 'low',
                best_rooms: ['kitchen', 'office', 'workshop'],
                functionality_score: 10
            }],
            ['desk_lamps', {
                style_compatibility: ['all'],
                light_distribution: 'adjustable, focused',
                dimming_capability: true,
                energy_efficiency: 8,
                installation_complexity: 'none',
                cost_range: 'low-high',
                best_rooms: ['office', 'bedroom', 'living room'],
                functionality_score: 9
            }]
        ]));
    }

    /**
     * Generate AI-powered mood board based on requirements
     */
    async generateMoodBoard(requirements) {
        console.log('Generating AI-powered mood board...');
        
        const {
            style_preferences = [],
            color_preferences = [],
            space_type = 'living room',
            budget_range = 'medium',
            client_personality = 'balanced',
            climate = 'temperate',
            natural_light = 'medium',
            existing_elements = []
        } = requirements;

        // AI analysis of requirements
        const analysis = await this.analyzeDesignRequirements(requirements);
        
        // Generate mood board components
        const moodBoard = {
            theme: await this.selectOptimalTheme(analysis),
            color_palette: await this.generateColorPalette(analysis),
            materials: await this.suggestMaterials(analysis),
            furniture: await this.suggestFurniture(analysis),
            lighting: await this.suggestLighting(analysis),
            accessories: await this.suggestAccessories(analysis),
            plants: await this.suggestPlants(analysis),
            artwork: await this.suggestArtwork(analysis)
        };

        return {
            mood_board: moodBoard,
            design_rationale: this.generateDesignRationale(moodBoard, analysis),
            implementation_guide: await this.generateImplementationGuide(moodBoard, requirements),
            cost_estimate: await this.estimateMoodBoardCost(moodBoard, requirements),
            alternative_options: await this.generateAlternatives(requirements, moodBoard),
            seasonal_adaptations: await this.generateSeasonalAdaptations(moodBoard),
            maintenance_guide: this.generateMaintenanceGuide(moodBoard)
        };
    }

    async analyzeDesignRequirements(requirements) {
        const analysis = {
            dominant_style: null,
            personality_profile: this.analyzePersonality(requirements.client_personality),
            color_psychology: this.analyzeColorPsychology(requirements.color_preferences),
            space_constraints: this.analyzeSpaceConstraints(requirements),
            lifestyle_factors: this.analyzeLifestyleFactors(requirements),
            environmental_factors: this.analyzeEnvironmentalFactors(requirements),
            budget_implications: this.analyzeBudgetImplications(requirements.budget_range)
        };

        // Determine dominant style through AI matching
        analysis.dominant_style = await this.matchOptimalStyle(requirements, analysis);
        
        return analysis;
    }

    analyzePersonality(personalityType) {
        const personalities = {
            'adventurous': {
                preferred_styles: ['bohemian', 'eclectic', 'global'],
                color_tendencies: ['bold', 'saturated', 'contrasting'],
                pattern_preference: 'mixed, layered',
                risk_tolerance: 'high',
                change_frequency: 'often'
            },
            'conservative': {
                preferred_styles: ['traditional', 'classic', 'timeless'],
                color_tendencies: ['neutral', 'muted', 'harmonious'],
                pattern_preference: 'subtle, coordinated',
                risk_tolerance: 'low',
                change_frequency: 'seldom'
            },
            'balanced': {
                preferred_styles: ['modern', 'scandinavian', 'contemporary'],
                color_tendencies: ['balanced', 'thoughtful', 'versatile'],
                pattern_preference: 'selective, intentional',
                risk_tolerance: 'medium',
                change_frequency: 'occasionally'
            },
            'minimalist': {
                preferred_styles: ['modern', 'scandinavian', 'japanese'],
                color_tendencies: ['neutral', 'monochromatic', 'pure'],
                pattern_preference: 'minimal, geometric',
                risk_tolerance: 'low',
                change_frequency: 'rarely'
            }
        };

        return personalities[personalityType] || personalities['balanced'];
    }

    analyzeColorPsychology(colorPreferences) {
        const colorPsychology = {
            'blue': { mood: 'calm', energy: 'low', associations: ['trust', 'stability', 'peace'] },
            'green': { mood: 'balanced', energy: 'medium', associations: ['nature', 'growth', 'harmony'] },
            'yellow': { mood: 'cheerful', energy: 'high', associations: ['happiness', 'creativity', 'warmth'] },
            'red': { mood: 'energetic', energy: 'very high', associations: ['passion', 'strength', 'excitement'] },
            'purple': { mood: 'luxurious', energy: 'medium', associations: ['creativity', 'mystery', 'sophistication'] },
            'orange': { mood: 'enthusiastic', energy: 'high', associations: ['warmth', 'energy', 'friendliness'] },
            'gray': { mood: 'sophisticated', energy: 'low', associations: ['balance', 'neutral', 'timeless'] },
            'white': { mood: 'pure', energy: 'low', associations: ['cleanliness', 'simplicity', 'space'] }
        };

        return colorPreferences.map(color => ({
            color,
            psychology: colorPsychology[color.toLowerCase()] || colorPsychology['gray']
        }));
    }

    async matchOptimalStyle(requirements, analysis) {
        let styleScores = new Map();

        // Score each style based on various factors
        this.designStyles.forEach((styleData, styleName) => {
            let score = 0;

            // Personality compatibility
            if (analysis.personality_profile.preferred_styles.includes(styleName)) {
                score += 30;
            }

            // Color preference alignment
            const styleColors = styleData.typical_colors;
            requirements.color_preferences?.forEach(prefColor => {
                if (styleColors.some(styleColor => this.colorsAreCompatible(prefColor, styleColor))) {
                    score += 10;
                }
            });

            // Space type suitability
            if (styleData.suitable_spaces.includes(requirements.space_type)) {
                score += 20;
            }

            // Budget consideration
            if (this.styleFitsBudget(styleName, requirements.budget_range)) {
                score += 15;
            }

            // Current popularity (trend factor)
            score += styleData.popularity_score;

            styleScores.set(styleName, score);
        });

        // Return the highest scoring style
        const sortedStyles = Array.from(styleScores.entries()).sort((a, b) => b[1] - a[1]);
        return {
            primary: sortedStyles[0][0],
            secondary: sortedStyles[1][0],
            confidence: sortedStyles[0][1] / 100
        };
    }

    async generateColorPalette(analysis) {
        const primaryStyle = this.designStyles.get(analysis.dominant_style.primary);
        const baseColors = primaryStyle?.typical_colors || ['white', 'gray', 'beige'];

        // Select color harmony approach based on personality
        let harmonyType = 'analogous'; // Default
        if (analysis.personality_profile.risk_tolerance === 'high') {
            harmonyType = 'complementary';
        } else if (analysis.personality_profile.risk_tolerance === 'low') {
            harmonyType = 'monochromatic';
        }

        const harmonyRules = this.colorTheories.get(harmonyType);
        
        return {
            primary_colors: this.selectPrimaryColors(baseColors, analysis),
            accent_colors: this.generateAccentColors(baseColors, harmonyType),
            neutral_colors: this.selectNeutralColors(baseColors),
            harmony_type: harmonyType,
            harmony_description: harmonyRules.description,
            color_temperature: this.determineColorTemperature(analysis),
            seasonal_variations: this.generateSeasonalColorVariations(baseColors),
            accessibility_score: this.calculateColorAccessibility(baseColors)
        };
    }

    selectPrimaryColors(baseColors, analysis) {
        // AI logic to select 2-3 primary colors
        const selected = baseColors.slice(0, 3);
        
        // Adjust based on personality and space factors
        if (analysis.personality_profile.color_tendencies.includes('bold')) {
            selected.push(this.getBoldColorVariant(selected[0]));
        }

        return selected.map(color => ({
            color,
            hex: this.getColorHex(color),
            usage_percentage: this.calculateColorUsage(color, selected),
            psychological_impact: this.getColorPsychology(color),
            recommended_application: this.getColorApplication(color)
        }));
    }

    generateAccentColors(baseColors, harmonyType) {
        const accentColors = [];
        
        if (harmonyType === 'complementary') {
            baseColors.forEach(baseColor => {
                const complement = this.getComplementaryColor(baseColor);
                if (complement) {
                    accentColors.push({
                        color: complement,
                        relationship: 'complementary',
                        intensity: 'high',
                        recommended_usage: '10-20% of color scheme'
                    });
                }
            });
        } else if (harmonyType === 'analogous') {
            baseColors.forEach(baseColor => {
                const analogous = this.getAnalogousColors(baseColor);
                accentColors.push(...analogous.map(color => ({
                    color,
                    relationship: 'analogous',
                    intensity: 'medium',
                    recommended_usage: '20-30% of color scheme'
                })));
            });
        }

        return accentColors.slice(0, 3); // Limit to 3 accent colors
    }

    async suggestMaterials(analysis) {
        const materialSuggestions = {
            flooring: [],
            textiles: [],
            metals: [],
            natural_elements: []
        };

        const primaryStyle = analysis.dominant_style.primary;
        const styleData = this.designStyles.get(primaryStyle);

        // Suggest flooring materials
        const flooringMaterials = this.materialDatabase.get('flooring');
        flooringMaterials.forEach((properties, material) => {
            if (properties.style_compatibility.includes(primaryStyle)) {
                materialSuggestions.flooring.push({
                    material,
                    compatibility_score: this.calculateMaterialCompatibility(properties, analysis),
                    properties,
                    application_areas: this.suggestMaterialApplication(material, analysis),
                    maintenance_requirements: this.getMaterialMaintenanceInfo(material)
                });
            }
        });

        // Sort by compatibility score
        materialSuggestions.flooring.sort((a, b) => b.compatibility_score - a.compatibility_score);

        // Similar process for other material categories
        materialSuggestions.textiles = await this.suggestTextileMaterials(analysis);
        materialSuggestions.metals = await this.suggestMetalMaterials(analysis);
        materialSuggestions.natural_elements = await this.suggestNaturalElements(analysis);

        return materialSuggestions;
    }

    async suggestFurniture(analysis) {
        const furnitureCategories = {
            seating: await this.suggestSeating(analysis),
            tables: await this.suggestTables(analysis),
            storage: await this.suggestStorage(analysis),
            accent_pieces: await this.suggestAccentPieces(analysis)
        };

        return furnitureCategories;
    }

    async suggestSeating(analysis) {
        const seatingOptions = [];
        const style = analysis.dominant_style.primary;
        const personalityProfile = analysis.personality_profile;

        const seatingDatabase = {
            'modern': [
                { type: 'sectional sofa', characteristics: ['clean lines', 'low profile', 'neutral colors'] },
                { type: 'lounge chair', characteristics: ['geometric shape', 'leather or fabric', 'minimal ornamentation'] }
            ],
            'scandinavian': [
                { type: 'hygge chair', characteristics: ['light wood', 'cozy cushions', 'simple design'] },
                { type: 'bench seating', characteristics: ['natural wood', 'minimalist', 'functional'] }
            ],
            'bohemian': [
                { type: 'floor cushions', characteristics: ['colorful fabrics', 'mixed patterns', 'casual'] },
                { type: 'hanging chair', characteristics: ['rattan', 'macrame', 'statement piece'] }
            ]
        };

        const styleSeating = seatingDatabase[style] || seatingDatabase['modern'];
        
        styleSeating.forEach(seating => {
            seatingOptions.push({
                ...seating,
                suitability_score: this.calculateFurnitureSuitability(seating, analysis),
                comfort_rating: this.assessComfortRating(seating, personalityProfile),
                durability_score: this.assessDurabilityScore(seating),
                cost_estimate: this.estimateFurnitureCost(seating, analysis.budget_implications)
            });
        });

        return seatingOptions.sort((a, b) => b.suitability_score - a.suitability_score);
    }

    async suggestLighting(analysis) {
        const lightingSuggestions = {
            ambient: [],
            task: [],
            accent: [],
            natural_light_optimization: []
        };

        const style = analysis.dominant_style.primary;
        const spaceType = analysis.space_constraints.space_type;

        // Ambient lighting suggestions
        const ambientLights = this.lightingDatabase.get('ambient');
        ambientLights.forEach((properties, lightType) => {
            if (properties.style_compatibility.includes(style) && 
                properties.best_rooms.includes(spaceType)) {
                
                lightingSuggestions.ambient.push({
                    type: lightType,
                    properties,
                    suitability_score: this.calculateLightingSuitability(properties, analysis),
                    energy_efficiency: properties.energy_efficiency,
                    mood_enhancement: this.assessMoodEnhancement(properties, analysis),
                    installation_requirements: this.getInstallationRequirements(lightType)
                });
            }
        });

        // Task lighting suggestions
        const taskLights = this.lightingDatabase.get('task');
        taskLights.forEach((properties, lightType) => {
            if (properties.best_rooms.includes(spaceType)) {
                lightingSuggestions.task.push({
                    type: lightType,
                    properties,
                    functionality_score: properties.functionality_score,
                    suitability_score: this.calculateLightingSuitability(properties, analysis)
                });
            }
        });

        // Natural light optimization
        lightingSuggestions.natural_light_optimization = this.suggestNaturalLightOptimization(analysis);

        return lightingSuggestions;
    }

    async suggestAccessories(analysis) {
        const accessories = {
            decorative_objects: [],
            textiles: [],
            wall_decor: [],
            plants: []
        };

        const style = analysis.dominant_style.primary;
        const personality = analysis.personality_profile;

        // Decorative objects based on style
        const decorativeObjects = this.getStyleSpecificAccessories(style);
        accessories.decorative_objects = decorativeObjects.map(obj => ({
            ...obj,
            personality_fit: this.assessPersonalityFit(obj, personality),
            styling_impact: this.assessStylingImpact(obj, analysis)
        }));

        // Textile accessories
        accessories.textiles = await this.suggestTextileAccessories(analysis);

        // Wall decor
        accessories.wall_decor = await this.suggestWallDecor(analysis);

        // Plants
        accessories.plants = await this.suggestPlants(analysis);

        return accessories;
    }

    // Utility methods for calculations and assessments

    colorsAreCompatible(color1, color2) {
        // Simplified color compatibility check
        const colorGroups = {
            warm: ['red', 'orange', 'yellow', 'pink', 'coral'],
            cool: ['blue', 'green', 'purple', 'turquoise'],
            neutral: ['white', 'gray', 'black', 'beige', 'brown']
        };

        for (let group of Object.values(colorGroups)) {
            if (group.includes(color1.toLowerCase()) && group.includes(color2.toLowerCase())) {
                return true;
            }
        }

        return colorGroups.neutral.includes(color1.toLowerCase()) || 
               colorGroups.neutral.includes(color2.toLowerCase());
    }

    styleFitsBudget(styleName, budgetRange) {
        const styleBudgetRequirements = {
            'modern': 'medium-high',
            'scandinavian': 'medium',
            'industrial': 'medium',
            'bohemian': 'low-medium',
            'mediterranean': 'medium-high'
        };

        const budgetMapping = {
            'low': 1,
            'low-medium': 2,
            'medium': 3,
            'medium-high': 4,
            'high': 5
        };

        const required = budgetMapping[styleBudgetRequirements[styleName]] || 3;
        const available = budgetMapping[budgetRange] || 3;

        return available >= required;
    }

    getColorHex(colorName) {
        const colorHexMap = {
            'white': '#FFFFFF',
            'black': '#000000',
            'gray': '#808080',
            'red': '#FF0000',
            'blue': '#0000FF',
            'green': '#008000',
            'yellow': '#FFFF00',
            'orange': '#FFA500',
            'purple': '#800080',
            'brown': '#A52A2A',
            'beige': '#F5F5DC',
            'navy': '#000080'
        };

        return colorHexMap[colorName.toLowerCase()] || '#808080';
    }

    calculateColorUsage(color, allColors) {
        const index = allColors.indexOf(color);
        const usagePercentages = [60, 30, 10]; // Primary, secondary, accent
        return usagePercentages[index] || 5;
    }

    getColorPsychology(color) {
        const psychology = {
            'white': 'Promotes cleanliness, simplicity, and spaciousness',
            'gray': 'Creates sophistication, balance, and timelessness',
            'blue': 'Encourages calm, trust, and productivity',
            'green': 'Brings nature, growth, and harmony indoors',
            'brown': 'Provides warmth, stability, and natural connection'
        };

        return psychology[color.toLowerCase()] || 'Neutral psychological impact';
    }

    getColorApplication(color) {
        const applications = {
            'white': 'Walls, ceilings, major furniture pieces',
            'gray': 'Accent walls, upholstery, flooring',
            'blue': 'Accent pieces, artwork, textiles',
            'green': 'Plants, accent colors, bathroom tiles',
            'brown': 'Wood furniture, leather goods, natural textures'
        };

        return applications[color.toLowerCase()] || 'Flexible application options';
    }

    getComplementaryColor(baseColor) {
        const complementaryPairs = {
            'blue': 'orange',
            'red': 'green',
            'yellow': 'purple',
            'orange': 'blue',
            'green': 'red',
            'purple': 'yellow'
        };

        return complementaryPairs[baseColor.toLowerCase()];
    }

    getAnalogousColors(baseColor) {
        const analogousMap = {
            'blue': ['blue-green', 'blue-purple'],
            'red': ['red-orange', 'red-purple'],
            'yellow': ['yellow-green', 'yellow-orange'],
            'green': ['yellow-green', 'blue-green']
        };

        return analogousMap[baseColor.toLowerCase()] || ['gray', 'white'];
    }

    calculateMaterialCompatibility(properties, analysis) {
        let score = 0;

        // Style compatibility
        if (properties.style_compatibility.includes(analysis.dominant_style.primary)) {
            score += 40;
        }

        // Climate suitability
        if (properties.climate_suitability?.includes(analysis.environmental_factors?.climate)) {
            score += 20;
        }

        // Budget fit
        const budgetFit = this.assessBudgetFit(properties.cost_range, analysis.budget_implications);
        score += budgetFit * 20;

        // Durability vs maintenance preference
        if (analysis.lifestyle_factors?.maintenance_preference === 'low' && properties.maintenance >= 7) {
            score += 10;
        }

        // Sustainability preference
        if (analysis.environmental_factors?.sustainability_priority === 'high' && properties.sustainability_score >= 7) {
            score += 10;
        }

        return Math.min(100, score);
    }

    assessBudgetFit(materialCostRange, budgetImplications) {
        const costRanking = {
            'low': 1,
            'medium': 2,
            'medium-high': 3,
            'high': 4
        };

        const materialRank = costRanking[materialCostRange] || 2;
        const budgetRank = costRanking[budgetImplications.range] || 2;

        if (materialRank <= budgetRank) return 1.0;
        if (materialRank - budgetRank === 1) return 0.6;
        return 0.2;
    }

    generateDesignRationale(moodBoard, analysis) {
        return {
            style_choice: `Selected ${analysis.dominant_style.primary} style based on personality match and space requirements`,
            color_strategy: `Used ${moodBoard.color_palette.harmony_type} color harmony for ${moodBoard.color_palette.harmony_description.toLowerCase()}`,
            material_selection: `Materials chosen for durability, style compatibility, and maintenance requirements`,
            lighting_approach: `Layered lighting design combining ambient, task, and accent lighting for optimal functionality`,
            sustainability_considerations: this.analyzeSustainability(moodBoard),
            personalization_elements: this.identifyPersonalizationElements(moodBoard, analysis)
        };
    }

    async generateImplementationGuide(moodBoard, requirements) {
        return {
            priority_phases: [
                {
                    phase: 1,
                    title: 'Foundation Elements',
                    items: ['Paint colors', 'Primary flooring', 'Major furniture pieces'],
                    timeline: '2-4 weeks',
                    budget_percentage: 60
                },
                {
                    phase: 2,
                    title: 'Lighting & Textiles',
                    items: ['Lighting fixtures', 'Window treatments', 'Major textiles'],
                    timeline: '1-2 weeks',
                    budget_percentage: 25
                },
                {
                    phase: 3,
                    title: 'Accessories & Details',
                    items: ['Artwork', 'Decorative objects', 'Plants', 'Final styling'],
                    timeline: '1 week',
                    budget_percentage: 15
                }
            ],
            shopping_list: this.generateShoppingList(moodBoard),
            vendor_recommendations: await this.suggestVendors(moodBoard, requirements),
            diy_opportunities: this.identifyDIYOpportunities(moodBoard)
        };
    }

    async estimateMoodBoardCost(moodBoard, requirements) {
        const costBreakdown = {
            materials: 0,
            furniture: 0,
            lighting: 0,
            accessories: 0,
            labor: 0,
            total: 0
        };

        // Calculate material costs
        if (moodBoard.materials?.flooring) {
            costBreakdown.materials += this.estimateFlooringCost(moodBoard.materials.flooring, requirements);
        }

        // Calculate furniture costs
        costBreakdown.furniture = this.estimateFurnitureCosts(moodBoard.furniture, requirements.budget_range);

        // Calculate lighting costs
        costBreakdown.lighting = this.estimateLightingCosts(moodBoard.lighting);

        // Calculate accessory costs
        costBreakdown.accessories = this.estimateAccessoryCosts(moodBoard.accessories, requirements.budget_range);

        // Calculate labor costs (20% of material and installation costs)
        costBreakdown.labor = (costBreakdown.materials + costBreakdown.lighting) * 0.2;

        costBreakdown.total = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);

        return {
            breakdown: costBreakdown,
            budget_fit: this.assessBudgetFit(costBreakdown.total, requirements.budget_range),
            cost_optimization_suggestions: this.generateCostOptimizationSuggestions(costBreakdown),
            financing_options: this.suggestFinancingOptions(costBreakdown.total)
        };
    }

    generateMaintenanceGuide(moodBoard) {
        return {
            daily_maintenance: [
                'Dust surfaces with microfiber cloth',
                'Fluff and rotate cushions',
                'Water plants according to care instructions'
            ],
            weekly_maintenance: [
                'Vacuum upholstered furniture',
                'Clean glass and mirror surfaces',
                'Organize decorative objects'
            ],
            monthly_maintenance: [
                'Deep clean textiles',
                'Polish wood furniture',
                'Check and replace burnt-out bulbs'
            ],
            seasonal_maintenance: [
                'Rotate seasonal accessories',
                'Deep clean carpets and rugs',
                'Inspect and touch up paint',
                'Service lighting fixtures'
            ],
            material_specific_care: this.generateMaterialSpecificCare(moodBoard.materials)
        };
    }
}

// Supporting classes

class StyleDatabase {
    constructor() {
        this.styles = new Map();
        this.trends = new Map();
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize with current design trends and style data
        console.log('Style database initialized');
    }
}

class ColorHarmonyEngine {
    constructor() {
        this.colorWheel = this.initializeColorWheel();
        this.harmonyRules = this.initializeHarmonyRules();
    }

    initializeColorWheel() {
        return {
            primary: ['red', 'blue', 'yellow'],
            secondary: ['orange', 'green', 'purple'],
            tertiary: ['red-orange', 'yellow-orange', 'yellow-green', 'blue-green', 'blue-purple', 'red-purple']
        };
    }

    initializeHarmonyRules() {
        return new Map([
            ['complementary', { spacing: 6, count: 2 }],
            ['analogous', { spacing: 1, count: 3 }],
            ['triadic', { spacing: 4, count: 3 }],
            ['split-complementary', { spacing: [5, 7], count: 3 }]
        ]);
    }
}

class MaterialCompatibilityChecker {
    constructor() {
        this.compatibilityMatrix = this.initializeCompatibilityMatrix();
    }

    initializeCompatibilityMatrix() {
        // Initialize material compatibility data
        return new Map();
    }

    checkCompatibility(material1, material2) {
        // Check if two materials work well together
        return this.compatibilityMatrix.get(`${material1}-${material2}`) || 
               this.compatibilityMatrix.get(`${material2}-${material1}`) || 
               0.5; // Default neutral compatibility
    }
}

class MoodBoardGenerator {
    constructor() {
        this.templates = this.loadMoodBoardTemplates();
    }

    loadMoodBoardTemplates() {
        return new Map([
            ['modern', { layout: 'grid', emphasis: 'clean lines' }],
            ['bohemian', { layout: 'organic', emphasis: 'texture mix' }],
            ['scandinavian', { layout: 'minimal', emphasis: 'natural elements' }]
        ]);
    }
}

class TrendAnalyzer {
    constructor() {
        this.currentTrends = this.loadCurrentTrends();
    }

    loadCurrentTrends() {
        return {
            2024: ['sustainable materials', 'maximalist patterns', 'earth tones', 'curved furniture'],
            rising: ['biophilic design', 'textural walls', 'vintage revival'],
            declining: ['all-gray palettes', 'fast furniture', 'over-minimalism']
        };
    }
}

class ClimateAnalyzer {
    constructor() {
        this.climateData = this.loadClimateRecommendations();
    }

    loadClimateRecommendations() {
        return {
            humid: {
                avoid_materials: ['untreated wood', 'iron'],
                prefer_materials: ['ceramic', 'synthetic textiles', 'treated metals'],
                ventilation_priority: 'high'
            },
            dry: {
                prefer_materials: ['natural wood', 'leather', 'cotton'],
                humidification_needs: 'medium',
                static_considerations: 'high'
            },
            temperate: {
                material_flexibility: 'high',
                seasonal_adaptability: 'required'
            }
        };
    }
}

// Initialize AI Design Studio
window.AIDesignStudio = AIDesignStudio;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiDesignStudio = new AIDesignStudio();
    console.log('AI Design Studio ready for creative work!');
});