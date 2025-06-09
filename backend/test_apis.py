#!/usr/bin/env python3
"""
Script para probar las APIs del DentalERP
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(endpoint, method='GET', data=None, headers=None):
    """Función helper para probar endpoints"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
        
        print(f"\n🔗 {method} {endpoint}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Success")
            # Solo mostrar los primeros elementos si es una lista
            try:
                json_data = response.json()
                if isinstance(json_data, dict) and 'results' in json_data:
                    print(f"📝 Count: {json_data.get('count', 0)}")
                    if json_data['results']:
                        print(f"📄 Sample data: {json.dumps(json_data['results'][0], indent=2, default=str)[:200]}...")
                elif isinstance(json_data, list) and json_data:
                    print(f"📝 Count: {len(json_data)}")
                    print(f"📄 Sample data: {json.dumps(json_data[0], indent=2, default=str)[:200]}...")
                else:
                    print(f"📄 Data: {json.dumps(json_data, indent=2, default=str)[:200]}...")
            except:
                print(f"📄 Raw response: {response.text[:200]}...")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Server not running on {BASE_URL}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    print("🏥 Testing DentalERP APIs")
    print("=" * 50)
    
    # Test API Root
    test_endpoint("/")
    
    # Test Pacientes endpoints
    print("\n👥 PACIENTES APIs")
    test_endpoint("/pacientes/")
    test_endpoint("/pacientes/estadisticas/")
    
    # Test Dentistas endpoints  
    print("\n👨‍⚕️ DENTISTAS APIs")
    test_endpoint("/dentistas/")
    test_endpoint("/especialidades/")
    test_endpoint("/dentistas/disponibles/")
    
    # Test Citas endpoints
    print("\n📅 CITAS APIs")
    test_endpoint("/citas/")
    test_endpoint("/citas/estadisticas/")
    
    # Test Tratamientos endpoints
    print("\n🦷 TRATAMIENTOS APIs")
    test_endpoint("/tratamientos/")
    test_endpoint("/categorias-tratamiento/")
    test_endpoint("/tratamientos/mas_populares/")
    
    print("\n" + "=" * 50)
    print("✅ API Testing Complete!")

if __name__ == "__main__":
    main()
