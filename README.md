# AI-TUTOR

AI-TUTOR is an AI-powered interactive learning assistant that allows users to study PDFs, ask questions, and receive AI-guided highlights and annotations. Transform your study materials into interactive learning experiences with intelligent document analysis and real-time Q&A.

🚀 **Live Demo**: [https://ai-tutor-indol.vercel.app/](https://ai-tutor-indol.vercel.app/)

🔑 **Demo Account**
- **Email:** contact@1kurochkin.com
- **Password:** contact1

---

## ✨ Features

### 📚 PDF & Document Analysis
- Upload PDF files up to 10MB
- Automatic text extraction and content parsing
- Navigate directly to relevant pages based on AI responses
- Support for complex document layouts with images and diagrams

### 🎯 Smart Annotations
- **Intelligent Highlighting**: AI automatically highlights important passages based on your questions
- **Visual Annotations**: Circle diagrams, charts, and images relevant to your queries
- **Interactive Navigation**: Click to jump to specific pages and sections
- **Real-time Visualization**: See annotations appear dynamically as you ask questions

### 🤖 AI-Powered Learning
- **Contextual Q&A**: Ask questions about your documents and get instant, accurate answers
- **Multi-modal Understanding**: AI analyzes both text and images in your PDFs
- **Conversation History**: Maintain context across multiple questions in chat sessions
- **Voice Input**: Use voice commands to ask questions (browser-dependent)

### 💬 Interactive Chat Experience
- Real-time chat interface with AI tutor
- Persistent conversation history
- Multiple chat sessions per document
- Smart navigation suggestions

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: ai-sdk/openai GPT-4o
- **PDF Processing**: PDF.js, pdf-parse, pdf-lib
- **File Storage**: Vercel Blob
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Image Extraction**: Custom PDF extractor service

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **PostgreSQL** database
- **OpenAI API key**
- **Vercel Blob storage token** (for file uploads)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/1kurochkin/ai-tutor.git
cd ai-tutor
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update your `.env` file with the following values:

```env
# Node environment
NODE_ENV="development"

# Database connection (Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/ai_tutor?schema=public"

# Authentication
JWT_SECRET="your_super_secret_jwt_key_here"

# OpenAI API Key
OPENAI_API_KEY="sk-your_openai_api_key_here"

# File storage token (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_read_write_token_here"

# PDF-extractor endpoint 
PDF_EXTRACTOR_URL="pdf-extractor-endpoint"
```

### 4. Database Setup

Initialize your PostgreSQL database with Prisma:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: View your database in Prisma Studio
npx prisma studio
```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running!

---

## 🐳 PDF Extractor Service

The AI-TUTOR uses a separate microservice for extracting images from PDFs. This service runs independently and can be deployed separately.

### Local Development

#### 1. Navigate to PDF Extractor Directory

```bash
cd pdf-extractor
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Install System Dependencies

The PDF extractor requires Poppler utilities for PDF processing:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y poppler-utils
```

**macOS:**
```bash
brew install poppler
```

**Windows:**
Download and install Poppler from: https://blog.alivate.com.au/poppler-windows/

#### 4. Start the PDF Extractor Service

```bash
npm start
```

The service will run on `http://localhost:3001` (separate from the main app).

#### 5. Update Main App Configuration

Once service started, update your main application's PDF extractor URL in:

`.env` config:
```env
PDF_EXTRACTOR_URL="http://localhost:3001"
```

---

## 🚂 Deploying PDF Extractor to Railway

Railway.app provides excellent support for Docker-based deployments.

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**: Ensure your `pdf-extractor` directory is in your GitHub repository
2. **Connect Railway**: Go to [Railway.app](https://railway.app) and sign in
3. **New Project**: Click "New Project" → "Deploy from GitHub repo"
4. **Select Repository**: Choose your repository
5. **Configure Service**:
   - **Root Directory**: `pdf-extractor`
   - **Build Command**: `docker build -t pdf-extractor .`
   - **Start Command**: `npm start`
6. **Environment Variables**: Set if needed (none required for basic setup)
7. **Deploy**: Railway will automatically deploy your service

### Method 2: Railway CLI

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Navigate to PDF Extractor**:
```bash
cd pdf-extractor
```

4. **Initialize Railway Project**:
```bash
railway init
```

5. **Deploy**:
```bash
railway up
```

### Update Main App Configuration

Once deployed, update your main application's PDF extractor URL in:

`.env` config:
```env
PDF_EXTRACTOR_URL="https://your-pdf-extractor.railway.app/extract"
```

---

## 🗂️ Project Structure

```
ai-tutor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── chat/              # Chat interface
│   │   └── home/              # Landing page
│   ├── components/            # Reusable React components
│   │   ├── chat/              # Chat-related components
│   │   ├── pdf/               # PDF viewer and upload
│   │   └── ui/                # UI components
│   ├── handlers/              # Client-side API handlers
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities and configurations
│       ├── pdf/               # PDF processing utilities
│       ├── auth.ts            # Authentication helpers
│       ├── ai.ts              # AI response parsing
│       └── prisma.ts          # Database client
├── pdf-extractor/             # Microservice for image extraction
│   ├── server.js              # Express server
│   ├── Dockerfile             # Docker configuration
│   └── package.json           # Dependencies
├── prisma/                    # Database schema and migrations
└── public/                    # Static assets
```

---

## 🔧 Configuration

### OpenAI API Key
Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Vercel Blob Storage
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or use existing one
3. Go to Storage → Create → Blob
4. Copy the `BLOB_READ_WRITE_TOKEN`

### PostgreSQL Database
You can use any PostgreSQL provider:
- **Local**: Install PostgreSQL locally
- **Railway**: Use Railway's PostgreSQL addon
- **Supabase**: Free tier available
- **PlanetScale**: MySQL alternative
- **Vercel Postgres**: Integrated with Vercel

---

## 🚀 Deployment

### Deploy Main App to Vercel

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect Vercel**: Go to [Vercel](https://vercel.com) and import your GitHub repo
3. **Environment Variables**: Add all your `.env` variables in Vercel dashboard
4. **Deploy**: Vercel will automatically build and deploy your app

### Environment Variables for Production

Make sure to set these in your production environment:

```env
NODE_ENV="production"
DATABASE_URL="your_production_database_url"
JWT_SECRET="your_production_jwt_secret"
OPENAI_API_KEY="your_openai_api_key"
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
PDF_EXTRACTOR_URL="pdf-extractor-endpoint"
```

---

## 📖 Usage Guide

### 1. Create an Account
- Visit the application and sign up with your email
- Or use the demo account provided above

### 2. Upload a PDF
- Click "New Chat" in the sidebar
- Select a PDF file (max 10MB)
- Wait for processing to complete

### 3. Start Learning
- Ask questions about your document
- Use natural language: "What is photosynthesis?" or "Explain the diagram on page 5"
- Click "Show annotations" to see highlighted content
- Use "Follow to the page" to navigate to relevant sections

### 4. Advanced Features
- Use the microphone icon for voice input
- Browse your chat history in the sidebar

---

## 🧪 Development

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# View data
npx prisma studio

# Generate new migration
npx prisma migrate dev --name your_migration_name
```

### Debugging PDF Processing
Enable detailed logging in the PDF extractor service by checking the console logs when uploading documents.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Learning! 📚✨**
