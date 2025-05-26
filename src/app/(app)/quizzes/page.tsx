
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizzes } from '@/lib/data';
import { ArrowRight, PuzzleIcon, Handshake, Apple, Plane, Users2, Briefcase, ImageIcon as DefaultTopicIcon, type LucideIcon } from 'lucide-react';
import Image from 'next/image'; // Still needed if some quizzes might have specific images in future

const topicIconMap: Record<string, LucideIcon> = {
  "Greetings": Handshake,
  "Food": Apple,
  "Travel": Plane,
  "Family": Users2,
  "Work": Briefcase,
  "Default": DefaultTopicIcon
};

export default function QuizzesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <PuzzleIcon className="mr-3 h-8 w-8 text-primary" />
          Test Your Knowledge
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Challenge yourself with quizzes on various French topics. Select a quiz to begin.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          // Assuming quizzes don't have their own specific 'image' field in data.ts for now
          // const quizImageSrc = quiz.image; // Uncomment if Quiz type gets an image field
          const quizImageSrc = undefined; // Forcing icon display for now
          const quizImageHint = quiz.dataAiHint || `${quiz.topic.toLowerCase()} quiz challenge`;
          const QuizIcon = topicIconMap[quiz.topic] || topicIconMap.Default;

          return (
            <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              {quizImageSrc ? (
                <Image
                  src={quizImageSrc}
                  alt={`${quiz.title} quiz`}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                  data-ai-hint={quizImageHint}
                />
              ) : (
                <div
                  className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg"
                  data-ai-hint={quizImageHint}
                >
                  <QuizIcon className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription>Topic: {quiz.topic} | Level: {quiz.level}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
               <p className="text-sm text-muted-foreground mb-3">
                {quiz.questions.length} questions to test your skills.
              </p>
              <Button asChild className="w-full mt-auto">
                <Link href={`/quizzes/${quiz.id}`}>
                  Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
        })}
      </div>
    </div>
  );
}
