import requests
import json
import time

url = "http://localhost:8001/api/chat"
payload = {
    "message": "bed side table of this husband the wife and their oldest daughter in the middle after that the husband tells the wife im sorry wont ever cheat on you and takes her to bed room to rest then the wife sees the photo on the bed side table and start crying while holding that picture of her husband and daughter mean while husband goes to answer the phone and says im sorry daughter i will call later your mom is bit sick, the daughter is a calm and confident student who sounds like a sweet adult girl",
    "current_state": {'title': None, 'genre': None, 'style_template': None, 'core_premise': None, 'setting': None, 'characters': [{'id': 'husband', 'name': 'Husband', 'gender': 'male', 'personality': 'remorseful, caring', 'visual_description': '', 'voice_type': '', 'role': None}, {'id': 'wife', 'name': 'Wife', 'gender': 'female', 'personality': 'emotional, forgiving', 'visual_description': '', 'voice_type': '', 'role': None}, {'id': 'oldest_daughter', 'name': 'Oldest Daughter', 'gender': 'female', 'personality': 'calm, confident', 'visual_description': '', 'voice_type': 'sweet, adult-like', 'role': None}], 'objects': [{'id': 'photo_on_bedside_table', 'name': 'Photo on Bedside Table', 'description': "A photo of the husband and daughter, significant as it triggers the wife's emotional response."}], 'is_complete': False, 'missing_fields': ['title', 'genre', 'style_template', 'core_premise', 'setting', 'characters[0].visual_description', 'characters[0].voice_type', 'characters[1].visual_description', 'characters[1].voice_type', 'characters[2].visual_description'], 'director_note': 'Extracted characters and a key object from the scene. Missing visual descriptions and voice types for some characters, as well as core story elements like title, genre, and setting.'}
}

start = time.time()
try:
    res = requests.post(url, json=payload, timeout=30)
    print(f"Status: {res.status_code}")
    print(f"Time: {time.time() - start:.2f}s")
    print(res.json())
except Exception as e:
    print(f"Error: {e}")
    print(f"Time: {time.time() - start:.2f}s")
