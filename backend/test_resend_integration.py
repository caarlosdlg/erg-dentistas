#!/usr/bin/env python3
"""
Test script for Resend email integration.
Tests the complete flow from appointment confirmation to email sending.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Add the project directory to the Python path
sys.path.append('/Users/gaelcostilla/proyectoFullstack/erg-dentistas/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dental_erp.settings')
django.setup()

from citas.models import Cita
from citas.resend_email_service import ResendEmailService, test_resend_connection
from pacientes.models import Paciente
from dentistas.models import Dentista
from usuarios.models import Usuario


def test_resend_connection_basic():
    """Test basic Resend connection."""
    print("🔧 Testing Resend connection...")
    
    try:
        # Test with a sample email
        test_email = "test@example.com"  # Change this to your email for actual testing
        result = test_resend_connection(test_email)
        
        if result:
            print("✅ Resend connection test passed!")
            return True
        else:
            print("❌ Resend connection test failed!")
            return False
            
    except Exception as e:
        print(f"❌ Resend connection test error: {str(e)}")
        return False


def create_test_appointment():
    """Create a test appointment for email testing."""
    print("\n📅 Creating test appointment...")
    
    try:
        # Create or get test patient
        paciente, created = Paciente.objects.get_or_create(
            email='test.patient@example.com',
            defaults={
                'nombre': 'Juan',
                'apellido_paterno': 'Pérez',
                'apellido_materno': 'García',
                'telefono': '555-1234',
                'fecha_nacimiento': '1990-01-01'
            }
        )
        
        if created:
            print(f"✅ Created test patient: {paciente.nombre} {paciente.apellido_paterno}")
        else:
            print(f"✅ Using existing test patient: {paciente.nombre} {paciente.apellido_paterno}")
        
        # Create or get test dentist
        usuario, created = Usuario.objects.get_or_create(
            username='test_dentist',
            defaults={
                'first_name': 'Dr. María',
                'last_name': 'González',
                'email': 'dentist@example.com'
            }
        )
        
        dentista, created = Dentista.objects.get_or_create(
            user=usuario,
            defaults={
                'especialidad': 'Ortodoncia',
                'numero_cedula': '12345'
            }
        )
        
        if created:
            print(f"✅ Created test dentist: {dentista.user.first_name} {dentista.user.last_name}")
        else:
            print(f"✅ Using existing test dentist: {dentista.user.first_name} {dentista.user.last_name}")
        
        # Create test appointment
        cita = Cita.objects.create(
            paciente=paciente,
            dentista=dentista,
            fecha_hora=timezone.now() + timedelta(days=1),  # Tomorrow
            tipo_cita='consulta',
            motivo_consulta='Revisión general y limpieza dental',
            estado='programada'
        )
        
        print(f"✅ Created test appointment: {cita.numero_cita}")
        return cita
        
    except Exception as e:
        print(f"❌ Error creating test appointment: {str(e)}")
        return None


def test_appointment_confirmation_email(cita):
    """Test sending appointment confirmation email."""
    print(f"\n📧 Testing appointment confirmation email for {cita.numero_cita}...")
    
    try:
        service = ResendEmailService()
        result = service.send_appointment_confirmation_email(cita)
        
        if result:
            print("✅ Appointment confirmation email sent successfully!")
            return True
        else:
            print("❌ Failed to send appointment confirmation email!")
            return False
            
    except Exception as e:
        print(f"❌ Error sending appointment confirmation email: {str(e)}")
        return False


def test_appointment_reminder_email(cita):
    """Test sending appointment reminder email."""
    print(f"\n🔔 Testing appointment reminder email for {cita.numero_cita}...")
    
    try:
        service = ResendEmailService()
        result = service.send_appointment_reminder_email(cita)
        
        if result:
            print("✅ Appointment reminder email sent successfully!")
            return True
        else:
            print("❌ Failed to send appointment reminder email!")
            return False
            
    except Exception as e:
        print(f"❌ Error sending appointment reminder email: {str(e)}")
        return False


def cleanup_test_data():
    """Clean up test data."""
    print("\n🧹 Cleaning up test data...")
    
    try:
        # Delete test appointments
        test_citas = Cita.objects.filter(paciente__email='test.patient@example.com')
        citas_count = test_citas.count()
        test_citas.delete()
        
        # Delete test patient
        test_paciente = Paciente.objects.filter(email='test.patient@example.com')
        pacientes_count = test_paciente.count()
        test_paciente.delete()
        
        # Delete test dentist
        test_usuario = Usuario.objects.filter(username='test_dentist')
        usuarios_count = test_usuario.count()
        test_usuario.delete()
        
        print(f"✅ Cleaned up: {citas_count} appointments, {pacientes_count} patients, {usuarios_count} users")
        
    except Exception as e:
        print(f"❌ Error cleaning up test data: {str(e)}")


def main():
    """Main test function."""
    print("🚀 Starting Resend Integration Test Suite")
    print("=" * 50)
    
    # Test 1: Basic connection
    connection_ok = test_resend_connection_basic()
    
    if not connection_ok:
        print("\n❌ Resend connection failed. Please check your API key configuration.")
        return
    
    # Test 2: Create test appointment
    cita = create_test_appointment()
    
    if not cita:
        print("\n❌ Failed to create test appointment. Cannot continue.")
        return
    
    # Test 3: Appointment confirmation email
    confirmation_ok = test_appointment_confirmation_email(cita)
    
    # Test 4: Appointment reminder email
    reminder_ok = test_appointment_reminder_email(cita)
    
    # Test 5: Cleanup
    cleanup_test_data()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"🔧 Connection Test: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"📧 Confirmation Email: {'✅ PASS' if confirmation_ok else '❌ FAIL'}")
    print(f"🔔 Reminder Email: {'✅ PASS' if reminder_ok else '❌ FAIL'}")
    
    if connection_ok and confirmation_ok and reminder_ok:
        print("\n🎉 ALL TESTS PASSED! Resend integration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the configuration and try again.")


if __name__ == '__main__':
    main()
