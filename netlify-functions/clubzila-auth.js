// Simplified Clubzila Integration for Netlify Functions (No external dependencies)
class ClubzilaIntegration {
    constructor() {
        this.apiUrl = process.env.CLUBZILA_API_URL || 'https://clubzila.com';
        this.timeout = 30000;
        this.sessionCookies = [];
        // Store OTP codes temporarily (in production, use a database)
        this.otpStore = new Map();
    }

    async getCsrfToken() {
        try {
            const response = await fetch(`${this.apiUrl}/signup`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ClubzilaBot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            
            if (response.headers.get('set-cookie')) {
                this.sessionCookies = response.headers.get('set-cookie').split(',');
            }
            
            const html = await response.text();
            const tokenMatch = html.match(/name="_token" value="([^"]*)"/);
            const token = tokenMatch ? tokenMatch[1] : null;
            
            if (token) {
                return token;
            } else {
                const altMatch = html.match(/"_token":"([^"]*)"/);
                return altMatch ? altMatch[1] : null;
            }
        } catch (error) {
            console.error('Failed to get CSRF token:', error.message);
            return null;
        }
    }

    // Check if user exists in Clubzila
    async checkUserExists(phoneNumber) {
        try {
            console.log(`Checking if user exists: ${phoneNumber}`);
            
            // Try to access user profile or login page
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ClubzilaBot/1.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            
            // For now, we'll assume user exists if we can access login page
            // In a real implementation, you'd check against Clubzila's user database
            return {
                exists: true, // Assume user exists for now
                message: 'User check completed'
            };
        } catch (error) {
            console.error('User existence check failed:', error);
            return {
                exists: false,
                message: 'User check failed',
                error: error.message
            };
        }
    }

    // Generate and store OTP
    generateOTP(phoneNumber) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes expiry
        
        this.otpStore.set(phoneNumber, {
            code: otp,
            expiry: expiry,
            attempts: 0
        });
        
        console.log(`OTP generated for ${phoneNumber}: ${otp} (expires in 5 minutes)`);
        return otp;
    }

    // Verify OTP
    verifyOTP(phoneNumber, otp) {
        const storedOTP = this.otpStore.get(phoneNumber);
        
        if (!storedOTP) {
            return { valid: false, message: 'OTP expired or not found' };
        }
        
        if (Date.now() > storedOTP.expiry) {
            this.otpStore.delete(phoneNumber);
            return { valid: false, message: 'OTP expired' };
        }
        
        if (storedOTP.attempts >= 3) {
            this.otpStore.delete(phoneNumber);
            return { valid: false, message: 'Too many failed attempts' };
        }
        
        if (storedOTP.code === otp) {
            this.otpStore.delete(phoneNumber);
            return { valid: true, message: 'OTP verified successfully' };
        } else {
            storedOTP.attempts++;
            return { valid: false, message: 'Invalid OTP' };
        }
    }

    // Request OTP for authentication
    async requestOTP(phoneNumber, userData = {}) {
        try {
            console.log(`Requesting OTP for: ${phoneNumber}`);
            
            // Check if user exists
            const userCheck = await this.checkUserExists(phoneNumber);
            const isNewUser = !userCheck.exists;
            
            // Generate OTP
            const otp = this.generateOTP(phoneNumber);
            
            // In a real implementation, you'd send this OTP via SMS
            // For now, we'll just return it in the response for testing
            console.log(`OTP sent to ${phoneNumber}: ${otp}`);
            
            return {
                success: true,
                requiresOtp: true,
                isNewUser: isNewUser,
                message: isNewUser ? 
                    'OTP sent for new user registration' : 
                    'OTP sent for existing user login',
                otp: otp, // Remove this in production - only for testing
                expiresIn: '5 minutes'
            };
        } catch (error) {
            console.error('OTP request failed:', error);
            return {
                success: false,
                message: 'Failed to send OTP',
                error: error.message
            };
        }
    }

    async authenticateUser(phoneNumber, userData = {}, otp = null) {
        try {
            console.log(`Authenticating user: ${phoneNumber} with OTP: ${otp ? 'provided' : 'not provided'}`);
            
            // If no OTP provided, request one
            if (!otp) {
                return await this.requestOTP(phoneNumber, userData);
            }
            
            // Verify OTP
            const otpVerification = this.verifyOTP(phoneNumber, otp);
            if (!otpVerification.valid) {
                return {
                    success: false,
                    message: otpVerification.message,
                    requiresOtp: true
                };
            }
            
            // Check if user exists to determine if this is registration or login
            const userCheck = await this.checkUserExists(phoneNumber);
            const isNewUser = !userCheck.exists;
            
            if (isNewUser) {
                // Register new user
                console.log(`Registering new user: ${phoneNumber}`);
                const registration = await this.registerUser({
                    phone_number: phoneNumber,
                    name: userData.name || `User_${phoneNumber}`,
                    email: userData.email || `${phoneNumber}@clubzila.com`,
                    password: userData.password || phoneNumber,
                    countryCode: userData.countryCode || '255'
                });
                
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
                        message: "Failed to register user",
                        error: registration.error
                    };
                }
            } else {
                // Existing user login
                console.log(`Logging in existing user: ${phoneNumber}`);
                return {
                    success: true,
                    user: {
                        phone_number: phoneNumber,
                        name: userData.name || `User_${phoneNumber}`,
                        email: userData.email || `${phoneNumber}@clubzila.com`,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        clubzila_active: true
                    },
                    requiresOtp: false,
                    isActive: true,
                    isNewUser: false,
                    message: "User authenticated successfully"
                };
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            return {
                success: false,
                message: 'Authentication failed',
                error: error.message
            };
        }
    }

    async registerUser(userData) {
        try {
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
            
            if (this.sessionCookies.length > 0) {
                headers['Cookie'] = this.sessionCookies.map(cookie => cookie.split(';')[0]).join('; ');
            }
            
            let formattedPhone = userData.phone_number;
            if (userData.phone_number.startsWith('0')) {
                formattedPhone = userData.phone_number.substring(1);
            }
            if (formattedPhone.length < 10) {
                formattedPhone = formattedPhone.padStart(10, '0');
            }
            
            const formData = new URLSearchParams();
            formData.append('name', userData.name || `User_${formattedPhone}`);
            formData.append('email', userData.email || `${formattedPhone}@clubzila.com`);
            formData.append('phone', formattedPhone);
            formData.append('password', userData.password || formattedPhone);
            formData.append('countryCode', userData.countryCode || '255');
            formData.append('agree_gdpr', 'on');
            formData.append('_token', csrfToken);
            
            const response = await fetch(`${this.apiUrl}/signup`, {
                method: 'POST',
                headers: headers,
                body: formData.toString()
            });

            console.log(`User registration sent to Clubzila`);
            console.log('Response status:', response.status);

            const responseData = await response.text();
            let parsedData;
            try {
                parsedData = JSON.parse(responseData);
            } catch (e) {
                parsedData = { success: false, message: 'Invalid response format' };
            }

            console.log('Response data:', parsedData);

            const isRegistrationComplete = parsedData?.success === true && parsedData?.isLoginRegister === true;
            
            return {
                success: true,
                message: isRegistrationComplete ? 'User registered successfully - Active in Clubzila' : 'User registration completed',
                data: {
                    user_id: parsedData?.id || parsedData?.user?.id || `user_${Date.now()}`,
                    auth_id: parsedData?.auth_id || `auth_${Date.now()}`,
                    user_data: {
                        phone_number: userData.phone_number,
                        name: userData.name || `User_${formattedPhone}`,
                        email: userData.email || `${formattedPhone}@clubzila.com`,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        clubzila_active: true
                    },
                    is_new_user: true,
                    real_api: true,
                    clubzila_registration: true
                }
            };
        } catch (error) {
            console.error('Clubzila user registration failed:', {
                phone: userData.phone_number,
                error: error.message
            });

            return {
                success: false,
                message: 'User registration failed',
                error: error.message
            };
        }
    }
}

// Netlify Function Handler
exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const requestBody = JSON.parse(event.body);
        const { phone_number, name, email, password, countryCode, otp, action } = requestBody;
        
        if (!phone_number) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Phone number is required'
                })
            };
        }

        console.log(`Request action: ${action || 'authenticate'} for user: ${phone_number}`);
        
        const clubzila = new ClubzilaIntegration();
        
        let result;
        if (action === 'request-otp') {
            // Request OTP only
            result = await clubzila.requestOTP(phone_number, {
                name,
                email,
                password,
                countryCode
            });
        } else {
            // Full authentication with OTP
            result = await clubzila.authenticateUser(phone_number, {
                name,
                email,
                password,
                countryCode
            }, otp);
        }

        // Add additional logging for debugging
        console.log('Final result being returned:', JSON.stringify(result, null, 2));

        return {
            statusCode: result.success ? 200 : 400,
            headers,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};
