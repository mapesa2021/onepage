// Analytics System for Landing Page Builder
class PageAnalytics {
    constructor() {
        this.pageData = {
            views: 0,
            conversions: 0,
            loadTime: 0,
            components: 0,
            pageSize: 0,
            interactions: []
        };
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackPerformance();
        this.trackInteractions();
        this.trackConversions();
    }

    trackPageView() {
        this.pageData.views++;
        this.saveAnalytics();
        
        // Send to external analytics if configured
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    trackPerformance() {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.pageData.loadTime = loadTime;
            
            // Calculate page size
            const pageSize = new Blob([document.documentElement.outerHTML]).size;
            this.pageData.pageSize = Math.round(pageSize / 1024); // KB
            
            this.saveAnalytics();
            
            // Send performance data
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: loadTime
                });
            }
        });
    }

    trackInteractions() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Track CTA clicks
            if (target.matches('a[href*="#"], button, .cta-button')) {
                this.trackInteraction('cta_click', {
                    element: target.textContent || target.className,
                    href: target.href || '#'
                });
            }
            
            // Track form submissions
            if (target.matches('form button[type="submit"]')) {
                this.trackInteraction('form_submit', {
                    form: target.closest('form').className || 'unknown'
                });
            }
            
            // Track payment attempts
            if (target.matches('.payment-form button')) {
                this.trackInteraction('payment_attempt', {
                    amount: this.getPaymentAmount(target)
                });
            }
        });
    }

    trackConversions() {
        // Track successful payments
        if (window.location.search.includes('payment=success')) {
            this.pageData.conversions++;
            this.trackInteraction('payment_success', {
                amount: this.getPaymentAmountFromURL()
            });
        }
        
        // Track form completions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.trackInteraction('form_complete', {
                    form: e.target.className || 'unknown'
                });
            }
        });
    }

    trackInteraction(type, data) {
        const interaction = {
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.pageData.interactions.push(interaction);
        this.saveAnalytics();
        
        // Send to external analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', type, {
                event_category: 'engagement',
                event_label: JSON.stringify(data)
            });
        }
    }

    getPaymentAmount(element) {
        const amountElement = element.closest('.payment-form').querySelector('.amount');
        return amountElement ? amountElement.textContent : 'unknown';
    }

    getPaymentAmountFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('amount') || 'unknown';
    }

    saveAnalytics() {
        localStorage.setItem('pageAnalytics', JSON.stringify(this.pageData));
    }

    loadAnalytics() {
        const saved = localStorage.getItem('pageAnalytics');
        if (saved) {
            this.pageData = { ...this.pageData, ...JSON.parse(saved) };
        }
    }

    getAnalytics() {
        return {
            ...this.pageData,
            conversionRate: this.pageData.views > 0 
                ? Math.round((this.pageData.conversions / this.pageData.views) * 100) 
                : 0
        };
    }

    resetAnalytics() {
        this.pageData = {
            views: 0,
            conversions: 0,
            loadTime: 0,
            components: 0,
            pageSize: 0,
            interactions: []
        };
        this.saveAnalytics();
    }
}

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0
        };
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.measureWebVitals();
        this.monitorResources();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        });
    }

    measureWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
            let cls = 0;
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    cls += entry.value;
                }
            }
            this.metrics.cumulativeLayoutShift = cls;
        }).observe({ entryTypes: ['layout-shift'] });
    }

    monitorResources() {
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.entryType === 'resource') {
                    console.log(`Resource loaded: ${entry.name} in ${entry.duration}ms`);
                }
            });
        }).observe({ entryTypes: ['resource'] });
    }

    getMetrics() {
        return this.metrics;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageAnalytics, PerformanceMonitor };
}
