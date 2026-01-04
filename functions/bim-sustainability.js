/**
 * BIM Sustainability & Lifecycle Modeling Service
 * Energy, daylight, and lifecycle analysis scripts with analytics
 * 
 * Features:
 * - Embodied carbon calculations
 * - Energy consumption modeling
 * - Daylight analysis
 * - Lifecycle impact assessment
 * - Real-time analytics and reporting
 */

class SustainabilityAnalyticsService {
    constructor() {
        this.analysisCache = new Map();
        this.energyModels = new Map();
        this.lifecycleDatabase = new Map();
        this.daylightModels = new Map();
        
        this.initializeEnergyModels();
        this.initializeLifecycleDatabase();
        this.initializeDaylightModels();
        
        console.log('Sustainability Analytics Service initialized');
    }

    initializeEnergyModels() {
        // Energy calculation models by building type
        this.energyModels.set('office', {
            lighting: { base_load: 1.2, efficiency_factor: 0.85 }, // W/sqft
            hvac: { heating: 15, cooling: 12, ventilation: 3 }, // BTU/sqft/hr
            equipment: { computers: 2.5, other: 1.0 }, // W/sqft
            envelope: { wall_r_value: 13, window_u_factor: 0.35 },
            occupancy: { peak: 250, hours_per_day: 10 } // sqft per person
        });

        this.energyModels.set('residential', {
            lighting: { base_load: 0.8, efficiency_factor: 0.75 },
            hvac: { heating: 25, cooling: 18, ventilation: 2 },
            equipment: { appliances: 1.5, electronics: 1.0 },
            envelope: { wall_r_value: 16, window_u_factor: 0.30 },
            occupancy: { peak: 400, hours_per_day: 16 }
        });

        this.energyModels.set('retail', {
            lighting: { base_load: 2.0, efficiency_factor: 0.80 },
            hvac: { heating: 20, cooling: 15, ventilation: 4 },
            equipment: { pos_systems: 0.5, displays: 1.0 },
            envelope: { wall_r_value: 11, window_u_factor: 0.40 },
            occupancy: { peak: 100, hours_per_day: 12 }
        });
    }

    initializeLifecycleDatabase() {
        // Lifecycle data for common materials (per unit)
        const lifecycleData = {
            'concrete': {
                embodied_carbon: 410, // kg CO2e per m3
                embodied_energy: 1800, // MJ per m3
                lifespan: 50, // years
                recyclability: 0.95,
                maintenance_factor: 0.02, // annual maintenance as % of initial impact
                end_of_life: 'recycle'
            },
            'steel': {
                embodied_carbon: 2700, // kg CO2e per ton
                embodied_energy: 24000, // MJ per ton
                lifespan: 75,
                recyclability: 0.98,
                maintenance_factor: 0.01,
                end_of_life: 'recycle'
            },
            'wood': {
                embodied_carbon: -950, // kg CO2e per m3 (carbon storage)
                embodied_energy: 600, // MJ per m3
                lifespan: 60,
                recyclability: 0.85,
                maintenance_factor: 0.03,
                end_of_life: 'biodegrade'
            },
            'aluminum': {
                embodied_carbon: 11500, // kg CO2e per ton
                embodied_energy: 191000, // MJ per ton
                lifespan: 80,
                recyclability: 0.95,
                maintenance_factor: 0.005,
                end_of_life: 'recycle'
            },
            'glass': {
                embodied_carbon: 850, // kg CO2e per ton
                embodied_energy: 15800, // MJ per ton
                lifespan: 40,
                recyclability: 0.90,
                maintenance_factor: 0.02,
                end_of_life: 'recycle'
            },
            'insulation_fiberglass': {
                embodied_carbon: 1200, // kg CO2e per m3
                embodied_energy: 28000, // MJ per m3
                lifespan: 25,
                recyclability: 0.70,
                maintenance_factor: 0.01,
                end_of_life: 'dispose'
            }
        };

        for (const [material, data] of Object.entries(lifecycleData)) {
            this.lifecycleDatabase.set(material, data);
        }
    }

