import { z } from "zod";

export const generateEmailSchema = z.object({
  prompt: z.string().min(2, "Please provide what you want to say").max(5000),
  recipient: z.string().optional().default("Colleague"),
  tone: z.string().optional().default("professional"),
  length: z.enum(["short", "medium", "detailed", "long"]).optional().default("medium"),
  customToneInstructions: z.string().optional(),
  organizationId: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

export const replyEmailSchema = z.object({
  receivedEmail: z.string().min(5, "Please paste the received email"),
  userIntent: z.string().optional(),
  intentPreset: z.enum(["accept", "decline", "reschedule", "clarify", "acknowledge"]).optional(),
  tone: z.string().optional().default("professional"),
  length: z.enum(["short", "medium", "detailed", "long"]).optional().default("medium"),
  organizationId: z.string().optional(),
});

export const improveEmailSchema = z.object({
  emailToImprove: z.string().min(5, "Please provide the email to improve"),
  desiredTone: z.enum(["professional", "friendly", "concise", "assertive", "humanize"]).optional().default("professional"),
  customInstructions: z.string().optional(),
});

export const analyzeEmailSchema = z.object({
  email: z.string().min(5, "Please paste an email to analyze"),
});

export const humanizeEmailSchema = z.object({
  email: z.string().min(5, "Please provide the email to humanize"),
  level: z.enum(["light", "natural", "strong"]).optional().default("natural"),
});

export const translateEmailSchema = z.object({
  email: z.string().min(2, "Please provide the email text to translate"),
  targetLanguage: z.string().min(2, "Target language is required"),
  sourceLanguage: z.string().optional(),
  preserveTone: z.boolean().optional().default(true),
});

export const saveEmailSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().optional().default("GENERATED"),
  subject: z.string().optional(),
  body: z.string().min(1, "Email body is required"),
  originalPrompt: z.string().optional(),
  recipient: z.string().optional(),
  tone: z.string().optional(),
  tags: z.string().optional(),
});

export const customToneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().min(5, "Description must be at least 5 characters").max(300),
  instructions: z.string().min(10, "Instructions must be at least 10 characters").max(1000),
  isDefault: z.boolean().optional().default(false),
});

export const createTemplateSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  description: z.string().min(5, "Description is required").max(300),
  category: z.string().min(2, "Category is required"),
  fields: z.string(), // JSON string
  promptTemplate: z.string().min(5, "Prompt template is required"),
  defaultRecipient: z.string().optional(),
  defaultTone: z.string().optional().default("professional"),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(80),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes"),
  description: z.string().max(500).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export const updateBrandVoiceSchema = z.object({
  personality: z.string().max(500),
  wordsToUse: z.string().max(500),
  wordsToAvoid: z.string().max(500),
});

export const updateCompanyToneSchema = z.object({
  description: z.string().min(5, "Tone description is required").max(1000),
  rules: z.string().max(1000).optional(),
  isActive: z.boolean().optional().default(true),
});

export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
