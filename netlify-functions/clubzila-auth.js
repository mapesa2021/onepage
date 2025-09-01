// Simplified Clubzila Integration for Netlify Functions (No external dependencies)
const axios = require('axios');
const crypto = require('crypto');

class ClubzilaIntegration {
    constructor() {
        this.baseURL = 'https://clubzila.com';
        this.session = null;
        this.csrfToken = null;
        this.pendingUsers = new Map(); // Store pending users during OTP flow
    }

    async initialize() {
        try {
            console.log('🚀 Clubzila Integration initialized');
            console.log(`📡 Base URL: ${this.baseURL}`);
            
            // Get CSRF token and session
            await this.getCSRFToken();
            return true;
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            return false;
        }
    }

    async getCSRFToken() {
        try {
            const response = await axios.get(`${this.baseURL}/funnel/signup`, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            // Extract CSRF token from the page
            const csrfMatch = response.data.match(/name="_token" value="([^"]+)"/);
            if (csrfMatch) {
                this.csrfToken = csrfMatch[1];
                console.log('🎫 Extracted token:', this.csrfToken);
            }

            // Extract session cookie
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                this.session = setCookieHeader[0].split(';')[0];
                console.log('🍪 Session cookie extracted');
            }

            console.log('✅ CSRF token retrieved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to get CSRF token:', error.message);
            throw error;
        }
    }

    async checkUserExists(phoneNumber) {
        try {
            // For now, assume user doesn't exist to force registration flow
            // In production, you'd check against Clubzila's user database
            return { exists: false, message: 'User not found, proceeding with registration' };
        } catch (error) {
            console.error('❌ Error checking user existence:', error.message);
            return { exists: false, error: error.message };
        }
    }

    async requestOTP(phoneNumber, action = 'registration') {
        try {
            console.log(`📱 Requesting OTP for ${phoneNumber} (${action})`);
            
            const response = await axios.post(`${this.baseURL}/api/funnel/request-otp`, {
                phone_number: phoneNumber,
                action: action,
                country_code: '255'
            }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.data.success) {
                console.log(`✅ OTP requested successfully for ${phoneNumber}`);
                return {
                    success: true,
                    message: `OTP sent to ${phoneNumber}`,
                    data: response.data
                };
            } else {
                console.log(`❌ OTP request failed:`, response.data);
                return {
                    success: false,
                    message: 'Failed to send OTP',
                    error: response.data
                };
            }
        } catch (error) {
            console.error(`❌ OTP request error for ${phoneNumber}:`, error.message);
            return {
                success: false,
                message: 'OTP request failed',
                error: error.message
            };
        }
    }

    async verifyOTP(phoneNumber, otp, action = 'registration') {
        try {
            console.log(`🔐 Verifying OTP for ${phoneNumber} (${action})`);
            
            const response = await axios.post(`${this.baseURL}/api/funnel/verify-otp`, {
                phone_number: phoneNumber,
                otp: otp,
                action: action
            }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.data.success) {
                console.log(`✅ OTP verified successfully for ${phoneNumber}`);
                return {
                    success: true,
                    message: 'OTP verified successfully',
                    data: response.data
                };
            } else {
                console.log(`❌ OTP verification failed:`, response.data);
                return {
                    success: false,
                    message: 'Invalid OTP',
                    error: response.data
                };
            }
        } catch (error) {
            console.error(`❌ OTP verification error for ${phoneNumber}:`, error.message);
            return {
                success: false,
                message: 'OTP verification failed',
                error: error.message
            };
        }
    }

    async registerUser(phoneNumber, userData) {
        try {
            console.log(`👤 Registering user ${phoneNumber}`);
            
            const response = await axios.post(`${this.baseURL}/api/funnel/signup`, {
                name: userData.name || `User_${phoneNumber}`,
                phone_number: phoneNumber,
                email: `${phoneNumber}@clubzila.com`,
                password: userData.password || phoneNumber,
                countryCode: '255',
                agree_gdpr: true,
                'g-recaptcha-response': true,
                otp_verified: true, // Indicate OTP was verified
                referred_by: userData.referred_by || null,
                _token: this.csrfToken
            }, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Cookie': this.session
                }
            });

            if (response.data.success) {
                console.log(`✅ User ${phoneNumber} registered successfully`);
                return {
                    success: true,
                    message: 'User registered successfully',
                    data: {
                        user_data: response.data.data || response.data.user,
                        user_id: response.data.data?.id || response.data.user?.id
                    }
                };
            } else {
                console.log(`❌ User registration failed:`, response.data);
                return {
                    success: false,
                    message: 'User registration failed',
                    error: response.data
                };
            }
        } catch (error) {
            console.error(`❌ User registration error for ${phoneNumber}:`, error.message);
            return {
                success: false,
                message: 'User registration failed',
                error: error.message
            };
        }
    }

    async authenticateUser(phoneNumber, userData, otp, action = 'registration') {
        try {
            console.log(`🔐 Authenticating user ${phoneNumber} with OTP`);
            
            // Step 1: Check if user exists
            const userExists = await this.checkUserExists(phoneNumber);
            
            if (userExists.exists && action === 'registration') {
                return {
                    success: false,
                    message: 'User already exists. Use login instead.',
                    code: 'USER_EXISTS'
                };
            }
            
            if (!userExists.exists && action === 'login') {
                return {
                    success: false,
                    message: 'User not found. Please register first.',
                    code: 'USER_NOT_FOUND'
                };
            }

            // Step 2: Verify OTP
            const otpVerification = await this.verifyOTP(phoneNumber, otp, action);
            
            if (!otpVerification.success) {
                return {
                    success: false,
                    message: otpVerification.message,
                    error: otpVerification.error
                };
            }

            // Step 3: Handle based on action
            if (action === 'registration') {
                // Register new user after OTP verification
                const registration = await this.registerUser(phoneNumber, userData);
                
                if (registration.success) {
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
                        message: registration.message,
                        error: registration.error
                    };
                }
            } else {
                // Login existing user after OTP verification
                // Get user data from Clubzila
                const userResponse = await axios.get(`${this.baseURL}/api/user/profile`, {
                    params: { phone_number: phoneNumber },
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (userResponse.data.success) {
                    return {
                        success: true,
                        user: userResponse.data.data,
                        requiresOtp: false,
                        isActive: true,
                        isNewUser: false,
                        message: "User authenticated successfully"
                    };
                } else {
                    return {
                        success: false,
                        message: 'Failed to get user data',
                        error: userResponse.data
                    };
                }
            }
        } catch (error) {
            console.error(`❌ Authentication error for ${phoneNumber}:`, error.message);
            return {
                success: false,
                message: 'Authentication failed',
                error: error.message
            };
        }
    }
}

