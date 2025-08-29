const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

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

        // Check if this is a test payment for your phone number
        if (buyer_phone === '0750278741') {
            console.log('Test payment detected for phone: 0750278741');
            
            // Simulate successful payment for test user
            const testResult = {
                status: 'success',
                message: 'Test payment successful',
                order_id: order_id
            };

            // Store payment info for status checking
            pendingPayments.set(order_id, {
                buyer_name,
                buyer_email,
                buyer_phone,
                amount,
                status: 'COMPLETED', // Mark as completed for test
                created_at: new Date(),
                is_test: true
            });

            return res.json(testResult);
        }

        // Call ZenoPay API for real payments
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

        // Check if this is a test payment
        if (pendingPayments.has(order_id)) {
            const localPayment = pendingPayments.get(order_id);
            if (localPayment.is_test && localPayment.status === 'COMPLETED') {
                return res.json({
                    status: 'success',
                    payment_status: 'COMPLETED',
                    message: 'Test payment completed successfully'
                });
            }
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

// Start server
app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Mobile access: http://192.168.100.14:${PORT}/health`);
    }
});

module.exports = app;
