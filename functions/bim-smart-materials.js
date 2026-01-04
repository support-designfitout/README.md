/**
 * Smart Material Library Integration Service
 * Integrates with external materials API for real-time cost, availability, and sustainability data
 * 
 * Features:
 * - Real-time supplier data integration
 * - Cost and availability tracking
 * - Lead time calculations
 * - Sustainability metrics
 * - Smart recommendations engine
 */

class SmartMaterialLibraryService {
    constructor() {
        this.materialCache = new Map();
        this.suppliers = new Map();
        this.sustainabilityDatabase = new Map();
        this.priceHistory = new Map();
        
        this.initializeSuppliers();
        this.initializeSustainabilityMetrics();
        
        console.log('Smart Material Library Service initialized');
    }

    initializeSuppliers() {
        // Mock supplier data - in production this would come from external APIs
        this.suppliers.set('supplier_1', {
            id: 'supplier_1',
            name: 'Premium Building Materials Co.',
            location: 'New York, NY',
            reliability_score: 8.5,
            lead_time_avg: 7, // days
            shipping_zones: ['northeast', 'southeast'],
            specialties: ['flooring', 'fixtures', 'lighting'],
            certifications: ['LEED', 'GREENGUARD', 'FSC']
        });

        this.suppliers.set('supplier_2', {
            id: 'supplier_2',
            name: 'Sustainable Design Supply',
            location: 'San Francisco, CA',
            reliability_score: 9.2,
            lead_time_avg: 10, // days
            shipping_zones: ['west', 'southwest'],
            specialties: ['sustainable_materials', 'recycled_content', 'bio_based'],
            certifications: ['CRADLE_TO_CRADLE', 'GREENGUARD_GOLD', 'FSC']
        });

        this.suppliers.set('supplier_3', {
            id: 'supplier_3',
            name: 'Commercial Fit-Out Solutions',
            location: 'Chicago, IL',
            reliability_score: 8.0,
            lead_time_avg: 5, // days
            shipping_zones: ['midwest', 'central'],
            specialties: ['office_furniture', 'commercial_fixtures', 'systems_furniture'],
            certifications: ['BIFMA', 'GREENGUARD', 'SCS']
        });
    }

    initializeSustainabilityMetrics() {
        // Initialize sustainability database with common materials
        const sustainabilityData = {
            'hardwood_oak': {
                embodied_carbon: 0.89, // kg CO2e per kg
                renewable: true,
                recycled_content: 0,
                recyclability: 0.85,
                durability_years: 50,
                voc_emissions: 'low',
                certifications: ['FSC', 'PEFC']
            },
            'ceramic_tile': {
                embodied_carbon: 1.2,
                renewable: false,
                recycled_content: 0.3,
                recyclability: 0.95,
                durability_years: 30,
                voc_emissions: 'none',
                certifications: ['GREENGUARD']
            },
            'luxury_vinyl_plank': {
                embodied_carbon: 2.1,
                renewable: false,
                recycled_content: 0.25,
                recyclability: 0.7,
                durability_years: 20,
                voc_emissions: 'low',
                certifications: ['GREENGUARD', 'FloorScore']
            },
            'led_lighting': {
                embodied_carbon: 5.2,
                renewable: false,
                recycled_content: 0.4,
                recyclability: 0.8,
                durability_years: 15,
                energy_efficiency: 0.9,
                certifications: ['ENERGY_STAR', 'DLC']
            }
        };

        for (const [material, data] of Object.entries(sustainabilityData)) {
            this.sustainabilityDatabase.set(material, data);
        }
    }

    /**
     * Get material data with live supplier information
     */
    async getMaterialData(materialId, projectLocation = null, quantity = 1) {
        try {
            // Check cache first
            const cacheKey = `${materialId}_${projectLocation}_${quantity}`;
            const cached = this.materialCache.get(cacheKey);
            
            if (cached && this.isCacheValid(cached)) {
                return cached;
            }

            // Fetch fresh data
            const materialData = await this.fetchMaterialData(materialId);
            const supplierData = await this.getSupplierData(materialId, projectLocation, quantity);
            const sustainabilityData = this.getSustainabilityData(materialId);
            const recommendations = this.generateRecommendations(materialId, supplierData, sustainabilityData);

            const result = {
                success: true,
                material: {
                    id: materialId,
                    ...materialData,
                    suppliers: supplierData,
                    sustainability: sustainabilityData,
                    recommendations,
                    last_updated: new Date().toISOString()
                }
            };

            // Cache the result
            this.materialCache.set(cacheKey, {
                ...result,
                cached_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
            });

            return result;

        } catch (error) {
            console.error('Error fetching material data:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to fetch material data'
            };
        }
    }