// Netlify function handler
exports.handler = async (event, context) => {
    try {
        console.log('🚀 Netlify function triggered');
        
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        const body = JSON.parse(event.body);
        const { phone_number, name, email, password, countryCode, action, otp } = body;

        if (!phone_number) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Phone number is required' })
            };
        }

        const clubzila = new ClubzilaIntegration();
        const initialized = await clubzila.initialize();

        if (!initialized) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to initialize Clubzila integration' })
            };
        }

        let result;

        if (action === 'request-otp') {
            // Request OTP for registration or login
            const isNewUser = !(await clubzila.checkUserExists(phone_number)).exists;
            const otpAction = isNewUser ? 'registration' : 'login';
            
            result = await clubzila.requestOTP(phone_number, otpAction);
            
            if (result.success) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true,
                        message: result.message,
                        isNewUser: isNewUser,
                        action: otpAction
                    })
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify(result)
                };
            }
        } else if (action === 'authenticate') {
            // Authenticate with OTP
            if (!otp) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'OTP is required for authentication' })
                };
            }

            const userExists = (await clubzila.checkUserExists(phone_number)).exists;
            const otpAction = userExists ? 'login' : 'registration';
            
            result = await clubzila.authenticateUser(phone_number, {
                name: name || `User_${phone_number}`,
                email: email || `${phone_number}@clubzila.com`,
                password: password || phone_number,
                countryCode: countryCode || '255'
            }, otp, otpAction);

            if (result.success) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(result)
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify(result)
                };
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid action. Use "request-otp" or "authenticate"' })
            };
        }

    } catch (error) {
        console.error('❌ Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
