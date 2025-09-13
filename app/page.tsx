"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Play, Volume2, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [animatedText, setAnimatedText] = useState("")

  const fullText =
    "Hacer un pitch en inglés es un desafío cuando no es tu idioma nativo. Descubrí y practica tu pronunciación perfecta con la ayuda de la IA!"

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
            Domina tu <span className="text-primary">pitch en inglés</span> sin perder tu voz
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
                Escucha tu pitch en inglés con pronunciación nativa usando tu propia voz.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Practicá</h3>
              <p className="text-muted-foreground text-sm">
                Compará tu pronunciación con la generada con IA y mejorala.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hero Image and CTA Section */}
        <div className="grid lg:grid-cols-[3fr_7fr] gap-8 items-center mb-12">
          {/* Hero Image */}
          <div className="text-center lg:text-left">
            <img 
              src="/landing.jpeg" 
              alt="Persona trabajando en laptop con burbuja de diálogo" 
              className="max-w-xs mx-auto lg:mx-0 rounded-lg"
            />
          </div>

          {/* CTA Section */}
          <div className="text-center lg:text-left">
            <Card className="w-full mx-auto lg:mx-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Llevá tu pitch al proximo nivel 🚀
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

                <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-muted-foreground mt-4">
                  <Volume2 className="w-4 h-4" />
                  <span>Powered by ElevenLabs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                1
              </div>
              <h3 className="font-semibold mb-2">Ingresa tu texto</h3>
              <p className="text-muted-foreground text-sm">
                Pegá tu discurso o presentación en inglés que quieres practicar.
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
                Recibí tu texto en inglés con pronunciación perfecta usando tu propia voz.
              </p>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                4
              </div>
              <h3 className="font-semibold mb-2">Escucha el resultado</h3>
              <p className="text-muted-foreground text-sm">
                Escuchá la version nativa y practicá las oraciones que quieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}