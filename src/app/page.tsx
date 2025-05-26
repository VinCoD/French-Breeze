"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, type FrenchLevel } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wind } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { level: currentLevel, setLevel, userName, setUserName } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<FrenchLevel>(currentLevel || "Beginner");
  const [name, setName] = useState(userName || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If user has already completed onboarding (i.e., level is set), redirect to dashboard
    if (currentLevel && userName) {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [currentLevel, userName, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedLevel) {
      setUserName(name.trim());
      setLevel(selectedLevel);
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-accent/30">
        <Wind className="h-16 w-16 text-primary mb-4 animate-spin" />
        <p className="text-lg text-foreground">Loading French Breeze...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-accent/30">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Wind className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome to French Breeze!</CardTitle>
          <CardDescription className="text-muted-foreground">Let's get you started on your French learning journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">What's your name?</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-medium">Choose your French level:</Label>
              <RadioGroup
                value={selectedLevel || undefined}
                onValueChange={(value: FrenchLevel) => setSelectedLevel(value)}
                className="space-y-2 pt-2"
              >
                {(["Beginner", "Intermediate", "Advanced"] as FrenchLevel[]).map((levelOption) => (
                  <div key={levelOption} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={levelOption!} id={levelOption!} />
                    <Label htmlFor={levelOption!} className="text-base cursor-pointer flex-1">{levelOption}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full text-lg py-3" size="lg">
              Start Learning
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} French Breeze. Fly high with French!</p>
      </footer>
    </div>
  );
}
