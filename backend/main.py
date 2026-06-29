from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from schemas import StoryExtraction
load_dotenv()

app = FastAPI(title="Visual Novel Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    current_state: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    extraction: Optional[dict] = None
    questions: Optional[List[str]] = None

@app.get("/")
def read_root():
    return {"status": "Visual Novel Studio API is running"}

from extractor import extract_story_details

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_agent(request: ChatRequest):
    try:
        reply, extraction, questions = extract_story_details(
            chat_history=[{"role": "user", "text": request.message}],
            current_state=request.current_state or {}
        )
        return ChatResponse(
            reply=reply,
            extraction=extraction,
            questions=questions
        )
    except Exception as e:
        return ChatResponse(
            reply=f"Error connecting to Director AI: {str(e)}",
            extraction=request.current_state,
            questions=None
        )

@app.post("/api/generate-script", response_model=StoryExtraction)
def generate_script(extraction: StoryExtraction):
    # Pass the fully verified extraction to the LLM to generate 10 panels
    from generator import generate_panels
    panels = generate_panels(extraction.model_dump())
    
    from schemas import Panel
    
    # Update the extraction object with the new panels as Panel objects
    extraction.panels = [Panel(**p) if isinstance(p, dict) else p for p in panels]
    return extraction
from fastapi.responses import StreamingResponse
import asyncio
import json

@app.post("/api/render-panels")
async def render_panels(script: StoryExtraction):
    from genblaze_client import generate_and_upload_media
    
    async def process_panel(i, panel):
        dialogue_text = " ".join([d.text for d in panel.dialogue]) if panel.dialogue else "..."
        # Pass characters for consistency injection
        image_url, audio_url = await asyncio.to_thread(
            generate_and_upload_media, 
            panel.scene_description, # Note: using scene_description per new schema 
            dialogue_text, 
            script.style_template,
            panel.characters_present,
            script.characters
        )
        
        panel_data = panel.model_dump()
        panel_data['image_url'] = image_url
        panel_data['audio_url'] = audio_url
        return i, panel_data

    async def event_generator():
        # First yield progress for all panels
        for i, panel in enumerate(script.panels):
            yield json.dumps({"type": "progress", "panel_index": i, "status": f"Generating panel {i+1}..."}) + "\n"
        
        # Start all tasks concurrently
        tasks = [asyncio.create_task(process_panel(i, panel)) for i, panel in enumerate(script.panels)]
        
        # As each task finishes, yield it back to the client immediately
        for completed_task in asyncio.as_completed(tasks):
            i, panel_data = await completed_task
            yield json.dumps({"type": "panel_complete", "panel_index": i, "panel": panel_data}) + "\n"
            
        yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
