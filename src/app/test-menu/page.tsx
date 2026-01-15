'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '../admin/menu/components/CategoryManager';
import ProductManager from '../admin/menu/components/ProductManager';
import IngredientManager from '../admin/menu/components/IngredientManager';
import ProductIngredientConfig from '../admin/menu/components/ProductIngredientConfig';

export default function TestMenuPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Тест системы управления меню</h1>
        <p className="text-gray-600 mt-1">Проверка компонентов без авторизации</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="products">Продукты</TabsTrigger>
          <TabsTrigger value="ingredients">Ингредиенты</TabsTrigger>
          <TabsTrigger value="config">Настройка</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CategoryManager />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ProductManager />
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <IngredientManager />
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ProductIngredientConfig />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}