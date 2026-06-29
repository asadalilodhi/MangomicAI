from openai import OpenAI
import os
import json
from schemas import StoryExtraction
from dotenv import load_dotenv

load_dotenv()

# Initialize the OpenAI client pointing to AIML API
AIML_API_KEY = os.getenv("AIML_API_KEY")

client = OpenAI(
    api_key=AIML_API_KEY,
    base_url="https://api.aimlapi.com/v1",
)

def extract_story_details(chat_history: list, current_state: dict) -> tuple[str, dict, list]:
    """
    Evaluates the conversation history and attempts to extract a complete StoryExtraction JSON.
    If incomplete, it returns a prompt for the user. If complete, it returns the final JSON.
    """
    
    # We use gpt-4o from AIML API for complex structured extraction
    model = 'gpt-4o'

    schema_dict = StoryExtraction.model_json_schema()
    if 'panels' in schema_dict.get('properties', {}):
        del schema_dict['properties']['panels']

    system_instruction = f"""
    You are an expert Visual Novel Director and "Extractor AI".
    Your goal is to parse the user's input into a visual novel premise (characters, setting, genre, etc.).
    You MUST respond with a JSON object that strictly conforms to the following JSON schema:
    
    {json.dumps(schema_dict, indent=2)}
    
    Evaluate the user's input and the current_state. Update the state progressively.
    
    CRITICAL UX RULES:
    1. If `title` or `style_template` are missing from the current state, DO NOT invent them! DO NOT invent character visual descriptions or voice types yet. Instead, politely ask the user to provide a Title and pick a Style (or tell them to set it in the UI and hit Save). Set `is_complete` to false.
    2. ONCE `title` and `style_template` are present, YOU MUST CREATIVELY INVENT AND ASSUME ALL REMAINING MISSING DETAILS YOURSELF! For example, invent their visual descriptions and voice types based strictly on the chosen Style and Title (e.g., if Style is Anime, invent Anime-style features). DO NOT interrogate the user for visual descriptions or voice types!
    
    Your goal is to achieve a complete schema automatically so `is_complete` becomes true, but ONLY AFTER `title` and `style_template` have been explicitly established.
    """

    prompt = f"Current State: {json.dumps(current_state)}\n\nUser Input: {chat_history[-1]['text']}"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2, # Low temperature for determinism
            timeout=15.0
        )
        
        extracted_data = json.loads(response.choices[0].message.content)
        
        if extracted_data.get('is_complete'):
            return "Perfect! I have all the details I need. Generating your visual novel script now...", extracted_data, []
        else:
            missing = extracted_data.get('missing_fields', [])
            msg = "I'm ready to start! Please tell me a bit more about your story premise. "
            if 'title' in missing or 'style_template' in missing:
                msg += "Also, please make sure to provide a Title and pick a Style!"
            return msg, extracted_data, []
            
    except Exception as e:
        print(f"Error extracting story details: {e}")
        return "I encountered an error trying to process that. Could you rephrase?", current_state, []
