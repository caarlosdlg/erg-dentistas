from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.utils.text import slugify
import uuid


class Category(MPTTModel):
    """
    Modelo para categorías jerárquicas usando MPTT (Modified Preorder Tree Traversal).
    Permite crear estructuras de árbol con niveles ilimitados similar a BHphotovideo.com
    """
    
    # Campos principales
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=200, 
        verbose_name="Nombre de la categoría",
        help_text="Nombre descriptivo de la categoría"
    )
    slug = models.SlugField(
        max_length=200, 
        unique=True, 
        blank=True,
        verbose_name="URL amigable",
        help_text="URL amigable generada automáticamente"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Descripción",
        help_text="Descripción detallada de la categoría"
    )
    
    # Relación jerárquica
    parent = TreeForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name="Categoría padre",
        help_text="Categoría padre en la jerarquía"
    )
    
    # Metadatos y configuración
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activa",
        help_text="Indica si la categoría está activa"
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden",
        help_text="Orden de visualización dentro del mismo nivel"
    )
    
    # Campos para SEO y metadata
    meta_title = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name="Meta título",
        help_text="Título para SEO"
    )
    meta_description = models.TextField(
        blank=True,
        verbose_name="Meta descripción", 
        help_text="Descripción para SEO"
    )
    
    # Imagen de la categoría
    image = models.ImageField(
        upload_to='categories/', 
        blank=True, 
        null=True,
        verbose_name="Imagen",
        help_text="Imagen representativa de la categoría"
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de actualización"
    )
    created_by = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='categories_created',
        verbose_name="Creado por"
    )
    
    class MPTTMeta:
        order_insertion_by = ['sort_order', 'name']
        
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['tree_id', 'lft']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['parent']),
            models.Index(fields=['slug']),
            models.Index(fields=['name'], name='category_name_idx'),
            models.Index(fields=['description'], name='category_description_idx'),
            models.Index(fields=['meta_title'], name='category_metatitle_idx'),
        ]
    
    def save(self, *args, **kwargs):
        """Generar slug automáticamente si no existe"""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        """Representación en string mostrando la jerarquía"""
        return f"{'-- ' * self.level}{self.name}"
    
    def get_full_path(self):
        """Obtener la ruta completa de la categoría"""
        return " > ".join([ancestor.name for ancestor in self.get_ancestors(include_self=True)])
    
    @property
    def full_path(self):
        """Property para acceder a la ruta completa de la categoría"""
        return self.get_full_path()
    
    def get_children_count(self):
        """Obtener el número de hijos directos"""
        return self.get_children().count()
    
    def get_descendants_count(self):
        """Obtener el número total de descendientes"""
        return self.get_descendants().count()
    
    def is_leaf(self):
        """Verificar si es una categoría hoja (sin hijos)"""
        return not self.get_children().exists()
    
    def get_breadcrumbs(self):
        """Obtener breadcrumbs para navegación"""
        return [
            {
                'id': str(ancestor.id),
                'name': ancestor.name,
                'slug': ancestor.slug,
                'level': ancestor.level
            }
            for ancestor in self.get_ancestors(include_self=True)
        ]
    
    @property
    def full_path(self):
        """Property para obtener la ruta completa"""
        return self.get_full_path()
    
    @classmethod
    def get_root_categories(cls):
        """Obtener todas las categorías raíz (sin padre)"""
        return cls.objects.filter(parent=None, is_active=True)
    
    @classmethod
    def get_category_tree(cls):
        """Obtener el árbol completo de categorías activas"""
        return cls.objects.filter(is_active=True).order_by('tree_id', 'lft')


class CategoryAttribute(models.Model):
    """
    Modelo para atributos dinámicos de categorías.
    Permite definir propiedades específicas para cada categoría.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='attributes',
        verbose_name="Categoría"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Nombre del atributo"
    )
    value = models.TextField(
        verbose_name="Valor del atributo"
    )
    attribute_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('number', 'Número'),
            ('boolean', 'Booleano'),
            ('date', 'Fecha'),
            ('url', 'URL'),
            ('json', 'JSON'),
        ],
        default='text',
        verbose_name="Tipo de atributo"
    )
    is_required = models.BooleanField(
        default=False,
        verbose_name="Requerido"
    )
    sort_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Atributo de Categoría"
        verbose_name_plural = "Atributos de Categorías"
        ordering = ['sort_order', 'name']
        unique_together = ['category', 'name']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}: {self.value}"
