/**
 * Designfitout.com - Visual Effects Module
 * Enhanced glassmorphism, animations, and visual interactions
 */

class VisualEffects {
    constructor() {
        this.effects = new Map();
        this.observers = new Map();
        this.animationFrameId = null;
        this.isActive = false;
        
        this.config = {
            animationDuration: 600,
            glassmorphismIntensity: 20,
            parallaxStrength: 0.5,
            particleCount: 50,
            interactiveRadius: 100
        };
        
        this.init();
    }

    async init() {
        
        this.setupGlassmorphismEffects();
        this.setupScrollAnimations();
        this.setupInteractiveParticles();
        this.setupDynamicBackgrounds();
        this.setupHoverEffects();
        
        this.isActive = true;
    }

    /**
     * Setup enhanced glassmorphism effects
     */
    setupGlassmorphismEffects() {
        const root = document.documentElement;
        
        const glassStyle = document.createElement('style');
        glassStyle.textContent = `
            .glass-enhanced {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                backdrop-filter: blur(${this.config.glassmorphismIntensity}px);
                -webkit-backdrop-filter: blur(${this.config.glassmorphismIntensity}px);
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 20px;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.37),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .glass-enhanced::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.1),
                    transparent
                );
                transition: left 0.5s ease-in-out;
                z-index: 1;
            }
            
            .glass-enhanced:hover::before {
                left: 100%;
            }
            
            .glass-enhanced:hover {
                backdrop-filter: blur(${this.config.glassmorphismIntensity + 5}px);
                -webkit-backdrop-filter: blur(${this.config.glassmorphismIntensity + 5}px);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 
                    0 12px 48px rgba(0, 0, 0, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transform: translateY(-2px) scale(1.02);
            }
            
            .glass-card {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                padding: 1.5rem;
                margin: 1rem 0;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .glass-card:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.25);
                transform: translateY(-4px);
            }
        `;
        
        document.head.appendChild(glassStyle);
        
        this.enhanceExistingGlassElements();
        
    }

