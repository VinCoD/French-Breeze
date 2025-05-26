
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lessonTopics, lessons } from '@/lib/data';
import { ArrowRight, BookOpen, Handshake, Apple, Plane, Users2, Briefcase, ImageIcon as DefaultTopicIcon, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

const topicIconMap: Record<string, LucideIcon> = {
  "Greetings": Handshake,
  "Food": Apple,
  "Travel": Plane,
  "Family": Users2,
  "Work": Briefcase,
  "Default": DefaultTopicIcon
};

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          All Lesson Topics
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Dive into various aspects of the French language. Choose a topic to begin your learning adventure.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessonTopics.map((topic) => {
          const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
          const topicLessons = lessons.filter(l => l.topic === topic);
          const firstLessonImageSrc = topicLessons[0]?.image;
          const topicImageHint = topicLessons[0]?.dataAiHint || `${topic.toLowerCase()} culture`;
          const TopicIcon = topicIconMap[topic] || topicIconMap.Default;

          return (
            <Card key={topic} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              {firstLessonImageSrc ? (
                <Image src={firstLessonImageSrc} alt={topic} width={400} height={200} className="w-full h-48 object-cover" data-ai-hint={topicImageHint} />
              ) : (
                <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg" data-ai-hint={topicImageHint}>
                  <TopicIcon className="w-20 h-20 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{topic}</CardTitle>
                <CardDescription>{topicLessons.length} lessons available in this category.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button asChild className="w-full mt-auto" variant="outline">
                  <Link href={`/lessons/${topicSlug}`}>
                    Explore {topic} <ArrowRight className="ml-2 h-4 w-4" />
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
