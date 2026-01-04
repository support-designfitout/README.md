/**
 * BIM Clash Detection Service
 * Proactive clash detection microservice for MEP, structural, and furniture layers
 * 
 * Features:
 * - Automated clash detection between building systems
 * - Real-time monitoring of model updates
 * - Integration with digital twin service
 * - Warning system for project dashboard
 */

class ClashDetectionService {
    constructor() {
        this.clashRules = new Map();
        this.detectedClashes = new Map();
        this.tolerances = this.getDefaultTolerances();
        
        this.initializeClashRules();
        console.log('Clash Detection Service initialized');
    }

    getDefaultTolerances() {
        return {
            mep_structural: 6, // inches
            mep_furniture: 3, // inches
            structural_furniture: 2, // inches
            mep_mep: 1, // inches
            clearance_minimum: 18, // inches for access
            fire_safety_clearance: 36 // inches
        };
    }

    initializeClashRules() {
        // MEP vs Structural clashes
        this.clashRules.set('mep_structural', {
            priority: 'critical',
            description: 'MEP systems conflicting with structural elements',
            tolerance: this.tolerances.mep_structural,
            autoResolve: false,
            requiredAction: 'coordinate_routing'
        });

        // MEP vs Furniture clashes  
        this.clashRules.set('mep_furniture', {
            priority: 'high',
            description: 'MEP systems conflicting with furniture placement',
            tolerance: this.tolerances.mep_furniture,
            autoResolve: true,
            requiredAction: 'relocate_furniture'
        });

        // Structural vs Furniture clashes
        this.clashRules.set('structural_furniture', {
            priority: 'medium',
            description: 'Furniture conflicting with structural elements',
            tolerance: this.tolerances.structural_furniture,
            autoResolve: true,
            requiredAction: 'relocate_furniture'
        });

        // MEP system internal clashes
        this.clashRules.set('mep_internal', {
            priority: 'high',
            description: 'Conflicts between different MEP systems',
            tolerance: this.tolerances.mep_mep,
            autoResolve: false,
            requiredAction: 'coordinate_systems'
        });

        // Fire safety clearance violations
        this.clashRules.set('fire_safety', {
            priority: 'critical',
            description: 'Fire safety clearance violations',
            tolerance: this.tolerances.fire_safety_clearance,
            autoResolve: false,
            requiredAction: 'ensure_clearance'
        });
    }

    /**
     * Run clash detection on project model
     */
    async detectClashes(projectId, modelData) {
        try {
            const timestamp = new Date().toISOString();
            const clashes = [];

            if (!modelData || !modelData.layers) {
                return {
                    success: false,
                    error: 'Invalid model data - layers required',
                    clashes: []
                };
            }

            const { layers } = modelData;
            
            // Extract layer data
            const mepLayer = layers.mep || { elements: [] };
            const structuralLayer = layers.structural || { elements: [] };
            const furnitureLayer = layers.furniture || { elements: [] };

            // Detect MEP vs Structural clashes
            const mepStructuralClashes = this.detectLayerClashes(
                mepLayer.elements,
                structuralLayer.elements,
                'mep_structural'
            );
            clashes.push(...mepStructuralClashes);

            // Detect MEP vs Furniture clashes
            const mepFurnitureClashes = this.detectLayerClashes(
                mepLayer.elements,
                furnitureLayer.elements,
                'mep_furniture'
            );
            clashes.push(...mepFurnitureClashes);

            // Detect Structural vs Furniture clashes
            const structuralFurnitureClashes = this.detectLayerClashes(
                structuralLayer.elements,
                furnitureLayer.elements,
                'structural_furniture'
            );
            clashes.push(...structuralFurnitureClashes);

            // Detect internal MEP clashes
            const mepInternalClashes = this.detectInternalLayerClashes(
                mepLayer.elements,
                'mep_internal'
            );
            clashes.push(...mepInternalClashes);

            // Detect fire safety clearance violations
            const fireSafetyClashes = this.detectFireSafetyClashes(
                layers,
                'fire_safety'
            );
            clashes.push(...fireSafetyClashes);

            // Store detected clashes
            const clashReport = {
                projectId,
                timestamp,
                totalClashes: clashes.length,
                clashes,
                summary: this.generateClashSummary(clashes)
            };

            this.detectedClashes.set(projectId, clashReport);

            return {
                success: true,
                clashReport,
                hasClashes: clashes.length > 0,
                message: `Clash detection completed. Found ${clashes.length} potential conflicts.`
            };

        } catch (error) {
            console.error('Clash detection error:', error);
            return {
                success: false,
                error: error.message,
                clashes: []
            };
        }
    }