    initializeDaylightModels() {
        // Daylight analysis models
        this.daylightModels.set('standard', {
            target_illuminance: 500, // lux for office work
            daylight_factor_min: 2, // minimum percentage
            uniformity_ratio: 0.7, // min/avg illuminance
            glare_control: true,
            seasonal_variation: true
        });

        this.daylightModels.set('residential', {
            target_illuminance: 300,
            daylight_factor_min: 1.5,
            uniformity_ratio: 0.6,
            glare_control: false,
            seasonal_variation: true
        });
    }

    /**
     * Run comprehensive sustainability analysis
     */
    async runSustainabilityAnalysis(projectId, bimModel, analysisOptions = {}) {
        try {
            const timestamp = new Date().toISOString();
            const cacheKey = `${projectId}_${JSON.stringify(analysisOptions).slice(0, 50)}`;
            
            // Check cache
            const cached = this.analysisCache.get(cacheKey);
            if (cached && this.isCacheValid(cached)) {
                return cached.result;
            }

            const analysis = {
                projectId,
                timestamp,
                embodiedCarbon: await this.calculateEmbodiedCarbon(bimModel),
                energyConsumption: await this.calculateEnergyConsumption(bimModel),
                daylightAnalysis: await this.performDaylightAnalysis(bimModel),
                lifecycleImpact: await this.calculateLifecycleImpact(bimModel),
                sustainabilityScore: 0,
                recommendations: [],
                benchmarks: await this.getBenchmarks(bimModel.building_type)
            };

            // Calculate overall sustainability score
            analysis.sustainabilityScore = this.calculateSustainabilityScore(analysis);
            
            // Generate recommendations
            analysis.recommendations = this.generateSustainabilityRecommendations(analysis);

            const result = {
                success: true,
                analysis,
                message: 'Sustainability analysis completed successfully'
            };

            // Cache result
            this.analysisCache.set(cacheKey, {
                result,
                cachedAt: timestamp,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
            });

            return result;

        } catch (error) {
            console.error('Sustainability analysis error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to complete sustainability analysis'
            };
        }
    }

    /**
     * Calculate embodied carbon for all materials
     */
    async calculateEmbodiedCarbon(bimModel) {
        const materials = bimModel.materials || [];
        const calculations = [];
        let totalEmbodiedCarbon = 0;

        for (const material of materials) {
            const lifecycleData = this.lifecycleDatabase.get(material.type);
            
            if (lifecycleData) {
                const quantity = material.quantity || 1;
                const embodiedCarbon = lifecycleData.embodied_carbon * quantity;
                
                calculations.push({
                    material: material.name || material.type,
                    type: material.type,
                    quantity,
                    unit: material.unit || 'unit',
                    embodied_carbon_per_unit: lifecycleData.embodied_carbon,
                    total_embodied_carbon: embodiedCarbon,
                    percentage_of_total: 0 // Will be calculated after total
                });
                
                totalEmbodiedCarbon += embodiedCarbon;
            }
        }

        // Calculate percentages
        calculations.forEach(calc => {
            calc.percentage_of_total = Math.round((calc.total_embodied_carbon / totalEmbodiedCarbon) * 100);
        });

        return {
            total_kg_co2e: Math.round(totalEmbodiedCarbon),
            per_sqm: Math.round(totalEmbodiedCarbon / (bimModel.area || 1000)),
            by_material: calculations,
            largest_contributor: calculations.reduce((max, calc) => 
                calc.total_embodied_carbon > (max?.total_embodied_carbon || 0) ? calc : max, null
            )
        };
    }

