"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Volume2, User, Bot, ArrowLeft, RotateCcw } from "lucide-react"
import { Slider } from "@/components/ui/slider"
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
  const [aiCurrentTime, setAiCurrentTime] = useState(0)
  const [userCurrentTime, setUserCurrentTime] = useState(0)
  const [aiDuration, setAiDuration] = useState(0)
  const [userDuration, setUserDuration] = useState(0)
  const [sentences, setSentences] = useState<string[]>([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [isAiSeeking, setIsAiSeeking] = useState(false)
  const [isUserSeeking, setIsUserSeeking] = useState(false)
  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userCurrentWordIndex, setUserCurrentWordIndex] = useState(0)
  
  const aiAudioRef = useRef<HTMLAudioElement | null>(null)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)

  // Split text into sentences and words
  useEffect(() => {
    if (text) {
      const sentenceArray = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      setSentences(sentenceArray)
      
      // Split into words for word-level highlighting
      const wordArray = text.split(/\s+/).filter(w => w.trim().length > 0)
      setWords(wordArray)
    }
  }, [text])

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
      const audio = aiAudioRef.current
      audio.src = aiAudioData.audio
      
      audio.onended = () => setIsPlayingAI(false)
      audio.onpause = () => setIsPlayingAI(false)
      audio.onloadedmetadata = () => setAiDuration(audio.duration)
      audio.ontimeupdate = () => {
        if (!isAiSeeking) {
          setAiCurrentTime(audio.currentTime)
          // Update word and sentence index based on audio progress
          if (words.length > 0) {
            const progress = audio.currentTime / audio.duration
            const wordIndex = Math.floor(progress * words.length)
            setCurrentWordIndex(Math.min(wordIndex, words.length - 1))
            
            // Update sentence index based on which sentence the current word belongs to
            const sentenceIndex = getCurrentSentenceForWord(wordIndex)
            setCurrentSentenceIndex(sentenceIndex)
          }
        }
      }
      audio.onseeked = () => setIsAiSeeking(false)
    }
  }, [aiAudioData, sentences, words])

  useEffect(() => {
    if (userAudioData && userAudioRef.current) {
      const audio = userAudioRef.current
      audio.src = userAudioData.audio
      
      audio.onended = () => setIsPlayingUser(false)
      audio.onpause = () => setIsPlayingUser(false)
      audio.onloadedmetadata = () => setUserDuration(audio.duration)
      audio.ontimeupdate = () => {
        if (!isUserSeeking) {
          setUserCurrentTime(audio.currentTime)
          // Update word index for user audio highlighting
          if (words.length > 0) {
            const progress = audio.currentTime / audio.duration
            const wordIndex = Math.floor(progress * words.length)
            setUserCurrentWordIndex(Math.min(wordIndex, words.length - 1))
          }
        }
      }
      audio.onseeked = () => setIsUserSeeking(false)
    }
  }, [userAudioData, words])

  const handlePlayAI = async () => {
    if (!aiAudioRef.current) return
    
    if (!aiAudioData) {
      console.error('No AI audio data available')
      alert('No se pudo cargar el audio de la IA. Por favor, regresa a la página anterior y genera el audio nuevamente.')
      return
    }
    
    // Stop user audio if playing
    if (userAudioRef.current && !userAudioRef.current.paused) {
      userAudioRef.current.pause()
      setIsPlayingUser(false)
    }
    
    if (isPlayingAI) {
      aiAudioRef.current.pause()
      setIsPlayingAI(false)
    } else {
      try {
        // Ensure the audio source is set correctly
        if (aiAudioRef.current.src !== aiAudioData.audio) {
          aiAudioRef.current.src = aiAudioData.audio
        }
        
        // Wait for the audio to be ready if needed
        if (aiAudioRef.current.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio loading timeout'))
            }, 5000)
            
            const onCanPlay = () => {
              clearTimeout(timeout)
              aiAudioRef.current?.removeEventListener('canplay', onCanPlay)
              aiAudioRef.current?.removeEventListener('error', onError)
              resolve(undefined)
            }
            
            const onError = (e: any) => {
              clearTimeout(timeout)
              aiAudioRef.current?.removeEventListener('canplay', onCanPlay)
              aiAudioRef.current?.removeEventListener('error', onError)
              reject(e)
            }
            
            aiAudioRef.current?.addEventListener('canplay', onCanPlay)
            aiAudioRef.current?.addEventListener('error', onError)
            aiAudioRef.current?.load()
          })
        }
        
        await aiAudioRef.current.play()
        setIsPlayingAI(true)
      } catch (error) {
        console.error('Error playing AI audio:', error)
        setIsPlayingAI(false)
        
        // Try to reload the audio data if there's an error
        if (aiAudioRef.current) {
          aiAudioRef.current.src = aiAudioData.audio
          aiAudioRef.current.load()
        }
      }
    }
  }

  const handlePlayUser = async () => {
    if (!userAudioRef.current) return
    
    if (!userAudioData) {
      console.error('No user audio data available')
      alert('No se pudo cargar tu audio. Por favor, regresa a la página anterior y graba tu pronunciación nuevamente.')
      return
    }
    
    // Stop AI audio if playing
    if (aiAudioRef.current && !aiAudioRef.current.paused) {
      aiAudioRef.current.pause()
      setIsPlayingAI(false)
    }
    
    if (isPlayingUser) {
      userAudioRef.current.pause()
      setIsPlayingUser(false)
    } else {
      try {
        // Ensure the audio source is set correctly
        if (userAudioRef.current.src !== userAudioData.audio) {
          userAudioRef.current.src = userAudioData.audio
        }
        
        // Wait for the audio to be ready if needed
        if (userAudioRef.current.readyState < 2) {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio loading timeout'))
            }, 5000)
            
            const onCanPlay = () => {
              clearTimeout(timeout)
              userAudioRef.current?.removeEventListener('canplay', onCanPlay)
              userAudioRef.current?.removeEventListener('error', onError)
              resolve(undefined)
            }
            
            const onError = (e: any) => {
              clearTimeout(timeout)
              userAudioRef.current?.removeEventListener('canplay', onCanPlay)
              userAudioRef.current?.removeEventListener('error', onError)
              reject(e)
            }
            
            userAudioRef.current?.addEventListener('canplay', onCanPlay)
            userAudioRef.current?.addEventListener('error', onError)
            userAudioRef.current?.load()
          })
        }
        
        await userAudioRef.current.play()
        setIsPlayingUser(true)
      } catch (error) {
        console.error('Error playing user audio:', error)
        setIsPlayingUser(false)
        
        // Try to reload the audio data if there's an error
        if (userAudioRef.current) {
          userAudioRef.current.src = userAudioData.audio
          userAudioRef.current.load()
        }
      }
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
    setCurrentSentenceIndex(0)
    setCurrentWordIndex(0)
    setUserCurrentWordIndex(0)
  }

  const handleAiSliderChange = (value: number[]) => {
    if (aiAudioRef.current && aiDuration > 0) {
      setIsAiSeeking(true)
      const newTime = (value[0] / 100) * aiDuration
      aiAudioRef.current.currentTime = newTime
      setAiCurrentTime(newTime)
      
      // Update word and sentence index immediately when seeking
      const progress = newTime / aiDuration
      if (words.length > 0) {
        const wordIndex = Math.floor(progress * words.length)
        setCurrentWordIndex(Math.min(wordIndex, words.length - 1))
        
        // Update sentence index based on which sentence the current word belongs to
        const sentenceIndex = getCurrentSentenceForWord(wordIndex)
        setCurrentSentenceIndex(sentenceIndex)
      }
    }
  }

  const handleUserSliderChange = (value: number[]) => {
    if (userAudioRef.current && userDuration > 0) {
      setIsUserSeeking(true)
      const newTime = (value[0] / 100) * userDuration
      userAudioRef.current.currentTime = newTime
      setUserCurrentTime(newTime)
      
      // Update word index immediately when seeking user audio
      const progress = newTime / userDuration
      if (words.length > 0) {
        const wordIndex = Math.floor(progress * words.length)
        setUserCurrentWordIndex(Math.min(wordIndex, words.length - 1))
      }
    }
  }

  const syncAudiosToSentence = (sentenceIndex: number) => {
    const progress = sentenceIndex / sentences.length
    
    if (aiAudioRef.current && aiDuration > 0) {
      aiAudioRef.current.currentTime = progress * aiDuration
      setAiCurrentTime(progress * aiDuration)
    }
    if (userAudioRef.current && userDuration > 0) {
      userAudioRef.current.currentTime = progress * userDuration
      setUserCurrentTime(progress * userDuration)
    }
    
    // Update both sentence and word index for both audios
    setCurrentSentenceIndex(sentenceIndex)
    if (words.length > 0) {
      const wordIndex = Math.floor(progress * words.length)
      setCurrentWordIndex(Math.min(wordIndex, words.length - 1))
      setUserCurrentWordIndex(Math.min(wordIndex, words.length - 1))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderHighlightedText = (isForUser: boolean) => {
    if (words.length === 0) return text

    // Always show highlighting when there's audio data and duration, regardless of play state
    const hasAudioData = isForUser ? userAudioData && userDuration > 0 : aiAudioData && aiDuration > 0
    const activeWordIndex = isForUser ? userCurrentWordIndex : currentWordIndex

    return (
      <span>
        {words.map((word, index) => {
          const isCurrentWord = hasAudioData && index === activeWordIndex
          const isInCurrentSentence = hasAudioData && getCurrentSentenceForWord(index) === currentSentenceIndex
          
          return (
            <span
              key={`word-${index}-${isForUser ? 'user' : 'ai'}`}
              className={`
                ${isCurrentWord 
                  ? isForUser 
                    ? 'bg-secondary text-secondary-foreground font-bold px-1 rounded shadow-sm' 
                    : 'bg-primary text-primary-foreground font-bold px-1 rounded shadow-sm'
                  : isInCurrentSentence 
                    ? isForUser
                      ? 'bg-secondary/15 text-foreground'
                      : 'bg-primary/15 text-foreground'
                    : 'text-foreground'
                }
                transition-all duration-150 ease-in-out
              `.trim()}
              style={{
                display: 'inline-block',
                marginRight: index < words.length - 1 ? '0.25rem' : '0'
              }}
            >
              {word}
            </span>
          )
        })}
      </span>
    )
  }

  const getCurrentSentenceForWord = (wordIndex: number) => {
    if (words.length === 0 || sentences.length === 0) return 0
    
    // Calculate which sentence this word belongs to based on actual text position
    let wordCount = 0
    let currentText = ''
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim()
      const sentenceWords = sentence.split(/\s+/).filter(w => w.trim().length > 0)
      
      if (wordIndex < wordCount + sentenceWords.length) {
        return i
      }
      
      wordCount += sentenceWords.length
    }
    
    return sentences.length - 1
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
                  disabled={false}
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

                {/* Audio Progress Slider */}
                <div className="w-full space-y-2">
                  <Slider
                    value={[aiDuration > 0 ? (aiCurrentTime / aiDuration) * 100 : 0]}
                    onValueChange={handleAiSliderChange}
                    max={100}
                    step={0.1}
                    className="w-full"
                    disabled={!aiAudioData || aiDuration === 0}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(aiCurrentTime)}</span>
                    <span>{formatTime(aiDuration)}</span>
                  </div>
                </div>

                {/* Transcription */}
                <div className="bg-muted/50 p-3 rounded-lg text-left">
                  <p className="text-xs text-muted-foreground mb-1">Transcripción:</p>
                  <p className="text-sm leading-relaxed">
                    {renderHighlightedText(false)}
                  </p>
                </div>
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
                  disabled={false}
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

                {/* Audio Progress Slider */}
                <div className="w-full space-y-2">
                  <Slider
                    value={[userDuration > 0 ? (userCurrentTime / userDuration) * 100 : 0]}
                    onValueChange={handleUserSliderChange}
                    max={100}
                    step={0.1}
                    className="w-full"
                    disabled={!userAudioData || userDuration === 0}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(userCurrentTime)}</span>
                    <span>{formatTime(userDuration)}</span>
                  </div>
                </div>

                {/* Transcription */}
                <div className="bg-muted/50 p-3 rounded-lg text-left">
                  <p className="text-xs text-muted-foreground mb-1">Transcripción:</p>
                  <p className="text-sm leading-relaxed">
                    {renderHighlightedText(true)}
                  </p>
                </div>
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
