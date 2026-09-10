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

export class OpenAIProvider implements AIProvider {
  name = "OpenAI";
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.model = model;
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async generateEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput> {
    const systemPrompt = `You are MailPilot, an expert AI email assistant. Return JSON: { "subject": string, "body": string, "tone": string, "intent": string }. Never invent missing facts. Use placeholders like [Manager Name], [Date]. Tone: ${input.tone || "professional"}.`;
    const raw = await this.callOpenAI(systemPrompt, input.prompt);
    const parsed = JSON.parse(raw);
    return {
      subject: parsed.subject || "Email from MailPilot",
      body: parsed.body || "",
      tone: parsed.tone || input.tone || "professional",
      intent: parsed.intent || "Email Generation",
    };
  }

  async generateReply(input: ReplyInput): Promise<EmailGenerationOutput> {
    const systemPrompt = `You are MailPilot Reply Generator. Return JSON: { "subject": string, "body": string, "tone": string, "intent": string }. Tone: ${input.tone || "professional"}.`;
    const raw = await this.callOpenAI(systemPrompt, `Received:\n${input.receivedEmail}\n\nIntent: ${input.userIntent || input.intentPreset || "reply"}`);
    const parsed = JSON.parse(raw);
    return {
      subject: parsed.subject || "Re: Update",
      body: parsed.body || "",
      tone: parsed.tone || input.tone || "professional",
      intent: parsed.intent || "reply",
    };
  }

  async improveEmail(input: EmailImprovementInput): Promise<EmailImprovementOutput> {
    const systemPrompt = `You are MailPilot Email Improver. Return JSON: { "original": string, "improved": string, "subject": string, "changesSummary": string[], "readabilityScore": string }. Tone: ${input.desiredTone || "professional"}.`;
    const raw = await this.callOpenAI(systemPrompt, input.emailToImprove);
    const parsed = JSON.parse(raw);
    return {
      original: input.emailToImprove,
      improved: parsed.improved || input.emailToImprove,
      subject: parsed.subject,
      changesSummary: parsed.changesSummary || ["Improved phrasing and clarity"],
      readabilityScore: parsed.readabilityScore || "Excellent",
    };
  }

  async analyzeEmail(input: string): Promise<EmailAnalysisOutput> {
    const systemPrompt = `You are MailPilot Email Analyzer. Return JSON with keys: tone, sentiment, urgency, intent, actionRequired, importantDetails (datesAndDeadlines, actionItems, peopleAndNames, amountsAndNumbers, questionsAsked), summary, suggestedReplies.`;
    const raw = await this.callOpenAI(systemPrompt, input);
    return JSON.parse(raw) as EmailAnalysisOutput;
  }

  async humanizeEmail(input: HumanizeInput): Promise<HumanizeOutput> {
    const systemPrompt = `You are MailPilot Email Humanizer. Return JSON: { "humanizedText": string, "adjustmentsSummary": string[] }. Level: ${input.level || "natural"}.`;
    const raw = await this.callOpenAI(systemPrompt, input.email);
    const parsed = JSON.parse(raw);
    return {
      humanizedText: parsed.humanizedText || input.email,
      adjustmentsSummary: parsed.adjustmentsSummary || ["Streamlined for natural human feel"],
    };
  }

  async translateEmail(input: TranslationInput): Promise<TranslationOutput> {
    const systemPrompt = `You are MailPilot Email Translator. Return JSON: { "translatedText": string, "sourceLanguage": string, "targetLanguage": string, "detectedTone": string }. Target: ${input.targetLanguage}.`;
    const raw = await this.callOpenAI(systemPrompt, input.email);
    const parsed = JSON.parse(raw);
    return {
      translatedText: parsed.translatedText || "",
      sourceLanguage: parsed.sourceLanguage || input.sourceLanguage || "English",
      targetLanguage: input.targetLanguage,
      detectedTone: parsed.detectedTone || "Professional",
    };
  }
}
