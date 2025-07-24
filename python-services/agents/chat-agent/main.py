"""
AgenticOmics Chat Agent
Main FastAPI application for conversational AI interactions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

from agent import ChatAgent
from config import settings

app = FastAPI(
    title="AgenticOmics Chat Agent",
    description="Conversational AI for omics data analysis assistance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the chat agent
chat_agent = ChatAgent()

class ChatMessage(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    suggestions: Optional[List[str]] = None
    actions: Optional[List[dict]] = None

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chat-agent"}

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Process chat message and return AI response
    """
    try:
        response = await chat_agent.process_message(
            message.message,
            message.user_id,
            message.session_id,
            message.context
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Get chat sessions for a user"""
    try:
        sessions = await chat_agent.get_user_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("DEBUG") == "true" else False
    )