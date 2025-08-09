import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Bot, 
  Download, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from "lucide-react";
import { LocalReport } from "@shared/schema";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { exportToPDF, exportToDocx } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

interface ReportEditorProps {
  report: LocalReport | null;
  onUpdate: (report: LocalReport | null) => void;
}

export function ReportEditor({ report, onUpdate }: ReportEditorProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [settings] = useLocalStorage("settings", { openaiApiKey: "", fontSize: 14, theme: "light" });
  const [reports, setReports] = useLocalStorage<LocalReport[]>("reports", []);
  const { toast } = useToast();

  const formatWithAI = async () => {
    if (!report?.transcript) {
      toast({
        title: "Error",
        description: "Please add transcript content before formatting with AI",
        variant: "destructive",
      });
      return;
    }

    if (!settings.openaiApiKey) {
      toast({
        title: "Error", 
        description: "Please configure your OpenAI API key in settings",
        variant: "destructive",
      });
      return;
    }

    setIsFormatting(true);
    try {
      const response = await fetch("/api/format-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: report.transcript,
          modality: report.modality,
          indication: report.clinicalIndication,
          apiKey: settings.openaiApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format report");
      }

      const formatted = await response.json();
      
      const formattedContent = `
        <h3><strong>TECHNIQUE:</strong></h3>
        <p>${formatted.technique || "Not specified"}</p>
        
        <h3><strong>FINDINGS:</strong></h3>
        <p>${formatted.findings || "No significant findings"}</p>
        
        <h3><strong>IMPRESSION:</strong></h3>
        <p>${formatted.impression || "Clinical correlation recommended"}</p>
      `;

      onUpdate({
        ...report,
        formattedContent: formattedContent
      });

      toast({
        title: "Success",
        description: "Report formatted successfully with AI",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format report with AI",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
    }
  };

  const saveReport = () => {
    if (!report) return;

    const existingIndex = reports.findIndex(r => r.id === report.id);
    let updatedReports;
    
    if (existingIndex >= 0) {
      updatedReports = [...reports];
      updatedReports[existingIndex] = report;
    } else {
      updatedReports = [report, ...reports];
    }

    setReports(updatedReports);
    
    toast({
      title: "Success",
      description: "Report saved successfully",
    });
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!report) return;

    try {
      if (format === 'pdf') {
        await exportToPDF(report);
      } else {
        await exportToDocx(report);
      }
      
      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
    
    setShowExportMenu(false);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleContentChange = () => {
    if (report && contentRef.current) {
      onUpdate({
        ...report,
        formattedContent: contentRef.current.innerHTML
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Report Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-charcoal-600 flex items-center">
            <FileText className="text-primary mr-2 h-5 w-5" />
            Formatted Report
          </h3>

          <div className="flex items-center space-x-2">
            <Button
              onClick={formatWithAI}
              disabled={isFormatting}
              className="bg-primary hover:bg-primary-600"
            >
              <Bot className="h-4 w-4 mr-2" />
              {isFormatting ? "Formatting..." : "Format with AI"}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <Download className="h-5 w-5" />
              </Button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <Button
                    variant="ghost"
                    onClick={() => handleExport('pdf')}
                    className="w-full justify-start text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleExport('docx')}
                    className="w-full justify-start text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Export DOCX
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={saveReport}
              className="bg-success hover:bg-success text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Rich Text Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('bold')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('italic')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('underline')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <Select onValueChange={(value) => formatText('fontSize', value)}>
            <SelectTrigger className="w-20 text-sm">
              <SelectValue placeholder="14px" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">12px</SelectItem>
              <SelectItem value="2">14px</SelectItem>
              <SelectItem value="3">16px</SelectItem>
              <SelectItem value="4">18px</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('justifyLeft')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('justifyCenter')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => formatText('justifyRight')}
            className="text-charcoal-400 hover:text-charcoal-600 hover:bg-gray-100"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-full">
          {/* Patient Header */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-charcoal-600 mb-2">RADIOLOGY REPORT</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Patient:</strong> {report?.patientName || "Not specified"}<br />
                <strong>Age:</strong> {report?.patientAge || "Not specified"}<br />
                <strong>Gender:</strong> {report?.patientGender || "Not specified"}
              </div>
              <div>
                <strong>Study:</strong> {report?.modality || "Not specified"}<br />
                <strong>Date:</strong> {report?.reportDate ? new Date(report.reportDate).toLocaleDateString() : "Not specified"}<br />
                <strong>Report ID:</strong> {report?.id || "Not generated"}
              </div>
            </div>
            <div className="mt-3">
              <strong>Clinical Indication:</strong> {report?.clinicalIndication || "Not specified"}
            </div>
          </div>

          {/* Rich Text Report Content */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            className="prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-2 min-h-96"
            dangerouslySetInnerHTML={{ __html: report?.formattedContent || "<p>Click 'Format with AI' to generate a professional report from your transcript.</p>" }}
            onInput={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