    /**
     * Calculate energy consumption
     */
    async calculateEnergyConsumption(bimModel) {
        const buildingType = bimModel.building_type || 'office';
        const area = bimModel.area || 1000; // sqft
        const energyModel = this.energyModels.get(buildingType);
        
        if (!energyModel) {
            throw new Error(`Energy model not found for building type: ${buildingType}`);
        }

        const lighting = this.calculateLightingEnergy(area, energyModel, bimModel);
        const hvac = this.calculateHVACEnergy(area, energyModel, bimModel);
        const equipment = this.calculateEquipmentEnergy(area, energyModel, bimModel);

        const totalAnnualConsumption = lighting.annual + hvac.annual + equipment.annual;
        const totalAnnualCost = totalAnnualConsumption * (bimModel.electricity_rate || 0.12); // $/kWh

        return {
            total_annual_kwh: Math.round(totalAnnualConsumption),
            total_annual_cost: Math.round(totalAnnualCost),
            per_sqft_kwh: Math.round(totalAnnualConsumption / area * 100) / 100,
            breakdown: {
                lighting: {
                    annual_kwh: Math.round(lighting.annual),
                    percentage: Math.round((lighting.annual / totalAnnualConsumption) * 100)
                },
                hvac: {
                    annual_kwh: Math.round(hvac.annual),
                    percentage: Math.round((hvac.annual / totalAnnualConsumption) * 100)
                },
                equipment: {
                    annual_kwh: Math.round(equipment.annual),
                    percentage: Math.round((equipment.annual / totalAnnualConsumption) * 100)
                }
            },
            monthly_pattern: this.generateMonthlyEnergyPattern(lighting, hvac, equipment)
        };
    }

    calculateLightingEnergy(area, energyModel, bimModel) {
        const baseLoad = energyModel.lighting.base_load; // W/sqft
        const efficiency = energyModel.lighting.efficiency_factor;
        const hoursPerDay = energyModel.occupancy.hours_per_day;
        const daysPerYear = 250; // Working days

        // Consider daylight reduction if available
        const daylightReduction = bimModel.daylight_factor || 0.2;
        const effectiveLoad = baseLoad * efficiency * (1 - daylightReduction);
        
        const dailyConsumption = (effectiveLoad * area * hoursPerDay) / 1000; // kWh
        const annualConsumption = dailyConsumption * daysPerYear;

        return {
            daily: dailyConsumption,
            annual: annualConsumption,
            peak_demand: (effectiveLoad * area) / 1000 // kW
        };
    }

    calculateHVACEnergy(area, energyModel, bimModel) {
        const heating = energyModel.hvac.heating; // BTU/sqft/hr
        const cooling = energyModel.hvac.cooling;
        const ventilation = energyModel.hvac.ventilation;

        // Convert BTU to kWh (1 kWh = 3412 BTU)
        const heatingDaily = (heating * area * 8) / 3412; // 8 hours heating season
        const coolingDaily = (cooling * area * 10) / 3412; // 10 hours cooling season
        const ventilationDaily = (ventilation * area * energyModel.occupancy.hours_per_day) / 3412;

        // Annual calculations (heating: 120 days, cooling: 100 days, ventilation: 250 days)
        const heatingAnnual = heatingDaily * 120;
        const coolingAnnual = coolingDaily * 100;
        const ventilationAnnual = ventilationDaily * 250;

        const totalAnnual = heatingAnnual + coolingAnnual + ventilationAnnual;

        return {
            daily: (heatingDaily + coolingDaily + ventilationDaily) / 3, // Average
            annual: totalAnnual,
            breakdown: {
                heating: heatingAnnual,
                cooling: coolingAnnual,
                ventilation: ventilationAnnual
            }
        };
    }

    calculateEquipmentEnergy(area, energyModel, bimModel) {
        const equipmentTypes = Object.keys(energyModel.equipment);
        let totalDaily = 0;
        const breakdown = {};

        for (const equipType of equipmentTypes) {
            const load = energyModel.equipment[equipType]; // W/sqft
            const hoursPerDay = equipType === 'computers' ? energyModel.occupancy.hours_per_day : 24;
            
            const dailyConsumption = (load * area * hoursPerDay) / 1000; // kWh
            breakdown[equipType] = dailyConsumption * 250; // Annual
            totalDaily += dailyConsumption;
        }

        return {
            daily: totalDaily,
            annual: totalDaily * 250,
            breakdown
        };
    }

    /**
     * Perform daylight analysis
     */
    async performDaylightAnalysis(bimModel) {
        const buildingType = bimModel.building_type || 'office';
        const daylightModel = this.daylightModels.get(buildingType === 'residential' ? 'residential' : 'standard');
        
        const spaces = bimModel.spaces || [];
        const analysis = [];
        
        for (const space of spaces) {
            const spaceAnalysis = this.analyzeSpaceDaylight(space, daylightModel, bimModel);
            analysis.push(spaceAnalysis);
        }

        const overallScore = analysis.length > 0 
            ? analysis.reduce((sum, a) => sum + a.daylight_score, 0) / analysis.length 
            : 0;

        return {
            overall_score: Math.round(overallScore),
            target_illuminance: daylightModel.target_illuminance,
            spaces_analyzed: analysis.length,
            spaces_meeting_target: analysis.filter(a => a.meets_target).length,
            by_space: analysis,
            recommendations: this.generateDaylightRecommendations(analysis, daylightModel)
        };
    }

