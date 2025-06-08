from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que permite solo al propietario editar sus objetos.
    Otros usuarios pueden solo leer.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsModeratorOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para moderadores.
    Solo staff puede editar, otros pueden leer.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier usuario autenticado
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # Permisos de escritura solo para staff
        return request.user and request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # Permisos de escritura solo para staff
        return request.user and request.user.is_staff


class IsOwnerOrModerator(permissions.BasePermission):
    """
    Permiso que permite al propietario y a los moderadores
    editar el objeto.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # El propietario puede editar
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        
        # Los moderadores pueden editar
        return request.user and request.user.is_staff


class CanModerateReviews(permissions.BasePermission):
    """
    Permiso específico para moderar reseñas.
    Solo usuarios con permisos de staff.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_staff
