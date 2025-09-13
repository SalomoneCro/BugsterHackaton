import { NextRequest, NextResponse } from "next/server";
import { textToSpeech } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, modelId, stability, similarityBoost } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: "Text and voiceId are required" },
        { status: 400 }
      );
    }

    // Convert text to speech
    const audioBuffer = await textToSpeech({
      text,
      voiceId,
      modelId,
      stability,
      similarityBoost,
    });

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Text to speech error:", error);
    return NextResponse.json(
      { error: "Failed to convert text to speech" },
      { status: 500 }
    );
  }
}
