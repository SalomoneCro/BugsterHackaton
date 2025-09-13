"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Volume2, Square, ArrowRight, Loader2, Home, ArrowLeft, Download, BookOpen, StopCircle } from "lucide-react"
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
  const [savedAudioKey, setSavedAudioKey] = useState<string | null>(null)
  const [isPlayingAI, setIsPlayingAI] = useState(false)
  
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

  const handleGoBackToInput = () => {
    setCurrentStep("input")
    setHasRecording(false)
    setIsRecording(false)
    setIsPlayingRecording(false)
    // Reset audio recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.recordedFile = null
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
          
          // Automatically save to localStorage when audio is generated
          saveAudioToLocalStorage(audioUrl)
          
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
      
      // Set up event listeners
      audioPlayerRef.current.onplay = () => setIsPlayingAI(true)
      audioPlayerRef.current.onpause = () => setIsPlayingAI(false)
      audioPlayerRef.current.onended = () => setIsPlayingAI(false)
      audioPlayerRef.current.onerror = () => setIsPlayingAI(false)
      
      audioPlayerRef.current.play()
    }
  }

  const handleStopAI = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
      setIsPlayingAI(false)
    }
  }

  const saveAudioToLocalStorage = async (audioUrl: string) => {
    try {
      // Fetch the audio blob
      const response = await fetch(audioUrl)
      const audioBlob = await response.blob()
      
      // Convert blob to base64 for localStorage
      const reader = new FileReader()
      reader.onload = () => {
        const base64Audio = reader.result as string
        
        // Save to localStorage with timestamp
        const audioKey = `elevenlabs-audio-${Date.now()}`
        const audioData = {
          audio: base64Audio,
          text: pitchText,
          timestamp: Date.now(),
          voiceId: voiceId
        }
        
        localStorage.setItem(audioKey, JSON.stringify(audioData))
        setSavedAudioKey(audioKey)
      }
      
      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error('Error saving audio to localStorage:', error)
    }
  }

  const downloadAudio = () => {
    if (!generatedAudioUrl) return

    // Only trigger file download
    const link = document.createElement('a')
    link.href = generatedAudioUrl
    link.download = `pronunciation-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePlayRecording = () => {
    if (!audioRecorderRef.current?.recordedFile) return
    
    setIsPlayingRecording(true)
    
    // Create URL from the recorded file and play it
    const audioUrl = URL.createObjectURL(audioRecorderRef.current.recordedFile)
    const audio = new Audio(audioUrl)
    
    audio.onended = () => {
      setIsPlayingRecording(false)
      URL.revokeObjectURL(audioUrl) // Clean up
    }
    
    audio.onerror = () => {
      setIsPlayingRecording(false)
      URL.revokeObjectURL(audioUrl)
    }
    
    audio.play()
  }

  const storyText = `
    Había una vez un emprendedor que soñaba con conquistar Silicon Valley. Preparó su pitch en inglés, pero los inversores entendieron cualquier cosa: uno pensó que vendía helados, otro que ofrecía seguros de vida. Desanimado, descubrió esta herramienta, practicó su pronunciación y volvió con confianza. Esta vez, todos entendieron su idea y levantó inversión. Ahora sueña con ser el próximo unicornio… pero haciendose entender.
  `

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Information */}
          <div className="space-y-8">
            {currentStep === "recording" ? (
              /* Recording Step Content */
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                    Graba tu voz para <span className="text-primary">clonar tu identidad vocal</span>
                  </h1>
                  <p className="text-lg text-muted-foreground text-pretty">
                    Lee el siguiente texto en voz alta para que podamos clonar tu voz y crear tu pronunciación perfecta en inglés.
                  </p>
                </div>

                <div className="bg-[#F1F5F9] p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Texto para grabar:</h3>
                  <p className="text-foreground leading-relaxed text-lg font-mono">{storyText}</p>
                </div>

                {/* <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Instrucciones:</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">Lee el texto de forma natural y clara</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">Habla a un ritmo normal, no muy rápido</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">Asegúrate de estar en un lugar silencioso</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">La grabación debe durar al menos 30 segundos</p>
                    </div>
                  </div>
                </div> */}
              </div>
            ) : (
              /* Default Content (Input and Playback steps) */
              <>
                {/* Header */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
                    Domina tu <span className="text-primary">pronunciación en inglés</span> con tu propia voz
                  </h1>
                  {/* <p className="text-lg text-muted-foreground text-pretty min-h-[4rem]">
                    {animatedText}
                    <span className="animate-pulse">|</span>
                  </p> */}
                </div>

                {/* How it works */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">¿Cómo funciona?</h2>
                  <div className="space-y-3 text-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                      <p className="text-muted-foreground">Escribe o pega tu discurso en inglés</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                      <p className="text-muted-foreground">Graba tu voz leyendo una historia en español</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</div>
                      <p className="text-muted-foreground">Escucha tu discurso con pronunciación perfecta</p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                {/* <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Beneficios</h2>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <p className="text-muted-foreground">Mantén tu identidad vocal única</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <p className="text-muted-foreground">Pronunciación nativa en inglés</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <p className="text-muted-foreground">Ideal para presentaciones profesionales</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <p className="text-muted-foreground">Tecnología de vanguardia con ElevenLabs</p>
                    </div>
                  </div>
                </div> */}
              </>
            )}
          </div>

          {/* Right Side - App */}
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
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitPitch}
                      disabled={!pitchText.trim()}
                      size="lg"
                      className="w-full md:w-auto px-8"
                    >
                      Continuar
                    </Button>
                  </div>
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
                  {/* Go back button */}
                  <div className="flex justify-start">
                    <Button
                      onClick={handleGoBackToInput}
                      variant="outline"
                      size="sm"
                      className="mb-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al texto
                    </Button>
                  </div>

                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Graba tu voz
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Usa los controles de abajo para comenzar la grabación
                    </p>
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

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handlePlayback} 
                        size="lg" 
                        className="px-6 text-primary-foreground"
                        disabled={isPlayingAI}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {isPlayingAI ? "Reproduciendo..." : "Reproducir"}
                      </Button>
                      
                      <Button 
                        onClick={handleStopAI} 
                        size="lg" 
                        variant="outline"
                        className="px-6"
                        disabled={!isPlayingAI}
                      >
                        <StopCircle className="w-5 h-5 mr-2" />
                        Detener
                      </Button>
                    </div>
                    
                    <Button onClick={downloadAudio} variant="outline" size="lg" className="px-8">
                      <Download className="w-5 h-5 mr-2" />
                      Descargar audio
                    </Button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Volume2 className="w-4 h-4" />
                    <span>Procesado con tecnología ElevenLabs</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
                    <Link href={`/practice?text=${encodeURIComponent(pitchText)}&audioKey=${savedAudioKey || ''}`}>
                      <Button size="lg" className="px-8">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Practicar pronunciación
                      </Button>
                    </Link>
                    
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
                      className="px-8"
                    >
                      Probar con otro texto
                    </Button>
                  </div>
                  
                  {/* Hidden audio player for generated speech */}
                  <audio ref={audioPlayerRef} style={{ display: 'none' }} controls />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Progreso</h3>
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
            <div className="text-sm text-muted-foreground">
              {currentStep === "input" && "Paso 1: Ingresa tu texto"}
              {currentStep === "recording" && "Paso 2: Graba tu voz"}
              {currentStep === "playback" && "Paso 3: Escucha el resultado"}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
