#!/usr/bin/env python3
import os
import sys
import django

# Add the Django project root to the Python path
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

print("Django setup completed successfully!")

# Test imports
try:
    from pacientes.models import Paciente
    from citas.models import Cita
    from citas.email_service import send_appointment_confirmation_email
    print("All imports successful!")
    
    # Get a test appointment
    appointment = Cita.objects.filter(estado='programada').first()
    if appointment:
        print(f"Found test appointment: {appointment.numero_cita}")
        print(f"Patient: {appointment.paciente.nombre} {appointment.paciente.apellido_paterno}")
        print(f"Patient email: {appointment.paciente.email}")
        
        # Test email sending
        print("Testing email sending...")
        try:
            result = send_appointment_confirmation_email(appointment)
            print(f"Email sending result: {result}")
        except Exception as e:
            print(f"Email error: {e}")
    else:
        print("No programmed appointments found")
        
except Exception as e:
    print(f"Import or execution error: {e}")
    import traceback
    traceback.print_exc()
