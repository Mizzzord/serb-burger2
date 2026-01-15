'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Settings, Package } from 'lucide-react';
import { cn } from '@/components/ui/button';

interface Ingredient {
  id: string;
  name: string;
  price: number;
  type: string;
  _count: {
    productIngredients: number;
  };
}

const INGREDIENT_TYPES = [
  { value: 'bun', label: 'Булочки' },
  { value: 'patty', label: 'Котлеты' },
  { value: 'cheese', label: 'Сыры' },
  { value: 'veggie', label: 'Овощи' },
  { value: 'addon', label: 'Добавки' },
  { value: 'sauce', label: 'Соусы' },
];

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Загрузка ингредиентов
  const loadIngredients = async () => {
    try {
      const response = await fetch('/api/admin/ingredients', { cache: 'no-store' });
      const data = await response.json();

      setIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      setError('Ошибка при загрузке ингредиентов');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  // Создание ингредиента
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.price || !formData.type) {
      setError('Заполните все поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании ингредиента');
      }

      setIngredients(prev => [...prev, data]);
      setFormData({ name: '', price: '', type: '' });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Обновление ингредиента
  const handleUpdate = async () => {
    if (!editingIngredient || !formData.name.trim() || !formData.price || !formData.type) {
      setError('Заполните все поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/ingredients/${editingIngredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении ингредиента');
      }

      setIngredients(prev => prev.map(ing => ing.id === editingIngredient.id ? data : ing));
      setFormData({ name: '', price: '', type: '' });
      setIsEditDialogOpen(false);
      setEditingIngredient(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Удаление ингредиента
  const handleDelete = async (ingredient: Ingredient) => {
    if (!confirm(`Удалить ингредиент "${ingredient.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/ingredients/${ingredient.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении ингредиента');
      }

      setIngredients(prev => prev.filter(ing => ing.id !== ingredient.id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      price: ingredient.price.toString(),
      type: ingredient.type
    });
    setIsEditDialogOpen(true);
  };

  // Группировка ингредиентов по типу
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const type = ingredient.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

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
            Ингредиенты
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
              {ingredients.length}
            </span>
          </h3>
          <p className="text-sm text-gray-600">Компоненты для кастомизации блюд</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Используются в</p>
          <p className="text-xs text-gray-500">настройках продуктов</p>
        </div>
      </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить ингредиент
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white z-50">
            <DialogHeader>
              <DialogTitle>Новый ингредиент</DialogTitle>
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
                  placeholder="Булочка бриошь"
                />
              </div>
              <div>
                <Label htmlFor="type">Тип *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип ингредиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {INGREDIENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
                  placeholder="50.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Цена добавляется к стоимости продукта при выборе
                </p>
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

      {/* Список ингредиентов по группам */}
      <div className="space-y-8">
        {INGREDIENT_TYPES.map((typeConfig) => {
          const typeIngredients = groupedIngredients[typeConfig.value] || [];

          if (typeIngredients.length === 0) return null;

          return (
            <div key={typeConfig.value} className="space-y-4">
              <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {typeConfig.label} ({typeIngredients.length})
              </h4>

              <div className="grid gap-3">
                {typeIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border border-green-200">
                          <Settings className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{ingredient.name}</h5>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              +{ingredient.price} ₽
                            </span>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {ingredient._count.productIngredients} {ingredient._count.productIngredients === 1 ? 'продукт' : ingredient._count.productIngredients < 5 ? 'продукта' : 'продуктов'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(ingredient)}
                          className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Изменить</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ingredient)}
                          disabled={ingredient._count.productIngredients > 0}
                          className={cn(
                            "flex items-center gap-2 hover:bg-red-50 hover:border-red-300",
                            ingredient._count.productIngredients > 0 && "opacity-50 cursor-not-allowed hover:bg-gray-50"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Удалить</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {ingredients.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет ингредиентов</h3>
            <p className="text-gray-600 mb-4">Создайте первый ингредиент для кастомизации продуктов</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать ингредиент
            </Button>
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white z-50">
          <DialogHeader>
            <DialogTitle>Редактировать ингредиент</DialogTitle>
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
                placeholder="Булочка бриошь"
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Тип *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип ингредиента" />
                </SelectTrigger>
                <SelectContent>
                  {INGREDIENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                placeholder="50.00"
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