    /**
     * Detect clashes between two layers
     */
    detectLayerClashes(layer1Elements, layer2Elements, clashType) {
        const clashes = [];
        const rule = this.clashRules.get(clashType);
        
        if (!rule) return clashes;

        for (const element1 of layer1Elements) {
            for (const element2 of layer2Elements) {
                const collision = this.checkElementCollision(element1, element2, rule.tolerance);
                
                if (collision.hasClash) {
                    clashes.push({
                        id: `clash_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                        type: clashType,
                        priority: rule.priority,
                        description: rule.description,
                        element1: {
                            id: element1.id,
                            type: element1.type,
                            location: element1.location
                        },
                        element2: {
                            id: element2.id,
                            type: element2.type,
                            location: element2.location
                        },
                        collision,
                        resolution: {
                            autoResolve: rule.autoResolve,
                            requiredAction: rule.requiredAction,
                            suggestions: this.generateResolutionSuggestions(clashType, element1, element2)
                        },
                        detectedAt: new Date().toISOString()
                    });
                }
            }
        }

        return clashes;
    }

    /**
     * Detect clashes within a single layer
     */
    detectInternalLayerClashes(layerElements, clashType) {
        const clashes = [];
        const rule = this.clashRules.get(clashType);
        
        if (!rule) return clashes;

        for (let i = 0; i < layerElements.length; i++) {
            for (let j = i + 1; j < layerElements.length; j++) {
                const element1 = layerElements[i];
                const element2 = layerElements[j];
                
                const collision = this.checkElementCollision(element1, element2, rule.tolerance);
                
                if (collision.hasClash) {
                    clashes.push({
                        id: `clash_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                        type: clashType,
                        priority: rule.priority,
                        description: rule.description,
                        element1: {
                            id: element1.id,
                            type: element1.type,
                            location: element1.location
                        },
                        element2: {
                            id: element2.id,
                            type: element2.type,
                            location: element2.location
                        },
                        collision,
                        resolution: {
                            autoResolve: rule.autoResolve,
                            requiredAction: rule.requiredAction,
                            suggestions: this.generateResolutionSuggestions(clashType, element1, element2)
                        },
                        detectedAt: new Date().toISOString()
                    });
                }
            }
        }

        return clashes;
    }

    /**
     * Detect fire safety clearance violations
     */
    detectFireSafetyClashes(layers, clashType) {
        const clashes = [];
        const rule = this.clashRules.get(clashType);
        
        if (!rule) return clashes;

        // Check fire exits, sprinkler coverage, etc.
        const fireSafetyElements = this.extractFireSafetyElements(layers);
        
        for (const safetyElement of fireSafetyElements) {
            const violations = this.checkFireSafetyViolations(safetyElement, layers, rule.tolerance);
            
            for (const violation of violations) {
                clashes.push({
                    id: `clash_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                    type: clashType,
                    priority: rule.priority,
                    description: `${rule.description}: ${violation.description}`,
                    element1: safetyElement,
                    element2: violation.obstructingElement,
                    collision: violation.details,
                    resolution: {
                        autoResolve: rule.autoResolve,
                        requiredAction: rule.requiredAction,
                        suggestions: [`Remove obstruction within ${rule.tolerance}" of ${safetyElement.type}`]
                    },
                    detectedAt: new Date().toISOString()
                });
            }
        }

