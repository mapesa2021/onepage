// Authentication middleware for Clubzila integration
const ClubzilaIntegration = require('../clubzilaIntegration');

class AuthMiddleware {
    constructor() {
        this.clubzila = new ClubzilaIntegration();
    }

    // Middleware to check if user is authenticated
    requireAuth(req, res, next) {
        // Check for user data in request headers (from frontend localStorage)
        const userData = req.headers['x-user-data'];
        
        if (!userData) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required',
                redirect: '/auth/login'
            });
        }

        try {
            const user = JSON.parse(userData);
            
            // Validate user data structure
            if (!user.isAuthenticated || !user.userId || !user.authId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid authentication data',
                    redirect: '/auth/login'
                });
            }

            // Check if session is not expired (24 hours)
            const sessionAge = Date.now() - user.timestamp;
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            if (sessionAge > maxSessionAge) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Session expired',
                    redirect: '/auth/login'
                });
            }

            // Add user data to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid authentication data',
                redirect: '/auth/login'
            });
        }
    }

    // Middleware to check if user is authenticated for HTML pages
    requireAuthHTML(req, res, next) {
        // For HTML pages, we'll check for a session cookie or redirect to login
        // This is a simplified version - in production you'd use proper session management
        
        // Check if user is trying to access protected routes
        const protectedRoutes = ['/templates', '/templates/1', '/templates/2', '/templates/3'];
        const isProtectedRoute = protectedRoutes.some(route => req.path.startsWith(route));
        
        if (isProtectedRoute) {
            // For now, we'll allow access but add a client-side check
            // In production, you'd implement proper server-side session validation
            next();
        } else {
            next();
        }
    }

    // Optional auth middleware - doesn't block but adds user data if available
    optionalAuth(req, res, next) {
        const userData = req.headers['x-user-data'];
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.isAuthenticated && user.userId && user.authId) {
                    req.user = user;
                }
            } catch (error) {
                console.error('Optional auth middleware error:', error);
            }
        }
        
        next();
    }

    // Validate user session with Clubzila
    async validateSession(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No user session found',
                redirect: '/auth/login'
            });
        }

        try {
            // Verify user with Clubzila API
            const userData = await this.clubzila.getUser(req.user.userId);
            
            if (userData && userData.status === 'success') {
                // Update user data with latest from Clubzila
                req.user = { ...req.user, ...userData.data };
                next();
            } else {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid session',
                    redirect: '/auth/login'
                });
            }
        } catch (error) {
            console.error('Session validation error:', error);
            return res.status(401).json({
                status: 'error',
                message: 'Session validation failed',
                redirect: '/auth/login'
            });
        }
    }
}

module.exports = AuthMiddleware;
