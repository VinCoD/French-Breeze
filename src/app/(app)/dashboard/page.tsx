
"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { lessonTopics, lessons } from '@/lib/data';
import { ArrowRight, BookMarked, CalendarDays, Zap, Handshake, Apple, Plane, Users2, Briefcase, ImageIcon as DefaultTopicIcon, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

const topicIconMap: Record<string, LucideIcon> = {
  "Greetings": Handshake,
  "Food": Apple,
  "Travel": Plane,
  "Family": Users2,
  "Work": Briefcase,
  "Default": DefaultTopicIcon
};

export default function DashboardPage() {
  const { firebaseUser, userName, level, progress, dailyStreak, incrementStreak } = useUser();

  React.useEffect(() => {
    if (firebaseUser) {
      incrementStreak();
    }
  }, [incrementStreak, firebaseUser]);

  const completedLessonsCount = Object.values(progress).filter(Boolean).length;
  const totalLessonsCount = lessons.length;
  const overallProgress = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0;

  if (!userName || !level) {
    return (
      <div className="text-center py-10">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Welcome to French Breeze!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please complete your profile to see your dashboard.</p>
            <Button asChild>
              <Link href="/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Bonjour, {userName || "Explorer"}!</CardTitle>
          <CardDescription className="text-lg">
            You are on the <span className="font-semibold text-accent-foreground">{level}</span> path. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <BookMarked className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLessonsCount} / {totalLessonsCount} lessons</div>
              <Progress value={overallProgress} className="mt-2 h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(overallProgress)}% completed
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dailyStreak > 0 ? "Amazing consistency! 🔥" : "Start your streak today!"}
              </p>
            </CardContent>
          </Card>
           <Card className="bg-accent/20 border-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Practice</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
               <Button asChild variant="outline" className="justify-start">
                <Link href={`/flashcards/${lessonTopics[0].toLowerCase().replace(/\s+/g, '-')}`}>
                  <Zap className="mr-2 h-4 w-4" /> Flashcards: {lessonTopics[0]}
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/quizzes/${lessons.find(l => l.topic === lessonTopics[0])?.id.replace('lesson', 'quiz') || 'greetings-quiz-1'}`}>
                  <Zap className="mr-2 h-4 w-4" /> Quiz: {lessonTopics[0]}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Explore Lesson Topics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessonTopics.map((topic) => {
            const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
            const firstLessonInTopic = lessons.find(l => l.topic === topic);
            const topicImageSrc = firstLessonInTopic?.image;
            const topicImageHint = firstLessonInTopic?.dataAiHint || `${topic.toLowerCase()} learning`;
            const TopicIcon = topicIconMap[topic] || topicIconMap.Default;

            return (
              <Card key={topic} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {topicImageSrc ? (
                  <Image src={topicImageSrc} alt={topic} width={300} height={150} className="w-full h-40 object-cover" data-ai-hint={topicImageHint} />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center rounded-t-lg" data-ai-hint={topicImageHint}>
                    <TopicIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{topic}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Master {topic.toLowerCase()} essentials in French.
                  </CardDescription>
                  <Button asChild className="mt-4 w-full" variant="secondary">
                    <Link href={`/lessons/${topicSlug}`}>
                      View {topic} Lessons <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications & Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Stay on track with your learning goals.</p>
          <Button onClick={() => alert("Push notification permission requested (not implemented).")}>
            Enable Daily Reminders
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Actual push notifications require browser permissions and further setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
