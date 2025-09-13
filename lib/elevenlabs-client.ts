// Client-side utilities for ElevenLabs API integration

export interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  preview_url?: string;
}

export interface CloneVoiceResponse {
  success: boolean;
  voiceId?: string;
  message?: string;
  error?: string;
}

export interface VoicesResponse {
  success: boolean;
  voices?: Voice[];
  error?: string;
}

/**
 * Clone a voice from an audio file
 */
export async function cloneVoiceFromFile(
  audioFile: File,
  name: string,
  description?: string
): Promise<CloneVoiceResponse> {
  try {
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("name", name);
    if (description) {
      formData.append("description", description);
    }

    const response = await fetch("/api/clone-voice", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error cloning voice:", error);
    return {
      success: false,
      error: "Failed to clone voice",
    };
  }
}

/**
 * Convert text to speech using a voice ID
 */
export async function convertTextToSpeech(
  text: string,
  voiceId: string,
  options?: {
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
  }
): Promise<string | null> {
  try {
    const response = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voiceId,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to convert text to speech");
    }

    // Convert the response to a blob and create a URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return null;
  }
}

/**
 * Get available voices
 */
export async function getAvailableVoices(): Promise<VoicesResponse> {
  try {
    const response = await fetch("/api/voices");
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting voices:", error);
    return {
      success: false,
      error: "Failed to get voices",
    };
  }
}

/**
 * Record audio from the user's microphone
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  public recordedFile: File | null = null;

  async startRecording(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }

  stopRecording(): Promise<File | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/wav" });
        const file = new File([blob], "recording.wav", { type: "audio/wav" });
        this.recordedFile = file;
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(file);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}
