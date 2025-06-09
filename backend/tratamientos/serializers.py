from rest_framework import serializers
from .models import Tratamiento, CategoriaTratamiento


class CategoriaTratamientoSerializer(serializers.ModelSerializer):
    total_tratamientos = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaTratamiento
        fields = ['id', 'nombre', 'descripcion', 'color', 'activo', 'total_tratamientos']
    
    def get_total_tratamientos(self, obj):
        return obj.tratamientos.filter(activo=True).count()


class TratamientoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    categoria_color = serializers.CharField(source='categoria.color', read_only=True)
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'categoria', 'categoria_nombre', 'categoria_color',
            'descripcion', 'precio_base', 'precio_minimo', 'precio_maximo',
            'duracion_estimada', 'sesiones_requeridas', 'requiere_anestesia',
            'materiales_necesarios', 'medicamentos_post', 'contraindicaciones',
            'advertencias', 'preparacion_previa', 'activo', 'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'codigo', 'fecha_creacion', 'fecha_actualizacion']
    
    def validate(self, data):
        # Validar que el precio mínimo sea menor que el precio base
        precio_base = data.get('precio_base')
        precio_minimo = data.get('precio_minimo')
        precio_maximo = data.get('precio_maximo')
        
        if precio_minimo and precio_base and precio_minimo > precio_base:
            raise serializers.ValidationError("El precio mínimo no puede ser mayor que el precio base.")
        
        if precio_maximo and precio_base and precio_maximo < precio_base:
            raise serializers.ValidationError("El precio máximo no puede ser menor que el precio base.")
        
        return data


class TratamientoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados"""
    categoria = CategoriaTratamientoSerializer(read_only=True)
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'categoria', 'precio_base',
            'duracion_estimada', 'activo'
        ]


class TratamientoCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear tratamientos"""
    
    class Meta:
        model = Tratamiento
        fields = [
            'nombre', 'categoria', 'descripcion', 'precio_base', 'precio_minimo',
            'precio_maximo', 'duracion_estimada', 'sesiones_requeridas',
            'requiere_anestesia', 'materiales_necesarios', 'medicamentos_post',
            'contraindicaciones', 'advertencias', 'preparacion_previa'
        ]
    
    def validate(self, data):
        # Same validations as TratamientoSerializer
        precio_base = data.get('precio_base')
        precio_minimo = data.get('precio_minimo')
        precio_maximo = data.get('precio_maximo')
        
        if precio_minimo and precio_base and precio_minimo > precio_base:
            raise serializers.ValidationError("El precio mínimo no puede ser mayor que el precio base.")
        
        if precio_maximo and precio_base and precio_maximo < precio_base:
            raise serializers.ValidationError("El precio máximo no puede ser menor que el precio base.")
        
        return data
