import requests

print("Testing Website endpoint...")
res = requests.post("http://127.0.0.1:8000/analyze/website", json={"url": "https://google.com"})
print(res.json())
