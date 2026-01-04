/**
 * BIM Digital Twin Service
 * Live Digital Twin Capsules for each project with real-time updates
 * 
 * Features:
 * - Maintains digital twin model for each project
 * - WebSocket broadcasting for real-time updates
 * - Event-driven property change notifications
 * - Multi-view synchronization
 */

class DigitalTwinService {
    constructor() {
        this.projects = new Map();
        this.subscribers = new Map();
        this.eventQueue = [];
        
        console.log('Digital Twin Service initialized');
    }

    /**
     * Create or update a digital twin for a project
     */
    async createOrUpdateTwin(projectId, twinData) {
        try {
            const timestamp = new Date().toISOString();
            
            const existingTwin = this.projects.get(projectId);
            const twin = {
                id: projectId,
                ...twinData,
                lastUpdated: timestamp,
                version: existingTwin ? existingTwin.version + 1 : 1,
                changeHistory: existingTwin ? [...existingTwin.changeHistory] : []
            };

            // Track changes
            if (existingTwin) {
                const changes = this.detectChanges(existingTwin, twin);
                if (changes.length > 0) {
                    twin.changeHistory.push({
                        timestamp,
                        changes,
                        version: twin.version
                    });
                    
                    // Broadcast changes to subscribers
                    await this.broadcastChanges(projectId, changes, twin);
                }
            }

            this.projects.set(projectId, twin);
            
            return {
                success: true,
                twin,
                message: 'Digital twin updated successfully'
            };
            
        } catch (error) {
            console.error('Error updating digital twin:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update digital twin'
            };
        }
    }

    /**
     * Get digital twin data for a project
     */
    getTwin(projectId) {
        const twin = this.projects.get(projectId);
        if (!twin) {
            return {
                success: false,
                message: 'Digital twin not found',
                error: 'PROJECT_NOT_FOUND'
            };
        }

        return {
            success: true,
            twin,
            message: 'Digital twin retrieved successfully'
        };
    }

    /**
     * Subscribe to twin updates via WebSocket-like mechanism
     */
    subscribe(projectId, subscriberId, callback) {
        if (!this.subscribers.has(projectId)) {
            this.subscribers.set(projectId, new Map());
        }
        
        this.subscribers.get(projectId).set(subscriberId, {
            callback,
            subscribedAt: new Date().toISOString()
        });

        return {
            success: true,
            message: 'Subscribed to digital twin updates',
            subscriberId
        };
    }

    /**
     * Unsubscribe from twin updates
     */
    unsubscribe(projectId, subscriberId) {
        const projectSubscribers = this.subscribers.get(projectId);
        if (projectSubscribers) {
            projectSubscribers.delete(subscriberId);
            if (projectSubscribers.size === 0) {
                this.subscribers.delete(projectId);
            }
        }

        return {
            success: true,
            message: 'Unsubscribed from digital twin updates'
        };
    }

    /**
     * Detect changes between old and new twin data
     */
    detectChanges(oldTwin, newTwin) {
        const changes = [];
        
        // Check for property changes
        const properties = ['finishes', 'materials', 'dimensions', 'spaces', 'fixtures'];
        
        for (const prop of properties) {
            if (JSON.stringify(oldTwin[prop]) !== JSON.stringify(newTwin[prop])) {
                changes.push({
                    type: 'property_change',
                    property: prop,
                    oldValue: oldTwin[prop],
                    newValue: newTwin[prop],
                    timestamp: new Date().toISOString()
                });
            }
        }

        return changes;
    }

    /**
     * Broadcast changes to all subscribers
     */
    async broadcastChanges(projectId, changes, twin) {
        const projectSubscribers = this.subscribers.get(projectId);
        if (!projectSubscribers) return;

        const updateMessage = {
            type: 'twin_update',
            projectId,
            changes,
            twin: {
                id: twin.id,
                version: twin.version,
                lastUpdated: twin.lastUpdated
            },
            timestamp: new Date().toISOString()
        };

        // Simulate WebSocket broadcasting
        for (const [subscriberId, subscriber] of projectSubscribers) {
            try {
                if (typeof subscriber.callback === 'function') {
                    await subscriber.callback(updateMessage);
                }
            } catch (error) {
                console.error(`Error broadcasting to subscriber ${subscriberId}:`, error);
            }
        }

        // Add to event queue for persistence
        this.eventQueue.push(updateMessage);
        
        // Keep only last 100 events per project
        this.eventQueue = this.eventQueue.slice(-100);
    }

