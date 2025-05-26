"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quizzes } from '@/lib/data';
import { ArrowRight, PuzzleIcon } from 'lucide-react';
import Image from 'next/image';

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
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <Image 
                src={`https://placehold.co/400x200.png`} 
                alt={`${quiz.title} quiz`} 
                width={400} 
                height={200} 
                className="w-full h-48 object-cover"
                data-ai-hint={`${quiz.topic} quiz game`}
              />
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
        ))}
      </div>
    </div>
  );
}
