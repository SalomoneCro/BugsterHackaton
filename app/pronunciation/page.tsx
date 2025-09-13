"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Volume2, Square, ArrowRight, Loader2, Home } from "lucide-react"
import { AudioRecorder, cloneVoiceFromFile, convertTextToSpeech } from "@/lib/elevenlabs-client"
import Link from "next/link"

type Step = "input" | "recording" | "playback"

export default function PronunciationApp() {
  const [currentStep, setCurrentStep] = useState<Step>("input")
  const [pitchText, setPitchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [animatedText, setAnimatedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const fullText =
    "¿Te cuesta dar presentaciones en inglés? Nuestra IA clona tu voz en español y te devuelve tu discurso con la pronunciación perfecta en inglés. Mantén tu identidad vocal mientras suenas como un nativo."

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setAnimatedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [])

  const handleSubmitPitch = () => {
    if (pitchText.trim()) {
      setCurrentStep("recording")
    }
  }

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
      // Store the recorded file for later processing
      audioRecorderRef.current.recordedFile = recordedFile
    }
  }

  const handleFinishRecording = async () => {
    if (!audioRecorderRef.current?.recordedFile) return
    
    setIsProcessing(true)
    
    try {
      // Clone the user's voice
      const cloneResult = await cloneVoiceFromFile(
        audioRecorderRef.current.recordedFile,
        `User Voice ${Date.now()}`,
        "Voice cloned for pronunciation training"
      )
      
      if (cloneResult.success && cloneResult.voiceId) {
        setVoiceId(cloneResult.voiceId)
        
        // Generate the speech with the cloned voice
        const audioUrl = await convertTextToSpeech(pitchText, cloneResult.voiceId)
        
        if (audioUrl) {
          setGeneratedAudioUrl(audioUrl)
          setCurrentStep("playback")
        }
      }
    } catch (error) {
      console.error("Error processing voice:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlayback = () => {
    if (generatedAudioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = generatedAudioUrl
      audioPlayerRef.current.play()
    }
  }

  const handlePlayRecording = () => {
    setIsPlayingRecording(true)
    // Simulate playing the user's recording
    setTimeout(() => {
      setIsPlayingRecording(false)
    }, 3000)
  }

  const storyText = `
    Hola hola, probando si funciona la grabación. Aca estamos en la hackathon de Bugster. El flujo está validado, ahora vamos a ver si realmente la integración funciona.
  `

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Domina tu <span className="text-primary">pronunciación en inglés</span> con tu propia voz
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty min-h-[4rem]">
            {animatedText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Main Content Area */}
        <div className="relative">
          {/* Step 1: Text Input */}
          <div
            className={`transition-all duration-500 ${
              currentStep === "input"
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <Card className="w-full">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="pitch" className="block text-lg font-medium text-foreground mb-3">
                      Pega tu discurso o presentación en inglés:
                    </label>
                    <Textarea
                      id="pitch"
                      placeholder="Ejemplo: Hello everyone, today I want to present our quarterly results..."
                      value={pitchText}
                      onChange={(e) => setPitchText(e.target.value)}
                      className="min-h-[200px] text-base resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitPitch}
                    disabled={!pitchText.trim()}
                    size="lg"
                    className="w-full md:w-auto px-8"
                  >
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Voice Recording */}
          <div
            className={`transition-all duration-500 ${
              currentStep === "recording"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <Card className="w-full">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Ahora graba tu voz leyendo esta historia
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Lee el siguiente texto en voz alta para que podamos clonar tu voz:
                    </p>
                  </div>

                  <div className="bg-muted p-6 rounded-lg">
                    <p className="text-foreground leading-relaxed text-lg">{storyText}</p>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    {!hasRecording && !isRecording && (
                      <Button onClick={handleStartRecording} size="lg" className="px-8 text-primary-foreground">
                        <Mic className="w-5 h-5 mr-2" />
                        Comenzar grabación
                      </Button>
                    )}

                    {isRecording && (
                      <Button
                        onClick={handleStopRecording}
                        size="lg"
                        variant="destructive"
                        className="px-8 text-destructive-foreground"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Detener grabación
                      </Button>
                    )}

                    {hasRecording && !isRecording && (
                      <Button
                        onClick={handleFinishRecording}
                        size="lg"
                        variant="default"
                        className="px-8 text-primary-foreground"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Procesando voz...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Continuar
                          </>
                        )}
                      </Button>
                    )}

                    {hasRecording && !isRecording && (
                      <Button
                        onClick={handlePlayRecording}
                        size="lg"
                        variant="outline"
                        className="px-8 bg-transparent"
                        disabled={isPlayingRecording}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {isPlayingRecording ? "Reproduciendo..." : "Escuchar mi grabación"}
                      </Button>
                    )}

                    {isRecording && (
                      <div className="flex items-center space-x-2 text-destructive">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                        <span className="text-sm">Grabando tu voz... Presiona "Detener" cuando termines</span>
                      </div>
                    )}

                    {hasRecording && !isRecording && !isPlayingRecording && (
                      <p className="text-sm text-muted-foreground text-center">
                        ✓ Grabación completada. Puedes escuchar tu grabación o continuar para procesar tu voz.
                      </p>
                    )}

                    {isPlayingRecording && (
                      <div className="flex items-center space-x-2 text-primary">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm">Reproduciendo tu grabación...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Playback */}
          <div
            className={`transition-all duration-500 ${
              currentStep === "playback"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <Card className="w-full">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">¡Tu pronunciación está lista!</h2>
                    <p className="text-muted-foreground mb-8">
                      Escucha tu discurso en inglés con pronunciación perfecta usando tu propia voz:
                    </p>
                  </div>

                  <div className="bg-muted p-6 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Tu discurso original:</p>
                    <p className="text-foreground italic">"{pitchText.substring(0, 100)}..."</p>
                  </div>

                  <Button onClick={handlePlayback} size="lg" className="px-8 text-primary-foreground">
                    <Play className="w-5 h-5 mr-2" />
                    Reproducir pronunciación
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Volume2 className="w-4 h-4" />
                    <span>Procesado con tecnología ElevenLabs</span>
                  </div>

                  <Button
                    onClick={() => {
                      setCurrentStep("input")
                      setPitchText("")
                      setHasRecording(false)
                      setVoiceId(null)
                      setGeneratedAudioUrl(null)
                      if (generatedAudioUrl) {
                        URL.revokeObjectURL(generatedAudioUrl)
                      }
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Probar con otro texto
                  </Button>
                  
                  {/* Hidden audio player for generated speech */}
                  <audio ref={audioPlayerRef} style={{ display: 'none' }} controls />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-4">
            {(["input", "recording", "playback"] as Step[]).map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStep === step
                    ? "bg-primary"
                    : (["input", "recording", "playback"] as Step[]).indexOf(currentStep) > index
                      ? "bg-secondary"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
