
export type Lesson = {
  id: string;
  title: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  vocabulary: { word: string; translation: string; example: string }[];
  grammarTip: string;
  image?: string;
  dataAiHint?: string;
};

export type FlashcardSet = {
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  cards: { front: string; back: string; pronunciationHint?: string }[];
  dataAiHint?: string;
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  questions: (MultipleChoiceQuestion | FillInTheBlankQuestion)[];
  dataAiHint?: string;
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

export const lessonTopics = ["Greetings", "Food", "Travel", "Family", "Work", "Daily Life", "Hobbies"];

export const lessons: Lesson[] = [
  // Existing Lessons
  {
    id: "greetings-1",
    title: "Basic Greetings",
    topic: "Greetings",
    level: "Beginner",
    image: undefined,
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
    image: undefined,
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
    image: undefined,
    dataAiHint: "paris street map",
    vocabulary: [
      { word: "Où est...", translation: "Where is...", example: "Où est la gare ?" },
      { word: "À gauche", translation: "To the left", example: "Tournez à gauche." },
      { word: "À droite", translation: "To the right", example: "C'est à droite." },
    ],
    grammarTip: "Prepositions of place are key for directions. Pay attention to 'à', 'dans', 'sur'.",
  },
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
      { word: "Courriel", translation: "Email", example: "J'ai envoyé un courriel." },
    ],
    grammarTip: "Many work-related terms are similar to English, but watch for false friends (faux amis).",
  },
  // New Lessons
  {
    id: "greetings-2",
    title: "Introductions",
    topic: "Greetings",
    level: "Beginner",
    image: undefined,
    dataAiHint: "people meeting",
    vocabulary: [
      { word: "Je m'appelle...", translation: "My name is...", example: "Je m'appelle Marie." },
      { word: "Enchanté(e)", translation: "Nice to meet you", example: "Enchanté de faire votre connaissance." },
      { word: "Comment vous appelez-vous ?", translation: "What is your name? (formal)", example: "Comment vous appelez-vous ?" },
    ],
    grammarTip: "The 'e' in parentheses in 'Enchanté(e)' indicates the feminine form. Add 'e' if you are female.",
  },
  {
    id: "food-2",
    title: "Common Food Items",
    topic: "Food",
    level: "Beginner",
    image: undefined,
    dataAiHint: "market stall",
    vocabulary: [
      { word: "Pomme", translation: "Apple", example: "J'aime les pommes rouges." },
      { word: "Fromage", translation: "Cheese", example: "Le fromage français est délicieux." },
      { word: "Pain", translation: "Bread", example: "Une baguette de pain, s'il vous plaît." },
    ],
    grammarTip: "Articles (le, la, les, un, une, des) are very important in French and agree with the gender and number of the noun.",
  },
  {
    id: "travel-2",
    title: "At the Airport",
    topic: "Travel",
    level: "Intermediate",
    image: undefined,
    dataAiHint: "airport terminal",
    vocabulary: [
      { word: "Vol", translation: "Flight", example: "Mon vol est à 14h00." },
      { word: "Bagages", translation: "Luggage", example: "Où puis-je enregistrer mes bagages ?" },
      { word: "Passeport", translation: "Passport", example: "Voici mon passeport." },
    ],
    grammarTip: "Use conditional ('je voudrais', 'pourrais-je') for polite requests.",
  },
  {
    id: "daily-life-1",
    title: "Morning Routine",
    topic: "Daily Life",
    level: "Beginner",
    image: undefined,
    dataAiHint: "sunrise window",
    vocabulary: [
      { word: "Se réveiller", translation: "To wake up", example: "Je me réveille à sept heures." },
      { word: "Prendre le petit déjeuner", translation: "To have breakfast", example: "Je prends le petit déjeuner à sept heures et demie." },
      { word: "Se brosser les dents", translation: "To brush one's teeth", example: "Je me brosse les dents après le petit déjeuner." },
    ],
    grammarTip: "Reflexive verbs (like 'se réveiller', 'se brosser') are common for daily routine actions and require a reflexive pronoun (me, te, se, nous, vous, se).",
  },
  {
    id: "hobbies-1",
    title: "Talking About Hobbies",
    topic: "Hobbies",
    level: "Intermediate",
    image: undefined,
    dataAiHint: "various hobbies",
    vocabulary: [
      { word: "J'aime lire", translation: "I like to read", example: "Pendant mon temps libre, j'aime lire des romans." },
      { word: "Faire du sport", translation: "To play sports/exercise", example: "Je fais du sport trois fois par semaine." },
      { word: "Jouer d'un instrument", translation: "To play an instrument", example: "Elle joue du piano." },
    ],
    grammarTip: "'Jouer à' is used for sports and games (e.g., 'jouer au football'), while 'jouer de' is used for musical instruments (e.g., 'jouer de la guitare').",
  }
];

