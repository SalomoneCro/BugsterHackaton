import { NextRequest, NextResponse } from "next/server";
import { cloneVoice } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!audioFile || !name) {
      return NextResponse.json(
        { error: "Audio file and name are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      );
    }

    // Clone the voice
    const voiceId = await cloneVoice({
      name,
      description,
      audioFile,
    });

    return NextResponse.json({
      success: true,
      voiceId,
      message: "Voice cloned successfully",
    });
  } catch (error) {
    console.error("Voice cloning error:", error);
    return NextResponse.json(
      { error: "Failed to clone voice" },
      { status: 500 }
    );
  }
}
