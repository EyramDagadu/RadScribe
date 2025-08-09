import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReportSchema, insertSettingsSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
  });

  // Reports endpoints
  app.get("/api/reports", async (req, res) => {
    try {
      const { search, modality, startDate, endDate } = req.query;
      
      let reports;
      if (search || modality || startDate || endDate) {
        reports = await storage.searchReports(
          search as string || "",
          modality as string,
          startDate as string,
          endDate as string
        );
      } else {
        reports = await storage.getAllReports();
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.patch("/api/reports/:id", async (req, res) => {
    try {
      const partialData = insertReportSchema.partial().parse(req.body);
      const report = await storage.updateReport(req.params.id, partialData);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const success = await storage.deleteReport(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // AI formatting endpoint
  app.post("/api/format-report", async (req, res) => {
    try {
      const { transcript, modality, bodyPart, indication, apiKey } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ message: "Transcript is required" });
      }

      const clientApiKey = apiKey || process.env.OPENAI_API_KEY;
      if (!clientApiKey) {
        return res.status(400).json({ message: "OpenAI API key is required" });
      }

      const clientOpenai = new OpenAI({ apiKey: clientApiKey });

      const prompt = `You are an expert radiologist. Please format the following transcript into a professional radiology report with standardized sections.

Study Details:
- Modality: ${modality || 'Not specified'}
- Body Part: ${bodyPart || 'Not specified'}  
- Clinical Indication: ${indication || 'Not specified'}

Transcript:
${transcript}

Please format this into a professional radiology report with the following sections:
- TECHNIQUE
- FINDINGS  
- IMPRESSION

Use proper medical terminology and follow standard radiology reporting conventions. Return the response as JSON with this structure:
{
  "technique": "description of imaging technique used",
  "findings": "detailed findings from the study", 
  "impression": "concise clinical impression and recommendations"
}`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await clientOpenai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert radiologist who creates professional, standardized radiology reports."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const formattedReport = JSON.parse(response.choices[0].message.content || "{}");
      res.json(formattedReport);
    } catch (error: any) {
      console.error("AI formatting error:", error);
      res.status(500).json({ 
        message: "Failed to format report with AI", 
        error: error.message 
      });
    }
  });

  // Settings endpoints
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const settings = await storage.getSettings(req.params.userId);
      res.json(settings || { userId: req.params.userId, fontSize: 14, theme: "light" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
