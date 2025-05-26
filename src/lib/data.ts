
export type Lesson = {
  id: string;
  title: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  vocabulary: { word: string; translation: string; example: string }[];
  grammarTip: string;
  image?: string; // Can be undefined if no specific image
  dataAiHint?: string;
};

export type FlashcardSet = {
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  cards: { front: string; back: string; pronunciationHint?: string }[];
  // image?: string; // Add if flashcard sets will have specific images
  dataAiHint?: string; // Hint for the type of image/logo for the set
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  questions: (MultipleChoiceQuestion | FillInTheBlankQuestion)[];
  // image?: string; // Add if quizzes will have specific images
  dataAiHint?: string; // Hint for the type of image/logo for the quiz
};

export type MultipleChoiceQuestion = {
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
  audioHint?: string;
};

export type FillInTheBlankQuestion = {
  type: "fill-in-the-blank";
  sentence: string; // e.g., "Je ___ un chat." (blank represented by ___)
  correctAnswer: string;
  audioHint?: string;
};

export const lessonTopics = ["Greetings", "Food", "Travel", "Family", "Work"];

export const lessons: Lesson[] = [
  {
    id: "greetings-1",
    title: "Basic Greetings",
    topic: "Greetings",
    level: "Beginner",
    image: undefined, // Was: "https://placehold.co/600x400.png"
    dataAiHint: "friendly people",
    vocabulary: [
      { word: "Bonjour", translation: "Hello (Good day)", example: "Bonjour, comment ça va ?" },
      { word: "Salut", translation: "Hi/Bye (informal)", example: "Salut Paul !" },
      { word: "Bonsoir", translation: "Good evening", example: "Bonsoir Madame." },
      { word: "Au revoir", translation: "Goodbye", example: "Au revoir, à demain." },
    ],
    grammarTip: "'Bonjour' is used throughout the day, while 'Bonsoir' is used in the evening.",
  },
  {
    id: "food-1",
    title: "Ordering Food",
    topic: "Food",
    level: "Beginner",
    image: undefined, // Was: "https://placehold.co/600x400.png"
    dataAiHint: "french cafe",
    vocabulary: [
      { word: "Je voudrais", translation: "I would like", example: "Je voudrais un café, s'il vous plaît." },
      { word: "L'addition", translation: "The bill", example: "L'addition, s'il vous plaît." },
      { word: "Eau", translation: "Water", example: "Un verre d'eau, merci." },
    ],
    grammarTip: "Use 's'il vous plaît' (please) for politeness when ordering.",
  },
  {
    id: "travel-1",
    title: "Asking for Directions",
    topic: "Travel",
    level: "Intermediate",
    image: undefined, // Was: "https://placehold.co/600x400.png"
    dataAiHint: "paris street map", // updated hint
    vocabulary: [
      { word: "Où est...", translation: "Where is...", example: "Où est la gare ?" },
      { word: "À gauche", translation: "To the left", example: "Tournez à gauche." },
      { word: "À droite", translation: "To the right", example: "C'est à droite." },
    ],
    grammarTip: "Prepositions of place are key for directions. Pay attention to 'à', 'dans', 'sur'.",
  },
  // Add more lessons with specific images or dataAiHints
   {
    id: "family-1",
    title: "Talking about Family",
    topic: "Family",
    level: "Beginner",
    image: undefined,
    dataAiHint: "family tree",
    vocabulary: [
      { word: "Mère", translation: "Mother", example: "Ma mère s'appelle Sophie." },
      { word: "Père", translation: "Father", example: "Mon père est ingénieur." },
      { word: "Frère", translation: "Brother", example: "J'ai un frère." },
      { word: "Sœur", translation: "Sister", example: "Elle est ma sœur." },
    ],
    grammarTip: "Possessive adjectives (mon, ma, mes, ton, ta, tes, etc.) agree in gender and number with the noun they modify, not the possessor.",
  },
  {
    id: "work-1",
    title: "Workplace Vocabulary",
    topic: "Work",
    level: "Intermediate",
    image: undefined,
    dataAiHint: "office building",
    vocabulary: [
      { word: "Bureau", translation: "Office / Desk", example: "Je travaille dans un bureau." },
      { word: "Réunion", translation: "Meeting", example: "La réunion est à 10h." },
      { word: "Collègue", translation: "Colleague", example: "Mes collègues sont sympathiques." },
      { word: " ईमेल (Email)", translation: "Email", example: "J'ai envoyé un email." }, // Using French word for email if preferred
    ],
    grammarTip: "Many work-related terms are similar to English, but watch for false friends (faux amis).",
  }
];

export const flashcardSets: FlashcardSet[] = [
  {
    topic: "Greetings",
    level: "Beginner",
    cards: [
      { front: "Bonjour", back: "Hello / Good day", pronunciationHint: "bon-zhoor" },
      { front: "Comment ça va ?", back: "How are you?", pronunciationHint: "kom-mon sa va" },
      { front: "Merci", back: "Thank you", pronunciationHint: "mer-see" },
    ],
    dataAiHint: "greeting symbol"
  },
  {
    topic: "Food",
    level: "Beginner",
    cards: [
      { front: "Fromage", back: "Cheese", pronunciationHint: "fro-maj" },
      { front: "Pain", back: "Bread", pronunciationHint: "pan" },
      { front: "Vin", back: "Wine", pronunciationHint: "van" },
    ],
    dataAiHint: "food items"
  },
];

export const quizzes: Quiz[] = [
  {
    id: "greetings-quiz-1",
    title: "Greetings Basics",
    topic: "Greetings",
    level: "Beginner",
    questions: [
      { type: "multiple-choice", question: "How do you say 'Good evening' in French?", options: ["Bonjour", "Salut", "Bonsoir", "Merci"], correctAnswer: "Bonsoir", audioHint: "Bonsoir" },
      { type: "fill-in-the-blank", sentence: "Au _____, à demain.", correctAnswer: "revoir", audioHint: "Au revoir" },
    ],
    dataAiHint: "quiz icon"
  },
  {
    id: "food-quiz-1",
    title: "Food Vocabulary",
    topic: "Food",
    level: "Beginner",
    questions: [
      { type: "multiple-choice", question: "What does 'L'addition' mean?", options: ["The menu", "The waiter", "The bill", "The table"], correctAnswer: "The bill", audioHint: "L'addition"},
      { type: "fill-in-the-blank", sentence: "Je voudrais un _____, s'il vous plaît.", correctAnswer: "café", audioHint: "café" },
    ],
    dataAiHint: "test paper"
  },
];

export function getLessonsByTopic(topic: string): Lesson[] {
  return lessons.filter(lesson => lesson.topic === topic);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}

export function getFlashcardsByTopic(topic: string): FlashcardSet | undefined {
  return flashcardSets.find(set => set.topic === topic);
}

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find(quiz => quiz.id === id);
}
