# MailPilot — Free AI Email Assistant

> **"Tell MailPilot what you want to say. MailPilot writes the email."**

MailPilot is a production-quality, modern SaaS web application designed for everyone — students, employees, managers, freelancers, business owners, clients, teachers, job seekers, teams, and everyday users.

---

## 💎 100% Free Guarantee

MailPilot has **no paid plans, no Pro/Business subscriptions, no Stripe billing, and no feature paywalls**.

* **Plan**: Free (Forever)
* **AI Usage Limit**: **10 successful AI generations per user per day**
* **Failures**: Failed requests never consume a generation
* **Enforcement**: Strictly validated and recorded server-side
* **Organizations**: Shared templates, company tone, brand voice, and team analytics are completely free for all teams.

---

## 🛠 Tech Stack

### Frontend
* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript
* **UI & Styling**: Tailwind CSS, CSS Variables Design System, Lucide React icons
* **Theming**: Seamless Dark Mode & Light Mode support via `next-themes`
* **UX**: Micro-animations, responsive layout with mobile drawer, toast notifications

### Backend & Service Layer
* **API**: Next.js App Router API routes
* **Architecture**: Clean domain service-layer (`EmailGenerationService`, `ReplyService`, `ImprovementService`, `AnalysisService`, `HumanizationService`, `TranslationService`, `TemplateService`, `ToneService`, `HistoryService`, `OrganizationService`, `UsageService`)
* **Validation**: Zod schema validation on all inputs and AI outputs

### Database
* **ORM**: Prisma ORM
* **Database**: SQLite default for zero-configuration instant local development (supports PostgreSQL with `DATABASE_URL` switch)
* **Models**: User, Account, Session, EmailGeneration, SavedEmail, Template, CustomTone, Usage, UsageEvent, Organization, OrganizationMember, OrganizationSettings, SharedTemplate, BrandVoice, CompanyTone

### Authentication
* NextAuth.js (Auth.js) with JWT session strategy
* Email & Password authentication with bcrypt hashing
* Google OAuth integration ready
* Instant 1-Click Demo Login (`demo@mailpilot.app` / `demo12345`)

### AI Provider Layer
* Pluggable `AIProvider` abstraction
* **Google Gemini API** (`gemini-1.5-flash` / `gemini-1.5-pro`)
* **OpenAI API** fallback (`gpt-4o-mini`)
* **Intelligent Local Heuristic Engine**: Works out-of-the-box with zero API keys required, producing realistic, high-quality, contextual outputs.

---

## 🚀 Key Features

| Feature | Route | Description |
| :--- | :--- | :--- |
| **Email Generator** | `/dashboard`, `/generate` | Transforms unformatted thoughts (e.g. `sir i need leave tomorrow`) into polished emails with Subject, Recipient, Tone, and Length controls. |
| **Reply Generator** | `/reply` | Paste an incoming email + intent (e.g. `Yes, Monday works`) to draft contextual responses with quick intent chips (Accept, Decline, Reschedule). |
| **Improve Email** | `/improve` | Side-by-side comparison of original vs polished draft with diff highlights, readability score, and tone presets. |
| **Email Analysis** | `/analyze` | Extracts Tone, Sentiment, Urgency level, Intent, Action Items, Deadlines, Amounts, and 1-Click **"Generate Reply"** linking. |
| **Humanize** | `/humanize` | Strips stiff robotic clichés (`I hope this email finds you well`, `synergize`) into conversational, authentic language. |
| **Translation** | `/translate` | Translates across 11 languages (English, Hindi, Gujarati, Spanish, French, German, Portuguese, Arabic, Chinese, Japanese, Korean) with tone preservation. |
| **Template Library** | `/templates` | 35+ pre-seeded templates across Work, Business, Education, Personal, and Official categories with interactive dynamic modal flow. |
| **Saved History** | `/history` | Search, filter, inspect, copy, download (.eml, .txt, .md), and delete past email generations. |
| **Custom Tones** | `/tones` | Create custom writing personas with detailed instructions and set as default. |
| **Organizations** | `/organization` | Free team collaboration with Owner / Admin / Member server-side RBAC, shared templates, company tone, brand voice, and privacy-respecting analytics. |
| **Settings** | `/settings` | Profile info, default writing preferences, global AI custom instructions, and password management. |

---

## 📦 Quick Start & Installation

### 1. Prerequisites
* Node.js v18+ or v20+ / v24+
* npm or pnpm

### 2. Clone and Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mailpilot_super_secret_jwt_key_2026_dev_environment"

# Optional: Add Google Cloud credentials for Google Sign-In
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional: Add Gemini or OpenAI API Key. If empty, MailPilot uses its built-in heuristic engine!
GEMINI_API_KEY=""
OPENAI_API_KEY=""
AI_MODEL="gemini-1.5-flash"
```

### 4. Setup Database & Seed 35+ Templates
```bash
# Push Prisma schema to SQLite
npm run db:push

# Seed templates and demo user (demo@mailpilot.app / demo12345)
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated unit and integration tests:
```bash
npm test
```

Test coverage includes:
* Server-side daily 10-generation limit enforcement and reset calculation
* Zero-quota deduction on failed AI generations
* Owner, Admin, and Member RBAC authorization checks
* Template variable substitution and bracketed placeholder preservation (Rule 26)

---

## 🏗 Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy Rules

* **Server-Side Quota Enforcement**: Daily AI generation limits cannot be bypassed via client manipulation.
* **Strict RBAC**: Organization data, members, and shared templates are isolated and verified per session.
* **Zero Private Data Exposure**: Organization analytics only display aggregate counts and feature distributions — members' email bodies and private prompts are never exposed to admins or third parties.
* **No Client Secrets**: API keys and auth secrets are strictly confined to server-side execution.

---

## 📄 License
MIT License. 100% Free for personal and commercial use.
