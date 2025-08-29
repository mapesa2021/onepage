-- Landing Page Builder Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    components JSONB NOT NULL DEFAULT '[]',
    settings JSONB NOT NULL DEFAULT '{}',
    custom_url VARCHAR(255) UNIQUE,
    public_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    data JSONB,
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    components JSONB NOT NULL,
    settings JSONB NOT NULL,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page assets table
CREATE TABLE page_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_custom_url ON pages(custom_url);
CREATE INDEX idx_analytics_page_id ON analytics(page_id);
CREATE INDEX idx_analytics_event ON analytics(event);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_assets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Pages policies
CREATE POLICY "Users can view own pages" ON pages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON pages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON pages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON pages
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view published pages" ON pages
    FOR SELECT USING (status = 'published');

-- Analytics policies
CREATE POLICY "Users can view own page analytics" ON analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = analytics.page_id 
            AND pages.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert analytics" ON analytics
    FOR INSERT WITH CHECK (true);

-- Templates policies
CREATE POLICY "Public can view public templates" ON templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own templates" ON templates
    FOR SELECT USING (created_by = auth.uid());

-- User sessions policies
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Page assets policies
CREATE POLICY "Users can manage own page assets" ON page_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = page_assets.page_id 
            AND pages.user_id = auth.uid()
        )
    );

-- Insert some default templates
INSERT INTO templates (name, description, category, components, settings) VALUES
(
    'Simple Hero',
    'A clean hero section with headline and CTA',
    'hero',
    '[
        {
            "type": "hero-basic",
            "id": "hero_1",
            "content": {
                "title": "Welcome to Our Platform",
                "subtitle": "Create amazing landing pages in minutes",
                "ctaText": "Get Started",
                "ctaLink": "#"
            },
            "styles": {
                "backgroundColor": "#ffffff",
                "textColor": "#000000"
            }
        }
    ]',
    '{"theme": "light", "layout": "centered"}'
),
(
    'Product Showcase',
    'Showcase your product with image and description',
    'product',
    '[
        {
            "type": "image-section",
            "id": "product_1",
            "content": {
                "title": "Amazing Product",
                "description": "This product will change your life",
                "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
                "ctaText": "Learn More",
                "ctaLink": "#"
            },
            "styles": {
                "backgroundColor": "#ffffff"
            }
        }
    ]',
    '{"theme": "light", "layout": "split"}'
),
(
    'Contact Form',
    'Collect leads with a simple contact form',
    'form',
    '[
        {
            "type": "contact-form",
            "id": "contact_1",
            "content": {
                "title": "Get In Touch",
                "description": "We would love to hear from you"
            },
            "styles": {
                "backgroundColor": "#f8f9fa"
            }
        }
    ]',
    '{"theme": "light", "layout": "centered"}'
);

-- Create a function to get page analytics
CREATE OR REPLACE FUNCTION get_page_analytics(page_uuid UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_visitors BIGINT,
    conversion_rate NUMERIC,
    avg_session_duration NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT ip_address) as unique_visitors,
        ROUND(
            (COUNT(*) FILTER (WHERE event = 'conversion')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
        ) as conversion_rate,
        AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY ip_address ORDER BY created_at)))) as avg_session_duration
    FROM analytics 
    WHERE page_id = page_uuid;
END;
$$ LANGUAGE plpgsql;
