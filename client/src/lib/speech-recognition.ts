// Speech recognition utility functions and configurations
export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;
  
  constructor(config: SpeechRecognitionConfig = {}) {
    this.isSupported = this.checkSupport();
    
    if (this.isSupported) {
      this.initializeRecognition(config);
    }
  }

  private checkSupport(): boolean {
    return typeof window !== "undefined" && 
           (window.SpeechRecognition || window.webkitSpeechRecognition) !== undefined;
  }

  private initializeRecognition(config: SpeechRecognitionConfig) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Apply configuration
    this.recognition.lang = config.language || "en-US";
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.maxAlternatives = config.maxAlternatives || 1;
  }

  // Request microphone permission
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      return false;
    }
  }

  // Check if microphone is available
  async checkMicrophoneAvailability(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === "audioinput");
    } catch (error) {
      console.error("Error checking microphone availability:", error);
      return false;
    }
  }

  // Get available languages for speech recognition
  static getSupportedLanguages(): string[] {
    // Common languages supported by most browsers
    return [
      "en-US", // English (United States)
      "en-GB", // English (United Kingdom) 
      "es-ES", // Spanish (Spain)
      "es-US", // Spanish (United States)
      "fr-FR", // French (France)
      "de-DE", // German (Germany)
      "it-IT", // Italian (Italy)
      "pt-BR", // Portuguese (Brazil)
      "zh-CN", // Chinese (Mandarin)
      "ja-JP", // Japanese
      "ko-KR", // Korean
      "ar-SA", // Arabic (Saudi Arabia)
      "hi-IN", // Hindi (India)
      "ru-RU", // Russian
      "nl-NL", // Dutch (Netherlands)
      "sv-SE", // Swedish (Sweden)
      "no-NO", // Norwegian
      "da-DK", // Danish
      "fi-FI", // Finnish
      "pl-PL", // Polish
    ];
  }

  // Format confidence score as percentage
  static formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  // Clean and format transcript text
  static cleanTranscript(transcript: string): string {
    return transcript
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/([.!?])\s*([a-z])/g, (match, punctuation, letter) => 
        `${punctuation} ${letter.toUpperCase()}`
      );
  }

  // Medical terminology corrections for radiology
  static applyMedicalCorrections(transcript: string): string {
    const corrections: Record<string, string> = {
      // Common medical terms that might be misrecognized
      "anterior": "anterior",
      "posterior": "posterior", 
      "lateral": "lateral",
      "medial": "medial",
      "superior": "superior",
      "inferior": "inferior",
      "proximal": "proximal",
      "distal": "distal",
      "bilateral": "bilateral",
      "unilateral": "unilateral",
      "consolidation": "consolidation",
      "atelectasis": "atelectasis",
      "pneumothorax": "pneumothorax",
      "pleural effusion": "pleural effusion",
      "cardiomegaly": "cardiomegaly",
      "hepatomegaly": "hepatomegaly",
      "splenomegaly": "splenomegaly",
      "lymphadenopathy": "lymphadenopathy",
      "calcification": "calcification",
      "contrast": "contrast",
      "enhancement": "enhancement",
      "hypoechoic": "hypoechoic",
      "hyperechoic": "hyperechoic",
      "echogenic": "echogenic",
      "anechoic": "anechoic",
      "doppler": "Doppler",
      "ultrasound": "ultrasound",
      "radiograph": "radiograph",
      "computed tomography": "computed tomography",
      "magnetic resonance": "magnetic resonance",
      "ct scan": "CT scan",
      "mri": "MRI",
      "x ray": "X-ray",
      "xray": "X-ray",
    };

    let correctedTranscript = transcript.toLowerCase();
    
    // Apply corrections
    Object.entries(corrections).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      correctedTranscript = correctedTranscript.replace(regex, correct);
    });

    return correctedTranscript;
  }

  // Parse medical measurements from speech
  static parseMedicalMeasurements(transcript: string): string {
    return transcript
      // Convert spoken numbers to measurements
      .replace(/(\d+)\s*by\s*(\d+)\s*(millimeter|mm|centimeter|cm)/gi, '$1x$2 $3')
      .replace(/(\d+)\s*x\s*(\d+)\s*(millimeter|mm|centimeter|cm)/gi, '$1x$2 $3')
      // Standardize measurement units
      .replace(/\bmillimeter\b/gi, 'mm')
      .replace(/\bcentimeter\b/gi, 'cm')
      .replace(/\bmillimeters\b/gi, 'mm')
      .replace(/\bcentimeters\b/gi, 'cm');
  }

  // Get recognition instance (for advanced usage)
  getRecognition(): SpeechRecognition | null {
    return this.recognition;
  }

  // Check if speech recognition is supported
  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  // Cleanup resources
  destroy(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}

// Error types for speech recognition
export enum SpeechRecognitionErrorType {
  NO_SPEECH = "no-speech",
  ABORTED = "aborted", 
  AUDIO_CAPTURE = "audio-capture",
  NETWORK = "network",
  NOT_ALLOWED = "not-allowed",
  SERVICE_NOT_ALLOWED = "service-not-allowed",
  BAD_GRAMMAR = "bad-grammar",
  LANGUAGE_NOT_SUPPORTED = "language-not-supported",
  UNKNOWN = "unknown"
}

// Get user-friendly error messages
export function getSpeechRecognitionErrorMessage(errorType: string): string {
  switch (errorType) {
    case SpeechRecognitionErrorType.NO_SPEECH:
      return "No speech detected. Please speak clearly into the microphone.";
    case SpeechRecognitionErrorType.ABORTED:
      return "Speech recognition was aborted.";
    case SpeechRecognitionErrorType.AUDIO_CAPTURE:
      return "Audio capture failed. Please check your microphone.";
    case SpeechRecognitionErrorType.NETWORK:
      return "Network error occurred during speech recognition.";
    case SpeechRecognitionErrorType.NOT_ALLOWED:
      return "Microphone access denied. Please allow microphone permissions.";
    case SpeechRecognitionErrorType.SERVICE_NOT_ALLOWED:
      return "Speech recognition service not allowed.";
    case SpeechRecognitionErrorType.BAD_GRAMMAR:
      return "Speech recognition grammar error.";
    case SpeechRecognitionErrorType.LANGUAGE_NOT_SUPPORTED:
      return "Language not supported for speech recognition.";
    default:
      return "An unknown error occurred during speech recognition.";
  }
}

// Default configuration for medical dictation
export const MEDICAL_SPEECH_CONFIG: SpeechRecognitionConfig = {
  language: "en-US",
  continuous: true,
  interimResults: true,
  maxAlternatives: 1
};
