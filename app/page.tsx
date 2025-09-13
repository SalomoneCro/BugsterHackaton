"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Volume2, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Clona tu voz</h3>
              <p className="text-muted-foreground text-sm">
                Graba tu voz leyendo un texto en español y nuestra IA la clonará perfectamente.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IA Avanzada</h3>
              <p className="text-muted-foreground text-sm">
                Utilizamos tecnología de ElevenLabs para generar pronunciación perfecta.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resultado perfecto</h3>
              <p className="text-muted-foreground text-sm">
                Escucha tu discurso en inglés con pronunciación nativa usando tu propia voz.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-4">
                ¿Listo para mejorar tu pronunciación?
              </h2>
              <p className="text-muted-foreground mb-6">
                Prueba nuestra herramienta de clonación de voz y mejora tu pronunciación en inglés 
                manteniendo tu identidad vocal única.
              </p>
              
              <Link href="/pronunciation">
                <Button size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar ahora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-4">
                <Volume2 className="w-4 h-4" />
                <span>Powered by ElevenLabs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                1
              </div>
              <h3 className="font-semibold mb-2">Ingresa tu texto</h3>
              <p className="text-muted-foreground text-sm">
                Pega tu discurso o presentación en inglés que quieres practicar.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                2
              </div>
              <h3 className="font-semibold mb-2">Graba tu voz</h3>
              <p className="text-muted-foreground text-sm">
                Lee un texto en español para que podamos clonar las características de tu voz.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                3
              </div>
              <h3 className="font-semibold mb-2">Escucha el resultado</h3>
              <p className="text-muted-foreground text-sm">
                Recibe tu texto en inglés con pronunciación perfecta usando tu propia voz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}