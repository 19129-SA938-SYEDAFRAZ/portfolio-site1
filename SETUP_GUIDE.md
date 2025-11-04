# Phase 1 & 2 Setup Guide

This guide will help you set up and run the AI Portfolio project after completing Phase 1 and Phase 2.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git** (optional)

## Step-by-Step Setup

### 1. Backend Setup

#### Create Python Virtual Environment

Open PowerShell in the `backend` directory:

```powershell
cd backend
python -m venv .venv
```

#### Activate Virtual Environment

**Windows PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows CMD:**
```cmd
.venv\Scripts\activate.bat
```

#### Install Dependencies

```powershell
pip install -r requirements.txt
```

This will install:
- FastAPI
- Uvicorn (ASGI server)
- ChromaDB (vector database)
- Sentence Transformers (embeddings)
- LangChain
- Other dependencies

**Note:** First installation may take 5-10 minutes as it downloads ML models.

#### Build the Vector Store

```powershell
python build_vector_store.py
```

This will:
- Load all markdown files from `data/projects/`
- Load `data/skills.yaml`
- Load `data/timeline.json`
- Generate embeddings using sentence-transformers
- Store them in ChromaDB
- Run a test query

Expected output:
```
============================================================
  Portfolio Vector Store Builder
============================================================

📂 Loading documents from data directory...
✓ Loaded: ai_portfolio.md
✓ Loaded: nlp_chatbot.md
✓ Loaded: web_dashboard.md
✓ Loaded: skills.yaml
✓ Loaded: timeline.json

📊 Total documents loaded: 5

🤖 Initializing embedding model...
🔧 Setting up ChromaDB...
✓ Created collection: portfolio_data

✅ Successfully built vector store!

🧪 Testing retrieval...
✅ Retrieval test complete!
```

#### Test the RAG Engine

```powershell
python test_rag.py
```

This verifies that document retrieval is working correctly.

#### Start the Backend Server

```powershell
uvicorn main:app --reload
```

The backend will be available at: `http://localhost:8000`

To test it, visit: `http://localhost:8000/docs` for interactive API documentation.

### 2. Frontend Setup

Open a **new** PowerShell window in the `frontend` directory:

```powershell
cd frontend
```

#### Install Dependencies

```powershell
npm install
```

This will install:
- Next.js
- React
- Tailwind CSS
- Axios
- TypeScript
- Other dependencies

**Note:** First installation may take 2-5 minutes.

#### Start the Development Server

```powershell
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 3. Test the Application

1. Open your browser to `http://localhost:3000`
2. You should see the backend status indicator (green = online)
3. Test the chat endpoint by typing a message like:
   - "Tell me about your AI projects"
   - "What are your skills?"
   - "What did you work on recently?"
4. Click "Fetch Graph Data" to test the graph endpoint

## Troubleshooting

### Backend Issues

**"Cannot find module 'chromadb'"**
- Solution: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**"Collection not found"**
- Solution: Run `python build_vector_store.py` to create the vector store

**"Port 8000 already in use"**
- Solution: Find and kill the process using port 8000, or change the port in `main.py`

### Frontend Issues

**"Cannot find module 'next'"**
- Solution: Run `npm install` in the frontend directory

**"Backend: offline"**
- Solution: Make sure the backend is running at `http://localhost:8000`

**Execution policy error with npm**
- Solution: Run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

## What's Working Now (Phase 1 & 2)

✅ **Project Structure**: Monorepo with frontend, backend, and data
✅ **Backend API**: FastAPI with CORS configured
✅ **Vector Store**: ChromaDB with sentence-transformers embeddings
✅ **RAG Engine**: Document retrieval from portfolio data
✅ **Frontend**: Next.js with Tailwind CSS
✅ **API Connection**: Frontend can communicate with backend
✅ **Endpoints**:
- `GET /` - Health check
- `GET /stats` - Vector store statistics
- `POST /chat` - Chat with RAG retrieval (no LLM yet)
- `GET /graph` - Knowledge graph data (dummy data)

## Next Steps (Phase 3)

Phase 3 will add:
- Hugging Face Inference API integration
- LLM-generated responses (instead of showing raw retrieved docs)
- Better prompt engineering
- Streaming responses (optional)

## Useful Commands

### Backend
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run backend
uvicorn main:app --reload

# Rebuild vector store (after updating data)
python build_vector_store.py

# Test RAG engine
python test_rag.py
```

### Frontend
```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Directory Structure

```
Portfolio Site/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── rag_engine.py        # RAG helper functions
│   ├── build_vector_store.py # Vector store builder
│   ├── test_rag.py          # RAG test script
│   ├── requirements.txt     # Python dependencies
│   ├── chroma_db/           # ChromaDB storage (auto-created)
│   └── .venv/               # Virtual environment (created by you)
├── frontend/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page with test UI
│   │   └── globals.css      # Global styles
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── package.json         # npm dependencies
│   └── node_modules/        # npm packages (auto-created)
├── data/
│   ├── projects/
│   │   ├── ai_portfolio.md
│   │   ├── nlp_chatbot.md
│   │   └── web_dashboard.md
│   ├── skills.yaml
│   └── timeline.json
├── .gitignore
├── .env.example
├── README.md
├── Plan.md
└── SETUP_GUIDE.md          # This file
```

## Need Help?

- Check the interactive API docs: `http://localhost:8000/docs`
- View collection stats: `http://localhost:8000/stats`
- Check console logs for errors in both terminals
- Make sure both backend and frontend are running simultaneously
