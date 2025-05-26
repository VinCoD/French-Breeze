
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { flashcardSets } from '@/lib/data';
import { ArrowRight, Layers3 } from 'lucide-react';
import Image from 'next/image';

export default function FlashcardsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Layers3 className="mr-3 h-8 w-8 text-primary" />
          Flashcard Sets
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Memorize French vocabulary and phrases with interactive flashcards. Choose a set to start practicing.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flashcardSets.map((set) => {
          const topicSlug = set.topic.toLowerCase().replace(/\s+/g, '-');
          return (
            <Card key={set.topic} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              <Image 
                src={"https://placehold.co/400x200.png"} 
                alt={`${set.topic} flashcards`} 
                width={400} 
                height={200} 
                className="w-full h-48 object-cover"
                data-ai-hint={`${set.topic.toLowerCase()} cards`}
              />
              <CardHeader>
                <CardTitle className="text-2xl">{set.topic}</CardTitle>
                <CardDescription>Level: {set.level} ({set.cards.length} cards)</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button asChild className="w-full mt-auto">
                  <Link href={`/flashcards/${topicSlug}`}>
                    Practice {set.topic} <ArrowRight className="ml-2 h-4 w-4" />
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
