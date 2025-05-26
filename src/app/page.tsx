
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, type FrenchLevel } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wind, LogIn, UserPlus } from 'lucide-react'; // Added LogIn, UserPlus
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs
import { useToast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup";
type OnboardingStep = "auth" | "details";

export default function AuthAndOnboardingPage() {
  const router = useRouter();
  const { 
    firebaseUser, loadingAuth, 
    level: contextLevel, setLevel, 
    userName: contextUserName, setUserName, 
    signUpWithEmail, signInWithEmail 
  } = useUser();
  const { toast } = useToast();

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<FrenchLevel>("Beginner");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!loadingAuth && firebaseUser) {
      // User is logged in
      if (contextUserName && contextLevel) {
        router.push('/dashboard'); // Already onboarded
      } else {
        setOnboardingStep("details"); // Needs to complete name/level
        setNameInput(firebaseUser.displayName || "");
      }
    } else if (!loadingAuth && !firebaseUser) {
      setOnboardingStep("auth"); // Not logged in, show auth form
    }
  }, [firebaseUser, loadingAuth, contextUserName, contextLevel, router]);


  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (authMode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      let user;
      if (authMode === "signup") {
        user = await signUpWithEmail(email, password);
      } else {
        user = await signInWithEmail(email, password);
      }
      
      // onAuthStateChanged will handle routing or moving to "details" step
      // For new signups, displayName might not be set yet.
      if (user) {
        toast({ title: authMode === "signup" ? "Sign Up Successful" : "Sign In Successful", description: "Welcome to French Breeze!" });
        if (!user.displayName || !contextLevel) { // if name not set OR level not set in context
            setNameInput(user.displayName || ""); // prefill if available from oauth or previous profile
            setOnboardingStep("details");
        } else {
            router.push('/dashboard'); // Should be caught by useEffect too
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
      toast({ variant: "destructive", title: "Authentication Error", description: err.message || "An unknown error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim() && selectedLevel) {
      setIsSubmitting(true);
      try {
        await setUserName(nameInput.trim(), true); // Update Firebase profile display name
        setLevel(selectedLevel);
        toast({ title: "Profile Updated", description: "Your details have been saved."});
        router.push('/dashboard');
      } catch (err: any) {
        setError("Failed to save details: " + err.message);
        toast({ variant: "destructive", title: "Error", description: "Could not save your details."});
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loadingAuth || (firebaseUser && onboardingStep === "auth" && (!contextUserName || !contextLevel))) {
    // Show loader if auth state is loading, or if user is logged in but details step hasn't shown yet
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
          <CardTitle className="text-3xl font-bold text-primary">
            {onboardingStep === "auth" ? "Welcome to French Breeze!" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {onboardingStep === "auth" ? "Sign in or create an account to start learning." : "Tell us a bit about yourself."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onboardingStep === "auth" && (
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin"><LogIn className="mr-2 h-4 w-4" /> Sign In</TabsTrigger>
                <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</TabsTrigger>
              </TabsList>
              <form onSubmit={handleAuthSubmit} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : (authMode === "signin" ? "Sign In" : "Create Account")}
                </Button>
              </form>
            </Tabs>
          )}

          {onboardingStep === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-medium">What's your name?</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Alex"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Start Learning"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} French Breeze. Fly high with French!</p>
      </footer>
    </div>
  );
}