    /**
     * Fetch base material data
     */
    async fetchMaterialData(materialId) {
        // Mock API call - in production this would hit external material APIs
        const materialDatabase = {
            'hardwood_oak': {
                name: 'Oak Hardwood Flooring',
                category: 'flooring',
                base_price: 8.50, // per sq ft
                unit: 'sq_ft',
                specifications: {
                    thickness: '3/4 inch',
                    width: '3.25 inch',
                    finish: 'urethane',
                    grade: 'select'
                },
                images: ['/images/hardwood_oak_1.jpg'],
                datasheet: '/datasheets/hardwood_oak.pdf'
            },
            'ceramic_tile_porcelain': {
                name: 'Porcelain Ceramic Tile',
                category: 'flooring',
                base_price: 4.25,
                unit: 'sq_ft',
                specifications: {
                    size: '12x24 inch',
                    thickness: '8mm',
                    finish: 'matte',
                    absorption: '< 0.5%'
                },
                images: ['/images/ceramic_tile_1.jpg'],
                datasheet: '/datasheets/ceramic_tile.pdf'
            },
            'led_panel_light': {
                name: 'LED Panel Light 2x4',
                category: 'lighting',
                base_price: 125.00,
                unit: 'each',
                specifications: {
                    dimensions: '24x48 inch',
                    wattage: '40W',
                    lumens: '4000',
                    color_temp: '4000K'
                },
                images: ['/images/led_panel_1.jpg'],
                datasheet: '/datasheets/led_panel.pdf'
            }
        };

        return materialDatabase[materialId] || {
            name: 'Material Not Found',
            category: 'unknown',
            base_price: 0,
            unit: 'each'
        };
    }

    /**
     * Get supplier data for a material
     */
    async getSupplierData(materialId, projectLocation, quantity) {
        const supplierData = [];

        for (const [supplierId, supplier] of this.suppliers) {
            // Check if supplier can supply this material
            const canSupply = this.checkSupplierCompatibility(supplier, materialId, projectLocation);
            
            if (canSupply) {
                const pricing = this.calculatePricing(supplier, materialId, quantity);
                const availability = this.checkAvailability(supplier, materialId, quantity);
                const leadTime = this.calculateLeadTime(supplier, projectLocation, quantity);

                supplierData.push({
                    supplier: {
                        id: supplier.id,
                        name: supplier.name,
                        location: supplier.location,
                        reliability_score: supplier.reliability_score,
                        certifications: supplier.certifications
                    },
                    pricing: {
                        unit_price: pricing.unitPrice,
                        total_price: pricing.totalPrice,
                        discount: pricing.discount,
                        valid_until: pricing.validUntil
                    },
                    availability: {
                        in_stock: availability.inStock,
                        stock_level: availability.stockLevel,
                        next_shipment: availability.nextShipment
                    },
                    logistics: {
                        lead_time_days: leadTime.days,
                        shipping_cost: leadTime.shippingCost,
                        delivery_date: leadTime.estimatedDelivery
                    }
                });
            }
        }

        // Sort by best overall score (price, availability, lead time)
        supplierData.sort((a, b) => {
            const scoreA = this.calculateSupplierScore(a);
            const scoreB = this.calculateSupplierScore(b);
            return scoreB - scoreA;
        });

        return supplierData;
    }