    /**
     * Get recent events for a project
     */
    getRecentEvents(projectId, limit = 10) {
        const projectEvents = this.eventQueue
            .filter(event => event.projectId === projectId)
            .slice(-limit);

        return {
            success: true,
            events: projectEvents,
            count: projectEvents.length
        };
    }

    /**
     * Update specific property of a twin
     */
    async updateTwinProperty(projectId, propertyPath, newValue) {
        const twin = this.projects.get(projectId);
        if (!twin) {
            return {
                success: false,
                error: 'Digital twin not found'
            };
        }

        // Validate property path to prevent injection attacks
        if (typeof propertyPath !== 'string' || propertyPath.includes('__proto__') || 
            propertyPath.includes('constructor') || propertyPath.includes('prototype')) {
            return {
                success: false,
                error: 'Invalid property path'
            };
        }

        try {
            // Deep clone to avoid mutation
            const updatedTwin = JSON.parse(JSON.stringify(twin));
            
            // Update the property using safe dot notation
            this.setNestedProperty(updatedTwin, propertyPath, newValue);
            
            // Update the twin
            return await this.createOrUpdateTwin(projectId, updatedTwin);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Helper function to set nested properties safely (prevents prototype pollution)
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            // Prevent prototype pollution by checking for dangerous keys
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                throw new Error(`Dangerous property access attempted: ${key}`);
            }
            
            if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        const finalKey = keys[keys.length - 1];
        
        // Prevent prototype pollution on the final key as well
        if (finalKey === '__proto__' || finalKey === 'constructor' || finalKey === 'prototype') {
            throw new Error(`Dangerous property access attempted: ${finalKey}`);
        }
        
        current[finalKey] = value;
    }
}

// Cloud-agnostic export
const digitalTwinService = new DigitalTwinService();

// Handle digital twin requests
async function handleDigitalTwinRequest(request, url) {
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

        if (path.includes('/twin') && method === 'GET') {
            const result = digitalTwinService.getTwin(projectId);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 404,
                headers
            });
        }

        if (path.includes('/twin') && method === 'POST') {
            const twinData = await request.json();
            const result = await digitalTwinService.createOrUpdateTwin(projectId, twinData);
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 500,
                headers
            });
        }

        if (path.includes('/twin') && method === 'PUT') {
            const updateData = await request.json();
            const result = await digitalTwinService.updateTwinProperty(
                projectId,
                updateData.propertyPath,
                updateData.value
            );
            return new Response(JSON.stringify(result), {
                status: result.success ? 200 : 500,
                headers
            });
        }

        if (path.includes('/events') && method === 'GET') {
            const limit = parseInt(url.searchParams.get('limit') || '10');
            const result = digitalTwinService.getRecentEvents(projectId, limit);
            return new Response(JSON.stringify(result), { headers });
        }

        return new Response(JSON.stringify({
            error: 'Invalid endpoint',
            available_endpoints: [
                'GET /projects/:id/twin - Get digital twin',
                'POST /projects/:id/twin - Create/update digital twin',
                'PUT /projects/:id/twin - Update twin property',
                'GET /projects/:id/events - Get recent events'
            ]
        }), { status: 404, headers });

    } catch (error) {
        console.error('Digital twin error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), { status: 500, headers });
    }
}

// Cloudflare Worker format
export default {
    async fetch(request) {
        return handleDigitalTwinRequest(request, new URL(request.url));
    }
};

// Node.js export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DigitalTwinService,
        digitalTwinService,
        handleDigitalTwinRequest
    };
}