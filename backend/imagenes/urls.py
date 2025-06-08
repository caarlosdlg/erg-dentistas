from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageViewSet, ImageGalleryView, gallery_demo

router = DefaultRouter()
router.register(r'images', ImageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('gallery/', ImageGalleryView.as_view(), name='image_gallery'),
    path('gallery/demo/', gallery_demo, name='gallery_demo'),
]
