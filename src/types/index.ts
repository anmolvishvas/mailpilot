export type RecipientType =
  | "Manager"
  | "HR"
  | "Client"
  | "Customer"
  | "Colleague"
  | "Teacher / Professor"
  | "Friend"
  | "Company"
  | "Government / Official"
  | "Other";

export type ToneType =
  | "professional"
  | "friendly"
  | "casual"
  | "formal"
  | "polite"
  | "apologetic"
  | "assertive"
  | "persuasive"
  | "confident"
  | "warm"
  | "diplomatic"
  | "concise"
  | "executive"
  | "custom";

export type LengthType = "short" | "medium" | "detailed" | "long";

export type HumanizeLevel = "light" | "natural" | "strong";

export type LanguageType =
  | "en"
  | "hi"
  | "gu"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ar"
  | "zh"
  | "ja"
  | "ko";

export interface EmailGenerationInput {
  prompt: string;
  recipient?: string;
  tone?: string;
  length?: LengthType;
  customToneInstructions?: string;
  companyTone?: string;
  brandVoice?: {
    personality?: string;
    wordsToUse?: string;
    wordsToAvoid?: string;
  };
  additionalInstructions?: string;
}

export interface EmailGenerationOutput {
  subject: string;
  body: string;
  tone: string;
  intent: string;
  wordCount?: number;
}

export interface ReplyInput {
  receivedEmail: string;
  userIntent?: string;
  intentPreset?: "accept" | "decline" | "reschedule" | "clarify" | "acknowledge";
  tone?: string;
  length?: LengthType;
  companyTone?: string;
  brandVoice?: {
    personality?: string;
    wordsToUse?: string;
    wordsToAvoid?: string;
  };
}

export interface EmailImprovementInput {
  emailToImprove: string;
  desiredTone?: "professional" | "friendly" | "concise" | "assertive" | "humanize";
  customInstructions?: string;
}

export interface EmailImprovementOutput {
  original: string;
  improved: string;
  subject?: string;
  changesSummary: string[];
  readabilityScore?: string;
}

export interface EmailAnalysisOutput {
  tone: string;
  sentiment: "Positive" | "Neutral" | "Negative" | "Mixed";
  urgency: "Low" | "Medium" | "High" | "Urgent";
  intent: string;
  actionRequired: boolean;
  importantDetails: {
    datesAndDeadlines: string[];
    actionItems: string[];
    peopleAndNames: string[];
    amountsAndNumbers: string[];
    questionsAsked: string[];
  };
  summary: string;
  suggestedReplies: Array<{
    title: string;
    intent: string;
  }>;
}

export interface HumanizeInput {
  email: string;
  level?: HumanizeLevel;
}

export interface HumanizeOutput {
  humanizedText: string;
  adjustmentsSummary: string[];
}

export interface TranslationInput {
  email: string;
  targetLanguage: string;
  sourceLanguage?: string;
  preserveTone?: boolean;
}

export interface TranslationOutput {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  detectedTone?: string;
}

export interface TemplateField {
  name: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "select" | "date";
  options?: string[];
  required?: boolean;
}

export interface UserUsageStatus {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  canGenerate: boolean;
  resetsAt: string;
}

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";
