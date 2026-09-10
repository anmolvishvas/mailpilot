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

export class MockAIProvider implements AIProvider {
  name = "MailPilot Heuristic AI Engine (Local)";

  async generateEmail(input: EmailGenerationInput): Promise<EmailGenerationOutput> {
    const promptLower = input.prompt.toLowerCase();
    const recipient = input.recipient || "Manager";
    const tone = input.tone || "professional";
    const length = input.length || "medium";

    let subject = "Inquiry & Update";
    let greeting = `Hi [${recipient} Name],`;
    let signoff = "Best regards,\n[Your Name]";
    let bodyParagraphs: string[] = [];
    let intent = "general_communication";

    if (tone === "formal" || recipient === "Government / Official" || recipient === "Teacher / Professor") {
      greeting = `Dear [${recipient} Name],`;
      signoff = "Sincerely,\n[Your Name]";
    } else if (tone === "friendly" || tone === "warm" || recipient === "Friend") {
      greeting = `Hey [${recipient} Name],`;
      signoff = "Warmly,\n[Your Name]";
    } else if (tone === "executive") {
      greeting = `Hi [${recipient} Name],`;
      signoff = "Thanks,\n[Your Name]";
    }

    // Heuristic detection based on input prompt
    if (promptLower.includes("leave") || promptLower.includes("vacation") || promptLower.includes("day off") || promptLower.includes("sick")) {
      intent = "leave_request";
      subject = "Leave Request for Tomorrow";
      if (promptLower.includes("family")) {
        subject = "Leave Request - Family Event";
        bodyParagraphs = [
          "I am writing to request a day of leave for tomorrow as I have an important family function to attend.",
          "I will make sure all my urgent deliverables and pending tasks are wrapped up before I log off today. In case anything critical arises, I will be reachable via email or phone.",
          "Thank you in advance for your understanding and support.",
        ];
      } else if (promptLower.includes("sick") || promptLower.includes("doctor") || promptLower.includes("health")) {
        subject = "Sick Leave Notice";
        bodyParagraphs = [
          "I am writing to inform you that I am feeling unwell today and will need to take a sick day to recover.",
          "I have handed over my immediate priorities to [Colleague Name] to ensure continuity. I will keep you updated on my recovery.",
          "Thank you for understanding.",
        ];
      } else {
        subject = "Request for Leave";
        bodyParagraphs = [
          "I would like to request leave for [Date] due to personal commitments.",
          "I have ensured that all pressing tasks are completed ahead of time, and [Colleague Name] will cover any urgent matters in my absence.",
          "Please let me know if this works. Thank you for your support.",
        ];
      }
    } else if (promptLower.includes("payment") || promptLower.includes("invoice") || promptLower.includes("due") || promptLower.includes("pay")) {
      intent = "payment_inquiry";
      subject = "Follow-up: Pending Invoice [Invoice Number]";
      bodyParagraphs = [
        "I hope you're having a productive week.",
        "I am writing to kindly follow up on invoice [Invoice Number] for the amount of [Amount], which was due on [Due Date].",
        "Could you please confirm the current status of the payment processing? For your convenience, I have re-attached the invoice copy.",
        "Thank you for your prompt attention to this matter.",
      ];
    } else if (promptLower.includes("meeting") || promptLower.includes("reschedule") || promptLower.includes("sync") || promptLower.includes("call")) {
      intent = "meeting_request";
      subject = "Meeting Request: Discussion on [Topic]";
      bodyParagraphs = [
        "I hope this note finds you well.",
        "I would love to schedule a quick 20-30 minute sync with you this week to align on [Topic] and review next steps.",
        "Would either [Day/Time 1] or [Day/Time 2] suit your schedule? If another time works better, please feel free to propose it.",
        "Looking forward to connecting.",
      ];
    } else if (promptLower.includes("wfh") || promptLower.includes("work from home") || promptLower.includes("remote")) {
      intent = "wfh_request";
      subject = "Work From Home Request for [Date]";
      bodyParagraphs = [
        "I would like to request permission to work remotely from home on [Date].",
        "I will have full access to high-speed internet, our communications tools, and will remain fully available throughout normal working hours.",
        "Thank you for considering my request.",
      ];
    } else if (promptLower.includes("job") || promptLower.includes("application") || promptLower.includes("interview") || promptLower.includes("resume")) {
      intent = "job_application";
      subject = "Application for [Job Title] Position - [Your Name]";
      bodyParagraphs = [
        "I am writing to express my strong interest in the [Job Title] position currently open at [Company Name].",
        "With a proven background in [Your Key Skill/Experience] and a passion for [Industry Domain], I am confident in my ability to contribute meaningfully to your team from day one.",
        "I have attached my resume and portfolio for your review. I would welcome the opportunity to discuss how my skill set aligns with your goals.",
        "Thank you for your time and consideration.",
      ];
    } else {
      // General prompt transformation
      subject = `Update regarding ${input.prompt.slice(0, 30).trim()}...`;
      bodyParagraphs = [
        `I am writing to you regarding ${input.prompt.trim()}.`,
        "I wanted to ensure we are aligned and provide full clarity on the key details.",
        "Please let me know if you have any questions or if you would like any additional information.",
      ];
    }

    if (length === "short") {
      bodyParagraphs = bodyParagraphs.slice(0, 2);
    } else if (length === "long" || length === "detailed") {
      bodyParagraphs.push("Please do not hesitate to reach out if any further clarification or documentation is needed on my end.");
    }

    if (input.companyTone) {
      bodyParagraphs.push(`Note: ${input.companyTone}`);
    }

    const body = `${greeting}\n\n${bodyParagraphs.join("\n\n")}\n\n${signoff}`;

    return {
      subject,
      body,
      tone,
      intent,
      wordCount: body.split(/\s+/).length,
    };
  }

