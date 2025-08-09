import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Play, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { LocalReport } from "@shared/schema";

interface DictationControlsProps {
  report: LocalReport | null;
  onUpdate: (report: LocalReport | null) => void;
}

export function DictationControls({ report, onUpdate }: DictationControlsProps) {
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    hasRecognitionSupport,
    error
  } = useSpeechRecognition();

  const handleStart = () => {
    startListening();
  };

  const handleStop = () => {
    stopListening();
    if (report && transcript) {
      onUpdate({
        ...report,
        transcript: (report.transcript || "") + " " + transcript
      });
    }
  };

  const getStatusText = () => {
    if (!hasRecognitionSupport) return "Not supported";
    if (error) return "Error";
    if (isListening) return "Recording...";
    return "Ready";
  };

  const getStatusColor = () => {
    if (!hasRecognitionSupport || error) return "bg-destructive";
    if (isListening) return "bg-success";
    return "bg-charcoal-400";
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-charcoal-600 flex items-center">
          <Mic className="text-primary mr-2 h-5 w-5" />
          Voice Dictation
        </h3>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleStart}
            disabled={!hasRecognitionSupport || isListening}
            className="bg-success hover:bg-success text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>

          <Button
            onClick={handleStop}
            disabled={!isListening}
            className="bg-destructive hover:bg-destructive text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>

          <div className="flex items-center text-sm text-charcoal-400">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}`}></div>
            <span>{getStatusText()}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-destructive">
          Error: {error}
        </div>
      )}
    </div>
  );
}