export const flashcardSets: FlashcardSet[] = [
  // Existing Sets
  {
    topic: "Greetings",
    level: "Beginner",
    cards: [
      { front: "Bonjour", back: "Hello / Good day", pronunciationHint: "bon-zhoor" },
      { front: "Comment ça va ?", back: "How are you?", pronunciationHint: "kom-mon sa va" },
      { front: "Merci", back: "Thank you", pronunciationHint: "mer-see" },
      { front: "S'il vous plaît", back: "Please (formal)", pronunciationHint: "sil voo pleh" },
      { front: "Oui", back: "Yes", pronunciationHint: "wee" },
      { front: "Non", back: "No", pronunciationHint: "nohn" },
    ],
    dataAiHint: "greeting cards"
  },
  {
    topic: "Food",
    level: "Beginner",
    cards: [
      { front: "Fromage", back: "Cheese", pronunciationHint: "fro-maj" },
      { front: "Pain", back: "Bread", pronunciationHint: "pan" },
      { front: "Vin", back: "Wine", pronunciationHint: "van" },
      { front: "Poulet", back: "Chicken", pronunciationHint: "poo-leh" },
      { front: "Poisson", back: "Fish", pronunciationHint: "pwa-sohn" },
      { front: "Fruit", back: "Fruit", pronunciationHint: "frwee" },
    ],
    dataAiHint: "food items"
  },
  // New Sets
  {
    topic: "Travel",
    level: "Intermediate",
    cards: [
      { front: "Gare", back: "Train station", pronunciationHint: "gar" },
      { front: "Aéroport", back: "Airport", pronunciationHint: "a-ay-ro-por" },
      { front: "Billet", back: "Ticket", pronunciationHint: "bee-yay" },
      { front: "Voyage", back: "Trip / Journey", pronunciationHint: "vwa-yaj" },
      { front: "Valise", back: "Suitcase", pronunciationHint: "va-leez" },
    ],
    dataAiHint: "travel suitcase"
  },
  {
    topic: "Family",
    level: "Beginner",
    cards: [
      { front: "Parent", back: "Parent", pronunciationHint: "pa-rahn" },
      { front: "Enfant", back: "Child", pronunciationHint: "ahn-fahn" },
      { front: "Mari", back: "Husband", pronunciationHint: "ma-ree" },
      { front: "Femme", back: "Wife / Woman", pronunciationHint: "fam" },
      { front: "Grand-père", back: "Grandfather", pronunciationHint: "grahn-pair" },
      { front: "Grand-mère", back: "Grandmother", pronunciationHint: "grahn-mair" },
    ],
    dataAiHint: "family photo"
  },
  {
    topic: "Daily Life",
    level: "Beginner",
    cards: [
      { front: "Matin", back: "Morning", pronunciationHint: "ma-tan" },
      { front: "Après-midi", back: "Afternoon", pronunciationHint: "a-preh-mee-dee" },
      { front: "Soir", back: "Evening", pronunciationHint: "swar" },
      { front: "Nuit", back: "Night", pronunciationHint: "nwee" },
      { front: "Maison", back: "House", pronunciationHint: "may-zohn" },
    ],
    dataAiHint: "daily routine"
  }
];

