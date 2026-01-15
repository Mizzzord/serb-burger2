'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Package, Layers, ChefHat } from 'lucide-react';
import Link from 'next/link';

// Компоненты для управления меню
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager';
import IngredientManager from './components/IngredientManager';
import ProductIngredientConfig from './components/ProductIngredientConfig';

export default function MenuManagement() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Управление меню</h2>
          <p className="text-gray-600 mt-1">Создавайте и редактируйте категории, продукты и ингредиенты</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Заказы
            </Button>
          </Link>
        </div>
      </div>

      {/* Навигация по разделам меню */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Категории
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Продукты
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ингредиенты
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Настройка
          </TabsTrigger>
        </TabsList>

        {/* Содержимое вкладок */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Категории меню
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Продукты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Ингредиенты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IngredientManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Настройка ингредиентов продуктов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductIngredientConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Краткая информация о структуре меню */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Структура меню</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• <strong>Категории</strong> - группируют продукты (Бургеры, Напитки, Снеки)</p>
                <p>• <strong>Продукты</strong> - товары в меню с ценами и описаниями</p>
                <p>• <strong>Ингредиенты</strong> - компоненты для кастомизации продуктов</p>
                <p>• <strong>Настройки выбора</strong> - для каждого ингредиента можно настроить тип выбора (одиночный/множественный)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}