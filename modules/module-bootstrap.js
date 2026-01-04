/**
 * Designfitout.com - Module Bootstrap System
 * Initializes and manages all application modules
 */

class ModuleBootstrap {
    constructor() {
        this.config = null;
        this.loadOrder = [];
        this.loadedModules = new Map();
        this.initializationPromise = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 ModuleBootstrap initializing...');
        
        try {
            await this.loadConfiguration();
            await this.loadCoreModules();
            await this.initializeModules();
            
            console.log('✅ ModuleBootstrap initialization complete');
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('❌ ModuleBootstrap initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load module configuration
     */
    async loadConfiguration() {
        try {
            const response = await fetch('modules/module-config.json');
            if (!response.ok) {
                throw new Error(`Failed to load configuration: ${response.status}`);
            }
            
            this.config = await response.json();
            console.log('📋 Module configuration loaded');
            
            // Set global configuration
            window.moduleConfig = this.config;
            
        } catch (error) {
            console.error('Failed to load module configuration:', error);
            // Fallback to default configuration
            this.config = this.getDefaultConfiguration();
        }
    }

    /**
     * Get default configuration as fallback
     */
    getDefaultConfiguration() {
        return {
            modules: {
                core: {
                    moduleLoader: {
                        path: 'modules/core/module-loader.js',
                        priority: 1,
                        autoLoad: true,
                        dependencies: []
                    }
                }
            },
            globalConfig: {
                debugging: { enabled: true },
                performance: { preloadModules: true },
                features: { deepLearning: true }
            }
        };
    }

    /**
     * Load core modules first
     */
    async loadCoreModules() {
        const coreModules = this.config.modules.core || {};
        
        for (const [name, config] of Object.entries(coreModules)) {
            if (config.autoLoad) {
                await this.loadScript(config.path);
                console.log(`✅ Core module ${name} loaded`);
            }
        }
    }

    /**
     * Initialize all modules in priority order
     */
    async initializeModules() {
        // Collect all modules and sort by priority
        const allModules = [];
        
        Object.entries(this.config.modules).forEach(([category, modules]) => {
            Object.entries(modules).forEach(([name, config]) => {
                if (config.autoLoad) {
                    allModules.push({
                        name,
                        category,
                        config,
                        fullName: `${category}.${name}`
                    });
                }
            });
        });
        
        // Sort by priority (lower number = higher priority)
        allModules.sort((a, b) => (a.config.priority || 99) - (b.config.priority || 99));
        
        // Load modules in order
        for (const module of allModules) {
            try {
                await this.loadModule(module);
            } catch (error) {
                console.error(`Failed to load module ${module.fullName}:`, error);
                
                // Continue loading other modules even if one fails
                if (!module.config.critical) {
                    continue;
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Load individual module
     */
    async loadModule(moduleData) {
        const { name, category, config } = moduleData;
        
        // Skip if already loaded
        if (this.loadedModules.has(name)) {
            return this.loadedModules.get(name);
        }
        
        console.log(`🔄 Loading module: ${name} (${category})`);
        
        // Load script if not already loaded
        if (config.path && !document.querySelector(`script[src="${config.path}"]`)) {
            await this.loadScript(config.path);
        }
        
        // Wait for module system to be available
        await this.waitForModuleSystem();
        
        // Load module dependencies first
        if (config.dependencies && config.dependencies.length > 0) {
            for (const depName of config.dependencies) {
                if (!this.loadedModules.has(depName)) {
                    // Find and load dependency
                    const dep = this.findModuleByName(depName);
                    if (dep) {
                        await this.loadModule(dep);
                    }
                }
            }
        }
        
        // Load the module instance
        let moduleInstance;
        if (window.ModuleSystem) {
            moduleInstance = await window.ModuleSystem.load(name);
        } else {
            // Fallback: try to instantiate directly
            const ModuleClass = window[this.capitalize(name)];
            if (ModuleClass) {
                moduleInstance = new ModuleClass(config.config);
            }
        }
        
        if (moduleInstance) {
            this.loadedModules.set(name, moduleInstance);
            console.log(`✅ Module ${name} loaded successfully`);
            
            // Apply module configuration if provided
            if (config.config && typeof moduleInstance.updateConfig === 'function') {
                moduleInstance.updateConfig(config.config);
            }
            
            return moduleInstance;
        } else {
            throw new Error(`Failed to instantiate module: ${name}`);
        }
    }

    /**
     * Find module configuration by name
     */
    findModuleByName(name) {
        for (const [category, modules] of Object.entries(this.config.modules)) {
            if (modules[name]) {
                return {
                    name,
                    category,
                    config: modules[name],
                    fullName: `${category}.${name}`
                };
            }
        }
        return null;
    }

    /**
     * Wait for module system to be available
     */
    async waitForModuleSystem(timeout = 5000) {
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const interval = 100;
            
            const check = () => {
                if (window.ModuleSystem) {
                    resolve();
                } else if (elapsed >= timeout) {
                    reject(new Error('ModuleSystem not available'));
                } else {
                    elapsed += interval;
                    setTimeout(check, interval);
                }
            };
            
            check();
        });
    }

    /**
     * Load external script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                console.log(`📜 Script loaded: ${src}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Capitalize string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Dispatch ready event
     */
    dispatchReadyEvent() {
        const event = new CustomEvent('modulesReady', {
            detail: {
                loadedModules: Array.from(this.loadedModules.keys()),
                config: this.config,
                bootstrap: this
            }
        });
        
        document.dispatchEvent(event);
        console.log('🎉 All modules ready - modulesReady event dispatched');
    }

    /**
     * Get loaded module instance
     */
    getModule(name) {
        return this.loadedModules.get(name);
    }

    /**
     * Get all loaded modules
     */
    getAllModules() {
        return Object.fromEntries(this.loadedModules);
    }

    /**
     * Unload all modules
     */
    cleanup() {
        console.log('🧹 ModuleBootstrap cleanup starting...');
        
        // Cleanup modules in reverse order
        const moduleNames = Array.from(this.loadedModules.keys()).reverse();
        
        moduleNames.forEach(name => {
            try {
                const module = this.loadedModules.get(name);
                if (module && typeof module.cleanup === 'function') {
                    module.cleanup();
                }
            } catch (error) {
                console.error(`Error cleaning up module ${name}:`, error);
            }
        });
        
        this.loadedModules.clear();
        
        if (window.moduleLoader && typeof window.moduleLoader.cleanup === 'function') {
            window.moduleLoader.cleanup();
        }
        
        console.log('🧹 ModuleBootstrap cleanup completed');
    }

    /**
     * Get system status
     */
    getStatus() {
        const moduleStats = {};
        
        this.loadedModules.forEach((instance, name) => {
            moduleStats[name] = {
                loaded: true,
                hasCleanup: typeof instance.cleanup === 'function',
                hasConfig: typeof instance.updateConfig === 'function'
            };
        });
        
        return {
            configLoaded: !!this.config,
            totalModules: this.loadedModules.size,
            modules: moduleStats,
            systemReady: this.loadedModules.size > 0
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moduleBootstrap = new ModuleBootstrap();
    });
} else {
    // DOM already loaded
    window.moduleBootstrap = new ModuleBootstrap();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.moduleBootstrap) {
        window.moduleBootstrap.cleanup();
    }
});

// Export for external use
window.ModuleBootstrap = ModuleBootstrap;