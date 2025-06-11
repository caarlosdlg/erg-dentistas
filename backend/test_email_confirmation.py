#!/usr/bin/env python3
"""
Script to test the appointment confirmation email functionality.
This script creates test data and confirms an appointment to trigger the email sending.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import json

# Add the Django project root to the Python path
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

# Now we can import Django models
from django.contrib.auth.models import User
from pacientes.models import Paciente
from dentistas.models import Dentista
from citas.models import Cita
from citas.email_service import send_appointment_confirmation_email


def create_test_data():
    """Create test data for appointment confirmation email testing."""
    print("Creating test data...")
    
    # Create or get a test dentist user
    try:
        dentist_user = User.objects.get(username='test_dentist')
        print(f"Using existing dentist user: {dentist_user}")
    except User.DoesNotExist:
        dentist_user = User.objects.create_user(
            username='test_dentist',
            email='dentist@test.com',
            password='testpass123',
            first_name='Juan',
            last_name='Pérez'
        )
        print(f"Created dentist user: {dentist_user}")
    
    # Create or get a test dentist
    try:
        dentist = Dentista.objects.get(usuario=dentist_user)
        print(f"Using existing dentist: {dentist}")
    except Dentista.DoesNotExist:
        dentist = Dentista.objects.create(
            usuario=dentist_user,
            numero_licencia='LIC12345',
            especialidad='General',
            telefono='+1234567890',
            activo=True
        )
        print(f"Created dentist: {dentist}")
    
    # Create or get a test patient
    try:
        patient = Paciente.objects.get(email='patient@test.com')
        print(f"Using existing patient: {patient}")
    except Paciente.DoesNotExist:
        patient = Paciente.objects.create(
            nombre='María',
            apellido_paterno='González',
            apellido_materno='López',
            email='patient@test.com',
            telefono='+1234567891',
            fecha_nacimiento='1990-01-01',
            sexo='F',
            direccion='Calle Test 123, Ciudad Test',
            numero_expediente='EXP001',
            contacto_emergencia_nombre='Pedro González',
            contacto_emergencia_telefono='+1234567892',
            contacto_emergencia_relacion='Padre'
        )
        print(f"Created patient: {patient}")
    
    # Create a test appointment
    appointment_time = timezone.now() + timedelta(days=3, hours=2)
    
    try:
        # Check if there's already a programmed appointment for this patient and dentist
        appointment = Cita.objects.filter(
            paciente=patient,
            dentista=dentist,
            estado='programada'
        ).first()
        
        if not appointment:
            appointment = Cita.objects.create(
                paciente=patient,
                dentista=dentist,
                fecha_hora=appointment_time,
                tipo_cita='consulta',
                estado='programada',
                motivo_consulta='Consulta de rutina para revisión general',
                duracion_estimada=60,
                numero_cita=f'CITA-{timezone.now().strftime("%Y%m%d%H%M%S")}'
            )
            print(f"Created appointment: {appointment}")
        else:
            print(f"Using existing appointment: {appointment}")
    
    except Exception as e:
        print(f"Error creating appointment: {e}")
        return None, None, None
    
    return dentist, patient, appointment


def test_email_confirmation():
    """Test the email confirmation functionality."""
    print("\n" + "="*50)
    print("TESTING EMAIL CONFIRMATION FUNCTIONALITY")
    print("="*50)
    
    # Create test data
    dentist, patient, appointment = create_test_data()
    
    if not all([dentist, patient, appointment]):
        print("Failed to create test data. Exiting.")
        return
    
    print(f"\nAppointment details:")
    print(f"- ID: {appointment.id}")
    print(f"- Number: {appointment.numero_cita}")
    print(f"- Patient: {patient.nombre} {patient.apellido_paterno}")
    print(f"- Patient Email: {patient.email}")
    print(f"- Dentist: Dr. {dentist.usuario.first_name} {dentist.usuario.last_name}")
    print(f"- Date/Time: {appointment.fecha_hora}")
    print(f"- Status: {appointment.estado}")
    print(f"- Consultation Reason: {appointment.motivo_consulta}")
    
    # Test direct email sending
    print(f"\n" + "-"*40)
    print("Testing direct email sending...")
    print("-"*40)
    
    try:
        email_sent = send_appointment_confirmation_email(appointment)
        if email_sent:
            print("✅ Email sent successfully!")
        else:
            print("❌ Email sending failed (but no exception was raised)")
    except Exception as e:
        print(f"❌ Email sending failed with exception: {e}")
    
    # Test appointment confirmation endpoint simulation
    print(f"\n" + "-"*40)
    print("Simulating appointment confirmation...")
    print("-"*40)
    
    if appointment.estado == 'programada':
        try:
            # Manually confirm the appointment (simulating the API endpoint)
            appointment.estado = 'confirmada'
            appointment.save()
            print(f"✅ Appointment status changed to: {appointment.estado}")
            
            # Send confirmation email
            email_sent = send_appointment_confirmation_email(appointment)
            if email_sent:
                print("✅ Confirmation email sent successfully!")
            else:
                print("❌ Confirmation email sending failed")
        except Exception as e:
            print(f"❌ Error during confirmation process: {e}")
    else:
        print(f"⚠️  Appointment is already in status: {appointment.estado}")
    
    print(f"\n" + "="*50)
    print("EMAIL TESTING COMPLETED")
    print("="*50)
    
    # Display instructions for checking emails
    print(f"\nTo check the sent emails:")
    print("1. Check the Django console output for email content")
    print("2. If using real email backend, check the recipient's inbox")
    print("3. Check Django logs for any email sending errors")


if __name__ == '__main__':
    test_email_confirmation()
