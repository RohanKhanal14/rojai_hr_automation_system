# 🤖 ROJ.AI — Yukti.exe

> **AI-Powered Recruitment Automation Platform** — Built for the StartupNepal AI Hackathon 2026

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5-green?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20LLM-orange?style=flat-square)](https://groq.com/)
[![Vapi.ai](https://img.shields.io/badge/Voice-Vapi.ai-blue?style=flat-square)](https://vapi.ai/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-purple?style=flat-square)](https://cloudinary.com/)

---

## 📽️ Demo & Slides

> 📁 All demo materials are located in the [`documents/`](./documents) folder:
> - **`yukti.mp4`** — Full video demonstration of the platform
> - **`Yukti.exe_rojai.pdf`** — Presentation slides

---

## 📖 Overview

**ROJ.AI (Yukti.exe)** is a full-stack recruitment automation platform that streamlines the entire hiring pipeline — from job creation to AI-powered voice interviews and final HR decision-making — with minimal manual effort.

The platform supports two user roles:

| Role | Capabilities |
|------|-------------|
| 🧑‍💼 **HR Professional** | Create job postings, configure interview pipelines, run shortlisting, review ranked candidates, make hiring decisions |
| 👤 **Candidate** | Browse open positions, submit applications with CV uploads, receive ATS scores, complete AI voice interviews |

---

## ✨ Key Features

- **🗂️ Job Management** — HR creates structured job postings with rich descriptions, required skills, deadlines, and interview configuration
- **📄 CV Upload & ATS Scoring** — Candidates upload CVs (PDF/DOCX) stored via Cloudinary; the system parses and scores them using keyword + semantic matching against job requirements
- **🏆 Automated Shortlisting** — After the deadline (or manual trigger), the platform ranks applicants by ATS score and selects the top N candidates as configured by HR
- **🎙️ AI Voice Interviews** — Shortlisted candidates complete a voice interview session powered by [Vapi.ai](https://vapi.ai); the agent asks HR-defined questions, records audio, and auto-transcribes responses
- **🧠 LLM-Powered Summaries** — Interview transcripts are processed by [Groq](https://groq.com/) to generate AI summaries and interview scores
- **📊 HR Review Dashboard** — HR views ranked shortlists with ATS scores, CV previews, interview recordings, full transcripts, and AI-generated insights
- **🔐 Secure Auth** — JWT-based authentication with email verification, OTP-based password reset, and role-based access control
- **📧 Email Notifications** — Automated SMTP email notifications via Nodemailer for status updates and interview invitations
- **⚡ Redis Caching** — Upstash Redis for performance-critical caching
- **📑 API Docs** — Swagger UI available at `/api/v1/docs`

---

## 🏗️ Architecture

```
Yukti.exe/
├── frontend/          # Next.js 16 + TypeScript + TailwindCSS
│   ├── app/
│   │   ├── candidate/ # Candidate-facing pages (jobs, applications, interviews)
│   │   ├── hr/        # HR dashboard (jobs, applications, decisions)
│   │   ├── login/     # Auth pages
│   │   └── signup/
│   ├── components/    # Shared UI components (shadcn/ui + Radix UI)
│   ├── lib/           # Server actions & API utilities
│   └── hooks/         # Custom React hooks
│
├── backend/           # Express 5 + Node.js (ESM)
│   ├── candidate/     # Candidate profile management
│   ├── hr/            # HR professional management
│   ├── job/           # Job posting CRUD
│   ├── application/   # Application handling & ATS scoring
│   ├── aiInterviewSession/ # Vapi.ai interview orchestration
│   ├── ranking/       # Candidate ranking engine
│   ├── user_login/    # Auth & JWT management
│   ├── guard/         # Auth middleware / route guards
│   ├── config/        # Swagger, DB config
│   └── router/        # Centralized API routing
│
└── documents/         # 📁 Demo video & slides
    ├── yukti.mp4
    └── Yukti.exe_rojai.pdf
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [TailwindCSS 4](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | UI component library |
| [Vapi.ai Web SDK](https://vapi.ai/) | In-browser AI voice interviews |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation |
| [Recharts](https://recharts.org/) | Data visualization |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Axios](https://axios-http.com/) | API communication |

### Backend
| Technology | Purpose |
|-----------|---------|
| [Express 5](https://expressjs.com/) | REST API server |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Database & ODM |
| [Groq SDK](https://groq.com/) | LLM-powered interview analysis & summaries |
| [Vapi.ai](https://vapi.ai/) | AI voice interview orchestration |
| [Cloudinary](https://cloudinary.com/) | CV/file storage |
| [Nodemailer](https://nodemailer.com/) | Email notifications |
| [Upstash Redis](https://upstash.com/) | Caching |
| [JWT](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Auth & password hashing |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | CV text extraction |
| [Swagger UI](https://swagger.io/tools/swagger-ui/) | API documentation |
| [Joi](https://joi.dev/) | Request validation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Redis** (local or Upstash)
- Accounts for: [Cloudinary](https://cloudinary.com/), [Groq](https://groq.com/), [Vapi.ai](https://vapi.ai/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Yukti.exe.git
cd Yukti.exe
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy and configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
MONGO_URI=mongodb://localhost:27017/yukti

# Server
PORT=3001
ENVIRONMENT=development

# JWT Secrets
JWT_SIGNUP_SECRET=your_secret
JWT_ACCESS_TOKEN_SECRET=your_secret
JWT_REFRESH_TOKEN_SECRET=your_secret
JWT_RESET_PASSWORD_SECRET=your_secret
JWT_NEW_PASSWORD_SECRET=your_secret

# Encryption
ENCRYPTION_KEY=<32 hex chars>
ENCRYPTION_IV=<32 hex chars>
ENCRYPTION_ALGORITHM=aes-256-cbc

# Vapi.ai
VAPI_WEBHOOK_BASE_URL=https://your-webhook-url.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yukti.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Start the backend:

```bash
npm run dev      # Development (nodemon with hot reload)
# or
npm run home     # Production
```

Backend runs at: **http://localhost:3001**  
API Docs (Swagger): **http://localhost:3001/api/v1/docs**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Copy and configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
API_URL=http://localhost:3001
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
NODE_ENV=development
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/...` | Auth — signup, login, OTP, password reset |
| `GET/POST/PUT` | `/api/v1/hrProfessionals/...` | HR professional management |
| `GET/POST/PUT` | `/api/v1/candidates/...` | Candidate profile management |
| `GET/POST/PATCH` | `/api/v1/jobs/...` | Job posting CRUD |
| `GET/POST/PATCH` | `/api/v1/applications/...` | Applications & ATS scoring |
| `GET/POST` | `/api/v1/interviews/...` | AI interview session management |
| `GET` | `/api/v1/docs` | Swagger API documentation |

---

## 🔄 User Flows

### HR Professional
```
Login → Dashboard → Create Job → Configure Interview → Publish
     → View Applicants → Run Shortlisting → Review Interviews
     → Advance / Reject / Hold Candidates
```

### Candidate
```
Signup → Browse Jobs → Apply (Upload CV) → Receive ATS Score
      → Shortlisted? → Complete AI Voice Interview
      → Track Application Status
```

---

## 📁 Documents

The `documents/` folder contains all supplementary materials for the hackathon submission:

| File | Description |
|------|-------------|
| [`yukti.mp4`](./documents/yukti.mp4) | 🎬 Full video demo of the platform |
| [`Yukti.exe_rojai.pdf`](./documents/Yukti.exe_rojai.pdf) | 📊 Pitch deck / presentation slides |

---

## 📜 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

---

<div align="center">
  <strong>Built with ❤️ for StartupNepal AI Hackathon 2026</strong>
</div>