  async generateReply(input: ReplyInput): Promise<EmailGenerationOutput> {
    const receivedLower = input.receivedEmail.toLowerCase();
    const intentLower = (input.userIntent || input.intentPreset || "").toLowerCase();
    const tone = input.tone || "professional";

    let subject = "Re: Follow-up & Confirmation";
    let body = "";

    if (intentLower.includes("accept") || intentLower.includes("yes") || intentLower.includes("works for me") || intentLower.includes("agree")) {
      subject = "Re: Confirmation - Sounds good";
      body = `Hi [Sender Name],\n\nThank you for reaching out.\n\nYes, that sounds great and works perfectly for me. Let's proceed as discussed.\n\nLooking forward to it.\n\nBest regards,\n[Your Name]`;
    } else if (intentLower.includes("decline") || intentLower.includes("no") || intentLower.includes("cannot") || intentLower.includes("unable")) {
      subject = "Re: Unable to attend / Apology";
      body = `Hi [Sender Name],\n\nThank you for checking in with me.\n\nUnfortunately, I will be unable to accommodate this due to a prior scheduling commitment. I apologize for any inconvenience this may cause.\n\nLet's stay in touch and connect on the next opportunity.\n\nBest regards,\n[Your Name]`;
    } else if (intentLower.includes("reschedule") || intentLower.includes("time") || intentLower.includes("move") || intentLower.includes("another day")) {
      subject = "Re: Rescheduling Request";
      body = `Hi [Sender Name],\n\nThanks for reaching out.\n\nWould it be possible for us to move this to [Proposed Date/Time] instead? I have a minor conflict at the original time.\n\nPlease let me know if the new time works for your calendar.\n\nBest regards,\n[Your Name]`;
    } else {
      subject = "Re: Thank you for your note";
      body = `Hi [Sender Name],\n\nThank you for your email regarding this matter.\n\n${input.userIntent || "I have received your message and wanted to confirm I am looking into the details."}\n\nI will keep you updated with any further progress.\n\nBest regards,\n[Your Name]`;
    }

    return {
      subject,
      body,
      tone,
      intent: "reply",
      wordCount: body.split(/\s+/).length,
    };
  }

  async improveEmail(input: EmailImprovementInput): Promise<EmailImprovementOutput> {
    const original = input.emailToImprove.trim();
    const tone = input.desiredTone || "professional";

    let improved = "";
    const changes: string[] = [
      "Structured opening with polite, professional greeting",
      "Clarified intent and removed ambiguous phrasing",
      "Replaced informal words with concise business language",
      "Added professional sign-off and call to action",
    ];

    if (original.toLowerCase().includes("payment") || original.toLowerCase().includes("pay")) {
      improved = `Subject: Friendly Reminder: Pending Payment Follow-up\n\nDear [Client Name],\n\nI hope you are having a pleasant week.\n\nI am writing to politely follow up regarding the outstanding payment for invoice [Invoice Number], which was due on [Due Date].\n\nCould you please check with your accounts team and provide an update on when we might expect the transfer? If you need another copy of the invoice, I would be happy to supply one.\n\nThank you very much for your time and prompt assistance.\n\nWarm regards,\n[Your Name]`;
    } else if (original.toLowerCase().includes("leave") || original.toLowerCase().includes("holiday")) {
      improved = `Subject: Request for Leave of Absence - [Your Name]\n\nDear [Manager Name],\n\nI would like to request leave for tomorrow, [Date], to attend to an important personal matter.\n\nI have organized my tasks and ensured all immediate responsibilities are handled. I will be available via email for any urgent escalations.\n\nThank you for your understanding.\n\nSincerely,\n[Your Name]`;
    } else {
      improved = `Dear [Recipient Name],\n\nI am writing to share an update regarding our recent discussion.\n\n${original.charAt(0).toUpperCase() + original.slice(1)}.\n\nPlease let me know if you require any additional details or have any feedback.\n\nBest regards,\n[Your Name]`;
    }

    return {
      original,
      improved,
      subject: improved.startsWith("Subject:") ? improved.split("\n\n")[0].replace("Subject: ", "") : "Polished Email",
      changesSummary: changes,
      readabilityScore: "Grade 8 (Clear & Highly Readable)",
    };
  }

