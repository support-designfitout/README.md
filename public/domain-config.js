/**
 * Unified Domain Configuration System
 * Supports dual domains: fitoutlab.app and designfitout.com
 * 
 * This script dynamically configures the application based on the current domain,
 * while maintaining a single codebase and preserving brand neutrality.
 */

class DomainConfig {
    constructor() {
        this.currentDomain = this.detectDomain();
        this.config = this.loadConfiguration();
        this.initializeDomainSpecificSettings();
    }

    /**
     * Detect current domain from hostname
     */
    detectDomain() {
        const hostname = window.location.hostname.toLowerCase();
        
        // Handle different domain patterns
        if (hostname.includes('fitoutlab.app') || hostname.includes('fitoutlab')) {
            return 'fitoutlab';
        } else if (hostname.includes('designfitout.com') || hostname.includes('designfitout')) {
            return 'designfitout';
        } else {
            // Default to primary domain for local development
            return 'fitoutlab';
        }
    }

    /**
     * Load domain-specific configuration
     */
    loadConfiguration() {
        const baseConfig = {
            // Shared configuration for both domains
            shared: {
                analytics: {
                    provider: 'ANALYTICS_SERVICE',
                    debugView: 'ANALYTICS_DEBUG_SERVICE'
                },
                cloud: {
                    provider: 'CLOUD_PROVIDER',
                    hosting: 'HOSTING_SERVICE',
                    functions: 'SERVERLESS_FUNCTIONS_SERVICE'
                },
                features: {
                    videoIntegration: true,
                    strategicAnalysis: true,
                    glassmorphism: true,
                    scrollAnimations: true
                },
                modules: {
                    fix24: true,
                    specLab: true,
                    seveNue: true
                }
            },

            // Domain-specific configurations
            domains: {
                fitoutlab: {
                    name: 'FitOutLab',
                    domain: 'fitoutlab.app',
                    displayName: 'FitOutLab',
                    description: 'Professional design and fitout solutions with advanced tooling',
                    branding: {
                        primaryColor: '#1976d2',
                        accentColor: '#3949ab',
                        theme: 'professional'
                    },
                    content: {
                        title: 'FitOutLab - Professional Design Solutions',
                        subtitle: 'Advanced tooling for architecture & interior design workflows',
                        focus: 'tools'
                    },
                    features: {
                        capsuleInterface: true,
                        drawingAutomation: true,
                        boqExtraction: true,
                        quotationGeneration: true,
                        priceListManagement: true
                    },
                    youtube: {
                        origin: 'https://fitoutlab.app',
                        embedId: '3VYlYMnONS8'
                    }
                },

                designfitout: {
                    name: 'DesignFitout',
                    domain: 'designfitout.com',
                    displayName: 'DesignFitout',
                    description: 'Premium design and fitout solutions with strategic analysis',
                    branding: {
                        primaryColor: '#2e7d32',
                        accentColor: '#4caf50',
                        theme: 'premium'
                    },
                    content: {
                        title: 'DesignFitout - Premium Design Solutions',
                        subtitle: 'Strategic competitor analysis and performance monitoring',
                        focus: 'strategy'
                    },
                    features: {
                        strategicAnalysis: true,
                        competitorBenchmarking: true,
                        performanceMonitoring: true,
                        visualSimulation: true
                    },
                    youtube: {
                        origin: 'https://designfitout.com',
                        embedId: '3VYlYMnONS8'
                    }
                }
            }
        };

        return baseConfig;
    }

    /**
     * Initialize domain-specific settings
     */
    initializeDomainSpecificSettings() {
        this.applyDomainBranding();
        this.configureContentElements();
        this.setupDomainSpecificFeatures();
        this.updateMetaTags();
        
        // Dispatch domain configuration ready event
        this.dispatchConfigurationReady();
    }

    /**
     * Apply domain-specific branding
     */
    applyDomainBranding() {
        const domainConfig = this.getDomainConfig();
        
        if (domainConfig.branding) {
            // Apply CSS custom properties for theming
            document.documentElement.style.setProperty('--primary-color', domainConfig.branding.primaryColor);
            document.documentElement.style.setProperty('--accent-color', domainConfig.branding.accentColor);
            
            // Add domain-specific CSS class to body
            document.body.classList.add(`domain-${this.currentDomain}`);
            document.body.classList.add(`theme-${domainConfig.branding.theme}`);
        }
    }

    /**
     * Configure content elements based on domain
     */
    configureContentElements() {
        const domainConfig = this.getDomainConfig();
        
        // Update page title
        document.title = domainConfig.content.title;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', domainConfig.description);
        }
        
