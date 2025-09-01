const ClubzilaIntegration = require('./clubzilaIntegration');

async function testRealApi() {
    try {
        console.log('🧪 Testing Real API Integration...');
        
        const clubzila = new ClubzilaIntegration();
        
        console.log('\n1️⃣ Testing CSRF Token Retrieval...');
        const token = await clubzila.getCsrfToken();
        console.log('Token result:', token);
        
        if (token) {
            console.log('\n2️⃣ Testing OTP Request...');
            const otpResult = await clubzila.requestOtp('0754546567');
            console.log('OTP result:', JSON.stringify(otpResult, null, 2));
        } else {
            console.log('❌ Cannot proceed without CSRF token');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testRealApi();
