"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById, type Lesson as LessonType } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { generateAudioAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null); // Stores the word/phrase whose audio is playing
  const { progress, updateProgress, incrementStreak } = useUser();

  useEffect(() => {
    if (lessonId) {
      const foundLesson = getLessonById(lessonId);
      setLesson(foundLesson || null);
    }
  }, [lessonId]);

  const handlePlayAudio = async (text: string) => {
    if (audioPlaying === text) { // If same audio is clicked again, stop it (basic toggle)
      const audioElement = document.getElementById("lesson-audio") as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setAudioPlaying(null);
      return;
    }

    setAudioPlaying(text); // Indicate loading/playing
    toast({ title: "Pronunciation", description: `Generating audio for "${text}"...` });
    
    // Attempt to use browser's built-in speech synthesis first for speed
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.onend = () => setAudioPlaying(null);
        utterance.onerror = (event) => {
          console.error('SpeechSynthesisUtterance.onerror', event);
          // Fallback to AI if browser synthesis fails
          fetchAndPlayAIAudio(text);
        };
        speechSynthesis.speak(utterance);
        return; // Exit if browser synthesis is attempted
      } catch (e) {
        console.warn("Browser speech synthesis failed, falling back to AI.", e);
        // Fallback to AI if an error occurs during setup
      }
    }
    
    // Fallback to AI if browser speech synthesis is not available or failed
    fetchAndPlayAIAudio(text);
  };

  const fetchAndPlayAIAudio = async (text: string) => {
    const result = await generateAudioAction(text);
    if (result.audioUrl) {
      const audioElement = document.getElementById("lesson-audio") as HTMLAudioElement;
      if (audioElement) {
        audioElement.src = result.audioUrl; // This would be a real URL from AI
        // For mock, this URL won't work, but shows the logic
        if (result.audioUrl.startsWith("mock-audio-for-")) {
            toast({ title: "Pronunciation", description: `Mock audio for "${text}". Real AI integration needed.`});
            // We can't play a mock mp3, so we just clear playing state
            setAudioPlaying(null);
            return;
        }
        audioElement.play().catch(e => {
            console.error("Error playing AI audio:", e);
            toast({ variant: "destructive", title: "Audio Error", description: "Could not play AI-generated audio." });
        });
        audioElement.onended = () => setAudioPlaying(null);
      }
    } else if (result.error) {
      toast({ variant: "destructive", title: "Audio Error", description: result.error });
      setAudioPlaying(null);
    }
  }

  const handleMarkAsComplete = () => {
    if (lesson) {
      updateProgress(lesson.id, true);
      incrementStreak(); // Increment streak when a lesson is completed
      toast({ title: "Lesson Complete!", description: `"${lesson.title}" marked as complete.`, className: "bg-green-100 dark:bg-green-900 border-green-500" });
    }
  };

  if (!lesson) {
    return <div className="text-center py-10">Loading lesson details or lesson not found...</div>;
  }

  const isCompleted = progress[lesson.id];

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
      </Button>

      <Card className="shadow-lg">
        {lesson.image && (
            <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
                 <Image 
                    src={lesson.image} 
                    alt={lesson.title} 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint={lesson.dataAiHint || "lesson visual"} />
            </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">{lesson.title}</CardTitle>
          <CardDescription className="text-lg">
            Topic: {lesson.topic} | Level: {lesson.level}
            {isCompleted && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-500" />}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Vocabulary</h3>
            <ul className="space-y-3">
              {lesson.vocabulary.map((item, index) => (
                <li key={index} className="p-3 border rounded-md bg-secondary/30">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-lg">{item.word} - <span className="text-muted-foreground">{item.translation}</span></p>
                    <Button variant="ghost" size="icon" onClick={() => handlePlayAudio(item.word)} disabled={audioPlaying === item.word} aria-label={`Play audio for ${item.word}`}>
                      <Volume2 className={`h-5 w-5 ${audioPlaying === item.word ? 'text-primary animate-pulse' : ''}`} />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">e.g., "{item.example}"</p>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2">Grammar Tip</h3>
            <p className="text-base leading-relaxed p-3 bg-accent/20 rounded-md border border-accent">
              {lesson.grammarTip}
            </p>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            {!isCompleted ? (
              <Button onClick={handleMarkAsComplete} size="lg" className="w-full sm:w-auto">
                Mark as Complete
              </Button>
            ) : (
              <p className="text-green-600 font-semibold flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" /> Already completed!
              </p>
            )}
             <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href={`/quizzes/${lesson.id.replace('lesson', 'quiz') || 'greetings-quiz-1'}`}>
                    Test Your Knowledge
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <audio id="lesson-audio" className="hidden"></audio>
    </div>
  );
}