export const quizzes: Quiz[] = [
  // Existing Quizzes
  {
    id: "greetings-quiz-1",
    title: "Greetings Basics",
    topic: "Greetings",
    level: "Beginner",
    questions: [
      { type: "multiple-choice", question: "How do you say 'Good evening' in French?", options: ["Bonjour", "Salut", "Bonsoir", "Merci"], correctAnswer: "Bonsoir", audioHint: "Bonsoir" },
      { type: "fill-in-the-blank", sentence: "Au _____, à demain.", correctAnswer: "revoir", audioHint: "Au revoir" },
      { type: "multiple-choice", question: "What does 'Salut' mean?", options: ["Hello (formal)", "Goodbye (formal)", "Hi/Bye (informal)", "Thank you"], correctAnswer: "Hi/Bye (informal)", audioHint: "Salut" },
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
      { type: "multiple-choice", question: "Which of these means 'Water'?", options: ["Vin", "Lait", "Eau", "Jus"], correctAnswer: "Eau", audioHint: "Eau" },
    ],
    dataAiHint: "test paper"
  },
  // New Quizzes
  {
    id: "greetings-quiz-2",
    title: "Introductions Quiz",
    topic: "Greetings",
    level: "Beginner",
    questions: [
      { type: "multiple-choice", question: "How do you say 'My name is...' in French?", options: ["Tu t'appelles...", "Il s'appelle...", "Je m'appelle...", "Vous vous appelez..."], correctAnswer: "Je m'appelle...", audioHint: "Je m'appelle" },
      { type: "fill-in-the-blank", sentence: "_____ de faire votre connaissance.", correctAnswer: "Enchanté", audioHint: "Enchanté" }, // or Enchantée
    ],
    dataAiHint: "speech bubble"
  },
  {
    id: "travel-quiz-1",
    title: "Directions Quiz",
    topic: "Travel",
    level: "Intermediate",
    questions: [
      { type: "multiple-choice", question: "What does 'Où est la gare ?' mean?", options: ["Where is the car?", "Where is the train station?", "Is this the train station?", "To the train station."], correctAnswer: "Where is the train station?", audioHint: "Où est la gare ?" },
      { type: "fill-in-the-blank", sentence: "Tournez à _____.", correctAnswer: "gauche", audioHint: "gauche" },
    ],
    dataAiHint: "map direction"
  },
   {
    id: "daily-life-quiz-1",
    title: "Morning Routine Quiz",
    topic: "Daily Life",
    level: "Beginner",
    questions: [
      { type: "multiple-choice", question: "How to say 'To wake up'?", options: ["Se coucher", "Se lever", "Se réveiller", "S'habiller"], correctAnswer: "Se réveiller", audioHint: "Se réveiller"},
      { type: "fill-in-the-blank", sentence: "Je me _____ les dents.", correctAnswer: "brosse", audioHint: "brosse"},
    ],
    dataAiHint: "alarm clock"
  },
  {
    id: "hobbies-quiz-1",
    title: "Hobbies Vocabulary Quiz",
    topic: "Hobbies",
    level: "Intermediate",
    questions: [
      { type: "multiple-choice", question: "What is 'J'aime lire' in English?", options: ["I like to write", "I like to listen", "I like to read", "I like to speak"], correctAnswer: "I like to read", audioHint: "J'aime lire"},
      { type: "multiple-choice", question: "Which phrase means 'To play sports'?", options: ["Faire de la musique", "Faire du jardinage", "Faire du sport", "Faire la cuisine"], correctAnswer: "Faire du sport", audioHint: "Faire du sport"},
    ],
    dataAiHint: "sports equipment"
  }
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

    