        // Update main heading if present
        const mainHeading = document.querySelector('h1');
        if (mainHeading) {
            mainHeading.textContent = domainConfig.content.subtitle;
        }
    }

    /**
     * Setup domain-specific features
     */
    setupDomainSpecificFeatures() {
        const domainConfig = this.getDomainConfig();
        
        // Configure YouTube embed with correct origin
        const youtubeEmbeds = document.querySelectorAll('iframe[src*="youtube.com"]');
        youtubeEmbeds.forEach(iframe => {
            const src = iframe.src;
            const newSrc = src.replace(/origin=[^&]+/, `origin=${encodeURIComponent(domainConfig.youtube.origin)}`);
            iframe.src = newSrc;
        });

        // Enable/disable features based on domain
        this.configureFeatureModules(domainConfig.features);
    }

    /**
     * Configure feature modules based on domain
     */
    configureFeatureModules(features) {
        // Strategic Analysis - primarily for designfitout.com
        if (features.strategicAnalysis && window.StrategicAnalysis) {
            console.log(`Strategic Analysis enabled for ${this.currentDomain}`);
        }

        // Capsule Interface - primarily for fitoutlab.app
        if (features.capsuleInterface) {
            console.log(`Capsule Interface enabled for ${this.currentDomain}`);
        }

        // Drawing Automation - fitoutlab specific
        if (features.drawingAutomation) {
            console.log(`Drawing Automation enabled for ${this.currentDomain}`);
        }
    }

    /**
     * Update meta tags for domain-specific SEO
     */
    updateMetaTags() {
        const domainConfig = this.getDomainConfig();
        
        // Update canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = `https://${domainConfig.domain}${window.location.pathname}`;

        // Update Open Graph tags
        this.updateOpenGraphTags(domainConfig);
    }

    /**
     * Update Open Graph meta tags
     */
    updateOpenGraphTags(domainConfig) {
        const ogTags = [
            { property: 'og:title', content: domainConfig.content.title },
            { property: 'og:description', content: domainConfig.description },
            { property: 'og:url', content: `https://${domainConfig.domain}${window.location.pathname}` },
            { property: 'og:site_name', content: domainConfig.displayName }
        ];

        ogTags.forEach(({ property, content }) => {
            let metaTag = document.querySelector(`meta[property="${property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', property);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', content);
        });
    }

    /**
     * Get current domain configuration
     */
    getDomainConfig() {
        return this.config.domains[this.currentDomain];
    }

    /**
     * Get shared configuration
     */
    getSharedConfig() {
        return this.config.shared;
    }

    /**
     * Get complete configuration for current domain
     */
    getConfig() {
        return {
            ...this.config.shared,
            ...this.config.domains[this.currentDomain],
            currentDomain: this.currentDomain
        };
    }

    /**
     * Check if a feature is enabled for current domain
     */
    isFeatureEnabled(featureName) {
        const domainConfig = this.getDomainConfig();
        const sharedConfig = this.getSharedConfig();
        
        return (domainConfig.features && domainConfig.features[featureName]) ||
               (sharedConfig.features && sharedConfig.features[featureName]);
    }

    /**
     * Get domain-specific setting
     */
    getSetting(settingPath) {
        const pathArray = settingPath.split('.');
        let value = this.getConfig();
        
        for (const key of pathArray) {
            value = value[key];
            if (value === undefined) break;
        }
        
        return value;
    }

    /**
     * Dispatch configuration ready event
     */
    dispatchConfigurationReady() {
        const event = new CustomEvent('domainConfigReady', {
            detail: {
                domain: this.currentDomain,
                config: this.getConfig()
            }
        });
        
        document.dispatchEvent(event);
        console.log(`Domain configuration ready: ${this.currentDomain}`);
    }

    /**
     * Switch domain context (for testing/development)
     */
    switchDomain(targetDomain) {
        if (this.config.domains[targetDomain]) {
            this.currentDomain = targetDomain;
            this.initializeDomainSpecificSettings();
            return true;
        }
        return false;
    }

    /**
     * Get domain list
     */
    getDomainList() {
        return Object.keys(this.config.domains);
    }

    /**
     * Export configuration for external use
     */
    exportConfig() {
        return JSON.stringify(this.getConfig(), null, 2);
    }
}

// Initialize domain configuration when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.domainConfig = new DomainConfig();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainConfig;
}

// Export for browser use
window.DomainConfig = DomainConfig;