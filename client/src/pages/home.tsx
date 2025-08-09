import { useState } from "react";
import { PatientDataForm } from "@/components/patient-data-form";
import { DictationControls } from "@/components/dictation-controls";
import { TranscriptEditor } from "@/components/transcript-editor";
import { ReportEditor } from "@/components/report-editor";
import { SearchModal } from "@/components/search-modal";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Settings, Search } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LocalReport } from "@shared/schema";

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentReport, setCurrentReport] = useLocalStorage<LocalReport | null>("currentReport", null);
  const [reports] = useLocalStorage<LocalReport[]>("reports", []);

  const handleNewReport = () => {
    const newReport: LocalReport = {
      id: crypto.randomUUID(),
      patientName: "",
      patientAge: 0,
      patientGender: "",
      modality: "",
      clinicalIndication: "",
      transcript: "",
      formattedContent: "",
      reportDate: new Date().toISOString(),
    };
    setCurrentReport(newReport);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <X className="text-primary text-2xl" />
            <h1 className="text-xl font-medium text-charcoal-600">RadiologyScope</h1>
          </div>
          <span className="text-sm text-charcoal-400 bg-gray-100 px-2 py-1 rounded">
            Local-First Reporting
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search reports by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-80 pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-charcoal-400" />
          </div>

          {/* Action Buttons */}
          <Button onClick={handleNewReport} className="bg-primary hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="text-charcoal-400 hover:text-charcoal-600"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Patient Data & Transcript */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
          <PatientDataForm 
            report={currentReport} 
            onUpdate={setCurrentReport} 
          />
          
          <DictationControls 
            report={currentReport}
            onUpdate={setCurrentReport}
          />
          
          <TranscriptEditor 
            report={currentReport}
            onUpdate={setCurrentReport}
          />
        </div>

        {/* Right Panel - Formatted Report */}
        <div className="w-1/2 flex flex-col bg-white">
          <ReportEditor 
            report={currentReport}
            onUpdate={setCurrentReport}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 px-6 py-2 border-t border-gray-200 flex items-center justify-between text-sm text-charcoal-400">
        <div className="flex items-center space-x-4">
          <span>Last saved: {currentReport?.reportDate ? new Date(currentReport.reportDate).toLocaleTimeString() : "Never"}</span>
          <span>•</span>
          <span>Reports: {reports.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Local Mode</span>
        </div>
      </div>

      {/* Modals */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSelectReport={setCurrentReport}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
