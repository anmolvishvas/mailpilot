import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const templates = [
  // WORK (12 templates)
  {
    title: "Leave Request",
    description: "Request planned or emergency leave from your manager or supervisor.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager's Name", placeholder: "e.g. Sarah / Team Lead", type: "text", required: true },
      { name: "leaveType", label: "Leave Type", placeholder: "e.g. Annual Leave, Sick Leave, Family Event", type: "text", required: true },
      { name: "startDate", label: "Start Date", placeholder: "e.g. Tomorrow / Oct 15", type: "text", required: true },
      { name: "endDate", label: "End Date (if multiple days)", placeholder: "e.g. Oct 17", type: "text", required: false },
      { name: "reason", label: "Reason (Brief)", placeholder: "e.g. Attending a family wedding / Medical appointment", type: "text", required: true },
      { name: "workHandover", label: "Work Handover / Backup Plan", placeholder: "e.g. John will cover urgent client tickets", type: "text", required: false }
    ]),
    promptTemplate: "I need to request {{leaveType}} from {{startDate}} to {{endDate}}. Reason: {{reason}}. Recipient: {{recipientName}}. Backup/Handover: {{workHandover}}.",
    isBuiltIn: true
  },
  {
    title: "Work From Home Request",
    description: "Request permission to work remotely for specific days.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "professional",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager's Name", placeholder: "e.g. David", type: "text", required: true },
      { name: "wfhDates", label: "Dates / Days", placeholder: "e.g. This Thursday and Friday", type: "text", required: true },
      { name: "reason", label: "Reason", placeholder: "e.g. Home maintenance / Focus time for Q3 deliverable", type: "text", required: true },
      { name: "availability", label: "Availability Note", placeholder: "e.g. Available on Slack and phone throughout work hours", type: "text", required: false }
    ]),
    promptTemplate: "I want to request to work from home on {{wfhDates}} because {{reason}}. Mention: {{availability}} to {{recipientName}}.",
    isBuiltIn: true
  },
  {
    title: "Meeting Request",
    description: "Schedule a one-on-one, team sync, or project kick-off meeting.",
    category: "WORK",
    defaultRecipient: "Colleague",
    defaultTone: "professional",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Alex Chen", type: "text", required: true },
      { name: "topic", label: "Meeting Topic / Agenda", placeholder: "e.g. Review the product roadmap and sprint priorities", type: "text", required: true },
      { name: "duration", label: "Estimated Duration", placeholder: "e.g. 30 minutes", type: "text", required: false },
      { name: "proposedTimes", label: "Proposed Time Slots", placeholder: "e.g. Tuesday 2 PM or Wednesday 11 AM", type: "text", required: true }
    ]),
    promptTemplate: "Schedule a {{duration}} meeting with {{recipientName}} to discuss {{topic}}. Proposed times: {{proposedTimes}}.",
    isBuiltIn: true
  },
  {
    title: "Meeting Cancellation & Reschedule",
    description: "Politely cancel or reschedule an upcoming meeting due to conflict.",
    category: "WORK",
    defaultRecipient: "Colleague",
    defaultTone: "apologetic",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Michael", type: "text", required: true },
      { name: "meetingName", label: "Meeting Name", placeholder: "e.g. Budget review call", type: "text", required: true },
      { name: "originalTime", label: "Originally Scheduled Time", placeholder: "e.g. Today at 3 PM", type: "text", required: true },
      { name: "reason", label: "Reason", placeholder: "e.g. An unavoidable client escalation arose", type: "text", required: true },
      { name: "alternateTimes", label: "New Proposed Times", placeholder: "e.g. Tomorrow at 10 AM or Thursday afternoon", type: "text", required: false }
    ]),
    promptTemplate: "Apologize and reschedule {{meetingName}} originally at {{originalTime}} with {{recipientName}} because {{reason}}. Suggest new times: {{alternateTimes}}.",
    isBuiltIn: true
  },
  {
    title: "Deadline Extension Request",
    description: "Request additional time to deliver a task or project milestones.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "diplomatic",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager/Lead Name", placeholder: "e.g. Elena", type: "text", required: true },
      { name: "projectName", label: "Project / Deliverable", placeholder: "e.g. Mobile app redesign mockups", type: "text", required: true },
      { name: "currentDeadline", label: "Current Deadline", placeholder: "e.g. Friday, Sept 12", type: "text", required: true },
      { name: "newDeadline", label: "Proposed New Deadline", placeholder: "e.g. Tuesday, Sept 16", type: "text", required: true },
      { name: "progressUpdate", label: "Progress Made & Reason for Delay", placeholder: "e.g. 80% done, but waiting on user research findings to ensure high quality", type: "text", required: true }
    ]),
    promptTemplate: "Request deadline extension for {{projectName}} from {{currentDeadline}} to {{newDeadline}} with {{recipientName}}. Progress & Reason: {{progressUpdate}}.",
    isBuiltIn: true
  },
  {
    title: "Salary Negotiation / Review",
    description: "Professionally open a conversation about compensation review.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "confident",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager's Name", placeholder: "e.g. Robert", type: "text", required: true },
      { name: "tenure", label: "Time in Role / Milestone", placeholder: "e.g. 1 year anniversary / completed major data migration", type: "text", required: true },
      { name: "keyAchievements", label: "Key Contributions", placeholder: "e.g. Led 3 client launches, improved team velocity by 25%", type: "text", required: true },
      { name: "callToAction", label: "Request", placeholder: "e.g. Discuss alignment on compensation adjustment during next 1-on-1", type: "text", required: true }
    ]),
    promptTemplate: "Write a compensation review email to {{recipientName}}. Mention tenure: {{tenure}}, achievements: {{keyAchievements}}, and request: {{callToAction}}.",
    isBuiltIn: true
  },
  {
    title: "Promotion Request",
    description: "Highlight leadership and impact to request consideration for promotion.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "executive",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager's Name", placeholder: "e.g. Rachel", type: "text", required: true },
      { name: "targetRole", label: "Target Title / Role", placeholder: "e.g. Senior Software Engineer / Lead Product Manager", type: "text", required: true },
      { name: "impactSummary", label: "Key Impacts & Expanded Scope", placeholder: "e.g. Mentoring 4 engineers, taking on system architecture ownership", type: "text", required: true }
    ]),
    promptTemplate: "Email {{recipientName}} to formally discuss promotion to {{targetRole}} based on {{impactSummary}}.",
    isBuiltIn: true
  },
  {
    title: "Resignation Letter",
    description: "Submit a gracious, professional resignation letter with notice period.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "recipientName", label: "Manager's Name", placeholder: "e.g. Linda", type: "text", required: true },
      { name: "position", label: "Current Position", placeholder: "e.g. Frontend Developer", type: "text", required: true },
      { name: "lastWorkingDay", label: "Last Working Day", placeholder: "e.g. October 30, 2026", type: "text", required: true },
      { name: "transitionHelp", label: "Transition Commitment", placeholder: "e.g. Complete documentation and train the successor", type: "text", required: false }
    ]),
    promptTemplate: "Write a respectful resignation letter to {{recipientName}} for {{position}}. Last working day: {{lastWorkingDay}}. Transition note: {{transitionHelp}}.",
    isBuiltIn: true
  },
  {
    title: "Job Application & Cold Outreach",
    description: "Reach out to a recruiter or hiring manager for an open role.",
    category: "WORK",
    defaultRecipient: "HR",
    defaultTone: "persuasive",
    fields: JSON.stringify([
      { name: "recipientName", label: "Hiring Manager / Recruiter", placeholder: "e.g. Hiring Team / James Wilson", type: "text", required: true },
      { name: "jobTitle", label: "Target Role", placeholder: "e.g. Senior Frontend Engineer", type: "text", required: true },
      { name: "companyName", label: "Company Name", placeholder: "e.g. Stripe / Acme Corp", type: "text", required: true },
      { name: "experienceHighlights", label: "Key Experience Highlights", placeholder: "e.g. 5+ years React/Next.js, scaled SaaS to 100k MAU", type: "text", required: true },
      { name: "attachmentNote", label: "Attachment Mention", placeholder: "e.g. Resume and portfolio link attached", type: "text", required: false }
    ]),
    promptTemplate: "Job application email to {{recipientName}} at {{companyName}} for the {{jobTitle}} position. Highlights: {{experienceHighlights}}. Note: {{attachmentNote}}.",
    isBuiltIn: true
  },
  {
    title: "Referral Request",
    description: "Ask an ex-colleague, friend, or industry contact for a job referral.",
    category: "WORK",
    defaultRecipient: "Friend",
    defaultTone: "warm",
    fields: JSON.stringify([
      { name: "contactName", label: "Contact Name", placeholder: "e.g. Kevin", type: "text", required: true },
      { name: "targetCompany", label: "Target Company", placeholder: "e.g. Google / Microsoft", type: "text", required: true },
      { name: "targetRole", label: "Role & Job ID", placeholder: "e.g. Software Engineer II (Req #12345)", type: "text", required: true },
      { name: "fitSummary", label: "Why You Are a Great Fit", placeholder: "e.g. Strong background in distributed systems matching the requirements", type: "text", required: true }
    ]),
    promptTemplate: "Ask {{contactName}} for an internal referral at {{targetCompany}} for {{targetRole}}. Mention: {{fitSummary}} and offer to share updated resume.",
    isBuiltIn: true
  },
  {
    title: "Project Status Follow-Up",
    description: "Check in on deliverables or follow up on a pending response.",
    category: "WORK",
    defaultRecipient: "Colleague",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Samantha", type: "text", required: true },
      { name: "subjectMatter", label: "Project / Pending Item", placeholder: "e.g. API documentation feedback", type: "text", required: true },
      { name: "nextStep", label: "Next Action Needed", placeholder: "e.g. Need your sign-off before deploying to staging", type: "text", required: true }
    ]),
    promptTemplate: "Polite follow up email to {{recipientName}} regarding {{subjectMatter}}. Need: {{nextStep}}.",
    isBuiltIn: true
  },
  {
    title: "Work Apology / Mistake Correction",
    description: "Acknowledge an error gracefully and outline corrective action.",
    category: "WORK",
    defaultRecipient: "Manager",
    defaultTone: "apologetic",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Team / Mark", type: "text", required: true },
      { name: "issueDescription", label: "What Happened", placeholder: "e.g. Incorrect numbers were shared in the morning report", type: "text", required: true },
      { name: "correctionPlan", label: "Correction & Prevention", placeholder: "e.g. Corrected version attached, added an automated validation check", type: "text", required: true }
    ]),
    promptTemplate: "Apologize to {{recipientName}} for {{issueDescription}} and explain {{correctionPlan}}.",
    isBuiltIn: true
  },

  // BUSINESS (8 templates)
  {
    title: "Payment Reminder (Gentle)",
    description: "Polite initial reminder for an invoice approaching or past due.",
    category: "BUSINESS",
    defaultRecipient: "Client",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "clientName", label: "Client Name", placeholder: "e.g. Acme Corp / Susan", type: "text", required: true },
      { name: "invoiceNumber", label: "Invoice Number", placeholder: "e.g. INV-2026-089", type: "text", required: true },
      { name: "amount", label: "Invoice Amount", placeholder: "e.g. $2,450.00", type: "text", required: true },
      { name: "dueDate", label: "Due Date", placeholder: "e.g. September 5th", type: "text", required: true }
    ]),
    promptTemplate: "Send gentle payment reminder to {{clientName}} for invoice {{invoiceNumber}} amount {{amount}} which was due on {{dueDate}}.",
    isBuiltIn: true
  },
  {
    title: "Payment Follow-Up (Urgent)",
    description: "Firm follow-up for a significantly overdue invoice.",
    category: "BUSINESS",
    defaultRecipient: "Client",
    defaultTone: "assertive",
    fields: JSON.stringify([
      { name: "clientName", label: "Client / Accounts Payable", placeholder: "e.g. Finance Team", type: "text", required: true },
      { name: "invoiceNumber", label: "Invoice Number", placeholder: "e.g. INV-2026-089", type: "text", required: true },
      { name: "amount", label: "Amount Due", placeholder: "e.g. $2,450.00", type: "text", required: true },
      { name: "daysOverdue", label: "Days Overdue", placeholder: "e.g. 15 days overdue", type: "text", required: true },
      { name: "actionNeeded", label: "Immediate Action", placeholder: "e.g. Please process payment by Friday to avoid service pause", type: "text", required: true }
    ]),
    promptTemplate: "Write firm overdue payment reminder to {{clientName}} for {{invoiceNumber}} ({{amount}}, {{daysOverdue}}). State: {{actionNeeded}}.",
    isBuiltIn: true
  },
  {
    title: "Sales Outreach / Cold Pitch",
    description: "Introduce your product or service with a compelling value proposition.",
    category: "BUSINESS",
    defaultRecipient: "Customer",
    defaultTone: "persuasive",
    fields: JSON.stringify([
      { name: "prospectName", label: "Prospect Name", placeholder: "e.g. Jonathan", type: "text", required: true },
      { name: "companyName", label: "Prospect's Company", placeholder: "e.g. Nova Logistics", type: "text", required: true },
      { name: "painPoint", label: "Specific Pain Point", placeholder: "e.g. Spending hours manually drafting repetitive customer emails", type: "text", required: true },
      { name: "solutionBenefit", label: "Value / Result", placeholder: "e.g. Cut email time by 75% with zero subscription fees", type: "text", required: true },
      { name: "cta", label: "Call to Action", placeholder: "e.g. Quick 10-minute demo this Thursday", type: "text", required: true }
    ]),
    promptTemplate: "Sales outreach to {{prospectName}} at {{companyName}}. Target pain point: {{painPoint}}. Solution: {{solutionBenefit}}. CTA: {{cta}}.",
    isBuiltIn: true
  },
  {
    title: "Client Project Proposal",
    description: "Deliver a structured proposal or scope of work to a client.",
    category: "BUSINESS",
    defaultRecipient: "Client",
    defaultTone: "executive",
    fields: JSON.stringify([
      { name: "clientName", label: "Client Name", placeholder: "e.g. Marcus", type: "text", required: true },
      { name: "projectScope", label: "Project Overview", placeholder: "e.g. Complete e-commerce store migration and custom theme development", type: "text", required: true },
      { name: "timelineBudget", label: "Timeline & Cost Highlights", placeholder: "e.g. 4-week delivery, fixed scope of $4,800", type: "text", required: true }
    ]),
    promptTemplate: "Send proposal cover email to {{clientName}} summarizing {{projectScope}} with details {{timelineBudget}}.",
    isBuiltIn: true
  },
  {
    title: "Partnership / Collaboration Request",
    description: "Propose a mutually beneficial co-marketing or strategic partnership.",
    category: "BUSINESS",
    defaultRecipient: "Company",
    defaultTone: "professional",
    fields: JSON.stringify([
      { name: "recipientName", label: "Partner Name", placeholder: "e.g. Lisa Miller", type: "text", required: true },
      { name: "partnerCompany", label: "Partner Company", placeholder: "e.g. GrowthLabs", type: "text", required: true },
      { name: "synergyIdea", label: "Partnership Idea & Mutual Benefit", placeholder: "e.g. Co-host a free webinar for remote teams sharing productivity workflows", type: "text", required: true }
    ]),
    promptTemplate: "Propose a partnership to {{recipientName}} at {{partnerCompany}} around {{synergyIdea}}.",
    isBuiltIn: true
  },
  {
    title: "Customer Apology & Retention",
    description: "De-escalate a frustrated customer with empathy, solution, and care.",
    category: "BUSINESS",
    defaultRecipient: "Customer",
    defaultTone: "warm",
    fields: JSON.stringify([
      { name: "customerName", label: "Customer Name", placeholder: "e.g. David", type: "text", required: true },
      { name: "issueEncountered", label: "Problem Experienced", placeholder: "e.g. Delivery was delayed by 3 days due to warehouse backlog", type: "text", required: true },
      { name: "remedyOffered", label: "Resolution / Compensation", placeholder: "e.g. Refunded shipping charges and provided 20% discount code", type: "text", required: true }
    ]),
    promptTemplate: "Empathetic customer support apology to {{customerName}} for {{issueEncountered}}. Resolution provided: {{remedyOffered}}.",
    isBuiltIn: true
  },
  {
    title: "Refund Request (Business)",
    description: "Request a refund or billing correction for a software/vendor service.",
    category: "BUSINESS",
    defaultRecipient: "Company",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "vendorName", label: "Vendor / Support Team", placeholder: "e.g. CloudHost Support", type: "text", required: true },
      { name: "orderId", label: "Order / Subscription ID", placeholder: "e.g. Order #CH-9921", type: "text", required: true },
      { name: "reason", label: "Reason for Refund", placeholder: "e.g. Accidental double charge during renewal", type: "text", required: true }
    ]),
    promptTemplate: "Request a refund from {{vendorName}} for {{orderId}} because {{reason}}.",
    isBuiltIn: true
  },
  {
    title: "Client Follow-Up After Meeting",
    description: "Send meeting notes, action items, and next steps to clients.",
    category: "BUSINESS",
    defaultRecipient: "Client",
    defaultTone: "concise",
    fields: JSON.stringify([
      { name: "clientName", label: "Client Name", placeholder: "e.g. Sarah", type: "text", required: true },
      { name: "meetingTopic", label: "Meeting Topic", placeholder: "e.g. Q4 Marketing Strategy Kickoff", type: "text", required: true },
      { name: "actionItems", label: "Agreed Next Steps", placeholder: "e.g. 1. MailPilot team delivers draft copy by Tuesday; 2. Client reviews brand assets by Thursday", type: "text", required: true }
    ]),
    promptTemplate: "Send meeting follow-up email to {{clientName}} recapping {{meetingTopic}} with action items: {{actionItems}}.",
    isBuiltIn: true
  },

  // EDUCATION (5 templates)
  {
    title: "Professor / Teacher Request",
    description: "Ask a professor for office hours or clarify lecture material.",
    category: "EDUCATION",
    defaultRecipient: "Teacher / Professor",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "professorName", label: "Professor Name", placeholder: "e.g. Professor Davis", type: "text", required: true },
      { name: "courseName", label: "Course & Section", placeholder: "e.g. CS 301 - Data Structures (Section B)", type: "text", required: true },
      { name: "questionTopic", label: "Question / Inquiry", placeholder: "e.g. Clarification on Graph Dijkstra assignment complexity", type: "text", required: true },
      { name: "availability", label: "Your Availability", placeholder: "e.g. Available during Tuesday office hours or after 3 PM", type: "text", required: false }
    ]),
    promptTemplate: "Respectful email to {{professorName}} regarding {{courseName}}. Question: {{questionTopic}}. Availability: {{availability}}.",
    isBuiltIn: true
  },
  {
    title: "Assignment Extension Request",
    description: "Request an extension on coursework due to unforeseen circumstances.",
    category: "EDUCATION",
    defaultRecipient: "Teacher / Professor",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "professorName", label: "Professor Name", placeholder: "e.g. Dr. Martinez", type: "text", required: true },
      { name: "courseName", label: "Course Name", placeholder: "e.g. History 202", type: "text", required: true },
      { name: "assignmentName", label: "Assignment Name", placeholder: "e.g. Midterm Research Essay", type: "text", required: true },
      { name: "reason", label: "Reason for Extension", placeholder: "e.g. Recent illness (doctor note available)", type: "text", required: true },
      { name: "proposedDate", label: "Requested Extension Date", placeholder: "e.g. 2 extra days until Sunday night", type: "text", required: true }
    ]),
    promptTemplate: "Ask {{professorName}} for extension on {{assignmentName}} for {{courseName}}. Reason: {{reason}}. Proposed date: {{proposedDate}}.",
    isBuiltIn: true
  },
  {
    title: "Letter of Recommendation Request",
    description: "Ask a professor or mentor for an academic or job recommendation.",
    category: "EDUCATION",
    defaultRecipient: "Teacher / Professor",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "professorName", label: "Professor Name", placeholder: "e.g. Professor Lee", type: "text", required: true },
      { name: "pastAssociation", label: "Past Course / Research Together", placeholder: "e.g. Took your AI Ethics seminar in Spring 2025 (Grade: A)", type: "text", required: true },
      { name: "targetOpportunity", label: "Target Program / Role", placeholder: "e.g. Graduate Master's in Computer Science at Stanford", type: "text", required: true },
      { name: "deadline", label: "Submission Deadline", placeholder: "e.g. November 15, 2026", type: "text", required: true }
    ]),
    promptTemplate: "Polite recommendation request to {{professorName}}. Shared history: {{pastAssociation}}. Applying for: {{targetOpportunity}}. Deadline: {{deadline}}.",
    isBuiltIn: true
  },
  {
    title: "Student Attendance / Absence Notice",
    description: "Inform faculty about an upcoming absence due to medical or personal events.",
    category: "EDUCATION",
    defaultRecipient: "Teacher / Professor",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "professorName", label: "Professor / Instructor", placeholder: "e.g. Dr. Evans", type: "text", required: true },
      { name: "courseName", label: "Course Name", placeholder: "e.g. Organic Chemistry 101", type: "text", required: true },
      { name: "absenceDate", label: "Date of Absence", placeholder: "e.g. Tomorrow, Wednesday Sept 10", type: "text", required: true },
      { name: "catchUpPlan", label: "Catch-up Plan", placeholder: "e.g. Will get lecture notes from a classmate and review assigned readings", type: "text", required: false }
    ]),
    promptTemplate: "Inform {{professorName}} of absence from {{courseName}} on {{absenceDate}}. Plan: {{catchUpPlan}}.",
    isBuiltIn: true
  },
  {
    title: "Student Internship Inquiry",
    description: "Inquire about summer research or industry student internships.",
    category: "EDUCATION",
    defaultRecipient: "HR",
    defaultTone: "persuasive",
    fields: JSON.stringify([
      { name: "recipientName", label: "Contact / Lab Director", placeholder: "e.g. Dr. Gupta", type: "text", required: true },
      { name: "fieldOfInterest", label: "Field / Lab Name", placeholder: "e.g. Human-Computer Interaction Lab", type: "text", required: true },
      { name: "studentBackground", label: "Your Background & Year", placeholder: "e.g. Junior CS major with React and Python experience", type: "text", required: true }
    ]),
    promptTemplate: "Inquire with {{recipientName}} about internship/research position in {{fieldOfInterest}}. Background: {{studentBackground}}.",
    isBuiltIn: true
  },

  // PERSONAL (5 templates)
  {
    title: "Thank You Note",
    description: "Send a heartfelt thank-you for a gift, support, or thoughtful gesture.",
    category: "PERSONAL",
    defaultRecipient: "Friend",
    defaultTone: "warm",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Emily", type: "text", required: true },
      { name: "occasion", label: "What you are thanking them for", placeholder: "e.g. Hosting the wonderful dinner party / Helpful advice", type: "text", required: true },
      { name: "specificDetail", label: "Specific Thoughtful Detail", placeholder: "e.g. The homemade dessert and great conversation made my week", type: "text", required: false }
    ]),
    promptTemplate: "Warm thank you message to {{recipientName}} for {{occasion}}. Detail: {{specificDetail}}.",
    isBuiltIn: true
  },
  {
    title: "Invitation to Event / Dinner",
    description: "Invite friends, family, or colleagues to a gathering or celebration.",
    category: "PERSONAL",
    defaultRecipient: "Friend",
    defaultTone: "friendly",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Lucas & Maya", type: "text", required: true },
      { name: "eventDescription", label: "Event / Occasion", placeholder: "e.g. Housewarming barbecue celebration", type: "text", required: true },
      { name: "dateTimeLocation", label: "Date, Time & Location", placeholder: "e.g. This Saturday at 5 PM at our new place (123 Oak St)", type: "text", required: true },
      { name: "rsvpDate", label: "RSVP Request", placeholder: "e.g. Please let us know by Thursday", type: "text", required: false }
    ]),
    promptTemplate: "Friendly invitation to {{recipientName}} for {{eventDescription}} on {{dateTimeLocation}}. RSVP: {{rsvpDate}}.",
    isBuiltIn: true
  },
  {
    title: "Congratulations Message",
    description: "Celebrate someone's milestone (new job, wedding, graduation, new baby).",
    category: "PERSONAL",
    defaultRecipient: "Friend",
    defaultTone: "warm",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Ryan", type: "text", required: true },
      { name: "milestone", label: "The Milestone / Achievement", placeholder: "e.g. Landing the Senior Engineer role at your dream company", type: "text", required: true },
      { name: "personalNote", label: "Personal Note / Well Wishes", placeholder: "e.g. Couldn't happen to a more deserving person after all your hard work", type: "text", required: false }
    ]),
    promptTemplate: "Heartfelt congratulations to {{recipientName}} on {{milestone}}. Note: {{personalNote}}.",
    isBuiltIn: true
  },
  {
    title: "Personal Apology",
    description: "Express sincere regrets to a friend or acquaintance for a misunderstanding.",
    category: "PERSONAL",
    defaultRecipient: "Friend",
    defaultTone: "apologetic",
    fields: JSON.stringify([
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. Chloe", type: "text", required: true },
      { name: "incident", label: "What you are apologizing for", placeholder: "e.g. Missing your birthday dinner last weekend", type: "text", required: true },
      { name: "makeUpPlan", label: "Make Up Offer", placeholder: "e.g. I'd love to treat you to lunch this week if you're free", type: "text", required: false }
    ]),
    promptTemplate: "Sincere personal apology to {{recipientName}} for {{incident}}. Offer: {{makeUpPlan}}.",
    isBuiltIn: true
  },
  {
    title: "Personal Favor / Assistance Request",
    description: "Ask a friend or neighbour for a small favor with warmth and respect.",
    category: "PERSONAL",
    defaultRecipient: "Friend",
    defaultTone: "polite",
    fields: JSON.stringify([
      { name: "recipientName", label: "Friend's Name", placeholder: "e.g. Alex", type: "text", required: true },
      { name: "favorDetails", label: "The Favor Needed", placeholder: "e.g. Water my plants this weekend while I'm away", type: "text", required: true },
      { name: "noPressureNote", label: "No-Pressure Reassurance", placeholder: "e.g. Completely understand if you're busy", type: "text", required: false }
    ]),
    promptTemplate: "Ask {{recipientName}} for a favor: {{favorDetails}}. Reassure: {{noPressureNote}}.",
    isBuiltIn: true
  },

  // OFFICIAL (5 templates)
  {
    title: "Formal Consumer Complaint",
    description: "Escalate an unresolved issue to corporate customer service or regulatory desks.",
    category: "OFFICIAL",
    defaultRecipient: "Company",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "companyName", label: "Company / Agency Name", placeholder: "e.g. Apex Broadband Customer Care", type: "text", required: true },
      { name: "accountReference", label: "Account / Reference #", placeholder: "e.g. Acc #9048201", type: "text", required: true },
      { name: "issueSummary", label: "Detailed Description of Defect/Service Issue", placeholder: "e.g. 5 days without internet service despite 3 calls to support", type: "text", required: true },
      { name: "desiredResolution", label: "Expected Resolution", placeholder: "e.g. Immediate technician visit and credit for downtime", type: "text", required: true }
    ]),
    promptTemplate: "Formal complaint to {{companyName}} for account {{accountReference}}. Issue: {{issueSummary}}. Demand: {{desiredResolution}}.",
    isBuiltIn: true
  },
  {
    title: "Bank / Financial Institution Request",
    description: "Request statements, dispute an unrecognised charge, or update KYC details.",
    category: "OFFICIAL",
    defaultRecipient: "Bank / Financial Institution",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "bankName", label: "Bank Name", placeholder: "e.g. Chase Bank Support", type: "text", required: true },
      { name: "accountLast4", label: "Account (Last 4 digits)", placeholder: "e.g. **** 4819", type: "text", required: true },
      { name: "requestType", label: "Specific Request", placeholder: "e.g. Dispute charge of $120 from merchant XYZ on Sept 2nd", type: "text", required: true }
    ]),
    promptTemplate: "Formal inquiry to {{bankName}} for account {{accountLast4}}. Request: {{requestType}}.",
    isBuiltIn: true
  },
  {
    title: "Official Document / Certificate Request",
    description: "Request transcripts, records, or official certificates from authorities.",
    category: "OFFICIAL",
    defaultRecipient: "Government / Official",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "authorityName", label: "Department / Registrar", placeholder: "e.g. Office of the Registrar", type: "text", required: true },
      { name: "documentName", label: "Document Requested", placeholder: "e.g. Official Sealed Academic Transcript", type: "text", required: true },
      { name: "identificationDetails", label: "Student / File ID", placeholder: "e.g. Student ID: 2021-9982", type: "text", required: true },
      { name: "purpose", label: "Purpose / Delivery Address", placeholder: "e.g. Graduate school application submission", type: "text", required: false }
    ]),
    promptTemplate: "Formal document request to {{authorityName}} for {{documentName}} (ID: {{identificationDetails}}). Purpose: {{purpose}}.",
    isBuiltIn: true
  },
  {
    title: "Insurance Claim Follow-Up",
    description: "Inquire on status of pending insurance claim.",
    category: "OFFICIAL",
    defaultRecipient: "Insurance Provider",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "insuranceProvider", label: "Insurance Company", placeholder: "e.g. Geico Claims Dept", type: "text", required: true },
      { name: "claimNumber", label: "Claim Number", placeholder: "e.g. CLM-8839210", type: "text", required: true },
      { name: "inquiryDetails", label: "Inquiry Details", placeholder: "e.g. Follow up on status of vehicle repair appraisal submitted 2 weeks ago", type: "text", required: true }
    ]),
    promptTemplate: "Claim follow-up to {{insuranceProvider}} for claim {{claimNumber}}. Details: {{inquiryDetails}}.",
    isBuiltIn: true
  },
  {
    title: "Government / Council Inquiry",
    description: "Submit a formal inquiry or feedback to local municipal council or officials.",
    category: "OFFICIAL",
    defaultRecipient: "Government / Official",
    defaultTone: "formal",
    fields: JSON.stringify([
      { name: "agencyName", label: "Government Department / Council", placeholder: "e.g. City Department of Transportation", type: "text", required: true },
      { name: "subjectArea", label: "Subject / Location", placeholder: "e.g. Request for pedestrian crossing near Oak Ridge Elementary School", type: "text", required: true },
      { name: "context", label: "Community Context & Importance", placeholder: "e.g. Increased traffic during school drop-off hours posing safety concerns", type: "text", required: true }
    ]),
    promptTemplate: "Formal civic inquiry to {{agencyName}} on {{subjectArea}}. Context: {{context}}.",
    isBuiltIn: true
  }
];

