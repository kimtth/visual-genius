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
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-no",
    title: "No",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-idk",
    title: "I don't know",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-papa",
    title: "Papa",
    category: "response",
    createdAt: new Date().toISOString()
  },
  {
    id: "response-mama",
    title: "Mama",
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
