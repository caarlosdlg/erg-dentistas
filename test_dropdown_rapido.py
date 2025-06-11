#!/usr/bin/env python3
"""
Script de Prueba Rápida - Diagnóstico del Dropdown
Verifica que el endpoint dropdown esté funcionando correctamente
"""

import requests
import json
import time

def test_dropdown_endpoint():
    """Prueba el endpoint dropdown de pacientes"""
    print("🔍 Probando endpoint /api/pacientes/dropdown/")
    print("=" * 50)
    
    try:
        # Test básico de conectividad
        print("1. Probando conexión básica...")
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print(f"   ✅ Backend responde: {response.status_code}")
        
        # Test del endpoint dropdown
        print("\n2. Probando endpoint dropdown...")
        response = requests.get("http://localhost:8000/api/pacientes/dropdown/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Endpoint funciona: {response.status_code}")
            print(f"   📊 Pacientes encontrados: {data.get('count', 0)}")
            
            if 'results' in data and len(data['results']) > 0:
                print(f"   📋 Primer paciente: {data['results'][0].get('display_text', 'N/A')}")
                
                # Verificar estructura
                sample = data['results'][0]
                required_fields = ['id', 'nombre_completo', 'email', 'display_text']
                missing = [f for f in required_fields if f not in sample]
                
                if not missing:
                    print("   ✅ Estructura de datos correcta")
                else:
                    print(f"   ❌ Campos faltantes: {missing}")
                
                # Mostrar algunos ejemplos
                print("\n📋 Ejemplos de pacientes:")
                for i, paciente in enumerate(data['results'][:3], 1):
                    print(f"   {i}. {paciente['display_text']}")
                
                return True
            else:
                print("   ❌ No se encontraron pacientes")
                return False
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   📄 Respuesta: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error de conexión: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error inesperado: {e}")
        return False

def test_frontend_connection():
    """Prueba que el frontend esté respondiendo"""
    print("\n3. Probando frontend...")
    try:
        response = requests.get("http://localhost:5174/", timeout=5)
        print(f"   ✅ Frontend responde: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Frontend no responde: {e}")
        return False

def main():
    print("🧪 DIAGNÓSTICO RÁPIDO - DROPDOWN PACIENTES")
    print("=" * 60)
    print(f"⏰ Hora: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Ejecutar pruebas
    backend_ok = test_dropdown_endpoint()
    frontend_ok = test_frontend_connection()
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN:")
    print(f"   Backend Dropdown: {'✅ OK' if backend_ok else '❌ FAIL'}")
    print(f"   Frontend: {'✅ OK' if frontend_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 TODO FUNCIONANDO CORRECTAMENTE")
        print("💡 Puedes probar en: http://localhost:5174")
        print("   Ve a '🔬 Debug Dropdown' en la navegación")
    else:
        print("\n⚠️  HAY PROBLEMAS QUE RESOLVER")
        if not backend_ok:
            print("   - Verificar que el backend Django esté corriendo")
            print("   - Verificar que las migraciones estén aplicadas")
        if not frontend_ok:
            print("   - Verificar que el frontend React esté corriendo")
            print("   - Ejecutar: cd frontend && npm run dev")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
