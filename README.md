# AI-TUTOR

AI-TUTOR is an AI-powered interactive learning assistant that allows users to study PDFs, ask questions, and receive AI-guided highlights and annotations.

🚀 **Try Live**: [https://ai-tutor-qsfjket94-ivans-projects-d5999c55.vercel.app/](https://ai-tutor-qsfjket94-ivans-projects-d5999c55.vercel.app//)

🔑 **Demo Account**
- **Email:** contact@1kurochkin.com
- **Password:** contact1

---

## Features

- Ask questions and get instant AI answers.
- PDF upload & text extraction.
- Navigate directly to relevant pages.
- Highlight, circle, and underline important content.
- Real-time interactive chat.

---

## Prerequisites

- Node.js >= 18
- npm
- PostgreSQL
- OpenAI API key
- Blob storage access token for PDF read/write

---

## Setup

1. Clone the repository:
```bash
git clone https://github.com/1kurochkin/ai-tutor.git
cd ai-tutor
```

2. Install dependencies:
```bash
npm install
```
3. Copy .env.example to .env:
```bash
cp .env.example .env
```

4.	Initialize the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```
Visit http://localhost:3000 to start.
