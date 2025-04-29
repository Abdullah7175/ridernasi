import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertOrderSchema, 
  updateOrderStatusSchema, 
  updatePaymentSchema, 
  updateProfileSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  // All routes are prefixed with /api

  // Get all orders for the current rider
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const orders = await storage.getOrdersByRiderId(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Error fetching orders");
    }
  });

  // Get a specific order
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) return res.status(400).send("Invalid order ID");
      
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      // Ensure riders can only access their own orders
      if (order.riderId !== req.user.id) {
        return res.status(403).send("You don't have access to this order");
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).send("Error fetching order");
    }
  });

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) return res.status(400).send("Invalid order ID");
      
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      // Ensure riders can only update their own orders
      if (order.riderId !== req.user.id) {
        return res.status(403).send("You don't have access to this order");
      }
      
      // Validate request body
      const result = updateOrderStatusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, result.data.status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).send("Error updating order status");
    }
  });

  // Update order payment
  app.patch("/api/orders/:id/payment", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) return res.status(400).send("Invalid order ID");
      
      const order = await storage.getOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      // Ensure riders can only update their own orders
      if (order.riderId !== req.user.id) {
        return res.status(403).send("You don't have access to this order");
      }
      
      // Validate request body
      const result = updatePaymentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }
      
      const updatedOrder = await storage.updateOrderPayment(orderId, result.data);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order payment:", error);
      res.status(500).send("Error updating order payment");
    }
  });

  // Update user profile
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      // Validate request body
      const result = updateProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(req.user.id, result.data);
      
      // Update the session
      req.login(updatedUser, (err) => {
        if (err) return res.status(500).send("Error updating session");
        res.json(updatedUser);
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Error updating profile");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
