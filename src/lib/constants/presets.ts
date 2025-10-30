export type CardCategory = "topic" | "action" | "emotion" | "response";

export interface VisualCard {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: CardCategory;
  createdAt: string;
}

export interface ConversationTopic {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export const quickResponses: VisualCard[] = [
  {
    id: "response-yes",
    title: "Yes",
    imageUrl: "https://img.icons8.com/color/96/checkmark--v1.png",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-no",
    title: "No",
    imageUrl: "https://img.icons8.com/color/96/cancel--v1.png",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-idk",
    title: "I don't know",
    imageUrl: "https://img.icons8.com/color/96/question-mark--v1.png",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-papa",
    title: "Papa",
    imageUrl: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-father-parenthood-flaticons-lineal-color-flat-icons-4.png",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-mama",
    title: "Mama",
    imageUrl: "https://img.icons8.com/external-flaticons-flat-flat-icons/64/external-mother-babymaternity-flaticons-flat-flat-icons.png",
    category: "response",
    createdAt: new Date().toISOString()
  }
];

export const conversationTopics: ConversationTopic[] = [
  {
    id: "topic-daily-routine",
    label: "Daily Routine",
    prompt: "Let's talk about your daily routine - waking up, getting ready, and going to school",
    category: "daily-living"
  },
  {
    id: "topic-emotions",
    label: "Feelings & Emotions",
    prompt: "How are you feeling today? Let's talk about different emotions and when we feel them",
    category: "emotional"
  },
  {
    id: "topic-food-preferences",
    label: "Food & Meals",
    prompt: "What are your favorite foods? Let's talk about meals and what you like to eat",
    category: "preferences"
  },
  {
    id: "topic-activities",
    label: "Favorite Activities",
    prompt: "What do you like to do for fun? Tell me about your favorite games and activities",
    category: "interests"
  },
  {
    id: "topic-school",
    label: "School & Learning",
    prompt: "What did you learn at school today? Let's talk about your classes and friends",
    category: "education"
  },
  {
    id: "topic-bedtime",
    label: "Bedtime Routine",
    prompt: "Let's talk about getting ready for bed - brushing teeth, putting on pajamas, and bedtime stories",
    category: "daily-living"
  },
  {
    id: "topic-family",
    label: "Family Time",
    prompt: "Tell me about your family - what do you like to do together?",
    category: "social"
  },
  {
    id: "topic-safety",
    label: "Staying Safe",
    prompt: "Let's talk about staying safe - at home, at school, and when we go outside",
    category: "safety"
  }
];

/**
 * Common phrases for quick access
 */
export const commonPhrases = [
  "Yes",
  "No",
  "I don't know",
  "Help me",
  "I need a break",
  "Thank you",
  "I'm hungry",
  "I'm tired",
  "Can we talk about this later?",
  "I understand"
];

/**
 * Sample generated cards that would be returned from AI generation
 * These demonstrate the variety of visual cards for different conversation topics
 */
export const sampleGeneratedCards = {
  feelings: [
    { id: "gen-1", label: "Happy", imageUrl: "/images/happy.png", category: "emotion" },
    { id: "gen-2", label: "Sad", imageUrl: "/images/sad.png", category: "emotion" },
    { id: "gen-3", label: "Excited", imageUrl: "/images/excited.png", category: "emotion" },
    { id: "gen-4", label: "Tired", imageUrl: "/images/tired.png", category: "emotion" },
    { id: "gen-5", label: "Calm", imageUrl: "/images/calm.png", category: "emotion" },
    { id: "gen-6", label: "Frustrated", imageUrl: "/images/frustrated.png", category: "emotion" }
  ],
  activities: [
    { id: "gen-7", label: "Playing", imageUrl: "/images/playing.png", category: "action" },
    { id: "gen-8", label: "Reading", imageUrl: "/images/reading.png", category: "action" },
    { id: "gen-9", label: "Drawing", imageUrl: "/images/drawing.png", category: "action" },
    { id: "gen-10", label: "Outside", imageUrl: "/images/outside.png", category: "place" },
    { id: "gen-11", label: "Music", imageUrl: "/images/music.png", category: "activity" },
    { id: "gen-12", label: "Friends", imageUrl: "/images/friends.png", category: "people" }
  ],
  needs: [
    { id: "gen-13", label: "Hungry", imageUrl: "/images/hungry.png", category: "need" },
    { id: "gen-14", label: "Thirsty", imageUrl: "/images/thirsty.png", category: "need" },
    { id: "gen-15", label: "Help", imageUrl: "/images/help.png", category: "need" },
    { id: "gen-16", label: "Break", imageUrl: "/images/break.png", category: "need" },
    { id: "gen-17", label: "Bathroom", imageUrl: "/images/bathroom.png", category: "need" },
    { id: "gen-18", label: "Quiet", imageUrl: "/images/quiet.png", category: "need" }
  ],
  school: [
    { id: "gen-19", label: "Teacher", imageUrl: "/images/teacher.png", category: "people" },
    { id: "gen-20", label: "Classroom", imageUrl: "/images/classroom.png", category: "place" },
    { id: "gen-21", label: "Homework", imageUrl: "/images/homework.png", category: "activity" },
    { id: "gen-22", label: "Recess", imageUrl: "/images/recess.png", category: "activity" },
    { id: "gen-23", label: "Lunch", imageUrl: "/images/lunch.png", category: "activity" },
    { id: "gen-24", label: "Math", imageUrl: "/images/math.png", category: "subject" }
  ]
} as const;

/**
 * Maps conversation topic keywords to sample card sets
 * Used for demonstration purposes when AI generation is not available
 */
export function getSampleCardsForTopic(prompt: string): VisualCard[] {
  const toVisualCards = (items: readonly any[]): VisualCard[] => {
    const normalizeCategory = (c: string): CardCategory =>
      ["topic", "action", "emotion", "response"].includes(c) ? (c as CardCategory) : "topic";

    return items.map(item => ({
      id: item.id,
      title: (item.title ?? item.label) as string,
      description: undefined,
      imageUrl: item.imageUrl,
      category: normalizeCategory(item.category),
      createdAt: new Date().toISOString()
    }));
  };

  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("feel") || lowerPrompt.includes("emotion")) {
    return toVisualCards(sampleGeneratedCards.feelings);
  }
  if (lowerPrompt.includes("activit") || lowerPrompt.includes("do") || lowerPrompt.includes("play")) {
    return toVisualCards(sampleGeneratedCards.activities);
  }
  if (lowerPrompt.includes("need") || lowerPrompt.includes("want")) {
    return toVisualCards(sampleGeneratedCards.needs);
  }
  if (lowerPrompt.includes("school") || lowerPrompt.includes("class")) {
    return toVisualCards(sampleGeneratedCards.school);
  }
  
  // Default: return a mix of cards
  return [
    ...toVisualCards(sampleGeneratedCards.feelings).slice(0, 2),
    ...toVisualCards(sampleGeneratedCards.activities).slice(0, 2),
    ...toVisualCards(sampleGeneratedCards.needs).slice(0, 2)
  ];
}

/**
 * Default user ID for development/demo (until auth is implemented)
 * This UUID is created in the database schema initialization
 */
export const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";
