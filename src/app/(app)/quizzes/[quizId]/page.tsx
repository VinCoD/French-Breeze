"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizById, type Quiz, type MultipleChoiceQuestion, type FillInTheBlankQuestion } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, X, Volume2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { generateAudioAction } from '@/app/actions';
import { useUser } from '@/context/UserContext';

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quizId = params.quizId as string;
  const { incrementStreak } = useUser();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    if (quizId) {
      const foundQuiz = getQuizById(quizId);
      setQuiz(foundQuiz || null);
      if (foundQuiz) {
        setUserAnswers(Array(foundQuiz.questions.length).fill(''));
        setShowResult(Array(foundQuiz.questions.length).fill(false));
      }
    }
  }, [quizId]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

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
      const audioElement = document.getElementById("quiz-audio") as HTMLAudioElement;
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

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    let answer = '';
    if (currentQuestion.type === 'multiple-choice') {
      answer = selectedOption;
    } else if (currentQuestion.type === 'fill-in-the-blank') {
      answer = fillInBlankAnswer.trim();
    }

    const isCorrect = answer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    const newShowResult = [...showResult];
    newShowResult[currentQuestionIndex] = true;
    setShowResult(newShowResult);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newUserAnswers);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      toast({ title: "Correct!", className: "bg-green-100 dark:bg-green-900 border-green-500" });
    } else {
      toast({ variant: "destructive", title: "Incorrect", description: `The correct answer was: ${currentQuestion.correctAnswer}` });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOption('');
      setFillInBlankAnswer('');
    } else {
      setQuizFinished(true);
      incrementStreak(); // Increment streak on quiz completion
    }
  };

  if (!quiz) {
    return <div className="text-center py-10">Loading quiz or quiz not found...</div>;
  }

  if (quizFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <Card className="w-full max-w-lg mx-auto text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Quiz Completed!</CardTitle>
          <CardDescription>You scored {score} out of {quiz.questions.length} ({percentage}%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={percentage >= 70 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {percentage >= 70 ? "Excellent work! 🎉" : "Good effort! Keep practicing. 💪"}
          </p>
          <Button onClick={() => router.push('/quizzes')} className="w-full">Back to Quizzes</Button>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/quizzes')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes List
      </Button>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{quiz.title}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
          <Progress value={progressPercentage} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  {currentQuestion.type === 'multiple-choice' ? (currentQuestion as MultipleChoiceQuestion).question : (currentQuestion as FillInTheBlankQuestion).sentence.replace('___', '_______')}
                </h3>
                {currentQuestion.audioHint && (
                  <Button variant="ghost" size="icon" onClick={() => handlePlayAudio(currentQuestion.audioHint!)} disabled={audioPlaying} aria-label="Play audio hint">
                    <Volume2 className={`h-5 w-5 ${audioPlaying ? 'text-primary animate-pulse' : ''}`} />
                  </Button>
                )}
              </div>

              {currentQuestion.type === 'multiple-choice' && (
                <RadioGroup
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  disabled={showResult[currentQuestionIndex]}
                  className="space-y-2"
                >
                  {(currentQuestion as MultipleChoiceQuestion).options.map((option, index) => (
                    <Label 
                      key={index} 
                      htmlFor={`option-${index}`}
                      className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors
                        ${showResult[currentQuestionIndex] && option === currentQuestion.correctAnswer ? 'bg-green-100 dark:bg-green-900 border-green-500' : ''}
                        ${showResult[currentQuestionIndex] && option === userAnswers[currentQuestionIndex] && option !== currentQuestion.correctAnswer ? 'bg-red-100 dark:bg-red-900 border-red-500' : ''}
                        hover:bg-accent/50`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <span>{option}</span>
                      {showResult[currentQuestionIndex] && option === currentQuestion.correctAnswer && <Check className="h-5 w-5 text-green-600 ml-auto" />}
                      {showResult[currentQuestionIndex] && option === userAnswers[currentQuestionIndex] && option !== currentQuestion.correctAnswer && <X className="h-5 w-5 text-red-600 ml-auto" />}
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'fill-in-the-blank' && (
                <Input
                  type="text"
                  value={fillInBlankAnswer}
                  onChange={(e) => setFillInBlankAnswer(e.target.value)}
                  placeholder="Type your answer"
                  disabled={showResult[currentQuestionIndex]}
                  className={`mt-2 ${
                    showResult[currentQuestionIndex] && fillInBlankAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? 'border-green-500 ring-green-500' : ''
                  } ${
                    showResult[currentQuestionIndex] && fillInBlankAnswer.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() ? 'border-red-500 ring-red-500' : ''
                  }`}
                />
              )}
              
              {showResult[currentQuestionIndex] && currentQuestion.type === 'fill-in-the-blank' && fillInBlankAnswer.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                <p className="text-sm text-red-600 mt-2">Correct answer: {currentQuestion.correctAnswer}</p>
              )}
            </div>
          )}

          {!showResult[currentQuestionIndex] ? (
            <Button onClick={handleSubmitAnswer} className="w-full" disabled={currentQuestion?.type === 'multiple-choice' ? !selectedOption : !fillInBlankAnswer}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="w-full">
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </CardContent>
      </Card>
      <audio id="quiz-audio" className="hidden"></audio>
    </div>
  );
}
