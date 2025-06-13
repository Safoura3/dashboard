import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-supabase-direct";
import { insertVeilleSchema } from "@shared/schema";
import { checkSupabaseData } from "./supabase-check";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all veille items
  app.get("/api/veille", async (req, res) => {
    try {
      const veilleItems = await storage.getAllVeille();
      res.json(veilleItems);
    } catch (error: any) {
      console.error("Error fetching veille items:", error);
      res.status(500).json({ message: "Failed to fetch veille items" });
    }
  });

  // Get veille item by ID
  app.get("/api/veille/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const veilleItem = await storage.getVeille(id);
      
      if (!veilleItem) {
        return res.status(404).json({ message: "Veille item not found" });
      }
      
      res.json(veilleItem);
    } catch (error: any) {
      console.error("Error fetching veille item:", error);
      res.status(500).json({ message: "Failed to fetch veille item" });
    }
  });

  // Create new veille item
  app.post("/api/veille", async (req, res) => {
    try {
      const validatedData = insertVeilleSchema.parse(req.body);
      const veilleItem = await storage.createVeille(validatedData);
      res.status(201).json(veilleItem);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid veille data", errors: error.errors });
      }
      console.error("Error creating veille item:", error);
      res.status(500).json({ message: "Failed to create veille item" });
    }
  });

  // Update veille item
  app.patch("/api/veille/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVeilleSchema.partial().parse(req.body);
      const veilleItem = await storage.updateVeille(id, validatedData);
      
      if (!veilleItem) {
        return res.status(404).json({ message: "Veille item not found" });
      }
      
      res.json(veilleItem);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid veille data", errors: error.errors });
      }
      console.error("Error updating veille item:", error);
      res.status(500).json({ message: "Failed to update veille item" });
    }
  });

  // Delete veille item
  app.delete("/api/veille/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteVeille(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Veille item not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting veille item:", error);
      res.status(500).json({ message: "Failed to delete veille item" });
    }
  });

  // Database status endpoint
  app.get("/api/database/status", async (req, res) => {
    try {
      const veilleItems = await storage.getAllVeille();
      res.json({ 
        connected: true, 
        count: veilleItems.length,
        type: "supabase"
      });
    } catch (error: any) {
      console.error("Error checking database status:", error);
      res.status(500).json({ message: "Failed to check database status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
