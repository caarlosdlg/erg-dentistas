from rest_framework import serializers
from .models import Paciente, ExpedienteMedico, BitacoraCita, ImagenMedica, BitacoraCita, ImagenMedica

class PacienteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    edad = serializers.SerializerMethodField()
    creado_por_nombre = serializers.CharField(source='creado_por.get_full_name', read_only=True)
    dentista_asignado_nombre = serializers.CharField(source='dentista_asignado.get_full_name', read_only=True)
    
    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre', 'apellido_paterno', 'apellido_materno', 'nombre_completo',
            'fecha_nacimiento', 'edad', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'numero_expediente', 'fecha_registro', 'activo',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion', 'creado_por', 'creado_por_nombre',
            'dentista_asignado', 'dentista_asignado_nombre'
        ]
        read_only_fields = ['id', 'numero_expediente', 'fecha_registro', 'creado_por', 'creado_por_nombre']
    
    def get_edad(self, obj):
        from datetime import date
        if obj.fecha_nacimiento:
            today = date.today()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None

class PacienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion', 'numero_expediente', 'fecha_registro'
        ]
        read_only_fields = ['id', 'numero_expediente', 'fecha_registro']
    
    def validate_email(self, value):
        if Paciente.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un paciente con este email.")
        return value

class PacienteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'sexo', 'telefono', 'email', 'direccion',
            'tipo_sangre', 'alergias', 'medicamentos', 'enfermedades_cronicas',
            'contacto_emergencia_nombre', 'contacto_emergencia_telefono', 
            'contacto_emergencia_relacion', 'activo'
        ]
    
    def validate_email(self, value):
        if self.instance and self.instance.email != value:
            if Paciente.objects.filter(email=value).exists():
                raise serializers.ValidationError("Ya existe un paciente con este email.")
        return value

class ExpedienteMedicoSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
    dentista_responsable_nombre = serializers.CharField(source='dentista_responsable.get_full_name', read_only=True)
    cerrado_por_nombre = serializers.CharField(source='cerrado_por.get_full_name', read_only=True)
    
    class Meta:
        model = ExpedienteMedico
        fields = [
            'id', 'numero_expediente_medico', 'fecha_apertura', 'fecha_ultima_actualizacion',
            'antecedentes_familiares', 'antecedentes_personales', 'historial_dental',
            'activo', 'cerrado_fecha', 'cerrado_por', 'cerrado_por_nombre', 'motivo_cierre',
            'observaciones_generales', 'paciente', 'paciente_nombre',
            'dentista_responsable', 'dentista_responsable_nombre'
        ]
        read_only_fields = [
            'id', 'numero_expediente_medico', 'fecha_apertura', 'fecha_ultima_actualizacion',
            'paciente_nombre', 'dentista_responsable_nombre', 'cerrado_por_nombre'
        ]

class ExpedienteMedicoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpedienteMedico
        fields = [
            'paciente', 'antecedentes_familiares', 'antecedentes_personales', 
            'historial_dental', 'observaciones_generales'
        ]

class BitacoraCitaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
    dentista_nombre = serializers.CharField(source='dentista.user.get_full_name', read_only=True)
    duracion_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = BitacoraCita
        fields = [
            'id', 'fecha_hora', 'tipo_cita', 'estado', 'duracion_estimada',
            'motivo_consulta', 'diagnostico', 'tratamiento_realizado',
            'observaciones_dentista', 'plan_tratamiento', 'costo_tratamiento',
            'pagado', 'metodo_pago', 'proxima_cita_fecha', 'proxima_cita_motivo',
            'fecha_creacion', 'fecha_actualizacion', 'paciente', 'paciente_nombre',
            'dentista', 'dentista_nombre', 'expediente_medico', 'duracion_formateada'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_duracion_formateada(self, obj):
        horas = obj.duracion_estimada // 60
        minutos = obj.duracion_estimada % 60
        if horas > 0:
            return f"{horas}h {minutos}min"
        return f"{minutos}min"

class BitacoraCitaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BitacoraCita
        fields = [
            'paciente', 'fecha_hora', 'tipo_cita', 'duracion_estimada',
            'motivo_consulta', 'diagnostico', 'tratamiento_realizado',
            'observaciones_dentista', 'plan_tratamiento', 'costo_tratamiento',
            'proxima_cita_fecha', 'proxima_cita_motivo'
        ]

class BitacoraCitaUpdateSerializer(serializers.ModelSerializer):
    # Make dentista optional for updates - it will be preserved by perform_update
    dentista = serializers.PrimaryKeyRelatedField(required=False, allow_null=True, read_only=True)
    
    class Meta:
        model = BitacoraCita
        fields = [
            'paciente', 'fecha_hora', 'tipo_cita', 'estado', 'duracion_estimada',
            'motivo_consulta', 'diagnostico', 'tratamiento_realizado',
            'observaciones_dentista', 'plan_tratamiento', 'costo_tratamiento',
            'pagado', 'metodo_pago', 'proxima_cita_fecha', 'proxima_cita_motivo',
            'dentista'
        ]


class ImagenMedicaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre_completo', read_only=True)
    dentista_nombre = serializers.CharField(source='dentista_responsable.user.get_full_name', read_only=True)
    bitacora_fecha = serializers.DateTimeField(source='bitacora_cita.fecha_hora', read_only=True)
    tamaño_formateado = serializers.SerializerMethodField()
    nombre_archivo = serializers.SerializerMethodField()
    url_completa = serializers.SerializerMethodField()
    miniatura_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenMedica
        fields = [
            'id', 'titulo', 'descripcion', 'tipo_imagen', 'archivo', 'miniatura',
            'fecha_toma', 'fecha_subida', 'tamaño_archivo', 'tamaño_formateado',
            'resolucion_x', 'resolucion_y', 'formato', 'diente_especifico',
            'cuadrante', 'observaciones_medicas', 'activa', 'confidencial',
            'paciente', 'paciente_nombre', 'dentista_responsable', 'dentista_nombre',
            'bitacora_cita', 'bitacora_fecha', 'nombre_archivo', 'url_completa', 'miniatura_url'
        ]
        read_only_fields = ['fecha_subida', 'tamaño_archivo', 'formato', 'resolucion_x', 'resolucion_y']
    
    def get_tamaño_formateado(self, obj):
        if not obj.tamaño_archivo:
            return "Desconocido"
        
        size = obj.tamaño_archivo
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def get_nombre_archivo(self, obj):
        return obj.nombre_archivo
    
    def get_url_completa(self, obj):
        return obj.url_completa
    
    def get_miniatura_url(self, obj):
        return obj.miniatura_url

class ImagenMedicaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenMedica
        fields = [
            'paciente', 'bitacora_cita', 'archivo', 'tipo_imagen', 'titulo',
            'descripcion', 'fecha_toma', 'diente_especifico', 'cuadrante',
            'observaciones_medicas', 'confidencial'
        ]
