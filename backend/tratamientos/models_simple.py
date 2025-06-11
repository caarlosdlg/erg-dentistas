from django.db import models
from django.utils.text import slugify
import uuid

class CategoriaTratamiento(models.Model):
    """
    Modelo de categorías jerárquicas para tratamientos usando parent/child relationship.
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
    
    # Relación jerárquica simple
    parent = models.ForeignKey(
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
    
    class Meta:
        verbose_name = "Categoría de Tratamiento"
        verbose_name_plural = "Categorías de Tratamientos"
        ordering = ['orden', 'nombre']
        indexes = [
            models.Index(fields=['activo'], name='tratamiento_activo_simple_idx'),
            models.Index(fields=['parent'], name='tratamiento_parent_simple_idx'),
            models.Index(fields=['slug'], name='tratamiento_slug_simple_idx'),
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
        level = self.get_level()
        return f"{'-- ' * level}{self.nombre}"
    
    def get_level(self):
        """Calcular el nivel en la jerarquía"""
        level = 0
        current = self.parent
        while current:
            level += 1
            current = current.parent
            if level > 10:  # Prevenir loops infinitos
                break
        return level
    
    def get_full_path(self):
        """Obtener la ruta completa de la categoría"""
        path = []
        current = self
        while current:
            path.insert(0, current.nombre)
            current = current.parent
            if len(path) > 10:  # Prevenir loops infinitos
                break
        return " > ".join(path)
    
    @property
    def full_path(self):
        """Property para acceder a la ruta completa"""
        return self.get_full_path()
    
    def get_children(self):
        """Obtener hijos directos"""
        return self.children.filter(activo=True)
    
    def get_descendants(self, include_self=False):
        """Obtener todos los descendientes"""
        descendants = []
        if include_self:
            descendants.append(self)
        
        def collect_descendants(categoria):
            for child in categoria.get_children():
                descendants.append(child)
                collect_descendants(child)
        
        collect_descendants(self)
        return descendants
    
    def get_ancestors(self, include_self=False):
        """Obtener todos los ancestros"""
        ancestors = []
        current = self.parent if not include_self else self
        
        if include_self and current == self:
            ancestors.append(self)
            current = self.parent
        
        while current:
            ancestors.insert(0, current)
            current = current.parent
            if len(ancestors) > 10:  # Prevenir loops infinitos
                break
        
        return ancestors
    
    def get_children_count(self):
        """Obtener el número de hijos directos"""
        return self.get_children().count()
    
    def get_descendants_count(self):
        """Obtener el número total de descendientes"""
        return len(self.get_descendants())
    
    def get_treatments_count(self):
        """Obtener el número de tratamientos en esta categoría y subcategorías"""
        from .models import Tratamiento  # Evitar import circular
        descendant_ids = [d.id for d in self.get_descendants(include_self=True)]
        return Tratamiento.objects.filter(categoria__id__in=descendant_ids, activo=True).count()
    
    def is_leaf(self):
        """Verificar si es una categoría hoja (sin hijos)"""
        return not self.get_children().exists()
    
    def get_breadcrumbs(self):
        """Obtener breadcrumbs para navegación"""
        ancestors = self.get_ancestors(include_self=True)
        return [{'id': str(cat.id), 'nombre': cat.nombre, 'slug': cat.slug} for cat in ancestors]


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
        ordering = ['categoria__orden', 'orden_visualizacion', 'nombre']
        indexes = [
            models.Index(fields=['nombre'], name='tratamiento_nombre_simple_idx'),
            models.Index(fields=['codigo'], name='tratamiento_codigo_simple_idx'),
            models.Index(fields=['activo'], name='tratamiento_activo_simple_idx'),
            models.Index(fields=['categoria'], name='tratamiento_categoria_simple_idx'),
            models.Index(fields=['popular'], name='tratamiento_popular_simple_idx'),
            models.Index(fields=['precio_base'], name='tratamiento_precio_simple_idx'),
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
