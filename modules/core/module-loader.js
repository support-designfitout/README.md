/**
 * Designfitout.com - Core Module Loader
 * Manages modular architecture and dependency injection
 */

class ModuleLoader {
    constructor() {
        this.modules = new Map();
        this.dependencies = new Map();
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        
        this.init();
    }

    init() {
        console.log('🔧 ModuleLoader initialized');
        this.setupGlobalAPI();
    }

    /**
     * Setup global API for module registration
     */
    setupGlobalAPI() {
        window.ModuleSystem = {
            register: this.register.bind(this),
            load: this.load.bind(this),
            unload: this.unload.bind(this),
            getDependencies: this.getDependencies.bind(this),
            getLoadedModules: () => Array.from(this.loadedModules)
        };
    }

    /**
     * Register a module with its dependencies
     * @param {string} name - Module name
     * @param {Function} factory - Module factory function
     * @param {Array} deps - Module dependencies
     */
    register(name, factory, deps = []) {
        if (this.modules.has(name)) {
            console.warn(`⚠️ Module ${name} is already registered`);
            return;
        }

        this.modules.set(name, {
            name,
            factory,
            dependencies: deps,
            instance: null,
            loaded: false
        });

        this.dependencies.set(name, deps);
        
        console.log(`📦 Module ${name} registered with dependencies: [${deps.join(', ')}]`);
    }

    /**
     * Load a module and its dependencies
     * @param {string} name - Module name
     * @returns {Promise} Module instance
     */
    async load(name) {
        // Return existing loading promise if already loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        // Return cached instance if already loaded
        if (this.loadedModules.has(name)) {
            return this.modules.get(name)?.instance;
        }

        const loadPromise = this._loadModule(name);
        this.loadingPromises.set(name, loadPromise);
        
        try {
            const instance = await loadPromise;
            this.loadingPromises.delete(name);
            return instance;
        } catch (error) {
            this.loadingPromises.delete(name);
            throw error;
        }
    }

    /**
     * Internal module loading logic
     * @private
     */
    async _loadModule(name) {
        const moduleData = this.modules.get(name);
        
        if (!moduleData) {
            throw new Error(`Module ${name} not found. Available modules: ${Array.from(this.modules.keys()).join(', ')}`);
        }

        if (moduleData.loaded) {
            return moduleData.instance;
        }

        console.log(`🚀 Loading module: ${name}`);

        // Load dependencies first
        const depInstances = [];
        for (const depName of moduleData.dependencies) {
            try {
                const depInstance = await this.load(depName);
                depInstances.push(depInstance);
            } catch (error) {
                throw new Error(`Failed to load dependency ${depName} for module ${name}: ${error.message}`);
            }
        }

        // Create module instance
        try {
            const instance = await moduleData.factory(...depInstances);
            
            moduleData.instance = instance;
            moduleData.loaded = true;
            this.loadedModules.add(name);
            
            // Emit module loaded event
            this._emitModuleEvent('moduleLoaded', { name, instance });
            
            console.log(`✅ Module ${name} loaded successfully`);
            return instance;
            
        } catch (error) {
            console.error(`❌ Failed to load module ${name}:`, error);
            throw new Error(`Module ${name} initialization failed: ${error.message}`);
        }
    }

    /**
     * Unload a module
     * @param {string} name - Module name
     */
    unload(name) {
        const moduleData = this.modules.get(name);
        
        if (!moduleData || !moduleData.loaded) {
            console.warn(`⚠️ Module ${name} is not loaded`);
            return;
        }

        // Check if other modules depend on this one
        const dependents = this._findDependents(name);
        if (dependents.length > 0) {
            throw new Error(`Cannot unload module ${name}. Dependent modules: ${dependents.join(', ')}`);
        }

        // Call cleanup if available
        if (moduleData.instance && typeof moduleData.instance.cleanup === 'function') {
            try {
                moduleData.instance.cleanup();
            } catch (error) {
                console.error(`Warning: Error during ${name} cleanup:`, error);
            }
        }

        moduleData.instance = null;
        moduleData.loaded = false;
        this.loadedModules.delete(name);
        
        this._emitModuleEvent('moduleUnloaded', { name });
        
        console.log(`🗑️ Module ${name} unloaded`);
    }

    /**
     * Find modules that depend on a given module
     * @private
     */
    _findDependents(targetModule) {
        const dependents = [];
        
        for (const [moduleName, deps] of this.dependencies) {
            if (deps.includes(targetModule) && this.loadedModules.has(moduleName)) {
                dependents.push(moduleName);
            }
        }
        
        return dependents;
    }

    /**
     * Get module dependencies
     */
    getDependencies(name) {
        return this.dependencies.get(name) || [];
    }

    /**
     * Emit module system events
     * @private
     */
    _emitModuleEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Load multiple modules in parallel
     * @param {Array} moduleNames - Array of module names
     * @returns {Promise<Array>} Array of module instances
     */
    async loadMultiple(moduleNames) {
        try {
            const promises = moduleNames.map(name => this.load(name));
            return await Promise.all(promises);
        } catch (error) {
            console.error('Failed to load modules:', error);
            throw error;
        }
    }

    /**
     * Check module health and status
     */
    getModuleStatus() {
        const status = {
            total: this.modules.size,
            loaded: this.loadedModules.size,
            modules: {}
        };

        for (const [name, moduleData] of this.modules) {
            status.modules[name] = {
                loaded: moduleData.loaded,
                dependencies: moduleData.dependencies,
                hasInstance: !!moduleData.instance
            };
        }

        return status;
    }

    /**
     * Cleanup all modules
     */
    cleanup() {
        const moduleNames = Array.from(this.loadedModules);
        
        // Unload in reverse dependency order
        const sortedModules = this._topologicalSort(moduleNames);
        
        for (const moduleName of sortedModules.reverse()) {
            try {
                this.unload(moduleName);
            } catch (error) {
                console.error(`Error unloading ${moduleName}:`, error);
            }
        }
        
        console.log('🧹 ModuleLoader cleanup completed');
    }

    /**
     * Topological sort for dependency resolution
     * @private
     */
    _topologicalSort(moduleNames) {
        const visited = new Set();
        const result = [];
        
        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);
            
            const deps = this.getDependencies(name);
            for (const dep of deps) {
                if (moduleNames.includes(dep)) {
                    visit(dep);
                }
            }
            
            result.push(name);
        };
        
        for (const name of moduleNames) {
            visit(name);
        }
        
        return result;
    }
}

// Initialize global module loader
window.moduleLoader = new ModuleLoader();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}