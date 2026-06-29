import sys
import json
import os
sys.path.append(r'c:\Users\LENOVO\Desktop\coding\test\visual-novel-studio\backend')
from extractor import extract_story_details

history = [{"role": "user", "text": "I want a cyberpunk story about a hacker named Zero."}]
current_state = {}

reply, ext, questions = extract_story_details(history, current_state)
print('Reply:', reply)
print('Extraction:', json.dumps(ext, indent=2))
print('Questions:', questions)
