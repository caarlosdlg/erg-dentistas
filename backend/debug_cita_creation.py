#!/usr/bin/env python3
"""
Script para debugging de la creación de citas
Helps identify what's causing the 400 error
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
API_BASE = "http://localhost:8000/api"

def test_cita_creation():
    """Test the appointment creation process step by step"""
    
    print("🔍 Testing appointment creation...")
    
    # Step 1: Get patients
    print("\n1. Getting patients...")
    try:
        response = requests.get(f"{API_BASE}/pacientes/")
        response.raise_for_status()
        patients = response.json()
        print(f"✅ Found {len(patients.get('results', patients))} patients")
        
        # Get first patient
        patient_list = patients.get('results', patients)
        if not patient_list:
            print("❌ No patients found!")
            return
        
        first_patient = patient_list[0]
        print(f"📋 Using patient: {first_patient.get('nombre_completo', first_patient.get('id'))}")
        print(f"   ID: {first_patient['id']}")
        print(f"   Active: {first_patient.get('activo', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error getting patients: {e}")
        return
    
    # Step 2: Get dentists
    print("\n2. Getting dentists...")
    try:
        response = requests.get(f"{API_BASE}/dentistas/")
        response.raise_for_status()
        dentists = response.json()
        print(f"✅ Found {len(dentists.get('results', dentists))} dentists")
        
        # Get first dentist
        dentist_list = dentists.get('results', dentists)
        if not dentist_list:
            print("❌ No dentists found!")
            return
        
        first_dentist = dentist_list[0]
        print(f"🩺 Using dentist: {first_dentist.get('nombre_completo', first_dentist.get('id'))}")
        print(f"   ID: {first_dentist['id']}")
        print(f"   Active: {first_dentist.get('activo', 'N/A')}")
        print(f"   Work days: {first_dentist.get('dias_laborales', 'N/A')}")
        print(f"   Work hours: {first_dentist.get('horario_inicio', 'N/A')} - {first_dentist.get('horario_fin', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error getting dentists: {e}")
        return
    
    # Step 3: Get treatments
    print("\n3. Getting treatments...")
    try:
        response = requests.get(f"{API_BASE}/tratamientos/")
        response.raise_for_status()
        treatments = response.json()
        print(f"✅ Found {len(treatments.get('results', treatments))} treatments")
        
        # Get first treatment
        treatment_list = treatments.get('results', treatments)
        if treatment_list:
            first_treatment = treatment_list[0]
            print(f"🦷 Using treatment: {first_treatment.get('nombre', first_treatment.get('id'))}")
            print(f"   ID: {first_treatment['id']}")
        else:
            first_treatment = None
            print("⚠️ No treatments found, will use None")
        
    except Exception as e:
        print(f"❌ Error getting treatments: {e}")
        first_treatment = None
    
    # Step 4: Create appointment data
    print("\n4. Creating appointment data...")
    
    # Calculate a date in the future (tomorrow at 10:00)
    tomorrow = datetime.now() + timedelta(days=1)
    appointment_date = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    
    appointment_data = {
        "paciente": first_patient['id'],
        "dentista": first_dentist['id'],
        "tratamiento": first_treatment['id'] if first_treatment else None,
        "fecha_hora": appointment_date.isoformat(),
        "motivo_consulta": "Consulta general - Test",
        "observaciones_previas": "",
        "tipo_cita": "consulta",
        "duracion_estimada": 60,
        "requiere_confirmacion": True
    }
    
    print("📝 Appointment data:")
    print(json.dumps(appointment_data, indent=2, default=str))
    
    # Step 5: Send appointment creation request
    print("\n5. Sending appointment creation request...")
    try:
        response = requests.post(
            f"{API_BASE}/citas/",
            json=appointment_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📡 Response status: {response.status_code}")
        print(f"📡 Response headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Appointment created successfully!")
            result = response.json()
            print("📋 Created appointment:")
            print(json.dumps(result, indent=2, default=str))
        else:
            print(f"❌ Error creating appointment: {response.status_code}")
            try:
                error_data = response.json()
                print("📋 Error details:")
                print(json.dumps(error_data, indent=2, default=str))
            except:
                print(f"📋 Raw error response: {response.text}")
        
    except Exception as e:
        print(f"❌ Exception during request: {e}")

if __name__ == "__main__":
    test_cita_creation()
