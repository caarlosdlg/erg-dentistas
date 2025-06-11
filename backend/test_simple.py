import requests
import json

# Test simple
response = requests.get("http://localhost:8000/api/pacientes/")
print(f"Status: {response.status_code}")
print(f"Content: {response.text[:200]}...")
