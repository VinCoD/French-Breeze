"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getLessonsByTopic, type Lesson } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookCopy, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';

export default function TopicLessonsPage() {
  const params = useParams();
  const topicSlug = params.topic as string;
  const topicName = topicSlug ? topicSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Selected Topic";
  
  const lessonsInTopic = getLessonsByTopic(topicName);
  const { progress } = useUser();

  if (!lessonsInTopic || lessonsInTopic.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold">No lessons found for {topicName}.</h1>
        <p className="text-muted-foreground">Please check back later or explore other topics.</p>
        <Button asChild className="mt-4">
          <Link href="/lessons">Back to All Topics</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <BookCopy className="mr-3 h-8 w-8 text-primary" />
          Lessons in {topicName}
        </h1>
        <Button asChild variant="outline">
          <Link href="/lessons">All Topics</Link>
        </Button>
      </div>
      <p className="text-lg text-muted-foreground">
        Explore lessons related to {topicName.toLowerCase()}. Select a lesson to start learning.
      </p>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {lessonsInTopic.map((lesson: Lesson) => (
          <Card key={lesson.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow">
            {lesson.image && (
              <div className="md:w-1/3 relative">
                 <Image 
                    src={lesson.image} 
                    alt={lesson.title} 
                    width={200} 
                    height={200} 
                    className="w-full h-48 md:h-full object-cover"
                    data-ai-hint={lesson.dataAiHint || "lesson concept"} />
              </div>
            )}
            <div className={`flex-1 ${lesson.image ? 'md:w-2/3' : 'w-full'}`}>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  {lesson.title}
                  {progress[lesson.id] && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>Level: {lesson.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  Learn key vocabulary and grammar for {lesson.title.toLowerCase()}.
                </p>
                <Button asChild className="w-full md:w-auto">
                  <Link href={`/lessons/${topicSlug}/${lesson.id}`}>
                    Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