  async analyzeEmail(input: string): Promise<EmailAnalysisOutput> {
    const textLower = input.toLowerCase();

    // Urgency detection
    let urgency: "Low" | "Medium" | "High" | "Urgent" = "Medium";
    if (textLower.includes("urgent") || textLower.includes("asap") || textLower.includes("emergency") || textLower.includes("immediately")) {
      urgency = "Urgent";
    } else if (textLower.includes("deadline") || textLower.includes("today") || textLower.includes("tomorrow")) {
      urgency = "High";
    } else if (textLower.includes("when you have time") || textLower.includes("no rush") || textLower.includes("fyi")) {
      urgency = "Low";
    }

    // Sentiment detection
    let sentiment: "Positive" | "Neutral" | "Negative" | "Mixed" = "Neutral";
    if (textLower.includes("thank") || textLower.includes("great") || textLower.includes("congrats") || textLower.includes("pleased")) {
      sentiment = "Positive";
    } else if (textLower.includes("disappointed") || textLower.includes("unhappy") || textLower.includes("delay") || textLower.includes("error")) {
      sentiment = "Negative";
    }

    // Dates and names heuristic extract
    const datesAndDeadlines: string[] = [];
    const actionItems: string[] = [];
    const questionsAsked: string[] = [];
    const peopleAndNames: string[] = [];
    const amountsAndNumbers: string[] = [];

    if (textLower.includes("tomorrow")) datesAndDeadlines.push("Tomorrow");
    if (textLower.includes("friday")) datesAndDeadlines.push("This Friday");
    if (textLower.includes("monday")) datesAndDeadlines.push("Next Monday");
    if (textLower.includes("today")) datesAndDeadlines.push("End of Day Today");

    // Action items
    if (textLower.includes("please") || textLower.includes("could you") || textLower.includes("confirm")) {
      actionItems.push("Provide confirmation/response to sender");
    }
    if (textLower.includes("send") || textLower.includes("share")) {
      actionItems.push("Share requested documents or details");
    }
    if (textLower.includes("pay") || textLower.includes("invoice")) {
      actionItems.push("Review and process pending payment");
    }

    // Questions
    const questionMatches = input.match(/[^.!?]+\?/g);
    if (questionMatches) {
      questionMatches.forEach((q) => questionsAsked.push(q.trim()));
    }

    // Amounts
    const amountMatches = input.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g);
    if (amountMatches) {
      amountMatches.forEach((a) => amountsAndNumbers.push(a));
    }

