from django.db import models
from django.utils.text import slugify
import uuid
from mptt.models import MPTTModel, TreeForeignKey

class CategoriaTratamiento(MPTTModel):
    """
    Modelo de categorías jerárquicas para tratamientos usando MPTT.
    Permite crear estructuras de árbol con niveles ilimitados.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Información básica
    nombre = models.CharField(
        max_length=100, 
        verbose_name="Nombre de la categoría",
        help_text="Nombre descriptivo de la categoría"
    )
    slug = models.SlugField(
        max_length=100, 
        unique=True, 
        blank=True,
        verbose_name="URL amigable",
        help_text="URL amigable generada automáticamente"
    )
    descripcion = models.TextField(
        blank=True, 
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
    
    # Configuración visual
    color = models.CharField(
        max_length=7, 
        default='#007bff', 
        help_text="Color en formato hexadecimal",
        verbose_name="Color"
    )
    icono = models.CharField(
        max_length=50, 
        blank=True,
        help_text="Icono representativo (emoji o clase CSS)",
        verbose_name="Icono"
    )
    imagen = models.ImageField(
        upload_to='categorias_tratamientos/', 
        blank=True, 
        null=True,
        verbose_name="Imagen",
        help_text="Imagen representativa de la categoría"
    )
    
    # Configuración
    activo = models.BooleanField(
        default=True,
        verbose_name="Activa",
        help_text="Indica si la categoría está activa"
    )
    orden = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden",
        help_text="Orden de visualización dentro del mismo nivel"
    )
    
    # SEO y metadata
    meta_titulo = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name="Meta título",
        help_text="Título para SEO"
    )
    meta_descripcion = models.TextField(
        blank=True,
        verbose_name="Meta descripción", 
        help_text="Descripción para SEO"
    )
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class MPTTMeta:
        order_insertion_by = ['orden', 'nombre']
    
    class Meta:
        verbose_name = "Categoría de Tratamiento"
        verbose_name_plural = "Categorías de Tratamientos"
        ordering = ['tree_id', 'lft']
        indexes = [
            models.Index(fields=['activo'], name='tratamiento_activo_db81a4_idx'),
            models.Index(fields=['parent'], name='tratamiento_parent__8f9e32_idx'),
            models.Index(fields=['slug'], name='tratamiento_slug_3d6c06_idx'),
            models.Index(fields=['tree_id', 'lft'], name='tratamiento_tree_id_lft_idx'),
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
            # Asegurar unicidad del slug
            counter = 1
            original_slug = self.slug
            while CategoriaTratamiento.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def __str__(self):
        """Representación en string mostrando la jerarquía"""
        return f"{'-- ' * self.level}{self.nombre}"
    
    def get_full_path(self):
        """Obtener la ruta completa de la categoría"""
        return " > ".join([ancestor.nombre for ancestor in self.get_ancestors(include_self=True)])
    
    @property
    def full_path(self):
        """Property para acceder a la ruta completa"""
        return self.get_full_path()
    
    def get_children_count(self):
        """Obtener el número de hijos directos"""
        return self.get_children().count()
    
    def get_descendants_count(self):
        """Obtener el número total de descendientes"""
        return self.get_descendants().count()
    
    def get_treatments_count(self):
        """Obtener el número de tratamientos en esta categoría y subcategorías"""
        descendant_ids = self.get_descendants(include_self=True).values_list('id', flat=True)
        return Tratamiento.objects.filter(categoria__id__in=descendant_ids, activo=True).count()
    
    def is_leaf(self):
        """Verificar si es una categoría hoja (sin hijos)"""
        return not self.get_children().exists()
    
    def get_breadcrumbs(self):
        """Obtener breadcrumbs para navegación"""
        return [{'id': str(cat.id), 'nombre': cat.nombre, 'slug': cat.slug} 
                for cat in self.get_ancestors(include_self=True)]

class Tratamiento(models.Model):
    """
    Modelo para tratamientos dentales con relación jerárquica a categorías
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Información básica
    nombre = models.CharField(
        max_length=200,
        verbose_name="Nombre del tratamiento",
        help_text="Nombre descriptivo del tratamiento"
    )
    codigo = models.CharField(
        max_length=20, 
        unique=True, 
        blank=True,
        verbose_name="Código",
        help_text="Código único del tratamiento"
    )
    categoria = models.ForeignKey(
        CategoriaTratamiento, 
        on_delete=models.CASCADE, 
        related_name='tratamientos',
        verbose_name="Categoría",
        help_text="Categoría a la que pertenece el tratamiento"
    )
    descripcion = models.TextField(
        verbose_name="Descripción",
        help_text="Descripción detallada del tratamiento"
    )
    
    # Información económica
    precio_base = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name="Precio base",
        help_text="Precio base del tratamiento"
    )
    precio_minimo = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Precio mínimo",
        help_text="Precio mínimo permitido"
    )
    precio_maximo = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Precio máximo",
        help_text="Precio máximo permitido"
    )
    
    # Información técnica
    duracion_estimada = models.PositiveIntegerField(
        help_text="Duración en minutos",
        verbose_name="Duración estimada (min)"
    )
    sesiones_requeridas = models.PositiveIntegerField(
        default=1,
        verbose_name="Sesiones requeridas",
        help_text="Número de sesiones típicas para completar el tratamiento"
    )
    requiere_anestesia = models.BooleanField(
        default=False,
        verbose_name="Requiere anestesia",
        help_text="Indica si el tratamiento requiere anestesia"
    )
    
    # Materiales y medicamentos
    materiales_necesarios = models.TextField(
        blank=True, 
        verbose_name="Materiales necesarios",
        help_text="Lista de materiales necesarios para el tratamiento"
    )
    medicamentos_post = models.TextField(
        blank=True, 
        verbose_name="Medicamentos post-tratamiento",
        help_text="Medicamentos recomendados después del tratamiento"
    )
    
    # Restricciones y advertencias
    contraindicaciones = models.TextField(
        blank=True,
        verbose_name="Contraindicaciones",
        help_text="Condiciones que impiden realizar el tratamiento"
    )
    advertencias = models.TextField(
        blank=True,
        verbose_name="Advertencias",
        help_text="Advertencias importantes sobre el tratamiento"
    )
    preparacion_previa = models.TextField(
        blank=True, 
        verbose_name="Preparación previa",
        help_text="Preparación requerida antes del tratamiento"
    )
    
    # Estado y metadata
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
        help_text="Indica si el tratamiento está disponible"
    )
    popular = models.BooleanField(
        default=False,
        verbose_name="Popular",
        help_text="Marca tratamientos populares para destacar"
    )
    orden_visualizacion = models.PositiveIntegerField(
        default=0,
        verbose_name="Orden de visualización",
        help_text="Orden en que aparece en listados"
    )
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tratamiento"
        verbose_name_plural = "Tratamientos"
        ordering = ['categoria__tree_id', 'categoria__lft', 'orden_visualizacion', 'nombre']
        indexes = [
            models.Index(fields=['nombre'], name='tratamiento_nombre_idx'),
            models.Index(fields=['codigo'], name='tratamiento_codigo_idx'),
            models.Index(fields=['activo'], name='tratamiento_activo_idx'),
            models.Index(fields=['categoria'], name='tratamiento_categoria_idx'),
            models.Index(fields=['popular'], name='tratamiento_popular_idx'),
            models.Index(fields=['precio_base'], name='tratamiento_precio_idx'),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}" if self.codigo else self.nombre
    
    def save(self, *args, **kwargs):
        if not self.codigo:
            # Generar código automático usando la jerarquía de categorías
            categoria_path = self.categoria.get_ancestors(include_self=True)
            categoria_codigo = ''.join([cat.nombre[:2].upper() for cat in categoria_path])
            
            # Limitar a un máximo de 6 caracteres para el prefijo
            if len(categoria_codigo) > 6:
                categoria_codigo = categoria_codigo[:6]
            
            # Obtener último número para esta categoría
            ultimo_tratamiento = Tratamiento.objects.filter(
                categoria=self.categoria
            ).order_by('fecha_creacion').last()
            
            if ultimo_tratamiento and ultimo_tratamiento.codigo:
                try:
                    numero = int(ultimo_tratamiento.codigo.split('-')[-1]) + 1
                except:
                    numero = 1
            else:
                numero = 1
            
            self.codigo = f"{categoria_codigo}-{numero:03d}"
        super().save(*args, **kwargs)
    
    def get_categoria_path(self):
        """Obtener la ruta completa de categorías"""
        return self.categoria.get_full_path()
    
    def get_categoria_breadcrumbs(self):
        """Obtener breadcrumbs de categoría"""
        return self.categoria.get_breadcrumbs()
