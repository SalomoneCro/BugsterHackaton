"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Volume2, User, Bot, ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"

interface AudioData {
  audio: string
  text: string
  timestamp: number
  voiceId?: string
  type?: string
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const text = searchParams.get('text') || ''
  const aiAudioKey = searchParams.get('aiAudio') || ''
  const userAudioKey = searchParams.get('userAudio') || ''
  
  const [aiAudioData, setAiAudioData] = useState<AudioData | null>(null)
  const [userAudioData, setUserAudioData] = useState<AudioData | null>(null)
  const [isPlayingAI, setIsPlayingAI] = useState(false)
  const [isPlayingUser, setIsPlayingUser] = useState(false)
  
  const aiAudioRef = useRef<HTMLAudioElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)

  // Load audio data from localStorage
  useEffect(() => {
    if (aiAudioKey) {
      const aiData = localStorage.getItem(aiAudioKey)
      if (aiData) {
        setAiAudioData(JSON.parse(aiData))
      }
    }
    
    if (userAudioKey) {
      const userData = localStorage.getItem(userAudioKey)
      if (userData) {
        setUserAudioData(JSON.parse(userData))
      }
    }
  }, [aiAudioKey, userAudioKey])

  // Setup audio elements when data is loaded
  useEffect(() => {
    if (aiAudioData && aiAudioRef.current) {
      aiAudioRef.current.src = aiAudioData.audio
      aiAudioRef.current.onended = () => setIsPlayingAI(false)
      aiAudioRef.current.onpause = () => setIsPlayingAI(false)
    }
  }, [aiAudioData])

  useEffect(() => {
    if (userAudioData && userAudioRef.current) {
      userAudioRef.current.src = userAudioData.audio
      userAudioRef.current.onended = () => setIsPlayingUser(false)
      userAudioRef.current.onpause = () => setIsPlayingUser(false)
    }
  }, [userAudioData])

  const handlePlayAI = () => {
    if (!aiAudioRef.current) return
    
    // Stop user audio if playing
    if (userAudioRef.current && !userAudioRef.current.paused) {
      userAudioRef.current.pause()
      setIsPlayingUser(false)
    }
    
    if (isPlayingAI) {
      aiAudioRef.current.pause()
      setIsPlayingAI(false)
    } else {
      aiAudioRef.current.play()
      setIsPlayingAI(true)
    }
  }

  const handlePlayUser = () => {
    if (!userAudioRef.current) return
    
    // Stop AI audio if playing
    if (aiAudioRef.current && !aiAudioRef.current.paused) {
      aiAudioRef.current.pause()
      setIsPlayingAI(false)
    }
    
    if (isPlayingUser) {
      userAudioRef.current.pause()
      setIsPlayingUser(false)
    } else {
      userAudioRef.current.play()
      setIsPlayingUser(true)
    }
  }

  const resetAudios = () => {
    if (aiAudioRef.current) {
      aiAudioRef.current.currentTime = 0
      aiAudioRef.current.pause()
      setIsPlayingAI(false)
    }
    if (userAudioRef.current) {
      userAudioRef.current.currentTime = 0
      userAudioRef.current.pause()
      setIsPlayingUser(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link href={`/practice?text=${encodeURIComponent(text)}&audioKey=${aiAudioKey}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a práctica
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Compara tu <span className="text-primary">pronunciación</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escucha y compara la pronunciación de la IA con tu pronunciación.
          </p>
        </div>

        {/* Text Display */}
        <Card className="w-full mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Texto practicado:</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-foreground text-center font-medium">
                {text}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Audio Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI Audio */}
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Pronunciación IA</h3>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pronunciación perfecta generada con tu voz clonada
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                    <Volume2 className="w-4 h-4" />
                    <span>ElevenLabs AI</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlayAI}
                  disabled={!aiAudioData}
                  size="lg"
                  className="w-full"
                  variant={isPlayingAI ? "secondary" : "default"}
                >
                  {isPlayingAI ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausar IA
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Reproducir IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Audio */}
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <User className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-semibold">Tu pronunciación</h3>
                </div>
                
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Tu grabación practicando la pronunciación
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
                    <User className="w-4 h-4" />
                    <span>Tu voz</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlayUser}
                  disabled={!userAudioData}
                  size="lg"
                  className="w-full"
                  variant={isPlayingUser ? "secondary" : "outline"}
                >
                  {isPlayingUser ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pausar tu voz
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Reproducir tu voz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button onClick={resetAudios} variant="outline" size="lg" className="px-8">
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar audios
          </Button>
          
          <Link href="/pronunciation">
            <Button size="lg" className="px-8">
              Practicar otro texto
            </Button>
          </Link>
        </div>

        {/* Hidden audio elements */}
        <audio ref={aiAudioRef} preload="auto" />
        <audio ref={userAudioRef} preload="auto" />
      </div>
    </div>
  )
}