    analyzeSpaceDaylight(space, daylightModel, bimModel) {
        // Mock daylight calculation
        const windows = space.windows || [];
        const windowArea = windows.reduce((sum, w) => sum + (w.area || 10), 0);
        const floorArea = space.area || 100;
        const windowToFloorRatio = windowArea / floorArea;

        // Calculate daylight factor
        const orientationFactor = this.getOrientationFactor(space.orientation || 'south');
        const obstructionFactor = 1 - (space.obstructions || 0) * 0.1;
        const transmittanceFactor = 0.8; // Typical window transmittance
        
        const daylightFactor = windowToFloorRatio * orientationFactor * obstructionFactor * transmittanceFactor * 100;
        
        const averageIlluminance = daylightFactor * 10000 / 100; // lux
        const meetsTarget = averageIlluminance >= daylightModel.target_illuminance;

        const daylightScore = Math.min(100, (averageIlluminance / daylightModel.target_illuminance) * 100);

        return {
            space_id: space.id || space.name,
            space_name: space.name || 'Unnamed Space',
            area_sqft: space.area || 100,
            window_area_sqft: windowArea,
            window_to_floor_ratio: Math.round(windowToFloorRatio * 100) / 100,
            daylight_factor: Math.round(daylightFactor * 100) / 100,
            average_illuminance: Math.round(averageIlluminance),
            target_illuminance: daylightModel.target_illuminance,
            meets_target: meetsTarget,
            daylight_score: Math.round(daylightScore),
            issues: this.identifyDaylightIssues(daylightFactor, averageIlluminance, daylightModel)
        };
    }

    /**
     * Calculate lifecycle impact
     */
    async calculateLifecycleImpact(bimModel) {
        const analysisYears = bimModel.analysis_period || 50;
        const materials = bimModel.materials || [];
        
        let totalEmbodiedImpact = 0;
        let totalMaintenanceImpact = 0;
        let totalEndOfLifeImpact = 0;
        
        const materialAnalysis = [];

        for (const material of materials) {
            const lifecycleData = this.lifecycleDatabase.get(material.type);
            if (lifecycleData) {
                const quantity = material.quantity || 1;
                const embodied = lifecycleData.embodied_carbon * quantity;
                
                // Calculate maintenance impact over analysis period
                const maintenanceCycles = Math.floor(analysisYears / (lifecycleData.lifespan / 4)); // Maintenance every 1/4 lifespan
                const maintenanceImpact = embodied * lifecycleData.maintenance_factor * maintenanceCycles;
                
                // Calculate replacement impact
                const replacementCycles = Math.floor(analysisYears / lifecycleData.lifespan);
                const replacementImpact = embodied * replacementCycles * 0.8; // Assume 80% of initial impact
                
                // End of life impact (disposal/recycling)
                const endOfLifeImpact = embodied * (1 - lifecycleData.recyclability) * 0.1;

                const materialTotalImpact = embodied + maintenanceImpact + replacementImpact + endOfLifeImpact;

                materialAnalysis.push({
                    material: material.name || material.type,
                    type: material.type,
                    initial_embodied_carbon: embodied,
                    maintenance_impact: maintenanceImpact,
                    replacement_impact: replacementImpact,
                    end_of_life_impact: endOfLifeImpact,
                    total_lifecycle_impact: materialTotalImpact,
                    replacements_needed: replacementCycles
                });

                totalEmbodiedImpact += embodied;
                totalMaintenanceImpact += maintenanceImpact;
                totalEndOfLifeImpact += endOfLifeImpact;
            }
        }

        const totalLifecycleImpact = totalEmbodiedImpact + totalMaintenanceImpact + totalEndOfLifeImpact;

        return {
            analysis_period_years: analysisYears,
            total_lifecycle_impact: Math.round(totalLifecycleImpact),
            embodied_impact: Math.round(totalEmbodiedImpact),
            maintenance_impact: Math.round(totalMaintenanceImpact),
            end_of_life_impact: Math.round(totalEndOfLifeImpact),
            per_year_impact: Math.round(totalLifecycleImpact / analysisYears),
            by_material: materialAnalysis,
            highest_impact_material: materialAnalysis.reduce((max, mat) => 
                mat.total_lifecycle_impact > (max?.total_lifecycle_impact || 0) ? mat : max, null
            )
        };
    }