    return {
      tone: sentiment === "Positive" ? "Warm & Cooperative" : "Professional & Direct",
      sentiment,
      urgency,
      intent: "The sender is following up on a pending deliverable or scheduling request and awaiting confirmation.",
      actionRequired: actionItems.length > 0 || questionsAsked.length > 0,
      importantDetails: {
        datesAndDeadlines: datesAndDeadlines.length ? datesAndDeadlines : ["Not specified in message"],
        actionItems: actionItems.length ? actionItems : ["Acknowledge receipt"],
        peopleAndNames: peopleAndNames.length ? peopleAndNames : ["[Sender]"],
        amountsAndNumbers: amountsAndNumbers.length ? amountsAndNumbers : ["None specified"],
        questionsAsked: questionsAsked.length ? questionsAsked : ["Are we aligned on next steps?"],
      },
      summary: "The sender is requesting confirmation, review, or scheduling alignment regarding ongoing tasks and seeking a clear response.",
      suggestedReplies: [
        {
          title: "Accept / Confirm",
          intent: "Confirm that this works and you will proceed accordingly.",
        },
        {
          title: "Request More Time / Reschedule",
          intent: "Ask for a brief extension or propose an alternate meeting time.",
        },
        {
          title: "Politely Decline",
          intent: "Explain scheduling conflict and express regrets.",
        },
      ],
    };
  }

  async humanizeEmail(input: HumanizeInput): Promise<HumanizeOutput> {
    let text = input.email;

    // Remove rigid robotic corporate phrases
    const replacements: [RegExp, string][] = [
      [/I hope this email finds you well[.,]?\s*/gi, ""],
      [/I am writing this email to inform you that\s*/gi, "Just wanted to let you know that "],
      [/Please do not hesitate to contact me\s*/gi, "Let me know if you need anything else"],
      [/As per our previous conversation[.,]?\s*/gi, "As we chatted about earlier, "],
      [/At your earliest convenience[.,]?\s*/gi, "when you get a moment, "],
      [/Kindly note that\s*/gi, "Just a quick heads up: "],
      [/Pursuant to\s*/gi, "Following up on "],
      [/In order to synergize\s*/gi, "To work better together "],
      [/Esteemed colleague,\s*/gi, "Hi team, "],
    ];

    replacements.forEach(([pattern, repl]) => {
      text = text.replace(pattern, repl);
    });

    return {
      humanizedText: text.trim(),
      adjustmentsSummary: [
        "Removed stale corporate clichés (e.g. 'I hope this email finds you well')",
        "Softened rigid phrasing into conversational, respectful language",
        "Preserved all factual details, names, dates, and action items",
      ],
    };
  }

  async translateEmail(input: TranslationInput): Promise<TranslationOutput> {
    const lang = input.targetLanguage.toLowerCase();
    let translated = "";

    // Multi-language translations
    if (lang.includes("hindi") || lang === "hi") {
      translated = `नमस्ते [नाम],\n\nआशा है आप सकुशल हैं।\n\nमैं आपको यह सूचित करने के लिए लिख रहा हूँ: ${input.email}\n\nयदि आपके कोई प्रश्न हों, तो कृपया मुझे बताएं।\n\nसादर,\n[आपका नाम]`;
    } else if (lang.includes("gujarati") || lang === "gu") {
      translated = `નમસ્તે [નામ],\n\nઆશા છે કે આપ મજામાં હશો.\n\nહું તમને આ સંદેશ મોકલી રહ્યો છું: ${input.email}\n\nજો તમને કોઈ પ્રશ્ન હોય તો જણાવશો.\n\nઆભાર,\n[તમારું નામ]`;
    } else if (lang.includes("spanish") || lang === "es") {
      translated = `Estimado/a [Nombre],\n\nEspero que se encuentre bien.\n\nLe escribo con respecto a: ${input.email}\n\nPor favor, no dude en comunicarse conmigo si tiene alguna duda.\n\nSaludos cordiales,\n[Su Nombre]`;
    } else if (lang.includes("french") || lang === "fr") {
      translated = `Bonjour [Nom],\n\nJ'espère que vous allez bien.\n\nJe vous écris concernant: ${input.email}\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\n[Votre Nom]`;
    } else if (lang.includes("german") || lang === "de") {
      translated = `Hallo [Name],\n\nich hoffe, es geht Ihnen gut.\n\nIch schreibe Ihnen bezüglich: ${input.email}\n\nBitte lassen Sie mich wissen, falls Sie Fragen haben.\n\nMit freundlichen Grüßen,\n[Ihr Name]`;
    } else if (lang.includes("portuguese") || lang === "pt") {
      translated = `Olá [Nome],\n\nEspero que esteja bem.\n\nEscrevo para falar sobre: ${input.email}\n\nPor favor, me avise se tiver alguma dúvida.\n\nAtenciosamente,\n[Seu Nome]`;
    } else if (lang.includes("arabic") || lang === "ar") {
      translated = `مرحباً [الاسم]،\n\nأتمنى أن تكون بخير.\n\nأكتب إليك بخصوص: ${input.email}\n\nيرجى إعلامي إذا كان لديك أي استفسار.\n\nمع خالص التحيات،\n[اسمك]`;
    } else if (lang.includes("chinese") || lang === "zh") {
      translated = `您好 [姓名]，\n\n希望您一切顺利。\n\n我写信是为了跟进：${input.email}\n\n如有任何问题，请随时联系我。\n\n此致，\n[您的名字]`;
    } else if (lang.includes("japanese") || lang === "ja") {
      translated = `[お名前] 様\n\nお世話になっております。\n\n次の件につきましてご連絡申し上げます：${input.email}\n\nご不明な点がございましたら、お気軽にお知らせください。\n\nよろしくお願いいたします。\n[あなたの名前]`;
    } else if (lang.includes("korean") || lang === "ko") {
      translated = `안녕하세요 [이름] 님,\n\n다음 사항과 관련하여 메일 드립니다: ${input.email}\n\n궁금한 점이 있으시면 언제든지 편하게 말씀해 주세요.\n\n감사합니다.\n[보내는 사람]`;
    } else {
      // English default
      translated = `Hi [Name],\n\n${input.email}\n\nBest regards,\n[Your Name]`;
    }

    return {
      translatedText: translated,
      sourceLanguage: input.sourceLanguage || "Auto-detected",
      targetLanguage: input.targetLanguage,
      detectedTone: input.preserveTone ? "Professional & Contextual" : "Standard",
    };
  }
}
