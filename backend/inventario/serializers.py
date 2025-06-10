from rest_framework import serializers
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import (
    CategoriaInventario, 
    Proveedor, 
    ArticuloInventario, 
    MovimientoInventario, 
    AlertaInventario
)

class CategoriaInventarioSerializer(serializers.ModelSerializer):
    total_articulos = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoriaInventario
        fields = ['id', 'nombre', 'descripcion', 'activo', 'fecha_creacion', 'total_articulos']
    
    def get_total_articulos(self, obj):
        return obj.articulos.filter(activo=True).count()

class ProveedorSerializer(serializers.ModelSerializer):
    total_articulos = serializers.SerializerMethodField()
    
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre', 'contacto', 'telefono', 'email', 'direccion', 'activo', 'fecha_registro', 'total_articulos']
    
    def get_total_articulos(self, obj):
        return obj.articuloinventario_set.filter(activo=True).count()

class ArticuloInventarioSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    valor_total = serializers.ReadOnlyField()
    estado_stock = serializers.ReadOnlyField()
    necesita_reorden = serializers.ReadOnlyField()
    esta_por_vencer = serializers.ReadOnlyField()
    
    class Meta:
        model = ArticuloInventario
        fields = [
            'id', 'codigo', 'nombre', 'descripcion', 'categoria', 'categoria_nombre',
            'proveedor', 'proveedor_nombre', 'unidad_medida', 'precio_compra', 'precio_venta',
            'stock_actual', 'stock_minimo', 'stock_maximo', 'ubicacion',
            'fecha_vencimiento', 'lote', 'activo', 'fecha_creacion', 'fecha_actualizacion',
            'valor_total', 'estado_stock', 'necesita_reorden', 'esta_por_vencer'
        ]
    
    def validate_codigo(self, value):
        # Validar código único
        if self.instance:
            if ArticuloInventario.objects.exclude(pk=self.instance.pk).filter(codigo=value).exists():
                raise serializers.ValidationError("Este código ya está en uso.")
        else:
            if ArticuloInventario.objects.filter(codigo=value).exists():
                raise serializers.ValidationError("Este código ya está en uso.")
        return value
    
    def validate(self, data):
        # Validar que el stock mínimo sea menor que el máximo
        stock_minimo = data.get('stock_minimo', getattr(self.instance, 'stock_minimo', 0))
        stock_maximo = data.get('stock_maximo', getattr(self.instance, 'stock_maximo', 0))
        
        if stock_minimo >= stock_maximo:
            raise serializers.ValidationError("El stock mínimo debe ser menor que el stock máximo.")
        
        # Validar que el precio de compra sea menor que el de venta
        precio_compra = data.get('precio_compra', getattr(self.instance, 'precio_compra', 0))
        precio_venta = data.get('precio_venta', getattr(self.instance, 'precio_venta', 0))
        
        if precio_compra >= precio_venta:
            raise serializers.ValidationError("El precio de compra debe ser menor que el precio de venta.")
        
        return data

class ArticuloInventarioCreateSerializer(ArticuloInventarioSerializer):
    """Serializer para crear artículos con validaciones específicas"""
    
    def create(self, validated_data):
        # Generar código automático si no se proporciona
        if not validated_data.get('codigo'):
            categoria = validated_data['categoria']
            categoria_codigo = categoria.nombre[:3].upper()
            ultimo_numero = ArticuloInventario.objects.filter(
                categoria=categoria
            ).count() + 1
            validated_data['codigo'] = f"{categoria_codigo}-{ultimo_numero:03d}"
        
        return super().create(validated_data)

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    articulo_nombre = serializers.CharField(source='articulo.nombre', read_only=True)
    articulo_codigo = serializers.CharField(source='articulo.codigo', read_only=True)
    registrado_por_nombre = serializers.CharField(source='registrado_por.get_full_name', read_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = [
            'id', 'articulo', 'articulo_nombre', 'articulo_codigo', 'tipo', 'cantidad',
            'cantidad_anterior', 'cantidad_nueva', 'motivo', 'numero_factura',
            'costo_unitario', 'fecha_movimiento', 'registrado_por', 'registrado_por_nombre'
        ]
        read_only_fields = ['cantidad_anterior', 'cantidad_nueva', 'fecha_movimiento']
    
    def validate(self, data):
        articulo = data['articulo']
        tipo = data['tipo']
        cantidad = data['cantidad']
        
        # Validaciones específicas por tipo de movimiento
        if tipo == 'salida' and cantidad > articulo.stock_actual:
            raise serializers.ValidationError(
                f"No hay suficiente stock. Stock actual: {articulo.stock_actual}"
            )
        
        if tipo == 'entrada' and data.get('costo_unitario') is None:
            raise serializers.ValidationError(
                "El costo unitario es requerido para movimientos de entrada."
            )
        
        return data

class AlertaInventarioSerializer(serializers.ModelSerializer):
    articulo_nombre = serializers.CharField(source='articulo.nombre', read_only=True)
    articulo_codigo = serializers.CharField(source='articulo.codigo', read_only=True)
    
    class Meta:
        model = AlertaInventario
        fields = [
            'id', 'articulo', 'articulo_nombre', 'articulo_codigo', 'tipo',
            'mensaje', 'activa', 'fecha_creacion', 'fecha_resolucion'
        ]

class InventarioStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas del inventario"""
    total_articulos = serializers.IntegerField()
    valor_total_inventario = serializers.DecimalField(max_digits=15, decimal_places=2)
    articulos_stock_bajo = serializers.IntegerField()
    articulos_stock_critico = serializers.IntegerField()
    articulos_por_vencer = serializers.IntegerField()
    articulos_vencidos = serializers.IntegerField()
    total_movimientos_mes = serializers.IntegerField()
    valor_entradas_mes = serializers.DecimalField(max_digits=15, decimal_places=2)
    valor_salidas_mes = serializers.DecimalField(max_digits=15, decimal_places=2)
    categorias_mas_usadas = serializers.ListField()
    proveedores_mas_activos = serializers.ListField()

class MovimientoInventarioCreateSerializer(MovimientoInventarioSerializer):
    """Serializer especial para crear movimientos"""
    
    def create(self, validated_data):
        # Agregar el usuario que registra el movimiento
        if 'request' in self.context:
            validated_data['registrado_por'] = self.context['request'].user
        
        return super().create(validated_data)

class ArticuloInventarioListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados"""
    categoria = CategoriaInventarioSerializer(read_only=True)
    proveedor = ProveedorSerializer(read_only=True)
    estado_stock = serializers.ReadOnlyField()
    valor_total = serializers.ReadOnlyField()
    
    class Meta:
        model = ArticuloInventario
        fields = [
            'id', 'codigo', 'nombre', 'categoria', 'proveedor', 'unidad_medida',
            'precio_venta', 'stock_actual', 'stock_minimo', 'stock_maximo',
            'ubicacion', 'fecha_vencimiento', 'lote', 'estado_stock', 'valor_total'
        ]
