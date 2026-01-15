'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Layers, Package } from 'lucide-react';
import { cn } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', { cache: 'no-store' });
      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Ошибка при загрузке категорий');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Создание категории
  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Заполните все поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании категории');
      }

      setCategories(prev => [...prev, data]);
      setFormData({ name: '', slug: '' });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Обновление категории
  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim() || !formData.slug.trim()) {
      setError('Заполните все поля');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении категории');
      }

      setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? data : cat));
      setFormData({ name: '', slug: '' });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Удаление категории
  const handleDelete = async (category: Category) => {
    if (!confirm(`Удалить категорию "${category.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при удалении категории');
      }

      setCategories(prev => prev.filter(cat => cat.id !== category.id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setIsEditDialogOpen(true);
  };

  // Генерация slug из имени
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Обработчик изменения имени
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
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
            Категории
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
              {categories.length}
            </span>
          </h3>
          <p className="text-sm text-gray-600">Организуйте продукты по категориям меню</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Все изменения</p>
          <p className="text-xs text-gray-500">синхронизируются автоматически</p>
        </div>
      </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white z-50">
            <DialogHeader>
              <DialogTitle>Новая категория</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Например: Бургеры"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="burgers"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly идентификатор категории
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

      {/* Список категорий */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center border border-orange-200">
                  <Layers className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{category.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">
                      /{category.slug}
                    </span>
                    <span className="text-xs text-gray-500">
                      {category._count.products} {category._count.products === 1 ? 'продукт' : category._count.products < 5 ? 'продукта' : 'продуктов'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {category._count.products > 0 && (
                  <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    <Package className="w-3 h-3" />
                    {category._count.products} в меню
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                    className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Изменить</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    disabled={category._count.products > 0}
                    className={cn(
                      "flex items-center gap-2 hover:bg-red-50 hover:border-red-300",
                      category._count.products > 0 && "opacity-50 cursor-not-allowed hover:bg-gray-50"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Удалить</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет категорий</h3>
            <p className="text-gray-600 mb-4">Создайте первую категорию для организации меню</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать категорию
            </Button>
          </div>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white z-50">
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="edit-name">Название</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Например: Бургеры"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="burgers"
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