        return clashes;
    }

    /**
     * Check collision between two elements
     */
    checkElementCollision(element1, element2, tolerance) {
        // Simplified 3D collision detection
        const loc1 = element1.location || { x: 0, y: 0, z: 0 };
        const loc2 = element2.location || { x: 0, y: 0, z: 0 };
        const size1 = element1.dimensions || { width: 12, height: 12, depth: 12 };
        const size2 = element2.dimensions || { width: 12, height: 12, depth: 12 };

        // Calculate bounding boxes with tolerance
        const box1 = {
            minX: loc1.x - size1.width / 2 - tolerance,
            maxX: loc1.x + size1.width / 2 + tolerance,
            minY: loc1.y - size1.height / 2 - tolerance,
            maxY: loc1.y + size1.height / 2 + tolerance,
            minZ: loc1.z - size1.depth / 2 - tolerance,
            maxZ: loc1.z + size1.depth / 2 + tolerance
        };

        const box2 = {
            minX: loc2.x - size2.width / 2,
            maxX: loc2.x + size2.width / 2,
            minY: loc2.y - size2.height / 2,
            maxY: loc2.y + size2.height / 2,
            minZ: loc2.z - size2.depth / 2,
            maxZ: loc2.z + size2.depth / 2
        };

        // Check for intersection
        const hasClash = !(
            box1.maxX < box2.minX || box2.maxX < box1.minX ||
            box1.maxY < box2.minY || box2.maxY < box1.minY ||
            box1.maxZ < box2.minZ || box2.maxZ < box1.minZ
        );

        const distance = Math.sqrt(
            Math.pow(loc1.x - loc2.x, 2) +
            Math.pow(loc1.y - loc2.y, 2) +
            Math.pow(loc1.z - loc2.z, 2)
        );

        return {
            hasClash,
            distance,
            tolerance,
            severity: hasClash ? (distance < tolerance / 2 ? 'severe' : 'moderate') : 'none'
        };
    }

    /**
     * Extract fire safety elements from layers
     */
    extractFireSafetyElements(layers) {
        const fireSafetyElements = [];
        
        // Check all layers for fire safety elements
        for (const [layerName, layer] of Object.entries(layers)) {
            if (layer.elements) {
                for (const element of layer.elements) {
                    if (this.isFireSafetyElement(element)) {
                        fireSafetyElements.push({
                            ...element,
                            layer: layerName
                        });
                    }
                }
            }
        }

        return fireSafetyElements;
    }

    /**
     * Check if element is fire safety related
     */
    isFireSafetyElement(element) {
        const fireSafetyTypes = [
            'fire_exit', 'emergency_exit', 'fire_extinguisher', 
            'sprinkler_head', 'smoke_detector', 'fire_alarm_panel',
            'exit_sign', 'emergency_lighting'
        ];
        
        return fireSafetyTypes.includes(element.type) || 
               (element.tags && element.tags.includes('fire_safety'));
    }

    /**
     * Check fire safety violations for a specific element
     */
    checkFireSafetyViolations(safetyElement, layers, tolerance) {
        const violations = [];
        
        // Check all other elements for clearance violations
        for (const [layerName, layer] of Object.entries(layers)) {
            if (layer.elements) {
                for (const element of layer.elements) {
                    if (element.id !== safetyElement.id) {
                        const collision = this.checkElementCollision(safetyElement, element, tolerance);
                        
                        if (collision.hasClash) {
                            violations.push({
                                description: `${element.type} too close to ${safetyElement.type}`,
                                obstructingElement: element,
                                details: collision
                            });
                        }
                    }
                }
            }
        }

        return violations;
    }

    /**
     * Generate resolution suggestions for clashes
     */
    generateResolutionSuggestions(clashType, element1, element2) {
        const suggestions = [];
        
        switch (clashType) {
            case 'mep_structural':
                suggestions.push(
                    'Reroute MEP systems around structural elements',
                    'Coordinate with structural engineer for penetrations',
                    'Use flexible connections at structural interfaces'
                );
                break;
                
            case 'mep_furniture':
                suggestions.push(
                    'Relocate furniture to avoid MEP conflicts',
                    'Adjust furniture height to clear overhead systems',
                    'Use under-floor or overhead routing for MEP'
                );
                break;
                
            case 'structural_furniture':
                suggestions.push(
                    'Relocate furniture away from structural elements',
                    'Design custom furniture to fit around columns/beams',
                    'Use furniture that can accommodate structural elements'
                );
                break;
                
            case 'mep_internal':
                suggestions.push(
                    'Separate conflicting MEP systems vertically',
                    'Use different routing paths for each system',
                    'Install proper supports and clearances'
                );
                break;
                
            case 'fire_safety':
                suggestions.push(
                    'Remove obstructions from fire safety clearances',
                    'Relocate elements to maintain required clearances',
                    'Consult fire safety engineer for alternatives'
                );
                break;
                
            default:
                suggestions.push('Review element placement and coordination');
        }
        
        return suggestions;
    }

    /**
     * Generate clash summary
     */
    generateClashSummary(clashes) {
        const summary = {
            total: clashes.length,
            byPriority: {},
            byType: {},
            autoResolvable: 0
        };

        for (const clash of clashes) {
            // Count by priority
            summary.byPriority[clash.priority] = (summary.byPriority[clash.priority] || 0) + 1;
            
            // Count by type
            summary.byType[clash.type] = (summary.byType[clash.type] || 0) + 1;
            
            // Count auto-resolvable
            if (clash.resolution.autoResolve) {
                summary.autoResolvable++;
            }
        }

        return summary;
    }

    /**
     * Get clash report for a project
     */
    getClashReport(projectId) {
        const report = this.detectedClashes.get(projectId);
        
        if (!report) {
            return {
                success: false,
                message: 'No clash report found for project',
                error: 'REPORT_NOT_FOUND'
            };
        }

        return {
            success: true,
            report,
            message: 'Clash report retrieved successfully'
        };
    }

    /**
     * Resolve a specific clash
     */
    async resolveClash(projectId, clashId, resolution) {
        const report = this.detectedClashes.get(projectId);
        
        if (!report) {
            return {
                success: false,
                error: 'Clash report not found'
            };
        }

        const clashIndex = report.clashes.findIndex(c => c.id === clashId);
        
        if (clashIndex === -1) {
            return {
                success: false,
                error: 'Clash not found'
            };
        }

        // Update clash with resolution
        report.clashes[clashIndex].resolution = {
            ...report.clashes[clashIndex].resolution,
            ...resolution,
            resolvedAt: new Date().toISOString(),
            status: 'resolved'
        };

        return {
            success: true,
            message: 'Clash resolved successfully',
            clash: report.clashes[clashIndex]
        };
    }
}

