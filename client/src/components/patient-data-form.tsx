import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck } from "lucide-react";
import { LocalReport } from "@shared/schema";

interface PatientDataFormProps {
  report: LocalReport | null;
  onUpdate: (report: LocalReport | null) => void;
}

export function PatientDataForm({ report, onUpdate }: PatientDataFormProps) {
  const updateField = (field: keyof LocalReport, value: any) => {
    if (!report) return;
    onUpdate({ ...report, [field]: value });
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-medium text-charcoal-600 mb-4 flex items-center">
        <UserCheck className="text-primary mr-2 h-5 w-5" />
        Patient Information
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName" className="text-charcoal-600">
            Patient Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="patientName"
            placeholder="Enter patient name"
            value={report?.patientName || ""}
            onChange={(e) => updateField("patientName", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="patientAge" className="text-charcoal-600">
            Age <span className="text-destructive">*</span>
          </Label>
          <Input
            id="patientAge"
            type="number"
            placeholder="Age"
            value={report?.patientAge || ""}
            onChange={(e) => updateField("patientAge", parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="patientGender" className="text-charcoal-600">
            Gender <span className="text-destructive">*</span>
          </Label>
          <Select
            value={report?.patientGender || ""}
            onValueChange={(value) => updateField("patientGender", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="modality" className="text-charcoal-600">
            Modality <span className="text-destructive">*</span>
          </Label>
          <Select
            value={report?.modality || ""}
            onValueChange={(value) => updateField("modality", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select modality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x-ray">X-ray</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct">CT Scan</SelectItem>
              <SelectItem value="mri">MRI</SelectItem>
              <SelectItem value="doppler">Doppler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="clinicalIndication" className="text-charcoal-600">
          Clinical Indication <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="clinicalIndication"
          placeholder="Enter clinical indication for the study..."
          value={report?.clinicalIndication || ""}
          onChange={(e) => updateField("clinicalIndication", e.target.value)}
          className="mt-1 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}
