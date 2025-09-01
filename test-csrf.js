const axios = require('axios');

async function testCsrfToken() {
    try {
        console.log('🔍 Testing CSRF token extraction...');
        
        const response = await axios.get('https://clubzila.com/signup', {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ClubzilaBot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        
        console.log('📄 Response status:', response.status);
        console.log('📄 Response length:', response.data.length);
        
        const html = response.data;
        
        // Try multiple patterns
        const patterns = [
            /name="_token" value="([^"]*)"/,
            /"_token":"([^"]*)"/,
            /_token.*?value="([^"]*)"/,
            /csrf.*?value="([^"]*)"/
        ];
        
        for (let i = 0; i < patterns.length; i++) {
            const match = html.match(patterns[i]);
            console.log(`🔍 Pattern ${i + 1}:`, match);
            if (match) {
                console.log(`✅ Found token with pattern ${i + 1}:`, match[1]);
                return match[1];
            }
        }
        
        // Look for any token-like strings
        const tokenLike = html.match(/[A-Za-z0-9]{32,}/g);
        console.log('🔍 Token-like strings found:', tokenLike ? tokenLike.slice(0, 5) : 'None');
        
        console.log('❌ No CSRF token found');
        return null;
        
    } catch (error) {
        console.error('❌ Error testing CSRF token:', error.message);
        return null;
    }
}

testCsrfToken();
