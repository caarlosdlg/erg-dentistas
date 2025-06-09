from rest_framework import serializers
from .models import Tratamiento, CategoriaTratamiento

class CategoriaTratamientoSerializer(serializers.ModelSerializer):
    """
    Serializer para categorías de tratamientos
    """
    total_tratamientos = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaTratamiento
        fields = ['id', 'nombre', 'descripcion', 'color', 'activo', 'total_tratamientos']
    
    def get_total_tratamientos(self, obj):
        """Cuenta el total de tratamientos en esta categoría"""
        return obj.tratamientos.filter(activo=True).count()

class TratamientoSerializer(serializers.ModelSerializer):
    """
    Serializer completo para tratamientos
    """
    categoria_nombre = serializers.SerializerMethodField()
    precio_formateado = serializers.SerializerMethodField()
    duracion_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'categoria', 'categoria_nombre',
            'descripcion', 'precio_base', 'precio_formateado', 'precio_minimo',
            'precio_maximo', 'duracion_estimada', 'duracion_formateada',
            'sesiones_requeridas', 'requiere_anestesia', 'materiales_necesarios',
            'medicamentos_post', 'contraindicaciones', 'advertencias',
            'preparacion_previa', 'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = [
            'id', 'fecha_creacion', 'fecha_actualizacion',
            'categoria_nombre', 'precio_formateado', 'duracion_formateada'
        ]
    
    def get_categoria_nombre(self, obj):
        """Retorna el nombre de la categoría"""
        return obj.categoria.nombre if obj.categoria else None
    
    def get_precio_formateado(self, obj):
        """Retorna el precio formateado"""
        return f"${obj.precio_base:,.2f}" if obj.precio_base else None
    
    def get_duracion_formateada(self, obj):
        """Retorna la duración en formato legible"""
        if obj.duracion_estimada:
            horas = obj.duracion_estimada // 60
            minutos = obj.duracion_estimada % 60
            if horas > 0:
                return f"{horas}h {minutos}m" if minutos > 0 else f"{horas}h"
            return f"{minutos}m"
        return None
    
    def validate_codigo(self, value):
        """Validar que el código sea único"""
        if self.instance:
            if Tratamiento.objects.filter(codigo=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Ya existe un tratamiento con este código.")
        else:
            if Tratamiento.objects.filter(codigo=value).exists():
                raise serializers.ValidationError("Ya existe un tratamiento con este código.")
        return value.upper()
    
    def validate(self, data):
        """Validaciones adicionales"""
        # Validar rangos de precios
        precio_base = data.get('precio_base')
        precio_minimo = data.get('precio_minimo')
        precio_maximo = data.get('precio_maximo')
        
        if precio_minimo and precio_base and precio_minimo > precio_base:
            raise serializers.ValidationError("El precio mínimo no puede ser mayor al precio base.")
        
        if precio_maximo and precio_base and precio_maximo < precio_base:
            raise serializers.ValidationError("El precio máximo no puede ser menor al precio base.")
        
        if precio_minimo and precio_maximo and precio_minimo > precio_maximo:
            raise serializers.ValidationError("El precio mínimo no puede ser mayor al precio máximo.")
        
        return data

class TratamientoListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listado de tratamientos
    """
    categoria_nombre = serializers.SerializerMethodField()
    precio_formateado = serializers.SerializerMethodField()
    duracion_formateada = serializers.SerializerMethodField()
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'categoria_nombre',
            'precio_base', 'precio_formateado', 'duracion_estimada',
            'duracion_formateada', 'sesiones_requeridas', 'activo'
        ]
    
    def get_categoria_nombre(self, obj):
        """Retorna el nombre de la categoría"""
        return obj.categoria.nombre if obj.categoria else None
    
    def get_precio_formateado(self, obj):
        """Retorna el precio formateado"""
        return f"${obj.precio_base:,.2f}" if obj.precio_base else None
    
    def get_duracion_formateada(self, obj):
        """Retorna la duración en formato legible"""
        if obj.duracion_estimada:
            horas = obj.duracion_estimada // 60
            minutos = obj.duracion_estimada % 60
            if horas > 0:
                return f"{horas}h {minutos}m" if minutos > 0 else f"{horas}h"
            return f"{minutos}m"
        return None
