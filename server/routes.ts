import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithHealthAssistant, type ChatMessage } from "./lib/openai";
import { verifyAdmin, rateLimitLogin, resetLoginAttempts, type AuthenticatedRequest } from "./middleware/adminAuth";
import { ActivityLogger } from "./lib/activityLogger";
import { auth as adminAuth, db } from "./lib/firebase";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint for health assistant
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          error: 'Messages array is required' 
        });
      }

      // Validate message format
      for (const msg of messages) {
        if (!msg.role || !msg.content || typeof msg.content !== 'string') {
          return res.status(400).json({ 
            error: 'Each message must have role and content' 
          });
        }
      }

      const response = await chatWithHealthAssistant(messages);
      
      res.json({ 
        message: response,
        success: true 
      });
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false 
      });
    }
  });

  // Activity logging endpoint (for client-side logging)
  app.post('/api/log-activity', async (req, res) => {
    try {
      const { userId, userEmail, activityType, details, riskResult, condition } = req.body;
      
      await ActivityLogger.logActivity(
        userId,
        userEmail,
        activityType,
        details,
        riskResult,
        condition
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Activity logging error:', error);
      res.status(500).json({ 
        error: 'Failed to log activity',
        success: false 
      });
    }
  });

  // Admin login endpoint with rate limiting
  app.post('/api/admin/login', rateLimitLogin, async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: 'ID token required' });
      }

      // Verify the Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Check if user has admin role
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (!userData || userData.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Forbidden: Admin access required' 
        });
      }

      // Reset login attempts on successful login
      if (decodedToken.email) {
        resetLoginAttempts(decodedToken.email);
      }

      // Log admin login
      await ActivityLogger.logActivity(
        uid,
        decodedToken.email || '',
        'login',
        { isAdmin: true }
      );

      res.json({ 
        success: true,
        user: {
          uid,
          email: decodedToken.email,
          role: userData.role,
          name: userData.name,
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  });

  // Admin routes - all protected with verifyAdmin middleware
  app.get('/api/admin/stats', verifyAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const [totalUsers, totalScans, recentActivity, usersByCondition] = await Promise.all([
        ActivityLogger.getUserCount(),
        ActivityLogger.getScanCount(),
        ActivityLogger.getRecentLogs(20),
        ActivityLogger.getUsersByCondition(),
      ]);

      res.json({
        totalUsers,
        totalScans,
        recentActivity,
        usersByCondition,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.get('/api/admin/logs', verifyAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { email, startDate, endDate, limit } = req.query;
      
      const logs = await ActivityLogger.searchLogs(
        email as string | undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const limitNum = limit ? parseInt(limit as string) : 100;
      res.json({ logs: logs.slice(0, limitNum) });
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  });

  app.delete('/api/admin/logs/:id', verifyAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await ActivityLogger.deleteLog(id);
      
      // Log the deletion
      await ActivityLogger.logActivity(
        req.user!.uid,
        req.user!.email,
        'delete_scan',
        { logId: id, deletedBy: 'admin' }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting log:', error);
      res.status(500).json({ error: 'Failed to delete log' });
    }
  });

  app.get('/api/admin/users', verifyAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
