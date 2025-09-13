import { NextResponse } from "next/server";
import { getVoices } from "@/lib/elevenlabs";

export async function GET() {
  try {
    const voices = await getVoices();
    
    return NextResponse.json({
      success: true,
      voices: voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        description: voice.description,
        category: voice.category,
        preview_url: voice.preview_url,
      })),
    });
  } catch (error) {
    console.error("Get voices error:", error);
    return NextResponse.json(
      { error: "Failed to get voices" },
      { status: 500 }
    );
  }
}
