/**
 * Security & Observability Enhancement Module
 * Advanced monitoring, debugging, and security measures for Designfitout platform
 */

class SecurityObservabilityModule {
    constructor() {
        this.initialized = false;
        this.securityLevel = 'standard';
        this.monitoring = {
            metrics: new Map(),
            events: [],
            performance: new Map(),
            security: new Map()
        };
        this.auditLog = [];
        this.alertSystem = null;
        this.debugMode = false;
        
        this.init();
    }

    /**
     * Initialize security and observability systems
     */
    init() {
        console.log('🔐 Security & Observability - Initializing enhanced monitoring...');
        
        this.initializeSecurity();
        this.initializeMonitoring();
        this.initializeAuditLogging();
        this.initializeAlertSystem();
        this.initializePerformanceTracking();
        this.setupEventListeners();
        
        this.initialized = true;
        this.logAuditEvent('system', 'security_observability_initialized', {
            securityLevel: this.securityLevel,
            timestamp: new Date().toISOString()
        });
        
        console.log('✅ Security & Observability - System fully initialized');
    }

    /**
     * Initialize enhanced security measures
     */
    initializeSecurity() {
        this.security = {
            cspViolations: [],
            suspiciousActivities: [],
            rateLimiting: new Map(),
            encryptionStatus: 'enabled',
            
            // Enhanced CSP monitoring
            monitorCSP: () => {
                document.addEventListener('securitypolicyviolation', (e) => {
                    const violation = {
                        directive: e.violatedDirective,
                        blockedURI: e.blockedURI,
                        documentURI: e.documentURI,
                        timestamp: new Date().toISOString(),
                        severity: 'high'
                    };
                    
                    this.security.cspViolations.push(violation);
                    this.logAuditEvent('security', 'csp_violation', violation);
                    this.triggerAlert('security', 'CSP Violation Detected', violation);
                });
            },
            
            // Rate limiting for API calls
            checkRateLimit: (identifier, limit = 100, window = 60000) => {
                const now = Date.now();
                const windowStart = now - window;
                
                if (!this.security.rateLimiting.has(identifier)) {
                    this.security.rateLimiting.set(identifier, []);
                }
                
                const requests = this.security.rateLimiting.get(identifier);
                
                // Remove old requests outside the window
                const currentRequests = requests.filter(timestamp => timestamp > windowStart);
                
                if (currentRequests.length >= limit) {
                    this.logAuditEvent('security', 'rate_limit_exceeded', {
                        identifier,
                        requestCount: currentRequests.length,
                        limit,
                        window
                    });
                    
                    this.triggerAlert('security', 'Rate Limit Exceeded', { identifier, limit });
                    return false;
                }
                
                currentRequests.push(now);
                this.security.rateLimiting.set(identifier, currentRequests);
                return true;
            },
            
            // Input validation and sanitization
            sanitizeInput: (input, type = 'text') => {
                if (typeof input !== 'string') return input;
                
                const sanitizers = {
                    text: (str) => str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
                    html: (str) => str.replace(/[<>]/g, ''),
                    sql: (str) => str.replace(/['";\\]/g, ''),
                    path: (str) => str.replace(/[\.\/\\]/g, '')
                };
                
                const sanitized = sanitizers[type] ? sanitizers[type](input) : input;
                
                if (sanitized !== input) {
                    this.logAuditEvent('security', 'input_sanitized', {
                        original: input,
                        sanitized: sanitized,
                        type: type
                    });
                }
                
                return sanitized;
            },
            
            // Session security
            validateSession: (sessionToken) => {
                // Simulate session validation
                const isValid = sessionToken && sessionToken.length > 20;
                
                if (!isValid) {
                    this.logAuditEvent('security', 'invalid_session', {
                        sessionToken: sessionToken ? 'present' : 'missing',
                        timestamp: new Date().toISOString()
                    });
                }
                
                return isValid;
            }
        };
        
        // Start CSP monitoring
        this.security.monitorCSP();
        
        // Set enhanced security level based on environment
        this.securityLevel = window.location.protocol === 'https:' ? 'enhanced' : 'standard';
        
        console.log(`🛡️ Security Level: ${this.securityLevel}`);
    }

    /**
     * Initialize comprehensive monitoring system
     */
    initializeMonitoring() {
        this.monitor = {
            startTime: Date.now(),
            
            // Core Web Vitals tracking
            trackWebVitals: () => {
                // Largest Contentful Paint (LCP)
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    
                    this.recordMetric('web_vitals', 'lcp', lastEntry.startTime, {
                        target: lastEntry.element?.tagName || 'unknown',
                        url: lastEntry.url || window.location.href
                    });
                    
                    if (lastEntry.startTime > 2500) {
                        this.triggerAlert('performance', 'LCP threshold exceeded', {
                            value: lastEntry.startTime,
                            threshold: 2500
                        });
                    }
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // First Input Delay (FID)
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        this.recordMetric('web_vitals', 'fid', entry.processingStart - entry.startTime, {
                            eventType: entry.name
                        });
                        
                        if (entry.processingStart - entry.startTime > 100) {
                            this.triggerAlert('performance', 'FID threshold exceeded', {
                                value: entry.processingStart - entry.startTime,
                                threshold: 100
                            });
                        }
                    });
                }).observe({ entryTypes: ['first-input'] });
                
                // Cumulative Layout Shift (CLS)
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    
                    this.recordMetric('web_vitals', 'cls', clsValue);
                    
                    if (clsValue > 0.1) {
                        this.triggerAlert('performance', 'CLS threshold exceeded', {
                            value: clsValue,
                            threshold: 0.1
                        });
                    }
                }).observe({ entryTypes: ['layout-shift'] });
            },
            
            // Resource loading monitoring
            trackResourceLoading: () => {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    
                    entries.forEach(entry => {
                        this.recordMetric('resources', entry.initiatorType, entry.duration, {
                            name: entry.name,
                            size: entry.transferSize || 0,
                            cached: entry.transferSize === 0
                        });
                        
                        // Alert on slow resources
                        if (entry.duration > 3000) {
                            this.triggerAlert('performance', 'Slow resource loading', {
                                resource: entry.name,
                                duration: entry.duration,
                                type: entry.initiatorType
                            });
                        }
                    });
                }).observe({ entryTypes: ['resource'] });
            },
            
            // JavaScript error tracking
            trackErrors: () => {
                window.addEventListener('error', (event) => {
                    const errorInfo = {
                        message: event.message,
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno,
                        error: event.error?.stack || 'No stack trace',
                        timestamp: new Date().toISOString()
                    };
                    
                    this.monitoring.events.push({
                        type: 'javascript_error',
                        data: errorInfo,
                        timestamp: Date.now()
                    });
                    
                    this.logAuditEvent('system', 'javascript_error', errorInfo);
                    this.triggerAlert('error', 'JavaScript Error', errorInfo);
                });
                
                // Unhandled promise rejections
                window.addEventListener('unhandledrejection', (event) => {
                    const errorInfo = {
                        reason: event.reason,
                        promise: 'Promise rejection',
                        timestamp: new Date().toISOString()
                    };
                    
                    this.monitoring.events.push({
                        type: 'promise_rejection',
                        data: errorInfo,
                        timestamp: Date.now()
                    });
                    
                    this.logAuditEvent('system', 'promise_rejection', errorInfo);
                    this.triggerAlert('error', 'Unhandled Promise Rejection', errorInfo);
                });
            },
            
            // User interaction monitoring
            trackUserInteractions: () => {
                ['click', 'scroll', 'resize', 'focus', 'blur'].forEach(eventType => {
                    document.addEventListener(eventType, (event) => {
                        this.recordMetric('user_interactions', eventType, 1, {
                            target: event.target?.tagName || 'unknown',
                            timestamp: Date.now()
                        });
                    }, { passive: true });
                });
            }
        };
        
        // Start all monitoring
        this.monitor.trackWebVitals();
        this.monitor.trackResourceLoading();
        this.monitor.trackErrors();
        this.monitor.trackUserInteractions();
        
        console.log('📊 Monitoring systems activated');
    }

    /**
     * Initialize audit logging system
     */
    initializeAuditLogging() {
        this.auditLogger = {
            maxEntries: 1000,
            categories: ['system', 'security', 'performance', 'user', 'api'],
            
            log: (category, action, details = {}) => {
                const entry = {
                    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    category: category,
                    action: action,
                    details: details,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    sessionId: this.getSessionId()
                };
                
                this.auditLog.unshift(entry);
                
                // Maintain maximum entries
                if (this.auditLog.length > this.auditLogger.maxEntries) {
                    this.auditLog = this.auditLog.slice(0, this.auditLogger.maxEntries);
                }
                
                // Debug output
                if (this.debugMode) {
                    console.log(`📋 Audit Log [${category}]: ${action}`, details);
                }
                
                return entry.id;
            },
            
            query: (filters = {}) => {
                let results = [...this.auditLog];
                
                if (filters.category) {
                    results = results.filter(entry => entry.category === filters.category);
                }
                
                if (filters.action) {
                    results = results.filter(entry => entry.action.includes(filters.action));
                }
                
                if (filters.since) {
                    const sinceTime = new Date(filters.since).getTime();
                    results = results.filter(entry => new Date(entry.timestamp).getTime() >= sinceTime);
                }
                
                if (filters.limit) {
                    results = results.slice(0, filters.limit);
                }
                
                return results;
            }
        };
    }

    /**
     * Initialize alert system
     */
    initializeAlertSystem() {
        this.alertSystem = {
            alerts: [],
            thresholds: {
                error: 5,        // Max errors per minute
                performance: 3,   // Max performance alerts per minute
                security: 1      // Max security alerts per minute
            },
            
            trigger: (type, message, data = {}) => {
                const alert = {
                    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: type,
                    message: message,
                    data: data,
                    timestamp: new Date().toISOString(),
                    severity: this.determineSeverity(type, data),
                    acknowledged: false
                };
                
                this.alertSystem.alerts.unshift(alert);
                
                // Log alert
                this.logAuditEvent('system', 'alert_triggered', alert);
                
                // Console output for immediate attention
                const severityEmoji = {
                    low: '💡',
                    medium: '⚠️',
                    high: '🚨',
                    critical: '🔥'
                };
                
                console.warn(
                    `${severityEmoji[alert.severity] || '⚠️'} ALERT [${type.toUpperCase()}]: ${message}`,
                    data
                );
                
                // Trigger custom event for other modules to handle
                this.dispatchEvent('alertTriggered', alert);
                
                return alert.id;
            },
            
            acknowledge: (alertId) => {
                const alert = this.alertSystem.alerts.find(a => a.id === alertId);
                if (alert) {
                    alert.acknowledged = true;
                    alert.acknowledgedAt = new Date().toISOString();
                    this.logAuditEvent('system', 'alert_acknowledged', { alertId });
                    return true;
                }
                return false;
            },
            
            getUnacknowledged: () => {
                return this.alertSystem.alerts.filter(alert => !alert.acknowledged);
            }
        };
    }

    /**
     * Initialize performance tracking
     */
    initializePerformanceTracking() {
        this.performanceTracker = {
            marks: new Map(),
            measures: new Map(),
            
            mark: (name) => {
                const timestamp = performance.now();
                this.performanceTracker.marks.set(name, timestamp);
                performance.mark(name);
                
                this.logAuditEvent('performance', 'mark_created', { name, timestamp });
                return timestamp;
            },
            
            measure: (name, startMark, endMark) => {
                try {
                    performance.measure(name, startMark, endMark);
                    const measure = performance.getEntriesByName(name, 'measure')[0];
                    
                    this.performanceTracker.measures.set(name, {
                        duration: measure.duration,
                        startTime: measure.startTime,
                        timestamp: Date.now()
                    });
                    
                    this.recordMetric('performance', name, measure.duration);
                    this.logAuditEvent('performance', 'measure_created', {
                        name,
                        duration: measure.duration,
                        startMark,
                        endMark
                    });
                    
                    return measure.duration;
                } catch (error) {
                    console.warn('Performance measure failed:', error);
                    return null;
                }
            },
            
            getMetrics: () => {
                return {
                    marks: Object.fromEntries(this.performanceTracker.marks),
                    measures: Object.fromEntries(this.performanceTracker.measures),
                    navigation: performance.getEntriesByType('navigation')[0],
                    paint: performance.getEntriesByType('paint')
                };
            }
        };
        
        // Mark initialization
        this.performanceTracker.mark('security_observability_init_start');
    }

    /**
     * Set up event listeners for integration
     */
    setupEventListeners() {
        // Listen for module events
        ['sevenue', 'mrketoz', 'strategic'].forEach(modulePrefix => {
            document.addEventListener(modulePrefix + 'Event', (event) => {
                this.recordMetric('module_events', modulePrefix, 1, event.detail);
                this.logAuditEvent('system', `${modulePrefix}_event`, event.detail);
            });
        });
        
        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            const visibility = document.hidden ? 'hidden' : 'visible';
            this.recordMetric('user_interactions', 'page_visibility', 1, { visibility });
            this.logAuditEvent('user', 'page_visibility_changed', { visibility });
        });
        
        // Listen for network changes
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                const connectionInfo = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                };
                
                this.recordMetric('network', 'connection_change', 1, connectionInfo);
                this.logAuditEvent('system', 'network_connection_changed', connectionInfo);
            });
        }
    }

    /**
     * Record a metric
     */
    recordMetric(category, name, value, metadata = {}) {
        const metricKey = `${category}.${name}`;
        
        if (!this.monitoring.metrics.has(metricKey)) {
            this.monitoring.metrics.set(metricKey, []);
        }
        
        const metric = {
            value: value,
            timestamp: Date.now(),
            metadata: metadata
        };
        
        this.monitoring.metrics.get(metricKey).push(metric);
        
        // Keep only recent metrics (last 1000 entries per metric)
        const metrics = this.monitoring.metrics.get(metricKey);
        if (metrics.length > 1000) {
            this.monitoring.metrics.set(metricKey, metrics.slice(-1000));
        }
    }

    /**
     * Log audit event
     */
    logAuditEvent(category, action, details = {}) {
        return this.auditLogger.log(category, action, details);
    }

    /**
     * Trigger alert
     */
    triggerAlert(type, message, data = {}) {
        return this.alertSystem.trigger(type, message, data);
    }

    /**
     * Determine alert severity
     */
    determineSeverity(type, data) {
        const severityMap = {
            security: 'high',
            error: 'medium',
            performance: 'low',
            system: 'medium'
        };
        
        let baseSeverity = severityMap[type] || 'low';
        
        // Upgrade severity based on data
        if (data.duration && data.duration > 5000) baseSeverity = 'high';
        if (data.error && data.error.includes('Security')) baseSeverity = 'critical';
        if (data.value && data.threshold && data.value > data.threshold * 2) baseSeverity = 'high';
        
        return baseSeverity;
    }

    /**
     * Get session ID (simplified)
     */
    getSessionId() {
        if (!window.sessionStorage.getItem('designfitout_session_id')) {
            window.sessionStorage.setItem(
                'designfitout_session_id',
                `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            );
        }
        return window.sessionStorage.getItem('designfitout_session_id');
    }

    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        const now = Date.now();
        const uptime = now - this.monitor.startTime;
        
        return {
            initialized: this.initialized,
            securityLevel: this.securityLevel,
            uptime: uptime,
            monitoring: {
                metricsTracked: this.monitoring.metrics.size,
                eventsLogged: this.monitoring.events.length,
                performanceMetrics: this.monitoring.performance.size
            },
            security: {
                cspViolations: this.security.cspViolations.length,
                rateLimitedRequests: Array.from(this.security.rateLimiting.values())
                    .reduce((sum, requests) => sum + requests.length, 0),
                encryptionStatus: this.security.encryptionStatus
            },
            audit: {
                totalEntries: this.auditLog.length,
                categoriesLogged: [...new Set(this.auditLog.map(entry => entry.category))],
                recentEntries: this.auditLog.slice(0, 5)
            },
            alerts: {
                total: this.alertSystem.alerts.length,
                unacknowledged: this.alertSystem.getUnacknowledged().length,
                recent: this.alertSystem.alerts.slice(0, 3)
            },
            performance: this.performanceTracker.getMetrics()
        };
    }

    /**
     * Generate security report
     */
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                securityLevel: this.securityLevel,
                totalViolations: this.security.cspViolations.length,
                suspiciousActivities: this.security.suspiciousActivities.length,
                rateLimitViolations: this.auditLogger.query({ 
                    action: 'rate_limit_exceeded' 
                }).length
            },
            details: {
                cspViolations: this.security.cspViolations.slice(-10),
                recentSecurityEvents: this.auditLogger.query({ 
                    category: 'security', 
                    limit: 20 
                }),
                recommendations: this.generateSecurityRecommendations()
            }
        };
        
        this.logAuditEvent('system', 'security_report_generated', { 
            reportSize: JSON.stringify(report).length 
        });
        
        return report;
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (this.security.cspViolations.length > 0) {
            recommendations.push({
                type: 'csp',
                severity: 'medium',
                message: 'Review and update Content Security Policy to prevent violations',
                action: 'Update CSP headers to allow legitimate resources'
            });
        }
        
        if (this.securityLevel === 'standard') {
            recommendations.push({
                type: 'encryption',
                severity: 'high',
                message: 'Upgrade to HTTPS for enhanced security',
                action: 'Configure SSL/TLS certificate and redirect HTTP to HTTPS'
            });
        }
        
        const rateLimitViolations = this.auditLogger.query({ 
            action: 'rate_limit_exceeded' 
        }).length;
        
        if (rateLimitViolations > 5) {
            recommendations.push({
                type: 'rate_limiting',
                severity: 'medium',
                message: 'Consider implementing stricter rate limiting',
                action: 'Review and adjust rate limiting thresholds'
            });
        }
        
        return recommendations;
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.logAuditEvent('system', 'debug_mode_changed', { enabled });
        
        if (enabled) {
            console.log('🔧 Debug mode enabled - Verbose logging active');
            // Expose debug interface
            window.debugSecurityObservability = {
                getMetrics: () => Object.fromEntries(this.monitoring.metrics),
                getAuditLog: (filters) => this.auditLogger.query(filters),
                getAlerts: () => this.alertSystem.alerts,
                getStatus: () => this.getSystemStatus(),
                triggerTestAlert: (type, message) => this.triggerAlert(type, `TEST: ${message}`)
            };
        } else {
            console.log('🔧 Debug mode disabled');
            delete window.debugSecurityObservability;
        }
    }

    /**
     * Dispatch custom events
     */
    dispatchEvent(eventType, data) {
        const event = new CustomEvent(`security${eventType}`, {
            detail: data,
            bubbles: true
        });
        window.dispatchEvent(event);
    }
}

// Export for use in other modules
window.SecurityObservabilityModule = SecurityObservabilityModule;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
    window.securityObservabilityInstance = new SecurityObservabilityModule();
    
    // Expose public API
    window.SecurityObservability = {
        getStatus: () => window.securityObservabilityInstance.getSystemStatus(),
        generateReport: () => window.securityObservabilityInstance.generateSecurityReport(),
        recordMetric: (category, name, value, metadata) => 
            window.securityObservabilityInstance.recordMetric(category, name, value, metadata),
        logEvent: (category, action, details) => 
            window.securityObservabilityInstance.logAuditEvent(category, action, details),
        triggerAlert: (type, message, data) => 
            window.securityObservabilityInstance.triggerAlert(type, message, data),
        setDebugMode: (enabled) => window.securityObservabilityInstance.setDebugMode(enabled),
        acknowledgeAlert: (alertId) => window.securityObservabilityInstance.alertSystem.acknowledge(alertId)
    };
    
    console.log('🔐 Security & Observability - Global monitoring API exposed');
}