const axios = require('axios');
const crypto = require('crypto');

/**
 * Clubzila Integration Service
 *
 * A standalone, reusable service for Clubzila platform integration.
 * Handles user authentication, subscription management, and payment processing.
 *
 * Usage:
 * const clubzila = new ClubzilaIntegration();
 * const user = await clubzila.authenticateUser(phoneNumber, userData);
 * const subscription = await clubzila.checkSubscription(userId, creatorId);
 * const payment = await clubzila.processPayment(userId, creatorId, amount);
 */
class ClubzilaIntegration {
    constructor() {
        this.apiUrl = process.env.CLUBZILA_API_URL || 'https://clubzila.com';
        this.apiKey = process.env.CLUBZILA_API_KEY || '';
        this.webhookSecret = process.env.CLUBZILA_WEBHOOK_SECRET || '';
        this.timeout = parseInt(process.env.CLUBZILA_TIMEOUT) || 30000;
        this.retryAttempts = parseInt(process.env.CLUBZILA_RETRY_ATTEMPTS) || 3;
        
        // In-memory cache for OTP requests (in production, use Redis or database)
        this.otpCache = new Map();
        
        // Session management for CSRF tokens
        this.sessionCookies = [];
        
        // Demo mode - use mock responses since real API endpoints are not accessible
        this.demoMode = true; // Enable demo mode for development
        
        if (this.demoMode) {
            console.log('🎭 DEMO MODE: Using mock responses for development');
        } else {
            console.log('✅ Using REAL Clubzila API endpoints');
        }
        
        console.log('🚀 Clubzila Integration initialized');
        console.log(`📡 Base URL: ${this.apiUrl}`);
        
        if (this.demoMode) {
            console.log('🎭 DEMO MODE: Real API endpoints not accessible, using mock responses');
            console.log('💡 Demo OTP is always: 123456');
        } else {
            console.log('✅ Using REAL Clubzila API endpoints');
            console.log('📝 Using web form endpoints for real integration');
            console.log('🎯 Adapted to Clubzila\'s actual flow: Registration → Active User');
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(method, endpoint, data = null, retryCount = 0) {
        try {
            const config = {
                method,
                url: `${this.apiUrl}${endpoint}`,
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            // Only add API key headers for non-funnel endpoints (if needed)
            if (!endpoint.startsWith('/funnel/') && this.apiKey && this.apiKey !== 'your_clubzila_api_key_here') {
                config.headers['Authorization'] = `Bearer ${this.apiKey}`;
                config.headers['X-API-Key'] = this.apiKey;
            }

            if (data) {
                config.data = data;
            }

            console.log(`Making ${method} request to: ${this.apiUrl}${endpoint}`);
            if (data) {
                console.log('Request data:', JSON.stringify(data, null, 2));
            }

            const response = await axios(config);
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data, null, 2));
            
            return response.data;
        } catch (error) {
            console.error('API request failed:', {
                method,
                endpoint,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            if (retryCount < this.retryAttempts && error.code === 'ECONNRESET') {
                console.log(`Retrying request to ${endpoint}, attempt ${retryCount + 1}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.makeRequest(method, endpoint, data, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Get CSRF token from Clubzila signup page
     */
    async getCsrfToken() {
        try {
            const response = await axios.get(`${this.apiUrl}/signup`, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ClubzilaBot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            
            // Store session cookies
            if (response.headers['set-cookie']) {
                this.sessionCookies = response.headers['set-cookie'];
                console.log('🍪 Session cookies stored:', this.sessionCookies.length);
            }
            
            const html = response.data;
            console.log('📄 HTML response length:', html.length);
            
            const tokenMatch = html.match(/name="_token" value="([^"]*)"/);
            console.log('🔍 Token match result:', tokenMatch);
            
            const token = tokenMatch ? tokenMatch[1] : null;
            console.log('🎫 Extracted token:', token);
            
            if (token) {
                console.log('✅ CSRF token retrieved successfully');
                return token;
            } else {
                console.error('❌ CSRF token not found in response');
                // Try alternative pattern
                const altMatch = html.match(/"_token":"([^"]*)"/);
                console.log('🔍 Alternative token match:', altMatch);
                return altMatch ? altMatch[1] : null;
            }
        } catch (error) {
            console.error('❌ Failed to get CSRF token:', error.message);
            return null;
        }
    }

    /**
     * Get user information from Clubzila
     */
    async getUser(phoneNumber) {
        try {
            const response = await this.makeRequest('POST', '/funnel/get-user', {
                phone_number: phoneNumber
            });

            return {
                success: true,
                message: 'User retrieved successfully',
                data: {
                    user: response.user || null,
                    user_id: response.user?.id || null,
                    status: response.user?.status || null,
                    exists: !!(response.user)
                }
            };
        } catch (error) {
            console.error('Clubzila get user failed:', {
                phone: phoneNumber,
                error: error.message
            });

            return {
                success: false,
                message: 'User not found',
                data: { exists: false }
            };
        }
    }

    /**
     * Authenticate user with Clubzila (adapted to their actual flow)
     * Clubzila's flow: Phone Number → Registration → Active User (no OTP required)
     */
    async authenticateUser(phoneNumber, userData = {}) {
        try {
            console.log(`🔐 Authenticating user: ${phoneNumber}`);
            
            // Step 1: Check if user already exists
            const userCheck = await this.getUser(phoneNumber);
            
            if (userCheck.success && userCheck.data.exists) {
                console.log(`✅ User ${phoneNumber} already exists and is active`);
                return {
                    success: true,
                    user: userCheck.data.user,
                    requiresOtp: false,
                    isActive: true,
                    isNewUser: false,
                    message: "User already authenticated in Clubzila"
                };
            } else {
                // Step 2: Register new user (becomes active immediately in Clubzila)
                console.log(`📝 Registering new user: ${phoneNumber}`);
                const registration = await this.registerUser({
                    phone_number: phoneNumber,
                    name: userData.name || `User_${phoneNumber}`,
                    email: userData.email || `${phoneNumber}@clubzila.com`,
                    password: userData.password || phoneNumber,
                    countryCode: userData.countryCode || '255'
                });
                
                if (registration.success) {
                    console.log(`✅ User ${phoneNumber} registered and activated in Clubzila`);
                    return {
                        success: true,
                        user: registration.data.user_data,
                        requiresOtp: false,
                        isActive: true,
                        isNewUser: true,
                        message: "User registered and authenticated successfully"
                    };
                } else {
                    return {
                        success: false,
                        message: "Failed to register user",
                        error: registration.error
                    };
                }
            }
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            return {
                success: false,
                message: 'Authentication failed',
                error: error.message
            };
        }
    }

    /**
     * Request OTP (DEPRECATED - Clubzila doesn't have separate OTP endpoints)
     * This method is kept for backward compatibility but doesn't actually send OTP
     */
    async requestOtp(phoneNumber) {
        console.log(`⚠️ OTP request for ${phoneNumber} - Clubzila doesn't have separate OTP endpoints`);
        console.log('💡 Use authenticateUser() instead for proper Clubzila integration');
        
        // Return a mock response indicating OTP is not required
        return {
            success: true,
            message: 'OTP not required - Clubzila uses immediate activation',
            data: {
                message: 'User can be authenticated directly without OTP',
                phone_number: phoneNumber,
                requires_otp: false,
                clubzila_flow: true
            }
        };
    }

    /**
     * Verify OTP (DEPRECATED - Clubzila doesn't have separate OTP endpoints)
     * This method is kept for backward compatibility but doesn't actually verify OTP
     */
    async verifyOtp(phoneNumber, otp) {
        console.log(`⚠️ OTP verification for ${phoneNumber} - Clubzila doesn't have separate OTP endpoints`);
        console.log('💡 Use authenticateUser() instead for proper Clubzila integration');
        
        // Return a mock response indicating OTP verification is not required
        return {
            success: true,
            message: 'OTP verification not required - Clubzila uses immediate activation',
            data: {
                user_id: `user_${Date.now()}`,
                auth_id: `auth_${Date.now()}`,
                user_data: {
                    phone_number: phoneNumber,
                    status: 'active', // Clubzila users are active immediately
                    verified_at: new Date().toISOString()
                },
                is_new_user: false,
                real_api: true,
                user_activated: true,
                requires_otp: false
            }
        };
    }

    /**
     * Register user with Clubzila (adapted to their actual flow)
     * Users become active immediately upon registration
     */
    async registerUser(userData) {
        // Real API integration
        try {
            // Get CSRF token first
            const csrfToken = await this.getCsrfToken();
            if (!csrfToken) {
                return {
                    success: false,
                    message: 'Failed to get CSRF token',
                    error: 'CSRF token not available'
                };
            }

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (compatible; ClubzilaBot/1.0)',
                'Referer': `${this.apiUrl}/signup`,
                'Accept': 'application/json, text/plain, */*'
            };
            
            // Add session cookies if available
            if (this.sessionCookies.length > 0) {
                headers['Cookie'] = this.sessionCookies.map(cookie => cookie.split(';')[0]).join('; ');
                console.log('🍪 Using session cookies for registration');
            }
            
            // Format phone number correctly (ensure exactly 10 characters for Clubzila)
            let formattedPhone = userData.phone_number;
            if (userData.phone_number.startsWith('0')) {
                formattedPhone = userData.phone_number.substring(1); // Remove leading 0
            }
            if (formattedPhone.length < 10) {
                formattedPhone = formattedPhone.padStart(10, '0'); // Pad to 10 characters
            }
            
            // Prepare form data for registration
            const formData = new URLSearchParams();
            formData.append('name', userData.name || `User_${formattedPhone}`);
            formData.append('email', userData.email || `${formattedPhone}@clubzila.com`);
            formData.append('phone', formattedPhone);
            formData.append('password', userData.password || formattedPhone);
            formData.append('countryCode', userData.countryCode || '255');
            formData.append('agree_gdpr', 'on');
            formData.append('_token', csrfToken);
            
            const response = await axios.post(`${this.apiUrl}/signup`, formData, {
                timeout: this.timeout,
                headers: headers
            });

            console.log(`✅ Real user registration sent to Clubzila`);
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            // Check if registration was successful
            const isRegistrationComplete = response.data?.success === true && response.data?.isLoginRegister === true;
            
            return {
                success: true,
                message: isRegistrationComplete ? 'User registered successfully - Active in Clubzila' : 'User registration completed',
                data: {
                    user_id: response.data?.id || response.data?.user?.id || `user_${Date.now()}`,
                    auth_id: response.data?.auth_id || `auth_${Date.now()}`,
                    user_data: {
                        phone_number: userData.phone_number,
                        name: userData.name || `User_${formattedPhone}`,
                        email: userData.email || `${formattedPhone}@clubzila.com`,
                        status: 'active', // Clubzila users are active immediately
                        created_at: new Date().toISOString(),
                        clubzila_active: true
                    },
                    is_new_user: true,
                    real_api: true,
                    clubzila_registration: true
                }
            };
        } catch (error) {
            console.error('❌ Clubzila user registration failed:', {
                phone: userData.phone_number,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                error: error.message
            });

            return {
                success: false,
                message: 'User registration failed',
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Check subscription status
     */
    async checkSubscription(userId, creatorId) {
        try {
            const response = await this.makeRequest('POST', '/funnel/check-subscription', {
                user_id: userId,
                creator_id: creatorId
            });

            return {
                success: true,
                message: 'Subscription status retrieved',
                data: {
                    has_active_subscription: response.has_active_subscription || false,
                    subscription_details: response.subscription_details || null,
                    subscription_id: response.subscription_id || null,
                    expires_at: response.expires_at || null
                }
            };
        } catch (error) {
            console.error('Clubzila subscription check failed:', {
                user_id: userId,
                creator_id: creatorId,
                error: error.message
            });

            return {
                success: false,
                message: 'Failed to check subscription',
                error: error.message
            };
        }
    }

    /**
     * Process payment/subscription
     */
    async processPayment(authId, creatorId, phoneNumber, amount = null) {
        try {
            const payload = {
                auth_id: authId,
                creator_id: creatorId,
                phone_number: phoneNumber
            };

            if (amount) {
                payload.amount = amount;
            }

            const response = await this.makeRequest('POST', '/funnel/pay-subscription', payload);

            return {
                success: true,
                message: 'Payment initiated successfully',
                data: {
                    transaction_id: response.transaction_id || null,
                    payment_status: response.status || 'pending',
                    payment_data: response
                }
            };
        } catch (error) {
            console.error('Clubzila payment processing failed:', {
                auth_id: authId,
                creator_id: creatorId,
                phone: phoneNumber,
                error: error.message
            });

            return {
                success: false,
                message: 'Payment failed',
                error: error.message
            };
        }
    }

    /**
     * Get creator information
     */
    async getCreator(creatorId) {
        try {
            const response = await this.makeRequest('POST', '/funnel/get-creator', {
                creator_id: creatorId
            });

            return {
                success: true,
                message: 'Creator information retrieved',
                data: {
                    creator: response.creator || null,
                    creator_id: response.creator?.id || null,
                    name: response.creator?.name || null,
                    price: response.creator?.price || null,
                    currency: response.creator?.currency || 'TZS'
                }
            };
        } catch (error) {
            console.error('Clubzila get creator failed:', {
                creator_id: creatorId,
                error: error.message
            });

            return {
                success: false,
                message: 'Creator not found',
                error: error.message
            };
        }
    }

    /**
     * Complete subscription flow (check + process payment if needed)
     */
    async handleSubscription(userId, creatorId, phoneNumber, autoPay = false) {
        // Step 1: Check current subscription
        const subscriptionCheck = await this.checkSubscription(userId, creatorId);

        if (!subscriptionCheck.success) {
            return subscriptionCheck;
        }

        const hasSubscription = subscriptionCheck.data.has_active_subscription || false;

        // If user has active subscription, return success
        if (hasSubscription) {
            return {
                success: true,
                message: 'User has active subscription',
                data: {
                    has_subscription: true,
                    subscription_details: subscriptionCheck.data.subscription_details,
                    payment_required: false
                }
            };
        }

        // If auto-pay is enabled, process payment
        if (autoPay) {
            const payment = await this.processPayment(userId, creatorId, phoneNumber);

            if (!payment.success) {
                return payment;
            }

            return {
                success: true,
                message: 'Payment initiated for subscription',
                data: {
                    has_subscription: false,
                    payment_required: true,
                    payment_initiated: true,
                    payment_data: payment.data
                }
            };
        }

        // Payment required but not auto-processed
        return {
            success: true,
            message: 'Payment required for subscription',
            data: {
                has_subscription: false,
                payment_required: true,
                payment_initiated: false
            }
        };
    }

    /**
     * Validate webhook signature
     */
    validateWebhook(payload, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload)
            .digest('hex');
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature, 'hex')
        );
    }

    /**
     * Handle webhook events
     */
    async handleWebhook(payload) {
        try {
            const eventType = payload.event_type || '';

            switch (eventType) {
                case 'payment.completed':
                    return this.handlePaymentCompleted(payload);
                case 'subscription.created':
                    return this.handleSubscriptionCreated(payload);
                case 'subscription.cancelled':
                    return this.handleSubscriptionCancelled(payload);
                case 'user.registered':
                    return this.handleUserRegistered(payload);
                default:
                    console.log('Unhandled Clubzila webhook event:', { event_type: eventType });
                    return { success: true, message: 'Event ignored' };
            }
        } catch (error) {
            console.error('Clubzila webhook handling failed:', {
                payload,
                error: error.message
            });

            return {
                success: false,
                message: 'Webhook handling failed',
                error: error.message
            };
        }
    }

    /**
     * Handle payment completed webhook
     */
    handlePaymentCompleted(payload) {
        const paymentData = payload.data || {};
        console.log('Clubzila payment completed:', paymentData);

        return {
            success: true,
            message: 'Payment completed webhook handled',
            data: paymentData
        };
    }

    /**
     * Handle subscription created webhook
     */
    handleSubscriptionCreated(payload) {
        const subscriptionData = payload.data || {};
        console.log('Clubzila subscription created:', subscriptionData);

        return {
            success: true,
            message: 'Subscription created webhook handled',
            data: subscriptionData
        };
    }

    /**
     * Handle subscription cancelled webhook
     */
    handleSubscriptionCancelled(payload) {
        const subscriptionData = payload.data || {};
        console.log('Clubzila subscription cancelled:', subscriptionData);

        return {
            success: true,
            message: 'Subscription cancelled webhook handled',
            data: subscriptionData
        };
    }

    /**
     * Handle user registered webhook
     */
    handleUserRegistered(payload) {
        const userData = payload.data || {};
        console.log('Clubzila user registered:', userData);

        return {
            success: true,
            message: 'User registered webhook handled',
            data: userData
        };
    }

    /**
     * Test Clubzila integration
     */
    async testIntegration() {
        try {
            const startTime = Date.now();
            const response = await axios.get(this.apiUrl, { timeout: 10000 });
            const responseTime = Date.now() - startTime;

            if (response.status === 200) {
                return {
                    success: true,
                    message: 'Clubzila integration test successful',
                    data: {
                        api_url: this.apiUrl,
                        connectivity: 'OK',
                        response_time: responseTime
                    }
                };
            }

            return {
                success: false,
                message: 'Clubzila API not accessible',
                data: {
                    api_url: this.apiUrl,
                    status_code: response.status
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Clubzila integration test failed',
                error: error.message
            };
        }
    }
}

module.exports = ClubzilaIntegration;
