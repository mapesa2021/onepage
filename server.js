const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Import Clubzila integration
const ClubzilaIntegration = require('./clubzilaIntegration');

// Import authentication middleware
const AuthMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize middleware
const authMiddleware = new AuthMiddleware();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve Clubzila demo page
app.get('/clubzila-demo', (req, res) => {
    res.sendFile(__dirname + '/clubzila-demo.html');
});

// Authentication routes
app.get('/auth/login', (req, res) => {
    res.sendFile(__dirname + '/auth/login.html');
});

app.get('/auth/register', (req, res) => {
    res.sendFile(__dirname + '/auth/register.html');
});

// Serve landing page templates (protected routes)
app.get('/templates', (req, res) => {
    res.sendFile(__dirname + '/templates/selector.html');
});

app.get('/templates/1', (req, res) => {
    res.sendFile(__dirname + '/templates/template-1.html');
});

app.get('/templates/2', (req, res) => {
    res.sendFile(__dirname + '/templates/template-2.html');
});

app.get('/templates/3', (req, res) => {
    res.sendFile(__dirname + '/templates/template-3.html');
});

// ZenoPay Configuration (stored securely in environment variables)
const ZENOPAY_CONFIG = {
    apiKey: process.env.ZENOPAY_API_KEY,
    apiUrl: 'https://zenoapi.com/api/payments/mobile_money_tanzania',
    statusUrl: 'https://zenoapi.com/api/payments/order-status'
};

// Store pending payments (in production, use a database)
const pendingPayments = new Map();

// Initiate Payment Endpoint
app.post('/api/payments/initiate-payment', async (req, res) => {
    try {
        const { order_id, buyer_name, buyer_email, buyer_phone, amount, webhook_url } = req.body;

        // Validate required fields
        if (!buyer_name || !buyer_email || !buyer_phone || !amount) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        // Validate phone number format
        if (!buyer_phone.match(/^07\d{8}$/)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number format. Use 07XXXXXXXX'
            });
        }

        // Prepare payment data for ZenoPay
        const paymentData = {
            order_id,
            buyer_name,
            buyer_email,
            buyer_phone,
            amount,
            webhook_url: process.env.WEBHOOK_URL || webhook_url
        };

        // Call ZenoPay API
        const zenoPayResponse = await axios.post(ZENOPAY_CONFIG.apiUrl, paymentData, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ZENOPAY_CONFIG.apiKey
            }
        });

        const zenoPayResult = zenoPayResponse.data;

        if (zenoPayResult.status === 'success') {
            // Store payment info for status checking
            pendingPayments.set(order_id, {
                buyer_name,
                buyer_email,
                buyer_phone,
                amount,
                status: 'PENDING',
                created_at: new Date()
            });

            // Return success to frontend
            res.json({
                status: 'success',
                message: 'Payment initiated successfully',
                order_id: order_id
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: zenoPayResult.message || 'Payment initiation failed'
            });
        }

    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Check Payment Status Endpoint
app.get('/api/payments/payment-status', async (req, res) => {
    try {
        const { order_id } = req.query;

        if (!order_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Order ID is required'
            });
        }

        // Check ZenoPay for payment status
        const zenoPayResponse = await axios.get(`${ZENOPAY_CONFIG.statusUrl}?order_id=${order_id}`, {
            headers: {
                'x-api-key': ZENOPAY_CONFIG.apiKey
            }
        });

        const zenoPayResult = zenoPayResponse.data;

        if (zenoPayResult.result === 'SUCCESS' && zenoPayResult.data && zenoPayResult.data[0]) {
            const paymentData = zenoPayResult.data[0];
            
            // Update local payment status
            if (pendingPayments.has(order_id)) {
                const localPayment = pendingPayments.get(order_id);
                localPayment.status = paymentData.payment_status;
                pendingPayments.set(order_id, localPayment);
            }

            res.json({
                status: 'success',
                payment_status: paymentData.payment_status,
                reference: paymentData.reference,
                channel: paymentData.channel
            });
        } else {
            res.json({
                status: 'pending',
                payment_status: 'PENDING'
            });
        }

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check payment status'
        });
    }
});