    /**
     * Check if supplier can supply material to location
     */
    checkSupplierCompatibility(supplier, materialId, projectLocation) {
        // Mock logic - check specialties and shipping zones
        const materialCategory = this.getMaterialCategory(materialId);
        
        if (!supplier.specialties.includes(materialCategory)) {
            return false;
        }

        if (projectLocation) {
            const locationZone = this.getLocationZone(projectLocation);
            if (!supplier.shipping_zones.includes(locationZone)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate pricing from supplier
     */
    calculatePricing(supplier, materialId, quantity) {
        const basePriceMap = {
            'hardwood_oak': 8.50,
            'ceramic_tile_porcelain': 4.25,
            'led_panel_light': 125.00
        };

        const basePrice = basePriceMap[materialId] || 10.00;
        
        // Apply supplier markup
        const supplierMarkup = supplier.reliability_score >= 9.0 ? 1.15 : 1.10;
        const unitPrice = basePrice * supplierMarkup;

        // Volume discount
        let discount = 0;
        if (quantity >= 1000) discount = 0.15;
        else if (quantity >= 500) discount = 0.10;
        else if (quantity >= 100) discount = 0.05;

        const discountedPrice = unitPrice * (1 - discount);
        const totalPrice = discountedPrice * quantity;

        return {
            unitPrice: Math.round(discountedPrice * 100) / 100,
            totalPrice: Math.round(totalPrice * 100) / 100,
            discount: discount * 100,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    /**
     * Check material availability
     */
    checkAvailability(supplier, materialId, quantity) {
        // Mock availability check
        const baseStock = Math.floor(Math.random() * 5000) + 1000;
        const inStock = baseStock >= quantity;
        
        return {
            inStock,
            stockLevel: baseStock,
            nextShipment: inStock ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    /**
     * Calculate lead time and shipping
     */
    calculateLeadTime(supplier, projectLocation, quantity) {
        let baseDays = supplier.lead_time_avg;
        
        // Add time for large quantities
        if (quantity > 1000) baseDays += 3;
        else if (quantity > 500) baseDays += 2;

        // Add shipping time based on location
        const shippingDays = this.calculateShippingTime(supplier.location, projectLocation);
        const totalDays = baseDays + shippingDays;

        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + totalDays);

        const shippingCost = this.calculateShippingCost(quantity, supplier.location, projectLocation);

        return {
            days: totalDays,
            shippingCost,
            estimatedDelivery: estimatedDelivery.toISOString()
        };
    }

    /**
     * Get sustainability data for material
     */
    getSustainabilityData(materialId) {
        const data = this.sustainabilityDatabase.get(materialId);
        
        if (!data) {
            return {
                embodied_carbon: null,
                renewable: null,
                recycled_content: null,
                recyclability: null,
                sustainability_score: 'unknown',
                certifications: []
            };
        }

        // Calculate overall sustainability score
        let score = 0;
        let factors = 0;

        if (data.renewable) {
            score += 20;
            factors++;
        }

        score += (data.recycled_content || 0) * 25;
        factors++;

        score += (data.recyclability || 0) * 20;
        factors++;

        if (data.voc_emissions === 'none') score += 15;
        else if (data.voc_emissions === 'low') score += 10;
        factors++;

        score += (data.durability_years || 0) / 5;
        factors++;

        const sustainabilityScore = Math.min(100, Math.round(score / factors * 10) / 10);

        return {
            ...data,
            sustainability_score: sustainabilityScore,
            rating: this.getSustainabilityRating(sustainabilityScore)
        };
    }

    /**
     * Generate smart recommendations
     */
    generateRecommendations(materialId, supplierData, sustainabilityData) {
        const recommendations = {
            cost_optimization: [],
            sustainability: [],
            availability: [],
            alternatives: []
        };

        // Cost optimization recommendations
        if (supplierData.length > 1) {
            const cheapest = supplierData[0];
            const mostExpensive = supplierData[supplierData.length - 1];
            const savings = mostExpensive.pricing.total_price - cheapest.pricing.total_price;
            
            if (savings > 100) {
                recommendations.cost_optimization.push({
                    type: 'supplier_selection',
                    message: `Save $${savings.toFixed(2)} by choosing ${cheapest.supplier.name}`,
                    impact: 'high'
                });
            }
        }

        // Sustainability recommendations
        if (sustainabilityData.sustainability_score < 70) {
            recommendations.sustainability.push({
                type: 'eco_alternative',
                message: 'Consider more sustainable alternatives with higher recycled content',
                impact: 'medium'
            });
        }

        if (sustainabilityData.certifications.length < 2) {
            recommendations.sustainability.push({
                type: 'certification',
                message: 'Look for materials with LEED or GREENGUARD certifications',
                impact: 'low'
            });
        }

        // Availability recommendations
        const outOfStock = supplierData.filter(s => !s.availability.in_stock);
        if (outOfStock.length > 0) {
            recommendations.availability.push({
                type: 'lead_time',
                message: `${outOfStock.length} supplier(s) are out of stock. Consider ordering early or alternative materials`,
                impact: 'high'
            });
        }

        return recommendations;
    }

    /**
     * Calculate overall supplier score
     */
    calculateSupplierScore(supplierData) {
        let score = 0;
        
        // Price score (lower is better, inverted)
        const priceScore = Math.max(0, 100 - (supplierData.pricing.unit_price * 2));
        score += priceScore * 0.4;

        // Reliability score
        score += supplierData.supplier.reliability_score * 10 * 0.3;

        // Availability score
        const availabilityScore = supplierData.availability.in_stock ? 100 : 50;
        score += availabilityScore * 0.2;

        // Lead time score (lower is better, inverted)
        const leadTimeScore = Math.max(0, 100 - (supplierData.logistics.lead_time_days * 5));
        score += leadTimeScore * 0.1;

        return score;
    }

    /**
     * Helper functions
     */
    getMaterialCategory(materialId) {
        if (materialId.includes('hardwood') || materialId.includes('tile') || materialId.includes('vinyl')) {
            return 'flooring';
        }
        if (materialId.includes('led') || materialId.includes('light')) {
            return 'lighting';
        }
        if (materialId.includes('furniture') || materialId.includes('desk') || materialId.includes('chair')) {
            return 'office_furniture';
        }
        return 'general';
    }

    getLocationZone(location) {
        // Simplified zone mapping
        const zoneMap = {
            'new york': 'northeast',
            'boston': 'northeast',
            'miami': 'southeast',
            'atlanta': 'southeast',
            'chicago': 'midwest',
            'detroit': 'midwest',
            'los angeles': 'west',
            'san francisco': 'west'
        };
        
        const normalized = location.toLowerCase();
        for (const [city, zone] of Object.entries(zoneMap)) {
            if (normalized.includes(city)) {
                return zone;
            }
        }
        
        return 'central';
    }

    calculateShippingTime(supplierLocation, projectLocation) {
        // Mock shipping time calculation
        if (!projectLocation) return 3;
        
        const distance = this.calculateDistance(supplierLocation, projectLocation);
        if (distance < 500) return 1;
        if (distance < 1000) return 2;
        if (distance < 2000) return 3;
        return 5;
    }

    calculateShippingCost(quantity, supplierLocation, projectLocation) {
        const baseCost = 50;
        const perUnitCost = Math.max(0.10, quantity * 0.02);
        const distanceFactor = this.calculateDistance(supplierLocation, projectLocation) / 1000;
        
        return Math.round((baseCost + (quantity * perUnitCost) + (distanceFactor * 25)) * 100) / 100;
    }

    calculateDistance(location1, location2) {
        // Mock distance calculation - in production use real geo APIs
        return Math.floor(Math.random() * 2000) + 100;
    }

    getSustainabilityRating(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Poor';
    }

    isCacheValid(cached) {
        return new Date(cached.expires_at) > new Date();
    }

    /**
     * Search materials with filters
     */
    async searchMaterials(filters = {}) {
        try {
            // Mock search functionality
            const allMaterials = ['hardwood_oak', 'ceramic_tile_porcelain', 'led_panel_light'];
            let results = [];

            for (const materialId of allMaterials) {
                const materialData = await this.getMaterialData(
                    materialId, 
                    filters.location, 
                    filters.quantity || 1
                );
                
                if (materialData.success) {
                    // Apply filters
                    if (this.matchesFilters(materialData.material, filters)) {
                        results.push(materialData.material);
                    }
                }
            }

            // Sort by relevance/score
            results.sort((a, b) => {
                return (b.sustainability?.sustainability_score || 0) - (a.sustainability?.sustainability_score || 0);
            });

            return {
                success: true,
                results,
                count: results.length,
                filters_applied: filters
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    matchesFilters(material, filters) {
        // Category filter
        if (filters.category && material.category !== filters.category) {
            return false;
        }

        // Price range filter
        if (filters.max_price && material.suppliers?.[0]?.pricing?.unit_price > filters.max_price) {
            return false;
        }
        if (filters.min_price && material.suppliers?.[0]?.pricing?.unit_price < filters.min_price) {
            return false;
        }

        // Sustainability filter
        if (filters.min_sustainability && material.sustainability?.sustainability_score < filters.min_sustainability) {
            return false;
        }

        // Availability filter
        if (filters.available_only && !material.suppliers?.[0]?.availability?.in_stock) {
            return false;
        }

        return true;
    }
}

// Cloud-agnostic export
const smartMaterialLibraryService = new SmartMaterialLibraryService();

// Handle smart material library requests
async function handleSmartMaterialRequest(request, url) {
    const headers = {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
    };

    try {
        const path = url.pathname;
        const method = request.method;
        const searchParams = url.searchParams;

        if (path.includes('/materials/search') && method === 'GET') {
            const filters = {
                category: searchParams.get('category'),
                location: searchParams.get('location'),
                quantity: parseInt(searchParams.get('quantity') || '1'),
                max_price: parseFloat(searchParams.get('max_price')),
                min_price: parseFloat(searchParams.get('min_price')),
                min_sustainability: parseInt(searchParams.get('min_sustainability')),
                available_only: searchParams.get('available_only') === 'true'
            };

            const result = await smartMaterialLibraryService.searchMaterials(filters);
            return new Response(JSON.stringify(result), { headers });
        }

        if (path.includes('/materials/') && method === 'GET') {
            const materialId = path.split('/materials/')[1];
            const location = searchParams.get('location');
            const quantity = parseInt(searchParams.get('quantity') || '1');
            
            const result = await smartMaterialLibraryService.getMaterialData(materialId, location, quantity);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 404,
                headers
            });
        }

        return new Response(JSON.stringify({
            error: 'Invalid endpoint',
            available_endpoints: [
                'GET /materials/search - Search materials with filters',
                'GET /materials/:id - Get material data with supplier info'
            ]
        }), { status: 404, headers });

    } catch (error) {
        console.error('Smart material library error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), { status: 500, headers });
    }
}

// Cloudflare Worker format
export default {
    async fetch(request) {
        return handleSmartMaterialRequest(request, new URL(request.url));
    }
};

// Node.js export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SmartMaterialLibraryService,
        smartMaterialLibraryService,
        handleSmartMaterialRequest
    };
}