from rest_framework import serializers
from .models import Category, CategoryAttribute
from mptt.templatetags.mptt_tags import cache_tree_children


class CategoryAttributeSerializer(serializers.ModelSerializer):
    """Serializer para atributos de categorías"""
    
    class Meta:
        model = CategoryAttribute
        fields = [
            'id', 'name', 'value', 'attribute_type', 
            'is_required', 'sort_order'
        ]


class CategoryTreeSerializer(serializers.ModelSerializer):
    """
    Serializer recursivo para mostrar el árbol completo de categorías
    """
    children = serializers.SerializerMethodField()
    attributes = CategoryAttributeSerializer(many=True, read_only=True)
    full_path = serializers.ReadOnlyField()
    children_count = serializers.SerializerMethodField()
    descendants_count = serializers.SerializerMethodField()
    is_leaf = serializers.SerializerMethodField()
    breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent',
            'is_active', 'sort_order', 'meta_title', 'meta_description',
            'image', 'level', 'full_path', 'children', 'children_count',
            'descendants_count', 'is_leaf', 'breadcrumbs', 'attributes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['level', 'full_path', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Obtener hijos directos de la categoría"""
        if hasattr(obj, '_cached_children'):
            children = obj._cached_children
        else:
            children = obj.get_children().filter(is_active=True)
        
        if children:
            return CategoryTreeSerializer(children, many=True, context=self.context).data
        return []
    
    def get_children_count(self, obj):
        return obj.get_children_count()
    
    def get_descendants_count(self, obj):
        return obj.get_descendants_count()
    
    def get_is_leaf(self, obj):
        return obj.is_leaf()
    
    def get_breadcrumbs(self, obj):
        return obj.get_breadcrumbs()


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Serializer para listar categorías sin estructura jerárquica
    """
    parent_name = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent', 'parent_name',
            'is_active', 'sort_order', 'level', 'full_path', 'children_count',
            'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['level', 'full_path', 'created_at', 'updated_at']
    
    def get_parent_name(self, obj):
        return obj.parent.name if obj.parent else None
    
    def get_children_count(self, obj):
        return obj.get_children_count()


class CategoryDetailSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para una categoría específica
    """
    children = CategoryListSerializer(many=True, read_only=True)
    ancestors = serializers.SerializerMethodField()
    siblings = serializers.SerializerMethodField()
    attributes = CategoryAttributeSerializer(many=True, read_only=True)
    full_path = serializers.ReadOnlyField()
    children_count = serializers.SerializerMethodField()
    descendants_count = serializers.SerializerMethodField()
    is_leaf = serializers.SerializerMethodField()
    breadcrumbs = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent',
            'is_active', 'sort_order', 'meta_title', 'meta_description',
            'image', 'level', 'full_path', 'children', 'ancestors', 'siblings',
            'children_count', 'descendants_count', 'is_leaf', 'breadcrumbs',
            'attributes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['level', 'full_path', 'created_at', 'updated_at']
    
    def get_ancestors(self, obj):
        """Obtener ancestros de la categoría"""
        ancestors = obj.get_ancestors()
        return CategoryListSerializer(ancestors, many=True, context=self.context).data
    
    def get_siblings(self, obj):
        """Obtener hermanos de la categoría"""
        siblings = obj.get_siblings(include_self=False).filter(is_active=True)
        return CategoryListSerializer(siblings, many=True, context=self.context).data
    
    def get_children_count(self, obj):
        return obj.get_children_count()
    
    def get_descendants_count(self, obj):
        return obj.get_descendants_count()
    
    def get_is_leaf(self, obj):
        return obj.is_leaf()
    
    def get_breadcrumbs(self, obj):
        return obj.get_breadcrumbs()


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar categorías
    """
    attributes = CategoryAttributeSerializer(many=True, required=False)
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'parent',
            'is_active', 'sort_order', 'meta_title', 'meta_description',
            'image', 'attributes'
        ]
        read_only_fields = ['id']
    
    def validate_parent(self, value):
        """Validar que no se cree una referencia circular"""
        if value and self.instance:
            if value == self.instance:
                raise serializers.ValidationError(
                    "Una categoría no puede ser padre de sí misma."
                )
            if value in self.instance.get_descendants():
                raise serializers.ValidationError(
                    "No se puede asignar como padre una categoría descendiente."
                )
        return value
    
    def validate_name(self, value):
        """Validar nombre único por nivel"""
        parent = self.initial_data.get('parent')
        queryset = Category.objects.filter(name=value, parent=parent)
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe una categoría con este nombre en el mismo nivel."
            )
        return value
    
    def create(self, validated_data):
        """Crear categoría con atributos"""
        attributes_data = validated_data.pop('attributes', [])
        
        # Asignar usuario actual si está disponible
        if 'request' in self.context:
            validated_data['created_by'] = self.context['request'].user
        
        category = Category.objects.create(**validated_data)
        
        # Crear atributos
        for attr_data in attributes_data:
            CategoryAttribute.objects.create(category=category, **attr_data)
        
        return category
    
    def update(self, instance, validated_data):
        """Actualizar categoría con atributos"""
        attributes_data = validated_data.pop('attributes', [])
        
        # Actualizar campos de la categoría
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar atributos (eliminar existentes y crear nuevos)
        if attributes_data:
            instance.attributes.all().delete()
            for attr_data in attributes_data:
                CategoryAttribute.objects.create(category=instance, **attr_data)
        
        return instance


class CategoryBreadcrumbSerializer(serializers.ModelSerializer):
    """
    Serializer simple para breadcrumbs
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'level']


class CategoryStatsSerializer(serializers.Serializer):
    """
    Serializer para estadísticas de categorías
    """
    total_categories = serializers.IntegerField()
    root_categories = serializers.IntegerField()
    max_depth = serializers.IntegerField()
    active_categories = serializers.IntegerField()
    inactive_categories = serializers.IntegerField()
    categories_with_children = serializers.IntegerField()
    leaf_categories = serializers.IntegerField()
