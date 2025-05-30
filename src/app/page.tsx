
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, type FrenchLevel } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wind, LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

type AuthMode = "signin" | "signup";
type OnboardingStep = "auth" | "details" | "loading"; 

export default function AuthAndOnboardingPage() {
  const router = useRouter();
  const {
    firebaseUser, loadingAuth, loadingUserData,
    level: contextLevel, setLevel,
    userName: contextUserName, setUserName,
    signUpWithEmail, signInWithEmail,
    signInWithGoogle
  } = useUser();
  const { toast } = useToast();

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("loading");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<FrenchLevel>("Beginner");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Determine onboarding step or navigate
  useEffect(() => {
    if (loadingAuth || loadingUserData) { // Check both loading flags
      setOnboardingStep("loading");
      return;
    }

    if (firebaseUser) {
      if (contextUserName && contextLevel) {
        if (router.pathname !== '/dashboard' && router.pathname !== '/settings') {
          router.push('/dashboard');
        } else {
          setOnboardingStep("auth"); 
        }
      } else {
        setOnboardingStep("details");
      }
    } else {
      setOnboardingStep("auth");
      setError(null); 
    }
  }, [firebaseUser, loadingAuth, loadingUserData, contextUserName, contextLevel, router]);

  // Effect 2: Pre-fill form fields when on 'details' step or context changes
   useEffect(() => {
    if (onboardingStep === "details") {
      if (contextUserName) {
        setNameInput(contextUserName);
      } else if (firebaseUser?.displayName && nameInput === "") {
         // Only set from firebaseUser.displayName if nameInput is currently empty
         // to avoid overwriting user's typing if context updates mid-typing.
        setNameInput(firebaseUser.displayName);
      }
      setSelectedLevel(contextLevel || "Beginner");
    } else if (onboardingStep === "auth") {
      // Reset form fields if navigating away from details or logging out
      // setNameInput(""); // Keep potentially entered name if user flips between signin/signup
      // setSelectedLevel("Beginner"); // Keep potentially selected level
    }
  }, [onboardingStep, firebaseUser, contextUserName, contextLevel, nameInput]); // Added nameInput to deps for displayName logic


  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (authMode === "signup" && password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      setIsSubmitting(false);
      toast({ variant: "destructive", title: "Sign Up Error", description: msg });
      return;
    }

    try {
      if (authMode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      toast({ title: authMode === "signup" ? "Sign Up Successful" : "Sign In Successful", description: "Welcome to French Breeze!" });
      // useEffect will handle navigation or step change
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed. Please try again.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Authentication Error", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google') => {
    setError(null);
    setSocialSubmitting(provider);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast({ title: "Sign In Successful", description: `Welcome, ${user.displayName || 'Explorer'}!` });
        // useEffect will handle navigation or step change
      }
    } catch (err: any) {
      let errorMessage = "Social sign-in failed. Please try again.";
      if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email using a different sign-in method. Try signing in with that method.";
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in popup was closed. Please ensure popups are not blocked and try again.";
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by the browser. Please allow popups for this site and try again.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is not enabled for this app. Please contact support.";
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Google Sign-In. Please check Firebase settings or contact support.";
      }
      else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sign In Error", description: errorMessage });
    } finally {
      setSocialSubmitting(null);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nameInput.trim() && selectedLevel) {
      setIsSubmitting(true);
      try {
        // setUserName will also update Firebase Auth profile if name changes and flag is true
        await setUserName(nameInput.trim(), true); 
        await setLevel(selectedLevel);
        toast({ title: "Profile Updated", description: "Your details have been saved."});
        // Navigation to dashboard will be handled by the main useEffect
      } catch (err: any) {
        const errorMessage = "Failed to save details: " + (err.message || "Unknown error");
        setError(errorMessage);
        toast({ variant: "destructive", title: "Error", description: errorMessage});
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const message = "Please enter your name and select a level.";
      setError(message);
      toast({variant: "destructive", title: "Missing Information", description: message})
    }
  };

  if (onboardingStep === "loading" || loadingAuth || loadingUserData) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-accent/30">
        <Wind className="h-16 w-16 text-primary mb-4 animate-spin" />
        <p className="text-lg text-foreground">Loading French Breeze...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-accent/30">
      <div
        className="mb-8 flex items-center justify-center"
        data-ai-hint="app logo"
      >
        <Wind className="h-16 w-16 text-primary" />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {onboardingStep === "auth" ? "Welcome to French Breeze!" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {onboardingStep === "auth" ? "Sign in or create an account to start learning." : "Tell us a bit about yourself."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onboardingStep === "auth" && (
            <>
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
                  <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting || !!socialSubmitting}>
                    {isSubmitting ? "Processing..." : (authMode === "signin" ? "Sign In" : "Create Account")}
                  </Button>
                </form>
              </Tabs>

              <div className="my-6 flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-xs text-muted-foreground uppercase">Or continue with</span>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignIn('google')}
                  disabled={!!socialSubmitting || isSubmitting}
                >
                  {socialSubmitting === 'google' ? (
                    "Processing..."
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 112.8 512 0 398.9 0 256S112.8 0 244 0c69.8 0 130.8 28.5 173.4 72.9l-65.8 64.4C332.9 112.3 291.5 96 244 96c-83.8 0-152.3 68.4-152.3 152S160.2 416 244 416c51.9 0 94.3-19.9 122.2-51.1l65.8 64.4C404.4 467.3 331.6 512 244 512zM427.8 209.9c0-12.9-1.1-25.4-3.4-37.5H244v71.7h105.9c-4.7 24.3-18.9 44.7-39.9 58.8l65.8 64.4C415.1 346.9 427.8 293.8 427.8 209.9z"></path></svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </div>
            </>
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
                  value={selectedLevel || "Beginner"}
                  onValueChange={(value: string) => setSelectedLevel(value as FrenchLevel)}
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
              <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Start Learning"}
              </Button>
            </form>
          )}
          {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} French Breeze. Fly high with French!</p>
      </footer>
    </div>
  );
}
