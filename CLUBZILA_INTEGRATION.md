# Clubzila Integration Documentation

## Overview

This project now includes full Clubzila platform integration alongside the existing ZenoPay payment system. Clubzila provides user authentication, subscription management, and creator platform functionality.

## Features

- ✅ **User Authentication** - Phone number + OTP verification
- ✅ **User Registration** - Automatic user creation
- ✅ **Subscription Management** - Check and manage user subscriptions
- ✅ **Payment Processing** - Handle subscription payments
- ✅ **Creator Information** - Retrieve creator details and pricing
- ✅ **Webhook Handling** - Process Clubzila webhook events
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Retry Logic** - Automatic retry for failed requests

## Setup

### 1. Environment Configuration

Copy the environment variables to your `.env` file:

```bash
# Clubzila Configuration
CLUBZILA_API_URL=https://clubzila.com/api
CLUBZILA_API_KEY=your_clubzila_api_key_here
CLUBZILA_WEBHOOK_SECRET=your_clubzila_webhook_secret_here
CLUBZILA_TIMEOUT=30000
CLUBZILA_RETRY_ATTEMPTS=3
```

### 2. API Keys

You'll need to obtain the following from Clubzila:
- **API Key**: For making authenticated requests
- **Webhook Secret**: For validating webhook signatures

## API Endpoints

### Authentication Endpoints

#### Request OTP
```http
POST /api/clubzila/request-otp
Content-Type: application/json

{
  "phone_number": "0712345678"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": { ... }
}
```

#### Verify OTP
```http
POST /api/clubzila/verify-otp
Content-Type: application/json

{
  "phone_number": "0712345678",
  "otp": "123456"
}
```

#### Complete Authentication
```http
POST /api/clubzila/authenticate
Content-Type: application/json

{
  "phone_number": "0712345678",
  "otp": "123456"  // Optional
}
```

### User Management Endpoints

#### Get User Information
```http
POST /api/clubzila/get-user
Content-Type: application/json

{
  "phone_number": "0712345678"
}
```

#### Register New User
```http
POST /api/clubzila/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone_number": "0712345678",
  "password": "0712345678",
  "countryCode": "255",
  "agree_gdpr": true,
  "referred_by": "optional_referral_code"
}
```

### Subscription Endpoints

#### Check Subscription Status
```http
POST /api/clubzila/check-subscription
Content-Type: application/json

{
  "user_id": "user_123",
  "creator_id": "creator_456"
}
```

#### Process Payment
```http
POST /api/clubzila/process-payment
Content-Type: application/json

{
  "auth_id": "user_123",
  "creator_id": "creator_456",
  "phone_number": "0712345678",
  "amount": 5000  // Optional
}
```

#### Handle Complete Subscription Flow
```http
POST /api/clubzila/handle-subscription
Content-Type: application/json

{
  "user_id": "user_123",
  "creator_id": "creator_456",
  "phone_number": "0712345678",
  "auto_pay": true
}
```

### Creator Endpoints

#### Get Creator Information
```http
POST /api/clubzila/get-creator
Content-Type: application/json

{
  "creator_id": "creator_456"
}
```

### Webhook Endpoint

#### Clubzila Webhook
```http
POST /api/clubzila/webhook
Content-Type: application/json
X-Clubzila-Signature: signature_hash

{
  "event_type": "payment.completed",
  "data": { ... }
}
```

### Test Endpoint

#### Test Integration
```http
GET /api/clubzila/test
```

## Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// 1. Request OTP
const requestOtp = async (phoneNumber) => {
  const response = await axios.post('http://localhost:3002/api/clubzila/request-otp', {
    phone_number: phoneNumber
  });
  return response.data;
};

// 2. Authenticate User
const authenticateUser = async (phoneNumber, otp) => {
  const response = await axios.post('http://localhost:3002/api/clubzila/authenticate', {
    phone_number: phoneNumber,
    otp: otp
  });
  return response.data;
};

// 3. Check Subscription
const checkSubscription = async (userId, creatorId) => {
  const response = await axios.post('http://localhost:3002/api/clubzila/check-subscription', {
    user_id: userId,
    creator_id: creatorId
  });
  return response.data;
};

// 4. Process Payment
const processPayment = async (authId, creatorId, phoneNumber) => {
  const response = await axios.post('http://localhost:3002/api/clubzila/process-payment', {
    auth_id: authId,
    creator_id: creatorId,
    phone_number: phoneNumber
  });
  return response.data;
};
```

### Frontend Integration

```javascript
// Example: Complete authentication flow
async function loginWithClubzila(phoneNumber) {
  try {
    // Step 1: Request OTP
    const otpResponse = await fetch('/api/clubzila/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phoneNumber })
    });
    
    const otpResult = await otpResponse.json();
    
    if (otpResult.status === 'success') {
      // Show OTP input to user
      const otp = prompt('Enter OTP sent to your phone:');
      
      // Step 2: Verify OTP and authenticate
      const authResponse = await fetch('/api/clubzila/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          otp: otp 
        })
      });
      
      const authResult = await authResponse.json();
      
      if (authResult.status === 'success') {
        // User authenticated successfully
        console.log('User authenticated:', authResult.data);
        return authResult.data;
      }
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// Example: Check and handle subscription
async function handleCreatorSubscription(userId, creatorId, phoneNumber) {
  try {
    const response = await fetch('/api/clubzila/handle-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        creator_id: creatorId,
        phone_number: phoneNumber,
        auto_pay: true
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      if (result.data.has_subscription) {
        // User has active subscription
        console.log('Access granted!');
      } else if (result.data.payment_required) {
        // Payment required
        console.log('Payment required for access');
      }
    }
  } catch (error) {
    console.error('Subscription check failed:', error);
  }
}
```

## Webhook Events

The integration handles the following webhook events:

- `payment.completed` - Payment successfully completed
- `subscription.created` - New subscription created
- `subscription.cancelled` - Subscription cancelled
- `user.registered` - New user registered

### Webhook Configuration

Configure your webhook URL in Clubzila dashboard:
```
https://your-domain.com/api/clubzila/webhook
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common error scenarios:
- Invalid phone number format
- OTP verification failed
- User not found
- Payment processing failed
- Network connectivity issues

## Testing

### Test Integration
```bash
curl http://localhost:3002/api/clubzila/test
```

### Test Authentication Flow
```bash
# 1. Request OTP
curl -X POST http://localhost:3002/api/clubzila/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "0712345678"}'

# 2. Verify OTP (use OTP received)
curl -X POST http://localhost:3002/api/clubzila/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "0712345678", "otp": "123456"}'
```

## Security Considerations

1. **API Key Security**: Store API keys in environment variables
2. **Webhook Validation**: Always validate webhook signatures
3. **Phone Number Validation**: Validate phone number format
4. **Rate Limiting**: Implement rate limiting for OTP requests
5. **HTTPS**: Use HTTPS in production for all API calls

## Troubleshooting

### Common Issues

1. **OTP Not Received**
   - Check phone number format (07XXXXXXXX)
   - Verify API key is correct
   - Check Clubzila service status

2. **Authentication Fails**
   - Ensure OTP is entered correctly
   - Check if user exists in Clubzila
   - Verify API endpoints are accessible

3. **Payment Processing Issues**
   - Verify creator ID is valid
   - Check user authentication status
   - Ensure sufficient balance

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Support

For Clubzila platform support:
- API Documentation: https://clubzila.com/api/docs
- Support Email: support@clubzila.com
- Developer Portal: https://clubzila.com/developers
