import { LocalReport, LocalSettings } from "@shared/schema";

const REPORTS_KEY = "radiology_reports";
const SETTINGS_KEY = "radiology_settings";

export class LocalStorage {
  static getReports(): LocalReport[] {
    try {
      const stored = localStorage.getItem(REPORTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading reports from localStorage:", error);
      return [];
    }
  }

  static saveReports(reports: LocalReport[]): void {
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error("Error saving reports to localStorage:", error);
    }
  }

  static addReport(report: LocalReport): void {
    const reports = this.getReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.unshift(report);
    }
    
    this.saveReports(reports);
  }

  static deleteReport(id: string): void {
    const reports = this.getReports().filter(r => r.id !== id);
    this.saveReports(reports);
  }

  static searchReports(query: string, modality?: string, startDate?: string, endDate?: string): LocalReport[] {
    const reports = this.getReports();
    
    return reports.filter(report => {
      const matchesQuery = !query || report.patientName.toLowerCase().includes(query.toLowerCase());
      const matchesModality = !modality || report.modality === modality;
      
      let matchesDateRange = true;
      if (startDate || endDate) {
        const reportDate = new Date(report.reportDate);
        if (startDate) matchesDateRange = matchesDateRange && reportDate >= new Date(startDate);
        if (endDate) matchesDateRange = matchesDateRange && reportDate <= new Date(endDate);
      }
      
      return matchesQuery && matchesModality && matchesDateRange;
    });
  }

  static getSettings(): LocalSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { fontSize: 14, theme: "light" };
    } catch (error) {
      console.error("Error reading settings from localStorage:", error);
      return { fontSize: 14, theme: "light" };
    }
  }

  static saveSettings(settings: LocalSettings): void {
    try {
      // Encrypt the API key before storing (basic encryption)
      const settingsToStore = { ...settings };
      if (settingsToStore.openaiApiKey) {
        settingsToStore.openaiApiKey = btoa(settingsToStore.openaiApiKey);
      }
      
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToStore));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }

  static getApiKey(): string | undefined {
    try {
      const settings = this.getSettings();
      return settings.openaiApiKey ? atob(settings.openaiApiKey) : undefined;
    } catch (error) {
      console.error("Error decrypting API key:", error);
      return undefined;
    }
  }
}
