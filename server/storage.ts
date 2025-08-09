import { type Report, type InsertReport, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Reports
  getReport(id: string): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  searchReports(query: string, modality?: string, startDate?: string, endDate?: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: string, report: Partial<InsertReport>): Promise<Report | undefined>;
  deleteReport(id: string): Promise<boolean>;
  
  // Settings
  getSettings(userId: string): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private reports: Map<string, Report>;
  private settings: Map<string, Settings>;

  constructor() {
    this.reports = new Map();
    this.settings = new Map();
  }

  // Reports
  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.reportDate!).getTime() - new Date(a.reportDate!).getTime()
    );
  }

  async searchReports(query: string, modality?: string, startDate?: string, endDate?: string): Promise<Report[]> {
    const reports = Array.from(this.reports.values());
    
    return reports.filter(report => {
      const matchesQuery = !query || report.patientName.toLowerCase().includes(query.toLowerCase());
      const matchesModality = !modality || report.modality === modality;
      
      let matchesDateRange = true;
      if (startDate || endDate) {
        const reportDate = new Date(report.reportDate!);
        if (startDate) matchesDateRange = matchesDateRange && reportDate >= new Date(startDate);
        if (endDate) matchesDateRange = matchesDateRange && reportDate <= new Date(endDate);
      }
      
      return matchesQuery && matchesModality && matchesDateRange;
    }).sort((a, b) => new Date(b.reportDate!).getTime() - new Date(a.reportDate!).getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      id,
      reportDate: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReport(id: string, updateData: Partial<InsertReport>): Promise<Report | undefined> {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    
    const updated: Report = { ...existing, ...updateData };
    this.reports.set(id, updated);
    return updated;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  // Settings
  async getSettings(userId: string): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }

  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = this.settings.get(insertSettings.userId);
    const id = existing?.id || randomUUID();
    
    const settings: Settings = {
      ...insertSettings,
      id,
    };
    
    this.settings.set(insertSettings.userId, settings);
    return settings;
  }
}

export const storage = new MemStorage();
