import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithHealthAssistant, type ChatMessage } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Chat endpoint for OpenAI assistant
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

  const httpServer = createServer(app);

  return httpServer;
}
