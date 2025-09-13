import { ElevenLabs, ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  audioFile: File | Blob;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Clone a voice using an audio sample
 */
export async function cloneVoice(options: VoiceCloneOptions): Promise<string> {
  try {
    const response = await elevenlabs.voices.ivc.create({
      name: options.name,
      description: options.description || "Voice cloned from user audio",
      files: [options.audioFile],
    });

    return response.voiceId;
  } catch (error) {
    console.error("Error cloning voice:", error);
    throw new Error("Failed to clone voice");
  }
}

/**
 * Convert text to speech using a specific voice
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<Buffer> {
  try {
    const response = await elevenlabs.textToSpeech.convert(
      options.voiceId,
      {
        text: options.text,
        modelId: options.modelId || "eleven_multilingual_v2",
        voiceSettings: {
          stability: options.stability || 0.5,
          similarityBoost: options.similarityBoost || 0.8,
        },
      }
    );

    // Convert the response to a buffer
    const chunks: Uint8Array[] = [];
    const reader = response.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    return buffer;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw new Error("Failed to convert text to speech");
  }
}

/**
 * Get available voices
 */
export async function getVoices() {
  try {
    const response = await elevenlabs.voices.getAll();
    return response.voices;
  } catch (error) {
    console.error("Error getting voices:", error);
    throw new Error("Failed to get voices");
  }
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<boolean> {
  try {
    await elevenlabs.voices.delete(voiceId);
    return true;
  } catch (error) {
    console.error("Error deleting voice:", error);
    return false;
  }
}

export { elevenlabs };
