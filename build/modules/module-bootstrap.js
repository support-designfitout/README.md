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
        
        try {
            await this.loadConfiguration();
            await this.loadCoreModules();
            await this.initializeModules();
            
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
            
            window.moduleConfig = this.config;
            
        } catch (error) {
            console.error('Failed to load module configuration:', error);
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
            }
        }
    }

    /**
     * Initialize all modules in priority order
     */
    async initializeModules() {
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
        
        allModules.sort((a, b) => (a.config.priority || 99) - (b.config.priority || 99));
        
        for (const module of allModules) {
            try {
                await this.loadModule(module);
            } catch (error) {
                console.error(`Failed to load module ${module.fullName}:`, error);
                
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
        
        if (this.loadedModules.has(name)) {
            return this.loadedModules.get(name);
        }
        
        
        if (config.path && !document.querySelector(`script[src="${config.path}"]`)) {
            await this.loadScript(config.path);
        }
        
        await this.waitForModuleSystem();
        
        if (config.dependencies && config.dependencies.length > 0) {
            for (const depName of config.dependencies) {
                if (!this.loadedModules.has(depName)) {
                    const dep = this.findModuleByName(depName);
                    if (dep) {
                        await this.loadModule(dep);
                    }
                }
            }
        }
        
        let moduleInstance;
        if (window.ModuleSystem) {
            moduleInstance = await window.ModuleSystem.load(name);
        } else {
            const ModuleClass = window[this.capitalize(name)];
            if (ModuleClass) {
                moduleInstance = new ModuleClass(config.config);
            }
        }
        
        if (moduleInstance) {
            this.loadedModules.set(name, moduleInstance);
            
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
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moduleBootstrap = new ModuleBootstrap();
    });
} else {
    window.moduleBootstrap = new ModuleBootstrap();
}

window.addEventListener('beforeunload', () => {
    if (window.moduleBootstrap) {
        window.moduleBootstrap.cleanup();
    }
});

window.ModuleBootstrap = ModuleBootstrap;