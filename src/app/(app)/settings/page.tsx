
"use client";

import React, { useState, useEffect } from 'react';
import { useUser, type FrenchLevel } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, UserCircle, Palette, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { firebaseUser, userName, setUserName, level, setLevel } = useUser();
  const { toast } = useToast();
  
  const [currentName, setCurrentName] = useState(userName || "");
  const [currentLevel, setCurrentLevel] = useState<FrenchLevel>(level);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userName) setCurrentName(userName);
    if (level) setCurrentLevel(level);
  }, [userName, level]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let nameChanged = false;
    let levelChanged = false;

    if (currentName.trim() && currentName.trim() !== userName) {
      await setUserName(currentName.trim(), true); // true to update Firebase profile
      nameChanged = true;
    }
    if (currentLevel && currentLevel !== level) {
      setLevel(currentLevel);
      levelChanged = true;
    }

    if (nameChanged || levelChanged) {
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
        className: "bg-green-100 dark:bg-green-900 border-green-500"
      });
    } else {
       toast({
        title: "No Changes",
        description: "Your preferences are already up to date.",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
           <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
          Settings
        </h1>
      </div>
      
      <form onSubmit={handleSaveChanges}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><UserCircle className="mr-2 h-6 w-6" /> User Profile</CardTitle>
            <CardDescription>Manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {firebaseUser?.email && (
                 <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/> Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={firebaseUser.email}
                        disabled
                        className="bg-muted/50"
                    />
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Your French Level</Label>
              <RadioGroup
                value={currentLevel || undefined}
                onValueChange={(value: FrenchLevel) => setCurrentLevel(value)}
                className="space-y-2 pt-1"
              >
                {(["Beginner", "Intermediate", "Advanced"] as FrenchLevel[]).map((levelOption) => (
                  <div key={levelOption} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={levelOption!} id={`level-${levelOption!}`} />
                    <Label htmlFor={`level-${levelOption!}`} className="cursor-pointer flex-1">{levelOption}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Palette className="mr-2 h-6 w-6" /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of French Breeze.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="font-medium">Theme</Label>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Enable Daily Reminders</Label>
            <Button 
              id="push-notifications" 
              variant="outline" 
              onClick={() => alert("Push notification settings (not fully implemented).")}
            >
              Toggle Reminders
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-2">
            This is a placeholder. Full push notification management would be here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
