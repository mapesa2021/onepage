// Component Library for Landing Page Builder
class ComponentLibrary {
    constructor() {
        this.components = {
            // Hero Sections
            'hero-basic': {
                name: 'Basic Hero',
                icon: 'fas fa-star',
                color: 'text-blue-500',
                template: (data) => `
                    <div class="text-center py-16 md:py-24" style="background-color: ${data.styles.backgroundColor}; color: ${data.styles.textColor};">
                        <div class="max-w-4xl mx-auto px-4">
                            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">${data.content.title}</h1>
                            <p class="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-600">${data.content.subtitle}</p>
                            <a href="${data.content.ctaLink}" class="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
                                ${data.content.ctaText}
                            </a>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Your Amazing Headline',
                        subtitle: 'Compelling subtitle that drives action',
                        ctaText: 'Get Started',
                        ctaLink: '#'
                    },
                    styles: {
                        backgroundColor: '#ffffff',
                        textColor: '#000000'
                    }
                }
            },
            
            'hero-gradient': {
                name: 'Gradient Hero',
                icon: 'fas fa-palette',
                color: 'text-purple-500',
                template: (data) => `
                    <div class="text-center py-16 md:py-24 relative overflow-hidden" style="background: ${data.styles.gradient}; color: ${data.styles.textColor};">
                        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div class="relative z-10 max-w-4xl mx-auto px-4">
                            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">${data.content.title}</h1>
                            <p class="text-xl md:text-2xl lg:text-3xl mb-8 opacity-90">${data.content.subtitle}</p>
                            <a href="${data.content.ctaLink}" class="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                                ${data.content.ctaText}
                            </a>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Gradient Hero Title',
                        subtitle: 'Beautiful gradient background',
                        ctaText: 'Learn More',
                        ctaLink: '#'
                    },
                    styles: {
                        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        textColor: '#ffffff'
                    }
                }
            },

