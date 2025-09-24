'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function useVoiceInput(onResult: (transcript: string) => void) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (
      !(
        'webkitSpeechRecognition' in window ||
        'SpeechRecognition' in window
      )
    ) {
      toast('Voice input is not supported in this browser.')
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
  }, [onResult])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      //@ts-ignore
      recognitionRef.current.stop()
    } else {
      //@ts-ignore
      recognitionRef.current.start()
      setListening(true)
    }
  }

  return { listening, toggleListening }
}
