"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Volume2, Square, ArrowRight } from "lucide-react"

type Step = "input" | "recording" | "playback"

export default function PronunciationApp() {
  const [currentStep, setCurrentStep] = useState<Step>("input")
  const [pitchText, setPitchText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [animatedText, setAnimatedText] = useState("")

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

  const handleStartRecording = () => {
    setIsRecording(true)
    // Remove automatic stop - user controls when to stop
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)
  }

  const handleFinishRecording = () => {
    setCurrentStep("playback")
  }

  const handlePlayback = () => {
    // Placeholder for ElevenLabs API integration
    console.log("Playing back pronunciation with cloned voice")
  }

  const handlePlayRecording = () => {
    setIsPlayingRecording(true)
    // Simulate playing the user's recording
    setTimeout(() => {
      setIsPlayingRecording(false)
    }, 3000)
  }

  const storyText = `
    En un pequeño pueblo de montaña, vivía una anciana llamada Elena que tenía un jardín mágico. 
    Cada mañana, al amanecer, las flores cantaban melodías que solo ella podía escuchar. 
    Los vecinos pensaban que estaba loca, pero Elena sabía que la naturaleza tenía sus propios secretos. 
    Un día, decidió compartir este don con el mundo, y comenzó a enseñar a otros cómo escuchar 
    el lenguaje silencioso de las plantas. Pronto, todo el pueblo se llenó de música natural.
  `

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
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
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continuar
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
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Probar con otro texto
                  </Button>
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
