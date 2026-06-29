import urllib.request
import json

req = urllib.request.Request('http://localhost:8001/api/chat', data=b'{"message":"hello", "current_state":{}}', headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=30) as f:
        print(f.read().decode('utf-8'))
except Exception as e:
    print(e)
