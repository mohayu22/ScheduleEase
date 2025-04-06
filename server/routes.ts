import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertServiceSchema, 
  insertAvailabilitySchema, 
  insertSettingsSchema, 
  insertAppointmentSchema 
} from "@shared/schema";
import { z } from "zod";

// Request validation middleware
const validateRequest = (schema: z.ZodType<any, any>) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      next(error);
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Service routes
  app.get("/api/users/:userId/services", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const services = await storage.getServices(userId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to get services" });
    }
  });

  app.post("/api/services", validateRequest(insertServiceSchema), async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const updatedService = await storage.updateService(serviceId, req.body);
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const deleted = await storage.deleteService(serviceId);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Availability routes
  app.get("/api/users/:userId/availabilities", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const availabilities = await storage.getAvailabilities(userId);
      res.json(availabilities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get availabilities" });
    }
  });

  app.post("/api/availabilities", validateRequest(insertAvailabilitySchema), async (req, res) => {
    try {
      const availability = await storage.createAvailability(req.body);
      res.status(201).json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to create availability" });
    }
  });

  app.put("/api/availabilities/:id", async (req, res) => {
    try {
      const availabilityId = parseInt(req.params.id);
      const updatedAvailability = await storage.updateAvailability(availabilityId, req.body);
      if (!updatedAvailability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.json(updatedAvailability);
    } catch (error) {
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  app.delete("/api/availabilities/:id", async (req, res) => {
    try {
      const availabilityId = parseInt(req.params.id);
      const deleted = await storage.deleteAvailability(availabilityId);
      if (!deleted) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Settings routes
  app.get("/api/users/:userId/settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.post("/api/settings", validateRequest(insertSettingsSchema), async (req, res) => {
    try {
      const settings = await storage.createSettings(req.body);
      res.status(201).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to create settings" });
    }
  });

  app.put("/api/users/:userId/settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updatedSettings = await storage.updateSettings(userId, req.body);
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Appointment routes
  app.get("/api/users/:userId/appointments", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointment" });
    }
  });

  app.get("/api/users/:userId/appointments/date/:date", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const date = req.params.date;
      const appointments = await storage.getAppointmentsByDate(userId, date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointments by date" });
    }
  });

  app.post("/api/appointments", validateRequest(insertAppointmentSchema), async (req, res) => {
    try {
      const appointment = await storage.createAppointment(req.body);
      
      // Mock email notification
      console.log(`Sending confirmation email to ${appointment.clientEmail} for appointment on ${appointment.date} at ${appointment.startTime}`);
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Mock email notification for status updates
      if (req.body.status && req.body.status !== updatedAppointment.status) {
        console.log(`Sending status update email to ${updatedAppointment.clientEmail} - Appointment is now ${updatedAppointment.status}`);
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
