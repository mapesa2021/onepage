# 🚀 Netlify Deployment Guide

## Overview
This guide explains how to deploy the Clubzila authentication system to Netlify with serverless functions.

## 📁 Project Structure
```
├── auth.html                 # Authentication page
├── templates.html           # Templates selection page
├── netlify-functions/       # Serverless functions
│   ├── clubzila-auth.js    # Clubzila authentication function
│   └── package.json        # Function dependencies
├── netlify.toml            # Netlify configuration
└── NETLIFY_DEPLOYMENT.md   # This file
```

## 🔧 Setup Instructions

### 1. Deploy to Netlify

#### Option A: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `.` (root directory)
5. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 2. Configure Environment Variables

In your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add the following variables:
   ```
   CLUBZILA_API_URL=https://clubzila.com
   ```

### 3. Install Function Dependencies

After deployment, you need to install the function dependencies:

1. Go to your Netlify dashboard
2. Navigate to Functions tab
3. Click on "clubzila-auth" function
4. In the function editor, you'll see a "Install dependencies" button
5. Click it to install axios

Alternatively, you can do this via CLI:
```bash
cd netlify-functions
npm install
netlify deploy --prod
```

## 🔍 How It Works

### Frontend Detection
The authentication page automatically detects if it's running on Netlify:
- **Localhost**: Uses `/api/clubzila/authenticate`
- **Netlify**: Uses `/.netlify/functions/clubzila-auth`

### Serverless Function
The `clubzila-auth.js` function:
1. Receives authentication requests
2. Handles CSRF token retrieval
3. Registers users with Clubzila
4. Returns authentication results

## 🧪 Testing

### Local Testing
```bash
# Start local server
npm start

# Test authentication
curl -X POST http://localhost:3002/api/clubzila/authenticate \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"0754546567","name":"Test User"}'
```

### Netlify Testing
1. Deploy to Netlify
2. Visit your site URL
3. Go to `/auth.html`
4. Test authentication with a phone number

## 🔧 Troubleshooting

### Common Issues

#### 1. "Function not found" Error
- Ensure `netlify-functions/` directory exists
- Check that `clubzila-auth.js` is in the functions directory
- Verify `netlify.toml` configuration

#### 2. "Module not found" Error
- Install dependencies in the functions directory
- Ensure `axios` is listed in `package.json`

#### 3. CORS Errors
- The function includes CORS headers
- Check that the function is properly deployed

#### 4. Authentication Fails
- Check Netlify function logs
- Verify Clubzila API is accessible
- Check environment variables

### Debugging

#### View Function Logs
1. Go to Netlify dashboard
2. Navigate to Functions tab
3. Click on your function
4. Check the "Logs" tab

#### Test Function Directly
```bash
# Test the function locally
netlify dev

# Test the function endpoint
curl -X POST http://localhost:8888/.netlify/functions/clubzila-auth \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"0754546567"}'
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLUBZILA_API_URL` | Clubzila API base URL | `https://clubzila.com` |

## 🔄 Updates

To update the deployment:
1. Push changes to GitHub
2. Netlify will automatically redeploy
3. Check function logs for any issues

## 📞 Support

If you encounter issues:
1. Check the function logs in Netlify dashboard
2. Verify all files are properly deployed
3. Test the function locally first
4. Check environment variables are set correctly
