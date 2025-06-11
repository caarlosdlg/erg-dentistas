from rest_framework import serializers
from .models import Tratamiento, CategoriaTratamiento


class CategoriaTratamientoTreeSerializer(serializers.ModelSerializer):
    """Serializer para estructura de árbol de categorías"""
    children = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    treatments_count = serializers.SerializerMethodField()
    breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaTratamiento
        fields = [
            'id', 'nombre', 'slug', 'descripcion', 'color', 'icono', 'imagen',
            'activo', 'level', 'full_path', 'treatments_count', 'breadcrumbs',
            'children', 'fecha_creacion'
        ]
    
    def get_children(self, obj):
        if hasattr(obj, 'prefetched_children'):
            children = obj.prefetched_children
        else:
            children = obj.get_children().filter(activo=True)
        
        return CategoriaTratamientoTreeSerializer(children, many=True, context=self.context).data
    
    def get_treatments_count(self, obj):
        return obj.get_treatments_count()
    
    def get_breadcrumbs(self, obj):
        return obj.get_breadcrumbs()


class CategoriaTratamientoSerializer(serializers.ModelSerializer):
    """Serializer básico para categorías"""
    total_tratamientos = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    level = serializers.ReadOnlyField()
    parent_nombre = serializers.CharField(source='parent.nombre', read_only=True)
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaTratamiento
        fields = [
            'id', 'nombre', 'slug', 'descripcion', 'color', 'icono', 'imagen',
            'parent', 'parent_nombre', 'activo', 'orden', 'level', 'full_path',
            'total_tratamientos', 'children_count', 'meta_titulo', 'meta_descripcion',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['level', 'full_path']
    
    def get_total_tratamientos(self, obj):
        return obj.get_treatments_count()
    
    def get_children_count(self, obj):
        return obj.get_children_count()


class CategoriaTratamientoCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar categorías"""
    
    class Meta:
        model = CategoriaTratamiento
        fields = [
            'nombre', 'descripcion', 'color', 'icono', 'imagen', 'parent',
            'activo', 'orden', 'meta_titulo', 'meta_descripcion'
        ]
    
    def validate(self, data):
        # Validar que no se cree una referencia circular
        if 'parent' in data and data['parent']:
            parent = data['parent']
            instance = getattr(self, 'instance', None)
            if instance:
                # Si es una actualización, verificar que no se esté estableciendo como padre a un descendiente
                if parent in instance.get_descendants():
                    raise serializers.ValidationError("Una categoría no puede tener como padre a uno de sus descendientes.")
        return data


class TratamientoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de tratamientos"""
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    categoria_color = serializers.CharField(source='categoria.color', read_only=True)
    categoria_path = serializers.CharField(source='get_categoria_path', read_only=True)
    categoria_breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'descripcion', 'precio_base', 
            'duracion_estimada', 'sesiones_requeridas', 'activo', 'popular',
            'categoria', 'categoria_nombre', 'categoria_color', 'categoria_path',
            'categoria_breadcrumbs', 'fecha_creacion'
        ]
    
    def get_categoria_breadcrumbs(self, obj):
        return obj.get_categoria_breadcrumbs()


class TratamientoDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalles de tratamientos"""
    categoria_info = CategoriaTratamientoSerializer(source='categoria', read_only=True)
    categoria_path = serializers.CharField(source='get_categoria_path', read_only=True)
    categoria_breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = Tratamiento
        fields = [
            'id', 'nombre', 'codigo', 'descripcion', 'categoria', 'categoria_info',
            'categoria_path', 'categoria_breadcrumbs', 'precio_base', 'precio_minimo', 
            'precio_maximo', 'duracion_estimada', 'sesiones_requeridas', 
            'requiere_anestesia', 'materiales_necesarios', 'medicamentos_post',
            'contraindicaciones', 'advertencias', 'preparacion_previa', 
            'activo', 'popular', 'orden_visualizacion', 'fecha_creacion', 
            'fecha_actualizacion'
        ]
    
    def get_categoria_breadcrumbs(self, obj):
        return obj.get_categoria_breadcrumbs()


class TratamientoCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar tratamientos"""
    
    class Meta:
        model = Tratamiento
        fields = [
            'nombre', 'descripcion', 'categoria', 'precio_base', 'precio_minimo',
            'precio_maximo', 'duracion_estimada', 'sesiones_requeridas',
            'requiere_anestesia', 'materiales_necesarios', 'medicamentos_post',
            'contraindicaciones', 'advertencias', 'preparacion_previa',
            'activo', 'popular', 'orden_visualizacion'
        ]
    
    def validate_precio_base(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio base debe ser mayor a cero.")
        return value
    
    def validate_duracion_estimada(self, value):
        if value <= 0:
            raise serializers.ValidationError("La duración debe ser mayor a cero.")
        return value
    
    def validate(self, data):
        # Validar rangos de precios
        precio_base = data.get('precio_base')
        precio_minimo = data.get('precio_minimo')
        precio_maximo = data.get('precio_maximo')
        
        if precio_minimo and precio_base and precio_minimo > precio_base:
            raise serializers.ValidationError("El precio mínimo no puede ser mayor al precio base.")
        
        if precio_maximo and precio_base and precio_maximo < precio_base:
            raise serializers.ValidationError("El precio máximo no puede ser menor al precio base.")
        
        return data


# Mantenemos los serializadores originales para compatibilidad
class TratamientoSerializer(TratamientoDetailSerializer):
    """Alias para compatibilidad con código existente"""
    pass