            // Content Sections
            'text-section': {
                name: 'Text Section',
                icon: 'fas fa-align-left',
                color: 'text-green-500',
                template: (data) => `
                    <div class="py-16 md:py-20" style="background-color: ${data.styles.backgroundColor}; color: ${data.styles.textColor};">
                        <div class="max-w-4xl mx-auto px-4">
                            <h2 class="text-3xl md:text-4xl font-bold mb-8 text-center">${data.content.title}</h2>
                            <div class="prose prose-lg max-w-none">
                                <p class="text-lg leading-relaxed text-center">${data.content.text}</p>
                            </div>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Section Title',
                        text: 'This is a text section with compelling content that engages your visitors and drives them to take action.'
                    },
                    styles: {
                        backgroundColor: '#f8f9fa',
                        textColor: '#333333'
                    }
                }
            },

            'image-section': {
                name: 'Image Section',
                icon: 'fas fa-image',
                color: 'text-orange-500',
                template: (data) => `
                    <div class="py-16 md:py-20" style="background-color: ${data.styles.backgroundColor};">
                        <div class="max-w-6xl mx-auto px-4">
                            <div class="grid md:grid-cols-2 gap-12 items-center">
                                <div class="order-2 md:order-1">
                                    <h2 class="text-3xl md:text-4xl font-bold mb-6">${data.content.title}</h2>
                                    <p class="text-lg text-gray-600 leading-relaxed mb-6">${data.content.description}</p>
                                    ${data.content.ctaText ? `
                                        <a href="${data.content.ctaLink || '#'}" class="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                            ${data.content.ctaText}
                                        </a>
                                    ` : ''}
                                </div>
                                <div class="order-1 md:order-2">
                                    <img src="${data.content.imageUrl}" alt="${data.content.title}" 
                                         class="w-full h-64 md:h-96 object-cover rounded-lg shadow-xl" 
                                         loading="lazy">
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Image Section',
                        description: 'Description for the image that explains the value proposition.',
                        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
                        ctaText: 'Learn More',
                        ctaLink: '#'
                    },
                    styles: {
                        backgroundColor: '#ffffff'
                    }
                }
            },

            'testimonial': {
                name: 'Testimonial',
                icon: 'fas fa-quote-left',
                color: 'text-yellow-500',
                template: (data) => `
                    <div class="py-16 md:py-20" style="background-color: ${data.styles.backgroundColor}; color: ${data.styles.textColor};">
                        <div class="max-w-4xl mx-auto px-4 text-center">
                            <div class="bg-white p-8 md:p-12 rounded-xl shadow-lg">
                                <i class="fas fa-quote-left text-4xl text-blue-500 mb-6"></i>
                                <p class="text-xl md:text-2xl italic mb-8 leading-relaxed">"${data.content.quote}"</p>
                                <div class="flex items-center justify-center space-x-4">
                                    <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-gray-600"></i>
                                    </div>
                                    <div class="text-left">
                                        <p class="font-semibold text-lg">${data.content.author}</p>
                                        <p class="text-gray-600">${data.content.position}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        quote: 'This product changed my life! I can\'t believe how much it has helped me achieve my goals.',
                        author: 'John Doe',
                        position: 'CEO, Company Name'
                    },
                    styles: {
                        backgroundColor: '#f8f9fa',
                        textColor: '#333333'
                    }
                }
            },

            // Interactive Elements
            'cta-button': {
                name: 'CTA Button',
                icon: 'fas fa-mouse-pointer',
                color: 'text-red-500',
                template: (data) => `
                    <div class="py-16 text-center" style="background-color: ${data.styles.backgroundColor}; color: ${data.styles.textColor};">
                        <div class="max-w-2xl mx-auto px-4">
                            <h2 class="text-2xl md:text-3xl font-bold mb-6">${data.content.title}</h2>
                            <p class="text-lg mb-8 text-gray-600">${data.content.description}</p>
                            <a href="${data.content.link}" class="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105">
                                ${data.content.text}
                            </a>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Ready to Get Started?',
                        description: 'Join thousands of satisfied customers today.',
                        text: 'Get Started Now',
                        link: '#'
                    },
                    styles: {
                        backgroundColor: '#ffffff',
                        textColor: '#000000'
                    }
                }
            },

            'payment-form': {
                name: 'Payment Form',
                icon: 'fas fa-credit-card',
                color: 'text-emerald-500',
                template: (data) => `
                    <div class="py-16 md:py-20" style="background-color: ${data.styles.backgroundColor};">
                        <div class="max-w-md mx-auto px-4">
                            <h2 class="text-3xl font-bold text-center mb-8">${data.content.title}</h2>
                            <div class="bg-gray-50 p-6 md:p-8 rounded-xl shadow-lg">
                                <div class="text-center mb-8">
                                    <p class="text-2xl font-bold text-gray-900">${data.content.amount} ${data.content.currency}</p>
                                    <p class="text-gray-600 mt-2">${data.content.description}</p>
                                </div>
                                <form class="space-y-4" id="paymentForm">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" placeholder="07XXXXXXXX" required
                                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    <button type="submit" class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                                        Pay Now
                                    </button>
                                </form>
                                <div class="mt-4 text-center">
                                    <p class="text-sm text-gray-500">Secure payment powered by ZenoPay</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Complete Payment',
                        amount: '15,000',
                        currency: 'TZS',
                        description: 'One-time payment for full access'
                    },
                    styles: {
                        backgroundColor: '#ffffff'
                    }
                }
            },

            'contact-form': {
                name: 'Contact Form',
                icon: 'fas fa-envelope',
                color: 'text-indigo-500',
                template: (data) => `
                    <div class="py-16 md:py-20" style="background-color: ${data.styles.backgroundColor};">
                        <div class="max-w-2xl mx-auto px-4">
                            <h2 class="text-3xl font-bold text-center mb-8">${data.content.title}</h2>
                            <p class="text-lg text-center text-gray-600 mb-8">${data.content.description}</p>
                            <form class="space-y-6" id="contactForm">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input type="text" required
                                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" required
                                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea rows="4" required
                                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                `,
                defaultData: {
                    content: {
                        title: 'Contact Us',
                        description: 'Get in touch with us for any questions or support.'
                    },
                    styles: {
                        backgroundColor: '#ffffff'
                    }
                }
            }
        };
    }

    getComponent(type) {
        return this.components[type];
    }

    getAllComponents() {
        return this.components;
    }

    createComponent(type) {
        const component = this.getComponent(type);
        if (!component) {
            throw new Error(`Component type "${type}" not found`);
        }

        return {
            id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            content: { ...component.defaultData.content },
            styles: { ...component.defaultData.styles }
        };
    }

    renderComponent(component) {
        const componentDef = this.getComponent(component.type);
        if (!componentDef) {
            return '<div>Component not found</div>';
        }

        return componentDef.template(component);
    }

    getComponentProperties(component) {
        const componentDef = this.getComponent(component.type);
        if (!componentDef) return [];

        const properties = [];

        // Content properties
        Object.keys(component.content).forEach(key => {
            if (typeof component.content[key] === 'string') {
                properties.push({
                    type: 'text',
                    key: key,
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    value: component.content[key]
                });
            }
        });

        // Style properties
        properties.push(
            {
                type: 'color',
                key: 'backgroundColor',
                label: 'Background Color',
                value: component.styles.backgroundColor || '#ffffff'
            },
            {
                type: 'color',
                key: 'textColor',
                label: 'Text Color',
                value: component.styles.textColor || '#000000'
            }
        );

        return properties;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLibrary;
}
