# 🚀 Deployment Guide - Landing Page Builder

Complete guide to deploy your landing page builder system to production.

## 📋 Prerequisites

- GitHub account
- Supabase account
- Railway/Vercel account
- Domain name (optional)

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Set database password
5. Choose region closest to your users

### 1.2 Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy content from `supabase-schema.sql`
3. Paste and run the SQL commands
4. Verify tables are created

### 1.3 Get API Credentials
1. Go to Settings → API
2. Copy your project URL and anon key
3. Save for environment variables

## 🌐 Step 2: Backend Deployment (Railway)

### 2.1 Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### 2.2 Set Environment Variables
Add these variables in Railway dashboard:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Payment Integration
ZENOPAY_API_KEY=your_zenopay_api_key

# Cloud Storage (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 2.3 Deploy Backend
1. Railway will automatically deploy on push
2. Get your backend URL (e.g., `https://your-app.railway.app`)
3. Test health endpoint: `https://your-app.railway.app/health`

## ⚡ Step 3: Frontend Deployment (Vercel)

### 3.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings

### 3.2 Configure Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### 3.3 Set Environment Variables
Add these in Vercel dashboard:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
REACT_APP_API_URL=https://your-backend.railway.app

# Analytics (optional)
REACT_APP_GA_ID=your_google_analytics_id
```

### 3.4 Deploy Frontend
1. Vercel will build and deploy automatically
2. Get your frontend URL (e.g., `https://your-app.vercel.app`)
3. Test the application

## 🔗 Step 4: Custom Domain Setup

### 4.1 Add Domain in Vercel
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 4.2 Configure DNS Records
Add these records to your domain provider:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.19
```

### 4.3 SSL Certificate
- Vercel automatically provides SSL certificates
- Wait for DNS propagation (up to 48 hours)

## 📊 Step 5: Analytics Setup

### 5.1 Google Analytics
1. Create Google Analytics account
2. Add tracking code to your app
3. Configure goals and events

### 5.2 Performance Monitoring
1. Set up Google PageSpeed Insights
2. Configure Core Web Vitals monitoring
3. Set up alerts for performance issues

## 🔒 Step 6: Security Configuration

### 6.1 Environment Variables
- Never commit sensitive data to Git
- Use environment variables for all secrets
- Rotate keys regularly

### 6.2 CORS Configuration
Update your backend CORS settings:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'https://www.your-frontend-domain.com'
  ],
  credentials: true
}));
```

### 6.3 Rate Limiting
Configure rate limiting for production:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

## 🧪 Step 7: Testing

### 7.1 Health Checks
Test these endpoints:
- `GET /health` - Backend health
- `GET /api/pages` - API functionality
- Frontend loading and navigation

### 7.2 Payment Testing
1. Test ZenoPay integration
2. Verify webhook functionality
3. Test payment flow end-to-end

### 7.3 Performance Testing
1. Run Lighthouse audits
2. Test mobile responsiveness
3. Check Core Web Vitals

## 📈 Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring
1. Configure error tracking (Sentry)
2. Set up uptime monitoring
3. Configure performance alerts

### 8.2 Backup Strategy
1. Set up database backups
2. Configure file storage backups
3. Test restore procedures

### 8.3 Update Strategy
1. Set up automatic dependency updates
2. Configure staging environment
3. Plan deployment windows

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
railway logs

# Verify environment variables
railway variables

# Test locally
npm start
```

#### Frontend Build Fails
```bash
# Check build logs
vercel logs

# Test build locally
npm run build

# Check dependencies
npm audit
```

#### Database Connection Issues
1. Verify Supabase credentials
2. Check network connectivity
3. Verify RLS policies

#### Payment Integration Issues
1. Check ZenoPay API key
2. Verify webhook URL
3. Test with sandbox environment

## 📞 Support

### Getting Help
1. Check application logs
2. Review error messages
3. Test in staging environment
4. Contact support with detailed information

### Useful Commands
```bash
# Check backend status
curl https://your-backend.railway.app/health

# Check frontend
curl -I https://your-frontend.vercel.app

# View logs
railway logs
vercel logs
```

## 🎯 Next Steps

### Post-Deployment
1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan scaling strategies
4. Document procedures

### Optimization
1. Implement CDN for static assets
2. Optimize database queries
3. Add caching layers
4. Monitor performance metrics

---

**Your landing page builder is now live! 🎉**

Visit your domain to start building amazing landing pages.
