"""
FastAPI backend for AI Portfolio
Provides endpoints for RAG-powered chat and knowledge graph visualization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager

# Import RAG engine
from rag_engine import (
    initialize_rag_engine, 
    get_relevant_docs, 
    get_collection_stats,
    generate_answer_with_sources
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG engine on startup"""
    print("🚀 Starting up backend...")
    initialize_rag_engine()
    yield
    print("👋 Shutting down backend...")


app = FastAPI(
    title="AI Portfolio Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = []


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'project', 'skill', 'experience'


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI Portfolio Backend API", "status": "running"}


# Stats endpoint
@app.get("/stats")
async def get_stats():
    """
    Get statistics about the vector store
    """
    try:
        stats = get_collection_stats()
        return stats
    except Exception as e:
        return {"error": str(e)}


# Chat endpoint - Phase 3: LLM Integration
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for RAG-powered Q&A with LLM generation
    Phase 3: Uses Hugging Face Inference API to generate natural language answers
    Phase 7: Enhanced with timeline query detection
    """
    try:
        from timeline_handler import handle_timeline_query, detect_year_query
        
        # Check if this is a timeline query
        timeline_response = handle_timeline_query(request.message)
        detected_year = detect_year_query(request.message)
        
        if timeline_response:
            # Use the formatted timeline text as context for LLM
            result = await generate_answer_with_sources(request.message, [timeline_response])
            
            # Add metadata about detected year for frontend highlighting
            response = ChatResponse(
                answer=result["answer"],
                sources=result["sources"]
            )
            
            # Add year to response if detected (frontend can use this)
            if detected_year:
                response.answer += f"\n\n[TIMELINE_YEAR:{detected_year}]"
            
            return response
        
        # Standard RAG flow for non-timeline queries
        docs = get_relevant_docs(request.message, top_k=3)
        
        if not docs:
            return ChatResponse(
                answer="I don't have enough information to answer that question. Please try asking about my projects, skills, or experience.",
                sources=[]
            )
        
        # Generate answer using LLM with retrieved context
        result = await generate_answer_with_sources(request.message, docs)
        
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            answer="Sorry, I encountered an error processing your request. The AI model might be loading or unavailable.",
            sources=[]
        )


# Graph endpoint - Phase 5: Dynamic Knowledge Graph
@app.get("/graph", response_model=GraphResponse)
async def get_graph():
    """
    Returns dynamic knowledge graph data from actual portfolio data
    Parses skills.yaml, timeline.json, and project files to build nodes and edges
    """
    try:
        from graph_builder import build_knowledge_graph
        
        nodes_data, edges_data = build_knowledge_graph()
        
        # Convert to Pydantic models
        nodes = [GraphNode(**node) for node in nodes_data]
        edges = [GraphEdge(**edge) for edge in edges_data]
        
        return GraphResponse(nodes=nodes, edges=edges)
        
    except Exception as e:
        print(f"Error building graph: {e}")
        import traceback
        traceback.print_exc()
        
        # Return empty graph on error
        return GraphResponse(nodes=[], edges=[])


# Project detail endpoint - Phase 6: Interactive Case Study Explorer
@app.get("/project/{project_id}")
async def get_project(project_id: str):
    """
    Returns detailed information about a specific project
    Used by the project modal for deep-dive exploration
    """
    try:
        from project_parser import parse_project_markdown
        
        project_data = parse_project_markdown(project_id)
        
        if not project_data:
            return {"error": f"Project '{project_id}' not found"}
        
        return project_data
        
    except Exception as e:
        print(f"Error loading project {project_id}: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


# Scoped chat endpoint - Phase 6: Project-specific queries
@app.post("/chat/project/{project_id}")
async def chat_project_scoped(project_id: str, request: ChatRequest):
    """
    Chat endpoint scoped to a specific project
    Queries only use context from the specified project
    """
    try:
        from project_parser import get_project_content_for_scoped_chat
        
        # Get project content
        project_content = get_project_content_for_scoped_chat(project_id)
        
        if not project_content:
            return ChatResponse(
                answer=f"Project '{project_id}' not found.",
                sources=[]
            )
        
        # Use project content as context (instead of vector search)
        # This ensures the answer is scoped only to this project
        result = await generate_answer_with_sources(
            request.message, 
            [project_content]
        )
        
        return ChatResponse(
            answer=result["answer"],
            sources=[f"Project: {project_id}"]
        )
        
    except Exception as e:
        print(f"Error in scoped chat for project {project_id}: {e}")
        import traceback
        traceback.print_exc()
        return ChatResponse(
            answer="Sorry, I encountered an error processing your request.",
            sources=[]
        )


# Timeline endpoints - Phase 7: Conversational Timeline
@app.get("/timeline")
async def get_timeline():
    """
    Get all timeline entries sorted by year
    """
    try:
        from timeline_handler import get_all_timeline_entries
        
        entries = get_all_timeline_entries()
        return {"timeline": entries}
        
    except Exception as e:
        print(f"Error loading timeline: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "timeline": []}


@app.get("/timeline/{year}")
async def get_timeline_year(year: int):
    """
    Get timeline entry for a specific year
    """
    try:
        from timeline_handler import get_timeline_entry
        
        entry = get_timeline_entry(year)
        
        if not entry:
            return {"error": f"No timeline entry found for {year}"}
        
        return entry
        
    except Exception as e:
        print(f"Error loading timeline for {year}: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
