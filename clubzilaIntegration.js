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
 * const user = await clubzila.authenticateUser(phoneNumber, otp);
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
        
        // Demo mode - use mock responses since real API endpoints are not accessible
        this.demoMode = !this.apiKey || this.apiKey === 'your_clubzila_api_key_here';
        
        if (!this.demoMode) {
            console.log('✅ Using REAL Clubzila API endpoints');
        }
        
        console.log('🚀 Clubzila Integration initialized');
        console.log(`📡 Base URL: ${this.apiUrl}`);
        console.log('🎭 Running in DEMO MODE - using mock responses');
        console.log('💡 Real API endpoints not accessible, simulating responses for testing');
        console.log('📝 Note: Clubzila uses web form endpoints, not separate API endpoints');
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
     * Request OTP for phone number
     */
    async requestOtp(phoneNumber) {
        // Demo mode - return mock response
        if (this.demoMode) {
            // Generate a mock OTP (123456 for demo purposes)
            const mockOtp = '123456';
            
            // Store OTP in cache for verification
            this.otpCache.set(`otp_${phoneNumber}`, mockOtp);
            this.otpCache.set(`otp_request_${phoneNumber}`, true);
            
            // Auto-clear after 5 minutes
            setTimeout(() => {
                this.otpCache.delete(`otp_${phoneNumber}`);
                this.otpCache.delete(`otp_request_${phoneNumber}`);
            }, 300000);

            console.log(`🎭 DEMO MODE: OTP ${mockOtp} sent to ${phoneNumber}`);
            
            return {
                success: true,
                message: 'OTP sent successfully (DEMO MODE)',
                data: {
                    message: 'OTP sent successfully',
                    demo_mode: true,
                    otp: mockOtp // Only for demo - remove in production
                }
            };
        }

        try {
            // Clubzila doesn't have a separate OTP endpoint - it's part of the signup process
            // We'll simulate the OTP request for demo purposes
            const response = await this.makeRequest('POST', '/signup', {
                phone_number: phoneNumber,
                _token: 'demo_token'
            });

            // Cache OTP request for 60 seconds
            this.otpCache.set(`otp_request_${phoneNumber}`, true);
            setTimeout(() => {
                this.otpCache.delete(`otp_request_${phoneNumber}`);
            }, 60000);

            return {
                success: true,
                message: 'OTP sent successfully',
                data: response
            };
        } catch (error) {
            console.error('Clubzila OTP request failed:', {
                phone: phoneNumber,
                error: error.message
            });

            return {
                success: false,
                message: 'OTP request failed',
                error: error.message
            };
        }
    }

    /**
     * Verify OTP and authenticate user
     */
    async verifyOtp(phoneNumber, otp) {
        // Demo mode - verify against cached OTP
        if (this.demoMode) {
            const cachedOtp = this.otpCache.get(`otp_${phoneNumber}`);
            
            if (cachedOtp && cachedOtp === otp) {
                // Generate mock user data
                const mockUserId = Math.floor(Math.random() * 100000) + 10000;
                const mockAuthId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                console.log(`🎭 DEMO MODE: OTP verified for ${phoneNumber}, User ID: ${mockUserId}`);
                
                return {
                    success: true,
                    message: 'OTP verified successfully (DEMO MODE)',
                    data: {
                        user_id: mockUserId.toString(),
                        auth_id: mockAuthId,
                        user_data: {
                            phone_number: phoneNumber,
                            id: mockUserId,
                            status: 'active'
                        },
                        is_new_user: true,
                        demo_mode: true
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid OTP (DEMO MODE)',
                    error: 'OTP does not match'
                };
            }
        }

        try {
            // Clubzila doesn't have a separate OTP verification endpoint
            // We'll simulate the verification for demo purposes
            const response = await this.makeRequest('POST', '/verify/2fa', {
                phone_number: phoneNumber,
                code: otp,
                _token: 'demo_token'
            });

            return {
                success: true,
                message: 'OTP verified successfully',
                data: {
                    user_id: response.user_id || null,
                    auth_id: response.auth_id || null,
                    user_data: response.user || null,
                    is_new_user: response.is_new_user || false
                }
            };
        } catch (error) {
            console.error('Clubzila OTP verification failed:', {
                phone: phoneNumber,
                error: error.message
            });

            return {
                success: false,
                message: 'Invalid OTP',
                error: error.message
            };
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
     * Register new user with Clubzila
     */
    async registerUser(userData) {
        // Demo mode - return mock registration response
        if (this.demoMode) {
            const mockUserId = Math.floor(Math.random() * 100000) + 10000;
            const mockAuthId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            console.log(`🎭 DEMO MODE: User registered successfully`, {
                phone: userData.phone_number,
                name: userData.name,
                user_id: mockUserId
            });
            
            return {
                success: true,
                message: 'User registered successfully (DEMO MODE)',
                data: {
                    user_id: mockUserId.toString(),
                    auth_id: mockAuthId,
                    user_data: {
                        id: mockUserId,
                        phone_number: userData.phone_number,
                        name: userData.name,
                        status: 'active',
                        created_at: new Date().toISOString()
                    },
                    demo_mode: true
                }
            };
        }

        try {
            const response = await this.makeRequest('POST', '/signup', {
                name: userData.name || userData.phone_number,
                email: userData.email || `${userData.phone_number}@demo.com`,
                phone: userData.phone_number,
                password: userData.password || userData.phone_number,
                countryCode: userData.countryCode || '255',
                agree_gdpr: userData.agree_gdpr !== false,
                _token: 'demo_token'
            });

            return {
                success: true,
                message: 'User registered successfully',
                data: {
                    user_id: response.data?.id || response.user?.id || null,
                    auth_id: response.data?.id || response.user?.id || null,
                    user_data: response.data || response.user || null
                }
            };
        } catch (error) {
            console.error('Clubzila user registration failed:', {
                user_data: userData,
                error: error.message
            });

            return {
                success: false,
                message: 'User registration failed',
                error: error.message
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
     * Complete authentication flow (OTP request + verification)
     */
    async authenticateUser(phoneNumber, otp = null) {
        // Step 1: Check if user exists
        const userCheck = await this.getUser(phoneNumber);

        if (!userCheck.success) {
            return userCheck;
        }

        const userExists = userCheck.data.exists || false;
        const userId = userCheck.data.user_id || null;
        const userStatus = userCheck.data.status || null;

        // If user exists and is active, no OTP needed
        if (userExists && userStatus === 'active') {
            return {
                success: true,
                message: 'User authenticated successfully',
                data: {
                    user_id: userId,
                    auth_id: userId,
                    is_new_user: false,
                    requires_otp: false,
                    user_data: userCheck.data.user
                }
            };
        }

        // If user doesn't exist, register them
        if (!userExists) {
            const registration = await this.registerUser({
                name: phoneNumber,
                phone_number: phoneNumber,
                password: phoneNumber
            });

            if (!registration.success) {
                return registration;
            }

            userId = registration.data.user_id;
        }

        // If OTP is provided, verify it
        if (otp) {
            const otpVerification = await this.verifyOtp(phoneNumber, otp);

            if (!otpVerification.success) {
                return otpVerification;
            }

            return {
                success: true,
                message: 'User authenticated successfully',
                data: {
                    user_id: userId,
                    auth_id: otpVerification.data.auth_id || userId,
                    is_new_user: otpVerification.data.is_new_user || false,
                    requires_otp: false,
                    user_data: otpVerification.data.user_data
                }
            };
        }

        // OTP required
        return {
            success: true,
            message: 'OTP required for authentication',
            data: {
                user_id: userId,
                auth_id: userId,
                is_new_user: !userExists,
                requires_otp: true
            }
        };
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
