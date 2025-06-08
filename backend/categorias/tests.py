from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category, CategoryAttribute


class CategoryModelTest(TestCase):
    """Tests para el modelo Category"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_create_category(self):
        """Test de creación de categoría"""
        category = Category.objects.create(
            name="Test Category",
            description="Test description",
            created_by=self.user
        )
        self.assertEqual(category.name, "Test Category")
        self.assertEqual(category.slug, "test-category")
        self.assertEqual(category.level, 0)
        self.assertTrue(category.is_active)
    
    def test_category_hierarchy(self):
        """Test de jerarquía de categorías"""
        parent = Category.objects.create(
            name="Parent Category",
            created_by=self.user
        )
        child = Category.objects.create(
            name="Child Category",
            parent=parent,
            created_by=self.user
        )
        
        self.assertEqual(child.parent, parent)
        self.assertEqual(child.level, 1)
        self.assertEqual(parent.get_children_count(), 1)
        self.assertTrue(child in parent.get_children())
        self.assertEqual(child.get_full_path(), "Parent Category > Child Category")
    
    def test_category_methods(self):
        """Test de métodos del modelo Category"""
        parent = Category.objects.create(name="Parent", created_by=self.user)
        child1 = Category.objects.create(name="Child 1", parent=parent, created_by=self.user)
        child2 = Category.objects.create(name="Child 2", parent=parent, created_by=self.user)
        grandchild = Category.objects.create(name="Grandchild", parent=child1, created_by=self.user)
        
        # Test children count
        self.assertEqual(parent.get_children_count(), 2)
        self.assertEqual(child1.get_children_count(), 1)
        
        # Test descendants count
        self.assertEqual(parent.get_descendants_count(), 3)
        self.assertEqual(child1.get_descendants_count(), 1)
        
        # Test is_leaf
        self.assertFalse(parent.is_leaf())
        self.assertFalse(child1.is_leaf())
        self.assertTrue(child2.is_leaf())
        self.assertTrue(grandchild.is_leaf())
    
    def test_category_attributes(self):
        """Test de atributos de categoría"""
        category = Category.objects.create(name="Test Category", created_by=self.user)
        
        attr1 = CategoryAttribute.objects.create(
            category=category,
            name="color",
            value="azul",
            attribute_type="text"
        )
        
        attr2 = CategoryAttribute.objects.create(
            category=category,
            name="precio_base",
            value="100.00",
            attribute_type="number"
        )
        
        self.assertEqual(category.attributes.count(), 2)
        self.assertEqual(attr1.value, "azul")
        self.assertEqual(attr2.value, "100.00")


class CategoryAPITest(APITestCase):
    """Tests para la API de categorías"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        # Crear estructura de categorías de prueba
        self.root1 = Category.objects.create(
            name="Servicios",
            description="Servicios dentales",
            created_by=self.user
        )
        
        self.child1 = Category.objects.create(
            name="Preventivos",
            parent=self.root1,
            created_by=self.user
        )
        
        self.grandchild1 = Category.objects.create(
            name="Limpiezas",
            parent=self.child1,
            created_by=self.user
        )
    
    def test_public_tree_endpoint(self):
        """Test del endpoint público del árbol"""
        url = '/api/categories/public/tree/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['count'], 1)  # Solo una categoría raíz
        self.assertEqual(len(data['results']), 1)
        
        root_category = data['results'][0]
        self.assertEqual(root_category['name'], 'Servicios')
        self.assertEqual(root_category['level'], 0)
        self.assertEqual(len(root_category['children']), 1)
        
        child_category = root_category['children'][0]
        self.assertEqual(child_category['name'], 'Preventivos')
        self.assertEqual(child_category['level'], 1)
        self.assertEqual(len(child_category['children']), 1)
    
    def test_public_stats_endpoint(self):
        """Test del endpoint público de estadísticas"""
        url = '/api/categories/public/stats/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['total_categories'], 3)
        self.assertEqual(data['active_categories'], 3)
        self.assertEqual(data['root_categories'], 1)
        self.assertEqual(data['max_depth'], 2)
    
    def test_authenticated_api_access(self):
        """Test de acceso a API autenticada"""
        # Sin autenticación debe fallar
        url = '/api/categories/'
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        
        # Con autenticación debe funcionar
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
