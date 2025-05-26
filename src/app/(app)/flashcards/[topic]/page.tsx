"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFlashcardsByTopic, type FlashcardSet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { generateAudioAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export default function FlashcardTopicPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const topicSlug = params.topic as string;
  
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    if (topicSlug) {
      const topicName = topicSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const set = getFlashcardsByTopic(topicName);
      setFlashcardSet(set || null);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [topicSlug]);

  const handlePlayAudio = async (text: string) => {
    if (audioPlaying) return;
    setAudioPlaying(true);
    toast({ title: "Pronunciation", description: `Generating audio for "${text}"...` });

    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.onend = () => setAudioPlaying(false);
        utterance.onerror = () => { setAudioPlaying(false); fetchAndPlayAIAudio(text); };
        speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn("Browser speech synthesis failed, falling back to AI.", e);
      }
    }
    fetchAndPlayAIAudio(text);
  };

  const fetchAndPlayAIAudio = async (text: string) => {
    const result = await generateAudioAction(text);
    if (result.audioUrl) {
      const audioElement = document.getElementById("flashcard-audio") as HTMLAudioElement;
      if (audioElement) {
        audioElement.src = result.audioUrl;
        if (result.audioUrl.startsWith("mock-audio-for-")) {
            toast({ title: "Pronunciation", description: `Mock audio for "${text}". Real AI integration needed.`});
            setAudioPlaying(false);
            return;
        }
        audioElement.play().catch(e => {
            console.error("Error playing AI audio:", e);
            toast({ variant: "destructive", title: "Audio Error", description: "Could not play AI-generated audio." });
        });
        audioElement.onended = () => setAudioPlaying(false);
      }
    } else if (result.error) {
      toast({ variant: "destructive", title: "Audio Error", description: result.error });
      setAudioPlaying(false);
    }
  };


  if (!flashcardSet) {
    return <div className="text-center py-10">Loading flashcards or set not found...</div>;
  }

  const currentCard = flashcardSet.cards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcardSet.cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcardSet.cards.length) % flashcardSet.cards.length);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Button variant="outline" onClick={() => router.push('/flashcards')} className="self-start">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sets
      </Button>
      
      <Card className="w-full max-w-lg min-h-[300px] flex flex-col shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">{flashcardSet.topic} Flashcards</CardTitle>
        </CardHeader>
        <CardContent 
          className="flex-grow flex flex-col items-center justify-center text-center p-6 cursor-pointer perspective"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className={`relative w-full h-48 preserve-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            <div className="absolute w-full h-full backface-hidden border rounded-lg bg-card flex flex-col items-center justify-center p-4">
              <p className="text-3xl font-semibold">{currentCard.front}</p>
              {currentCard.pronunciationHint && <p className="text-sm text-muted-foreground mt-2">({currentCard.pronunciationHint})</p>}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); handlePlayAudio(currentCard.front); }} 
                className="mt-4"
                disabled={audioPlaying}
                aria-label={`Play audio for ${currentCard.front}`}
              >
                <Volume2 className={`h-6 w-6 ${audioPlaying ? 'text-primary animate-pulse' : ''}`} />
              </Button>
            </div>
            <div className="absolute w-full h-full backface-hidden border rounded-lg bg-accent/30 flex items-center justify-center p-4 rotate-y-180">
              <p className="text-2xl">{currentCard.back}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Card {currentIndex + 1} of {flashcardSet.cards.length}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={prevCard} aria-label="Previous card">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)} aria-label="Flip card">
          <RotateCcw className="mr-2 h-4 w-4" /> Flip
        </Button>
        <Button variant="outline" onClick={nextCard} aria-label="Next card">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <audio id="flashcard-audio" className="hidden"></audio>
      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
