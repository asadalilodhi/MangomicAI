import requests
import json

story_data = {
    "title": "Test Story",
    "genre": "Drama",
    "style_template": "Manga",
    "core_premise": "A drama about a family.",
    "setting": "A house.",
    "characters": [
        {"id": "wife", "name": "Wife", "personality": "emotional", "visual_description": "middle aged", "voice_type": "soft"},
        {"id": "husband", "name": "Husband", "personality": "calm", "visual_description": "tall", "voice_type": "deep"},
        {"id": "daughter", "name": "Daughter", "personality": "energetic", "visual_description": "young", "voice_type": "high"}
    ],
    "is_complete": True,
    "missing_fields": []
}

res = requests.post("http://localhost:8001/api/generate-script", json=story_data)
print(f"Status: {res.status_code}")
if res.status_code == 200:
    print(res.json())
else:
    print(res.text)