    /**
     * Calculate overall sustainability score
     */
    calculateSustainabilityScore(analysis) {
        let score = 0;
        let factors = 0;

        // Embodied carbon score (lower is better)
        if (analysis.embodiedCarbon.per_sqm) {
            const carbonScore = Math.max(0, 100 - (analysis.embodiedCarbon.per_sqm / 1000) * 100);
            score += carbonScore * 0.3;
            factors += 0.3;
        }

        // Energy efficiency score
        if (analysis.energyConsumption.per_sqft_kwh) {
            const energyScore = Math.max(0, 100 - (analysis.energyConsumption.per_sqft_kwh / 20) * 100);
            score += energyScore * 0.3;
            factors += 0.3;
        }

        // Daylight score
        if (analysis.daylightAnalysis.overall_score) {
            score += analysis.daylightAnalysis.overall_score * 0.2;
            factors += 0.2;
        }

        // Lifecycle impact score
        if (analysis.lifecycleImpact.per_year_impact) {
            const lifecycleScore = Math.max(0, 100 - (analysis.lifecycleImpact.per_year_impact / 10000) * 100);
            score += lifecycleScore * 0.2;
            factors += 0.2;
        }

        return Math.round(score / factors);
    }

    /**
     * Helper functions
     */
    generateMonthlyEnergyPattern(lighting, hvac, equipment) {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        return months.map((month, index) => {
            // Seasonal variation factors
            const heatingFactor = index < 3 || index > 10 ? 1.5 : index < 5 || index > 8 ? 1.2 : 0.5;
            const coolingFactor = index > 4 && index < 9 ? 1.5 : 0.3;
            const lightingFactor = index < 3 || index > 9 ? 1.2 : 0.8;

            const monthlyHVAC = (hvac.breakdown.heating * heatingFactor + hvac.breakdown.cooling * coolingFactor) / 12;
            const monthlyLighting = lighting.annual * lightingFactor / 12;
            const monthlyEquipment = equipment.annual / 12;

            return {
                month,
                lighting: Math.round(monthlyLighting),
                hvac: Math.round(monthlyHVAC),
                equipment: Math.round(monthlyEquipment),
                total: Math.round(monthlyLighting + monthlyHVAC + monthlyEquipment)
            };
        });
    }

    getOrientationFactor(orientation) {
        const factors = {
            'north': 0.6,
            'south': 1.0,
            'east': 0.8,
            'west': 0.8,
            'northeast': 0.7,
            'northwest': 0.7,
            'southeast': 0.9,
            'southwest': 0.9
        };
        return factors[orientation.toLowerCase()] || 0.8;
    }

    identifyDaylightIssues(daylightFactor, illuminance, model) {
        const issues = [];
        
        if (daylightFactor < model.daylight_factor_min) {
            issues.push('Insufficient daylight factor');
        }
        
        if (illuminance < model.target_illuminance) {
            issues.push('Below target illuminance');
        }
        
        if (daylightFactor > 10) {
            issues.push('Potential glare issues');
        }
        
        return issues;
    }

    generateDaylightRecommendations(spaceAnalyses, model) {
        const recommendations = [];
        const underlit = spaceAnalyses.filter(s => !s.meets_target);
        
        if (underlit.length > 0) {
            recommendations.push({
                type: 'window_sizing',
                priority: 'high',
                message: `${underlit.length} spaces have insufficient daylight. Consider increasing window area.`
            });
        }
        
        const highGlare = spaceAnalyses.filter(s => s.daylight_factor > 10);
        if (highGlare.length > 0) {
            recommendations.push({
                type: 'glare_control',
                priority: 'medium',
                message: `${highGlare.length} spaces may have glare issues. Consider shading devices.`
            });
        }
        
        return recommendations;
    }

