import requests
import json
import time

url = "http://localhost:8001/api/chat"
payload = {
    "message": "bed side table of this husband the wife and their oldest daughter in the middle after that the husband tells the wife im sorry wont ever cheat on you and takes her to bed room to rest then the wife sees the photo on the bed side table and start crying while holding that picture of her husband and daughter mean while husband goes to answer the phone and says im sorry daughter i will call later your mom is bit sick, the daughter is a calm and confident student who sounds like a sweet adult girl",
    "current_state": {}
}

start = time.time()
try:
    res = requests.post(url, json=payload, timeout=25)
    print(f"Status: {res.status_code}")
    print(f"Time: {time.time() - start:.2f}s")
    print(res.json())
except Exception as e:
    print(f"Error: {e}")
    print(f"Time: {time.time() - start:.2f}s")
