"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, ArrowRight, Home, ArrowLeft } from "lucide-react"
import { AudioRecorder } from "@/lib/elevenlabs-client"
import Link from "next/link"

export default function PracticePage() {
  const searchParams = useSearchParams()
  const text = searchParams.get('text') || ''
  const aiAudioKey = searchParams.get('audioKey') || ''
  
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [userAudioKey, setUserAudioKey] = useState<string | null>(null)
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null)

  const handleStartRecording = async () => {
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new AudioRecorder()
    }
    
    const success = await audioRecorderRef.current.startRecording()
    if (success) {
      setIsRecording(true)
    }
  }

  const handleStopRecording = async () => {
    if (!audioRecorderRef.current) return
    
    const recordedFile = await audioRecorderRef.current.stopRecording()
    setIsRecording(false)
    
    if (recordedFile) {
      setHasRecording(true)
      // Save user recording to localStorage
      saveUserRecording(recordedFile)
    }
  }

  const saveUserRecording = async (audioFile: File) => {
    try {
      // Convert file to base64 for localStorage
      const reader = new FileReader()
      reader.onload = () => {
        const base64Audio = reader.result as string
        
        // Save to localStorage with timestamp
        const audioKey = `user-practice-audio-${Date.now()}`
        const audioData = {
          audio: base64Audio,
          text: text,
          timestamp: Date.now(),
          type: 'user-practice'
        }
        
        localStorage.setItem(audioKey, JSON.stringify(audioData))
        setUserAudioKey(audioKey)
      }
      
      reader.readAsDataURL(audioFile)
    } catch (error) {
      console.error('Error saving user recording:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/pronunciation">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a pronunciación
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Practica tu <span className="text-primary">pronunciación</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Lee el texto en voz alta en inglés. Después podrás comparar tu pronunciación con la IA.
          </p>
        </div>

        {/* Practice Content */}
        <Card className="w-full">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Text to practice */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Lee este texto en inglés:
                </h2>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-foreground leading-relaxed text-lg font-medium">
                    {text}
                  </p>
                </div>
              </div>

              {/* Recording controls */}
              <div className="flex flex-col items-center space-y-6 pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Graba tu pronunciación
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Presiona el botón y lee el texto en voz alta
                  </p>
                </div>

                {!hasRecording && !isRecording && (
                  <Button 
                    onClick={handleStartRecording} 
                    size="lg" 
                    className="px-8 text-primary-foreground"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Comenzar grabación
                  </Button>
                )}

                {isRecording && (
                  <div className="flex flex-col items-center space-y-4">
                    <Button
                      onClick={handleStopRecording}
                      size="lg"
                      variant="destructive"
                      className="px-8 text-destructive-foreground"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Detener grabación
                    </Button>
                    
                    <div className="flex items-center space-x-2 text-destructive">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                      <span className="text-sm">Grabando... Lee el texto en voz alta</span>
                    </div>
                  </div>
                )}

                {hasRecording && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        ✓ Grabación completada. ¡Ahora puedes comparar tu pronunciación!
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href={`/compare?aiAudio=${aiAudioKey}&userAudio=${userAudioKey}&text=${encodeURIComponent(text)}`}>
                        <Button size="lg" className="px-8">
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Comparar pronunciaciones
                        </Button>
                      </Link>
                      
                      <Button
                        onClick={() => {
                          setHasRecording(false)
                          setIsRecording(false)
                          setUserAudioKey(null)
                          if (audioRecorderRef.current) {
                            audioRecorderRef.current.recordedFile = null
                          }
                        }}
                        variant="outline"
                        size="lg"
                        className="px-8"
                      >
                        Grabar de nuevo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
