const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          email,
          password: hashedPassword,
          name,
          created_at: new Date().toISOString()
        }
      ])
      .select('id, email, name, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create landing page
app.post('/api/pages', authenticateToken, async (req, res) => {
  try {
    const { title, description, components, settings } = req.body;
    const pageId = uuidv4();
    const customUrl = generateCustomUrl(title);

    const { data: page, error } = await supabase
      .from('pages')
      .insert([
        {
          id: pageId,
          user_id: req.user.userId,
          title,
          description,
          components: JSON.stringify(components),
          settings: JSON.stringify(settings),
          custom_url: customUrl,
          public_url: `${process.env.BASE_URL}/page/${pageId}`,
          status: 'draft',
          created_at: new Date().toISOString()
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create page' });
    }

    res.status(201).json({
      message: 'Page created successfully',
      page: {
        ...page,
        components: JSON.parse(page.components),
        settings: JSON.parse(page.settings)
      }
    });

  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's pages
app.get('/api/pages', authenticateToken, async (req, res) => {
  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch pages' });
    }

    const formattedPages = pages.map(page => ({
      ...page,
      components: JSON.parse(page.components),
      settings: JSON.parse(page.settings)
    }));

    res.json({ pages: formattedPages });

  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific page
app.get('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .single();

    if (error || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      page: {
        ...page,
        components: JSON.parse(page.components),
        settings: JSON.parse(page.settings)
      }
    });

  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update page
app.put('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, components, settings, status } = req.body;

    const { data: page, error } = await supabase
      .from('pages')
      .update({
        title,
        description,
        components: JSON.stringify(components),
        settings: JSON.stringify(settings),
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId)
      .select('*')
      .single();

    if (error || !page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      message: 'Page updated successfully',
      page: {
        ...page,
        components: JSON.parse(page.components),
        settings: JSON.parse(page.settings)
      }
    });

  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete page
app.delete('/api/pages/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.userId);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete page' });
    }

    res.json({ message: 'Page deleted successfully' });

  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public page access
app.get('/page/:id', async (req, res) => {
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', req.params.id)
      .eq('status', 'published')
      .single();

    if (error || !page) {
      return res.status(404).send(`
        <html>
          <head><title>Page Not Found</title></head>
          <body>
            <h1>Page Not Found</h1>
            <p>This page doesn't exist or is not published.</p>
          </body>
        </html>
      `);
    }

    // Generate HTML for the page
    const html = generatePageHTML(page);
    res.send(html);

  } catch (error) {
    console.error('Public page error:', error);
    res.status(500).send('Internal server error');
  }
});

// Custom URL access
app.get('/:customUrl', async (req, res) => {
  try {
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('custom_url', req.params.customUrl)
      .eq('status', 'published')
      .single();

    if (error || !page) {
      return res.status(404).send(`
        <html>
          <head><title>Page Not Found</title></head>
          <body>
            <h1>Page Not Found</h1>
            <p>This page doesn't exist or is not published.</p>
          </body>
        </html>
      `);
    }

    // Generate HTML for the page
    const html = generatePageHTML(page);
    res.send(html);

  } catch (error) {
    console.error('Custom URL error:', error);
    res.status(500).send('Internal server error');
  }
});

// Analytics tracking
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { pageId, event, data } = req.body;

    const { error } = await supabase
      .from('analytics')
      .insert([
        {
          id: uuidv4(),
          page_id: pageId,
          event,
          data: JSON.stringify(data),
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Analytics error:', error);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// Helper functions
function generateCustomUrl(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + Math.random().toString(36).substr(2, 6);
}

function generatePageHTML(page) {
  const components = JSON.parse(page.components);
  const settings = JSON.parse(page.settings);

  const componentsHTML = components.map(component => {
    // This would use the component library to render HTML
    return `<div class="component" data-component-id="${component.id}">
      <!-- Component HTML would be generated here -->
      <h2>${component.content.title || 'Component'}</h2>
    </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <meta name="description" content="${page.description}">
    
    <!-- Performance Optimized CSS -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- TailwindCSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Analytics -->
    <script>
        // Track page view
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pageId: '${page.id}',
                event: 'page_view',
                data: { url: window.location.href }
            })
        });
    </script>
</head>
<body class="font-sans">
    ${componentsHTML}
    
    <!-- Performance Monitoring -->
    <script>
        window.addEventListener('load', function() {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        });
    </script>
</body>
</html>`;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Landing Page Builder Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 Mobile access: http://192.168.100.14:${PORT}/health`);
  }
  console.log(`🌐 Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
});
