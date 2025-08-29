# 🚀 Landing Page Builder - Full Stack System

A complete drag-and-drop landing page builder with user management, custom URLs, analytics, and cloud deployment.

## ✨ Features

### 🎨 **Builder Interface**
- **Drag & Drop Editor** - Intuitive visual page builder
- **Component Library** - 8+ pre-built components (Hero, Text, Image, Testimonials, Forms, etc.)
- **Real-time Preview** - See changes instantly
- **Responsive Design** - Mobile-first approach
- **Custom Styling** - Advanced CSS customization

### 👥 **User Management**
- **User Registration/Login** - Secure authentication
- **Dashboard** - Manage multiple landing pages
- **Profile Settings** - Update account information
- **Subscription Tiers** - Free and premium plans

### 📊 **Analytics & Performance**
- **Page Analytics** - Track views, conversions, engagement
- **Performance Monitoring** - Load time, Core Web Vitals
- **Real-time Tracking** - Live visitor data
- **Conversion Funnel** - Track user journey

### 🌐 **Publishing & Hosting**
- **Custom URLs** - Generate unique page URLs
- **Public Pages** - Share pages with the world
- **SEO Optimization** - Meta tags, structured data
- **CDN Integration** - Global content delivery

### 💳 **Payment Integration**
- **ZenoPay Integration** - Mobile money payments (Tanzania)
- **Secure Processing** - Backend payment handling
- **Webhook Support** - Real-time payment notifications
- **Test Mode** - Safe testing environment

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Builder Interface
├── User Dashboard
├── Analytics Dashboard
├── Settings Management
└── Public Page Viewer

Backend (Node.js + Express)
├── User Authentication
├── Page Management API
├── Payment Processing
├── Analytics Tracking
└── File Upload/Storage

Database (Supabase)
├── User Profiles
├── Page Data
├── Analytics Events
├── Templates
└── Assets

Infrastructure
├── Cloud Hosting (Railway/Vercel)
├── CDN (Cloudflare)
├── File Storage (Cloudinary)
└── SSL Certificates
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Railway/Vercel account (for deployment)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/landing-page-builder.git
cd landing-page-builder
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Fill in your environment variables:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Payment Integration
ZENOPAY_API_KEY=your_zenopay_api_key

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema in `supabase-schema.sql`
3. Update your environment variables with Supabase credentials

### 4. Start Development
```bash
# Start backend server
npm run dev

# Start frontend (in another terminal)
npm run dev:client

# Or start both together
npm run dev:full
```

### 5. Access the Application
- **Builder**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API Health**: http://localhost:3000/health

## 📁 Project Structure

```
landing-page-builder/
├── src/                          # Frontend React app
│   ├── components/               # Reusable UI components
│   ├── pages/                   # Page components
│   │   ├── Builder.tsx          # Main builder interface
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Preview.tsx          # Page preview
│   │   ├── Analytics.tsx        # Analytics dashboard
│   │   └── Settings.tsx         # User settings
│   ├── utils/                   # Utility functions
│   │   └── supabaseClient.ts    # Supabase client
│   ├── store/                   # State management
│   ├── types/                   # TypeScript types
│   └── hooks/                   # Custom React hooks
├── server.js                    # Backend Express server
├── supabase-schema.sql          # Database schema
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── README.md                   # This file
```

## 🎯 Usage Guide

### Creating Your First Landing Page

1. **Sign Up/Login**
   - Register with email and password
   - Access your dashboard

2. **Create New Page**
   - Click "Create New Page"
   - Choose a template or start from scratch
   - Give your page a title

3. **Build Your Page**
   - Drag components from the sidebar
   - Customize content and styling
   - Preview in real-time

4. **Publish**
   - Click "Publish" to make it live
   - Get a custom URL to share
   - Track performance in analytics

### Component Types

- **Hero Sections** - Headlines, CTAs, background images
- **Text Content** - Rich text, headings, paragraphs
- **Image Sections** - Product showcases, galleries
- **Testimonials** - Customer reviews, social proof
- **Contact Forms** - Lead capture, contact information
- **Payment Forms** - ZenoPay integration
- **Navigation** - Menus, links, buttons
- **Footers** - Links, social media, branding

## 🔧 Customization

### Adding Custom Components
```typescript
// src/components/CustomComponent.tsx
const CustomComponent = ({ content, styles }) => {
  return (
    <section style={styles}>
      {/* Your custom component */}
    </section>
  );
};
```

### Custom Styling
```css
/* src/styles/custom.css */
.custom-theme {
  --primary-color: #your-color;
  --font-family: 'Your Font', sans-serif;
}
```

### API Extensions
```javascript
// server.js
app.post('/api/custom-endpoint', authenticateToken, async (req, res) => {
  // Your custom API logic
});
```

## 📊 Analytics & Performance

### Tracking Events
```javascript
// Track page view
trackEvent(pageId, 'page_view');

// Track conversion
trackEvent(pageId, 'conversion', { value: 100 });
```

### Performance Metrics
- **Page Load Time** - Optimized for speed
- **Core Web Vitals** - LCP, FID, CLS
- **Mobile Performance** - Responsive design
- **SEO Score** - Meta tags, structured data

## 🚀 Deployment

### Railway Deployment
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Vercel Deployment
1. Import your repository
2. Configure build settings
3. Deploy with preview URLs

### Custom Domain
1. Add domain in hosting provider
2. Configure DNS records
3. Enable SSL certificate

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Cross-origin security
- **Input Validation** - Sanitize user input
- **HTTPS Only** - Encrypted connections

## 💳 Payment Integration

### ZenoPay Setup
1. Get API credentials from ZenoPay
2. Configure webhook URL
3. Test with sandbox environment

### Payment Flow
1. User clicks payment button
2. ZenoPay payment form opens
3. Payment processed securely
4. Webhook confirms success
5. User redirected to success page

## 📈 Analytics Dashboard

### Metrics Tracked
- **Page Views** - Total and unique visitors
- **Conversion Rate** - Goal completions
- **Session Duration** - User engagement
- **Traffic Sources** - Referrer analysis
- **Device Types** - Mobile vs desktop

### Real-time Data
- Live visitor count
- Current page activity
- Recent conversions
- Performance alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/landing-page-builder/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/landing-page-builder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/landing-page-builder/discussions)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic drag-and-drop builder
- ✅ User authentication
- ✅ Page publishing
- ✅ Analytics tracking

### Phase 2 (Next)
- 🔄 Advanced components
- 🔄 A/B testing
- 🔄 Email integration
- 🔄 Custom domains

### Phase 3 (Future)
- 📋 White-label solution
- 📋 Team collaboration
- 📋 Advanced analytics
- 📋 API marketplace

---

**Built with ❤️ using React, Node.js, and Supabase**
