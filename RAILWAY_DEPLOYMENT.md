# 🚀 Railway Deployment Guide

## Prerequisites
- GitHub account (✅ You have this)
- Railway account (free signup)
- ZenoPay API key (✅ You have this)

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Sign in with your GitHub account

## Step 2: Connect Your Repository
1. Select your repository: `mapesa2021/onepage`
2. Railway will automatically detect it's a Node.js project
3. Click "Deploy Now"

## Step 3: Set Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
ZENOPAY_API_KEY=ArtYqYpjmi8UjbWqxhCe7SLqpSCbws-_7vjudTuGR91PT6pmWX85lapiuq7xpXsJ2BkPZ9gkxDEDotPgtjdV6g
NODE_ENV=production
WEBHOOK_URL=https://your-railway-domain.railway.app/api/payments/webhook
```

## Step 4: Get Your Railway URL
1. Go to your project's "Settings" tab
2. Copy the "Domain" URL (e.g., `https://your-app-name.railway.app`)
3. This is your production backend URL

## Step 5: Update Frontend
Once deployed, I'll update the frontend to use your Railway URL.

## Step 6: Deploy Frontend
The frontend can be deployed to:
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)

## 🎯 Expected Timeline
- Railway setup: 5-10 minutes
- Frontend update: 2-3 minutes
- Total: ~15 minutes

## ✅ Success Indicators
- Railway shows "Deploy Successful"
- Health check passes: `https://your-app-name.railway.app/health`
- Payment system works worldwide

## 🆘 Troubleshooting
- If deployment fails, check Railway logs
- Ensure all environment variables are set
- Verify GitHub repository is public or Railway has access
