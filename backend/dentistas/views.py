from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Dentista
from .serializers import DentistaSerializer

class DentistaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing dentists
    """
    queryset = Dentista.objects.all()
    serializer_class = DentistaSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for development
