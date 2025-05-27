
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Printer, Download, Wind } from 'lucide-react';
import { getQuizById, type Quiz } from '@/lib/data'; // To get quiz title if not passed or for more details

export default function CertificatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { firebaseUser, userName: contextUserName } = useUser();

  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);

  const quizId = params.quizId as string;
  const userName = searchParams.get('userName') || contextUserName || 'Dedicated Learner';
  const quizTitle = searchParams.get('quizTitle') || 'Selected Quiz';
  const score = searchParams.get('score');
  const date = searchParams.get('date') ? new Date(searchParams.get('date') as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (quizId) {
      const fetchedQuiz = getQuizById(quizId);
      setQuizDetails(fetchedQuiz || null);
    }
  }, [quizId]);
  
  // Redirect if essential data is missing or score is too low (e.g., direct navigation attempt)
  useEffect(() => {
    if (!score || parseInt(score) < 60) {
      // router.replace('/dashboard'); // Or some other appropriate page
      console.warn("Attempted to access certificate page with invalid score or missing data.");
    }
  }, [score, router]);

  const handlePrint = () => {
    window.print();
  };
  
  // Basic PDF download using html2canvas and jspdf would go here if implemented
  // For now, print is the primary "download"
  const handleDownloadPdf = async () => {
    alert("PDF download functionality would be implemented here using a library like html2canvas and jsPDF. For now, please use the Print option.");
    // Example (requires installing html2canvas and jspdf):
    // const {default: html2canvas} = await import('html2canvas');
    // const {default: jsPDF} = await import('jspdf');
    // const certificateElement = document.getElementById('certificate-content');
    // if (certificateElement) {
    //   const canvas = await html2canvas(certificateElement, { scale: 2 });
    //   const imgData = canvas.toDataURL('image/png');
    //   const pdf = new jsPDF('landscape', 'pt', 'a4');
    //   const pdfWidth = pdf.internal.pageSize.getWidth();
    //   const pdfHeight = pdf.internal.pageSize.getHeight();
    //   const imgWidth = canvas.width;
    //   const imgHeight = canvas.height;
    //   const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    //   const imgX = (pdfWidth - imgWidth * ratio) / 2;
    //   const imgY = 30; // Adjust as needed
    //   pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    //   pdf.save(`Certificate-${quizTitle.replace(/\s+/g, '_')}-${userName.replace(/\s+/g, '_')}.pdf`);
    // }
  };

  if (!firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please log in to view your certificate.</p>
      </div>
    );
  }
  
  if (!score || parseInt(score) < 60) {
     return (
      <Card className="m-auto mt-10 max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This certificate cannot be accessed, or the required score was not met.</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">Go to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 print:p-0">
      <Card className="max-w-3xl mx-auto shadow-2xl print:shadow-none print:border-none">
        <div id="certificate-content" className="p-6 md:p-10 border-4 border-primary rounded-lg bg-gradient-to-br from-background to-secondary/30 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full print:hidden"></div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-accent/20 rounded-full print:hidden"></div>
          
          <div className="text-center mb-8 relative z-10">
            <Wind className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary">French Breeze</h1>
            <p className="text-xl text-muted-foreground">Certificate of Completion</p>
          </div>

          <div className="text-center my-10 relative z-10">
            <p className="text-lg mb-2">This certificate is proudly presented to</p>
            <p className="text-3xl font-semibold text-accent-foreground mb-6">{userName}</p>
            <p className="text-lg mb-2">for successfully completing the quiz</p>
            <p className="text-2xl font-medium text-primary-foreground bg-primary/80 px-4 py-2 inline-block rounded-md shadow">
              {quizDetails?.title || quizTitle}
            </p>
            <p className="text-lg mt-4">
              achieving a score of <span className="font-bold">{score}%</span>
            </p>
            <p className="text-md text-muted-foreground mt-2">
              on {date}
            </p>
          </div>

          <div className="text-center mt-12 relative z-10">
            <Award className="w-20 h-20 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Congratulations on your achievement! Keep learning and progressing.
            </p>
          </div>
        </div>
        <CardContent className="mt-6 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Print Certificate
          </Button>
          <Button onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" /> Download as PDF (Placeholder)
          </Button>
           <Button onClick={() => router.push('/dashboard')} variant="secondary">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    