// Cloud-agnostic export
const clashDetectionService = new ClashDetectionService();

// Handle clash detection requests
async function handleClashDetectionRequest(request, url) {
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

        if (path.includes('/clash-detection') && method === 'POST') {
            const modelData = await request.json();
            const result = await clashDetectionService.detectClashes(projectId, modelData);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 500,
                headers
            });
        }

        if (path.includes('/clash-report') && method === 'GET') {
            const result = clashDetectionService.getClashReport(projectId);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 404,
                headers
            });
        }

        if (path.includes('/resolve-clash') && method === 'PUT') {
            const { clashId, resolution } = await request.json();
            const result = await clashDetectionService.resolveClash(projectId, clashId, resolution);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 404,
                headers
            });
        }

        return new Response(JSON.stringify({
            error: 'Invalid endpoint',
            available_endpoints: [
                'POST /projects/:id/clash-detection - Run clash detection',
                'GET /projects/:id/clash-report - Get clash report',
                'PUT /projects/:id/resolve-clash - Resolve specific clash'
            ]
        }), { status: 404, headers });

    } catch (error) {
        console.error('Clash detection error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), { status: 500, headers });
    }
}

// Cloudflare Worker format
export default {
    async fetch(request) {
        return handleClashDetectionRequest(request, new URL(request.url));
    }
};

// Node.js export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ClashDetectionService,
        clashDetectionService,
        handleClashDetectionRequest
    };
}