    /**
     * Enhance existing glass elements
     */
    enhanceExistingGlassElements() {
        const glassElements = document.querySelectorAll('.glass');
        
        glassElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('glass-enhanced');
                this.addRippleEffect(element);
            }, index * 100);
        });
    }

    /**
     * Add ripple effect to glass elements
     */
    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out forwards;
                pointer-events: none;
                z-index: 10;
            `;
            
            if (!document.querySelector('#ripple-style')) {
                const rippleStyle = document.createElement('style');
                rippleStyle.id = 'ripple-style';
                rippleStyle.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(rippleStyle);
            }
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    }

    /**
     * Setup enhanced scroll animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const element = entry.target;
                const intersectionRatio = entry.intersectionRatio;
                
                if (entry.isIntersecting) {
                    element.classList.add('revealed');
                    
                    element.style.setProperty('--reveal-progress', intersectionRatio);
                    
                    this.animateChildren(element, intersectionRatio);
                } else {
                    element.style.setProperty('--reveal-progress', 0);
                }
            });
        }, observerOptions);

        const scrollStyle = document.createElement('style');
        scrollStyle.textContent = `
            .scroll-reveal {
                opacity: 0;
                transform: translateY(50px) rotateX(10deg);
                transition: all ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
                transform-style: preserve-3d;
                perspective: 1000px;
            }
            
            .scroll-reveal.revealed {
                opacity: 1;
                transform: translateY(0) rotateX(0deg);
            }
            
            .scroll-reveal.revealed .stagger-child {
                animation: staggerReveal 0.6s ease-out forwards;
            }
            
            @keyframes staggerReveal {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(scrollStyle);

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            scrollObserver.observe(el);
        });

        this.observers.set('scroll', scrollObserver);
    }

    /**
     * Animate child elements with stagger effect
     */
    animateChildren(parent, progress) {
        const children = parent.querySelectorAll('*');
        
        children.forEach((child, index) => {
            if (!child.classList.contains('stagger-child')) {
                child.classList.add('stagger-child');
                child.style.animationDelay = `${index * 100}ms`;
            }
        });
    }

    /**
     * Setup interactive particle system
     */
    setupInteractiveParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        let mouseX = 0;
        let mouseY = 0;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.originalSize = this.size;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.interactiveRadius) {
                    const force = (this.config.interactiveRadius - distance) / this.config.interactiveRadius;
                    this.size = this.originalSize * (1 + force);
                    this.opacity = Math.min(1, this.opacity + force * 0.5);
                } else {
                    this.size = this.originalSize;
                    this.opacity = Math.max(0.2, this.opacity - 0.01);
                }
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                
                this.x = Math.max(0, Math.min(canvas.width, this.x));
                this.y = Math.max(0, Math.min(canvas.height, this.y));
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
                ctx.restore();
            }
        }
        
        for (let i = 0; i < this.config.particleCount; i++) {
            particles.push(new Particle());
        }
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.save();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            });
            
            this.animationFrameId = requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
        
    }

    /**
     * Setup dynamic background effects
     */
    setupDynamicBackgrounds() {
        const backgroundStyle = document.createElement('style');
        backgroundStyle.textContent = `
            .animated-bg-enhanced {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
                background-size: 300% 300%;
                animation: gradientShiftEnhanced 20s ease infinite;
            }
            
            @keyframes gradientShiftEnhanced {
                0% { background-position: 0% 50%; }
                25% { background-position: 100% 50%; }
                50% { background-position: 100% 100%; }
                75% { background-position: 50% 100%; }
                100% { background-position: 0% 50%; }
            }
            
            .animated-bg-enhanced::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
                animation: overlayFloat 15s ease-in-out infinite;
            }
            
            @keyframes overlayFloat {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.1); }
            }
        `;
        
        document.head.appendChild(backgroundStyle);
        
        const existingBg = document.querySelector('.animated-bg');
        if (existingBg) {
            existingBg.classList.add('animated-bg-enhanced');
        }
        
    }

    /**
     * Setup enhanced hover effects
     */
    setupHoverEffects() {
        const hoverStyle = document.createElement('style');
        hoverStyle.textContent = `
            .hover-lift {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .hover-lift:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                z-index: 10;
                position: relative;
            }
            
            .hover-glow {
                transition: all 0.3s ease;
                position: relative;
            }
            
            .hover-glow::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: inherit;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: -1;
            }
            
            .hover-glow:hover::before {
                opacity: 1;
            }
            
            .magnetic-hover {
                transition: transform 0.2s ease;
            }
        `;
        
        document.head.appendChild(hoverStyle);
        
        document.querySelectorAll('.glass, .feature-card').forEach(element => {
            element.classList.add('hover-lift', 'hover-glow');
        });
        
        this.setupMagneticHover();
        
    }

    /**
     * Setup magnetic hover effect for interactive elements
     */
    setupMagneticHover() {
        const magneticElements = document.querySelectorAll('button, .cta, .interactive');
        
        magneticElements.forEach(element => {
            element.classList.add('magnetic-hover');
            
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.15;
                const moveY = y * 0.15;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    /**
     * Create custom visual effect
     */
    createEffect(name, config) {
        if (this.effects.has(name)) {
            console.warn(`Effect ${name} already exists`);
            return;
        }
        
        const effect = {
            name,
            config,
            active: false,
            elements: new Set(),
            animate: config.animate || (() => {}),
            cleanup: config.cleanup || (() => {})
        };
        
        this.effects.set(name, effect);
        
        return effect;
    }

    /**
     * Apply effect to elements
     */
    applyEffect(effectName, selector) {
        const effect = this.effects.get(effectName);
        if (!effect) {
            console.error(`Effect ${effectName} not found`);
            return;
        }
        
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            effect.elements.add(element);
            effect.animate(element);
        });
        
        effect.active = true;
    }

    /**
     * Remove effect from elements
     */
    removeEffect(effectName) {
        const effect = this.effects.get(effectName);
        if (!effect) return;
        
        effect.elements.forEach(element => {
            effect.cleanup(element);
        });
        
        effect.active = false;
        effect.elements.clear();
        
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (newConfig.glassmorphismIntensity) {
            this.setupGlassmorphismEffects();
        }
        
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            activeEffects: this.effects.size,
            totalObservers: this.observers.size,
            isAnimating: !!this.animationFrameId,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage (simplified)
     */
    estimateMemoryUsage() {
        let usage = 0;
        
        this.effects.forEach(effect => {
            usage += effect.elements.size * 100; // Rough estimate
        });
        
        return `~${usage}KB`;
    }

    /**
     * Cleanup all effects and observers
     */
    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.effects.forEach((effect, name) => {
            this.removeEffect(name);
        });
        
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.remove();
        }
        
        this.isActive = false;
    }
}

if (window.ModuleSystem) {
    window.ModuleSystem.register('visualEffects', () => {
        return new Promise((resolve) => {
            const instance = new VisualEffects();
            resolve(instance);
        });
    }, []);
}

window.VisualEffects = VisualEffects;