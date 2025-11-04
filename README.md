# 🧠 AI-Powered Portfolio

An interactive portfolio powered by RAG (Retrieval-Augmented Generation) and knowledge graphs. Ask questions about projects, skills, and experience through natural language.

---

## 📖 Overview

### What is This?

This is an AI-powered portfolio website that allows visitors to interact with your professional information through natural language. Instead of static pages, users can ask questions like "What projects have you built?" or "Tell me about your AI experience" and get intelligent, context-aware responses.

### ✨ Key Features

- **AI Chat Interface**: Natural language Q&A about projects, skills, and experience
- **RAG-Powered Responses**: Retrieves relevant context from portfolio data using vector search
- **Knowledge Graph Visualization**: Interactive graph showing relationships between projects, skills, and experiences
- **Conversational Timeline**: Explore career history through chat
- **Case Study Deep-Dives**: Detailed project explorations with scoped queries
- **Free & Open Source**: Uses Hugging Face models and open-source tools (no API costs)

### 🏗️ Project Structure

```
Portfolio Site/
├── frontend/          # Next.js + Tailwind CSS
├── backend/           # FastAPI + LangChain + ChromaDB
├── data/             # Portfolio data (projects, skills, timeline)
│   ├── projects/
│   ├── skills.yaml
│   └── timeline.json
├── Plan.md           # Development roadmap
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- Zustand (state management)

### Backend
- FastAPI
- LangChain
- ChromaDB (vector store)
- Sentence Transformers
- Hugging Face Inference API

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Hugging Face account (free)

### 1. Clone and Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Add your Hugging Face token to .env
# Get it from: https://huggingface.co/settings/tokens
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.venv\Scripts\activate.bat
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Build vector store (Phase 2)
python build_vector_store.py

# Run backend
uvicorn main:app --reload
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## 🎯 Development Phases

- ✅ **Phase 1**: Project setup and placeholder API endpoints
- 🚧 **Phase 2**: RAG implementation with vector store
- ⏳ **Phase 3**: LLM integration
- ⏳ **Phase 4**: Chat interface
- ⏳ **Phase 5**: Knowledge graph
- ⏳ **Phase 6**: Case study explorer
- ⏳ **Phase 7**: Conversational timeline
- ⏳ **Phase 8**: Testing and deployment

See `Plan.md` for detailed phase descriptions.

## 🧪 Testing API Endpoints

```bash
# Test chat endpointt
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about your projects"}'

# Test graph endpoint
curl http://localhost:8000/graph
```

## 📝 Adding Content

### Add a New Project
Create a markdown file in `data/projects/`:

```markdown
# Project Name

## Overview
Brief description

## Tech Stack
- Technology 1
- Technology 2

## Challenges & Learnings
What you learned
```

### Update Skills
Edit `data/skills.yaml`:

```yaml
skills:
  - category: "Programming Languages"
    items: ["Python", "JavaScript", "TypeScript"]
```

### Update Timeline
Edit `data/timeline.json`:

```json
[
  {
    "year": 2024,
    "title": "Event Name",
    "details": "Description"
  }
]
```

After updating data, rebuild the vector store:
```bash
cd backend
python build_vector_store.py
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Railway)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📄 License

MIT License - Feel free to use this for your own portfolio!

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and adapt for your own use.

## 📧 Contact

Questions? Open an issue or reach out through the portfolio chat interface!
