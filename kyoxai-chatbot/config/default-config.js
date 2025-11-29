export const defaultConfig = {
  BRAND: {
    NAME: 'kyox.ai',
    WEBSITE: 'https://kyox.ai/',
    LOGO: 'https://kyox.ai/kyoxai-logo.jpg',
    PRIMARY_COLOR: '#000000',
    SECONDARY_COLOR: '#F0F4F8'
  },
  USER_MESSAGE_BG: '#000000',
  USER_ICON: 'https://kyox.ai/kyoxai-logo.jpg',
  FREQUENT_QUESTIONS: [
    "What kyox.ai Does",
    "Founder Information",
    "Differentiation from Competitors",
    "Mission & Unique Value Proposition (UVP)",
    "How kyox.ai Can Help (FAQs with Answers)"
  ],
  behavior: {
    maxQuestions: 20,
    maxContentLength: 1000,
    limitMessages: {
      lengthExceeded: "Message is too long (max 1000 characters). Please ask a shorter question.",
      questionLimit: "You've reached the daily limit of 20 questions. Please try again tomorrow."
    }
  }
};
