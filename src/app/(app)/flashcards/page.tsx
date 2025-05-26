
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { flashcardSets } from '@/lib/data';
import { ArrowRight, Layers3, Handshake, Apple, Plane, Users2, Briefcase, ImageIcon as DefaultTopicIcon, type LucideIcon } from 'lucide-react';
import Image from 'next/image'; // Still needed if some sets might have specific images in future

const topicIconMap: Record<string, LucideIcon> = {
  "Greetings": Handshake,
  "Food": Apple,
  "Travel": Plane,
  "Family": Users2,
  "Work": Briefcase,
  "Default": DefaultTopicIcon
};

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
          // Assuming flashcard sets don't have their own specific 'image' field in data.ts for now
          // const setImageSrc = set.image; // Uncomment if FlashcardSet type gets an image field
          const setImageSrc = undefined; // Forcing icon display for now
          const setImageHint = set.dataAiHint || `${set.topic.toLowerCase()} concept`;
          const SetIcon = topicIconMap[set.topic] || topicIconMap.Default;

          return (
            <Card key={set.topic} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              {setImageSrc ? (
                <Image
                  src={setImageSrc}
                  alt={`${set.topic} flashcards`}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                  data-ai-hint={setImageHint}
                />
              ) : (
                <div
                  className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg"
                  data-ai-hint={setImageHint}
                >
                  <SetIcon className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
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
