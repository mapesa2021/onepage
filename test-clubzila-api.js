const axios = require('axios');

async function testClubzilaAPI() {
    console.log('🧪 Testing Clubzila API endpoints...\n');
    
    const baseURL = 'https://clubzila.com';
    
    try {
        // Test 1: Check if Clubzila is accessible and find working endpoints
        console.log('1️⃣ Testing basic connectivity and finding working endpoints...');
        
        // Try common Laravel endpoints
        const commonEndpoints = [
            '/',
            '/signup',
            '/register',
            '/login',
            '/auth',
            '/api',
            '/otp',
            '/verification'
        ];
        
        let workingEndpoint = null;
        let workingResponse = null;
        
        for (const endpoint of commonEndpoints) {
            try {
                console.log(`   Testing: ${endpoint}`);
                const response = await axios.get(`${baseURL}${endpoint}`, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.status === 200) {
                    console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
                    workingEndpoint = endpoint;
                    workingResponse = response;
                    break;
                }
            } catch (error) {
                const status = error.response?.status || 'Failed';
                console.log(`   ❌ ${endpoint} - ${status}`);
            }
        }
        
        if (!workingEndpoint) {
            console.log('❌ No working endpoints found');
            return;
        }
        
        console.log(`\n✅ Found working endpoint: ${workingEndpoint}`);
        console.log(`   Content length: ${workingResponse.data.length} characters\n`);
        
        // Test 2: Analyze the working page for OTP functionality
        console.log('2️⃣ Analyzing page content for OTP functionality...');
        const html = workingResponse.data;
        
        // Look for OTP-related content
        const otpKeywords = ['otp', 'OTP', 'verification', 'verification code', 'sms', 'SMS', 'phone verification'];
        let foundOtpContent = [];
        
        otpKeywords.forEach(keyword => {
            if (html.toLowerCase().includes(keyword.toLowerCase())) {
                foundOtpContent.push(keyword);
            }
        });
        
        if (foundOtpContent.length > 0) {
            console.log('✅ Found OTP-related content:');
            foundOtpContent.forEach(content => console.log(`   - ${content}`));
        } else {
            console.log('❌ No OTP-related content found');
        }
        
        // Test 3: Look for forms and their action URLs
        console.log('\n3️⃣ Analyzing forms and their endpoints...');
        const formMatches = html.match(/<form[^>]*action="([^"]*)"[^>]*>/gi);
        if (formMatches) {
            console.log('✅ Found forms with actions:');
            formMatches.forEach(form => {
                const actionMatch = form.match(/action="([^"]*)"/);
                if (actionMatch) {
                    console.log(`   - ${actionMatch[1]}`);
                }
            });
        } else {
            console.log('❌ No forms with actions found');
        }
        
        // Test 4: Look for CSRF token
        console.log('\n4️⃣ Checking for CSRF token...');
        const csrfMatch = html.match(/name="_token" value="([^"]+)"/);
        if (csrfMatch) {
            console.log('✅ CSRF token found:', csrfMatch[1].substring(0, 20) + '...');
        } else {
            console.log('❌ No CSRF token found');
        }
        
        // Test 5: Look for JavaScript that might handle OTP
        console.log('\n5️⃣ Checking for JavaScript OTP handling...');
        const scriptMatches = html.match(/<script[^>]*src="([^"]*)"[^>]*>/gi);
        if (scriptMatches) {
            console.log('✅ Found JavaScript files:');
            scriptMatches.forEach(script => {
                const srcMatch = script.match(/src="([^"]*)"/);
                if (srcMatch) {
                    console.log(`   - ${srcMatch[1]}`);
                }
            });
        }
        
        // Test 6: Try to find the actual OTP endpoint by testing common patterns
        console.log('\n6️⃣ Testing common OTP endpoint patterns...');
        const otpEndpoints = [
            '/api/otp/request',
            '/api/auth/otp',
            '/otp/request',
            '/api/sms/otp',
            '/api/verify/otp',
            '/auth/otp',
            '/verification/otp',
            '/api/user/otp'
        ];
        
        for (const endpoint of otpEndpoints) {
            try {
                console.log(`   Testing: ${endpoint}`);
                const testResponse = await axios.post(`${baseURL}${endpoint}`, {
                    phone_number: '0754546567',
                    action: 'registration',
                    country_code: '255'
                }, {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                console.log(`   ✅ ${endpoint} - Status: ${testResponse.status}`);
                console.log(`      Response:`, testResponse.data);
                break; // Found working endpoint
            } catch (error) {
                const status = error.response?.status || 'Failed';
                const message = error.response?.data?.message || error.message;
                console.log(`   ❌ ${endpoint} - ${status}: ${message}`);
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:');
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        }
    }
}

// Run the test
testClubzilaAPI().catch(console.error);
