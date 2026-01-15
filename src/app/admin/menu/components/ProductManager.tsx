'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Package, Settings, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { cn } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductIngredient {
  id: string;
  ingredient: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  maxQuantity?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category: Category;
  productIngredients: ProductIngredient[];
  _count: {
    orderItems: number;
  };
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    categoryId: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Загрузка данных
  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, ingredientsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/ingredients')
      ]);

      const [productsData, categoriesData, ingredientsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ingredientsRes.json()
      ]);

      // Устанавливаем данные (API теперь всегда возвращает массивы)
      setProducts(productsData);
      setCategories(categoriesData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Ошибка при загрузке данных');
      setProducts([]);
      setCategories([]);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Создание продукта
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      setError('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании продукта');
      }

      setProducts(prev => [...prev, data]);
      setFormData({ name: '', description: '', image: '', price: '', categoryId: '' });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Обновление продукта
  const handleUpdate = async () => {
    if (!editingProduct || !formData.name.trim() || !formData.price || !formData.categoryId) {
      setError('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: formData.image || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении продукта');
      }

      setProducts(prev => prev.map(prod => prod.id === editingProduct.id ? data : prod));
      setFormData({ name: '', description: '', image: '', price: '', categoryId: '' });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Удаление продукта
  const handleDelete = async (product: Product) => {
    if (!confirm(`Удалить продукт "${product.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении продукта');
      }

      setProducts(prev => prev.filter(prod => prod.id !== product.id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      price: product.price.toString(),
      categoryId: product.category.id
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Кнопка создания */}
      <div className="flex justify-between items-center">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Продукты
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
              {products.length}
            </span>
          </h3>
          <p className="text-sm text-gray-600">Управляйте товарами в меню ресторана</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Изменения отображаются</p>
          <p className="text-xs text-gray-500">на сайте мгновенно</p>
        </div>
      </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить продукт
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white z-50">
            <DialogHeader>
              <DialogTitle>Новый продукт</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Сербский Классический"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание продукта..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Категория *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="350.00"
                />
              </div>
              <div>
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Создание...' : 'Создать'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Список продуктов */}
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                      {product.price} ₽
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      {product.category.name}
                    </span>
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <ShoppingCart className="w-4 h-4" />
                      {product._count.orderItems} заказов
                    </div>
                    {product.productIngredients.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        {product.productIngredients.length} опций
                      </Badge>
                    )}
                    {product.productIngredients.some(pi => pi.isRequired) && (
                      <Badge variant="destructive" className="text-xs">
                        Обязательные опции
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(product)}
                  className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Изменить</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product)}
                  disabled={product._count.orderItems > 0}
                  className={cn(
                    "flex items-center gap-2 hover:bg-red-50 hover:border-red-300",
                    product._count.orderItems > 0 && "opacity-50 cursor-not-allowed hover:bg-gray-50"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Удалить</span>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет продуктов</h3>
            <p className="text-gray-600 mb-4">Создайте первый продукт в меню</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать продукт
            </Button>
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white z-50">
          <DialogHeader>
            <DialogTitle>Редактировать продукт</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="edit-name">Название *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Сербский Классический"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание продукта..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Категория *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-price">Цена (₽) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="350.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">URL изображения</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}