    generateSustainabilityRecommendations(analysis) {
        const recommendations = [];
        
        // Embodied carbon recommendations
        if (analysis.embodiedCarbon.per_sqm > 800) {
            recommendations.push({
                category: 'embodied_carbon',
                priority: 'high',
                title: 'Reduce Embodied Carbon',
                description: 'Consider lower-carbon alternatives for high-impact materials',
                potential_saving: '20-30% carbon reduction'
            });
        }
        
        // Energy recommendations
        if (analysis.energyConsumption.per_sqft_kwh > 15) {
            recommendations.push({
                category: 'energy_efficiency',
                priority: 'high',
                title: 'Improve Energy Efficiency',
                description: 'Upgrade HVAC systems and improve building envelope',
                potential_saving: '15-25% energy reduction'
            });
        }
        
        // Daylight recommendations
        if (analysis.daylightAnalysis.overall_score < 70) {
            recommendations.push({
                category: 'daylight',
                priority: 'medium',
                title: 'Enhance Natural Lighting',
                description: 'Optimize window placement and size for better daylight',
                potential_saving: '10-15% lighting energy reduction'
            });
        }
        
        return recommendations;
    }

    async getBenchmarks(buildingType) {
        // Industry benchmarks by building type
        const benchmarks = {
            'office': {
                embodied_carbon_per_sqm: 600,
                energy_per_sqft_kwh: 12,
                daylight_score: 75,
                sustainability_score: 70
            },
            'residential': {
                embodied_carbon_per_sqm: 450,
                energy_per_sqft_kwh: 8,
                daylight_score: 65,
                sustainability_score: 65
            },
            'retail': {
                embodied_carbon_per_sqm: 550,
                energy_per_sqft_kwh: 18,
                daylight_score: 60,
                sustainability_score: 60
            }
        };
        
        return benchmarks[buildingType] || benchmarks.office;
    }

    isCacheValid(cached) {
        return new Date(cached.expiresAt) > new Date();
    }
}

// Cloud-agnostic export
const sustainabilityAnalyticsService = new SustainabilityAnalyticsService();

// Handle sustainability analytics requests
async function handleSustainabilityRequest(request, url) {
    const headers = {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
    };

    try {
        const path = url.pathname;
        const method = request.method;
        
        // Extract project ID from path
        const projectIdMatch = path.match(/\/projects\/([^\/]+)/);
        const projectId = projectIdMatch ? projectIdMatch[1] : null;

        if (!projectId) {
            return new Response(JSON.stringify({
                error: 'Project ID required',
                message: 'Please specify a project ID in the URL path'
            }), { status: 400, headers });
        }

        if (path.includes('/analytics') && method === 'POST') {
            const { bimModel, analysisOptions } = await request.json();
            
            const result = await sustainabilityAnalyticsService.runSustainabilityAnalysis(
                projectId,
                bimModel,
                analysisOptions
            );
            
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 500,
                headers
            });
        }

        if (path.includes('/analytics') && method === 'GET') {
            // Return cached analysis if available
            const cacheKey = `${projectId}_{}`;
            const cached = sustainabilityAnalyticsService.analysisCache.get(cacheKey);
            
            if (cached && sustainabilityAnalyticsService.isCacheValid(cached)) {
                return new Response(JSON.stringify(cached.result), { headers });
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'No analysis found. Please run analysis first.',
                    error: 'ANALYSIS_NOT_FOUND'
                }), { status: 404, headers });
            }
        }

        return new Response(JSON.stringify({
            error: 'Invalid endpoint',
            available_endpoints: [
                'POST /projects/:id/analytics - Run sustainability analysis',
                'GET /projects/:id/analytics - Get cached analysis results'
            ]
        }), { status: 404, headers });

    } catch (error) {
        console.error('Sustainability analytics error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), { status: 500, headers });
    }
}

// Cloudflare Worker format
export default {
    async fetch(request) {
        return handleSustainabilityRequest(request, new URL(request.url));
    }
};

// Node.js export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SustainabilityAnalyticsService,
        sustainabilityAnalyticsService,
        handleSustainabilityRequest
    };
}