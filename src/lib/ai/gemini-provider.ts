import type { AIProvider } from "./ai-provider.interface";
import type {
  EmailGenerationInput,
  EmailGenerationOutput,
  ReplyInput,
  EmailImprovementInput,
  EmailImprovementOutput,
  EmailAnalysisOutput,
  HumanizeInput,
  HumanizeOutput,
  TranslationInput,
  TranslationOutput,
} from "@/types";

// Fallback sequence for Google Gemini models
const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-1.5-flash",
];

// Global cache for the active/verified working model
let activeWorkingModel: string | null = null;

function extractJson<T = any>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if returned by Gemini (e.g. ```json ... ``` or ``` ...)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return JSON.parse(cleaned) as T;
}

export class GeminiProvider implements AIProvider {
  name = "Google Gemini";
  private apiKey: string;
  private preferredModel: string;

  constructor(apiKey?: string, model = "gemini-3.6-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.preferredModel = model || "gemini-3.6-flash";
  }

  private async executeGeminiRequest(model: string, systemPrompt: string, userPrompt: string, jsonMode = true): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, any> = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser Input:\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    };

    if (jsonMode) {
      body.generationConfig.responseMimeType = "application/json";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      const errorObj = new Error(`Gemini API error (${res.status}): ${errText}`);
      (errorObj as any).status = res.status;
      (errorObj as any).errorBody = errText;
      throw errorObj;
    }

    const data = await res.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API");
    }

    return outputText;
  }

  private async callGemini(systemPrompt: string, userPrompt: string, jsonMode = true): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    // Determine the list of models to try in order
    const candidateList = Array.from(
      new Set([
        activeWorkingModel,
        this.preferredModel,
        ...GEMINI_CANDIDATE_MODELS,
      ].filter(Boolean) as string[])
    );

    let lastError: Error | null = null;

    for (const model of candidateList) {
      try {
        const result = await this.executeGeminiRequest(model, systemPrompt, userPrompt, jsonMode);
        // Successful generation! Cache the working model for subsequent calls
        activeWorkingModel = model;
        return result;
      } catch (err: any) {
        lastError = err;
        const isModelNotFoundError =
          err.status === 404 ||
          err.status === 400 ||
          (err.message && (err.message.includes("not found") || err.message.includes("no longer available") || err.message.includes("not supported")));

        if (isModelNotFoundError) {
          // Model was deprecated or not found on this API version; try next candidate
          console.warn(`[MailPilot AI] Gemini model '${model}' not available (${err.message?.slice(0, 100)}). Falling back to next model candidate...`);
          continue;
        }

        // For temporary server overloads (e.g. 503), attempt next candidate model as well
        if (err.status === 503 || err.status === 429) {
          console.warn(`[MailPilot AI] Gemini model '${model}' returned ${err.status}. Trying next candidate model...`);
          continue;
        }

        // For auth or hard validation errors (e.g. 401 invalid API key), rethrow immediately
        throw err;
      }
    }

    throw lastError || new Error("Failed to connect to any Gemini model candidate.");
  }

  async generateEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput> {
    const systemPrompt = `You are MailPilot, an expert AI email assistant.
Core Philosophy: "Tell MailPilot what you want to say. MailPilot writes the email."
Rules:
1. Never invent missing facts, names, dates, amounts, invoice numbers, or meeting details. Use standard bracketed placeholders like [Manager Name], [Date], [Company], [Time].
2. Adapt tone to: ${input.tone || "professional"}.
3. Length: ${input.length || "medium"}.
4. Recipient category: ${input.recipient || "Colleague"}.
${input.customToneInstructions ? `Custom Tone Instructions: ${input.customToneInstructions}` : ""}
${input.companyTone ? `Company Tone: ${input.companyTone}` : ""}
${input.brandVoice ? `Brand Voice: Personality: ${input.brandVoice.personality || ""}. Words to use: ${input.brandVoice.wordsToUse || ""}. Words to avoid: ${input.brandVoice.wordsToAvoid || ""}.` : ""}
${input.additionalInstructions ? `Additional notes: ${input.additionalInstructions}` : ""}

Return valid JSON:
{
  "subject": "Clear, compelling email subject",
  "body": "Full professional email body with greeting, message, and sign-off",
  "tone": "${input.tone || "professional"}",
  "intent": "Brief description of the email purpose"
}`;

    const raw = await this.callGemini(systemPrompt, input.prompt, true);
    const parsed = extractJson<Record<string, any>>(raw);
    return {
      subject: parsed.subject || "Email from MailPilot",
      body: parsed.body || "",
      tone: parsed.tone || input.tone || "professional",
      intent: parsed.intent || "Email Generation",
    };
  }

  async generateReply(input: ReplyInput): Promise<EmailGenerationOutput> {
    const systemPrompt = `You are MailPilot Reply Generator.
You must analyze the received email and draft a contextual, accurate reply.
Rules:
1. Preserve factual context from the received email.
2. If user provided intention: "${input.userIntent || input.intentPreset || "polite response"}", craft the reply fulfilling that exact intention.
3. Tone: ${input.tone || "professional"}. Length: ${input.length || "medium"}.
4. Never invent factual commitments not specified by user.

Return valid JSON:
{
  "subject": "Re: [Subject]",
  "body": "Contextual reply body",
  "tone": "${input.tone || "professional"}",
  "intent": "reply"
}`;

    const raw = await this.callGemini(systemPrompt, `Received Email:\n${input.receivedEmail}\n\nMy Intent:\n${input.userIntent || input.intentPreset || "Respond appropriately"}`, true);
    const parsed = extractJson<Record<string, any>>(raw);
    return {
      subject: parsed.subject || "Re: Update",
      body: parsed.body || "",
      tone: parsed.tone || input.tone || "professional",
      intent: parsed.intent || "reply",
    };
  }

  async improveEmail(input: EmailImprovementInput): Promise<EmailImprovementOutput> {
    const systemPrompt = `You are MailPilot Email Improver.
Transform rough, informal, or poorly structured emails into polished, professional communication.
Rules:
1. Do not alter facts, dates, amounts, or commitments.
2. Tone requested: ${input.desiredTone || "professional"}.
3. Summarize specific changes made (e.g. "Fixed grammatical errors", "Softened tone", "Added clear call to action").

Return valid JSON:
{
  "original": "The original text",
  "improved": "Polished, enhanced email version",
  "subject": "Suggested subject line if applicable",
  "changesSummary": ["Change 1", "Change 2", "Change 3"],
  "readabilityScore": "High"
}`;

    const raw = await this.callGemini(systemPrompt, input.emailToImprove, true);
    const parsed = extractJson<Record<string, any>>(raw);
    return {
      original: input.emailToImprove,
      improved: parsed.improved || input.emailToImprove,
      subject: parsed.subject,
      changesSummary: parsed.changesSummary || ["Enhanced phrasing and tone"],
      readabilityScore: parsed.readabilityScore || "Excellent",
    };
  }

  async analyzeEmail(input: string): Promise<EmailAnalysisOutput> {
    const systemPrompt = `You are MailPilot Email Analyzer.
Analyze the email deeply for tone, sentiment, urgency, intent, action items, dates, deadlines, questions, and provide a concise summary with suggested quick reply options.

Return valid JSON:
{
  "tone": "Professional / Casual / Formal / Urgent / etc.",
  "sentiment": "Positive" | "Neutral" | "Negative" | "Mixed",
  "urgency": "Low" | "Medium" | "High" | "Urgent",
  "intent": "Clear explanation of sender's objective",
  "actionRequired": true | false,
  "importantDetails": {
    "datesAndDeadlines": ["date 1", "deadline 2"],
    "actionItems": ["action 1"],
    "peopleAndNames": ["name 1"],
    "amountsAndNumbers": ["$100"],
    "questionsAsked": ["question 1"]
  },
  "summary": "2-3 sentence executive summary",
  "suggestedReplies": [
    { "title": "Accept / Confirm", "intent": "Confirm attendance and accept terms" },
    { "title": "Request Reschedule", "intent": "Politely ask for alternate time" }
  ]
}`;

    const raw = await this.callGemini(systemPrompt, input, true);
    return extractJson<EmailAnalysisOutput>(raw);
  }

  async humanizeEmail(input: HumanizeInput): Promise<HumanizeOutput> {
    const systemPrompt = `You are MailPilot Email Humanizer.
Make AI-generated or overly formal emails sound warm, natural, and genuinely human.
Humanization Level: ${input.level || "natural"}.
Rules:
1. Remove stiff corporate clichés (e.g. "I hope this email finds you well", "as per our previous conversation", "synergize", "esteemed").
2. Retain all factual information, names, numbers, dates, and core message intact.

Return valid JSON:
{
  "humanizedText": "Natural, conversational email body",
  "adjustmentsSummary": ["Removed robotic greetings", "Simplified phrasing for warmer tone"]
}`;

    const raw = await this.callGemini(systemPrompt, input.email, true);
    const parsed = extractJson<Record<string, any>>(raw);
    return {
      humanizedText: parsed.humanizedText || input.email,
      adjustmentsSummary: parsed.adjustmentsSummary || ["Streamlined phrasing to sound natural"],
    };
  }

  async translateEmail(input: TranslationInput): Promise<TranslationOutput> {
    const systemPrompt = `You are MailPilot Email Translator.
Translate the email to target language: ${input.targetLanguage}.
${input.preserveTone ? "Preserve the original email's tone, formality, nuance, and professional context. Do not make awkward literal word-for-word translations." : ""}

Return valid JSON:
{
  "translatedText": "Translated email body",
  "sourceLanguage": "${input.sourceLanguage || "Auto-detected"}",
  "targetLanguage": "${input.targetLanguage}",
  "detectedTone": "Professional"
}`;

    const raw = await this.callGemini(systemPrompt, input.email, true);
    const parsed = extractJson<Record<string, any>>(raw);
    return {
      translatedText: parsed.translatedText || "",
      sourceLanguage: parsed.sourceLanguage || input.sourceLanguage || "English",
      targetLanguage: input.targetLanguage,
      detectedTone: parsed.detectedTone || "Professional",
    };
  }
}

