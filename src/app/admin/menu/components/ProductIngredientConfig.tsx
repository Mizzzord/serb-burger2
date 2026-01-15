'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Settings, Package, ChefHat, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  category: {
    name: string;
  };
  productIngredients: ProductIngredient[];
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
  sortOrder: number;
}

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
}

export default function ProductIngredientConfig() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<ProductIngredient | null>(null);
  const [formData, setFormData] = useState({
    ingredientId: '',
    selectionType: 'multiple' as 'single' | 'multiple',
    isRequired: false,
    maxQuantity: '',
    sortOrder: '0'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Загрузка данных
  const loadData = async () => {
    try {
      const [productsRes, ingredientsRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/ingredients')
      ]);

      const [productsData, ingredientsData] = await Promise.all([
        productsRes.json(),
        ingredientsRes.json()
      ]);

      // Устанавливаем данные (API теперь всегда возвращает массивы)
      setProducts(productsData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Ошибка при загрузке данных');
      setProducts([]);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Добавление ингредиента к продукту
  const handleAddIngredient = async () => {
    if (!selectedProduct || !formData.ingredientId) {
      setError('Выберите ингредиент');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: formData.ingredientId,
          selectionType: formData.selectionType,
          isRequired: formData.isRequired,
          maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : undefined,
          sortOrder: parseInt(formData.sortOrder)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении ингредиента');
      }

      // Обновляем продукт в списке
      setProducts(prev => prev.map(prod =>
        prod.id === selectedProduct.id
          ? { ...prod, productIngredients: [...prod.productIngredients, data] }
          : prod
      ));

      setFormData({
        ingredientId: '',
        selectionType: 'multiple',
        isRequired: false,
        maxQuantity: '',
        sortOrder: '0'
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Обновление настроек ингредиента
  const handleUpdateIngredient = async () => {
    if (!selectedProduct || !editingIngredient) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/ingredients/${editingIngredient.ingredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectionType: formData.selectionType,
          isRequired: formData.isRequired,
          maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : undefined,
          sortOrder: parseInt(formData.sortOrder)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении ингредиента');
      }

      // Обновляем продукт в списке
      setProducts(prev => prev.map(prod =>
        prod.id === selectedProduct.id
          ? {
              ...prod,
              productIngredients: prod.productIngredients.map(pi =>
                pi.id === editingIngredient.id ? data : pi
              )
            }
          : prod
      ));

      setIsEditDialogOpen(false);
      setEditingIngredient(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Удаление ингредиента из продукта
  const handleRemoveIngredient = async (productId: string, ingredientId: string) => {
    if (!confirm('Удалить ингредиент из продукта?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}/ingredients/${ingredientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении ингредиента');
      }

      // Обновляем продукт в списке
      setProducts(prev => prev.map(prod =>
        prod.id === productId
          ? {
              ...prod,
              productIngredients: prod.productIngredients.filter(pi => pi.ingredient.id !== ingredientId)
            }
          : prod
      ));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (product: Product, ingredient: ProductIngredient) => {
    setSelectedProduct(product);
    setEditingIngredient(ingredient);
    setFormData({
      ingredientId: ingredient.ingredient.id,
      selectionType: ingredient.selectionType,
      isRequired: ingredient.isRequired,
      maxQuantity: ingredient.maxQuantity?.toString() || '',
      sortOrder: ingredient.sortOrder.toString()
    });
    setIsEditDialogOpen(true);
  };

  // Получение доступных ингредиентов (исключая уже добавленные)
  const getAvailableIngredients = (product: Product) => {
    const usedIngredientIds = product.productIngredients.map(pi => pi.ingredient.id);
    return ingredients.filter(ing => !usedIngredientIds.includes(ing.id));
  };

  if (loading) {
    return <div className="flex justify-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Настройка ингредиентов продуктов</h3>
        <p className="text-sm text-gray-600">Настройте кастомизацию для каждого продукта</p>
      </div>

      {/* Список продуктов */}
      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600">{product.category.name} • {product.price} ₽</p>
                </div>
                <Dialog open={isAddDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                  setIsAddDialogOpen(open);
                  if (open) setSelectedProduct(product);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Добавить ингредиент
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить ингредиент к {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div>
                        <Label htmlFor="ingredient">Ингредиент *</Label>
                        <Select value={formData.ingredientId} onValueChange={(value) => setFormData(prev => ({ ...prev, ingredientId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите ингредиент" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableIngredients(product).map((ingredient) => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.name} (+{ingredient.price} ₽)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="selectionType">Тип выбора *</Label>
                        <Select value={formData.selectionType} onValueChange={(value: 'single' | 'multiple') => setFormData(prev => ({ ...prev, selectionType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Одиночный выбор</SelectItem>
                            <SelectItem value="multiple">Множественный выбор</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isRequired"
                          checked={formData.isRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="isRequired">Обязательный выбор</Label>
                      </div>
                      {formData.selectionType === 'multiple' && (
                        <div>
                          <Label htmlFor="maxQuantity">Максимальное количество</Label>
                          <Input
                            id="maxQuantity"
                            type="number"
                            value={formData.maxQuantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                            placeholder="Не ограничено"
                          />
                          <p className="text-xs text-gray-500 mt-1">Оставьте пустым для неограниченного выбора</p>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="sortOrder">Порядок сортировки</Label>
                        <Input
                          id="sortOrder"
                          type="number"
                          value={formData.sortOrder}
                          onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAddIngredient}
                          disabled={saving}
                          className="flex-1"
                        >
                          {saving ? 'Добавление...' : 'Добавить'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {product.productIngredients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет настроенных ингредиентов</p>
                  <p className="text-sm">Добавьте ингредиенты для кастомизации продукта</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Ингредиенты ({product.productIngredients.length})
                  </h4>

                  <div className="grid gap-3">
                    {product.productIngredients
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((pi) => (
                      <div
                        key={pi.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{pi.ingredient.name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>+{pi.ingredient.price} ₽</span>
                              <Badge variant={pi.selectionType === 'single' ? 'default' : 'secondary'}>
                                {pi.selectionType === 'single' ? 'Одиночный' : 'Множественный'}
                              </Badge>
                              {pi.isRequired && (
                                <Badge variant="destructive">Обязательный</Badge>
                              )}
                              {pi.maxQuantity && (
                                <span>Макс: {pi.maxQuantity}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product, pi)}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Настроить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveIngredient(product.id, pi.ingredient.id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настроить ингредиент</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="edit-selectionType">Тип выбора *</Label>
              <Select value={formData.selectionType} onValueChange={(value: 'single' | 'multiple') => setFormData(prev => ({ ...prev, selectionType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Одиночный выбор</SelectItem>
                  <SelectItem value="multiple">Множественный выбор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="edit-isRequired">Обязательный выбор</Label>
            </div>
            {formData.selectionType === 'multiple' && (
              <div>
                <Label htmlFor="edit-maxQuantity">Максимальное количество</Label>
                <Input
                  id="edit-maxQuantity"
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                  placeholder="Не ограничено"
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-sortOrder">Порядок сортировки</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUpdateIngredient}
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