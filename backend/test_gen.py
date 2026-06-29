import json
from generator import generate_panels

story_data = {
    "title": "Test Story",
    "genre": "Drama",
    "core_premise": "A drama about a family.",
    "setting": "A house.",
    "characters": [
        {"id": "wife", "name": "Wife", "personality": "emotional", "visual_description": "middle aged", "voice_type": "soft"}
    ]
}

panels = generate_panels(story_data)
print(f"Panels generated: {len(panels)}")
if not panels:
    print("Failed to generate panels!")
