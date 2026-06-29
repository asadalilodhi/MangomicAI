import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

AIML_API_KEY = os.getenv("AIML_API_KEY")

client = OpenAI(
    api_key=AIML_API_KEY,
    base_url="https://api.aimlapi.com/v1",
)

def generate_panels(story_data: dict) -> list[dict]:
    """Generates exactly 10 panels based on the extracted story details."""
    system_prompt = """
    You are an expert Visual Novel scriptwriter. 
    You are provided with a fully extracted story premise (title, genre, setting, characters).
    Your task is to write EXACTLY 10 sequential panels that form a complete, engaging short visual novel.
    You MUST output a JSON object containing a "panels" array, where each item strictly matches this schema:
    {
      "panel_number": 1,
      "scene_description": "Rich visual description of the scene: setting, lighting, character positions, mood, and any important visual elements. Used as the image generation prompt.",
      "characters_present": ["character_id_1", "character_id_2"],
      "narration": "Optional narrator caption text shown at the top/bottom of the panel.",
      "dialogue": [
        {
          "character_id": "character_id_1",
          "text": "The exact line of dialogue spoken by the character.",
          "emotion": "angry",  // MUST be one of: neutral, happy, sad, angry, fearful, surprised, disgusted, anxious, excited, cold
          "intensity": 0.9     // float between 0.0 and 1.0
        }
      ]
    }
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(story_data, indent=2)}
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
            timeout=15.0
        )
        
        content = response.choices[0].message.content
        parsed = json.loads(content)
        panels = parsed.get("panels", [])
        return panels
    except Exception as e:
        print(f"Error generating panels: {e}")
        return []
