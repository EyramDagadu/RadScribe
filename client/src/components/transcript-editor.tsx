import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LocalReport } from "@shared/schema";

interface TranscriptEditorProps {
  report: LocalReport | null;
  onUpdate: (report: LocalReport | null) => void;
}

export function TranscriptEditor({ report, onUpdate }: TranscriptEditorProps) {
  const handleClearTranscript = () => {
    if (report && window.confirm("Are you sure you want to clear the transcript?")) {
      onUpdate({
        ...report,
        transcript: ""
      });
    }
  };

  const handleTranscriptChange = (value: string) => {
    if (report) {
      onUpdate({
        ...report,
        transcript: value
      });
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium text-charcoal-600">Transcript</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearTranscript}
          className="text-charcoal-400 hover:text-charcoal-600 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        value={report?.transcript || ""}
        onChange={(e) => handleTranscriptChange(e.target.value)}
        placeholder="Transcript will appear here as you dictate, or you can type manually..."
        className="flex-1 resize-none font-mono text-sm min-h-0"
      />
    </div>
  );
}
