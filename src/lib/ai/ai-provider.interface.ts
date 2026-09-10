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

export interface AIProvider {
  name: string;
  generateEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput>;
  generateReply(input: ReplyInput): Promise<EmailGenerationOutput>;
  improveEmail(input: EmailImprovementInput): Promise<EmailImprovementOutput>;
  analyzeEmail(input: string): Promise<EmailAnalysisOutput>;
  humanizeEmail(input: HumanizeInput): Promise<HumanizeOutput>;
  translateEmail(input: TranslationInput): Promise<TranslationOutput>;
}