const customTones = [
  {
    name: "Executive Brief",
    description: "Concise, high-level, action-oriented communication suitable for C-suite and VPs.",
    instructions: "Keep the email under 100 words. Start with the bottom-line up front (BLUF). Use bullet points for key decisions or action items. Eliminate filler phrases."
  },
  {
    name: "Customer Empathy",
    description: "Warm, supportive, human-first tone designed for client success and customer care.",
    instructions: "Acknowledge feelings warmly. Use reassuring, friendly language. Make solutions crystal clear with zero robotic jargon."
  },
  {
    name: "Academic Professional",
    description: "Respectful, structured, articulate tone appropriate for academic institutions.",
    instructions: "Maintain high degree of politeness, clarity of request, and respectful references."
  }
];

async function main() {
  console.log("🌱 Starting MailPilot Database Seeding...");

  // 1. Create Built-in Templates
  console.log(`Seeding ${templates.length} built-in templates...`);
  for (const t of templates) {
    const existing = await prisma.template.findFirst({
      where: { title: t.title, isBuiltIn: true }
    });
    if (!existing) {
      await prisma.template.create({ data: t });
    }
  }

  // 2. Create Demo User
  const demoEmail = "demo@mailpilot.app";
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash("demo12345", 10);
    demoUser = await prisma.user.create({
      data: {
        name: "Alex Morgan",
        email: demoEmail,
        password: hashedPassword,
        defaultTone: "professional",
        defaultLength: "medium",
        defaultLanguage: "en",
        customInstructions: "Prefer clear bullet points for deliverables and friendly sign-offs.",
      }
    });
    console.log("✅ Demo user created: demo@mailpilot.app (Password: demo12345)");
  }

  // 3. Create Custom Tones for Demo User
  for (const ct of customTones) {
    const existingTone = await prisma.customTone.findFirst({
      where: { userId: demoUser.id, name: ct.name }
    });
    if (!existingTone) {
      await prisma.customTone.create({
        data: {
          userId: demoUser.id,
          name: ct.name,
          description: ct.description,
          instructions: ct.instructions,
          isDefault: false
        }
      });
    }
  }

  // 4. Create Demo Organization
  const demoOrgSlug = "acme-corp";
  let demoOrg = await prisma.organization.findUnique({ where: { slug: demoOrgSlug } });
  if (!demoOrg) {
    demoOrg = await prisma.organization.create({
      data: {
        name: "Acme Innovations",
        slug: demoOrgSlug,
        description: "Leading technology team building modern software.",
        members: {
          create: {
            userId: demoUser.id,
            role: "OWNER"
          }
        },
        settings: {
          create: {
            allowMemberTemplates: true,
            enforceBrandVoice: false
          }
        },
        companyTone: {
          create: {
            description: "Clear, helpful, and transparent. Avoid corporate buzzwords and always put the customer first.",
            rules: "Keep responses concise, explain technical concepts simply, sign off as 'The Acme Team'."
          }
        },
        brandVoice: {
          create: {
            personality: "Friendly, Innovative, Trustworthy, Responsive",
            wordsToUse: "Partner, Solution, Transparency, Team, Delight",
            wordsToAvoid: "Synergy, Unfortunately, Per our policy, Regret to inform"
          }
        },
        sharedTemplates: {
          create: [
            {
              createdById: demoUser.id,
              title: "Customer Refund - Full Approval",
              description: "Standard response confirming processed refund with apology and timeline.",
              category: "BUSINESS",
              defaultRecipient: "Customer",
              defaultTone: "warm",
              fields: JSON.stringify([
                { name: "customerName", label: "Customer Name", placeholder: "e.g. Jordan", type: "text", required: true },
                { name: "orderId", label: "Order Number", placeholder: "e.g. #ACME-9021", type: "text", required: true },
                { name: "refundAmount", label: "Amount", placeholder: "e.g. $79.00", type: "text", required: true }
              ]),
              promptTemplate: "Confirm full refund of {{refundAmount}} for order {{orderId}} to {{customerName}}. Reassure bank processing timeline of 3-5 business days."
            }
          ]
        }
      }
    });
    console.log("✅ Demo organization created: Acme Innovations (Slug: acme-corp)");
  }

  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