// Webhook Endpoint (for ZenoPay callbacks)
app.post('/api/payments/webhook', async (req, res) => {
    try {
        // Verify webhook authenticity (check x-api-key header)
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== ZENOPAY_CONFIG.apiKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { order_id, payment_status, reference, metadata } = req.body;

        console.log('Webhook received:', {
            order_id,
            payment_status,
            reference,
            metadata
        });

        // Update payment status
        if (pendingPayments.has(order_id)) {
            const payment = pendingPayments.get(order_id);
            payment.status = payment_status;
            payment.reference = reference;
            payment.updated_at = new Date();
            pendingPayments.set(order_id, payment);

            // If payment is completed, send email with course access
            if (payment_status === 'COMPLETED') {
                await sendCourseAccessEmail(payment.buyer_email, payment.buyer_name);
            }
        }

        res.json({ status: 'success' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Send course access email (implement your email service)
async function sendCourseAccessEmail(email, name) {
    try {
        // Implement your email service here (SendGrid, Mailgun, etc.)
        console.log(`Sending course access email to ${email} for ${name}`);
        
        // Example email content:
        // - Course video link
        // - Login credentials
        // - Support contact
        
    } catch (error) {
        console.error('Email sending error:', error);
    }
}

// Get all payments (for admin dashboard)
app.get('/api/payments', (req, res) => {
    const payments = Array.from(pendingPayments.entries()).map(([order_id, payment]) => ({
        order_id,
        ...payment
    }));
    
    res.json({
        status: 'success',
        data: payments
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Initialize Clubzila integration
const clubzilaIntegration = new ClubzilaIntegration();

// Clubzila Authentication Endpoints
app.post('/api/clubzila/authenticate', async (req, res) => {
    try {
        const { phone_number, name, email, password, countryCode } = req.body;
        
        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        console.log(`🔐 Authenticating user: ${phone_number}`);
        
        // Use the new authenticateUser method (adapted to Clubzila's flow)
        const result = await clubzilaIntegration.authenticateUser(phone_number, {
            name,
            email,
            password,
            countryCode
        });

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                data: {
                    user: result.user,
                    requiresOtp: result.requiresOtp,
                    isActive: result.isActive,
                    isNewUser: result.isNewUser
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
});

// Legacy OTP endpoints (kept for backward compatibility)
app.post('/api/clubzila/request-otp', async (req, res) => {
    try {
        const { phone_number } = req.body;
        
        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        console.log(`⚠️ Legacy OTP request for: ${phone_number}`);
        console.log('💡 This endpoint is deprecated - use /api/clubzila/authenticate instead');
        
        // Return information about the new flow
        res.json({
            success: true,
            message: 'OTP not required - Clubzila uses immediate activation',
            data: {
                message: 'Use /api/clubzila/authenticate for proper authentication',
                phone_number: phone_number,
                requires_otp: false,
                clubzila_flow: true,
                deprecated: true
            }
        });
    } catch (error) {
        console.error('❌ OTP request error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP request failed',
            error: error.message
        });
    }
});

app.post('/api/clubzila/verify-otp', async (req, res) => {
    try {
        const { phone_number, otp } = req.body;
        
        if (!phone_number || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        console.log(`⚠️ Legacy OTP verification for: ${phone_number}`);
        console.log('💡 This endpoint is deprecated - use /api/clubzila/authenticate instead');
        
        // Return information about the new flow
        res.json({
            success: true,
            message: 'OTP verification not required - Clubzila uses immediate activation',
            data: {
                user_id: `user_${Date.now()}`,
                auth_id: `auth_${Date.now()}`,
                user_data: {
                    phone_number: phone_number,
                    status: 'active',
                    verified_at: new Date().toISOString()
                },
                is_new_user: false,
                real_api: true,
                user_activated: true,
                requires_otp: false,
                deprecated: true
            }
        });
    } catch (error) {
        console.error('❌ OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed',
            error: error.message
        });
    }
});

// Clubzila User Management Endpoints
app.post('/api/clubzila/get-user', async (req, res) => {
    try {
        const { phone_number } = req.body;
        
        if (!phone_number) {
            return res.status(400).json({
                status: 'error',
                message: 'Phone number is required'
            });
        }

        const result = await clubzilaIntegration.getUser(phone_number);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila get user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.post('/api/clubzila/register', async (req, res) => {
    try {
        const userData = req.body;
        
        if (!userData.phone_number) {
            return res.status(400).json({
                status: 'error',
                message: 'Phone number is required'
            });
        }

        const result = await clubzilaIntegration.registerUser(userData);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Clubzila Subscription Endpoints
app.post('/api/clubzila/check-subscription', async (req, res) => {
    try {
        const { user_id, creator_id } = req.body;
        
        if (!user_id || !creator_id) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID and Creator ID are required'
            });
        }

        const result = await clubzilaIntegration.checkSubscription(user_id, creator_id);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila subscription check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.post('/api/clubzila/process-payment', async (req, res) => {
    try {
        const { auth_id, creator_id, phone_number, amount } = req.body;
        
        if (!auth_id || !creator_id || !phone_number) {
            return res.status(400).json({
                status: 'error',
                message: 'Auth ID, Creator ID, and Phone Number are required'
            });
        }

        const result = await clubzilaIntegration.processPayment(auth_id, creator_id, phone_number, amount);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila payment processing error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.post('/api/clubzila/handle-subscription', async (req, res) => {
    try {
        const { user_id, creator_id, phone_number, auto_pay } = req.body;
        
        if (!user_id || !creator_id || !phone_number) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID, Creator ID, and Phone Number are required'
            });
        }

        const result = await clubzilaIntegration.handleSubscription(user_id, creator_id, phone_number, auto_pay);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila subscription handling error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Clubzila Creator Endpoints
app.post('/api/clubzila/get-creator', async (req, res) => {
    try {
        const { creator_id } = req.body;
        
        if (!creator_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Creator ID is required'
            });
        }

        const result = await clubzilaIntegration.getCreator(creator_id);
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila get creator error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Clubzila Webhook Endpoint
app.post('/api/clubzila/webhook', async (req, res) => {
    try {
        const payload = req.body;
        const signature = req.headers['x-clubzila-signature'] || req.headers['x-webhook-signature'];
        
        // Validate webhook signature if secret is configured
        if (process.env.CLUBZILA_WEBHOOK_SECRET && signature) {
            const isValid = clubzilaIntegration.validateWebhook(JSON.stringify(payload), signature);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }
        }

        const result = await clubzilaIntegration.handleWebhook(payload);
        
        if (result.success) {
            res.json({ status: 'success', message: result.message });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Clubzila Integration Test Endpoint
app.get('/api/clubzila/test', async (req, res) => {
    try {
        const result = await clubzilaIntegration.testIntegration();
        
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Clubzila integration test error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Integration test failed'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
