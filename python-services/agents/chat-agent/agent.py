"""
Chat Agent Core Logic
Handles conversational AI interactions for omics data analysis
"""

import asyncio
from typing import Dict, List, Optional, Any
import uuid
from datetime import datetime

from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

from config import settings
from services.context_service import ContextService
from services.pipeline_service import PipelineService
from utils.redis_client import RedisClient

class ChatAgent:
    """
    Main chat agent for handling user conversations about omics data analysis
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name=settings.OPENAI_MODEL,
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.context_service = ContextService()
        self.pipeline_service = PipelineService()
        self.redis_client = RedisClient()
        
        # System prompt for omics data analysis
        self.system_prompt = """
        You are an expert AI assistant specializing in omics data analysis. 
        You help researchers, graduate students, lab technicians, and professors 
        analyze their experimental data through conversational interactions.
        
        Your capabilities include:
        - Explaining omics analysis concepts in simple terms
        - Recommending appropriate analysis pipelines
        - Helping interpret analysis results
        - Suggesting data visualization approaches
        - Troubleshooting common analysis issues
        
        Always be helpful, accurate, and consider the user's expertise level.
        When suggesting analysis pipelines, provide clear step-by-step guidance.
        """
        
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
    
    async def process_message(
        self, 
        message: str, 
        user_id: str, 
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a chat message and return AI response
        """
        
        # Create or retrieve session
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get conversation memory
        memory = await self._get_conversation_memory(session_id)
        
        # Add context if provided
        enhanced_message = message
        if context:
            context_info = await self.context_service.format_context(context)
            enhanced_message = f"Context: {context_info}\n\nUser message: {message}"
        
        # Get chat history
        chat_history = memory.chat_memory.messages
        
        # Generate response
        formatted_prompt = self.prompt_template.format_messages(
            chat_history=chat_history,
            input=enhanced_message
        )
        
        response = await self.llm.agenerate([formatted_prompt])
        ai_response = response.generations[0][0].text
        
        # Update memory
        memory.chat_memory.add_user_message(message)
        memory.chat_memory.add_ai_message(ai_response)
        
        # Save conversation
        await self._save_conversation(session_id, user_id, memory)
        
        # Generate suggestions and actions
        suggestions = await self._generate_suggestions(message, ai_response, context)
        actions = await self._generate_actions(message, ai_response, context)
        
        return {
            "response": ai_response,
            "session_id": session_id,
            "suggestions": suggestions,
            "actions": actions
        }
    
    async def _get_conversation_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        """
        Retrieve or create conversation memory for a session
        """
        memory_key = f"chat_memory:{session_id}"
        
        # Try to load from Redis
        memory_data = await self.redis_client.get(memory_key)
        
        if memory_data:
            # Reconstruct memory from stored data
            memory = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 exchanges
                return_messages=True
            )
            
            for msg in memory_data.get("messages", []):
                if msg["type"] == "human":
                    memory.chat_memory.add_user_message(msg["content"])
                elif msg["type"] == "ai":
                    memory.chat_memory.add_ai_message(msg["content"])
        else:
            # Create new memory
            memory = ConversationBufferWindowMemory(
                k=10,
                return_messages=True
            )
        
        return memory
    
    async def _save_conversation(
        self, 
        session_id: str, 
        user_id: str, 
        memory: ConversationBufferWindowMemory
    ):
        """
        Save conversation to Redis
        """
        memory_key = f"chat_memory:{session_id}"
        session_key = f"user_sessions:{user_id}"
        
        # Convert memory to serializable format
        messages = []
        for msg in memory.chat_memory.messages:
            if isinstance(msg, HumanMessage):
                messages.append({"type": "human", "content": msg.content})
            elif isinstance(msg, AIMessage):
                messages.append({"type": "ai", "content": msg.content})
        
        memory_data = {
            "messages": messages,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Save memory
        await self.redis_client.set(memory_key, memory_data, expire=86400)  # 24 hours
        
        # Update user sessions
        await self.redis_client.sadd(session_key, session_id)
        await self.redis_client.expire(session_key, 86400 * 7)  # 7 days
    
    async def _generate_suggestions(
        self, 
        user_message: str, 
        ai_response: str, 
        context: Optional[Dict[str, Any]]
    ) -> List[str]:
        """
        Generate follow-up suggestions based on the conversation
        """
        suggestions = []
        
        # Analyze message content for suggestions
        if "pipeline" in user_message.lower():
            suggestions.extend([
                "Show me available pipeline templates",
                "How do I customize this pipeline?",
                "What are the expected outputs?"
            ])
        
        if "data" in user_message.lower():
            suggestions.extend([
                "How do I upload my data?",
                "What file formats are supported?",
                "Can you validate my data quality?"
            ])
        
        if "analysis" in user_message.lower():
            suggestions.extend([
                "Explain the analysis results",
                "How do I visualize these results?",
                "What's the next analysis step?"
            ])
        
        return suggestions[:3]  # Return top 3 suggestions
    
    async def _generate_actions(
        self, 
        user_message: str, 
        ai_response: str, 
        context: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate actionable items based on the conversation
        """
        actions = []
        
        # Check if user wants to create a pipeline
        if any(keyword in user_message.lower() for keyword in ["create pipeline", "build pipeline", "new pipeline"]):
            actions.append({
                "type": "create_pipeline",
                "label": "Create New Pipeline",
                "description": "Open the pipeline builder with suggested configuration"
            })
        
        # Check if user wants to upload data
        if any(keyword in user_message.lower() for keyword in ["upload", "import data", "add data"]):
            actions.append({
                "type": "upload_data",
                "label": "Upload Data",
                "description": "Open the data upload interface"
            })
        
        # Check if user wants to run analysis
        if any(keyword in user_message.lower() for keyword in ["run analysis", "execute", "start analysis"]):
            actions.append({
                "type": "run_analysis",
                "label": "Run Analysis",
                "description": "Execute the recommended analysis pipeline"
            })
        
        return actions
    
    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all chat sessions for a user
        """
        session_key = f"user_sessions:{user_id}"
        session_ids = await self.redis_client.smembers(session_key)
        
        sessions = []
        for session_id in session_ids:
            memory_key = f"chat_memory:{session_id}"
            memory_data = await self.redis_client.get(memory_key)
            
            if memory_data:
                sessions.append({
                    "session_id": session_id,
                    "updated_at": memory_data.get("updated_at"),
                    "message_count": len(memory_data.get("messages", []))
                })
        
        return sorted(sessions, key=lambda x: x["updated_at"], reverse=True)