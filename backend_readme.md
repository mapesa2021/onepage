# ZenoPay Backend Server

Secure backend server for handling ZenoPay mobile money payments in Tanzania.

## 🔒 Security Features

- **API Key Protection**: ZenoPay API key stored securely in environment variables
- **Input Validation**: Server-side validation of all payment data
- **Webhook Authentication**: Verifies webhook authenticity using API key
- **CORS Protection**: Configured for secure cross-origin requests
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment example
cp env.example .env

# Edit .env file with your actual values
nano .env
```

### 3. Required Environment Variables
```env
ZENOPAY_API_KEY=your_actual_zenopay_api_key
WEBHOOK_URL=https://your-domain.com/api/payments/webhook
PORT=3000
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### 1. Initiate Payment
**POST** `/api/payments/initiate-payment`

**Request Body:**
```json
{
  "order_id": "order_1234567890_abc123",
  "buyer_name": "John Doe",
  "buyer_email": "john@example.com",
  "buyer_phone": "0744963858",
  "amount": 15000
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment initiated successfully",
  "order_id": "order_1234567890_abc123"
}
```

### 2. Check Payment Status
**GET** `/api/payments/payment-status?order_id=order_1234567890_abc123`

**Response:**
```json
{
  "status": "success",
  "payment_status": "COMPLETED",
  "reference": "0936183435",
  "channel": "MPESA-TZ"
}
```

### 3. Webhook Endpoint
**POST** `/api/payments/webhook`

Receives payment status updates from ZenoPay.

### 4. Get All Payments (Admin)
**GET** `/api/payments`

Returns all payment records (for admin dashboard).

### 5. Health Check
**GET** `/health`

Returns server health status.

## 🔧 Configuration

### Frontend Configuration
Update your frontend `BACKEND_CONFIG` in `index.html`:

```javascript
const BACKEND_CONFIG = {
    apiUrl: 'https://your-backend-domain.com/api/payments',
    webhookUrl: 'https://your-domain.com/payment-webhook'
};
```

### ZenoPay Webhook Setup
1. Log into your ZenoPay dashboard
2. Set webhook URL to: `https://your-domain.com/api/payments/webhook`
3. Ensure webhook authentication is enabled

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server will run on http://localhost:3000
```

### Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test payment initiation
curl -X POST http://localhost:3000/api/payments/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_order_123",
    "buyer_name": "Test User",
    "buyer_email": "test@example.com",
    "buyer_phone": "0744963858",
    "amount": 1000
  }'
```

## 🚀 Deployment

### Heroku Deployment
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set ZENOPAY_API_KEY=your_api_key
heroku config:set WEBHOOK_URL=https://your-app-name.herokuapp.com/api/payments/webhook

# Deploy
git push heroku main
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

## 📧 Email Integration

The server includes a placeholder for sending course access emails. Implement your preferred email service:

### SendGrid Example
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendCourseAccessEmail(email, name) {
    const msg = {
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Course Access - Digital Products Mastery',
        html: `
            <h2>Karibu ${name}!</h2>
            <p>Malipo yako yamefanikiwa. Video yako iko hapa:</p>
            <a href="https://your-course-url.com">Jifunze Sasa</a>
        `
    };
    
    await sgMail.send(msg);
}
```

## 🔍 Monitoring

### Logs
The server logs all payment activities:
- Payment initiation
- Status updates
- Webhook receipts
- Errors

### Health Monitoring
```bash
# Check server health
curl https://your-domain.com/health
```

## 🛡️ Security Best Practices

1. **Never expose API keys** in frontend code
2. **Use HTTPS** in production
3. **Validate all inputs** server-side
4. **Implement rate limiting** for production
5. **Use environment variables** for sensitive data
6. **Regular security updates** for dependencies

## 📞 Support

For issues or questions:
- Check server logs for errors
- Verify environment variables
- Test with ZenoPay sandbox first
- Contact ZenoPay support for API issues

## 📄 License

MIT License - feel free to use and modify for your projects.
