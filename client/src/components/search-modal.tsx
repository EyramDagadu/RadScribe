import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LocalReport } from "@shared/schema";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSelectReport: (report: LocalReport) => void;
}

export function SearchModal({ isOpen, onClose, searchQuery, onSelectReport }: SearchModalProps) {
  const [reports] = useLocalStorage<LocalReport[]>("reports", []);
  const [filteredReports, setFilteredReports] = useState<LocalReport[]>([]);
  const [nameFilter, setNameFilter] = useState(searchQuery);
  const [modalityFilter, setModalityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setNameFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let filtered = reports;

    if (nameFilter) {
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (modalityFilter) {
      filtered = filtered.filter(report => report.modality === modalityFilter);
    }

    if (startDate) {
      filtered = filtered.filter(report =>
        new Date(report.reportDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(report =>
        new Date(report.reportDate) <= new Date(endDate)
      );
    }

    setFilteredReports(filtered);
  }, [reports, nameFilter, modalityFilter, startDate, endDate]);

  const handleSelectReport = (report: LocalReport) => {
    onSelectReport(report);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-96">
        <DialogHeader>
          <DialogTitle>Search Reports</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <Input
            placeholder="Patient name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="flex-1"
          />
          
          <Select value={modalityFilter} onValueChange={setModalityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Modalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modalities</SelectItem>
              <SelectItem value="x-ray">X-ray</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct">CT Scan</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="doppler">Doppler</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              No reports found matching your criteria
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Button
                  key={report.id}
                  variant="ghost"
                  onClick={() => handleSelectReport(report)}
                  className="w-full p-4 h-auto text-left hover:bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-charcoal-600">
                        {report.patientName}
                      </h3>
                      <p className="text-sm text-charcoal-400">
                        {report.modality} • {new Date(report.reportDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-success text-white px-2 py-1 rounded">
                      Completed
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
